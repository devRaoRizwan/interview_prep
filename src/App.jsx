import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  TRACKS_DATA,
  TRACKS
} from './data/questions';
import { getQuestionChallenge, SANDBOX_LINKS } from './data/challenges';
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
  Unlock, 
  Terminal, 
  BookOpen, 
  Sparkles, 
  Play, 
  CheckCircle2, 
  Circle 
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

// Extract concise topic title for question tabs
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

  if (clean.length > 40) {
    clean = clean.slice(0, 38) + '…';
  }
  return clean ? clean.charAt(0).toUpperCase() + clean.slice(1) : (question.tags?.[0] || 'Question');
}

const STORAGE_PREFIX = 'backend_dev_v6_';

export default function App() {
  // Active track: 'django' or 'python'
  const [activeTrack, setActiveTrack] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_PREFIX + 'track');
      return saved && TRACKS_DATA[saved] ? saved : 'python';
    } catch {
      return 'python';
    }
  });

  // Track Data
  const currentTrack = TRACKS_DATA[activeTrack] || TRACKS_DATA.python;

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

  // Checklist map { [track_id_qid_step]: boolean }
  const [checklistMap, setChecklistMap] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_PREFIX + 'checklist');
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
  const [currentNote, setCurrentNote] = useState('');
  const [dayDropdownOpen, setDayDropdownOpen] = useState(false);

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
      localStorage.setItem(STORAGE_PREFIX + 'checklist', JSON.stringify(checklistMap));
    } catch (e) {
      console.warn(e);
    }
  }, [checklistMap]);

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

  // Toggle checklist step
  const handleToggleChecklist = (step) => {
    const key = `${getQuestionKey(activeTrack, currentQuestion.id)}_${step}`;
    setChecklistMap((prev) => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

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

  // Day navigation
  const currentDayIndex = currentTrack.days.findIndex((d) => d.day === currentQuestion.day);
  const hasPrevDay = currentDayIndex > 0;
  const hasNextDay = currentDayIndex < currentTrack.days.length - 1;

  const handleSelectDay = (dayNum) => {
    setDayDropdownOpen(false);
    const dayQuestions = currentTrack.questions.filter((q) => q.day === dayNum);
    const firstUnfinished = dayQuestions.find((q) => isQuestionUnlocked(q.id) && !completedMap[getQuestionKey(activeTrack, q.id)]);
    const target = firstUnfinished || dayQuestions[0];
    setActiveQuestionId(target.id);
  };

  const handlePrevDay = () => {
    if (hasPrevDay) {
      handleSelectDay(currentTrack.days[currentDayIndex - 1].day);
    }
  };

  const handleNextDay = () => {
    if (hasNextDay) {
      handleSelectDay(currentTrack.days[currentDayIndex + 1].day);
    }
  };

  // Curated Interview Challenge & Practice info
  const challenge = useMemo(() => {
    return getQuestionChallenge(activeTrack, currentQuestion);
  }, [activeTrack, currentQuestion]);

  // Checklist values for current question
  const isWatched = !!checklistMap[`${getQuestionKey(activeTrack, currentQuestion.id)}_watched`];
  const isCoded = !!checklistMap[`${getQuestionKey(activeTrack, currentQuestion.id)}_coded`];
  const isSpoken = !!checklistMap[`${getQuestionKey(activeTrack, currentQuestion.id)}_spoken`];

  return (
    <div className="min-h-screen bg-[#fafafa] text-zinc-900 flex flex-col font-sans selection:bg-zinc-900 selection:text-white">
      
      {/* 1. MINIMAL CLEAN HEADER */}
      <header className="border-b border-zinc-200/80 bg-white sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          
          {/* Brand */}
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-zinc-950 text-white font-mono font-bold text-xs flex items-center justify-center flex-shrink-0 shadow-xs">
              BD
            </div>
            <div>
              <span className="font-heading font-extrabold text-sm tracking-tight text-zinc-950 block leading-tight">
                Backend Dev
              </span>
              <span className="text-[10px] text-zinc-400 font-mono block leading-none">
                30-Day Interview Prep
              </span>
            </div>
          </div>

          {/* Clean Segmented Track Toggle */}
          <div className="flex items-center p-0.5 rounded-lg bg-zinc-100 border border-zinc-200/80">
            {TRACKS.map((t) => {
              const isSelected = activeTrack === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => handleSwitchTrack(t.id)}
                  className={`px-3 py-1 rounded-md text-xs font-heading font-bold transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-white text-zinc-950 shadow-xs'
                      : 'text-zinc-500 hover:text-zinc-800'
                  }`}
                >
                  <span>{t.icon}</span>
                  <span>{t.name}</span>
                  <span className="text-[10px] font-mono opacity-60">
                    ({TRACKS_DATA[t.id].totalCount})
                  </span>
                </button>
              );
            })}
          </div>

          {/* Progress & Controls */}
          <div className="flex items-center gap-2">
            <div className="text-xs font-mono text-zinc-500 hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-100 border border-zinc-200/60">
              <span className="font-bold text-zinc-950">{completedInTrack}/{currentTrack.totalCount}</span>
              <span className="text-zinc-400">({trackPercent}%)</span>
            </div>

            <button
              type="button"
              onClick={() => setStrictLock(!strictLock)}
              title={strictLock ? 'Strict Lock: ON (Sequential)' : 'Strict Lock: OFF (Free Nav)'}
              className={`p-1.5 rounded-md border text-xs transition-colors flex items-center gap-1 ${
                strictLock 
                  ? 'border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50' 
                  : 'border-emerald-200 bg-emerald-50 text-emerald-800'
              }`}
            >
              {strictLock ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5 text-emerald-600" />}
            </button>

            <button
              type="button"
              onClick={handleResetTrack}
              title="Reset progress"
              className="p-1.5 rounded-md border border-zinc-200 bg-white text-zinc-400 hover:text-red-600 hover:bg-zinc-50 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      </header>

      {/* 2. SIMPLE, CLEAN DAY & QUESTION NAVIGATION (ZERO CLUTTER) */}
      <div className="border-b border-zinc-200 bg-white sticky top-14 z-20 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3">
          
          {/* Day Stepper & Title with Dropdown */}
          <div className="relative flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrevDay}
              disabled={!hasPrevDay}
              className="p-1 rounded-md border border-zinc-200 hover:bg-zinc-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="Previous Day"
            >
              <ChevronLeft className="w-4 h-4 text-zinc-700" />
            </button>

            {/* Current Day Trigger Button */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setDayDropdownOpen(!dayDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1 rounded-lg border border-zinc-200 hover:border-zinc-300 bg-zinc-50 hover:bg-zinc-100 transition-colors text-xs"
              >
                <span className="font-mono font-bold text-zinc-950">
                  Day {currentQuestion.day}/{currentTrack.days.length}
                </span>
                <span className="text-zinc-400">•</span>
                <span className="font-heading font-semibold text-zinc-800 max-w-[160px] sm:max-w-[260px] truncate">
                  {currentDayInfo.title}
                </span>
                <span className="text-zinc-400 text-[10px]">▼</span>
              </button>

              {/* Minimal Clean Day Selector Dropdown */}
              {dayDropdownOpen && (
                <div 
                  className="absolute left-0 top-full mt-1.5 w-72 max-h-80 overflow-y-auto rounded-xl border border-zinc-200 bg-white shadow-xl z-50 p-1.5 space-y-0.5"
                  onMouseLeave={() => setDayDropdownOpen(false)}
                >
                  <div className="px-2.5 py-1 text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400">
                    Jump to Day
                  </div>
                  {currentTrack.days.map((d) => {
                    const dQuestions = currentTrack.questions.filter((q) => q.day === d.day);
                    const dDone = dQuestions.filter((q) => !!completedMap[getQuestionKey(activeTrack, q.id)]).length;
                    const isSelected = currentQuestion.day === d.day;
                    const isComplete = dDone === dQuestions.length;

                    return (
                      <button
                        key={d.day}
                        type="button"
                        onClick={() => handleSelectDay(d.day)}
                        className={`w-full px-2.5 py-1.5 rounded-lg text-left text-xs flex items-center justify-between gap-2 transition-colors ${
                          isSelected
                            ? 'bg-zinc-900 text-white font-bold'
                            : 'hover:bg-zinc-100 text-zinc-800'
                        }`}
                      >
                        <span className="truncate">
                          <strong className="font-mono">Day {d.day}:</strong> {d.title}
                        </span>
                        <span className={`text-[10px] font-mono flex-shrink-0 ${isSelected ? 'text-zinc-300' : 'text-zinc-400'}`}>
                          {isComplete ? '✓ 3/3' : `${dDone}/3`}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={handleNextDay}
              disabled={!hasNextDay}
              className="p-1 rounded-md border border-zinc-200 hover:bg-zinc-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="Next Day"
            >
              <ChevronRight className="w-4 h-4 text-zinc-700" />
            </button>
          </div>

          {/* Today's 3 Questions as Clean Minimalist Tabs */}
          <div className="flex items-center gap-1.5">
            {questionsInCurrentDay.map((q, idx) => {
              const isSelected = currentQuestion.id === q.id;
              const isDone = !!completedMap[getQuestionKey(activeTrack, q.id)];
              const isUnlocked = isQuestionUnlocked(q.id);

              return (
                <button
                  key={q.id}
                  type="button"
                  disabled={!isUnlocked}
                  onClick={() => setActiveQuestionId(q.id)}
                  className={`px-3 py-1 rounded-md text-xs font-heading font-semibold transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-zinc-950 text-white shadow-xs'
                      : isDone
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                      : !isUnlocked
                      ? 'text-zinc-300 cursor-not-allowed'
                      : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200/80 hover:text-zinc-900'
                  }`}
                >
                  {isDone ? (
                    <Check className="w-3 h-3 text-emerald-600 stroke-[3]" />
                  ) : !isUnlocked ? (
                    <Lock className="w-2.5 h-2.5 opacity-40" />
                  ) : (
                    <span className="font-mono font-bold text-[11px] opacity-70">
                      {idx + 1}.
                    </span>
                  )}
                  <span>Q{idx + 1}</span>
                  <span className="hidden md:inline text-[11px] font-normal opacity-80 max-w-[120px] truncate">
                    {getShortQuestionTitle(q)}
                  </span>
                </button>
              );
            })}
          </div>

        </div>
      </div>

      {/* 3. FOCUSED 2-COLUMN STUDY & PRACTICE WORKSPACE */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

          {/* LEFT COLUMN: FOCUSED VIDEO STATION & COMPLETION (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            
            {/* Main Video & Active Question Card */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6 shadow-xs space-y-4">
              
              {/* Question Header Strip */}
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-zinc-100 text-zinc-700 border border-zinc-200">
                      DAY {currentQuestion.day} • Q{currentQuestion.dayIndex}
                    </span>
                    <span className="text-xs font-mono text-zinc-500 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-zinc-400" />
                      {currentQuestion.startTime} — {currentQuestion.endTime} ({formatDuration(currentQuestion.endSeconds - currentQuestion.startSeconds)})
                    </span>
                  </div>

                  {isCurrentCompleted ? (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                      <Check className="w-3 h-3 stroke-[3]" />
                      Mastered
                    </span>
                  ) : (
                    <span className="text-[11px] font-medium text-zinc-400 bg-zinc-50 border border-zinc-200 px-2 py-0.5 rounded-full">
                      In Progress
                    </span>
                  )}
                </div>

                <h1 className="font-heading font-extrabold text-xl sm:text-2xl text-zinc-950 tracking-tight leading-snug">
                  {currentQuestion.title}
                </h1>
              </div>

              {/* YouTube Player */}
              <div className="rounded-xl overflow-hidden border border-zinc-200 bg-black">
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

              {/* Primary Action Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => handleToggleComplete(currentQuestion.id)}
                  className={`w-full py-3 rounded-xl font-heading font-bold text-sm transition-all duration-150 flex items-center justify-center gap-2.5 shadow-sm ${
                    isCurrentCompleted
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      : 'bg-zinc-950 hover:bg-black text-white'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                    isCurrentCompleted ? 'bg-white/20' : 'bg-white/10'
                  }`}>
                    {isCurrentCompleted ? (
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    ) : (
                      <Play className="w-2.5 h-2.5 fill-white ml-0.5" />
                    )}
                  </div>
                  <span>
                    {isCurrentCompleted 
                      ? '✓ Mastered! Click to Mark Incomplete' 
                      : 'Mark Done & Unlock Next Question →'}
                  </span>
                </button>
              </div>

              {/* Interactive Practice & Rehearsal Checklist */}
              <div className="pt-3 border-t border-zinc-100">
                <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400 mb-2">
                  ACTIVE RECALL & PRACTICE CHECKLIST
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  
                  <button
                    type="button"
                    onClick={() => handleToggleChecklist('watched')}
                    className={`px-3 py-2 rounded-lg border text-left text-xs transition-colors flex items-center gap-2 ${
                      isWatched 
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-900 font-semibold' 
                        : 'border-zinc-200 bg-zinc-50 text-zinc-600 hover:bg-zinc-100'
                    }`}
                  >
                    {isWatched ? <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" /> : <Circle className="w-4 h-4 text-zinc-400 flex-shrink-0" />}
                    <span>1. Watched Clip</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleToggleChecklist('coded')}
                    className={`px-3 py-2 rounded-lg border text-left text-xs transition-colors flex items-center gap-2 ${
                      isCoded 
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-900 font-semibold' 
                        : 'border-zinc-200 bg-zinc-50 text-zinc-600 hover:bg-zinc-100'
                    }`}
                  >
                    {isCoded ? <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" /> : <Circle className="w-4 h-4 text-zinc-400 flex-shrink-0" />}
                    <span>2. Ran Code in REPL</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleToggleChecklist('spoken')}
                    className={`px-3 py-2 rounded-lg border text-left text-xs transition-colors flex items-center gap-2 ${
                      isSpoken 
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-900 font-semibold' 
                        : 'border-zinc-200 bg-zinc-50 text-zinc-600 hover:bg-zinc-100'
                    }`}
                  >
                    {isSpoken ? <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" /> : <Circle className="w-4 h-4 text-zinc-400 flex-shrink-0" />}
                    <span>3. Answered Out Loud</span>
                  </button>

                </div>
              </div>

              {/* Prev / Next Bottom Controls */}
              <div className="pt-2 flex items-center justify-between text-xs text-zinc-500">
                <button
                  type="button"
                  onClick={() => hasPrevious && setActiveQuestionId(currentQuestion.id - 1)}
                  disabled={!hasPrevious}
                  className="inline-flex items-center gap-1 font-semibold text-zinc-600 hover:text-zinc-950 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>

                <span className="font-mono text-zinc-400">
                  Question #{currentQuestion.id} of {currentTrack.totalCount}
                </span>

                <button
                  type="button"
                  onClick={() => hasNext && isNextUnlocked && setActiveQuestionId(currentQuestion.id + 1)}
                  disabled={!hasNext || !isNextUnlocked}
                  className="inline-flex items-center gap-1 font-semibold text-zinc-600 hover:text-zinc-950 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

            </div>

          </div>

          {/* RIGHT COLUMN: INTERACTIVE PRACTICE, CHALLENGE & REPL (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            
            {/* 1. Hands-On Interview Coding Challenge (ENGAGING PRACTICE) */}
            {challenge && (
              <div className="rounded-2xl border border-zinc-900 bg-zinc-950 text-white p-5 shadow-sm space-y-3.5">
                <div className="flex items-center justify-between gap-2 border-b border-zinc-800 pb-2.5">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span className="font-heading font-extrabold text-xs tracking-tight text-white uppercase">
                      HANDS-ON INTERVIEW CHALLENGE
                    </span>
                  </div>
                  
                  {/* Direct Launch REPL Button */}
                  <a
                    href={challenge.replLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-400 hover:bg-amber-300 text-zinc-950 text-[11px] font-mono font-bold transition-colors shadow-xs"
                  >
                    <Terminal className="w-3 h-3" />
                    <span>Launch REPL</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>

                {/* Practical Task */}
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 block mb-1">
                    PRACTICE TASK:
                  </span>
                  <p className="text-xs text-zinc-200 leading-relaxed font-sans font-medium">
                    {challenge.task}
                  </p>
                </div>

                {/* Interviewer Trap / Follow-up */}
                <div className="p-3 rounded-xl bg-zinc-900/90 border border-zinc-800 text-xs">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold block mb-1">
                    INTERVIEWER TRAP QUESTION:
                  </span>
                  <p className="text-xs text-zinc-300 italic leading-relaxed">
                    "{challenge.followUp}"
                  </p>
                </div>
              </div>
            )}

            {/* 2. Code & Syntax Reference */}
            {currentQuestion.tip && (
              <div className="rounded-2xl border border-zinc-200 bg-white p-4 sm:p-5 shadow-xs">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400">
                    SYNTAX & COMMAND REFERENCE
                  </span>
                  <span className="text-[10px] font-mono text-zinc-400">
                    Quick Copy
                  </span>
                </div>
                <CodeBlock code={currentQuestion.tip} />
              </div>
            )}

            {/* 3. Core Interview Takeaway */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400 block mb-2">
                CORE TECHNICAL EXPLANATION
              </span>
              <div className="text-xs sm:text-sm text-zinc-700 leading-relaxed font-sans">
                <FormattedSummary text={currentQuestion.summary} />
              </div>
            </div>

            {/* 4. Official Documentation & In-Depth Reading Links */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400">
                  DOCUMENTATION & PRACTICE LINKS
                </span>
                <BookOpen className="w-3.5 h-3.5 text-zinc-400" />
              </div>

              <div className="space-y-2">
                {currentQuestion.articles.map((art, idx) => (
                  <a
                    key={idx}
                    href={art.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-xl border border-zinc-200/90 hover:border-zinc-300 hover:bg-zinc-50 flex items-center justify-between gap-3 text-left transition-colors group"
                  >
                    <div className="min-w-0">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 block">
                        {art.source}
                      </span>
                      <strong className="text-xs font-semibold text-zinc-900 group-hover:text-black block truncate">
                        {art.title}
                      </strong>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-zinc-400 group-hover:text-zinc-950 flex-shrink-0" />
                  </a>
                ))}
              </div>
            </div>

            {/* 5. Personal Interview Rehearsal Notes */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400">
                  MY SPOKEN ANSWER / SCRIPT
                </span>
                <span className="text-[10px] font-mono text-zinc-400">
                  Auto-saved
                </span>
              </div>
              <textarea
                value={currentNote}
                onChange={(e) => setCurrentNote(e.target.value)}
                onBlur={handleSaveNote}
                placeholder="Write your 60-second explanation here as if answering an interviewer live..."
                rows={3}
                className="w-full text-xs font-sans bg-zinc-50 border border-zinc-200 rounded-xl p-3 text-zinc-900 focus:outline-none focus:bg-white focus:border-zinc-950 transition-colors placeholder:text-zinc-400 resize-y"
              />
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleSaveNote}
                  className="px-3 py-1 rounded-md border border-zinc-200 bg-white hover:bg-zinc-100 text-xs font-semibold text-zinc-800 transition-colors"
                >
                  Save Script
                </button>
              </div>
            </div>

          </div>

        </div>
      </main>

      {/* Clean Minimal Footer */}
      <footer className="mt-auto px-6 py-4 border-t border-zinc-200 bg-white text-center text-xs text-zinc-400 font-mono">
        Backend Dev Journey • 30-Day Interview Preparation
      </footer>

    </div>
  );
}
