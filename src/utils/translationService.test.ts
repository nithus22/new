import test from 'node:test';
import assert from 'node:assert/strict';
import {
  translateMessage,
  detectLanguageAndScript,
  extractCommunicativeUtterance,
  classifyUserIntent,
  validateTranslationCandidate,
  convertSantaliScript,
  transliterateOlChikiToRoman,
  runTranslationPipeline,
  runChatPipeline,
  createSpeechRecognitionController,
} from './translationService.ts';
import { sound } from './audio.ts';

test('1. Regression: Blocks mixed code/English hallucinations ("custom/AI", "implement", "system") in Ol Chiki output', async () => {
  const corruptedGenerator = async () => ({
    text: JSON.stringify({
      santaliOlChiki: 'ᱤᱧ custom/AI ᱛᱮ implement ᱟᱨ system ᱠᱚᱨᱟᱣ ᱮᱫᱟ᱾',
      santaliRoman: 'Ing custom/AI te implement ar system koraw eda.',
      santaliDevanagari: 'इञ custom/AI ते implement आर system कराव एदा।',
      englishTranslation: 'I am implementing a custom AI system.',
      hindiTranslation: 'मैं कस्टम एआई सिस्टम लागू कर रहा हूँ।',
      backTranslationEnglish: 'I am implementing a custom AI system.',
      backTranslationHindi: 'मैं कस्टम एआई सिस्टम लागू कर रहा हूँ।',
    }),
    modelUsed: 'mock-corrupted-llm',
  });

  // Test in translation pipeline
  const transRes = await runTranslationPipeline(
    {
      text: 'Could you please show me the way to the post office?',
      sourceLang: 'english',
      targetLang: 'santali',
    },
    corruptedGenerator
  );

  assert.equal(transRes.isVerified, false);
  assert.equal(transRes.verificationStatus, 'validation_failed');
  assert.equal(transRes.translatedText, '');
  assert.equal(transRes.santaliOlChiki, '');
  assert.match(transRes.warning || '', /Santali translation could not be verified reliably/i);
  assert.match(transRes.notes || '', /custom\/ai|implement|system/i);

  // Also test in Chotu chat pipeline
  const chatRes = await runChatPipeline(
    {
      message: 'How does solar energy work in villages?',
      replyLang: 'santali',
    },
    corruptedGenerator
  );

  assert.equal(chatRes.isVerified, false);
  assert.equal(chatRes.verificationStatus, 'validation_failed');
  assert.equal(chatRes.santali.olchiki, '');
  assert.doesNotMatch(chatRes.reply, /custom\/AI|implement/i);
});

test('2. Regression: Substring bug fixed — "know" does NOT match "No" (ᱵᱟᱝ) in two-way communication request', async () => {
  const prompt =
    "I know English, but I don't know Santali. Help me talk to a Santali-speaking person.";

  const intentInfo = classifyUserIntent(prompt);
  assert.equal(intentInfo.intent, 'two_way_communication');

  const chatRes = await runChatPipeline({
    message: prompt,
    replyLang: 'santali',
  });

  assert.equal(chatRes.intent, 'two_way_communication');
  assert.equal(chatRes.isVerified, true);
  assert.notEqual(chatRes.santali.olchiki, 'ᱵᱟᱝ');
  assert.match(chatRes.santali.olchiki, /ᱤᱧ ᱤᱝᱨᱟᱹᱡᱤ ᱵᱟᱰᱟᱭᱟ/);
  assert.match(chatRes.santali.roman, /Ing Ingraji badaya, menkhan Santali bany badaya/);
});

