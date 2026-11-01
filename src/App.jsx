import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  TRACKS_DATA,
  TRACKS
} from './data/questions';
import { getQuestionChallenge } from './data/challenges';
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
  Code2,
  FileText,
  Lightbulb,
  CheckCircle2,
  Circle,
  ArrowRight
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

const STORAGE_PREFIX = 'backend_dev_zen_v2_';

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

  // Active tab under video: 'concept' | 'code' | 'challenge' | 'links' | 'notes'
  const [activeTab, setActiveTab] = useState('concept');
  const [loopMode, setLoopMode] = useState(false);
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

  const getQuestionKey = useCallback((trackId, qId) => `${trackId}_${qId}`, []);

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

  // Curated Interview Challenge
  const challenge = useMemo(() => {
    return getQuestionChallenge(activeTrack, currentQuestion);
  }, [activeTrack, currentQuestion]);

  // Define the required checkable steps for this question
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
    tabs.push({ 
      id: 'links', 
      label: `Docs (${currentQuestion.articles?.length || 0})`, 
      icon: BookOpen, 
      iconColor: 'text-blue-500' 
    });
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
    const isNowDone = !completedMap[key];
    
    // When marking complete, also check all steps
    if (isNowDone) {
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
  }, [activeTrack, completedMap, currentTrack.questions.length, getQuestionKey, questionTabs]);

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
          ['concept', 'code', 'challenge', 'links', 'notes'].forEach((tabId) => {
            delete next[`${getQuestionKey(activeTrack, q.id)}_${tabId}`];
          });
        });
        return next;
      });
      setActiveQuestionId(1);
      setActiveTab('concept');
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
  const isNextUnlocked = hasNext && isQuestionUnlocked(currentQuestion.id + 1) && (!strictLock || areAllStepsChecked || isCurrentCompleted);

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

  return (
    <div className="min-h-screen bg-[#fafafc] text-zinc-900 flex flex-col font-sans selection:bg-zinc-900 selection:text-white">
      
      {/* 1. ULTRA-MINIMAL TOP BAR */}
      <header className="border-b border-zinc-200/70 bg-white/90 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          
          {/* Brand */}
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded bg-zinc-950 text-white font-mono font-bold text-[11px] flex items-center justify-center shadow-xs">
              BD
            </span>
            <span className="font-heading font-extrabold text-sm tracking-tight text-zinc-900">
              Backend Dev
            </span>
          </div>

          {/* Track Switcher */}
          <div className="flex items-center p-0.5 rounded-lg bg-zinc-100 border border-zinc-200/70">
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
                </button>
              );
            })}
          </div>

          {/* Right Status & Controls */}
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-mono text-zinc-500 hidden sm:inline">
              <strong className="text-zinc-900">{completedInTrack}/{currentTrack.totalCount}</strong> ({trackPercent}%)
            </span>

            <button
              type="button"
              onClick={() => setStrictLock(!strictLock)}
              title={strictLock ? 'Progression Lock: ON (Strict Step Checks Required)' : 'Progression Lock: OFF'}
              className="p-1 text-zinc-400 hover:text-zinc-800 transition-colors"
            >
              {strictLock ? <Lock className="w-3.5 h-3.5 text-zinc-800" /> : <Unlock className="w-3.5 h-3.5 text-emerald-600" />}
            </button>

            <button
              type="button"
              onClick={handleResetTrack}
              title="Reset progress"
              className="p-1 text-zinc-400 hover:text-red-600 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      </header>

      {/* 2. ZEN SINGLE-COLUMN WORKSPACE */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-8 space-y-6">
        
        {/* Day Header & Question Dots */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-zinc-200/70">
          
          {/* Day Stepper */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrevDay}
              disabled={!hasPrevDay}
              className="p-1 text-zinc-400 hover:text-zinc-800 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
              title="Previous Day"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="text-xs font-medium text-zinc-600">
              <span className="font-mono font-bold text-zinc-900 mr-1.5">
                Day {currentQuestion.day} of {currentTrack.days.length}
              </span>
              <span className="text-zinc-400 hidden sm:inline">•</span>
              <span className="font-heading ml-1.5 hidden sm:inline text-zinc-700">
                {currentDayInfo.title}
              </span>
            </div>

            <button
              type="button"
              onClick={handleNextDay}
              disabled={!hasNextDay}
              className="p-1 text-zinc-400 hover:text-zinc-800 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
              title="Next Day"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Today's 3 Questions as Clean Pills */}
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
                  onClick={() => {
                    setActiveQuestionId(q.id);
                    setActiveTab('concept');
                  }}
                  className={`h-7 px-2.5 rounded-full text-xs font-mono font-semibold transition-all flex items-center gap-1 ${
                    isSelected
                      ? 'bg-zinc-900 text-white shadow-xs'
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
                </button>
              );
            })}
          </div>

        </div>

        {/* Question Heading Strip */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-zinc-400 font-mono">
            <span>
              {currentTrack.fullName.toUpperCase()} • QUESTION #{currentQuestion.id}
            </span>
            <span className="flex items-center gap-1 text-zinc-500">
              <Clock className="w-3.5 h-3.5" />
              {currentQuestion.startTime} — {currentQuestion.endTime} ({formatDuration(currentQuestion.endSeconds - currentQuestion.startSeconds)})
            </span>
          </div>

          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-zinc-950 tracking-tight leading-tight m-0">
            {currentQuestion.title}
          </h1>
        </div>

        {/* Focused Video Station Card */}
        <div className="rounded-2xl overflow-hidden border border-zinc-200/80 bg-white shadow-sm space-y-4 p-4 sm:p-5">
          
          {/* YouTube Player */}
          <div className="rounded-xl overflow-hidden bg-black">
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

          {/* Primary Action Button - Governed by Tab Checks */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center gap-3">
              {areAllStepsChecked || isCurrentCompleted || !strictLock ? (
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
                      : 'All Steps Complete! Mark Done & Unlock Next →'}
                  </span>
                </button>
              ) : (
                /* Locked Button until all tabs are checked */
                <button
                  type="button"
                  onClick={handleJumpToIncompleteTab}
                  className="flex-1 py-3 px-5 rounded-xl font-heading font-bold text-sm bg-zinc-100 hover:bg-zinc-200/80 text-zinc-500 border border-zinc-200/90 transition-all flex items-center justify-center gap-2 shadow-xs group"
                >
                  <Lock className="w-4 h-4 text-zinc-400 group-hover:text-zinc-600" />
                  <span>
                    Check all {questionTabs.length} tabs to unlock next ({checkedStepsCount}/{questionTabs.length} done)
                  </span>
                </button>
              )}

              {/* Quick Next Arrow */}
              <button
                type="button"
                onClick={() => hasNext && isNextUnlocked && setActiveQuestionId(currentQuestion.id + 1)}
                disabled={!hasNext || !isNextUnlocked}
                title={hasNext && !isNextUnlocked ? 'Locked: Complete all steps on this question first' : 'Next question'}
                className="p-3 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Micro Helper Text */}
            <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 px-1">
              <span>Required: Concept, Syntax, Practice, Docs, Script</span>
              <span className={areAllStepsChecked ? 'text-emerald-600 font-bold' : 'text-zinc-500'}>
                {checkedStepsCount}/{questionTabs.length} Steps Checked
              </span>
            </div>
          </div>

        </div>

        {/* 3. CHECKABLE CONTENT TABS */}
        <div className="rounded-2xl border border-zinc-200/80 bg-white shadow-sm overflow-hidden">
          
          {/* Tab Navigation Strip with Individual Checkboxes */}
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
          <div className="p-5 sm:p-6 min-h-[200px] flex flex-col justify-between">
            
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

              {/* 3. PRACTICE CHALLENGE TAB */}
              {activeTab === 'challenge' && challenge && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400">
                      STEP 3: HANDS-ON CODING TASK
                    </span>
                    
                    <a
                      href={challenge.replLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 hover:text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200 transition-colors"
                    >
                      <Terminal className="w-3 h-3" />
                      <span>Open Online REPL ↗</span>
                    </a>
                  </div>

                  <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200/80 text-xs sm:text-sm text-zinc-800 leading-relaxed font-sans">
                    <strong className="block font-heading text-xs text-zinc-900 uppercase tracking-wide mb-1 font-extrabold">
                      Task:
                    </strong>
                    {challenge.task}
                  </div>

                  <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200/80 text-xs text-amber-950 leading-relaxed">
                    <strong className="block font-heading text-[11px] text-amber-800 uppercase tracking-wide mb-1 font-extrabold">
                      Interviewer Follow-up Question:
                    </strong>
                    "{challenge.followUp}"
                  </div>
                </div>
              )}

              {/* 4. DOCS & ARTICLES TAB */}
              {activeTab === 'links' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400">
                      STEP 4: IN-DEPTH DOCUMENTATION & TUTORIALS
                    </span>
                    {isTabChecked('links') && (
                      <span className="text-[11px] font-mono font-bold text-emerald-600 flex items-center gap-1">
                        <Check className="w-3 h-3 stroke-[3]" /> Docs Reviewed
                      </span>
                    )}
                  </div>
                  <div className="space-y-2">
                    {currentQuestion.articles.map((art, idx) => (
                      <a
                        key={idx}
                        href={art.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-3 rounded-xl border border-zinc-200/80 hover:border-zinc-300 hover:bg-zinc-50 flex items-center justify-between gap-3 transition-colors group"
                      >
                        <div className="min-w-0">
                          <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 block">
                            {art.source}
                          </span>
                          <strong className="text-xs font-semibold text-zinc-900 group-hover:text-black block truncate mt-0.5">
                            {art.title}
                          </strong>
                        </div>
                        <ExternalLink className="w-3.5 h-3.5 text-zinc-400 group-hover:text-zinc-950 flex-shrink-0" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* 5. NOTES TAB */}
              {activeTab === 'notes' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-zinc-400 font-mono">
                    <span>STEP 5: MY 60-SECOND SPOKEN ANSWER</span>
                    {isTabChecked('notes') ? (
                      <span className="text-emerald-600 font-bold flex items-center gap-1">
                        <Check className="w-3 h-3 stroke-[3]" /> Rehearsed
                      </span>
                    ) : (
                      <span>Draft to check off</span>
                    )}
                  </div>
                  <textarea
                    value={currentNote}
                    onChange={(e) => setCurrentNote(e.target.value)}
                    onBlur={handleSaveNote}
                    placeholder="Draft your explanation in your own words so you can rehearse saying it out loud..."
                    rows={4}
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

      </main>

      {/* Clean Minimal Footer */}
      <footer className="mt-auto px-6 py-4 border-t border-zinc-200/70 bg-white text-center text-xs text-zinc-400 font-mono">
        Backend Dev Journey • 30-Day Interview Preparation
      </footer>

    </div>
  );
}
