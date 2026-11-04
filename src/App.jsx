import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  TRACKS_DATA,
  TRACKS
} from './data/questions';
import { 
  getQuestionChallenge, 
  getQuestionScriptData, 
  getQuestionDocSpecs 
} from './data/challenges';
import db, { QUESTION_TIMER_SECONDS, SCRIPT_TIMER_SECONDS } from './services/db';
import YouTubePlayer from './components/YouTubePlayer';
import CircularTimer from './components/CircularTimer';
import { Admonition, DocCodeBlock, DocTable } from './components/DocusaurusDoc';
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
  Award,
  AlertCircle,
  ShieldAlert,
  Brain,
  PenTool,
  HelpCircle,
  X
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
              className="inline-block font-mono text-[11px] sm:text-xs px-1.5 py-0.5 mx-0.5 rounded bg-[#202532] text-amber-300 font-semibold border border-[#303748] shadow-xs"
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

export default function App() {
  // Active track: 'django' or 'python'
  const [activeTrack, setActiveTrack] = useState(() => db.getActiveTrack());

  // Track Data
  const currentTrack = TRACKS_DATA[activeTrack] || TRACKS_DATA.django;

  // Active question ID per track
  const [activeQuestionId, setActiveQuestionId] = useState(() => db.getActiveQuestion(db.getActiveTrack()));

  // Completed questions map { [track_id_qid]: boolean }
  const [completedMap, setCompletedMap] = useState(() => db.getCompletedMap());

  // Tab checklist items map { [track_id_qid_tabId]: boolean }
  const [tabChecksMap, setTabChecksMap] = useState(() => db.getTabChecksMap());

  // Notes map { [track_id_qid]: string }
  const [notesMap, setNotesMap] = useState(() => db.getNotesMap());

  // Strict lock mode
  const [strictLock, setStrictLock] = useState(() => db.getStrictLock());

  // Friction-unlocked questions map { [track_qid]: boolean }
  const [unlockedQuestionsMap, setUnlockedQuestionsMap] = useState(() => db.getUnlockedMap());

  // Friction Gate Modal State: null | { type: 'question' | 'toggle_lock' | 'complete', targetQid?: number }
  const [frictionGateModal, setFrictionGateModal] = useState(null);
  const [frictionChecks, setFrictionChecks] = useState({
    runtimeMechanism: false,
    verbalRecall: false,
    antiRushingCommitment: false,
  });
  const [holdProgress, setHoldProgress] = useState(0);
  const [isHolding, setIsHolding] = useState(false);

  // Helper for question key
  const getQuestionKey = useCallback((trackId, qId) => `${trackId}_${qId}`, []);

  // Current active question's timer balances (initialized directly from DB!)
  const initialTimer = useMemo(() => {
    const t = db.getActiveTrack();
    const q = db.getActiveQuestion(t);
    const isDone = !!db.getCompletedMap()[`${t}_${q}`];
    return db.getQuestionTimer(t, q, isDone);
  }, []);

  const [timerSeconds, setTimerSeconds] = useState(initialTimer.secondsLeft);
  const [isTimerRunning, setIsTimerRunning] = useState(initialTimer.isRunning);
  const [scriptTimerSeconds, setScriptTimerSeconds] = useState(initialTimer.scriptSecondsLeft);
  const [isScriptTimerRunning, setIsScriptTimerRunning] = useState(initialTimer.isRunning);

  // Active tab: 'concept' | 'code' | 'challenge' | 'notes'
  const [activeTab, setActiveTab] = useState('concept');
  const [loopMode, setLoopMode] = useState(false);
  const [currentNote, setCurrentNote] = useState(() => notesMap[getQuestionKey(activeTrack, activeQuestionId)] || '');
  const [showAnswer, setShowAnswer] = useState(false);
  const [showModelSolution, setShowModelSolution] = useState(false);
  const [snippetCopied, setSnippetCopied] = useState(false);

  // Word count of current spoken response
  const currentNoteWords = useMemo(() => {
    if (!currentNote || !currentNote.trim()) return 0;
    return currentNote.trim().split(/\s+/).filter(Boolean).length;
  }, [currentNote]);

  // All 3 reflection checks satisfied
  const allChecksChecked = Boolean(
    frictionChecks.runtimeMechanism &&
    frictionChecks.verbalRecall &&
    frictionChecks.antiRushingCommitment
  );

  // Sync note on question change
  useEffect(() => {
    setCurrentNote(notesMap[getQuestionKey(activeTrack, activeQuestionId)] || '');
  }, [activeTrack, activeQuestionId, notesMap, getQuestionKey]);

  // Reset friction checks when modal opens or closes
  useEffect(() => {
    if (frictionGateModal) {
      setFrictionChecks({
        runtimeMechanism: false,
        verbalRecall: false,
        antiRushingCommitment: false,
      });
      setHoldProgress(0);
      setIsHolding(false);
    }
  }, [frictionGateModal]);

  // Refs to allow stable intervals without restarting every second
  const scriptTimerSecondsRef = React.useRef(scriptTimerSeconds);
  useEffect(() => {
    scriptTimerSecondsRef.current = scriptTimerSeconds;
  }, [scriptTimerSeconds]);

  const timerSecondsRef = React.useRef(timerSeconds);
  useEffect(() => {
    timerSecondsRef.current = timerSeconds;
  }, [timerSeconds]);

  // Run the 20-minute question countdown interval
  useEffect(() => {
    if (!isTimerRunning) return;

    const interval = setInterval(() => {
      setTimerSeconds((prev) => {
        if (prev <= 1) {
          setIsTimerRunning(false);
          db.saveQuestionTimer(activeTrack, activeQuestionId, {
            secondsLeft: 0,
            scriptSecondsLeft: scriptTimerSecondsRef.current,
            isRunning: false,
          });
          return 0;
        }
        const next = prev - 1;
        db.saveQuestionTimer(activeTrack, activeQuestionId, {
          secondsLeft: next,
          scriptSecondsLeft: scriptTimerSecondsRef.current,
          isRunning: true,
        });
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isTimerRunning, activeTrack, activeQuestionId]);

  // Run the 5-minute script countdown interval (only when in 'notes' tab and running)
  useEffect(() => {
    if (activeTab !== 'notes' || !isScriptTimerRunning) return;

    const interval = setInterval(() => {
      setScriptTimerSeconds((prev) => {
        if (prev <= 1) {
          setIsScriptTimerRunning(false);
          db.saveQuestionTimer(activeTrack, activeQuestionId, {
            secondsLeft: timerSecondsRef.current,
            scriptSecondsLeft: 0,
            isRunning: isTimerRunning,
          });
          return 0;
        }
        const next = prev - 1;
        db.saveQuestionTimer(activeTrack, activeQuestionId, {
          secondsLeft: timerSecondsRef.current,
          scriptSecondsLeft: next,
          isRunning: isTimerRunning,
        });
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [activeTab, isScriptTimerRunning, activeTrack, activeQuestionId, isTimerRunning]);

  // Sync tab title with active 20m timer
  useEffect(() => {
    const formatted = formatTimerDigits(timerSeconds);
    const prefix = timerSeconds === 0 ? '✓ (20m Done)' : isTimerRunning ? `(${formatted})` : `(Paused ${formatted})`;
    document.title = `${prefix} Q${activeQuestionId}: ${currentTrack.name} - Backend Dev`;
  }, [timerSeconds, isTimerRunning, activeQuestionId, currentTrack.name]);

  // Persist timer on window unload/refresh
  useEffect(() => {
    const handleUnload = () => {
      db.saveQuestionTimer(activeTrack, activeQuestionId, {
        secondsLeft: timerSeconds,
        scriptSecondsLeft: scriptTimerSeconds,
        isRunning: isTimerRunning,
      });
    };
    window.addEventListener('beforeunload', handleUnload);
    return () => window.removeEventListener('beforeunload', handleUnload);
  }, [activeTrack, activeQuestionId, timerSeconds, scriptTimerSeconds, isTimerRunning]);

  // Atomic Question Selection: saves previous timer and loads new question timer
  const handleSelectQuestion = useCallback((targetQid) => {
    if (targetQid === activeQuestionId) return;

    // 1. Save current question timer to DB
    db.saveQuestionTimer(activeTrack, activeQuestionId, {
      secondsLeft: timerSeconds,
      scriptSecondsLeft: scriptTimerSeconds,
      isRunning: isTimerRunning,
    });

    // 2. Persist new active question ID in DB
    db.setActiveQuestion(activeTrack, targetQid);
    setActiveQuestionId(targetQid);

    // 3. Load target question timer from DB
    const isTargetDone = !!completedMap[getQuestionKey(activeTrack, targetQid)];
    const nextTimer = db.getQuestionTimer(activeTrack, targetQid, isTargetDone);

    setTimerSeconds(nextTimer.secondsLeft);
    setScriptTimerSeconds(nextTimer.scriptSecondsLeft);
    setIsTimerRunning(nextTimer.isRunning);

    // Reset modals/toggles
    setShowAnswer(false);
    setShowModelSolution(false);
  }, [activeTrack, activeQuestionId, timerSeconds, scriptTimerSeconds, isTimerRunning, completedMap, getQuestionKey]);

  // Atomic Track Switch: saves previous track timer and loads new track timer
  const handleSwitchTrack = useCallback((trackId) => {
    if (trackId === activeTrack) return;

    // 1. Save current question timer to DB
    db.saveQuestionTimer(activeTrack, activeQuestionId, {
      secondsLeft: timerSeconds,
      scriptSecondsLeft: scriptTimerSeconds,
      isRunning: isTimerRunning,
    });

    // 2. Set new active track in DB
    db.setActiveTrack(trackId);
    setActiveTrack(trackId);

    // 3. Look up last active question for this track
    const targetQid = db.getActiveQuestion(trackId);
    setActiveQuestionId(targetQid);

    // 4. Load target question timer from DB
    const isTargetDone = !!completedMap[getQuestionKey(trackId, targetQid)];
    const nextTimer = db.getQuestionTimer(trackId, targetQid, isTargetDone);

    setTimerSeconds(nextTimer.secondsLeft);
    setScriptTimerSeconds(nextTimer.scriptSecondsLeft);
    setIsTimerRunning(nextTimer.isRunning);

    setActiveTab('concept');
    setShowAnswer(false);
    setShowModelSolution(false);
  }, [activeTrack, activeQuestionId, timerSeconds, scriptTimerSeconds, isTimerRunning, completedMap, getQuestionKey]);

  // Timer Control Handlers
  const handleToggleTimer = useCallback(() => {
    setIsTimerRunning((prev) => {
      const next = !prev;
      db.saveQuestionTimer(activeTrack, activeQuestionId, {
        secondsLeft: timerSeconds,
        scriptSecondsLeft: scriptTimerSeconds,
        isRunning: next,
      });
      return next;
    });
  }, [activeTrack, activeQuestionId, timerSeconds, scriptTimerSeconds]);

  const handleResetTimer = useCallback(() => {
    setTimerSeconds(QUESTION_TIMER_SECONDS);
    setIsTimerRunning(true);
    db.saveQuestionTimer(activeTrack, activeQuestionId, {
      secondsLeft: QUESTION_TIMER_SECONDS,
      scriptSecondsLeft: scriptTimerSeconds,
      isRunning: true,
    });
  }, [activeTrack, activeQuestionId, scriptTimerSeconds]);

  const handleToggleScriptTimer = useCallback(() => {
    setIsScriptTimerRunning((prev) => {
      const next = !prev;
      db.saveQuestionTimer(activeTrack, activeQuestionId, {
        secondsLeft: timerSeconds,
        scriptSecondsLeft: scriptTimerSeconds,
        isRunning: isTimerRunning,
      });
      return next;
    });
  }, [activeTrack, activeQuestionId, timerSeconds, scriptTimerSeconds, isTimerRunning]);

  const handleResetScriptTimer = useCallback(() => {
    setScriptTimerSeconds(SCRIPT_TIMER_SECONDS);
    setIsScriptTimerRunning(true);
    db.saveQuestionTimer(activeTrack, activeQuestionId, {
      secondsLeft: timerSeconds,
      scriptSecondsLeft: SCRIPT_TIMER_SECONDS,
      isRunning: isTimerRunning,
    });
  }, [activeTrack, activeQuestionId, timerSeconds, isTimerRunning]);

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

  // Documentation specifications matching https://developers.facia.ai/mobile/sdks/
  const docSpecs = useMemo(() => {
    return getQuestionDocSpecs(activeTrack, currentQuestion);
  }, [activeTrack, currentQuestion]);

  // Required checkable tabs for this question
  const questionTabs = useMemo(() => {
    const tabs = [
      { id: 'concept', label: 'Overview & Specs', icon: Lightbulb, iconColor: 'text-amber-500' },
      { id: 'code', label: 'Commands & Syntax', icon: Code2, iconColor: 'text-cyan-500' },
    ];
    if (challenge) {
      tabs.push({ id: 'challenge', label: 'Practice Task', icon: Sparkles, iconColor: 'text-purple-500' });
    }
    tabs.push({ id: 'notes', label: 'My Script', icon: FileText, iconColor: 'text-emerald-500' });
    return tabs;
  }, [challenge]);

  // Check if a specific tab is checked for the current question
  const isTabChecked = useCallback((tabId) => {
    const key = `${getQuestionKey(activeTrack, currentQuestion.id)}_${tabId}`;
    return !!tabChecksMap[key];
  }, [activeTrack, currentQuestion.id, getQuestionKey, tabChecksMap]);

  // Toggle check state for a specific tab
  const handleToggleTabCheck = useCallback((tabId, e) => {
    if (e) e.stopPropagation();
    const key = `${getQuestionKey(activeTrack, currentQuestion.id)}_${tabId}`;
    const nextVal = !tabChecksMap[key];

    // Deliberate friction for My Script: prompt if checking off without drafting
    if (tabId === 'notes' && nextVal && strictLock) {
      if (currentNoteWords < 25) {
        const confirmCheck = window.confirm(
          `Your spoken response draft currently has ${currentNoteWords} words (recommended: at least 25 words to cement interview recall).\n\nDo you want to check it off anyway without writing out your thoughts?`
        );
        if (!confirmCheck) return;
      }
    }

    db.setTabCheck(activeTrack, currentQuestion.id, tabId, nextVal);
    setTabChecksMap(db.getTabChecksMap());
  }, [activeTrack, currentNoteWords, currentQuestion.id, getQuestionKey, strictLock, tabChecksMap]);

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
    const isIndividuallyUnlocked = !!unlockedQuestionsMap[getQuestionKey(activeTrack, qId)];
    return currentDone || prevDone || isIndividuallyUnlocked;
  }, [strictLock, completedMap, unlockedQuestionsMap, activeTrack, getQuestionKey]);

  // Toggle overall question completion
  const handleToggleComplete = useCallback((id, forceBypass = false) => {
    const key = getQuestionKey(activeTrack, id);
    const isCurrentlyDone = !!completedMap[key];
    const isTimerDone = timerSeconds === 0;

    // Strict time enforcement: cannot mark complete before 20 minutes unless unlocking/undoing or strictLock is off or forceBypass
    if (strictLock && !isTimerDone && !isCurrentlyDone && !forceBypass) {
      setFrictionGateModal({ type: 'complete', targetQid: id });
      return;
    }

    const isNowDone = !isCurrentlyDone;
    
    // Save completion state to DB
    db.setCompleted(activeTrack, id, isNowDone);
    setCompletedMap(db.getCompletedMap());

    if (isNowDone) {
      setTimerSeconds(0);
      setScriptTimerSeconds(0);
      setIsTimerRunning(false);

      // Check all 4 steps for this question in DB and state
      db.setAllTabChecksForQuestion(activeTrack, id, ['concept', 'code', 'challenge', 'notes'], true);
      setTabChecksMap(db.getTabChecksMap());
    }

    // If marked done, advance to next question
    if (isNowDone && id < currentTrack.questions.length) {
      setTimeout(() => {
        handleSelectQuestion(id + 1);
        setActiveTab('concept');
      }, 300);
    }
  }, [activeTrack, completedMap, currentTrack.questions.length, getQuestionKey, handleSelectQuestion, strictLock, timerSeconds]);

  // Friction Gate Unlock Executor
  const handleExecuteFrictionUnlock = useCallback(() => {
    if (!frictionGateModal) return;
    setIsHolding(false);

    if (frictionGateModal.type === 'question') {
      const targetQid = frictionGateModal.targetQid;
      db.setQuestionUnlocked(activeTrack, targetQid, true);
      setUnlockedQuestionsMap(db.getUnlockedMap());
      handleSelectQuestion(targetQid);
      setActiveTab('concept');
      setFrictionGateModal(null);
    } else if (frictionGateModal.type === 'toggle_lock') {
      db.setStrictLock(false);
      setStrictLock(false);
      setFrictionGateModal(null);
    } else if (frictionGateModal.type === 'complete') {
      handleToggleComplete(currentQuestion.id, true /* forceBypass */);
      setFrictionGateModal(null);
    }
  }, [frictionGateModal, activeTrack, handleSelectQuestion, handleToggleComplete, currentQuestion.id]);

  const handleExecuteFrictionUnlockRef = React.useRef(handleExecuteFrictionUnlock);
  useEffect(() => {
    handleExecuteFrictionUnlockRef.current = handleExecuteFrictionUnlock;
  }, [handleExecuteFrictionUnlock]);

  // Hold-to-unlock interval (2.5 seconds hold)
  useEffect(() => {
    if (!isHolding) {
      setHoldProgress(0);
      return;
    }
    const startTime = Date.now();
    const duration = 2500;
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, Math.round((elapsed / duration) * 100));
      setHoldProgress(pct);
      if (pct >= 100) {
        clearInterval(interval);
        handleExecuteFrictionUnlockRef.current();
      }
    }, 40);
    return () => clearInterval(interval);
  }, [isHolding]);

  // Action to mark current tab done and advance to next tab
  const handleMarkTabDoneAndNext = (currentTabId) => {
    if (currentTabId === 'notes' && strictLock) {
      if (currentNoteWords < 25) {
        const confirmCheck = window.confirm(
          `Your spoken response draft currently has ${currentNoteWords} words (recommended: at least 25 words to cement interview recall).\n\nDo you want to mark it done anyway without writing out your thoughts?`
        );
        if (!confirmCheck) return;
      }
    }

    db.setTabCheck(activeTrack, currentQuestion.id, currentTabId, true);
    setTabChecksMap(db.getTabChecksMap());

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
      db.setNote(activeTrack, activeQuestionId, currentNote);
      setNotesMap(db.getNotesMap());
      // Auto-check the 'notes' tab if note was written with at least 25 words
      if (currentNoteWords >= 25) {
        db.setTabCheck(activeTrack, activeQuestionId, 'notes', true);
        setTabChecksMap(db.getTabChecksMap());
      }
    }
  };

  // Reset progress for this track
  const handleResetTrack = () => {
    if (window.confirm(`Reset your ${currentTrack.name} progress?`)) {
      currentTrack.questions.forEach((q) => {
        db.setCompleted(activeTrack, q.id, false);
        ['concept', 'code', 'challenge', 'notes'].forEach((tabId) => {
          db.setTabCheck(activeTrack, q.id, tabId, false);
        });
        db.setQuestionUnlocked(activeTrack, q.id, false);
        db.saveQuestionTimer(activeTrack, q.id, {
          secondsLeft: QUESTION_TIMER_SECONDS,
          scriptSecondsLeft: SCRIPT_TIMER_SECONDS,
          isRunning: true,
        });
      });
      setCompletedMap(db.getCompletedMap());
      setTabChecksMap(db.getTabChecksMap());
      setUnlockedQuestionsMap(db.getUnlockedMap());
      handleSelectQuestion(1);
      setActiveTab('concept');
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
  const isNextUnlocked = hasNext && (isQuestionUnlocked(currentQuestion.id + 1) && (!strictLock || isCurrentQuestionSatisfied || !!unlockedQuestionsMap[getQuestionKey(activeTrack, currentQuestion.id + 1)]));

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
    if (isQuestionUnlocked(target.id)) {
      handleSelectQuestion(target.id);
      setActiveTab('concept');
    } else {
      setFrictionGateModal({ type: 'question', targetQid: target.id });
    }
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
    <div className="min-h-screen w-full bg-[#fafafc] text-zinc-800 flex flex-col font-sans selection:bg-[#252b38] selection:text-white antialiased">
      
      {/* 1. TOP FULL-WIDTH HEADER BAR */}
      <header className="w-full border-b border-zinc-200/80 bg-white/95 backdrop-blur-md sticky top-0 z-30 shadow-xs">
        <div className="w-full px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-4">
          
          {/* Left: Brand & Mini 20m Circular Clock Status Widget */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-[#1e222b] text-zinc-100 border border-[#2d3342] font-mono font-bold text-xs flex items-center justify-center shadow-xs">
                BD
              </span>
              <span className="font-heading font-extrabold text-sm sm:text-base tracking-tight text-[#1a1e27]">
                Backend Dev
              </span>
            </div>

            {/* 20-MINUTE FOCUS SESSION STATUS INDICATOR PILL */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 border border-zinc-200/80 shadow-xs">
              <span className={`w-2 h-2 rounded-full ${timerSeconds === 0 ? 'bg-emerald-500' : isTimerRunning ? 'bg-cyan-500 animate-pulse' : 'bg-amber-400'}`} />
              <span className={`font-mono text-xs font-bold ${timerSeconds === 0 ? 'text-emerald-700 font-extrabold' : 'text-zinc-800'}`}>
                {timerSeconds === 0 ? '20m Focus Done ✓' : `${formatTimerDigits(timerSeconds)} left`}
              </span>
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
                      ? 'bg-white text-[#1a1e27] shadow-xs'
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
              onClick={() => {
                if (strictLock) {
                  setFrictionGateModal({ type: 'toggle_lock' });
                } else {
                  db.setStrictLock(true);
                  setStrictLock(true);
                }
              }}
              title={strictLock ? 'Progression Lock: ON (Click to open friction checkpoint)' : 'Progression Lock: OFF (Click to re-enable strict focus)'}
              className={`p-1.5 px-2 rounded-lg border transition-all shadow-2xs flex items-center gap-1.5 ${
                strictLock
                  ? 'border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700'
                  : 'border-emerald-200 bg-emerald-50 text-emerald-700'
              }`}
            >
              {strictLock ? <Lock className="w-4 h-4 text-zinc-900" /> : <Unlock className="w-4 h-4 text-emerald-600" />}
              <span className="hidden sm:inline text-[11px] font-mono font-semibold">
                {strictLock ? 'Strict Lock' : 'Unlocked'}
              </span>
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
                  onClick={() => {
                    if (isUnlocked) {
                      handleSelectQuestion(q.id);
                      setActiveTab('concept');
                    } else {
                      setFrictionGateModal({ type: 'question', targetQid: q.id });
                    }
                  }}
                  className={`h-7 px-3 rounded-full text-xs font-mono font-semibold transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-[#1e222b] text-white border border-[#2d3342] shadow-xs'
                      : isDone
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : !isUnlocked
                      ? 'bg-zinc-100/70 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-200/80 cursor-pointer border border-dashed border-zinc-200'
                      : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 hover:text-zinc-900'
                  }`}
                  title={!isUnlocked ? `${q.title} (Locked - Click to review friction checkpoint)` : q.title}
                >
                  {isDone ? (
                    <Check className="w-3 h-3 text-emerald-600 stroke-[3]" />
                  ) : !isUnlocked ? (
                    <Lock className="w-2.5 h-2.5 text-zinc-400" />
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
                <span className="px-2 py-0.5 rounded bg-[#1e222b] text-zinc-100 border border-[#2d3342] font-bold text-[11px]">
                  {currentTrack.fullName.toUpperCase()}
                </span>
                <span className="font-bold text-zinc-800">QUESTION #{currentQuestion.id}</span>
                <span>•</span>
                <span className="flex items-center gap-1 text-zinc-500">
                  <Clock className="w-3.5 h-3.5" />
                  {currentQuestion.startTime} — {currentQuestion.endTime} ({formatDuration(currentQuestion.endSeconds - currentQuestion.startSeconds)})
                </span>
              </div>

              <h1 className="font-heading font-extrabold text-xl sm:text-2xl text-[#1a1e27] tracking-tight leading-snug m-0">
                {currentQuestion.title}
              </h1>
            </div>

            {/* Video Player Card (Responsive 16:9 full width of left column) */}
            <div className="rounded-2xl overflow-hidden border border-zinc-200/80 bg-white shadow-xs p-3 sm:p-4 space-y-4">
              <div className="rounded-xl overflow-hidden bg-[#161a22] shadow-xs">
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
                          : 'bg-[#1e222b] hover:bg-[#282e3b] text-zinc-100 border border-[#2d3342]'
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
                    /* Locked Button until both all steps AND 20m timer are completed - clicking opens friction gate */
                    <button
                      type="button"
                      onClick={() => {
                        setFrictionGateModal({ type: 'complete', targetQid: currentQuestion.id });
                      }}
                      className="flex-1 py-3 px-5 rounded-xl font-heading font-bold text-sm bg-zinc-100 hover:bg-zinc-200/80 text-zinc-600 border border-zinc-200/90 transition-all flex items-center justify-center gap-2 shadow-xs group cursor-pointer"
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
                    onClick={() => {
                      if (!hasNext) return;
                      if (isNextUnlocked) {
                        handleSelectQuestion(currentQuestion.id + 1);
                      } else {
                        setFrictionGateModal({ type: 'question', targetQid: currentQuestion.id + 1 });
                      }
                    }}
                    disabled={!hasNext}
                    title={hasNext && !isNextUnlocked ? `Locked: Complete all 4 steps & 20m timer (${formatTimerDigits(timerSeconds)} left) - Click to review friction gate` : 'Next question'}
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
                      onClick={() => {
                        if (isUnlocked) {
                          handleSelectQuestion(q.id);
                          setActiveTab('concept');
                        } else {
                          setFrictionGateModal({ type: 'question', targetQid: q.id });
                        }
                      }}
                      className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                        isCurrent
                          ? 'border-[#333a4a] bg-[#1e232e] text-zinc-100 shadow-sm'
                          : isDone
                          ? 'border-emerald-200 bg-emerald-50/60 text-zinc-900 hover:bg-emerald-50'
                          : !isUnlocked
                          ? 'border-zinc-200/60 bg-zinc-50/60 text-zinc-400 hover:border-zinc-300 hover:bg-zinc-100/60 cursor-pointer'
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
          {/* RIGHT COLUMN: FOCUS CLOCK & INTERACTIVE DOC TABS         */}
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
                <h3 className="font-heading font-extrabold text-base sm:text-lg text-[#1a1e27] m-0">
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
                  onToggleRunning={handleToggleTimer}
                  onReset={handleResetTimer}
                  size={96}
                  strokeWidth={6}
                  colorScheme="focus"
                  label="20M FOCUS"
                  completedLabel="20m DONE"
                  subLabel={timerSeconds === 0 ? 'DONE' : isTimerRunning ? 'FOCUS' : 'PAUSED'}
                />
              </div>
            </div>

            {/* Interactive Developer Documentation Tabs (Facia Developer Style) */}
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
                          ? 'bg-white shadow-xs text-[#1a1e27] font-bold'
                          : 'text-zinc-500 hover:text-[#1a1e27] hover:bg-zinc-100/60'
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
                  
                  {/* ======================================================== */}
                  {/* 1. OVERVIEW & SPECIFICATIONS TAB (Docusaurus/Facia SDK)  */}
                  {/* ======================================================== */}
                  {activeTab === 'concept' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
                        <div>
                          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-sky-600">
                            STEP 1: ARCHITECTURAL OVERVIEW & SPECIFICATIONS
                          </span>
                          <h3 className="font-heading font-extrabold text-base text-[#1a1e27] mt-0.5">
                            {currentQuestion.title}
                          </h3>
                        </div>
                        {isTabChecked('concept') && (
                          <span className="text-[11px] font-mono font-bold text-emerald-600 flex items-center gap-1">
                            <Check className="w-3 h-3 stroke-[3]" /> Reviewed ✓
                          </span>
                        )}
                      </div>

                      {/* Technical Description (Facia Developers Guide style) */}
                      <div className="text-xs sm:text-[13px] text-zinc-800 leading-relaxed font-sans">
                        <FormattedSummary text={docSpecs?.overview || currentQuestion.summary} />
                      </div>

                      {/* Docusaurus-Style Parameter & Specifications Table */}
                      {docSpecs?.table && (
                        <div className="space-y-1.5 pt-1">
                          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-500">
                            Technical Specifications & Memory Model:
                          </span>
                          <DocTable headers={docSpecs.table.headers} rows={docSpecs.table.rows} />
                        </div>
                      )}

                      {/* Docusaurus-Style Themed Admonitions (Note, Tip, Caution) */}
                      {docSpecs?.admonitions && docSpecs.admonitions.map((adm, i) => (
                        <Admonition key={i} type={adm.type} title={adm.title}>
                          <FormattedSummary text={adm.content} />
                        </Admonition>
                      ))}
                    </div>
                  )}

                  {/* ======================================================== */}
                  {/* 2. COMMANDS & SYNTAX TAB (Facia SDK Developer Commands)  */}
                  {/* ======================================================== */}
                  {activeTab === 'code' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
                        <div>
                          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-600">
                            STEP 2: CLI COMMANDS & IMPLEMENTATION REFERENCE
                          </span>
                          <h3 className="font-heading font-extrabold text-base text-[#1a1e27] mt-0.5">
                            Standard Developer Commands & Syntax
                          </h3>
                        </div>
                        {isTabChecked('code') && (
                          <span className="text-[11px] font-mono font-bold text-emerald-600 flex items-center gap-1">
                            <Check className="w-3 h-3 stroke-[3]" /> Code Verified ✓
                          </span>
                        )}
                      </div>

                      {/* Facia SDK Developer Commands with Clean Description & 1-Click Copy */}
                      <div className="space-y-3">
                        {docSpecs?.commands && docSpecs.commands.length > 0 ? (
                          docSpecs.commands.map((cmd, idx) => (
                            <DocCodeBlock 
                              key={idx}
                              code={cmd.cmd}
                              language={cmd.lang}
                              label={cmd.label}
                              description={cmd.description}
                            />
                          ))
                        ) : currentQuestion.tip ? (
                          <DocCodeBlock 
                            code={currentQuestion.tip}
                            language={activeTrack === 'python' ? 'python' : 'bash'}
                            label="QUICK RECALL"
                          />
                        ) : null}
                      </div>

                      {/* Did You Know / Pro Tip Admonition */}
                      {docSpecs?.didYouKnow ? (
                        <Admonition type="tip" title={docSpecs.didYouKnow.title || "💡 DID YOU KNOW?"}>
                          <FormattedSummary text={docSpecs.didYouKnow.content} />
                        </Admonition>
                      ) : (
                        <Admonition type="tip" title="Clean Environment Setup">
                          Always execute these commands in an active virtual environment (e.g. <code className="font-mono text-[11px] bg-emerald-100 px-1 py-0.5 rounded text-emerald-900 border border-emerald-300">source .venv/bin/activate</code>) to ensure clean dependency isolation without host OS collisions.
                        </Admonition>
                      )}
                    </div>
                  )}

                  {/* ======================================================== */}
                  {/* 3. PRACTICE TASK (Verification Drill & REPL Launcher)   */}
                  {/* ======================================================== */}
                  {activeTab === 'challenge' && challenge && (
                    <div className="space-y-4">
                      {/* Challenge Header & REPL Button */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-zinc-100">
                        <div>
                          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-purple-600 block">
                            STEP 3: PRACTICAL VERIFICATION DRILL
                          </span>
                          <h3 className="font-heading font-extrabold text-base text-[#1a1e27] mt-0.5">
                            {challenge.title}
                          </h3>
                        </div>

                        <a
                          href={challenge.replLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1e222b] hover:bg-[#282e3b] text-zinc-100 border border-[#2d3342] text-xs font-mono font-bold transition-colors shadow-xs"
                        >
                          <Terminal className="w-3.5 h-3.5 text-amber-400" />
                          <span>Launch Online REPL ↗</span>
                        </a>
                      </div>

                      {/* Step-by-Step Instructions */}
                      <div className="space-y-2">
                        <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-500">
                          Action Items to Execute:
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

                      {/* Verification Script via DocCodeBlock */}
                      {challenge.codeSnippet && (
                        <DocCodeBlock 
                          code={challenge.codeSnippet}
                          language="python"
                          label="VERIFICATION CODE"
                          description="Run this test in your interactive Python/Django REPL to observe runtime behavior:"
                        />
                      )}

                      {/* Expected Terminal Output */}
                      {challenge.expectedOutput && (
                        <div className="space-y-1">
                          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-500">
                            Expected Terminal Output:
                          </span>
                          <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3 font-mono text-xs text-zinc-800 leading-relaxed overflow-x-auto shadow-2xs">
                            <pre className="m-0 whitespace-pre font-mono">
                              {challenge.expectedOutput}
                            </pre>
                          </div>
                        </div>
                      )}

                      {/* Interviewer Deep-Dive Trap Question (as Docusaurus Admonition with Reveal) */}
                      <div className="rounded-xl border border-amber-300/80 bg-amber-50/60 p-4 space-y-2.5 shadow-2xs">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[11px] font-mono font-extrabold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                            <AlertCircle className="w-4 h-4 text-amber-600" />
                            <span>INTERVIEWER DEEP-DIVE TRAP QUESTION</span>
                          </span>
                          
                          <button
                            type="button"
                            onClick={() => setShowAnswer(!showAnswer)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white border border-amber-300 text-[11px] font-mono font-bold text-amber-900 hover:bg-amber-100 transition-colors shadow-2xs"
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
                          <div className="pt-2 border-t border-amber-200 text-xs sm:text-[13px] text-amber-950 leading-relaxed font-sans">
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

                  {/* ======================================================== */}
                  {/* 4. SCRIPT TAB: WITH REAL PROMPT, 5M CLOCK & GATED ANSWER */}
                  {/* ======================================================== */}
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
                            onToggleRunning={handleToggleScriptTimer}
                            onReset={handleResetScriptTimer}
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

                        <blockquote className="m-0 text-sm sm:text-[15px] font-heading font-bold text-[#1a1e27] leading-relaxed italic border-l-3 border-purple-600 pl-3.5">
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

                      {/* User's Drafting Area (Textarea with Thought Scaffolding & Friction Meter) */}
                      <div className="space-y-2">
                        {/* Quick Insert Prompt Scaffold Chips */}
                        <div className="flex flex-wrap items-center gap-1.5 pb-0.5">
                          <span className="text-[11px] text-zinc-400 font-mono">Insert Outline:</span>
                          <button
                            type="button"
                            onClick={() => {
                              const template = "1. Core Definition & Problem Solved:\n\n2. Underlying Runtime / Memory Mechanism:\n\n3. High-Load Edge Cases & Failure Mode:\n";
                              const nextVal = currentNote.trim() ? currentNote + "\n\n" + template : template;
                              setCurrentNote(nextVal);
                              db.setNote(activeTrack, activeQuestionId, nextVal);
                              setNotesMap(db.getNotesMap());
                              if (nextVal.trim().split(/\s+/).filter(Boolean).length >= 25) {
                                db.setTabCheck(activeTrack, activeQuestionId, 'notes', true);
                                setTabChecksMap(db.getTabChecksMap());
                              }
                            }}
                            className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 transition-colors"
                          >
                            + 3-Point Senior Blueprint
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const snippet = "\n• Problem it solves: ";
                              const nextVal = currentNote + snippet;
                              setCurrentNote(nextVal);
                              db.setNote(activeTrack, activeQuestionId, nextVal);
                              setNotesMap(db.getNotesMap());
                            }}
                            className="px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-100 text-zinc-700 hover:bg-zinc-200 transition-colors"
                          >
                            + Problem Solved
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const snippet = "\n• Runtime mechanism: ";
                              const nextVal = currentNote + snippet;
                              setCurrentNote(nextVal);
                              db.setNote(activeTrack, activeQuestionId, nextVal);
                              setNotesMap(db.getNotesMap());
                            }}
                            className="px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-100 text-zinc-700 hover:bg-zinc-200 transition-colors"
                          >
                            + Mechanism
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const snippet = "\n• High-load edge case: ";
                              const nextVal = currentNote + snippet;
                              setCurrentNote(nextVal);
                              db.setNote(activeTrack, activeQuestionId, nextVal);
                              setNotesMap(db.getNotesMap());
                            }}
                            className="px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-100 text-zinc-700 hover:bg-zinc-200 transition-colors"
                          >
                            + Edge Case
                          </button>
                        </div>

                        <div className="flex items-center justify-between text-xs font-mono">
                          <span className="text-zinc-600 font-semibold">Draft your response in your own words:</span>
                          <div className="flex items-center gap-2">
                            <span className={currentNoteWords >= 25 ? 'text-emerald-700 font-bold' : 'text-amber-700 font-semibold'}>
                              {currentNoteWords} / 25 words min
                            </span>
                            {currentNoteWords >= 25 ? (
                              <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-100 text-emerald-800 font-bold">
                                ✓ Step Ready
                              </span>
                            ) : (
                              <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-100 text-amber-800 font-medium">
                                Needs formulation
                              </span>
                            )}
                          </div>
                        </div>

                        <textarea
                          value={currentNote}
                          onChange={(e) => {
                            const val = e.target.value;
                            setCurrentNote(val);
                            db.setNote(activeTrack, activeQuestionId, val);
                            setNotesMap(db.getNotesMap());
                            const words = val.trim().split(/\s+/).filter(Boolean).length;
                            if (words >= 25) {
                              db.setTabCheck(activeTrack, activeQuestionId, 'notes', true);
                              setTabChecksMap(db.getTabChecksMap());
                            }
                          }}
                          onBlur={handleSaveNote}
                          placeholder="Draft your 60-second explanation here. Follow the 3-point blueprint: 1) Core definition, 2) Mechanism & edge cases, 3) Production guidelines..."
                          rows={6}
                          className="w-full text-xs sm:text-sm font-sans bg-zinc-50 border border-zinc-200 rounded-xl p-3.5 text-zinc-900 focus:outline-none focus:bg-white focus:border-[#2d3342] transition-colors placeholder:text-zinc-400 resize-y leading-relaxed"
                        />

                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-mono text-zinc-400">
                            {currentNoteWords >= 25 
                              ? '✓ Auto-checked (25+ words reached) • Saves on blur'
                              : 'Auto-checks at 25 words • Saves on keystroke & blur'}
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
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1e222b] hover:bg-[#282e3b] text-zinc-100 border border-[#2d3342] text-xs font-mono font-bold transition-all shadow-xs"
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
                      className="px-3 py-1.5 rounded-lg font-semibold text-zinc-700 hover:text-[#1a1e27] hover:bg-zinc-100 flex items-center gap-1 transition-colors"
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

      {/* 5. FRICTION GATE MODAL (Anti-Rushing Checkpoint) */}
      {frictionGateModal && (
        <div 
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
          role="dialog"
          aria-modal="true"
        >
          <div className="max-w-lg w-full bg-white rounded-2xl shadow-2xl border border-zinc-200 overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-zinc-100 bg-[#1e222b] text-white flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center shrink-0 text-amber-400">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold font-heading text-white flex items-center gap-2">
                    <span>Progression Lock Friction Gate</span>
                  </h3>
                  <p className="text-xs text-zinc-300 mt-0.5">
                    {frictionGateModal.type === 'question'
                      ? `Attempting to advance to Question ${frictionGateModal.targetQid} early`
                      : frictionGateModal.type === 'toggle_lock'
                      ? 'Attempting to disable Progression Lock globally'
                      : `Attempting to mark Question ${currentQuestion.id} done early`}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setFrictionGateModal(null)}
                className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-4 text-xs sm:text-sm text-zinc-700">
              
              {/* Context Callout */}
              <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3.5 space-y-2">
                <div className="flex items-center gap-2 text-amber-900 font-bold text-xs uppercase tracking-wider font-mono">
                  <Brain className="w-4 h-4 text-amber-600" />
                  <span>Preparation Reality Check: Q{currentQuestion.id}</span>
                </div>
                <div className="space-y-1.5 text-xs text-amber-950/80">
                  <div className="flex items-center justify-between">
                    <span>⏱️ Focus Timer:</span>
                    <span className="font-mono font-bold">
                      {timerSeconds === 0 ? '✓ 20m focus satisfied' : `${formatTimerDigits(timerSeconds)} remaining`}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>✍️ Spoken Script Draft:</span>
                    <span className="font-mono font-bold">
                      {currentNoteWords < 25 
                        ? `⚠️ ${currentNoteWords}/25 words written`
                        : `✓ ${currentNoteWords} words drafted`}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>📋 Review Steps:</span>
                    <span className="font-mono font-bold">
                      {checkedStepsCount} of {questionTabs.length} steps checked
                    </span>
                  </div>
                </div>
                {currentNoteWords < 25 && (
                  <p className="text-[11px] text-amber-800 italic pt-1 border-t border-amber-200/60 leading-relaxed">
                    "Writing your explanation and saying it out loud is what builds interview memory. Skipping it returns you to the rush-and-forget loop."
                  </p>
                )}
              </div>

              {/* Primary Recommended Option: Stay & Practice */}
              <div className="p-3.5 bg-zinc-50 border border-zinc-200 rounded-xl space-y-2 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setFrictionGateModal(null);
                    setActiveTab('notes');
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#1e222b] hover:bg-[#252b38] text-white font-heading font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <PenTool className="w-4 h-4 text-amber-400" />
                  <span>Stay & Draft My Spoken Answer (Recommended)</span>
                </button>
                <p className="text-[11px] text-zinc-500">
                  Takes 2 minutes to formulate the core definition and runtime mechanism.
                </p>
              </div>

              {/* Deliberate Bypass Friction Challenge */}
              <div className="border border-zinc-200 rounded-xl p-3.5 space-y-3 bg-white">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs uppercase tracking-wider text-zinc-600 font-mono">
                    Deliberate Friction Challenge
                  </span>
                  <span className="text-[10px] text-zinc-400 font-mono">Anti-Impulse Gate</span>
                </div>
                <p className="text-xs text-zinc-500">
                  If you genuinely want to bypass this checkpoint, certify all 3 active recall criteria and hold the button for 2.5 seconds:
                </p>

                {/* Reflection Checkboxes */}
                <div className="space-y-2 pt-1">
                  <label className="flex items-start gap-2.5 p-2 rounded-lg bg-zinc-50 border border-zinc-200/80 hover:bg-zinc-100/70 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={frictionChecks.runtimeMechanism}
                      onChange={(e) => setFrictionChecks((prev) => ({ ...prev, runtimeMechanism: e.target.checked }))}
                      className="mt-0.5 rounded text-[#1e222b] focus:ring-0"
                    />
                    <span className="text-xs text-zinc-800">
                      1. I understand the underlying runtime mechanism (CPython memory / Django ORM).
                    </span>
                  </label>

                  <label className="flex items-start gap-2.5 p-2 rounded-lg bg-zinc-50 border border-zinc-200/80 hover:bg-zinc-100/70 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={frictionChecks.verbalRecall}
                      onChange={(e) => setFrictionChecks((prev) => ({ ...prev, verbalRecall: e.target.checked }))}
                      className="mt-0.5 rounded text-[#1e222b] focus:ring-0"
                    />
                    <span className="text-xs text-zinc-800">
                      2. I can explain this topic verbally out loud for 60 seconds without checking docs.
                    </span>
                  </label>

                  <label className="flex items-start gap-2.5 p-2 rounded-lg bg-zinc-50 border border-zinc-200/80 hover:bg-zinc-100/70 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={frictionChecks.antiRushingCommitment}
                      onChange={(e) => setFrictionChecks((prev) => ({ ...prev, antiRushingCommitment: e.target.checked }))}
                      className="mt-0.5 rounded text-[#1e222b] focus:ring-0"
                    />
                    <span className="text-xs text-zinc-800">
                      3. I accept that bypassing without drafting script returns me to the rushing loop.
                    </span>
                  </label>
                </div>

                {/* Hold to Unlock Button with Animated Progress */}
                <div className="pt-2">
                  <button
                    type="button"
                    disabled={!allChecksChecked}
                    onMouseDown={() => allChecksChecked && setIsHolding(true)}
                    onMouseUp={() => setIsHolding(false)}
                    onMouseLeave={() => setIsHolding(false)}
                    onTouchStart={() => allChecksChecked && setIsHolding(true)}
                    onTouchEnd={() => setIsHolding(false)}
                    className={`relative w-full py-3 px-4 rounded-xl font-heading font-bold text-xs uppercase tracking-wider overflow-hidden transition-all select-none ${
                      allChecksChecked
                        ? 'bg-amber-500 text-white shadow-sm cursor-pointer active:scale-[0.99]'
                        : 'bg-zinc-100 text-zinc-400 border border-zinc-200 cursor-not-allowed'
                    }`}
                  >
                    {/* Fill Bar during hold */}
                    {allChecksChecked && (
                      <div
                        className="absolute inset-0 bg-amber-600 transition-all duration-75 ease-linear pointer-events-none"
                        style={{ width: `${holdProgress}%` }}
                      />
                    )}
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      {!allChecksChecked ? (
                        <>
                          <Lock className="w-3.5 h-3.5" />
                          <span>Check all 3 criteria above to unlock hold</span>
                        </>
                      ) : isHolding ? (
                        <>
                          <Clock className="w-3.5 h-3.5 animate-spin" />
                          <span>Holding... {Math.round((holdProgress / 100) * 2.5 * 10) / 10}s / 2.5s</span>
                        </>
                      ) : (
                        <>
                          <Unlock className="w-3.5 h-3.5" />
                          <span>
                            {frictionGateModal.type === 'question'
                              ? `Press & Hold 2.5s to Unlock Q${frictionGateModal.targetQid}`
                              : frictionGateModal.type === 'toggle_lock'
                              ? 'Press & Hold 2.5s to Disable Strict Lock'
                              : 'Press & Hold 2.5s to Force Complete Q' + currentQuestion.id}
                          </span>
                        </>
                      )}
                    </span>
                  </button>
                  {allChecksChecked && (
                    <p className="text-[10px] text-zinc-400 text-center mt-1.5 font-mono">
                      {isHolding ? 'Hold steadily until bar reaches 100%...' : 'Press and keep holding down for 2.5 seconds'}
                    </p>
                  )}
                </div>

              </div>

            </div>

          </div>
        </div>
      )}

      {/* Clean Minimal Full-Width Footer */}
      <footer className="w-full mt-auto px-6 py-4 border-t border-zinc-200/70 bg-white text-center text-xs text-zinc-400 font-mono">
        Backend Dev Journey • 30-Day Interview Preparation Workspace
      </footer>

    </div>
  );
}