test('3. Asking directions and finding locations (English -> Santali & Hindi -> Santali)', async () => {
  // Indirect request: "Please ask them where the bus stand is."
  const busRes = await runTranslationPipeline({
    text: 'Please ask them where the bus stand is.',
    sourceLang: 'english',
    targetLang: 'santali',
  });

  assert.equal(busRes.extractedUtterance, 'Where is the bus stand?');
  assert.equal(busRes.isVerified, true);
  assert.equal(busRes.verificationStatus, 'verified_phrasebook');
  assert.equal(busRes.santaliOlChiki, 'ᱵᱟᱥ ᱤᱥᱴᱮᱱᱰ ᱫᱚ ᱚᱠᱟ ᱨᱮ ᱢᱮᱱᱟᱜᱼᱟ?');
  assert.equal(busRes.santaliRoman, 'Bas istend do oka re menag-a?');
  assert.equal(busRes.backTranslationEnglish, 'Where is the bus stand?');

  // Indirect request: "Please ask them where the nearest hospital is."
  const hospRes = await runTranslationPipeline({
    text: 'Please ask them where the nearest hospital is.',
    sourceLang: 'english',
    targetLang: 'santali',
  });

  assert.equal(hospRes.extractedUtterance, 'Where is the nearest hospital?');
  assert.equal(hospRes.isVerified, true);
  assert.equal(hospRes.santaliOlChiki, 'ᱥᱩᱨ ᱨᱮᱭᱟᱜ ᱦᱟᱥᱯᱟᱛᱟᱞ ᱫᱚ ᱚᱠᱟ ᱨᱮ ᱢᱮᱱᱟᱜᱼᱟ?');
  assert.equal(hospRes.isUrgentOrMedical, true);

  // Hindi -> Santali direction query
  const hiBusRes = await runTranslationPipeline({
    text: 'बस स्टैंड कहाँ है?',
    sourceLang: 'hindi',
    targetLang: 'santali',
  });

  assert.equal(hiBusRes.isVerified, true);
  assert.equal(hiBusRes.santaliOlChiki, 'ᱵᱟᱥ ᱤᱥᱴᱮᱱᱰ ᱫᱚ ᱚᱠᱟ ᱨᱮ ᱢᱮᱱᱟᱜᱼᱟ?');
});

test('4. Asking prices and requesting help', async () => {
  const priceRes = await runChatPipeline({
    message: 'Ask them how much this costs.',
    replyLang: 'santali',
  });

  assert.equal(priceRes.intent, 'translation');
  assert.equal(priceRes.extractedUtterance, 'How much does this cost?');
  assert.equal(priceRes.isVerified, true);
  assert.equal(priceRes.santali.olchiki, 'ᱱᱚᱣᱟ ᱨᱮᱭᱟᱜ ᱫᱟᱢ ᱫᱚ ᱛᱤᱱᱟᱹᱜ?');
  assert.equal(priceRes.santali.roman, 'Nowa reyag dam do tinag?');

  const helpRes = await runChatPipeline({
    message: 'Tell them I need help.',
    replyLang: 'santali',
  });

  assert.equal(helpRes.intent, 'translation');
  assert.equal(helpRes.extractedUtterance, 'I need help.');
  assert.equal(helpRes.isVerified, true);
  assert.equal(helpRes.santali.olchiki, 'ᱤᱧ ᱜᱚᱲᱚ ᱞᱟᱹᱠᱛᱤ ᱠᱟᱱᱟ᱾');
  assert.equal(helpRes.santali.roman, 'Ing goro lakti kana.');
});

test('5. Medical-help phrases & safety warnings for unverified medical translations', async () => {
  // Verified medical phrase from reference phrasebook
  const medRes = await runChatPipeline({
    message: 'Tell them I am feeling unwell and need a doctor.',
    replyLang: 'santali',
  });

  assert.equal(medRes.intent, 'translation');
  assert.equal(medRes.extractedUtterance, 'I am feeling unwell and need a doctor.');
  assert.equal(medRes.isVerified, true);
  assert.equal(
    medRes.santali.olchiki,
    'ᱤᱧᱟᱜ ᱦᱚᱲᱢᱚ ᱵᱟᱹᱲᱤᱡ ᱜᱮ ᱵᱩᱡᱷᱟᱹᱣᱜ ᱠᱟᱱᱟ ᱟᱨ ᱰᱚᱠᱴᱚᱨ ᱞᱟᱹᱠᱛᱤ ᱠᱟᱱᱟ᱾'
  );
  assert.equal(
    medRes.santali.roman,
    'Inyag hormo barij ge bujhawg kana ar doktor lakti kana.'
  );

  // Unverified complex medical sentence -> must carry explicit safetyWarning and unverified_ai status
  const mockMedicalAi = async () => ({
    text: JSON.stringify({
      santaliOlChiki: 'ᱤᱧᱟᱜ ᱵᱚᱦᱚᱜ ᱦᱟᱹᱥᱩ ᱭᱮᱫ ᱤᱧᱟ ᱟᱨ ᱦᱟᱥᱯᱟᱛᱟᱞ ᱞᱟᱹᱠᱛᱤ ᱠᱟᱱᱟ᱾',
      santaliRoman: 'Inyag bohog hasu yed inya ar haspatal lakti kana.',
      santaliDevanagari: 'इञाग बोहोग हासु येद इञा आर हास्पताल लाकती काना।',
      englishTranslation: 'I have a severe headache and need a hospital.',
      hindiTranslation: 'मेरे सिर में दर्द है और अस्पताल चाहिए।',
      backTranslationEnglish: 'My head hurts and a hospital is needed.',
      backTranslationHindi: 'मेरा सिर दुख रहा है और अस्पताल चाहिए।',
    }),
    modelUsed: 'gemini-3.8-flash',
  });

  const unverifiedMed = await runTranslationPipeline(
    {
      text: 'I have a severe allergy to penicillin and need emergency hospital care.',
      sourceLang: 'english',
      targetLang: 'santali',
    },
    mockMedicalAi
  );

  assert.equal(unverifiedMed.isVerified, false);
  assert.equal(unverifiedMed.verificationStatus, 'unverified_ai');
  assert.equal(unverifiedMed.confidence, 'unverified');
  assert.equal(unverifiedMed.isUrgentOrMedical, true);
  assert.ok(unverifiedMed.safetyWarning, 'Urgent unverified message must include safetyWarning');
  assert.match(unverifiedMed.safetyWarning!, /Urgent\/Safety-Critical Message/);
});

