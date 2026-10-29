import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Circle, 
  Play, 
  Clock, 
  Tag, 
  FileEdit, 
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Sparkles
} from 'lucide-react';
import { VIDEO_BASE_URL } from '../data/questions';

export default function QuestionCard({
  question,
  isActive,
  isCompleted,
  onSelect,
  onToggleCompleted,
  note,
  onSaveNote
}) {
  const [showNotes, setShowNotes] = useState(false);
  const [localNote, setLocalNote] = useState(note || '');

  const durationSecs = question.endSeconds - question.startSeconds;

  const handleCheckboxClick = (e) => {
    e.stopPropagation();
    onToggleCompleted(question.id);
  };

  const handleNoteBlur = () => {
    if (localNote !== note) {
      onSaveNote(question.id, localNote);
    }
  };

  return (
    <div
      onClick={() => onSelect(question)}
      className={`group relative rounded-xl border p-4 transition-all duration-200 cursor-pointer ${
        isActive
          ? 'bg-slate-800/90 border-emerald-500 shadow-xl shadow-emerald-500/10 ring-1 ring-emerald-500/50'
          : isCompleted
          ? 'bg-slate-900/50 border-slate-800/60 opacity-80 hover:opacity-100 hover:border-slate-700'
          : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-800/50'
      }`}
    >
      <div className="flex items-start gap-3.5">
        {/* Checkbox button */}
        <button
          type="button"
          onClick={handleCheckboxClick}
          aria-label={isCompleted ? 'Mark as uncompleted' : 'Mark as completed'}
          className="mt-0.5 flex-shrink-0 text-slate-500 hover:text-emerald-400 focus:outline-none transition-colors"
        >
          {isCompleted ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 fill-emerald-500/20" />
          ) : (
            <Circle className="w-5 h-5 text-slate-500 hover:border-slate-400" />
          )}
        </button>

        {/* Content body */}
        <div className="flex-1 min-w-0">
          {/* Metadata Top Row */}
          <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                Q{question.questionNumber}
              </span>
              <span className="text-[11px] font-medium text-slate-400">
                {question.partName.split(':')[0]}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Duration badge */}
              <span className="inline-flex items-center gap-1 text-[11px] font-mono text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700/50">
                <Clock className="w-3 h-3 text-slate-400" />
                {question.startTime} ({durationSecs}s)
              </span>

              {/* Active Indicator */}
              {isActive && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  <span className="flex gap-0.5 items-end h-3">
                    <span className="w-0.5 bg-emerald-400 animate-eq-1" />
                    <span className="w-0.5 bg-emerald-400 animate-eq-2" />
                    <span className="w-0.5 bg-emerald-400 animate-eq-3" />
                  </span>
                  Playing
                </span>
              )}
            </div>
          </div>

          {/* Question Title */}
          <h3
            className={`text-sm md:text-base font-semibold leading-snug tracking-tight transition-colors ${
              isActive
                ? 'text-emerald-300'
                : isCompleted
                ? 'text-slate-300 line-through decoration-slate-600/70'
                : 'text-slate-100 group-hover:text-emerald-300'
            }`}
          >
            {question.title}
          </h3>

          {/* Key Quick Answer Tip */}
          {question.tip && (
            <div className="mt-2 text-xs text-slate-400 bg-slate-950/50 rounded-lg px-2.5 py-1.5 border border-slate-800/80 font-mono flex items-center gap-2">
              <Sparkles className="w-3 h-3 text-amber-400 flex-shrink-0" />
              <span className="truncate text-slate-300">{question.tip}</span>
            </div>
          )}

          {/* Tags & Action Buttons */}
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/60">
            {/* Tags */}
            <div className="flex flex-wrap items-center gap-1.5">
              {question.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-slate-800/70 text-slate-400 border border-slate-700/40"
                >
                  #{tag}
                </span>
              ))}
            </div>

            {/* Note & Direct Link Actions */}
            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                onClick={() => setShowNotes(!showNotes)}
                title="Add your notes for this question"
                className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded transition-colors ${
                  showNotes || localNote
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'text-slate-400 hover:text-slate-200 bg-slate-800/60'
                }`}
              >
                <FileEdit className="w-3 h-3" />
                <span>{localNote ? 'Note saved' : 'Note'}</span>
                {showNotes ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>

              <a
                href={`${VIDEO_BASE_URL}&t=${question.startSeconds}s`}
                target="_blank"
                rel="noopener noreferrer"
                title="Direct link to timestamp"
                className="text-slate-500 hover:text-slate-300 p-1 transition-colors"
              >
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Collapsible Personal Note Area */}
          {showNotes && (
            <div
              className="mt-3 pt-3 border-t border-slate-800"
              onClick={(e) => e.stopPropagation()}
            >
              <label className="block text-[11px] font-medium text-slate-400 mb-1">
                Your Interview Notes / Answer Bullets:
              </label>
              <textarea
                value={localNote}
                onChange={(e) => setLocalNote(e.target.value)}
                onBlur={handleNoteBlur}
                placeholder="Write your explanation, syntax reminders, or interview points..."
                rows={2}
                className="w-full text-xs bg-slate-950 border border-slate-700/80 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-emerald-500 transition-colors placeholder:text-slate-600 resize-y"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
