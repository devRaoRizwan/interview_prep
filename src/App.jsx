import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  QUESTIONS_DATA, 
  CATEGORIES, 
  INTRO_SECTION, 
  CONCLUSION_SECTION,
  VIDEO_BASE_URL 
} from './data/questions';
import YouTubePlayer from './components/YouTubePlayer';
import QuestionCard from './components/QuestionCard';
import { 
  ChevronLeft, 
  ChevronRight, 
  RotateCcw, 
  Search, 
  X, 
  Play, 
  CheckCircle2, 
  Flame,
  BookOpen,
  Filter,
  Check
} from 'lucide-react';

const STORAGE_KEY_COMPLETED = 'django_prep_completed_v2';
const STORAGE_KEY_NOTES = 'django_prep_notes_v2';
const STORAGE_KEY_LAST_ID = 'django_prep_last_question_id_v2';
const STORAGE_KEY_AUTO_ADVANCE = 'django_prep_auto_advance_v2';

export default function App() {
  // Completed map
  const [completedMap, setCompletedMap] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_COMPLETED);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Notes map
  const [notesMap, setNotesMap] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_NOTES);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Active question
  const [currentQuestion, setCurrentQuestion] = useState(() => {
    try {
      const savedId = localStorage.getItem(STORAGE_KEY_LAST_ID);
      if (savedId) {
        const found = QUESTIONS_DATA.find((q) => q.id === Number(savedId));
        if (found) return found;
      }
    } catch {
      // ignore
    }
    return QUESTIONS_DATA[0];
  });

  // Player preferences
  const [autoAdvance, setAutoAdvance] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY_AUTO_ADVANCE) === 'true';
    } catch {
      return false;
    }
  });
  const [loopMode, setLoopMode] = useState(false);

  // Filters & Search
  const [activeCategory, setActiveCategory] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Persist state
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
      localStorage.setItem(STORAGE_KEY_LAST_ID, currentQuestion.id.toString());
    } catch (e) {
      console.warn(e);
    }
  }, [currentQuestion]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_AUTO_ADVANCE, autoAdvance.toString());
    } catch (e) {
      console.warn(e);
    }
  }, [autoAdvance]);

  // Toggle completed
  const handleToggleCompleted = useCallback((id) => {
    setCompletedMap((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  }, []);

  // Save personal note
  const handleSaveNote = useCallback((id, noteText) => {
    setNotesMap((prev) => ({
      ...prev,
      [id]: noteText
    }));
  }, []);

  // Reset progress
  const handleResetProgress = () => {
    if (window.confirm('Reset all completed checkboxes?')) {
      setCompletedMap({});
    }
  };

  // Filter questions
  const filteredQuestions = useMemo(() => {
    return QUESTIONS_DATA.filter((q) => {
      if (activeCategory !== 'all' && q.partId !== activeCategory) {
        return false;
      }

      const isDone = !!completedMap[q.id];
      if (statusFilter === 'completed' && !isDone) return false;
      if (statusFilter === 'pending' && isDone) return false;

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = q.title.toLowerCase().includes(query);
        const matchesTip = (q.tip || '').toLowerCase().includes(query);
        const matchesTags = q.tags.some((tag) => tag.toLowerCase().includes(query));
        return matchesTitle || matchesTip || matchesTags;
      }

      return true;
    });
  }, [activeCategory, statusFilter, searchQuery, completedMap]);

  // Current Question Index Navigation
  const currentIndex = QUESTIONS_DATA.findIndex((q) => q.id === currentQuestion.id);
  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < QUESTIONS_DATA.length - 1;

  const handlePreviousQuestion = useCallback(() => {
    if (hasPrevious) {
      setCurrentQuestion(QUESTIONS_DATA[currentIndex - 1]);
    }
  }, [hasPrevious, currentIndex]);

  const handleNextQuestion = useCallback(() => {
    if (hasNext) {
      setCurrentQuestion(QUESTIONS_DATA[currentIndex + 1]);
    }
  }, [hasNext, currentIndex]);

  const completedCount = Object.values(completedMap).filter(Boolean).length;
  const totalCount = QUESTIONS_DATA.length;
  const percent = Math.round((completedCount / totalCount) * 100);

  // Active Category Completion Stats
  const activeQuestionsInCat = useMemo(() => {
    if (activeCategory === 'all') return QUESTIONS_DATA;
    return QUESTIONS_DATA.filter((q) => q.partId === activeCategory);
  }, [activeCategory]);

  const completedInCat = useMemo(() => {
    return activeQuestionsInCat.filter((q) => !!completedMap[q.id]).length;
  }, [activeQuestionsInCat, completedMap]);

  const catPercent = Math.round((completedInCat / (activeQuestionsInCat.length || 1)) * 100);

  const activeCategoryObject = CATEGORIES.find((c) => c.id === activeCategory) || CATEGORIES[0];

  return (
    <div className="w-full min-h-screen bg-page flex flex-col lg:grid lg:grid-cols-[284px_minmax(0,1fr)] max-w-[1600px] mx-auto text-ink">
      
      {/* SIDEBAR (comback2026 style) */}
      <aside className="border-r border-line bg-sidebar p-5 sm:p-6 lg:h-screen lg:sticky lg:top-0 lg:overflow-y-auto flex flex-col justify-between">
        <div className="space-y-5">
          {/* Brand */}
          <div className="flex items-center gap-3 px-1">
            <div className="w-10 h-10 rounded-xl bg-ink text-white font-heading font-extrabold text-lg flex items-center justify-center flex-shrink-0 shadow-sm">
              DJ
            </div>
            <div>
              <strong className="block font-heading font-extrabold text-base tracking-tight leading-tight text-ink">
                Django Journey
              </strong>
              <small className="block text-muted text-[11px] mt-0.5">
                54 Interview Questions
              </small>
            </div>
          </div>

          {/* Journey Card (Roadmap Overview) */}
          <section className="p-4 rounded-[14px] border border-line bg-white shadow-subtle">
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-muted m-0">
              YOUR ROADMAP
            </p>
            <strong className="block my-2 font-heading font-bold text-sm text-ink">
              Master 54 Questions
            </strong>
            <div className="w-full h-1.5 bg-line rounded-full overflow-hidden mb-2">
              <div 
                className="h-full bg-ink rounded-full transition-all duration-300" 
                style={{ width: `${percent}%` }}
              />
            </div>
            <small className="text-muted text-[11px] font-medium block">
              {completedCount} of {totalCount} completed ({percent}%)
            </small>
          </section>

          {/* Parts / Chapters Navigation (week-list style) */}
          <nav className="space-y-1.5" aria-label="Parts list">
            {CATEGORIES.map((cat, idx) => {
              const countInPart = cat.id === 'all' 
                ? QUESTIONS_DATA.length 
                : QUESTIONS_DATA.filter((q) => q.partId === cat.id).length;
              const doneInPart = cat.id === 'all'
                ? completedCount
                : QUESTIONS_DATA.filter((q) => q.partId === cat.id && !!completedMap[q.id]).length;

              const isActive = activeCategory === cat.id;

              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(cat.id)}
                  className={`w-full text-left p-2.5 rounded-xl border flex items-center gap-2.5 transition-all ${
                    isActive
                      ? 'border-ink bg-white shadow-subtle ring-1 ring-ink/20'
                      : 'border-line bg-white hover:border-line-strong hover:bg-paper-muted'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center font-heading font-bold text-[11px] ${
                    isActive ? 'bg-ink text-white' : 'bg-paper-muted text-muted'
                  }`}>
                    {idx === 0 ? 'ALL' : `P${idx}`}
                  </div>

                  <div className="min-w-0 flex-1">
                    <strong className="block text-xs font-bold font-heading truncate text-ink">
                      {cat.label}
                    </strong>
                    <small className="block text-[10px] text-muted mt-0.5">
                      {doneInPart} / {countInPart} completed
                    </small>
                  </div>

                  {doneInPart === countInPart && countInPart > 0 && (
                    <Check className="w-3.5 h-3.5 text-ink flex-shrink-0 stroke-[2.5]" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer Note */}
        <p className="mt-8 pt-4 border-t border-line text-muted text-[11px] leading-relaxed">
          No locked questions. Pick up wherever you are.
        </p>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="min-w-0 flex flex-col bg-page">
        
        {/* Topbar (comback2026 style) */}
        <header className="p-6 sm:px-10 border-b border-line bg-white flex flex-wrap items-center justify-between gap-4 sticky top-0 z-20">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-muted m-0">
              A FOCUSED STUDY SESSION
            </p>
            <h1 className="m-0 mt-1 font-heading font-extrabold text-2xl sm:text-3xl text-ink tracking-tight">
              {activeCategoryObject.label}
            </h1>
            <p className="m-0 mt-1 text-xs text-muted">
              Select questions to play only that exact answer segment. Check off as you master each topic.
            </p>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePreviousQuestion}
              disabled={!hasPrevious}
              title="Previous question"
              className="w-9 h-9 border border-line-strong rounded-lg bg-white text-ink hover:bg-paper-muted disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center transition-all shadow-subtle"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => {
                const el = document.getElementById('player-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="h-9 px-3.5 border border-ink bg-ink text-white rounded-lg text-xs font-bold hover:bg-brand-hover transition-all flex items-center gap-1.5 shadow-subtle"
            >
              <Play className="w-3 h-3 fill-current" />
              <span>Playing: Q#{currentQuestion.questionNumber}</span>
            </button>

            <button
              type="button"
              onClick={handleNextQuestion}
              disabled={!hasNext}
              title="Next question"
              className="w-9 h-9 border border-line-strong rounded-lg bg-white text-ink hover:bg-paper-muted disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center transition-all shadow-subtle"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Dashboard Stats (comback2026 stat-card style) */}
        <section className="p-6 sm:px-10 pb-2 grid grid-cols-2 md:grid-cols-4 gap-3 bg-page">
          {/* Stat 1: Total Progress */}
          <div className="p-4 border border-line rounded-[13px] bg-white shadow-subtle text-left transition-all hover:border-line-strong">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted m-0 mb-2">
              TOTAL PROGRESS
            </p>
            <div className="font-heading font-extrabold text-2xl text-ink mb-2">
              {percent}%
            </div>
            <div className="w-full h-1 bg-line rounded-full overflow-hidden mb-2">
              <div 
                className="h-full bg-ink rounded-full transition-all" 
                style={{ width: `${percent}%` }}
              />
            </div>
            <small className="text-muted text-[11px] block">
              {completedCount} of {totalCount} questions
            </small>
          </div>

          {/* Stat 2: Active Category */}
          <div className="p-4 border border-line rounded-[13px] bg-white shadow-subtle text-left transition-all hover:border-line-strong">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted m-0 mb-2">
              THIS SECTION
            </p>
            <div className="font-heading font-extrabold text-2xl text-ink mb-2">
              {catPercent}%
            </div>
            <div className="w-full h-1 bg-line rounded-full overflow-hidden mb-2">
              <div 
                className="h-full bg-ink rounded-full transition-all" 
                style={{ width: `${catPercent}%` }}
              />
            </div>
            <small className="text-muted text-[11px] block">
              {completedInCat} of {activeQuestionsInCat.length} completed
            </small>
          </div>

          {/* Stat 3: Mastered */}
          <div className="p-4 border border-line rounded-[13px] bg-white shadow-subtle text-left transition-all hover:border-line-strong">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted m-0 mb-2">
              MASTERED
            </p>
            <div className="font-heading font-extrabold text-2xl text-ink mb-2">
              {completedCount}
            </div>
            <small className="text-muted text-[11px] block">
              questions done 🔥
            </small>
          </div>

          {/* Stat 4: Remaining */}
          <div className="p-4 border border-line rounded-[13px] bg-white shadow-subtle text-left transition-all hover:border-line-strong">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted m-0 mb-2">
              TO REVIEW
            </p>
            <div className="font-heading font-extrabold text-2xl text-ink mb-2">
              {totalCount - completedCount}
            </div>
            <small className="text-muted text-[11px] block">
              questions remaining
            </small>
          </div>
        </section>

        {/* ACTIVE VIDEO PLAYER SECTION (Plays ONLY that particular question part) */}
        <section id="player-section" className="px-6 sm:px-10 pt-4 pb-2">
          <YouTubePlayer
            currentQuestion={currentQuestion}
            onNextQuestion={handleNextQuestion}
            onPreviousQuestion={handlePreviousQuestion}
            hasPrevious={hasPrevious}
            hasNext={hasNext}
            isCompleted={!!completedMap[currentQuestion.id]}
            onToggleCompleted={handleToggleCompleted}
            autoAdvance={autoAdvance}
            setAutoAdvance={setAutoAdvance}
            loopMode={loopMode}
            setLoopMode={setLoopMode}
          />
        </section>

        {/* SECTION HEADING & CONTROLS */}
        <section className="px-6 sm:px-10 pt-8 pb-3 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-muted m-0">
              QUESTION CHECKLIST
            </p>
            <h2 className="m-0 mt-1 font-heading font-extrabold text-xl text-ink tracking-tight">
              Small steps, one question at a time
            </h2>
          </div>

          {/* Search & Status Filters */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search question, keyword..."
                className="pl-8 pr-7 py-1.5 text-xs bg-white border border-line rounded-lg text-ink focus:outline-none focus:border-ink transition-colors w-48 sm:w-60 shadow-subtle placeholder:text-muted"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted hover:text-ink"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Filter buttons */}
            <div className="flex items-center border border-line rounded-lg p-0.5 bg-paper-muted text-xs">
              <button
                type="button"
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1 rounded font-bold transition-colors ${
                  statusFilter === 'all'
                    ? 'bg-ink text-white shadow-subtle'
                    : 'text-muted hover:text-ink'
                }`}
              >
                All ({filteredQuestions.length})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('pending')}
                className={`px-3 py-1 rounded font-bold transition-colors ${
                  statusFilter === 'pending'
                    ? 'bg-ink text-white shadow-subtle'
                    : 'text-muted hover:text-ink'
                }`}
              >
                To Do
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('completed')}
                className={`px-3 py-1 rounded font-bold transition-colors ${
                  statusFilter === 'completed'
                    ? 'bg-ink text-white shadow-subtle'
                    : 'text-muted hover:text-ink'
                }`}
              >
                Done
              </button>
            </div>
          </div>
        </section>

        {/* QUESTIONS GRID (course-task style) */}
        <section className="px-6 sm:px-10 pb-8 grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredQuestions.length === 0 ? (
            <div className="col-span-full py-12 text-center border border-line rounded-xl bg-white p-8">
              <p className="text-sm font-bold text-ink">No questions found</p>
              <p className="text-xs text-muted mt-1">Try clearing your search query or switching filters.</p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('all');
                  setActiveCategory('all');
                }}
                className="mt-3 px-3 py-1.5 border border-line rounded-lg text-xs font-bold text-ink hover:bg-paper-muted transition-colors"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            filteredQuestions.map((q) => (
              <QuestionCard
                key={q.id}
                question={q}
                isActive={currentQuestion.id === q.id}
                isCompleted={!!completedMap[q.id]}
                onSelect={(selected) => {
                  setCurrentQuestion(selected);
                  const el = document.getElementById('player-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                onToggleCompleted={handleToggleCompleted}
                note={notesMap[q.id]}
                onSaveNote={handleSaveNote}
              />
            ))
          )}
        </section>

        {/* PAGE FOOTER (comback2026 style) */}
        <footer className="mt-auto px-6 sm:px-10 py-5 border-t border-line bg-white flex flex-wrap items-center justify-between gap-4 text-xs text-muted">
          <span>Progress is stored in this browser only.</span>
          <button
            type="button"
            onClick={handleResetProgress}
            className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-red-600 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset progress</span>
          </button>
        </footer>

      </main>
    </div>
  );
}
