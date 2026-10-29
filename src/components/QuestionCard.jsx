import React, { useState } from 'react';
import { 
  Check, 
  Play, 
  ExternalLink, 
  ChevronDown, 
  ChevronUp, 
  FileText,
  Clock
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
      className={`border rounded-xl p-4 sm:p-5 transition-all cursor-pointer relative bg-white ${
        isActive
          ? 'border-ink shadow-hover ring-1 ring-ink'
          : isCompleted
          ? 'border-line bg-paper-muted/60 opacity-85 hover:opacity-100 hover:border-line-strong'
          : 'border-line hover:border-line-strong hover:shadow-subtle'
      }`}
    >
      <div className="flex items-start gap-3.5">
        {/* Task Marker Checkbox (Identical to comback2026 task-marker) */}
        <button
          type="button"
          onClick={handleCheckboxClick}
          aria-label={isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
          className={`w-6 h-6 flex-shrink-0 mt-0.5 rounded-lg border flex items-center justify-center transition-all ${
            isCompleted
              ? 'bg-ink border-ink text-white'
              : 'bg-paper-muted border-line-strong hover:border-ink text-transparent'
          }`}
        >
          <Check className="w-3.5 h-3.5 stroke-[2.5]" />
        </button>

        {/* Question Details */}
        <div className="flex-1 min-w-0">
          {/* Kicker & Meta Row */}
          <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted">
              {question.partName.split(':')[0].toUpperCase()} • Q{question.questionNumber}
            </span>

            <div className="flex items-center gap-1.5">
              <span className="inline-flex items-center gap-1 text-[11px] font-mono text-muted bg-paper-muted px-2 py-0.5 rounded border border-line">
                <Clock className="w-3 h-3 text-muted" />
                {question.startTime} ({durationSecs}s)
              </span>

              {isActive && (
                <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wide text-white bg-ink px-2 py-0.5 rounded">
                  <span className="flex gap-0.5 items-end h-2.5">
                    <span className="w-0.5 bg-white animate-eq-1" />
                    <span className="w-0.5 bg-white animate-eq-2" />
                    <span className="w-0.5 bg-white animate-eq-3" />
                  </span>
                  Playing
                </span>
              )}
            </div>
          </div>

          {/* Question Title */}
          <h3
            className={`text-sm sm:text-[15px] font-bold font-heading leading-snug tracking-tight ${
              isCompleted
                ? 'text-muted line-through decoration-line-strong'
                : 'text-ink'
            }`}
          >
            {question.title}
          </h3>

          {/* Quick Tip Summary */}
          {question.tip && (
            <div className="mt-2 text-xs font-mono text-muted bg-paper-muted rounded-lg px-2.5 py-1.5 border border-line">
              <span className="font-sans font-bold text-ink mr-1">Concept:</span>
              <span className="text-ink/80">{question.tip}</span>
            </div>
          )}

          {/* Bottom Action Row (comback2026 button style) */}
          <div className="mt-3.5 pt-3 border-t border-line flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              {/* Play Answer Button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect(question);
                }}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-ink border-ink text-white'
                    : 'bg-white border-line text-ink hover:border-ink hover:bg-paper-muted'
                }`}
              >
                <Play className="w-3 h-3 fill-current" />
                <span>{isActive ? 'Playing' : 'Play Answer'}</span>
              </button>

              {/* Complete Toggle Button */}
              <button
                type="button"
                onClick={handleCheckboxClick}
                className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-xs font-bold transition-all ${
                  isCompleted
                    ? 'bg-paper-muted border-line-strong text-muted hover:text-ink'
                    : 'bg-white border-line text-muted hover:border-ink hover:text-ink'
                }`}
              >
                <Check className="w-3 h-3" />
                <span>{isCompleted ? 'Done' : 'Mark Done'}</span>
              </button>
            </div>

            {/* Notes & External Link */}
            <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                onClick={() => setShowNotes(!showNotes)}
                className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-xs font-bold transition-all ${
                  showNotes || localNote
                    ? 'border-ink bg-paper-muted text-ink'
                    : 'border-line text-muted hover:text-ink hover:bg-paper-muted'
                }`}
              >
                <FileText className="w-3 h-3" />
                <span>{localNote ? 'Note' : 'Add Note'}</span>
                {showNotes ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>

              <a
                href={`${VIDEO_BASE_URL}&t=${question.startSeconds}s`}
                target="_blank"
                rel="noopener noreferrer"
                title="Open on YouTube"
                className="p-1.5 rounded-lg border border-line text-muted hover:text-ink hover:bg-paper-muted transition-colors"
              >
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Notes Area */}
          {showNotes && (
            <div
              className="mt-3 pt-3 border-t border-line"
              onClick={(e) => e.stopPropagation()}
            >
              <textarea
                value={localNote}
                onChange={(e) => setLocalNote(e.target.value)}
                onBlur={handleNoteBlur}
                placeholder="Write your explanation, answers, or reminders..."
                rows={2}
                className="w-full text-xs font-sans bg-paper-muted border border-line rounded-lg p-2.5 text-ink focus:outline-none focus:border-ink transition-colors placeholder:text-muted resize-y"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
