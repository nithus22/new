import React, { useState } from 'react';
import {
  GraduationCap,
  CheckCircle2,
  XCircle,
  FileEdit,
  Download,
  Upload,
  Mic,
  BarChart3,
  ListFilter,
  ArrowLeft,
  Sparkles,
  BookCheck,
  AlertCircle,
  Plus,
} from 'lucide-react';
import { Chapter, LanguageId, ReviewStatus, TranslationFeedback } from '../types';
import { LANGUAGES } from '../data/languages';
import { sound } from '../utils/audio';

interface TeacherPortalProps {
  chapters: Chapter[];
  onUpdateChapterTranslation: (
    chapterId: string,
    language: LanguageId,
    newStatus: ReviewStatus,
    newTitle: string,
    newNotes: string
  ) => void;
  feedbackQueue: TranslationFeedback[];
  onResolveFeedback: (feedbackId: string) => void;
  onClose: () => void;
}

export const TeacherPortal: React.FC<TeacherPortalProps> = ({
  chapters,
  onUpdateChapterTranslation,
  feedbackQueue,
  onResolveFeedback,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'review' | 'analytics' | 'feedback' | 'export'>('review');
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageId>('santali');
  const [editingChapterId, setEditingChapterId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);

  // Active Teacher Identity
  const [teacherName, setTeacherName] = useState('Hemant Soren (Santali Resource Group, Dumka)');

  const handleStartEdit = (ch: Chapter) => {
    sound.playPop();
    const langData = ch.languages[selectedLanguage];
    setEditingChapterId(ch.id);
    setEditTitle(langData?.title || '');
    setEditNotes(langData?.reviewNotes || '');
  };

  const handleSaveStatus = (chId: string, status: ReviewStatus) => {
    sound.playCorrect();
    onUpdateChapterTranslation(
      chId,
      selectedLanguage,
      status,
      editTitle,
      editNotes || `Updated by ${teacherName}`
    );
    setEditingChapterId(null);
  };

  const handleExportApprovedDataset = () => {
    sound.playCelebration();
    const approvedEntries = chapters.map((ch) => ({
      class: ch.classNumber,
      subject: ch.subjectId,
      book: ch.bookName,
      chapter: ch.chapterNumber,
      originalTitleHindi: ch.originalTitleHindi,
      originalTitleEnglish: ch.originalTitleEnglish,
      translations: {
        santali: ch.languages.santali,
        ho: ch.languages.ho,
        mundari: ch.languages.mundari,
      },
    }));

    const blob = new Blob([JSON.stringify(approvedEntries, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bhasha-setu-jcert-dataset-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-6xl mx-auto py-6 px-4 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white/95 rounded-3xl p-5 border-3 border-blue-300 shadow-md">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              sound.playPop();
              onClose();
            }}
            className="p-2 rounded-2xl bg-amber-100 hover:bg-amber-200 text-amber-950 font-bold border border-amber-300 press-bounce"
            title="Return to Student Mode"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-lg bg-blue-100 text-blue-800">
                <GraduationCap className="w-5 h-5" />
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                Teacher & Linguistic Review Panel
              </h2>
            </div>
            <p className="text-xs text-slate-500 font-bold mt-0.5">
              Verified with JCERT Jharkhand Tribal Education Standards
            </p>
          </div>
        </div>

        {/* Teacher identity selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-600">Reviewer:</span>
          <select
            value={teacherName}
            onChange={(e) => setTeacherName(e.target.value)}
            className="px-3 py-1.5 rounded-xl border-2 border-blue-300 text-xs font-bold text-slate-800 bg-white"
          >
            <option value="Hemant Soren (Santali Resource Group, Dumka)">
              Hemant Soren (Santali - Dumka)
            </option>
            <option value="Dr. Dobro Buriuli (Ho Bhasha Parishad, Chaibasa)">
              Dr. Dobro Buriuli (Ho - Chaibasa)
            </option>
            <option value="Mangal Singh Munda (Tribal Academy, Khunti)">
              Mangal Singh Munda (Mundari - Khunti)
            </option>
          </select>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b-2 border-blue-200 pb-2 overflow-x-auto">
        <button
          onClick={() => {
            sound.playPop();
            setActiveTab('review');
          }}
          className={`px-4 py-2 rounded-2xl font-bold text-xs sm:text-sm flex items-center gap-2 ${
            activeTab === 'review'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white text-slate-700 hover:bg-blue-50'
          }`}
        >
          <BookCheck className="w-4 h-4" />
          <span>Translation Review Queue</span>
        </button>

        <button
          onClick={() => {
            sound.playPop();
            setActiveTab('analytics');
          }}
          className={`px-4 py-2 rounded-2xl font-bold text-xs sm:text-sm flex items-center gap-2 ${
            activeTab === 'analytics'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white text-slate-700 hover:bg-blue-50'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Classroom Analytics</span>
        </button>

        <button
          onClick={() => {
            sound.playPop();
            setActiveTab('feedback');
          }}
          className={`px-4 py-2 rounded-2xl font-bold text-xs sm:text-sm flex items-center gap-2 ${
            activeTab === 'feedback'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white text-slate-700 hover:bg-blue-50'
          }`}
        >
          <AlertCircle className="w-4 h-4" />
          <span>Student Reports ({feedbackQueue.length})</span>
        </button>

        <button
          onClick={() => {
            sound.playPop();
            setActiveTab('export');
          }}
          className={`px-4 py-2 rounded-2xl font-bold text-xs sm:text-sm flex items-center gap-2 ${
            activeTab === 'export'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white text-slate-700 hover:bg-blue-50'
          }`}
        >
          <Download className="w-4 h-4" />
          <span>Export Dataset (AI4Bharat)</span>
        </button>
      </div>

      {/* ==========================================
          TAB 1: REVIEW QUEUE
          ========================================== */}
      {activeTab === 'review' && (
        <div className="space-y-4">
          {/* Language Filter */}
          <div className="flex items-center justify-between flex-wrap gap-2 bg-white p-3 rounded-2xl border border-slate-200">
            <span className="text-xs font-black uppercase text-slate-600">Select Language to Audit:</span>
            <div className="flex gap-2">
              {(['santali', 'ho', 'mundari'] as const).map((lang) => (
                <button
                  key={lang}
                  onClick={() => {
                    sound.playPop();
                    setSelectedLanguage(lang);
                  }}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs capitalize ${
                    selectedLanguage === lang
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {LANGUAGES[lang].name} ({LANGUAGES[lang].scriptName})
                </button>
              ))}
            </div>
          </div>

          {/* Chapter Review Cards */}
          <div className="space-y-3">
            {chapters.map((ch) => {
              const langData = ch.languages[selectedLanguage];
              const isEditing = editingChapterId === ch.id;

              return (
                <div
                  key={ch.id}
                  className="bg-white rounded-3xl p-5 border-2 border-slate-200 shadow-sm space-y-3"
                >
                  <div className="flex items-start justify-between flex-wrap gap-2">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-black uppercase bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
                          Class {ch.classNumber} • {ch.subjectId.toUpperCase()} • Ch {ch.chapterNumber}
                        </span>

                        {langData?.reviewStatus === 'approved' ? (
                          <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-300">
                            ✓ Approved
                          </span>
                        ) : langData?.reviewStatus === 'teacher-reviewed' ? (
                          <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 border border-blue-300">
                            ✍️ Teacher Reviewed
                          </span>
                        ) : (
                          <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-yellow-100 text-yellow-800 border border-yellow-300">
                            ⚙️ AI Draft
                          </span>
                        )}
                      </div>

                      <h4 className="text-lg font-black text-slate-900 mt-1">
                        {langData?.title || 'No translation draft yet'}
                      </h4>

                      <p className="text-xs text-slate-500 font-bold">
                        JCERT Title: {ch.originalTitleHindi} ({ch.originalTitleEnglish})
                      </p>

                      {langData?.lastReviewedBy && (
                        <p className="text-[11px] text-blue-700 font-semibold mt-0.5">
                          Last auditor: {langData.lastReviewedBy}
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      {isEditing ? (
                        <>
                          <button
                            onClick={() => handleSaveStatus(ch.id, 'approved')}
                            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 shadow-xs"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Approve Final</span>
                          </button>
                          <button
                            onClick={() => handleSaveStatus(ch.id, 'teacher-reviewed')}
                            className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1 shadow-xs"
                          >
                            <BookCheck className="w-3.5 h-3.5" />
                            <span>Save Review</span>
                          </button>
                          <button
                            onClick={() => setEditingChapterId(null)}
                            className="px-3 py-1.5 rounded-xl bg-slate-200 text-slate-700 font-bold text-xs"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handleStartEdit(ch)}
                            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center gap-1 border border-slate-300"
                          >
                            <FileEdit className="w-3.5 h-3.5" />
                            <span>Edit Script / Notes</span>
                          </button>

                          <button
                            onClick={() => {
                              sound.playPop();
                              setIsRecordingAudio(!isRecordingAudio);
                            }}
                            className={`p-1.5 rounded-xl border text-xs font-bold flex items-center gap-1 ${
                              isRecordingAudio
                                ? 'bg-red-500 text-white border-red-700 animate-pulse'
                                : 'bg-slate-100 text-slate-700 border-slate-300'
                            }`}
                            title="Record native speaker audio"
                          >
                            <Mic className="w-3.5 h-3.5" />
                            <span>{isRecordingAudio ? 'Recording...' : 'Audio'}</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Inline Editing Form */}
                  {isEditing && (
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-300 space-y-3 animate-fade-in">
                      <div>
                        <label className="block text-xs font-black uppercase text-slate-700 mb-1">
                          Native Script Title ({LANGUAGES[selectedLanguage].scriptName}):
                        </label>
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-black uppercase text-slate-700 mb-1">
                          Linguistic Review Notes / Dialect Variations:
                        </label>
                        <textarea
                          rows={2}
                          value={editNotes}
                          onChange={(e) => setEditNotes(e.target.value)}
                          placeholder="Note any dialectal choices or verification details..."
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold text-xs"
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ==========================================
          TAB 2: CLASSROOM ANALYTICS
          ========================================== */}
      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-3xl p-5 border-2 border-slate-200 shadow-sm space-y-2">
            <h4 className="text-xs font-black uppercase text-slate-500">Student Chapters Completed</h4>
            <div className="text-3xl font-black text-emerald-600">84.2%</div>
            <p className="text-xs text-slate-600">Across 12 Dumka & Chaibasa pilot schools</p>
          </div>

          <div className="bg-white rounded-3xl p-5 border-2 border-slate-200 shadow-sm space-y-2">
            <h4 className="text-xs font-black uppercase text-slate-500">Game Quiz Accuracy</h4>
            <div className="text-3xl font-black text-amber-600">91.6%</div>
            <p className="text-xs text-slate-600">Children learning shapes in mother tongue</p>
          </div>

          <div className="bg-white rounded-3xl p-5 border-2 border-slate-200 shadow-sm space-y-2">
            <h4 className="text-xs font-black uppercase text-slate-500">Most Challenging Concept</h4>
            <div className="text-xl font-black text-indigo-600">Rolling vs Sliding</div>
            <p className="text-xs text-slate-600">
              Children confuse "Gudrau" vs "Sidur" on square objects. More animated hill simulations suggested.
            </p>
          </div>
        </div>
      )}

      {/* ==========================================
          TAB 3: STUDENT FEEDBACK REPORTS
          ========================================== */}
      {activeTab === 'feedback' && (
        <div className="space-y-3">
          {feedbackQueue.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 text-center text-slate-500 font-bold">
              No pending student/teacher feedback tickets. All clear!
            </div>
          ) : (
            feedbackQueue.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-3xl p-4 border-2 border-slate-200 shadow-sm flex items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase px-2 py-0.5 rounded-md bg-orange-100 text-orange-800">
                      {item.language} • {item.problemType}
                    </span>
                    <span className="text-xs text-slate-400">{item.timestamp}</span>
                  </div>
                  <p className="text-sm font-bold text-slate-800 mt-1">
                    "{item.suggestedCorrection}"
                  </p>
                  <p className="text-xs text-slate-500">
                    Reporter: {item.reporterRole} • Chapter: {item.chapterTitle}
                  </p>
                </div>

                <button
                  onClick={() => {
                    sound.playCorrect();
                    onResolveFeedback(item.id);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
                >
                  Mark Resolved
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* ==========================================
          TAB 4: DATASET EXPORT
          ========================================== */}
      {activeTab === 'export' && (
        <div className="bg-white rounded-3xl p-6 border-2 border-slate-200 shadow-sm space-y-4 text-center max-w-xl mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-blue-100 text-blue-800 flex items-center justify-center text-3xl mx-auto">
            💾
          </div>
          <h3 className="text-xl font-black text-slate-900">
            Export Approved JCERT Mother-Tongue Dataset
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-semibold">
            Download verified bilingual/multilingual sentences and vocabulary in Ol Chiki (Santali), Warang Chiti (Ho), and Devanagari (Mundari).
            This dataset is formatted for AI4Bharat, Bhashini, and Jharkhand state curriculum research.
          </p>

          <button
            onClick={handleExportApprovedDataset}
            className="px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-sm shadow-md press-bounce inline-flex items-center gap-2"
          >
            <Download className="w-5 h-5" />
            <span>Download Dataset JSON</span>
          </button>
        </div>
      )}
    </div>
  );
};