test('6. Santali to English and Santali to Hindi incoming reply translations', async () => {
  // Direct Santali Ol Chiki -> English
  const satToEn = await runTranslationPipeline({
    text: 'ᱵᱟᱥ ᱤᱥᱴᱮᱱᱰ ᱫᱚ ᱥᱩᱨ ᱨᱮᱜᱮ ᱢᱮᱱᱟᱜᱼᱟ᱾',
    sourceLang: 'santali',
    targetLang: 'english',
  });

  assert.equal(satToEn.isVerified, true);
  assert.equal(satToEn.translatedText, 'The bus stand is nearby.');
  assert.equal(satToEn.backTranslationHindi, 'बस स्टैंड पास में ही है।');

  // Direct Santali Ol Chiki -> Hindi
  const satToHi = await runTranslationPipeline({
    text: 'ᱤᱧ ᱵᱮᱥ ᱜᱮ ᱢᱮᱱᱟᱹᱧᱟ᱾',
    sourceLang: 'santali',
    targetLang: 'hindi',
  });

  assert.equal(satToHi.isVerified, true);
  assert.equal(satToHi.translatedText, 'मैं ठीक हूँ।');

  // Chat request: "They replied in Santali: 'ᱵᱟᱥ ᱤᱥᱴᱮᱱᱰ ᱫᱚ ᱥᱩᱨ ᱨᱮᱜᱮ ᱢᱮᱱᱟᱜᱼᱟ᱾' Explain their reply to me in English."
  const chatIncoming = await runChatPipeline({
    message:
      'They replied in Santali: "ᱵᱟᱥ ᱤᱥᱴᱮᱱᱰ ᱫᱚ ᱥᱩᱨ ᱨᱮᱜᱮ ᱢᱮᱱᱟᱜᱼᱟ᱾" Explain their reply to me in English.',
    replyLang: 'english',
  });

  assert.equal(chatIncoming.intent, 'incoming_translation');
  assert.equal(chatIncoming.isVerified, true);
  assert.match(chatIncoming.reply, /The bus stand is right nearby|The bus stand is nearby/);
});

test('7. Polite questions, water request in Chotu chat, negative sentences, and preservation of names & numbers', async () => {
  // "How do I tell someone in Santali that I need water?" -> Must translate "I need water", NOT give syllabus fluff!
  const waterChat = await runChatPipeline({
    message: 'How do I tell someone in Santali that I need water?',
    replyLang: 'santali',
  });

  assert.equal(waterChat.intent, 'translation');
  assert.equal(waterChat.extractedUtterance, 'I need water');
  assert.equal(waterChat.isVerified, true);
  assert.equal(waterChat.santali.olchiki, 'ᱤᱧ ᱫᱟᱜ ᱞᱟᱹᱠᱛᱤ ᱠᱟᱱᱟ᱾');
  assert.equal(waterChat.santali.roman, 'Ing dah lakti kana.');

  // Preservation of custom person name via verified template
  const nameRes = await runTranslationPipeline({
    text: 'Tell them my name is Rahul.',
    sourceLang: 'english',
    targetLang: 'santali',
  });

  assert.equal(nameRes.isVerified, true);
  assert.equal(nameRes.verificationStatus, 'verified_template');
  assert.equal(nameRes.santaliOlChiki, 'ᱤᱧᱟᱜ ᱧᱩᱛᱩᱢ ᱫᱚ Rahul ᱠᱟᱱᱟ᱾');
  assert.equal(nameRes.santaliRoman, 'Inyag nyutum do Rahul kana.');

  // Preservation of negation and numbers ("Tell them I do not have 500 rupees")
  const negNumRes = await runTranslationPipeline({
    text: 'Tell them I do not have 500 rupees.',
    sourceLang: 'english',
    targetLang: 'santali',
  });

  assert.equal(negNumRes.isVerified, true);
  assert.equal(negNumRes.verificationStatus, 'verified_template');
  assert.equal(negNumRes.santaliOlChiki, 'ᱤᱧ ᱴᱷᱮᱱ 500 ᱴᱟᱠᱟ ᱵᱟᱹᱱᱩᱜᱼᱟ᱾');
  assert.match(negNumRes.santaliRoman, /500/);
  assert.match(negNumRes.santaliRoman, /banug-a/);
});

