import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  TRACKS_DATA,
  TRACKS
} from './data/questions';
import { getQuestionChallenge, getQuestionScriptData } from './data/challenges';
import YouTubePlayer from './components/YouTubePlayer';
import CodeBlock from './components/CodeBlock';
import CircularTimer from './components/CircularTimer';
import { 
  Check, 
  Lock, 
  ChevronLeft, 
  ChevronRight, 
  RotateCcw, 
  Clock, 
  Unlock, 
  Terminal, 
  Sparkles, 
  Play, 
  Pause,
  Code2,
  FileText,
  Lightbulb,
  CheckCircle2,
  Circle,
  ArrowRight,
  Eye,
  EyeOff,
  Copy,
  Mic,
  Calendar,
  Layers,
  Award
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
              className="inline-block font-mono text-[11px] sm:text-xs px-1.5 py-0.5 mx-0.5 rounded bg-zinc-900 text-amber-300 font-semibold border border-zinc-700/80 shadow-xs"
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

// Format timer mm:ss
function formatTimerDigits(totalSeconds) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

const STORAGE_PREFIX = 'backend_dev_zen_v3_';
const QUESTION_TIMER_SECONDS = 20 * 60; // 20 Minutes (1200s)
const SCRIPT_TIMER_SECONDS = 5 * 60;    // 5 Minutes (300s)

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

  // Completed questions map { [track_id_qid]: boolean }
  const [completedMap, setCompletedMap] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_PREFIX + 'completed');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Tab checklist items map { [track_id_qid_tabId]: boolean }
  const [tabChecksMap, setTabChecksMap] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_PREFIX + 'tab_checks');
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

  // Active tab: 'concept' | 'code' | 'challenge' | 'notes'
  const [activeTab, setActiveTab] = useState('concept');
  const [loopMode, setLoopMode] = useState(false);
  const [currentNote, setCurrentNote] = useState('');
  const [showAnswer, setShowAnswer] = useState(false);
  const [showModelSolution, setShowModelSolution] = useState(false);
  const [snippetCopied, setSnippetCopied] = useState(false);

  // Helper for question key
  const getQuestionKey = useCallback((trackId, qId) => `${trackId}_${qId}`, []);

  // --- 20-MINUTE FOCUS TIMER STATE ---
  const [timerSeconds, setTimerSeconds] = useState(QUESTION_TIMER_SECONDS);
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const getTimerKey = useCallback((trackId, qId) => `${STORAGE_PREFIX}timer_${trackId}_${qId}`, []);

  // --- 5-MINUTE SCRIPT TIMER STATE (Gated model solution) ---
  const [scriptTimerSeconds, setScriptTimerSeconds] = useState(SCRIPT_TIMER_SECONDS);
  const [isScriptTimerRunning, setIsScriptTimerRunning] = useState(true);
  const getScriptTimerKey = useCallback((trackId, qId) => `${STORAGE_PREFIX}script_timer_${trackId}_${qId}`, []);

  // Sync active question 20m timer from localStorage
  useEffect(() => {
    try {
      const savedTimer = localStorage.getItem(getTimerKey(activeTrack, activeQuestionId));
      if (savedTimer !== null) {
        const parsed = parseInt(savedTimer, 10);
        setTimerSeconds(isNaN(parsed) ? QUESTION_TIMER_SECONDS : Math.max(0, parsed));
      } else {
        if (completedMap[getQuestionKey(activeTrack, activeQuestionId)]) {
          setTimerSeconds(0);
        } else {
          setTimerSeconds(QUESTION_TIMER_SECONDS);
        }
      }
    } catch {
      setTimerSeconds(QUESTION_TIMER_SECONDS);
    }
    setIsTimerRunning(true);
    setShowAnswer(false);
    setShowModelSolution(false);
  }, [activeTrack, activeQuestionId, completedMap, getQuestionKey, getTimerKey]);

  // Sync active question 5m script timer from localStorage
  useEffect(() => {
    try {
      const savedScriptTimer = localStorage.getItem(getScriptTimerKey(activeTrack, activeQuestionId));
      if (savedScriptTimer !== null) {
        const parsed = parseInt(savedScriptTimer, 10);
        setScriptTimerSeconds(isNaN(parsed) ? SCRIPT_TIMER_SECONDS : Math.max(0, parsed));
      } else {
        if (completedMap[getQuestionKey(activeTrack, activeQuestionId)]) {
          setScriptTimerSeconds(0);
        } else {
          setScriptTimerSeconds(SCRIPT_TIMER_SECONDS);
        }
      }
    } catch {
      setScriptTimerSeconds(SCRIPT_TIMER_SECONDS);
    }
    setIsScriptTimerRunning(true);
  }, [activeTrack, activeQuestionId, completedMap, getQuestionKey, getScriptTimerKey]);

  // Run the 20-minute question countdown interval
  useEffect(() => {
    if (!isTimerRunning) return;

    const interval = setInterval(() => {
      setTimerSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isTimerRunning]);

  // Run the 5-minute script countdown interval (only when in 'notes' tab and running)
  useEffect(() => {
    if (activeTab !== 'notes' || !isScriptTimerRunning || scriptTimerSeconds <= 0) return;

    const interval = setInterval(() => {
      setScriptTimerSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [activeTab, isScriptTimerRunning, scriptTimerSeconds]);

  // Persist 20m timer in localStorage
  useEffect(() => {
    try {
      localStorage.setItem(getTimerKey(activeTrack, activeQuestionId), timerSeconds.toString());
    } catch (e) {
      console.warn(e);
    }
  }, [timerSeconds, activeTrack, activeQuestionId, getTimerKey]);

  // Persist 5m script timer in localStorage
  useEffect(() => {
    try {
      localStorage.setItem(getScriptTimerKey(activeTrack, activeQuestionId), scriptTimerSeconds.toString());
    } catch (e) {
      console.warn(e);
    }
  }, [scriptTimerSeconds, activeTrack, activeQuestionId, getScriptTimerKey]);

  // Sync tab title with active 20m timer
  useEffect(() => {
    const formatted = formatTimerDigits(timerSeconds);
    const prefix = timerSeconds === 0 ? '✓ (20m Done)' : isTimerRunning ? `(${formatted})` : `(Paused ${formatted})`;
    document.title = `${prefix} Q${activeQuestionId}: ${currentTrack.name} - Backend Dev`;
  }, [timerSeconds, isTimerRunning, activeQuestionId, currentTrack.name]);

  // Persist common states
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
      localStorage.setItem(STORAGE_PREFIX + 'tab_checks', JSON.stringify(tabChecksMap));
    } catch (e) {
      console.warn(e);
    }
  }, [tabChecksMap]);

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
    setActiveTab('concept');
  };

  // Sync note
  useEffect(() => {
    setCurrentNote(notesMap[getQuestionKey(activeTrack, activeQuestionId)] || '');
  }, [activeTrack, activeQuestionId, notesMap, getQuestionKey]);

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

  // Curated Interview Challenge & Spoken Script Data
  const challenge = useMemo(() => {
    return getQuestionChallenge(activeTrack, currentQuestion);
  }, [activeTrack, currentQuestion]);

  const scriptData = useMemo(() => {
    return getQuestionScriptData(activeTrack, currentQuestion);
  }, [activeTrack, currentQuestion]);

  // Required checkable tabs for this question
  const questionTabs = useMemo(() => {
    const tabs = [
      { id: 'concept', label: 'Concept', icon: Lightbulb, iconColor: 'text-amber-500' },
    ];
    if (currentQuestion.tip) {
      tabs.push({ id: 'code', label: 'Syntax & Code', icon: Code2, iconColor: 'text-cyan-500' });
    }
    if (challenge) {
      tabs.push({ id: 'challenge', label: 'Practice Task', icon: Sparkles, iconColor: 'text-purple-500' });
    }
    tabs.push({ id: 'notes', label: 'My Script', icon: FileText, iconColor: 'text-emerald-500' });
    return tabs;
  }, [currentQuestion, challenge]);

  // Check if a specific tab is checked for the current question
  const isTabChecked = useCallback((tabId) => {
    const key = `${getQuestionKey(activeTrack, currentQuestion.id)}_${tabId}`;
    return !!tabChecksMap[key];
  }, [activeTrack, currentQuestion.id, getQuestionKey, tabChecksMap]);

  // Toggle check state for a specific tab
  const handleToggleTabCheck = useCallback((tabId, e) => {
    if (e) e.stopPropagation();
    const key = `${getQuestionKey(activeTrack, currentQuestion.id)}_${tabId}`;
    setTabChecksMap((prev) => ({
      ...prev,
      [key]: !prev[key]
    }));
  }, [activeTrack, currentQuestion.id, getQuestionKey]);

  // Compute how many steps are checked for the current question
  const checkedStepsCount = useMemo(() => {
    return questionTabs.filter((t) => isTabChecked(t.id)).length;
  }, [questionTabs, isTabChecked]);

  const areAllStepsChecked = checkedStepsCount === questionTabs.length;

  // Is question unlocked?
  const isQuestionUnlocked = useCallback((qId) => {
    if (!strictLock) return true;
    if (qId === 1) return true;
    const currentDone = !!completedMap[getQuestionKey(activeTrack, qId)];
    const prevDone = !!completedMap[getQuestionKey(activeTrack, qId - 1)];
    return currentDone || prevDone;
  }, [strictLock, completedMap, activeTrack, getQuestionKey]);

  // Toggle overall question completion
  const handleToggleComplete = useCallback((id) => {
    const key = getQuestionKey(activeTrack, id);
    const isCurrentlyDone = !!completedMap[key];
    const isTimerDone = timerSeconds === 0;

    // Strict time enforcement: cannot mark complete before 20 minutes unless unlocking/undoing or strictLock is off
    if (strictLock && !isTimerDone && !isCurrentlyDone) {
      alert(`Full 20-minute focus session required on this question before marking it complete (${formatTimerDigits(timerSeconds)} remaining).`);
      return;
    }

    const isNowDone = !isCurrentlyDone;
    
    // When marking complete, also check all steps and mark timers as finished
    if (isNowDone) {
      setTimerSeconds(0);
      setScriptTimerSeconds(0);
      try {
        localStorage.setItem(getTimerKey(activeTrack, id), '0');
        localStorage.setItem(getScriptTimerKey(activeTrack, id), '0');
      } catch (e) {}

      setTabChecksMap((prev) => {
        const next = { ...prev };
        questionTabs.forEach((t) => {
          next[`${key}_${t.id}`] = true;
        });
        return next;
      });
    }

    setCompletedMap((prev) => ({
      ...prev,
      [key]: isNowDone
    }));

    // If marked done, advance to next question
    if (isNowDone && id < currentTrack.questions.length) {
      setTimeout(() => {
        setActiveQuestionId(id + 1);
        setActiveTab('concept');
      }, 300);
    }
  }, [activeTrack, completedMap, currentTrack.questions.length, getQuestionKey, getTimerKey, getScriptTimerKey, questionTabs, strictLock, timerSeconds]);

  // Action to mark current tab done and advance to next tab
  const handleMarkTabDoneAndNext = (currentTabId) => {
    const key = `${getQuestionKey(activeTrack, currentQuestion.id)}_${currentTabId}`;
    setTabChecksMap((prev) => ({
      ...prev,
      [key]: true
    }));

    const currentIndex = questionTabs.findIndex((t) => t.id === currentTabId);
    if (currentIndex < questionTabs.length - 1) {
      setActiveTab(questionTabs[currentIndex + 1].id);
    }
  };

  // Copy code snippet helper
  const handleCopySnippet = (text) => {
    navigator.clipboard.writeText(text);
    setSnippetCopied(true);
    setTimeout(() => setSnippetCopied(false), 2000);
  };

  // Save note
  const handleSaveNote = () => {
    const key = getQuestionKey(activeTrack, activeQuestionId);
    if (currentNote !== (notesMap[key] || '')) {
      setNotesMap((prev) => ({
        ...prev,
        [key]: currentNote
      }));
      // Auto-check the 'notes' tab if note was written
      if (currentNote.trim().length > 0) {
        setTabChecksMap((prev) => ({
          ...prev,
          [`${key}_notes`]: true
        }));
      }
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
      setTabChecksMap((prev) => {
        const next = { ...prev };
        currentTrack.questions.forEach((q) => {
          ['concept', 'code', 'challenge', 'notes'].forEach((tabId) => {
            delete next[`${getQuestionKey(activeTrack, q.id)}_${tabId}`];
          });
        });
        return next;
      });
      setActiveQuestionId(1);
      setActiveTab('concept');
      setTimerSeconds(QUESTION_TIMER_SECONDS);
      setScriptTimerSeconds(SCRIPT_TIMER_SECONDS);
    }
  };

  // Track progress stats
  const completedInTrack = useMemo(() => {
    return currentTrack.questions.filter((q) => !!completedMap[getQuestionKey(activeTrack, q.id)]).length;
  }, [currentTrack, completedMap, activeTrack, getQuestionKey]);

  const trackPercent = Math.round((completedInTrack / currentTrack.totalCount) * 100);
  const isCurrentCompleted = !!completedMap[getQuestionKey(activeTrack, currentQuestion.id)];
  const isTimerDone = timerSeconds === 0;
  const isCurrentQuestionSatisfied = (areAllStepsChecked && isTimerDone) || isCurrentCompleted;
  const hasPrevious = currentQuestion.id > 1;
  const hasNext = currentQuestion.id < currentTrack.questions.length;
  const isNextUnlocked = hasNext && isQuestionUnlocked(currentQuestion.id + 1) && (!strictLock || isCurrentQuestionSatisfied);

  // Jump to first incomplete tab
  const handleJumpToIncompleteTab = () => {
    const firstIncomplete = questionTabs.find((t) => !isTabChecked(t.id));
    if (firstIncomplete) {
      setActiveTab(firstIncomplete.id);
    }
  };

  // Day navigation
  const currentDayIndex = currentTrack.days.findIndex((d) => d.day === currentQuestion.day);
  const hasPrevDay = currentDayIndex > 0;
  const hasNextDay = currentDayIndex < currentTrack.days.length - 1;

  const handleSelectDay = (dayNum) => {
    const dayQuestions = currentTrack.questions.filter((q) => q.day === dayNum);
    const firstUnfinished = dayQuestions.find((q) => isQuestionUnlocked(q.id) && !completedMap[getQuestionKey(activeTrack, q.id)]);
    const target = firstUnfinished || dayQuestions[0];
    setActiveQuestionId(target.id);
    setActiveTab('concept');
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

  const isScriptTimerDone = scriptTimerSeconds === 0 || !strictLock;

  return (
    <div className="min-h-screen w-full bg-[#fafafc] text-zinc-900 flex flex-col font-sans selection:bg-zinc-900 selection:text-white antialiased">
      
      {/* 1. TOP FULL-WIDTH HEADER BAR */}
      <header className="w-full border-b border-zinc-200/80 bg-white/95 backdrop-blur-md sticky top-0 z-30 shadow-xs">
        <div className="w-full px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-4">
          
          {/* Left: Brand & Mini 20m Circular Clock Status Widget */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-zinc-950 text-white font-mono font-bold text-xs flex items-center justify-center shadow-xs">
                BD
              </span>
              <span className="font-heading font-extrabold text-sm sm:text-base tracking-tight text-zinc-900">
                Backend Dev
              </span>
            </div>

            {/* 20-MINUTE FOCUS CLOCK MINI STATUS WIDGET */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 border border-zinc-200/80 shadow-xs">
              <CircularTimer
                secondsLeft={timerSeconds}
                totalSeconds={QUESTION_TIMER_SECONDS}
                isRunning={isTimerRunning}
                size={22}
                strokeWidth={3}
                colorScheme="focus"
                showControls={false}
              />
              
              <span className={`font-mono text-xs font-bold ${timerSeconds === 0 ? 'text-emerald-700 font-extrabold' : 'text-zinc-900'}`}>
                {timerSeconds === 0 ? '20m Reached' : formatTimerDigits(timerSeconds)}
              </span>

              <button
                type="button"
                onClick={() => setIsTimerRunning(!isTimerRunning)}
                title={isTimerRunning ? 'Pause 20m timer' : 'Resume 20m timer'}
                className="p-0.5 text-zinc-500 hover:text-zinc-950 transition-colors"
              >
                {isTimerRunning ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 fill-current" />}
              </button>

              <button
                type="button"
                onClick={() => {
                  setTimerSeconds(QUESTION_TIMER_SECONDS);
                  setIsTimerRunning(true);
                }}
                title="Reset 20m timer"
                className="p-0.5 text-zinc-400 hover:text-zinc-800 transition-colors"
              >
                <RotateCcw className="w-2.5 h-2.5" />
              </button>
            </div>
          </div>

          {/* Center: Track Switcher */}
          <div className="flex items-center p-1 rounded-xl bg-zinc-100 border border-zinc-200/80">
            {TRACKS.map((t) => {
              const isSelected = activeTrack === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => handleSwitchTrack(t.id)}
                  className={`px-3.5 py-1 rounded-lg text-xs font-heading font-bold transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-white text-zinc-950 shadow-xs'
                      : 'text-zinc-500 hover:text-zinc-800'
                  }`}
                >
                  <span>{t.icon}</span>
                  <span>{t.name}</span>
                </button>
              );
            })}
          </div>

          {/* Right: Progress Stats, Lock Mode & Reset */}
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 font-mono text-xs text-zinc-500">
              <span className="text-zinc-400">Track:</span>
              <strong className="text-zinc-900">{completedInTrack}/{currentTrack.totalCount}</strong>
              <span className="px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-700 font-bold text-[10px]">
                {trackPercent}%
              </span>
            </div>

            <button
              type="button"
              onClick={() => setStrictLock(!strictLock)}
              title={strictLock ? 'Progression Lock: ON (All 4 Steps & 20m Required)' : 'Progression Lock: OFF'}
              className="p-1.5 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 transition-colors shadow-2xs"
            >
              {strictLock ? <Lock className="w-4 h-4 text-zinc-900" /> : <Unlock className="w-4 h-4 text-emerald-600" />}
            </button>

            <button
              type="button"
              onClick={handleResetTrack}
              title="Reset progress"
              className="p-1.5 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-400 hover:text-red-600 transition-colors shadow-2xs"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

        </div>
      </header>

      {/* 2. FULL-WIDTH SUB-HEADER / DAILY NAVIGATION STRIP */}
      <div className="w-full bg-white border-b border-zinc-200/70 px-4 sm:px-6 lg:px-8 py-2.5 shadow-2xs">
        <div className="w-full flex flex-wrap items-center justify-between gap-3">
          
          {/* Day Stepper & Title */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrevDay}
              disabled={!hasPrevDay}
              className="p-1 rounded-md text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
              title="Previous Day"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 text-xs">
              <span className="font-mono font-bold text-zinc-900 bg-zinc-100 px-2.5 py-0.5 rounded-md border border-zinc-200/60">
                Day {currentQuestion.day} of {currentTrack.days.length}
              </span>
              <span className="text-zinc-300 hidden sm:inline">•</span>
              <span className="font-heading font-bold text-zinc-800 hidden sm:inline">
                {currentDayInfo.title}
              </span>
            </div>

            <button
              type="button"
              onClick={handleNextDay}
              disabled={!hasNextDay}
              className="p-1 rounded-md text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
              title="Next Day"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Today's Questions Navigation Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar max-w-full py-0.5">
            <span className="text-[11px] font-mono font-bold text-zinc-400 uppercase tracking-wider mr-1 hidden md:inline">
              Today's Targets:
            </span>
            {questionsInCurrentDay.map((q, idx) => {
              const isSelected = currentQuestion.id === q.id;
              const isDone = !!completedMap[getQuestionKey(activeTrack, q.id)];
              const isUnlocked = isQuestionUnlocked(q.id);

              return (
                <button
                  key={q.id}
                  type="button"
                  disabled={!isUnlocked}
                  onClick={() => {
                    setActiveQuestionId(q.id);
                    setActiveTab('concept');
                  }}
                  className={`h-7 px-3 rounded-full text-xs font-mono font-semibold transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-zinc-950 text-white shadow-xs'
                      : isDone
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : !isUnlocked
                      ? 'text-zinc-300 cursor-not-allowed'
                      : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 hover:text-zinc-900'
                  }`}
                  title={q.title}
                >
                  {isDone ? (
                    <Check className="w-3 h-3 text-emerald-600 stroke-[3]" />
                  ) : !isUnlocked ? (
                    <Lock className="w-2.5 h-2.5 opacity-40" />
                  ) : null}
                  <span>Q{idx + 1}</span>
                  <span className="hidden lg:inline font-normal opacity-80">: {q.title.length > 22 ? q.title.slice(0, 22) + '...' : q.title}</span>
                </button>
              );
            })}
          </div>

          {/* Overall Day Time Info */}
          <div className="hidden lg:flex items-center gap-1.5 text-xs font-mono text-zinc-500">
            <Clock className="w-3.5 h-3.5 text-zinc-400" />
            <span>Active: {currentQuestion.startTime} — {currentQuestion.endTime} ({formatDuration(currentQuestion.endSeconds - currentQuestion.startSeconds)})</span>
          </div>

        </div>
      </div>

      {/* 3. FULL-WIDTH RESPONSIVE MULTI-COLUMN WORKSPACE */}
      <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-6">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* ======================================================== */}
          {/* LEFT COLUMN: VIDEO PLAYER, COMPLETION & CURRICULUM       */}
          {/* ======================================================== */}
          <div className="lg:col-span-6 xl:col-span-5 space-y-5">
            
            {/* Question Heading Card */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white border border-zinc-200/80 shadow-xs space-y-2">
              <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-zinc-500">
                <span className="px-2 py-0.5 rounded bg-zinc-950 text-white font-bold text-[11px]">
                  {currentTrack.fullName.toUpperCase()}
                </span>
                <span className="font-bold text-zinc-800">QUESTION #{currentQuestion.id}</span>
                <span>•</span>
                <span className="flex items-center gap-1 text-zinc-500">
                  <Clock className="w-3.5 h-3.5" />
                  {currentQuestion.startTime} — {currentQuestion.endTime} ({formatDuration(currentQuestion.endSeconds - currentQuestion.startSeconds)})
                </span>
              </div>

              <h1 className="font-heading font-extrabold text-xl sm:text-2xl text-zinc-950 tracking-tight leading-snug m-0">
                {currentQuestion.title}
              </h1>
            </div>

            {/* Video Player Card (Responsive 16:9 full width of left column) */}
            <div className="rounded-2xl overflow-hidden border border-zinc-200/80 bg-white shadow-xs p-3 sm:p-4 space-y-4">
              <div className="rounded-xl overflow-hidden bg-black shadow-xs">
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

              {/* Primary Completion Button & Time Gate */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center gap-3">
                  {isCurrentQuestionSatisfied || !strictLock ? (
                    /* Unlocked Button */
                    <button
                      type="button"
                      onClick={() => handleToggleComplete(currentQuestion.id)}
                      className={`flex-1 py-3 px-5 rounded-xl font-heading font-bold text-sm transition-all duration-150 flex items-center justify-center gap-2.5 shadow-xs ${
                        isCurrentCompleted
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                          : 'bg-zinc-950 hover:bg-black text-white'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                        isCurrentCompleted ? 'bg-white/20' : 'bg-white/10'
                      }`}>
                        {isCurrentCompleted ? (
                          <Check className="w-3 h-3 stroke-[3]" />
                        ) : (
                          <Play className="w-2 h-2 fill-white ml-0.5" />
                        )}
                      </div>
                      <span>
                        {isCurrentCompleted 
                          ? 'Mastered ✓ (Click to Undo)' 
                          : '20m & All Steps Complete! Mark Done & Unlock Next →'}
                      </span>
                    </button>
                  ) : (
                    /* Locked Button until both all steps AND 20m timer are completed */
                    <button
                      type="button"
                      onClick={() => {
                        if (!areAllStepsChecked) {
                          handleJumpToIncompleteTab();
                        }
                      }}
                      className="flex-1 py-3 px-5 rounded-xl font-heading font-bold text-sm bg-zinc-100 hover:bg-zinc-200/80 text-zinc-600 border border-zinc-200/90 transition-all flex items-center justify-center gap-2 shadow-xs group"
                    >
                      <Lock className="w-4 h-4 text-zinc-400 group-hover:text-zinc-600" />
                      <span>
                        {!isTimerDone && !areAllStepsChecked
                          ? `Complete 4 steps & 20m clock (${checkedStepsCount}/4 done • ${formatTimerDigits(timerSeconds)} left)`
                          : !isTimerDone && areAllStepsChecked
                          ? `Steps complete! Must spend full 20m on question (${formatTimerDigits(timerSeconds)} left)`
                          : `20m complete! Check off remaining steps (${checkedStepsCount}/${questionTabs.length} done)`}
                      </span>
                    </button>
                  )}

                  {/* Quick Next Arrow */}
                  <button
                    type="button"
                    onClick={() => hasNext && isNextUnlocked && setActiveQuestionId(currentQuestion.id + 1)}
                    disabled={!hasNext || !isNextUnlocked}
                    title={hasNext && !isNextUnlocked ? `Locked: Complete all 4 steps and 20m timer (${formatTimerDigits(timerSeconds)} left)` : 'Next question'}
                    className="p-3 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors shadow-2xs"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Step Check Pill Badges Strip */}
                <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono px-1 pt-1 border-t border-zinc-100">
                  <span className={isTimerDone ? 'text-emerald-600 font-bold' : 'text-zinc-500'}>
                    {isTimerDone ? '✓ 20m Focus Session Reached' : `Focus Session Clock: ${formatTimerDigits(timerSeconds)} left`}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {questionTabs.map((t) => {
                      const done = isTabChecked(t.id);
                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => setActiveTab(t.id)}
                          className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] transition-colors ${
                            done
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold'
                              : activeTab === t.id
                              ? 'bg-zinc-200 text-zinc-900 font-semibold'
                              : 'bg-zinc-50 text-zinc-500 hover:text-zinc-800'
                          }`}
                        >
                          {done ? <Check className="w-2.5 h-2.5 stroke-[3]" /> : <Circle className="w-2.5 h-2.5 text-zinc-300" />}
                          <span>{t.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

            </div>

            {/* Today's Curriculum Schedule Card */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white border border-zinc-200/80 shadow-xs space-y-3">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-zinc-600" />
                  <span>Day {currentQuestion.day} Questions</span>
                </span>
                <span className="text-zinc-500">
                  {questionsInCurrentDay.filter(q => !!completedMap[getQuestionKey(activeTrack, q.id)]).length} of {questionsInCurrentDay.length} Completed
                </span>
              </div>

              <div className="space-y-2">
                {questionsInCurrentDay.map((q, idx) => {
                  const isCurrent = currentQuestion.id === q.id;
                  const isDone = !!completedMap[getQuestionKey(activeTrack, q.id)];
                  const isUnlocked = isQuestionUnlocked(q.id);

                  return (
                    <button
                      key={q.id}
                      type="button"
                      disabled={!isUnlocked}
                      onClick={() => {
                        setActiveQuestionId(q.id);
                        setActiveTab('concept');
                      }}
                      className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                        isCurrent
                          ? 'border-zinc-950 bg-zinc-950 text-white shadow-xs'
                          : isDone
                          ? 'border-emerald-200 bg-emerald-50/60 text-zinc-900 hover:bg-emerald-50'
                          : !isUnlocked
                          ? 'border-zinc-100 bg-zinc-50 text-zinc-300 cursor-not-allowed opacity-60'
                          : 'border-zinc-200 bg-zinc-50 hover:bg-white text-zinc-800'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center font-mono text-[11px] font-bold flex-shrink-0 ${
                          isCurrent
                            ? 'bg-white/20 text-white'
                            : isDone
                            ? 'bg-emerald-500 text-white'
                            : 'bg-zinc-200 text-zinc-700'
                        }`}>
                          {isDone ? <Check className="w-3 h-3 stroke-[3]" /> : idx + 1}
                        </span>
                        <div className="min-w-0">
                          <p className="font-heading font-bold text-xs sm:text-sm truncate m-0">
                            {q.title}
                          </p>
                          <span className={`font-mono text-[10px] block mt-0.5 ${
                            isCurrent ? 'text-zinc-300' : 'text-zinc-400'
                          }`}>
                            {q.startTime} — {q.endTime}
                          </span>
                        </div>
                      </div>

                      <div className="flex-shrink-0">
                        {isDone ? (
                          <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                            isCurrent ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            DONE
                          </span>
                        ) : !isUnlocked ? (
                          <Lock className="w-3.5 h-3.5 text-zinc-300" />
                        ) : (
                          <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                            isCurrent ? 'bg-white/20 text-white' : 'bg-zinc-100 text-zinc-600'
                          }`}>
                            {isCurrent ? 'ACTIVE' : 'READY'}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

          </div>

          {/* ======================================================== */}
          {/* RIGHT COLUMN: FOCUS CLOCK & INTERACTIVE PRACTICE TABS    */}
          {/* ======================================================== */}
          <div className="lg:col-span-6 xl:col-span-7 space-y-5">
            
            {/* Focus Session Header with Proper Colored Clock on the Right */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white border border-zinc-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1 flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${timerSeconds === 0 ? 'bg-emerald-500' : isTimerRunning ? 'bg-amber-500 animate-pulse' : 'bg-zinc-400'}`} />
                  <span className="text-xs font-mono font-extrabold uppercase tracking-wider text-zinc-700">
                    20-Minute Focus Clock
                  </span>
                </div>
                <h3 className="font-heading font-extrabold text-base sm:text-lg text-zinc-950 m-0">
                  Concept Mastery & Spoken Rehearsal
                </h3>
                <p className="text-xs text-zinc-500 m-0 font-sans leading-relaxed">
                  Complete each of the 4 steps below and maintain active focus for the full 20 minutes before unlocking the next question.
                </p>
              </div>

              {/* 20-MINUTE COLORED CIRCULAR CLOCK FACE (Right Side) */}
              <div className="flex-shrink-0 flex items-center justify-center pt-2 sm:pt-0 sm:pl-4 sm:border-l sm:border-zinc-100">
                <CircularTimer
                  secondsLeft={timerSeconds}
                  totalSeconds={QUESTION_TIMER_SECONDS}
                  isRunning={isTimerRunning}
                  onToggleRunning={() => setIsTimerRunning(!isTimerRunning)}
                  onReset={() => {
                    setTimerSeconds(QUESTION_TIMER_SECONDS);
                    setIsTimerRunning(true);
                  }}
                  size={96}
                  strokeWidth={6}
                  colorScheme="focus"
                  label="20M FOCUS"
                  completedLabel="20m DONE"
                  subLabel={timerSeconds === 0 ? 'DONE' : isTimerRunning ? 'FOCUS' : 'PAUSED'}
                />
              </div>
            </div>

            {/* Interactive Practice Tabs (Concept, Syntax, Practice Task, My Script) */}
            <div className="rounded-2xl border border-zinc-200/80 bg-white shadow-xs overflow-hidden">
              
              {/* Tab Navigation Strip with Checkboxes */}
              <div className="border-b border-zinc-100 bg-zinc-50/70 p-1 flex items-center gap-1 overflow-x-auto no-scrollbar">
                {questionTabs.map((tab) => {
                  const isSelected = activeTab === tab.id;
                  const isChecked = isTabChecked(tab.id);
                  const TabIcon = tab.icon;

                  return (
                    <div
                      key={tab.id}
                      className={`flex items-center rounded-lg transition-all ${
                        isSelected
                          ? 'bg-white shadow-xs text-zinc-950 font-bold'
                          : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100/60'
                      }`}
                    >
                      {/* Clickable Tab Checkbox Button */}
                      <button
                        type="button"
                        onClick={(e) => handleToggleTabCheck(tab.id, e)}
                        title={isChecked ? `Uncheck ${tab.label}` : `Mark ${tab.label} as completed`}
                        className="pl-2.5 pr-1.5 py-1.5 focus:outline-none"
                      >
                        {isChecked ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Circle className="w-4 h-4 text-zinc-300 hover:text-zinc-400" />
                        )}
                      </button>

                      {/* Tab Selector Button */}
                      <button
                        type="button"
                        onClick={() => setActiveTab(tab.id)}
                        className="pr-3 py-1.5 text-xs font-heading flex items-center gap-1.5 focus:outline-none"
                      >
                        <TabIcon className={`w-3.5 h-3.5 ${tab.iconColor}`} />
                        <span className={isChecked ? 'line-through decoration-zinc-300 opacity-80' : ''}>
                          {tab.label}
                        </span>
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Tab Body */}
              <div className="p-5 sm:p-6 min-h-[340px] flex flex-col justify-between">
                
                {/* CONTENT VIEWS */}
                <div className="space-y-4">
                  
                  {/* 1. CONCEPT TAB */}
                  {activeTab === 'concept' && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400">
                          STEP 1: CORE INTERVIEW TAKEAWAY
                        </span>
                        {isTabChecked('concept') && (
                          <span className="text-[11px] font-mono font-bold text-emerald-600 flex items-center gap-1">
                            <Check className="w-3 h-3 stroke-[3]" /> Concept Understood
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-zinc-800 leading-relaxed font-sans">
                        <FormattedSummary text={currentQuestion.summary} />
                      </div>
                    </div>
                  )}

                  {/* 2. SYNTAX & CODE TAB */}
                  {activeTab === 'code' && currentQuestion.tip && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400">
                          STEP 2: SYNTAX & QUICK RECALL
                        </span>
                        {isTabChecked('code') && (
                          <span className="text-[11px] font-mono font-bold text-emerald-600 flex items-center gap-1">
                            <Check className="w-3 h-3 stroke-[3]" /> Code Reviewed
                          </span>
                        )}
                      </div>
                      <CodeBlock code={currentQuestion.tip} />
                    </div>
                  )}

                  {/* 3. PROPERLY FORMATTED PRACTICE TASK */}
                  {activeTab === 'challenge' && challenge && (
                    <div className="space-y-5">
                      
                      {/* Challenge Header & REPL Button */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-zinc-100">
                        <div>
                          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-purple-600 block">
                            STEP 3: PRACTICAL VERIFICATION DRILL
                          </span>
                          <h3 className="font-heading font-extrabold text-base text-zinc-950 mt-0.5">
                            {challenge.title}
                          </h3>
                        </div>

                        <a
                          href={challenge.replLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-950 hover:bg-black text-white text-xs font-mono font-bold transition-colors shadow-xs"
                        >
                          <Terminal className="w-3.5 h-3.5 text-amber-400" />
                          <span>Launch Online REPL ↗</span>
                        </a>
                      </div>

                      {/* Step-by-Step Instructions */}
                      <div className="space-y-2">
                        <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-400">
                          Action Items to Run:
                        </span>
                        <ol className="list-none p-0 m-0 space-y-1.5">
                          {challenge.steps.map((step, idx) => (
                            <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-[13px] text-zinc-800 leading-relaxed">
                              <span className="w-5 h-5 rounded-full bg-zinc-100 text-zinc-700 font-mono text-[11px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                                {idx + 1}
                              </span>
                              <span className="flex-1 font-sans">
                                <FormattedSummary text={step} />
                              </span>
                            </li>
                          ))}
                        </ol>
                      </div>

                      {/* Executable Code Snippet Box with Copy Button */}
                      {challenge.codeSnippet && (
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-400">
                              Verification Script:
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCopySnippet(challenge.codeSnippet)}
                              className="inline-flex items-center gap-1 text-[11px] font-mono text-zinc-500 hover:text-zinc-950 transition-colors"
                            >
                              {snippetCopied ? (
                                <>
                                  <Check className="w-3 h-3 text-emerald-600 stroke-[3]" />
                                  <span className="text-emerald-600 font-bold">Copied to Clipboard</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3" />
                                  <span>Copy Script</span>
                                </>
                              )}
                            </button>
                          </div>

                          <div className="rounded-xl overflow-hidden border border-zinc-800 bg-[#0d1117] p-3.5 font-mono text-xs sm:text-[13px] text-emerald-300 overflow-x-auto shadow-xs">
                            <pre className="m-0 leading-relaxed whitespace-pre font-mono">
                              {challenge.codeSnippet}
                            </pre>
                          </div>
                        </div>
                      )}

                      {/* Expected Terminal Output */}
                      {challenge.expectedOutput && (
                        <div className="space-y-1.5">
                          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-400">
                            Expected Terminal Output:
                          </span>
                          <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3 font-mono text-xs text-zinc-700 leading-relaxed overflow-x-auto">
                            <pre className="m-0 whitespace-pre font-mono">
                              {challenge.expectedOutput}
                            </pre>
                          </div>
                        </div>
                      )}

                      {/* Interviewer Deep-Dive Trap Question (with Reveal Button) */}
                      <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4 space-y-2.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[11px] font-mono font-extrabold uppercase tracking-wider text-amber-800">
                            INTERVIEWER DEEP-DIVE QUESTION
                          </span>
                          
                          <button
                            type="button"
                            onClick={() => setShowAnswer(!showAnswer)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white border border-amber-300 text-[11px] font-mono font-bold text-amber-900 hover:bg-amber-100 transition-colors shadow-xs"
                          >
                            {showAnswer ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                            <span>{showAnswer ? 'Hide Answer' : 'Reveal Answer'}</span>
                          </button>
                        </div>

                        <p className="text-xs sm:text-sm text-zinc-900 font-medium leading-relaxed font-sans m-0">
                          "{challenge.interviewQuestion}"
                        </p>

                        {/* Collapsible Answer */}
                        {showAnswer && (
                          <div className="pt-2 border-t border-amber-200/80 text-xs sm:text-[13px] text-amber-950 leading-relaxed font-sans">
                            <strong className="font-heading font-extrabold text-[11px] uppercase tracking-wide text-amber-900 block mb-1">
                              Model Interview Response:
                            </strong>
                            <p className="m-0 leading-relaxed">
                              {challenge.interviewAnswer}
                            </p>
                          </div>
                        )}
                      </div>

                    </div>
                  )}

                  {/* 4. SCRIPT TAB: WITH REAL CONVERSATIONAL PROMPT, 5M COLORED CLOCK & GATED SOLUTION */}
                  {activeTab === 'notes' && scriptData && (
                    <div className="space-y-5">
                      
                      {/* Script Header with 5-Minute Colored Circular Clock on the Right */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-purple-50/60 border border-purple-200/80">
                        <div className="space-y-1.5 flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono font-extrabold uppercase tracking-wider text-purple-700 bg-purple-100/90 px-2 py-0.5 rounded">
                              STEP 4: 60-SECOND SPOKEN INTERVIEW REHEARSAL
                            </span>
                            {isTabChecked('notes') && (
                              <span className="text-[11px] font-mono font-bold text-emerald-700 flex items-center gap-1">
                                <Check className="w-3 h-3 stroke-[3]" /> Rehearsed ✓
                              </span>
                            )}
                          </div>
                          <p className="text-xs sm:text-sm font-semibold text-zinc-900 leading-snug m-0">
                            Top interviewers grade your spoken articulation and structured reasoning under pressure. Draft your answer, then rehearse speaking it aloud for 60 seconds.
                          </p>
                        </div>

                        {/* 5-MINUTE SCRIPT TIMER CLOCK (Right Side) */}
                        <div className="flex-shrink-0 flex items-center justify-center pt-2 sm:pt-0 sm:pl-3 sm:border-l sm:border-purple-200/60">
                          <CircularTimer
                            secondsLeft={scriptTimerSeconds}
                            totalSeconds={SCRIPT_TIMER_SECONDS}
                            isRunning={isScriptTimerRunning && activeTab === 'notes'}
                            onToggleRunning={() => setIsScriptTimerRunning(!isScriptTimerRunning)}
                            onReset={() => {
                              setScriptTimerSeconds(SCRIPT_TIMER_SECONDS);
                              setIsScriptTimerRunning(true);
                            }}
                            size={84}
                            strokeWidth={5}
                            colorScheme="script"
                            label="5M Script Gate"
                            completedLabel="UNLOCKED"
                            subLabel={scriptTimerSeconds === 0 ? 'UNLOCKED' : isScriptTimerRunning ? 'DRAFTING' : 'PAUSED'}
                          />
                        </div>
                      </div>

                      {/* Real Interviewer Conversational Prompt Box */}
                      <div className="rounded-xl border border-zinc-200/90 bg-zinc-50/80 p-4 space-y-3">
                        <div className="flex items-center justify-between text-xs font-mono text-zinc-500">
                          <div className="flex items-center gap-1.5 font-bold text-zinc-800 uppercase tracking-wider text-[11px]">
                            <Mic className="w-3.5 h-3.5 text-purple-600" />
                            <span>Live Interviewer Question:</span>
                          </div>
                          <span className="text-[10px] font-mono text-zinc-400">
                            Target: 60 Seconds Out Loud
                          </span>
                        </div>

                        <blockquote className="m-0 text-sm sm:text-[15px] font-heading font-bold text-zinc-950 leading-relaxed italic border-l-3 border-purple-600 pl-3.5">
                          "{scriptData.prompt}"
                        </blockquote>

                        {/* 3-Point Senior Answer Blueprint */}
                        <div className="pt-2 border-t border-zinc-200/70 grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
                          {scriptData.framework.map((f, i) => (
                            <div key={i} className="p-2.5 rounded-lg bg-white border border-zinc-200/80 shadow-xs flex flex-col justify-between">
                              <span className="font-mono font-extrabold text-purple-700 text-[10px] uppercase tracking-wider mb-1">
                                {f.time}
                              </span>
                              <span className="text-zinc-700 font-sans leading-tight">
                                {f.point}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* User's Drafting Area (Textarea) */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs text-zinc-500 font-mono">
                          <span>Draft your response in your own words:</span>
                          <span>
                            {currentNote.trim() ? currentNote.trim().split(/\s+/).filter(Boolean).length : 0} words
                          </span>
                        </div>

                        <textarea
                          value={currentNote}
                          onChange={(e) => setCurrentNote(e.target.value)}
                          onBlur={handleSaveNote}
                          placeholder="Draft your 60-second explanation here. Follow the 3-point blueprint: 1) Core definition, 2) Mechanism & edge cases, 3) Production guidelines..."
                          rows={6}
                          className="w-full text-xs sm:text-sm font-sans bg-zinc-50 border border-zinc-200 rounded-xl p-3.5 text-zinc-900 focus:outline-none focus:bg-white focus:border-zinc-950 transition-colors placeholder:text-zinc-400 resize-y leading-relaxed"
                        />

                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-mono text-zinc-400">
                            Auto-checks when typed • Saves on blur
                          </span>
                          <button
                            type="button"
                            onClick={handleSaveNote}
                            className="px-3.5 py-1.5 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-100 text-xs font-semibold text-zinc-800 transition-colors shadow-xs"
                          >
                            Save Script
                          </button>
                        </div>
                      </div>

                      {/* GATED SENIOR DEVELOPER SOLUTION (Requires 5 minutes on the script tab) */}
                      <div className="pt-2">
                        {!isScriptTimerDone ? (
                          /* LOCKED STATE: User has not spent 5 minutes drafting */
                          <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="space-y-1">
                              <div className="flex items-center gap-1.5 text-xs font-bold font-mono text-amber-900">
                                <Lock className="w-4 h-4 text-amber-600" />
                                <span>Model Senior Answer Gated (5-Minute Drafting Required)</span>
                              </div>
                              <p className="text-xs text-amber-800 m-0 leading-relaxed font-sans">
                                Senior interviewers test independent reasoning. Spend at least 5 minutes drafting and reciting your explanation before viewing the model answer.
                              </p>
                            </div>

                            <button
                              type="button"
                              disabled
                              className="px-4 py-2 rounded-xl bg-amber-200/80 text-amber-900 text-xs font-mono font-bold flex items-center justify-center gap-2 cursor-not-allowed flex-shrink-0"
                            >
                              <Lock className="w-3.5 h-3.5" />
                              <span>Locked ({formatTimerDigits(scriptTimerSeconds)} left)</span>
                            </button>
                          </div>
                        ) : (
                          /* UNLOCKED STATE: 5 minutes reached */
                          <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-4 space-y-3">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-xs font-mono font-bold text-emerald-800">
                                  5 Minutes Reached! Model Senior Solution Unlocked
                                </span>
                              </div>

                              <button
                                type="button"
                                onClick={() => setShowModelSolution(!showModelSolution)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-950 hover:bg-black text-white text-xs font-mono font-bold transition-all shadow-xs"
                              >
                                {showModelSolution ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                <span>{showModelSolution ? 'Hide Model Answer' : 'Show Model Senior Answer'}</span>
                              </button>
                            </div>

                            {/* REVEALED MODEL SOLUTION */}
                            {showModelSolution && (
                              <div className="pt-3 border-t border-emerald-200/80 space-y-3 font-sans">
                                <div>
                                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-800 block mb-1">
                                    Verbatim 60-Second Senior Spoken Script (Rehearse Out Loud):
                                  </span>
                                  <div className="p-3.5 rounded-xl bg-white border border-emerald-200/90 text-xs sm:text-sm text-zinc-900 leading-relaxed font-sans whitespace-pre-line shadow-xs">
                                    {scriptData.spokenScript}
                                  </div>
                                </div>

                                {/* Keywords to Speak & Junior Candidate Pitfall */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                                  <div className="p-3 rounded-lg bg-white border border-emerald-100 space-y-1.5">
                                    <strong className="text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-700 block">
                                      Keywords to Speak Out Loud:
                                    </strong>
                                    <div className="flex flex-wrap gap-1">
                                      {scriptData.buzzwords.map((w, idx) => (
                                        <span key={idx} className="font-mono text-[11px] bg-emerald-50 text-emerald-900 border border-emerald-200 px-1.5 py-0.5 rounded">
                                          {w}
                                        </span>
                                      ))}
                                    </div>
                                  </div>

                                  <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 space-y-1">
                                    <strong className="text-[11px] font-mono font-bold uppercase tracking-wider text-amber-900 block">
                                      Junior Pitfall to Avoid:
                                    </strong>
                                    <p className="text-zinc-800 m-0 leading-relaxed text-[11px] sm:text-xs font-sans">
                                      {scriptData.juniorMistake}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                    </div>
                  )}

                </div>

                {/* TAB BOTTOM ACTION BAR */}
                <div className="mt-6 pt-3 border-t border-zinc-100 flex items-center justify-between gap-3 text-xs">
                  
                  {/* Check Button for the active tab */}
                  <button
                    type="button"
                    onClick={() => handleToggleTabCheck(activeTab)}
                    className={`px-3 py-1.5 rounded-lg border font-semibold flex items-center gap-1.5 transition-colors ${
                      isTabChecked(activeTab)
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                        : 'border-zinc-200 bg-zinc-50 hover:bg-zinc-100 text-zinc-700'
                    }`}
                  >
                    {isTabChecked(activeTab) ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Completed ✓</span>
                      </>
                    ) : (
                      <>
                        <Circle className="w-4 h-4 text-zinc-400" />
                        <span>Mark this Step Done</span>
                      </>
                    )}
                  </button>

                  {/* Advance to next tab button */}
                  {questionTabs.findIndex((t) => t.id === activeTab) < questionTabs.length - 1 && (
                    <button
                      type="button"
                      onClick={() => handleMarkTabDoneAndNext(activeTab)}
                      className="px-3 py-1.5 rounded-lg font-semibold text-zinc-700 hover:text-zinc-950 hover:bg-zinc-100 flex items-center gap-1 transition-colors"
                    >
                      <span>Next Step</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}

                </div>

              </div>

            </div>

          </div>

        </div>
      </main>

      {/* Clean Minimal Full-Width Footer */}
      <footer className="w-full mt-auto px-6 py-4 border-t border-zinc-200/70 bg-white text-center text-xs text-zinc-400 font-mono">
        Backend Dev Journey • 30-Day Interview Preparation Workspace
      </footer>

    </div>
  );
}
