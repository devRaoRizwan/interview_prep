import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  TRACKS_DATA,
  TRACKS
} from './data/questions';
import YouTubePlayer from './components/YouTubePlayer';
import CodeBlock from './components/CodeBlock';
import { 
  Check, 
  Lock, 
  ChevronLeft, 
  ChevronRight, 
  RotateCcw, 
  ExternalLink, 
  Clock, 
  Flame,
  FileText,
  Unlock,
  Terminal
} from 'lucide-react';

// Formatted summary with highlighted code tokens
function FormattedSummary({ text }) {
  if (!text) return null;

  const codeTokenRegex = /(`[^`]+`|\b(?:python|pip|django-admin|manage\.py|makemigrations|migrate|createsuperuser|inspectdb|collectstatic|runserver|select_related|prefetch_related|filter|get|all|create|save|update|delete|union|__init__|__new__|__mro__|__iter__|__next__|__enter__|__exit__|__add__|__sub__|self|super|yield|lambda|def|class|import|from|with|try|except|finally|break|continue|pass|PYTHONPATH|GIL|args|kwargs|\*args|\*\*kwargs|read|write|open|close|pickle|dump|dumps|load|loads|copy|deepcopy|keys|items|values|split|range|xrange|join)\b(?:\([^)]*\))?|\[:[^:]*:?[^\]]*\]|\[\]|\{\})/g;

  const parts = text.split(codeTokenRegex);

  return (
    <span className="leading-relaxed">
      {parts.map((part, i) => {
        if (!part) return null;
        if (part.match(codeTokenRegex)) {
          const displayToken = part.startsWith('`') && part.endsWith('`') ? part.slice(1, -1) : part;
          return (
            <code 
              key={i} 
              className="inline-block font-mono text-[11px] sm:text-xs px-1.5 py-0.5 mx-0.5 rounded-md bg-zinc-900 text-amber-300 font-semibold border border-zinc-700/80 shadow-xs"
            >
              {displayToken}
            </code>
          );
        }
        return part;
      })}
    </span>
  );
}

// Format seconds into clean readable duration (e.g. 36s or 1m 24s)
function formatDuration(seconds) {
  if (!seconds || seconds <= 0) return '0s';
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return s > 0 ? `${m}m ${s}s` : `${m}m`;
}

// Extract concise topic title for question chips
function getShortQuestionTitle(question) {
  if (!question) return '';
  let title = question.title || '';
  let clean = title
    .replace(/^What is the command (to|for) /i, '')
    .replace(/^What is the Command To /i, '')
    .replace(/^What is the difference between /i, '')
    .replace(/^Difference Between /i, '')
    .replace(/^Difference between /i, '')
    .replace(/^How to /i, '')
    .replace(/^Explain /i, '')
    .replace(/^What is a /i, '')
    .replace(/^What is the /i, '')
    .replace(/^What is /i, '')
    .replace(/^What are /i, '')
    .replace(/^What do you mean by (the )?/i, '')
    .replace(/^Which is the /i, '')
    .replace(/^Which /i, '')
    .replace(/ in Django\??$/i, '')
    .replace(/ in Python\??$/i, '')
    .replace(/ using Django QuerySet\??$/i, '')
    .replace(/\?$/, '')
    .trim();

  if (clean.length > 50) {
    clean = clean.slice(0, 48) + '…';
  }
  return clean ? clean.charAt(0).toUpperCase() + clean.slice(1) : (question.tags?.[0] || 'Question');
}

const STORAGE_PREFIX = 'backend_dev_v5_';

export default function App() {
  // Active track: 'django' or 'python'
  const [activeTrack, setActiveTrack] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_PREFIX + 'track');
      return saved && TRACKS_DATA[saved] ? saved : 'django';
    } catch {
      return 'django';
    }
  });

  // Track Data
  const currentTrack = TRACKS_DATA[activeTrack] || TRACKS_DATA.django;

  // Active question ID per track
  const [activeQuestionId, setActiveQuestionId] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_PREFIX + 'qid_' + activeTrack);
      if (saved && currentTrack.questions.some((q) => q.id === Number(saved))) {
        return Number(saved);
      }
    } catch {
      // ignore
    }
    return 1;
  });

  // Completed map { [track_id_qid]: boolean }
  const [completedMap, setCompletedMap] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_PREFIX + 'completed');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Notes map { [track_id_qid]: string }
  const [notesMap, setNotesMap] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_PREFIX + 'notes');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Strict lock mode
  const [strictLock, setStrictLock] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_PREFIX + 'strict_lock');
      return saved !== null ? saved === 'true' : true;
    } catch {
      return true;
    }
  });

  const [loopMode, setLoopMode] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [currentNote, setCurrentNote] = useState('');

  // Persist states
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_PREFIX + 'track', activeTrack);
    } catch (e) {
      console.warn(e);
    }
  }, [activeTrack]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_PREFIX + 'completed', JSON.stringify(completedMap));
    } catch (e) {
      console.warn(e);
    }
  }, [completedMap]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_PREFIX + 'notes', JSON.stringify(notesMap));
    } catch (e) {
      console.warn(e);
    }
  }, [notesMap]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_PREFIX + 'qid_' + activeTrack, activeQuestionId.toString());
    } catch (e) {
      console.warn(e);
    }
  }, [activeQuestionId, activeTrack]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_PREFIX + 'strict_lock', strictLock.toString());
    } catch (e) {
      console.warn(e);
    }
  }, [strictLock]);

  // Handle track switch
  const handleSwitchTrack = (trackId) => {
    setActiveTrack(trackId);
    try {
      const savedQid = localStorage.getItem(STORAGE_PREFIX + 'qid_' + trackId);
      const targetTrack = TRACKS_DATA[trackId];
      if (savedQid && targetTrack.questions.some((q) => q.id === Number(savedQid))) {
        setActiveQuestionId(Number(savedQid));
      } else {
        setActiveQuestionId(1);
      }
    } catch {
      setActiveQuestionId(1);
    }
  };

  const getQuestionKey = useCallback((trackId, qId) => `${trackId}_${qId}`, []);

  // Sync note
  useEffect(() => {
    setCurrentNote(notesMap[getQuestionKey(activeTrack, activeQuestionId)] || '');
  }, [activeTrack, activeQuestionId, notesMap, getQuestionKey]);

  // Is question unlocked?
  const isQuestionUnlocked = useCallback((qId) => {
    if (!strictLock) return true;
    if (qId === 1) return true;
    const currentDone = !!completedMap[getQuestionKey(activeTrack, qId)];
    const prevDone = !!completedMap[getQuestionKey(activeTrack, qId - 1)];
    return currentDone || prevDone;
  }, [strictLock, completedMap, activeTrack, getQuestionKey]);

  // Active Question Object
  const currentQuestion = useMemo(() => {
    return currentTrack.questions.find((q) => q.id === activeQuestionId) || currentTrack.questions[0];
  }, [currentTrack, activeQuestionId]);

  // Current Day info
  const currentDayInfo = useMemo(() => {
    return currentTrack.days.find((d) => d.day === currentQuestion.day) || currentTrack.days[0];
  }, [currentTrack, currentQuestion.day]);

  // Questions in current day
  const questionsInCurrentDay = useMemo(() => {
    return currentTrack.questions.filter((q) => q.day === currentQuestion.day);
  }, [currentTrack, currentQuestion.day]);

  // Toggle completion
  const handleToggleComplete = useCallback((id) => {
    const key = getQuestionKey(activeTrack, id);
    const isNowDone = !completedMap[key];
    setCompletedMap((prev) => ({
      ...prev,
      [key]: isNowDone
    }));

    // If marked done, unlock and automatically advance to next question
    if (isNowDone && id < currentTrack.questions.length) {
      setTimeout(() => {
        setActiveQuestionId(id + 1);
      }, 350);
    }
  }, [activeTrack, completedMap, currentTrack.questions.length, getQuestionKey]);

  // Save note
  const handleSaveNote = () => {
    const key = getQuestionKey(activeTrack, activeQuestionId);
    if (currentNote !== (notesMap[key] || '')) {
      setNotesMap((prev) => ({
        ...prev,
        [key]: currentNote
      }));
    }
  };

  // Reset progress for this track
  const handleResetTrack = () => {
    if (window.confirm(`Reset your ${currentTrack.name} progress?`)) {
      setCompletedMap((prev) => {
        const next = { ...prev };
        currentTrack.questions.forEach((q) => {
          delete next[getQuestionKey(activeTrack, q.id)];
        });
        return next;
      });
      setActiveQuestionId(1);
    }
  };

  // Track progress stats
  const completedInTrack = useMemo(() => {
    return currentTrack.questions.filter((q) => !!completedMap[getQuestionKey(activeTrack, q.id)]).length;
  }, [currentTrack, completedMap, activeTrack, getQuestionKey]);

  const trackPercent = Math.round((completedInTrack / currentTrack.totalCount) * 100);

  const isCurrentCompleted = !!completedMap[getQuestionKey(activeTrack, currentQuestion.id)];
  const hasPrevious = currentQuestion.id > 1;
  const hasNext = currentQuestion.id < currentTrack.questions.length;
  const isNextUnlocked = hasNext && isQuestionUnlocked(currentQuestion.id + 1);

  // Jump to specific day
  const handleSelectDay = (dayNum) => {
    const dayQuestions = currentTrack.questions.filter((q) => q.day === dayNum);
    const firstUnfinished = dayQuestions.find((q) => isQuestionUnlocked(q.id) && !completedMap[getQuestionKey(activeTrack, q.id)]);
    const target = firstUnfinished || dayQuestions[0];
    setActiveQuestionId(target.id);
  };

  return (
    <div className="min-h-screen bg-page text-ink flex flex-col font-sans selection:bg-black selection:text-white">
      
      {/* 1. TOP MINIMAL BAR */}
      <header className="border-b border-line bg-white sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-3">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-ink text-white font-heading font-extrabold text-xs flex items-center justify-center shadow-subtle flex-shrink-0">
              BD
            </div>
            <div>
              <strong className="block font-heading font-extrabold text-sm sm:text-base leading-tight tracking-tight">
                Backend Dev
              </strong>
              <small className="hidden sm:block text-muted text-[10px] leading-tight">
                {currentTrack.days.length}-Day Roadmap • 3 Qs / Day
              </small>
            </div>
          </div>

          {/* Track Switcher (Segmented Tab) */}
          <div className="flex items-center p-1 rounded-xl bg-paper-muted border border-line shadow-subtle">
            {TRACKS.map((t) => {
              const isSelected = activeTrack === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => handleSwitchTrack(t.id)}
                  className={`px-3 sm:px-4 py-1 sm:py-1.5 rounded-lg text-xs font-bold font-heading transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? 'comback-primary-btn shadow-subtle'
                      : 'text-muted hover:text-ink'
                  }`}
                >
                  <span className="text-xs">{t.icon}</span>
                  <span>{t.name}</span>
                  <span className="hidden md:inline text-[10px] opacity-75 font-normal">
                    ({TRACKS_DATA[t.id].totalCount})
                  </span>
                </button>
              );
            })}
          </div>

          {/* Progress & Reset */}
          <div className="flex items-center gap-2">
            <div className="px-2.5 py-1 rounded-lg border border-line bg-paper-muted text-xs font-mono font-bold text-ink hidden sm:flex items-center gap-1.5 shadow-subtle">
              <span>{completedInTrack}/{currentTrack.totalCount}</span>
              <span className="text-muted font-sans font-normal text-[11px]">({trackPercent}%)</span>
            </div>

            <button
              type="button"
              onClick={handleResetTrack}
              title="Reset progress for this track"
              className="p-1.5 rounded-lg border border-line text-muted hover:text-red-600 hover:bg-paper-muted transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* 2. PROPER DAY SELECTOR CHIPS BAR */}
      <nav className="border-b border-line bg-white/80 backdrop-blur-md sticky top-14 sm:top-16 z-20 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-muted flex-shrink-0 mr-1 hidden md:inline-block">
            DAYS:
          </span>
          {currentTrack.days.map((d) => {
            const dayQuestions = currentTrack.questions.filter((q) => q.day === d.day);
            const done = dayQuestions.filter((q) => !!completedMap[getQuestionKey(activeTrack, q.id)]).length;
            const isSelected = currentQuestion.day === d.day;
            const isComplete = done === dayQuestions.length;
            const isUnlocked = isQuestionUnlocked(dayQuestions[0].id);

            return (
              <button
                key={d.day}
                type="button"
                onClick={() => handleSelectDay(d.day)}
                disabled={!isUnlocked}
                title={`Day ${d.day}: ${d.title} (${done}/${dayQuestions.length} completed)`}
                className={`group flex-shrink-0 h-8 sm:h-8.5 px-3 rounded-full border text-xs font-heading font-semibold transition-all duration-150 flex items-center gap-2 select-none ${
                  isSelected
                    ? 'bg-zinc-950 text-white border-zinc-950 shadow-sm ring-2 ring-zinc-950/15'
                    : isComplete
                    ? 'bg-emerald-50 text-emerald-950 border-emerald-200/90 hover:bg-emerald-100 hover:border-emerald-300 shadow-xs'
                    : !isUnlocked
                    ? 'bg-zinc-100/60 text-zinc-400 border-zinc-200/50 cursor-not-allowed opacity-50'
                    : 'bg-white text-zinc-700 border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-950 shadow-xs'
                }`}
              >
                {/* Status Indicator Icon / Day Number Badge */}
                <span
                  className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold font-mono transition-colors ${
                    isSelected
                      ? isComplete
                        ? 'bg-emerald-500 text-white'
                        : 'bg-white/20 text-white'
                      : isComplete
                      ? 'bg-emerald-600 text-white'
                      : !isUnlocked
                      ? 'bg-zinc-200 text-zinc-400'
                      : 'bg-zinc-100 text-zinc-700 group-hover:bg-zinc-200'
                  }`}
                >
                  {isComplete ? (
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  ) : !isUnlocked ? (
                    <Lock className="w-2.5 h-2.5" />
                  ) : (
                    d.day
                  )}
                </span>

                {/* Day Label */}
                <span className="whitespace-nowrap">Day {d.day}</span>

                {/* Progress fraction badge */}
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full font-bold ${
                    isSelected
                      ? 'bg-white/20 text-white'
                      : isComplete
                      ? 'bg-emerald-200/60 text-emerald-800'
                      : !isUnlocked
                      ? 'text-zinc-400'
                      : 'bg-zinc-100 text-zinc-500 group-hover:bg-zinc-200/70 group-hover:text-zinc-700'
                  }`}
                >
                  {done}/{dayQuestions.length}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* 3. PROPER QUESTION CHIPS BAR (ACTIVE DAY) */}
      <div className="bg-paper-muted border-b border-line">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          
          {/* Day Title & Lock Toggle Header */}
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
            <div className="flex items-center gap-2 min-w-0">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white border border-line text-[10px] font-extrabold uppercase tracking-wider text-muted font-mono shadow-xs">
                DAY {currentQuestion.day} OF {currentTrack.days.length}
              </span>
              <span className="text-xs sm:text-sm font-heading font-bold text-ink truncate">
                {currentDayInfo.title}
              </span>
            </div>

            {/* Strict Lock Mode Toggle */}
            <button
              type="button"
              onClick={() => setStrictLock(!strictLock)}
              title="Toggle strict sequential locking"
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-line bg-white hover:bg-zinc-50 text-[11px] font-bold text-muted hover:text-ink transition-colors shadow-xs"
            >
              {strictLock ? (
                <>
                  <Lock className="w-3 h-3 text-muted" />
                  <span>Strict Lock: <strong className="text-ink">ON</strong></span>
                </>
              ) : (
                <>
                  <Unlock className="w-3 h-3 text-signal-ink" />
                  <span>Strict Lock: <strong className="text-signal-ink">OFF</strong></span>
                </>
              )}
            </button>
          </div>

          {/* The 3 Proper Question Chips */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-2.5">
            {questionsInCurrentDay.map((q, idx) => {
              const isSelected = currentQuestion.id === q.id;
              const isDone = !!completedMap[getQuestionKey(activeTrack, q.id)];
              const isUnlocked = isQuestionUnlocked(q.id);
              const shortTopic = getShortQuestionTitle(q);
              const durationSec = q.endSeconds - q.startSeconds;

              return (
                <button
                  key={q.id}
                  type="button"
                  disabled={!isUnlocked}
                  onClick={() => setActiveQuestionId(q.id)}
                  className={`group flex items-center justify-between gap-2.5 px-3.5 py-2 rounded-xl sm:rounded-full border text-xs transition-all duration-150 select-none text-left ${
                    isSelected
                      ? 'bg-zinc-950 text-white border-zinc-950 shadow-sm ring-2 ring-zinc-950/15'
                      : isDone
                      ? 'bg-emerald-50 text-emerald-950 border-emerald-200/90 hover:bg-emerald-100 hover:border-emerald-300 shadow-xs'
                      : !isUnlocked
                      ? 'bg-zinc-100/60 text-zinc-400 border-zinc-200/50 cursor-not-allowed opacity-50'
                      : 'bg-white text-zinc-800 border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 shadow-xs'
                  }`}
                >
                  {/* Left: Avatar Badge & Labels */}
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono font-bold flex-shrink-0 transition-colors ${
                        isSelected
                          ? isDone
                            ? 'bg-emerald-500 text-white'
                            : 'bg-white text-zinc-950'
                          : isDone
                          ? 'bg-emerald-600 text-white'
                          : !isUnlocked
                          ? 'bg-zinc-200 text-zinc-400'
                          : 'bg-zinc-100 text-zinc-700 group-hover:bg-zinc-200'
                      }`}
                    >
                      {isDone ? (
                        <Check className="w-3 h-3 stroke-[3]" />
                      ) : !isUnlocked ? (
                        <Lock className="w-2.5 h-2.5" />
                      ) : (
                        `Q${idx + 1}`
                      )}
                    </span>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-heading font-extrabold text-xs">
                          Q{idx + 1}
                        </span>
                        <span className="text-[10px] font-mono opacity-60">
                          #{q.id}
                        </span>
                      </div>
                      <p className={`text-[11px] truncate max-w-[200px] sm:max-w-[180px] md:max-w-[240px] lg:max-w-[280px] xl:max-w-[340px] ${
                        isSelected ? 'text-zinc-300' : isDone ? 'text-emerald-800/80' : 'text-zinc-500'
                      }`}>
                        {shortTopic}
                      </p>
                    </div>
                  </div>

                  {/* Right: Duration Pill / Active Signal */}
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {isSelected && (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    )}
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-semibold ${
                        isSelected
                          ? 'bg-white/20 text-white'
                          : isDone
                          ? 'bg-emerald-200/60 text-emerald-800'
                          : !isUnlocked
                          ? 'text-zinc-400'
                          : 'bg-zinc-100 text-zinc-600 group-hover:bg-zinc-200/80'
                      }`}
                    >
                      {formatDuration(durationSec)}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

        </div>
      </div>

      {/* 4. MAIN EXPANSIVE WORKSPACE (2-COLUMN ON DESKTOP, USES FULL SCREEN SPACE) */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

          {/* LEFT COLUMN: FOCUSED VIDEO STATION & CONTROLS (7 of 12 cols on desktop) */}
          <div className="lg:col-span-7 space-y-4">
            <section className="comback-card overflow-hidden">
              
              {/* Question Title & Meta Strip */}
              <div className="p-5 sm:p-6 pb-4 border-b border-line">
                <div className="flex flex-wrap items-center justify-between gap-2.5 mb-3">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-paper-muted border border-line text-[10px] font-extrabold uppercase tracking-wider text-ink font-heading shadow-xs">
                      <span>{currentTrack.icon}</span>
                      <span>{currentTrack.name}</span>
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-paper-muted border border-line text-[10px] font-bold text-muted font-mono shadow-xs">
                      Day {currentQuestion.day}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-paper-muted border border-line text-[10px] font-bold text-muted font-mono shadow-xs">
                      Q{currentQuestion.dayIndex} (#{currentQuestion.id})
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 text-xs font-mono text-muted bg-paper-muted px-2.5 py-0.5 rounded-full border border-line shadow-xs">
                      <Clock className="w-3.5 h-3.5 text-muted" />
                      {currentQuestion.startTime} — {currentQuestion.endTime} ({formatDuration(currentQuestion.endSeconds - currentQuestion.startSeconds)})
                    </span>

                    {isCurrentCompleted ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-signal-ink bg-signal-pale border border-signal-border px-2.5 py-0.5 rounded-full">
                        <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                        Mastered
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-muted bg-paper-muted border border-line px-2.5 py-0.5 rounded-full shadow-xs">
                        Pending
                      </span>
                    )}
                  </div>
                </div>

                <h1 className="m-0 font-heading font-extrabold text-xl sm:text-2xl text-ink tracking-tight leading-snug">
                  {currentQuestion.title}
                </h1>
              </div>

              {/* Embedded YouTube Player: strictly plays only this particular question part */}
              <div className="p-4 sm:p-6 pb-3">
                <YouTubePlayer
                  key={`${activeTrack}-${currentQuestion.id}`}
                  currentQuestion={currentQuestion}
                  videoId={currentTrack.videoId}
                  videoBaseUrl={currentTrack.videoBaseUrl}
                  loopMode={loopMode}
                  setLoopMode={setLoopMode}
                  onSegmentEnd={() => {}}
                />
              </div>

              {/* Primary Completion Button */}
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

              {/* Prev / Next Navigation Footer */}
              <div className="px-5 sm:px-6 py-3.5 bg-paper-muted flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => hasPrevious && setActiveQuestionId(currentQuestion.id - 1)}
                  disabled={!hasPrevious}
                  className="comback-button px-3.5 py-2 text-xs flex items-center gap-1.5"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>

                <span className="text-xs text-muted font-medium font-mono">
                  Question {currentQuestion.id} of {currentTrack.totalCount}
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
                  <span>Next</span>
                  {!isNextUnlocked && hasNext ? (
                    <Lock className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </button>
              </div>
            </section>
          </div>

          {/* RIGHT COLUMN: STUDY COMPANION, CODE SYNTAX, DOCS & NOTES (5 of 12 cols on desktop) */}
          <div className="lg:col-span-5 space-y-4">
            
            {/* Syntax & Command Reference */}
            {currentQuestion.tip && (
              <div className="comback-card p-5">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <p className="text-[10px] font-extrabold uppercase tracking-widest text-muted">
                    SYNTAX & COMMAND REFERENCE
                  </p>
                  <span className="text-[10px] font-mono font-bold text-muted uppercase bg-paper-muted px-2 py-0.5 rounded-full border border-line">
                    Quick Recall
                  </span>
                </div>
                <CodeBlock code={currentQuestion.tip} />
              </div>
            )}

            {/* Core Interview Takeaway */}
            <div className="comback-card p-5">
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-muted mb-2">
                CORE INTERVIEW TAKEAWAY
              </p>
              <div className="text-sm text-ink/90 leading-relaxed font-sans">
                <FormattedSummary text={currentQuestion.summary} />
              </div>
            </div>

            {/* In-Depth Official Reading & Documentation */}
            <div className="comback-card p-5">
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-muted mb-2.5">
                IN-DEPTH READING & OFFICIAL DOCUMENTATION
              </p>
              <div className="grid grid-cols-1 gap-2.5">
                {currentQuestion.articles.map((art, idx) => (
                  <a
                    key={idx}
                    href={art.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="comback-button p-3 flex items-start justify-between gap-3 text-left group"
                  >
                    <div className="min-w-0">
                      <span className="text-[10px] font-extrabold text-muted uppercase tracking-wider block">
                        {art.source}
                      </span>
                      <strong className="text-xs font-bold font-heading text-ink group-hover:text-ink block mt-0.5 line-clamp-1">
                        {art.title}
                      </strong>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-muted group-hover:text-ink flex-shrink-0 mt-1" />
                  </a>
                ))}
              </div>
            </div>

            {/* Personal Study Notes */}
            <div className="comback-card p-5">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-muted">
                  YOUR INTERVIEW NOTES
                </p>
                <span className="text-[10px] text-muted font-mono">
                  Auto-saved
                </span>
              </div>

              <textarea
                value={currentNote}
                onChange={(e) => setCurrentNote(e.target.value)}
                onBlur={handleSaveNote}
                placeholder="Write your explanation, syntax reminders, or interview answers here while watching..."
                rows={4}
                className="w-full text-xs font-sans bg-white border border-line-strong rounded-xl p-3 text-ink focus:outline-none focus:border-ink transition-colors placeholder:text-muted resize-y shadow-subtle"
              />
              <div className="flex justify-end mt-2">
                <button
                  type="button"
                  onClick={handleSaveNote}
                  className="comback-button px-3.5 py-1 text-xs font-bold"
                >
                  Save Note
                </button>
              </div>
            </div>

            {/* Motivational Habit Footer Banner */}
            <div className="comback-card p-3.5 text-xs text-muted flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-500 flex-shrink-0" />
                <span>
                  <strong>Pace:</strong> 3 questions each day. Finish all {currentTrack.totalCount} {currentTrack.name} questions in {currentTrack.days.length} days!
                </span>
              </div>
              <span className="text-ink font-bold font-mono text-xs flex-shrink-0">
                Day {currentQuestion.day}/{currentTrack.days.length}
              </span>
            </div>

          </div>

        </div>
      </main>

      {/* Clean Minimal Page Footer */}
      <footer className="mt-auto px-6 py-4 border-t border-line bg-white text-center text-xs text-muted">
        Backend Dev Journey • Progress and notes are saved automatically in your browser.
      </footer>

    </div>
  );
}