test('8. Multi-turn isolation: previous turn does NOT contaminate the next translation', async () => {
  const receivedPrompts: string[] = [];
  const trackingGenerator = async (prompt: string) => {
    receivedPrompts.push(prompt);
    return {
      text: JSON.stringify({
        santaliOlChiki: 'ᱜᱟᱯᱟ ᱥᱮᱛᱟᱜ ᱨᱮᱞ ᱜᱟᱹᱰᱤ ᱦᱤᱡᱩᱜᱼᱟ᱾',
        santaliRoman: 'Gapa setag rel gadi hijug-a.',
        santaliDevanagari: 'गापा सेताग रेल गाडी हिजुग-आ।',
        englishTranslation: 'The train will arrive tomorrow morning.',
        hindiTranslation: 'ट्रेन कल सुबह आएगी।',
        backTranslationEnglish: 'The train will arrive tomorrow morning.',
        backTranslationHindi: 'ट्रेन कल सुबह आएगी।',
      }),
      modelUsed: 'gemini-3.8-flash',
    };
  };

  // Turn 1: User asks about hospital
  const turn1 = await runChatPipeline({
    message: 'Please ask them where the nearest hospital is.',
    replyLang: 'santali',
  });
  assert.equal(turn1.santali.olchiki, 'ᱥᱩᱨ ᱨᱮᱭᱟᱜ ᱦᱟᱥᱯᱟᱛᱟᱞ ᱫᱚ ᱚᱠᱟ ᱨᱮ ᱢᱮᱱᱟᱜᱼᱟ?');

  // Turn 2: User translates a completely unrelated sentence with Turn 1 in history
  const turn2 = await runChatPipeline(
    {
      message: 'Translate to Santali: The train will arrive tomorrow morning.',
      conversationHistory: [
        { sender: 'child', text: 'Please ask them where the nearest hospital is.' },
        {
          sender: 'chotu',
          text: turn1.reply,
          santali: turn1.santali,
        },
      ],
      replyLang: 'santali',
    },
    trackingGenerator
  );

  assert.equal(receivedPrompts.length, 1);
  // Ensure Turn 1's "hospital" text was NOT injected into Turn 2's translation prompt!
  assert.doesNotMatch(receivedPrompts[0], /nearest hospital/i);
  assert.equal(turn2.santali.olchiki, 'ᱜᱟᱯᱟ ᱥᱮᱛᱟᱜ ᱨᱮᱞ ᱜᱟᱹᱰᱤ ᱦᱤᱡᱩᱜᱼᱟ᱾');
  assert.equal(turn2.isVerified, false);
  assert.equal(turn2.verificationStatus, 'unverified_ai');
});

test('9. Model timeouts, missing API keys, and network failures never return fake greetings', async () => {
  // Missing API key (no llmGenerator) on unknown sentence
  const noKeyRes = await runChatPipeline({
    message: 'Please ask them if the post office is open on Sunday afternoon.',
    replyLang: 'santali',
  });

  assert.equal(noKeyRes.isVerified, false);
  assert.equal(noKeyRes.verificationStatus, 'unavailable');
  assert.equal(noKeyRes.santali.olchiki, '');
  // Must NOT pretend to greet with "Johar friend! I am Chotu..."
  assert.doesNotMatch(noKeyRes.reply, /I am Chotu the deer, always ready/i);
  assert.match(noKeyRes.reply, /Santali translation could not be verified reliably/i);
  assert.match(noKeyRes.reply, /post office is open on Sunday afternoon/i);

  // Timeout error from LLM
  const timeoutGenerator = async () => {
    throw new Error('Model timeout (gemini-3.8-flash)');
  };

  const timeoutRes = await runTranslationPipeline(
    {
      text: 'Where can I buy a ticket for the evening bus to Dumka?',
      sourceLang: 'english',
      targetLang: 'santali',
    },
    timeoutGenerator
  );

  assert.equal(timeoutRes.isVerified, false);
  assert.equal(timeoutRes.verificationStatus, 'unavailable');
  assert.equal(timeoutRes.translatedText, '');
  assert.match(timeoutRes.warning || '', /Santali translation could not be verified reliably/i);
});

