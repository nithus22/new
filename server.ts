import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import {
  runTranslationPipeline,
  runChatPipeline,
  LLMGeneratorFn,
} from './src/utils/translationPipeline';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  /**
   * Calls Gemini with automatic fallback:
   * Primary: gemini-3.8-flash
   * Fallback: gemini-3.1-flash-lite
   */
  async function callGeminiWithFallback(
    ai: GoogleGenAI,
    prompt: string,
    timeoutMs: number = 18000
  ): Promise<{ text: string; modelUsed: string }> {
    // 1. Primary: gemini-3.8-flash
    let primaryTimer: NodeJS.Timeout | undefined;
    try {
      const timeoutPromise = new Promise<never>((_, reject) => {
        primaryTimer = setTimeout(
          () => reject(new Error('Model timeout (gemini-3.8-flash)')),
          timeoutMs
        );
      });
      const generatePromise = ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.1,
        },
      });
      const result = await Promise.race([generatePromise, timeoutPromise]);
      if (result && result.text) {
        return { text: result.text, modelUsed: 'gemini-3.8-flash' };
      }
    } catch (err: any) {
      console.warn(
        'gemini-3.8-flash error or timeout, attempting gemini-3.1-flash-lite fallback:',
        err?.message || err
      );
    } finally {
      if (primaryTimer) clearTimeout(primaryTimer);
    }

    // 2. Fallback: gemini-3.1-flash-lite
    let secondaryTimer: NodeJS.Timeout | undefined;
    try {
      const timeoutPromise = new Promise<never>((_, reject) => {
        secondaryTimer = setTimeout(
          () => reject(new Error('Fallback model timeout (gemini-3.1-flash-lite)')),
          timeoutMs
        );
      });
      const generatePromise = ai.models.generateContent({
        model: 'gemini-3.1-flash-lite',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.1,
        },
      });
      const result = await Promise.race([generatePromise, timeoutPromise]);
      return { text: result.text || '', modelUsed: 'gemini-3.1-flash-lite' };
    } finally {
      if (secondaryTimer) clearTimeout(secondaryTimer);
    }
  }

  function createServerLLMGenerator(): LLMGeneratorFn | undefined {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return undefined;

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    return async (prompt: string, timeoutMs?: number) => {
      return await callGeminiWithFallback(ai, prompt, timeoutMs);
    };
  }

  // ---------------------------------------------------------------------------
  // 1. Server-side Chotu Chat & Real-World Communication Endpoint (/api/chat)
  // ---------------------------------------------------------------------------
  app.post('/api/chat', async (req, res) => {
    try {
      const {
        message,
        conversationHistory = [],
        inputLang = 'auto',
        replyLang = 'santali',
        targetScript = 'olchiki',
        context = {},
      } = req.body || {};

      if (!message || !String(message).trim()) {
        return res.status(400).json({ error: 'Message is required' });
      }

      const llmGenerator = createServerLLMGenerator();
      const result = await runChatPipeline(
        {
          message: String(message),
          conversationHistory,
          inputLang,
          replyLang,
          targetScript,
          context,
        },
        llmGenerator
      );

      return res.status(200).json(result);
    } catch (err: any) {
      console.warn('Error in /api/chat:', err?.message || err);
      const rawMessage = String(req.body?.message || '');
      const warning =
        'Santali translation could not be verified reliably due to an internal server error.';
      return res.status(200).json({
        reply: `${warning}\nOriginal message: "${rawMessage}"`,
        intent: 'general_assistant',
        extractedUtterance: rawMessage,
        santali: { olchiki: '', roman: '', devanagari: '' },
        hindi: '',
        english: rawMessage,
        pronunciationGuide: '',
        detectedInputLanguage: 'english',
        isVerified: false,
        verificationStatus: 'unavailable',
        confidence: 'unverified',
        modelUsed: 'error-fallback',
        isUrgentOrMedical: false,
        warning,
        notes: err?.message || 'Internal error',
        verifiedVocabulary: [],
      });
    }
  });

  // ---------------------------------------------------------------------------
  // 2. Dedicated Two-Way Translation Endpoint (/api/translate)
  // ---------------------------------------------------------------------------
  app.post('/api/translate', async (req, res) => {
    try {
      const { text, sourceLang = 'auto', targetLang = 'santali', targetScript = 'olchiki' } =
        req.body || {};

      if (!text || !String(text).trim()) {
        return res.status(400).json({ error: 'Text to translate is required' });
      }

      const llmGenerator = createServerLLMGenerator();
      const result = await runTranslationPipeline(
        {
          text: String(text),
          sourceLang,
          targetLang,
          targetScript,
        },
        llmGenerator
      );

      return res.status(200).json(result);
    } catch (err: any) {
      console.warn('Error in /api/translate:', err?.message || err);
      const rawText = String(req.body?.text || '');
      const warning =
        'Santali translation could not be verified reliably due to a server error.';
      return res.status(200).json({
        originalText: rawText,
        extractedUtterance: rawText,
        translatedText: '',
        santaliOlChiki: '',
        santaliRoman: '',
        santaliDevanagari: '',
        transliteration: '',
        pronunciationGuide: '',
        backTranslationEnglish: rawText,
        backTranslationHindi: '',
        sourceLang: req.body?.sourceLang || 'english',
        targetLang: req.body?.targetLang || 'santali',
        targetScript: req.body?.targetScript || 'olchiki',
        intent: 'translation',
        isVerified: false,
        verificationStatus: 'unavailable',
        confidence: 'unverified',
        modelUsed: 'error-fallback',
        isUrgentOrMedical: false,
        warning,
        error: warning,
        verifiedVocabulary: [],
      });
    }
  });

  // ---------------------------------------------------------------------------
  // 3. Server-Side Speech Generation Endpoint (/api/tts)
  // Uses gemini-3.8-flash-lite-tts to synthesize speech of the target text.
  // ---------------------------------------------------------------------------
  app.post('/api/tts', async (req, res) => {
    try {
      const { text, lang = 'santali', romanGuide = '' } = req.body || {};
      const trimmed = String(text || '').trim();
      if (!trimmed) {
        return res.status(400).json({ error: 'Text to speak is required' });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(503).json({
          error: 'GEMINI_API_KEY not configured for server-side TTS synthesis.',
          isNativeSantaliTts: false,
        });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      // Speak the actual target words (never the English meaning or explanation).
      const spokenUtterance =
        lang === 'santali' && romanGuide
          ? `${trimmed} (${romanGuide})`
          : trimmed;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash-lite-tts',
        contents: [
          {
            role: 'user',
            parts: [
              {
                text:
                  lang === 'santali'
                    ? `Speak only this Santali sentence clearly with Indian regional articulation: ${romanGuide || trimmed}`
                    : spokenUtterance,
              },
            ],
          },
        ],
        config: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Kore' },
            },
          },
        },
      });

      const base64Audio =
        response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

      if (!base64Audio) {
        return res.status(502).json({
          error: 'No audio data returned by TTS model.',
          isNativeSantaliTts: false,
        });
      }

      return res.status(200).json({
        audioBase64: base64Audio,
        mimeType: 'audio/wav',
        engine: 'gemini-3.8-flash-lite-tts',
        isNativeSantaliTts: false,
        statusLabel:
          lang === 'santali'
            ? 'AI Phonetic Speech (gemini-3.8-flash-lite-tts — native sat-IN TTS unavailable)'
            : `Server TTS (${lang})`,
      });
    } catch (err: any) {
      return res.status(502).json({
        error: err?.message || 'TTS synthesis failed',
        isNativeSantaliTts: false,
      });
    }
  });

  // Serve static files in production, use Vite dev middleware in development
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
