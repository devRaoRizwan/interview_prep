import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  QUESTIONS_DATA, 
  DAYS_ROADMAP,
  TRACKS,
  VIDEO_BASE_URL 
} from './data/questions';
import YouTubePlayer from './components/YouTubePlayer';
import { 
  Check, 
  Lock, 
  ChevronLeft, 
  ChevronRight, 
  RotateCcw, 
  ExternalLink, 
  Sparkles,
  Flame,
  Unlock,
  Clock,
  Menu,
  X,
  BookOpen,
  Code2,
  Database,
  ArrowRight
} from 'lucide-react';

const STORAGE_KEY_COMPLETED = 'backend_dev_completed_v1';
const STORAGE_KEY_NOTES = 'backend_dev_notes_v1';
const STORAGE_KEY_LAST_ID = 'backend_dev_last_id_v1';
const STORAGE_KEY_STRICT_LOCK = 'backend_dev_strict_lock_v1';
const STORAGE_KEY_TRACK = 'backend_dev_active_track_v1';

export default function App() {
  // Completed questions map { [id]: boolean }
  const [completedMap, setCompletedMap] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_COMPLETED);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Notes map { [id]: string }
  const [notesMap, setNotesMap] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_NOTES);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Strict lock progression (enabled by default)
  const [strictLock, setStrictLock] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_STRICT_LOCK);
      return saved !== null ? saved === 'true' : true;
    } catch {
      return true;
    }
  });

  // Active question ID
  const [activeQuestionId, setActiveQuestionId] = useState(() => {
    try {
      const savedId = localStorage.getItem(STORAGE_KEY_LAST_ID);
      if (savedId && QUESTIONS_DATA.some((q) => q.id === Number(savedId))) {
        return Number(savedId);
      }
    } catch {
      // ignore
    }
    return 1;
  });

  const [activeTrack, setActiveTrack] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_TRACK);
      return saved || 'django';
    } catch {
      return 'django';
    }
  });

  const [loopMode, setLoopMode] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [currentNote, setCurrentNote] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Persist states
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_TRACK, activeTrack);
    } catch (e) {
      console.warn(e);
    }
  }, [activeTrack]);
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_COMPLETED, JSON.stringify(completedMap));
    } catch (e) {
      console.warn(e);
    }
  }, [completedMap]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_NOTES, JSON.stringify(notesMap));
    } catch (e) {
      console.warn(e);
    }
  }, [notesMap]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_LAST_ID, activeQuestionId.toString());
    } catch (e) {
      console.warn(e);
    }
  }, [activeQuestionId]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_STRICT_LOCK, strictLock.toString());
    } catch (e) {
      console.warn(e);
    }
  }, [strictLock]);

  // Sync current note
  useEffect(() => {
    setCurrentNote(notesMap[activeQuestionId] || '');
  }, [activeQuestionId, notesMap]);

  // Is question unlocked?
  const isQuestionUnlocked = useCallback((id) => {
    if (!strictLock) return true;
    if (id === 1) return true;
    return !!completedMap[id] || !!completedMap[id - 1];
  }, [strictLock, completedMap]);

  // Active Question Object
  const currentQuestion = useMemo(() => {
    return QUESTIONS_DATA.find((q) => q.id === activeQuestionId) || QUESTIONS_DATA[0];
  }, [activeQuestionId]);

  // Current Day info
  const currentDayInfo = useMemo(() => {
    return DAYS_ROADMAP.find((d) => d.day === currentQuestion.day) || DAYS_ROADMAP[0];
  }, [currentQuestion.day]);

  // Questions in current day
  const questionsInCurrentDay = useMemo(() => {
    return QUESTIONS_DATA.filter((q) => q.day === currentQuestion.day);
  }, [currentQuestion.day]);

  // Toggle completion
  const handleToggleComplete = useCallback((id) => {
    const isNowDone = !completedMap[id];
    setCompletedMap((prev) => ({
      ...prev,
      [id]: isNowDone
    }));

    // If completed and next question exists, automatically advance after brief pause
    if (isNowDone && id < QUESTIONS_DATA.length) {
      setTimeout(() => {
        setActiveQuestionId(id + 1);
      }, 350);
    }
  }, [completedMap]);

  // Save note
  const handleSaveNote = () => {
    if (currentNote !== (notesMap[activeQuestionId] || '')) {
      setNotesMap((prev) => ({
        ...prev,
        [activeQuestionId]: currentNote
      }));
    }
  };

  // Reset progress
  const handleReset = () => {
    if (window.confirm('Reset all completed progress and lock future questions again?')) {
      setCompletedMap({});
      setActiveQuestionId(1);
    }
  };

  // Overall statistics
  const completedCount = Object.values(completedMap).filter(Boolean).length;
  const totalCount = QUESTIONS_DATA.length;
  const overallPercent = Math.round((completedCount / totalCount) * 100);

  // Day statistics
  const completedInCurrentDay = questionsInCurrentDay.filter((q) => !!completedMap[q.id]).length;
  const dayPercent = Math.round((completedInCurrentDay / questionsInCurrentDay.length) * 100);

  const isCurrentCompleted = !!completedMap[currentQuestion.id];
  const hasPrevious = currentQuestion.id > 1;
  const hasNext = currentQuestion.id < QUESTIONS_DATA.length;
  const isNextUnlocked = hasNext && isQuestionUnlocked(currentQuestion.id + 1);

  // Select a day
  const handleSelectDay = (dayNum) => {
    const dayQuestions = QUESTIONS_DATA.filter((q) => q.day === dayNum);
    const firstUnfinished = dayQuestions.find((q) => isQuestionUnlocked(q.id) && !completedMap[q.id]);
    const target = firstUnfinished || dayQuestions[0];
    setActiveQuestionId(target.id);
    setMobileMenuOpen(false);
  };

  return (
    <div className="w-full min-h-screen bg-page flex flex-col lg:grid lg:grid-cols-[284px_minmax(0,1fr)] max-w-[1600px] mx-auto text-ink">
      
      {/* DESKTOP SIDEBAR (comback2026 style) */}
      <aside className="hidden lg:flex flex-col justify-between border-r border-line bg-sidebar p-6 h-screen sticky top-0 overflow-y-auto">
        <div className="space-y-5">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-ink text-white font-heading font-extrabold text-base flex items-center justify-center shadow-subtle flex-shrink-0">
              BD
            </div>
            <div>
              <strong className="block font-heading font-extrabold text-sm tracking-tight text-ink">
                Backend Dev Journey
              </strong>
              <small className="block text-muted text-[11px] font-medium">
                10-Day Plan • 5 Questions/Day
              </small>
            </div>
          </div>

          {/* Learning Tracks Switcher */}
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-muted mb-1.5 px-0.5">
              BACKEND TRACKS
            </p>
            <div className="grid grid-cols-3 gap-1 p-1 bg-paper-muted border border-line rounded-xl">
              {TRACKS.map((t) => {
                const isCurrent = activeTrack === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setActiveTrack(t.id)}
                    className={`py-1.5 px-1 rounded-lg text-xs font-bold transition-all text-center flex flex-col items-center gap-0.5 ${
                      isCurrent
                        ? 'comback-primary-btn shadow-subtle'
                        : 'text-muted hover:text-ink hover:bg-white/60'
                    }`}
                  >
                    <span className="text-sm leading-none">{t.icon}</span>
                    <span className="text-[11px] truncate w-full">{t.shortName}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Roadmap Card (comback2026 journey-card) */}
          <section className="comback-card p-4">
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-muted m-0">
              YOUR 10-DAY ROADMAP
            </p>
            <strong className="block my-2 font-heading font-bold text-sm text-ink">
              {completedCount} of {totalCount} Questions Mastered
            </strong>
            <div className="w-full h-1.5 bg-[#e7e7ec] rounded-full overflow-hidden mb-2">
              <div 
                className="h-full comback-progress-fill"
                style={{ width: `${overallPercent}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-muted font-medium">
              <span>{overallPercent}% completed</span>
              <span className="font-semibold text-ink">{totalCount - completedCount} left</span>
            </div>
          </section>

          {/* Day Navigation List (comback2026 week-list) */}
          <nav className="space-y-1.5" aria-label="10 Day Schedule">
            {DAYS_ROADMAP.map((d) => {
              const dayQuestions = QUESTIONS_DATA.filter((q) => q.day === d.day);
              const dayDoneCount = dayQuestions.filter((q) => !!completedMap[q.id]).length;
              const isDayActive = currentQuestion.day === d.day;
              const isDayComplete = dayDoneCount === dayQuestions.length;
              const isDayUnlocked = isQuestionUnlocked(dayQuestions[0].id);

              return (
                <button
                  key={d.day}
                  type="button"
                  onClick={() => handleSelectDay(d.day)}
                  className={`w-full text-left p-2.5 rounded-xl border flex items-center gap-2.5 transition-all ${
                    isDayActive
                      ? 'border-line-strong bg-paper-muted shadow-subtle'
                      : isDayComplete
                      ? 'border-signal-border bg-signal-pale/50 hover:border-signal hover:bg-signal-pale'
                      : 'border-line bg-white hover:border-line-strong hover:bg-paper-muted'
                  }`}
                >
                  <div className={`w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center font-heading font-bold text-[11px] ${
                    isDayActive 
                      ? 'bg-ink text-white shadow-subtle' 
                      : isDayComplete 
                      ? 'bg-signal-ink text-white' 
                      : 'bg-paper-muted text-muted'
                  }`}>
                    {isDayComplete ? <Check className="w-3.5 h-3.5 stroke-[2.5]" /> : `D${d.day}`}
                  </div>

                  <div className="min-w-0 flex-1">
                    <strong className={`block text-xs font-bold font-heading truncate ${
                      isDayComplete ? 'text-signal-ink' : 'text-ink'
                    }`}>
                      Day {d.day}: {d.title}
                    </strong>
                    <small className="block text-[10px] text-muted truncate mt-0.5 font-medium">
                      {dayDoneCount}/{dayQuestions.length} completed
                    </small>
                  </div>

                  {!isDayUnlocked && (
                    <Lock className="w-3.5 h-3.5 text-muted/50 flex-shrink-0" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer Controls */}
        <div className="pt-4 border-t border-line space-y-2">
          {/* Lock mode toggle */}
          <button
            type="button"
            onClick={() => setStrictLock(!strictLock)}
            className="w-full text-left px-3 py-2 rounded-lg border border-line-strong bg-white text-xs text-muted hover:text-ink hover:border-ink flex items-center justify-between transition-colors shadow-subtle"
          >
            <span className="flex items-center gap-1.5 font-bold">
              {strictLock ? <Lock className="w-3.5 h-3.5 text-ink" /> : <Unlock className="w-3.5 h-3.5 text-signal-ink" />}
              <span>Strict Progression</span>
            </span>
            <span className={`font-mono text-[10px] font-bold px-1.5 py-0.5 rounded ${strictLock ? 'bg-paper-muted text-ink' : 'bg-signal-pale text-signal-ink'}`}>
              {strictLock ? 'LOCKED' : 'FREE'}
            </span>
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="w-full text-left px-3 py-1.5 text-xs text-muted hover:text-red-600 transition-colors flex items-center gap-1.5"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset progress</span>
          </button>
        </div>
      </aside>

      {/* MOBILE DRAWER / MODAL */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex justify-start">
          <div className="w-[85%] max-w-xs bg-white h-full p-5 overflow-y-auto flex flex-col justify-between shadow-2xl border-r border-line animate-in slide-in-from-left duration-200">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-line">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-ink text-white font-heading font-extrabold text-sm flex items-center justify-center">
                    BD
                  </div>
                  <strong className="font-heading font-extrabold text-sm">Backend Dev Journey</strong>
                </div>
                <button 
                  type="button" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 rounded-lg hover:bg-paper-muted text-muted"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Tracks Switcher */}
              <div className="grid grid-cols-3 gap-1 p-1 bg-paper-muted border border-line rounded-xl">
                {TRACKS.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      setActiveTrack(t.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`py-1.5 px-1 rounded-lg text-xs font-bold transition-all text-center flex flex-col items-center gap-0.5 ${
                      activeTrack === t.id
                        ? 'comback-primary-btn shadow-subtle'
                        : 'text-muted hover:text-ink'
                    }`}
                  >
                    <span className="text-sm leading-none">{t.icon}</span>
                    <span className="text-[11px] truncate w-full">{t.shortName}</span>
                  </button>
                ))}
              </div>

              {/* Progress summary */}
              <div className="comback-card p-3">
                <p className="text-[10px] font-extrabold uppercase text-muted m-0">OVERALL PROGRESS</p>
                <div className="my-1 text-sm font-bold">{completedCount} of {totalCount} Mastered ({overallPercent}%)</div>
                <div className="w-full h-1.5 bg-[#e7e7ec] rounded-full overflow-hidden">
                  <div className="h-full comback-progress-fill" style={{ width: `${overallPercent}%` }} />
                </div>
              </div>

              {/* Days list */}
              <div className="space-y-1.5">
                {DAYS_ROADMAP.map((d) => {
                  const dayQuestions = QUESTIONS_DATA.filter((q) => q.day === d.day);
                  const done = dayQuestions.filter((q) => !!completedMap[q.id]).length;
                  const isDayActive = currentQuestion.day === d.day;
                  const isDayUnlocked = isQuestionUnlocked(dayQuestions[0].id);

                  return (
                    <button
                      key={d.day}
                      type="button"
                      onClick={() => handleSelectDay(d.day)}
                      className={`w-full text-left p-2.5 rounded-xl border flex items-center gap-2.5 text-xs ${
                        isDayActive ? 'border-ink bg-paper-muted font-bold' : 'border-line bg-white'
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-md flex items-center justify-center font-bold text-[10px] ${
                        isDayActive ? 'bg-ink text-white' : 'bg-paper-muted text-muted'
                      }`}>
                        {done === dayQuestions.length ? '✓' : `D${d.day}`}
                      </div>
                      <div className="flex-1 truncate">Day {d.day}: {d.title}</div>
                      {!isDayUnlocked && <Lock className="w-3 h-3 text-muted/50" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-4 border-t border-line">
              <button
                type="button"
                onClick={handleReset}
                className="w-full text-left text-xs text-muted hover:text-red-600 flex items-center gap-1.5"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset all progress</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MAIN FOCUSED CONTENT AREA */}
      <main className="min-w-0 flex flex-col bg-page">
        
        {/* Topbar: Mobile Brand Header & Desktop Day Stepper */}
        <header className="p-4 sm:px-8 border-b border-line bg-white sticky top-0 z-20">
          
          {/* Mobile Top Strip */}
          <div className="lg:hidden flex items-center justify-between gap-3 mb-3 pb-2.5 border-b border-line">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="comback-button h-8 px-2.5 flex items-center gap-1.5 text-xs"
            >
              <Menu className="w-4 h-4" />
              <span>10-Day Plan</span>
            </button>

            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-muted block">Mastered</span>
              <span className="text-xs font-bold font-mono text-ink">{completedCount}/{totalCount} ({overallPercent}%)</span>
            </div>
          </div>

          {/* Desktop Heading Strip */}
          {activeTrack === 'django' ? (
            <>
              <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                <div>
                  <p className="text-[10px] font-extrabold uppercase tracking-widest text-muted m-0">
                    BACKEND DEV JOURNEY • DJANGO TRACK (10 DAYS)
                  </p>
                  <h1 className="m-0 mt-0.5 font-heading font-extrabold text-xl sm:text-2xl text-ink tracking-tight">
                    Day {currentDayInfo.day}: {currentDayInfo.title}
                  </h1>
                </div>

                <div className="flex items-center gap-2">
                  <div className="px-3 py-1.5 rounded-lg border border-line bg-paper-muted text-xs flex items-center gap-2 shadow-subtle">
                    <span className="font-bold text-ink">Day Progress:</span>
                    <span className="font-mono text-muted">{completedInCurrentDay}/{questionsInCurrentDay.length} ({dayPercent}%)</span>
                  </div>
                </div>
              </div>

              {/* 10-Days Horizontal Chips (comback2026 date-chips style) */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 no-scrollbar">
                {DAYS_ROADMAP.map((d) => {
                  const dayQuestions = QUESTIONS_DATA.filter((q) => q.day === d.day);
                  const done = dayQuestions.filter((q) => !!completedMap[q.id]).length;
                  const isSelected = currentQuestion.day === d.day;
                  const isComplete = done === dayQuestions.length;
                  const isUnlocked = isQuestionUnlocked(dayQuestions[0].id);

                  return (
                    <button
                      key={d.day}
                      type="button"
                      onClick={() => handleSelectDay(d.day)}
                      className={`flex-shrink-0 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all flex items-center gap-1.5 ${
                        isSelected
                          ? 'comback-primary-btn'
                          : isComplete
                          ? 'comback-completed-btn'
                          : !isUnlocked
                          ? 'border-line bg-paper-muted text-muted/50 cursor-not-allowed opacity-75'
                          : 'comback-button'
                      }`}
                    >
                      <span>Day {d.day}</span>
                      {isComplete ? (
                        <Check className={`w-3 h-3 stroke-[2.5] ${isSelected ? 'text-white' : 'text-signal-ink'}`} />
                      ) : !isUnlocked ? (
                        <Lock className="w-2.5 h-2.5 opacity-60" />
                      ) : (
                        <span className={`text-[10px] font-mono ${isSelected ? 'text-white/80' : 'text-muted'}`}>
                          {done}/{dayQuestions.length}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Question Step Pills in Current Day */}
              <div className="mt-2.5 pt-2.5 border-t border-line flex items-center gap-2 overflow-x-auto no-scrollbar">
                <span className="text-[11px] font-bold text-muted uppercase tracking-wider flex-shrink-0">
                  Day {currentQuestion.day} Questions:
                </span>
                <div className="flex items-center gap-1.5">
                  {questionsInCurrentDay.map((q, idx) => {
                    const isSelected = currentQuestion.id === q.id;
                    const isDone = !!completedMap[q.id];
                    const isUnlocked = isQuestionUnlocked(q.id);

                    return (
                      <button
                        key={q.id}
                        type="button"
                        disabled={!isUnlocked}
                        onClick={() => setActiveQuestionId(q.id)}
                        className={`h-7 px-2.5 rounded-lg border text-xs font-heading font-bold transition-all flex items-center gap-1.5 ${
                          isSelected
                            ? 'comback-primary-btn'
                            : isDone
                            ? 'comback-completed-btn'
                            : !isUnlocked
                            ? 'border-line bg-paper-muted text-muted/40 cursor-not-allowed'
                            : 'comback-button'
                        }`}
                      >
                        {isDone ? (
                          <Check className={`w-3 h-3 stroke-[2.5] ${isSelected ? 'text-white' : 'text-signal-ink'}`} />
                        ) : !isUnlocked ? (
                          <Lock className="w-2.5 h-2.5 opacity-40" />
                        ) : (
                          <span>Q{idx + 1}</span>
                        )}
                        <span className="text-[11px] opacity-80">Q#{q.id}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-muted m-0">
                  BACKEND DEV JOURNEY • {activeTrack.toUpperCase()} TRACK
                </p>
                <h1 className="m-0 mt-0.5 font-heading font-extrabold text-xl sm:text-2xl text-ink tracking-tight">
                  {activeTrack === 'python' ? 'Python Core & Advanced Roadmap' : 'SQL & Database Systems Roadmap'}
                </h1>
              </div>
              <button
                type="button"
                onClick={() => setActiveTrack('django')}
                className="comback-button h-8 px-3 text-xs flex items-center gap-1.5 font-bold"
              >
                <span>← Back to Django Track</span>
              </button>
            </div>
          )}
        </header>

        {/* TRACK VIEW */}
        {activeTrack !== 'django' ? (
          <div className="p-4 sm:p-8 max-w-4xl mx-auto w-full space-y-6">
            <section className="comback-card p-6 sm:p-8 space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-paper-muted border border-line flex items-center justify-center text-2xl shadow-subtle flex-shrink-0">
                  {activeTrack === 'python' ? '🐍' : '🗄️'}
                </div>
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-signal-ink bg-signal-pale border border-signal-border px-2 py-0.5 rounded">
                    PLANNED TRACK
                  </span>
                  <h2 className="m-0 mt-1.5 font-heading font-extrabold text-2xl text-ink tracking-tight">
                    {activeTrack === 'python' ? 'Python Core & Advanced Track' : 'SQL & Database Systems Track'}
                  </h2>
                  <p className="m-0 mt-1 text-xs text-muted">
                    {activeTrack === 'python' 
                      ? 'Structured questions and deep-dive interview topics for Python backend developers.' 
                      : 'Relational database questions, indexing, query optimization, and schema design.'}
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-line bg-white shadow-subtle space-y-3">
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-muted m-0">
                  10-DAY CURRICULUM SYLLABUS
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {activeTrack === 'python' ? (
                    <>
                      <div className="p-3 rounded-lg border border-line bg-paper-muted">
                        <strong className="block text-ink font-heading font-bold">Days 1–3: Core & OOP</strong>
                        <p className="text-muted mt-0.5">Mutable vs immutable, dunder methods, MRO, inheritance, and properties.</p>
                      </div>
                      <div className="p-3 rounded-lg border border-line bg-paper-muted">
                        <strong className="block text-ink font-heading font-bold">Days 4–6: Memory & Iterators</strong>
                        <p className="text-muted mt-0.5">Generators, iterators, garbage collection, reference counting, and weakrefs.</p>
                      </div>
                      <div className="p-3 rounded-lg border border-line bg-paper-muted">
                        <strong className="block text-ink font-heading font-bold">Days 7–8: GIL & Concurrency</strong>
                        <p className="text-muted mt-0.5">Global Interpreter Lock, multiprocessing, threading, and asyncio event loops.</p>
                      </div>
                      <div className="p-3 rounded-lg border border-line bg-paper-muted">
                        <strong className="block text-ink font-heading font-bold">Days 9–10: Metaprogramming</strong>
                        <p className="text-muted mt-0.5">Decorators with arguments, metaclasses, context managers, and type hints.</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="p-3 rounded-lg border border-line bg-paper-muted">
                        <strong className="block text-ink font-heading font-bold">Days 1–3: Queries & Aggregations</strong>
                        <p className="text-muted mt-0.5">Complex SELECT, HAVING vs WHERE, GROUP BY, and aggregate functions.</p>
                      </div>
                      <div className="p-3 rounded-lg border border-line bg-paper-muted">
                        <strong className="block text-ink font-heading font-bold">Days 4–6: Joins & Window Functions</strong>
                        <p className="text-muted mt-0.5">INNER, LEFT, RIGHT, FULL OUTER joins, CTEs, ROW_NUMBER, and RANK.</p>
                      </div>
                      <div className="p-3 rounded-lg border border-line bg-paper-muted">
                        <strong className="block text-ink font-heading font-bold">Days 7–8: Indexing & Performance</strong>
                        <p className="text-muted mt-0.5">B-Trees vs Hash indexes, composite indexes, EXPLAIN ANALYZE, and query optimization.</p>
                      </div>
                      <div className="p-3 rounded-lg border border-line bg-paper-muted">
                        <strong className="block text-ink font-heading font-bold">Days 9–10: Transactions & ACID</strong>
                        <p className="text-muted mt-0.5">ACID properties, isolation levels (dirty reads, phantom reads), locks, and deadlocks.</p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="pt-2 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => setActiveTrack('django')}
                  className="comback-primary-btn px-4 py-2.5 text-xs flex items-center gap-2"
                >
                  <span>Practice Django Track (54 Questions Ready)</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </section>
          </div>
        ) : (
        /* FOCUSED SINGLE VIDEO STATION CONTAINER */
        <div className="p-4 sm:p-8 max-w-4xl mx-auto w-full space-y-6">
          
          {/* Main Card (comback-card style with clean borders) */}
          <section className="comback-card overflow-hidden">
            
            {/* Question Header */}
            <div className="p-5 sm:p-6 pb-4 border-b border-line">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-muted">
                  DAY {currentQuestion.day} • QUESTION {currentQuestion.dayIndex} OF {questionsInCurrentDay.length} • Q#{currentQuestion.id}
                </span>

                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 text-xs font-mono text-muted bg-paper-muted px-2.5 py-0.5 rounded-md border border-line shadow-subtle">
                    <Clock className="w-3.5 h-3.5 text-muted" />
                    {currentQuestion.startTime} — {currentQuestion.endTime} ({currentQuestion.endSeconds - currentQuestion.startSeconds}s)
                  </span>

                  {isCurrentCompleted ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-signal-ink bg-signal-pale border border-signal-border px-2.5 py-0.5 rounded-md">
                      <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                      Mastered
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-muted bg-paper-muted border border-line px-2 py-0.5 rounded-md">
                      Pending
                    </span>
                  )}
                </div>
              </div>

              <h2 className="m-0 font-heading font-extrabold text-xl sm:text-2xl text-ink tracking-tight leading-snug">
                {currentQuestion.title}
              </h2>
            </div>

            {/* Video Player: ONLY plays this particular question part */}
            <div className="p-4 sm:p-6 pb-3">
              <YouTubePlayer
                currentQuestion={currentQuestion}
                loopMode={loopMode}
                setLoopMode={setLoopMode}
                onSegmentEnd={() => {}}
              />
            </div>

            {/* PRIMARY COMPLETION CHECKBOX BUTTON (Clean, bold action) */}
            <div className="px-4 sm:px-6 py-4 bg-paper-muted border-t border-b border-line flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => handleToggleComplete(currentQuestion.id)}
                className={`w-full sm:w-auto px-5 py-2.5 text-sm flex items-center justify-center gap-2.5 ${
                  isCurrentCompleted
                    ? 'comback-completed-btn'
                    : 'comback-primary-btn'
                }`}
              >
                <div className={`w-5 h-5 rounded-md border flex items-center justify-center ${
                  isCurrentCompleted 
                    ? 'border-signal-border bg-signal-ink text-white' 
                    : 'border-white/40 bg-white/10 text-white'
                }`}>
                  {isCurrentCompleted && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
                <span>
                  {isCurrentCompleted 
                    ? '✓ Mastered! Click to Mark Incomplete' 
                    : 'Mark as Done & Unlock Next Question →'}
                </span>
              </button>

              <div className="text-xs text-muted font-medium">
                {isNextUnlocked && hasNext && (
                  <span className="text-signal-ink font-bold">✓ Question #{currentQuestion.id + 1} unlocked</span>
                )}
              </div>
            </div>

            {/* CONCEPT SUMMARY & QUICK RECALL */}
            <div className="p-5 sm:p-6 space-y-4">
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-muted mb-1.5">
                  CORE INTERVIEW TAKEAWAY
                </p>
                <p className="text-sm text-ink/90 leading-relaxed font-sans">
                  {currentQuestion.summary}
                </p>
              </div>

              {currentQuestion.tip && (
                <div className="p-3.5 rounded-xl border border-line bg-white text-xs text-ink flex items-start gap-2.5 shadow-subtle">
                  <span className="font-bold text-[10px] uppercase tracking-wide px-2 py-0.5 rounded border border-line-strong bg-paper-muted text-ink flex-shrink-0">
                    QUICK RECALL
                  </span>
                  <span className="font-mono text-xs text-ink/90">{currentQuestion.tip}</span>
                </div>
              )}

              {/* CURATED ARTICLES & IN-DEPTH STUDY LINKS */}
              <div className="pt-2">
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-muted mb-2.5">
                  IN-DEPTH READING & OFFICIAL DOCUMENTATION
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {currentQuestion.articles.map((art, idx) => (
                    <a
                      key={idx}
                      href={art.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="comback-button p-3.5 flex items-start justify-between gap-3 text-left group"
                    >
                      <div className="min-w-0">
                        <span className="text-[10px] font-extrabold text-muted uppercase tracking-wider block">
                          {art.source}
                        </span>
                        <strong className="text-xs font-bold font-heading text-ink group-hover:text-ink block mt-1 line-clamp-1">
                          {art.title}
                        </strong>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 text-muted group-hover:text-ink flex-shrink-0 mt-1" />
                    </a>
                  ))}
                </div>
              </div>

              {/* PERSONAL STUDY NOTES */}
              <div className="pt-2 border-t border-line">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] font-extrabold uppercase tracking-widest text-muted">
                    YOUR INTERVIEW NOTES
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowNotes(!showNotes)}
                    className="text-xs text-muted hover:text-ink font-bold"
                  >
                    {showNotes ? 'Collapse' : currentNote ? 'Edit Notes' : '+ Add Notes'}
                  </button>
                </div>

                {showNotes ? (
                  <div className="space-y-2">
                    <textarea
                      value={currentNote}
                      onChange={(e) => setCurrentNote(e.target.value)}
                      onBlur={handleSaveNote}
                      placeholder="Write your explanation, syntax reminders, or interview answers here..."
                      rows={3}
                      className="w-full text-xs font-sans bg-white border border-line-strong rounded-xl p-3 text-ink focus:outline-none focus:border-ink transition-colors placeholder:text-muted resize-y shadow-subtle"
                    />
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={handleSaveNote}
                        className="comback-button px-3.5 py-1 text-xs font-bold"
                      >
                        Save Note
                      </button>
                    </div>
                  </div>
                ) : (
                  currentNote && (
                    <div 
                      onClick={() => setShowNotes(true)}
                      className="p-3 rounded-xl border border-line bg-paper-muted text-xs text-ink/80 italic cursor-pointer hover:border-line-strong transition-colors"
                    >
                      "{currentNote}"
                    </div>
                  )
                )}
              </div>
            </div>

            {/* PREV / NEXT NAVIGATION FOOTER */}
            <div className="px-5 sm:px-6 py-4 bg-paper-muted border-t border-line flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => hasPrevious && setActiveQuestionId(currentQuestion.id - 1)}
                disabled={!hasPrevious}
                className="comback-button px-3.5 py-2 text-xs flex items-center gap-1.5"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous Question</span>
              </button>

              <span className="text-xs text-muted font-medium">
                Question {currentQuestion.id} of {totalCount}
              </span>

              <button
                type="button"
                onClick={() => hasNext && isNextUnlocked && setActiveQuestionId(currentQuestion.id + 1)}
                disabled={!hasNext || !isNextUnlocked}
                className={`px-3.5 py-2 text-xs flex items-center gap-1.5 ${
                  !isNextUnlocked && hasNext 
                    ? 'comback-button opacity-50 cursor-not-allowed' 
                    : 'comback-primary-btn'
                }`}
              >
                <span>Next Question</span>
                {!isNextUnlocked && hasNext ? (
                  <Lock className="w-3.5 h-3.5" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </button>
            </div>
          </section>

          {/* Motivational Habit Card */}
          <div className="comback-card p-4 text-xs text-muted flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-paper-muted border border-line flex items-center justify-center flex-shrink-0">
                <Flame className="w-4 h-4 text-ink" />
              </div>
              <span className="leading-snug">
                <strong className="text-ink">Daily Habit:</strong> Master 5 questions each day. You'll complete all 54 questions in exactly 10 days!
              </span>
            </div>
            <span className="text-ink font-bold font-mono text-xs flex-shrink-0">Day {currentQuestion.day}/10</span>
          </div>

        </div>
        )}

        {/* Minimal Clean Footer */}
        <footer className="mt-auto px-6 py-4 border-t border-line bg-white text-center text-xs text-muted">
          Progress and notes are saved automatically in your browser's local storage.
        </footer>

      </main>
    </div>
  );
}