test('10. Separation of Translation, Transliteration, and Script Conversion', async () => {
  // 1. Refuses to convert English or Hindi script directly into Ol Chiki
  const invalidConversion = convertSantaliScript(
    'Where is the bus stand?',
    'roman',
    'olchiki',
    'english'
  );
  assert.equal(invalidConversion.isSupported, false);
  assert.match(invalidConversion.error || '', /Script conversion is only valid for Santali text/i);

  // 2. Valid Ol Chiki -> Roman phonetic transliteration for Santali
  const romanTranslit = transliterateOlChikiToRoman('ᱡᱚᱦᱟᱨ');
  assert.equal(romanTranslit, 'johar'); // deterministic character transliteration

  // 3. Phrasebook supports Ol Chiki, Roman Santali, and Devanagari Santali distinctly
  const romanScriptRes = await runTranslationPipeline({
    text: 'Where is the bus stand?',
    sourceLang: 'english',
    targetLang: 'santali',
    targetScript: 'roman',
  });
  assert.equal(romanScriptRes.translatedText, 'Bas istend do oka re menag-a?');
  assert.equal(romanScriptRes.santaliOlChiki, 'ᱵᱟᱥ ᱤᱥᱴᱮᱱᱰ ᱫᱚ ᱚᱠᱟ ᱨᱮ ᱢᱮᱱᱟᱜᱼᱟ?');

  const devaScriptRes = await runTranslationPipeline({
    text: 'Where is the bus stand?',
    sourceLang: 'english',
    targetLang: 'santali',
    targetScript: 'devanagari',
  });
  // Devanagari Santali ("बास इस्टेंड दो ओका रे मेनाग-आ?") is distinct from Hindi ("बस स्टैंड कहाँ है?")
  assert.equal(devaScriptRes.translatedText, 'बास इस्टेंड दो ओका रे मेनाग-आ?');
  assert.notEqual(devaScriptRes.translatedText, devaScriptRes.backTranslationHindi);
});

test('11. Audio playback and unsupported Santali STT error handling', async () => {
  // 1. Speech recognition controller explicitly marks Santali STT as unsupported
  const stt = createSpeechRecognitionController();
  assert.equal(stt.isSantaliSupported, false);

  // 2. Audio playback request intent in Chotu ("Can you speak this translated message aloud?")
  const audioIntentRes = await runChatPipeline({
    message: 'Can you speak this translated message aloud?',
    conversationHistory: [
      {
        sender: 'chotu',
        text: 'ᱵᱟᱥ ᱤᱥᱴᱮᱱᱰ ᱫᱚ ᱚᱠᱟ ᱨᱮ ᱢᱮᱱᱟᱜᱼᱟ?',
        santali: {
          olchiki: 'ᱵᱟᱥ ᱤᱥᱴᱮᱱᱰ ᱫᱚ ᱚᱠᱟ ᱨᱮ ᱢᱮᱱᱟᱜᱼᱟ?',
          roman: 'Bas istend do oka re menag-a?',
          devanagari: 'बास इस्टेंड दो ओका रे मेनाग-आ?',
        },
      },
    ],
    replyLang: 'english',
  });

  assert.equal(audioIntentRes.intent, 'audio_request');
  assert.equal(audioIntentRes.autoPlayAudio, true);
  assert.equal(audioIntentRes.santali.olchiki, 'ᱵᱟᱥ ᱤᱥᱴᱮᱱᱰ ᱫᱚ ᱚᱠᱟ ᱨᱮ ᱢᱮᱱᱟᱜᱼᱟ?');

  // 3. sound.speakTranslatedMessage never claims native Santali TTS in headless/standard environment
  const ttsRes = await sound.speakTranslatedMessage({
    targetLang: 'santali',
    translatedText: 'ᱡᱚᱦᱟᱨ',
    santaliRoman: 'Johar',
  });
  assert.equal(ttsRes.isNativeSantali, false);
});
