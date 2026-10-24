/**
 * Web Audio API based sound synthesizer for children's cartoon feedback
 * and Speech Narration controller with honest Santali/Hindi/English TTS support.
 */

export type AudioPlaybackStatus =
  | 'idle'
  | 'loading_tts'
  | 'playing_native'
  | 'playing_ai_tts'
  | 'playing_phonetic_approx'
  | 'paused'
  | 'error'
  | 'unsupported';

export interface SpeechSynthesisResult {
  status: AudioPlaybackStatus;
  statusMessage: string;
  isNativeSantali: boolean;
  engine: 'browser-native-sat' | 'server-gemini-tts' | 'browser-hi-phonetic' | 'browser-native' | 'none';
  error?: string;
}

class SoundEngine {
  private ctx: AudioContext | null = null;
  private soundEnabled: boolean = true;
  private activeHtmlAudio: HTMLAudioElement | null = null;

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public setSoundEnabled(enabled: boolean) {
    this.soundEnabled = enabled;
  }

  public isEnabled(): boolean {
    return this.soundEnabled;
  }

  // Playful pop / bubble click for buttons
  public playPop() {
    if (!this.soundEnabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      const now = this.ctx.currentTime;
      osc.frequency.setValueAtTime(350, now);
      osc.frequency.exponentialRampToValueAtTime(700, now + 0.08);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.09);
    } catch {
      // Audio safety fallback
    }
  }

  // Cheerful correct answer chime / harp glissando
  public playCorrect() {
    if (!this.soundEnabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        const start = this.ctx.currentTime + idx * 0.07;
        osc.frequency.setValueAtTime(freq, start);

        gain.gain.setValueAtTime(0.2, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.28);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(start);
        osc.stop(start + 0.3);
      });
    } catch {
      // fallback
    }
  }

  // Soft cartoon boing for wrong answers
  public playBoing() {
    if (!this.soundEnabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      const now = this.ctx.currentTime;
      osc.frequency.setValueAtTime(260, now);
      osc.frequency.exponentialRampToValueAtTime(140, now + 0.22);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.25);
    } catch {
      // fallback
    }
  }

  // Star celebration fanfare
  public playCelebration() {
    if (!this.soundEnabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const notes = [392, 523.25, 659.25, 783.99, 880, 1046.5];
      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        const start = this.ctx.currentTime + idx * 0.09;
        osc.frequency.setValueAtTime(freq, start);

        gain.gain.setValueAtTime(0.22, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.35);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(start);
        osc.stop(start + 0.38);
      });
    } catch {
      // fallback
    }
  }

  /**
   * Checks if the current browser environment provides a genuine native Santali (`sat` / `sat-IN`) voice.
   */
  public findNativeSantaliVoice(): SpeechSynthesisVoice | null {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return null;
    }
    try {
      const voices = window.speechSynthesis.getVoices() || [];
      return (
        voices.find(
          (v) =>
            v.lang.toLowerCase().startsWith('sat') ||
            v.name.toLowerCase().includes('santali') ||
            v.name.toLowerCase().includes('ol chiki')
        ) || null
      );
    } catch {
      return null;
    }
  }

  /**
   * Finds the best available Hindi (`hi-IN`) voice for phonetic Santali or Hindi narration
   * so we never accidentally read Roman Santali with an American/British English accent.
   */
  public findHindiOrIndianVoice(targetLang: 'hi-IN' | 'en-IN'): SpeechSynthesisVoice | null {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return null;
    }
    try {
      const voices = window.speechSynthesis.getVoices() || [];
      if (targetLang === 'hi-IN') {
        return voices.find((v) => v.lang.toLowerCase().startsWith('hi')) || null;
      }
      return (
        voices.find((v) => v.lang.toLowerCase() === 'en-in') ||
        voices.find((v) => v.lang.toLowerCase().startsWith('en')) ||
        null
      );
    } catch {
      return null;
    }
  }

  // Speak narration aloud with callback for word highlighting
  public speakText(
    text: string,
    options?: {
      lang?: string;
      rate?: number;
      pitch?: number;
      onWord?: (wordIndex: number) => void;
      onEnd?: () => void;
      onError?: (err: string) => void;
    }
  ): SpeechSynthesisUtterance | null {
    if (!this.soundEnabled || typeof window === 'undefined' || !('speechSynthesis' in window)) {
      if (options?.onError) {
        options.onError(
          !this.soundEnabled
            ? 'Sound is muted in settings.'
            : 'Speech synthesis is not supported in this browser.'
        );
      }
      if (options?.onEnd) options.onEnd();
      return null;
    }

    try {
      this.stopSpeech();
      const utterance = new SpeechSynthesisUtterance(text);
      const requestedLang = options?.lang || 'hi-IN';
      utterance.lang = requestedLang;
      utterance.rate = options?.rate || 0.85;
      utterance.pitch = options?.pitch || 1.1;

      const preferredVoice = requestedLang.startsWith('hi')
        ? this.findHindiOrIndianVoice('hi-IN')
        : requestedLang.startsWith('en')
        ? this.findHindiOrIndianVoice('en-IN')
        : null;
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      if (options?.onWord) {
        utterance.onboundary = (event) => {
          if (event.name === 'word') {
            options.onWord!(event.charIndex);
          }
        };
      }

      utterance.onend = () => {
        if (options?.onEnd) options.onEnd();
      };

      utterance.onerror = () => {
        if (options?.onError) options.onError('Browser speech synthesis encountered an error.');
        if (options?.onEnd) options.onEnd();
      };

      window.speechSynthesis.speak(utterance);
      return utterance;
    } catch (e: any) {
      if (options?.onError) options.onError(e?.message || 'Speech playback failed.');
      if (options?.onEnd) options.onEnd();
      return null;
    }
  }

  /**
   * Speaks translated Santali, Hindi, or English text with full honesty:
   * - Never speaks the English original when asked to play a Santali translation.
   * - Never claims native Santali TTS unless a genuine `sat-IN` voice is installed.
   * - Attempts server-side `/api/tts` (`gemini-3.8-flash-lite-tts`) for Santali words,
   *   falling back to `hi-IN` phonetic articulation of the Santali words.
   */
  public async speakTranslatedMessage(params: {
    targetLang: 'santali' | 'hindi' | 'english';
    translatedText: string;
    santaliRoman?: string;
    santaliDevanagari?: string;
    onStatusChange?: (res: SpeechSynthesisResult) => void;
    onEnd?: () => void;
  }): Promise<SpeechSynthesisResult> {
    const {
      targetLang,
      translatedText,
      santaliRoman = '',
      santaliDevanagari = '',
      onStatusChange,
      onEnd,
    } = params;

    const cleanTranslated = (translatedText || '').trim();
    if (!cleanTranslated && !santaliRoman.trim()) {
      const errRes: SpeechSynthesisResult = {
        status: 'error',
        statusMessage: 'No validated translated text available to speak.',
        isNativeSantali: false,
        engine: 'none',
        error: 'Cannot play audio: translation is empty or unverified.',
      };
      onStatusChange?.(errRes);
      onEnd?.();
      return errRes;
    }

    if (!this.soundEnabled) {
      const mutedRes: SpeechSynthesisResult = {
        status: 'error',
        statusMessage: 'Audio is currently muted in the header settings.',
        isNativeSantali: false,
        engine: 'none',
        error: 'Audio is muted. Enable sound in the top bar to hear speech.',
      };
      onStatusChange?.(mutedRes);
      onEnd?.();
      return mutedRes;
    }

    this.stopSpeech();

    // Case 1: Native English or Hindi TTS
    if (targetLang === 'english' || targetLang === 'hindi') {
      const langCode = targetLang === 'english' ? 'en-IN' : 'hi-IN';
      const statusRes: SpeechSynthesisResult = {
        status: 'playing_native',
        statusMessage: `Playing native ${targetLang === 'english' ? 'English (en-IN)' : 'Hindi (hi-IN)'} voice`,
        isNativeSantali: false,
        engine: 'browser-native',
      };
      onStatusChange?.(statusRes);

      this.speakText(cleanTranslated, {
        lang: langCode,
        rate: 0.88,
        pitch: 1.05,
        onEnd: () => {
          onStatusChange?.({
            ...statusRes,
            status: 'idle',
            statusMessage: `Native ${targetLang} audio ready`,
          });
          onEnd?.();
        },
        onError: (err) => {
          onStatusChange?.({
            status: 'error',
            statusMessage: err,
            isNativeSantali: false,
            engine: 'none',
            error: err,
          });
        },
      });
      return statusRes;
    }

    // Case 2: Santali Target Language
    // 2a. Check if the user's OS/browser actually has a native `sat-IN` voice installed
    const nativeSatVoice = this.findNativeSantaliVoice();
    if (nativeSatVoice && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const nativeRes: SpeechSynthesisResult = {
        status: 'playing_native',
        statusMessage: `Playing Native Santali Voice (${nativeSatVoice.name})`,
        isNativeSantali: true,
        engine: 'browser-native-sat',
      };
      onStatusChange?.(nativeRes);

      const utterance = new SpeechSynthesisUtterance(cleanTranslated);
      utterance.voice = nativeSatVoice;
      utterance.lang = nativeSatVoice.lang;
      utterance.rate = 0.85;
      utterance.onend = () => {
        onStatusChange?.({ ...nativeRes, status: 'idle' });
        onEnd?.();
      };
      utterance.onerror = () => {
        onEnd?.();
      };
      window.speechSynthesis.speak(utterance);
      return nativeRes;
    }

    // 2b. Try Server-Side Gemini TTS (`/api/tts`) speaking the Santali words
    onStatusChange?.({
      status: 'loading_tts',
      statusMessage: 'Synthesizing Santali speech audio...',
      isNativeSantali: false,
      engine: 'server-gemini-tts',
    });

    try {
      const resp = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: cleanTranslated,
          lang: 'santali',
          romanGuide: santaliRoman || cleanTranslated,
        }),
      });

      if (resp.ok) {
        const data = await resp.json();
        if (data?.audioBase64 && typeof Audio !== 'undefined') {
          const audioUrl = `data:${data.mimeType || 'audio/wav'};base64,${data.audioBase64}`;
          const audioEl = new Audio(audioUrl);
          this.activeHtmlAudio = audioEl;

          const aiTtsRes: SpeechSynthesisResult = {
            status: 'playing_ai_tts',
            statusMessage:
              'Playing Santali words via AI TTS (gemini-3.8-flash-lite-tts — native sat-IN voice unavailable)',
            isNativeSantali: false,
            engine: 'server-gemini-tts',
          };
          onStatusChange?.(aiTtsRes);

          audioEl.onended = () => {
            this.activeHtmlAudio = null;
            onStatusChange?.({
              ...aiTtsRes,
              status: 'idle',
              statusMessage: 'AI Phonetic TTS (native sat-IN TTS unavailable)',
            });
            onEnd?.();
          };
          audioEl.onerror = () => {
            this.activeHtmlAudio = null;
            onEnd?.();
          };
          await audioEl.play();
          return aiTtsRes;
        }
      }
    } catch {
      // Fall through to local browser phonetic fallback
    }

    // 2c. Browser fallback: Speak the Devanagari Santali or Roman Santali words using `hi-IN` phonetics
    // (Never use an English voice to read Roman transliteration, and never claim it is native Santali TTS!)
    const textForHindiPhoneticEngine =
      santaliDevanagari || santaliRoman || cleanTranslated;

    if (typeof window !== 'undefined' && 'speechSynthesis' in window && textForHindiPhoneticEngine) {
      const approxRes: SpeechSynthesisResult = {
        status: 'playing_phonetic_approx',
        statusMessage:
          'Phonetic Approximation (speaking Santali words via hi-IN voice — native Santali TTS is not supported by browser)',
        isNativeSantali: false,
        engine: 'browser-hi-phonetic',
      };
      onStatusChange?.(approxRes);

      this.speakText(textForHindiPhoneticEngine, {
        lang: 'hi-IN',
        rate: 0.8,
        pitch: 1.05,
        onEnd: () => {
          onStatusChange?.({
            ...approxRes,
            status: 'idle',
            statusMessage: 'Phonetic Approximation (native Santali TTS unavailable in browser)',
          });
          onEnd?.();
        },
        onError: (err) => {
          onStatusChange?.({
            status: 'error',
            statusMessage: err,
            isNativeSantali: false,
            engine: 'none',
            error: err,
          });
        },
      });
      return approxRes;
    }

    const unsupportedRes: SpeechSynthesisResult = {
      status: 'unsupported',
      statusMessage: 'Native Santali TTS is not supported in this environment.',
      isNativeSantali: false,
      engine: 'none',
      error: 'Native Santali speech synthesis is not available in this browser.',
    };
    onStatusChange?.(unsupportedRes);
    onEnd?.();
    return unsupportedRes;
  }

  public stopSpeech() {
    if (this.activeHtmlAudio) {
      try {
        this.activeHtmlAudio.pause();
        this.activeHtmlAudio.currentTime = 0;
      } catch {}
      this.activeHtmlAudio = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }

  public pauseSpeech() {
    if (this.activeHtmlAudio) {
      try {
        this.activeHtmlAudio.pause();
      } catch {}
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.pause();
    }
  }

  public resumeSpeech() {
    if (this.activeHtmlAudio) {
      try {
        this.activeHtmlAudio.play();
      } catch {}
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.resume();
    }
  }

  public isSpeaking(): boolean {
    if (this.activeHtmlAudio && !this.activeHtmlAudio.paused) {
      return true;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      return window.speechSynthesis.speaking;
    }
    return false;
  }

  public isPaused(): boolean {
    if (this.activeHtmlAudio && this.activeHtmlAudio.paused && this.activeHtmlAudio.currentTime > 0) {
      return true;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      return window.speechSynthesis.paused;
    }
    return false;
  }
}

export const sound = new SoundEngine();
