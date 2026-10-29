import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  QUESTIONS_DATA, 
  CATEGORIES, 
  INTRO_SECTION, 
  CONCLUSION_SECTION 
} from './data/questions';
import YouTubePlayer from './components/YouTubePlayer';
import QuestionCard from './components/QuestionCard';
import Header from './components/Header';
import { 
  Sparkles, 
  CheckCircle, 
  ListFilter, 
  Keyboard, 
  PlayCircle,
  HelpCircle,
  ExternalLink,
  Info
} from 'lucide-react';

const STORAGE_KEY_COMPLETED = 'django_prep_completed_v1';
const STORAGE_KEY_NOTES = 'django_prep_notes_v1';
const STORAGE_KEY_LAST_ID = 'django_prep_last_question_id';
const STORAGE_KEY_AUTO_ADVANCE = 'django_prep_auto_advance';

export default function App() {
  // Load initial states from localStorage
  const [completedMap, setCompletedMap] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_COMPLETED);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [notesMap, setNotesMap] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_NOTES);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

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

  const [autoAdvance, setAutoAdvance] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY_AUTO_ADVANCE) === 'true';
    } catch {
      return false;
    }
  });

  const [loopMode, setLoopMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);

  // Save changes to localStorage
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

  // Save note
  const handleSaveNote = useCallback((id, noteText) => {
    setNotesMap((prev) => ({
      ...prev,
      [id]: noteText
    }));
  }, []);

  // Reset progress
  const handleResetProgress = () => {
    if (window.confirm('Are you sure you want to reset all completed checkboxes?')) {
      setCompletedMap({});
    }
  };

  // Filter questions
  const filteredQuestions = useMemo(() => {
    return QUESTIONS_DATA.filter((q) => {
      // Category filter
      if (activeCategory !== 'all' && q.partId !== activeCategory) {
        return false;
      }

      // Status filter
      const isDone = !!completedMap[q.id];
      if (statusFilter === 'completed' && !isDone) return false;
      if (statusFilter === 'pending' && isDone) return false;

      // Search query
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

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore if user is typing in input or textarea
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;

      if (e.key === 'c' || e.key === 'C') {
        handleToggleCompleted(currentQuestion.id);
      } else if (e.key === 'ArrowRight' || e.key === 'n') {
        handleNextQuestion();
      } else if (e.key === 'ArrowLeft' || e.key === 'p') {
        handlePreviousQuestion();
      } else if (e.key === '?') {
        setShowKeyboardHelp((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentQuestion.id, handleToggleCompleted, handleNextQuestion, handlePreviousQuestion]);

  const completedCount = Object.values(completedMap).filter(Boolean).length;
  const totalCount = QUESTIONS_DATA.length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Header with Search and Filters */}
      <Header
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        completedCount={completedCount}
        totalCount={totalCount}
        onResetProgress={handleResetProgress}
      />

      {/* Main Content Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Fixed / Sticky Video Player */}
          <div className="lg:col-span-6 xl:col-span-7 lg:sticky lg:top-[160px] space-y-4">
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

            {/* Quick Section Jump Pill Bar */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2 text-slate-400">
                <PlayCircle className="w-4 h-4 text-emerald-400" />
                <span className="font-medium text-slate-300">Quick Jump:</span>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  onClick={() => setCurrentQuestion(INTRO_SECTION)}
                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition-colors"
                >
                  Introduction (00:00)
                </button>
                <button
                  onClick={() => setCurrentQuestion(QUESTIONS_DATA[0])}
                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition-colors"
                >
                  Part 1 (01:01)
                </button>
                <button
                  onClick={() => setCurrentQuestion(QUESTIONS_DATA[11])}
                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition-colors"
                >
                  Part 2 (09:14)
                </button>
                <button
                  onClick={() => setCurrentQuestion(QUESTIONS_DATA[27])}
                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition-colors"
                >
                  Part 3 (40:09)
                </button>
                <button
                  onClick={() => setCurrentQuestion(QUESTIONS_DATA[43])}
                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition-colors"
                >
                  Part 4 (1:02:46)
                </button>
                <button
                  onClick={() => setCurrentQuestion(CONCLUSION_SECTION)}
                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition-colors"
                >
                  Conclusion (1:13:23)
                </button>
              </div>
            </div>

            {/* Next Up Preview Card */}
            {hasNext && (
              <div 
                onClick={handleNextQuestion}
                className="bg-slate-900/40 hover:bg-slate-900/80 border border-slate-800/80 rounded-xl p-3 flex items-center justify-between gap-3 cursor-pointer transition-colors group"
              >
                <div className="min-w-0">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                    Next Up ({QUESTIONS_DATA[currentIndex + 1].startTime})
                  </span>
                  <p className="text-xs text-slate-300 font-medium truncate group-hover:text-emerald-400 transition-colors">
                    {QUESTIONS_DATA[currentIndex + 1].title}
                  </p>
                </div>
                <span className="text-xs font-semibold text-emerald-400 flex-shrink-0 group-hover:translate-x-0.5 transition-transform">
                  Play Next →
                </span>
              </div>
            )}

            {/* Keyboard Shortcuts Hint */}
            <div className="hidden sm:flex items-center justify-between text-[11px] text-slate-400 px-2">
              <span className="flex items-center gap-1.5">
                <Keyboard className="w-3.5 h-3.5 text-slate-400" />
                Shortcuts: <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-slate-300 font-mono">C</kbd> mark done, <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-slate-300 font-mono">→</kbd> next, <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-slate-300 font-mono">←</kbd> prev
              </span>
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="text-slate-400 hover:text-slate-300 transition-colors"
              >
                Vercel Ready
              </a>
            </div>
          </div>

          {/* Right Column: Questions List with Checkboxes */}
          <div className="lg:col-span-6 xl:col-span-5 space-y-4">
            {/* List Header */}
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <ListFilter className="w-4 h-4 text-emerald-400" />
                <h2 className="text-sm font-bold text-slate-200">
                  Questions ({filteredQuestions.length})
                </h2>
              </div>
              <span className="text-xs text-slate-400">
                Click question to play only that segment
              </span>
            </div>

            {/* Empty state if search has no results */}
            {filteredQuestions.length === 0 ? (
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center space-y-3">
                <HelpCircle className="w-10 h-10 text-slate-600 mx-auto" />
                <h3 className="text-base font-semibold text-slate-300">
                  No questions match your filter
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Try clearing your search query or selecting a different category or status filter above.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setActiveCategory('all');
                    setStatusFilter('all');
                  }}
                  className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="space-y-2.5">
                {filteredQuestions.map((question) => (
                  <QuestionCard
                    key={question.id}
                    question={question}
                    isActive={currentQuestion.id === question.id}
                    isCompleted={!!completedMap[question.id]}
                    onSelect={setCurrentQuestion}
                    onToggleCompleted={handleToggleCompleted}
                    note={notesMap[question.id]}
                    onSaveNote={handleSaveNote}
                  />
                ))}
              </div>
            )}
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="mt-12 border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-400">
        <p>
          Django Interview Questions Prep Player • Built with React, Vite & Tailwind CSS. Ready to deploy on Vercel.
        </p>
      </footer>
    </div>
  );
}
