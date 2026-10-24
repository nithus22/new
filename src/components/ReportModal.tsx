import React, { useState } from 'react';
import { AlertCircle, CheckCircle2, Send } from 'lucide-react';
import { LanguageId, TranslationFeedback } from '../types';
import { LANGUAGES } from '../data/languages';
import { sound } from '../utils/audio';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLanguage: LanguageId;
  chapterTitle?: string;
  chapterId?: string;
  onSubmitFeedback: (feedback: TranslationFeedback) => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  currentLanguage,
  chapterTitle = 'General App Content',
  chapterId = 'c1-math-ch1',
  onSubmitFeedback,
}) => {
  const [problemType, setProblemType] = useState<TranslationFeedback['problemType']>('wrong_word');
  const [suggestedCorrection, setSuggestedCorrection] = useState('');
  const [reporterRole, setReporterRole] = useState<TranslationFeedback['reporterRole']>('teacher');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!suggestedCorrection.trim()) return;

    sound.playCorrect();
    const feedback: TranslationFeedback = {
      id: `fb-${Date.now()}`,
      chapterId,
      chapterTitle,
      language: currentLanguage,
      problemType,
      suggestedCorrection: suggestedCorrection.trim(),
      reporterRole,
      timestamp: new Date().toLocaleString(),
      status: 'pending',
    };

    onSubmitFeedback(feedback);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setSuggestedCorrection('');
      onClose();
    }, 1600);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 border-4 border-amber-400 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b pb-3 border-amber-200">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-6 h-6 text-orange-600" />
            <h3 className="text-lg font-black text-amber-950">
              Report Translation / Script Issue
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold flex items-center justify-center"
          >
            ✕
          </button>
        </div>

        {submitted ? (
          <div className="py-8 text-center space-y-2 animate-bounce">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
            <h4 className="text-xl font-black text-emerald-950">Thank You! / ᱥᱟᱹᱨᱤ ᱥᱟᱨᱦᱟᱣ!</h4>
            <p className="text-xs text-slate-600 font-bold">
              Your report has been sent to the {LANGUAGES[currentLanguage].name} Teacher Review Queue.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-black uppercase text-amber-900 mb-1">
                Language & Chapter
              </label>
              <div className="px-3 py-2 rounded-xl bg-amber-50 border border-amber-300 text-xs font-bold text-amber-950">
                {LANGUAGES[currentLanguage].name} ({LANGUAGES[currentLanguage].scriptName}) • {chapterTitle}
              </div>
            </div>

            <div>
              <label className="block text-xs font-black uppercase text-amber-900 mb-1">
                Type of Issue
              </label>
              <select
                value={problemType}
                onChange={(e) => setProblemType(e.target.value as TranslationFeedback['problemType'])}
                className="w-full px-3 py-2 rounded-xl border-2 border-amber-300 font-bold text-xs text-amber-950 focus:outline-none focus:border-amber-500"
              >
                <option value="wrong_word">Wrong Word / Translation Inaccuracy</option>
                <option value="spelling">Spelling Error in Script</option>
                <option value="script_display">Script Not Displaying Correctly (Font)</option>
                <option value="audio_missing">Audio Pronunciation Missing or Wrong</option>
                <option value="other">Other Feedback</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-black uppercase text-amber-900 mb-1">
                Suggested Correction or Note
              </label>
              <textarea
                rows={3}
                required
                value={suggestedCorrection}
                onChange={(e) => setSuggestedCorrection(e.target.value)}
                placeholder="Write the correct word, spelling, or pronunciation..."
                className="w-full px-3 py-2 rounded-xl border-2 border-amber-300 font-bold text-xs text-amber-950 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase text-amber-900 mb-1">
                Who are you?
              </label>
              <div className="flex gap-2">
                {(['teacher', 'student', 'parent'] as const).map((role) => (
                  <button
                    type="button"
                    key={role}
                    onClick={() => setReporterRole(role)}
                    className={`flex-1 py-1.5 rounded-xl border-2 font-bold text-xs capitalize ${
                      reporterRole === role
                        ? 'bg-amber-500 text-white border-amber-600'
                        : 'bg-white text-slate-700 border-amber-200'
                    }`}
                  >
                    {role}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-black text-sm shadow-md press-bounce flex items-center justify-center gap-2 border border-amber-700"
              >
                <Send className="w-4 h-4" />
                <span>Submit to Review Queue</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
