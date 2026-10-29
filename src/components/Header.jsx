import React from 'react';
import { 
  Search, 
  X, 
  CheckCircle2, 
  Sparkles, 
  RotateCcw,
  BookOpen,
  Filter
} from 'lucide-react';
import { CATEGORIES } from '../data/questions';

export default function Header({
  searchQuery,
  setSearchQuery,
  activeCategory,
  setActiveCategory,
  statusFilter,
  setStatusFilter,
  completedCount,
  totalCount,
  onResetProgress
}) {
  const percent = Math.round((completedCount / totalCount) * 100);

  return (
    <header className="sticky top-0 z-30 bg-slate-950/95 backdrop-blur border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 space-y-3">
        {/* Top Branding Row */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-white font-black text-lg">
              dj
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
                Django Interview Preparation
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  54 Questions
                </span>
              </h1>
              <p className="text-xs text-slate-400">
                Precision timestamp video study & checkbox progress tracker
              </p>
            </div>
          </div>

          {/* Quick Stats & Reset */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800">
              <div className="text-right">
                <div className="text-xs font-bold text-slate-200">
                  {completedCount} / {totalCount} Done
                </div>
                <div className="text-[10px] text-emerald-400 font-mono font-semibold">
                  {percent}% completed
                </div>
              </div>
              <div className="w-8 h-8 rounded-full border-2 border-slate-800 flex items-center justify-center relative">
                <svg className="w-8 h-8 -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-slate-800"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-emerald-500 transition-all duration-300"
                    strokeDasharray={`${percent}, 100`}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
              </div>
            </div>

            {completedCount > 0 && (
              <button
                onClick={onResetProgress}
                title="Reset all checkboxes"
                className="p-2 rounded-xl text-slate-400 hover:text-rose-400 bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pt-2 border-t border-slate-800/60">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search questions, ORM, CSRF, Signals, etc..."
              className="w-full pl-9 pr-8 py-1.5 text-xs sm:text-sm bg-slate-900/90 border border-slate-800 rounded-xl text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Status Segment Filter: All / Incomplete / Done */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
            <div className="flex items-center bg-slate-900 p-0.5 rounded-xl border border-slate-800 text-xs">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                  statusFilter === 'all'
                    ? 'bg-slate-800 text-white font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setStatusFilter('pending')}
                className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                  statusFilter === 'pending'
                    ? 'bg-slate-800 text-white font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                To Do ({totalCount - completedCount})
              </button>
              <button
                onClick={() => setStatusFilter('completed')}
                className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                  statusFilter === 'completed'
                    ? 'bg-emerald-500 text-white font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Completed ({completedCount})
              </button>
            </div>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`whitespace-nowrap px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                activeCategory === cat.id
                  ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                  : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 border border-slate-800/80'
              }`}
            >
              {cat.label}
              <span className={`ml-1.5 text-[10px] px-1.5 py-0.2 rounded-full ${
                activeCategory === cat.id ? 'bg-emerald-700 text-white' : 'bg-slate-800 text-slate-400'
              }`}>
                {cat.count}
              </span>
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}
