import React from 'react';
import { Play, Pause, RotateCcw, Check, Lock, Unlock } from 'lucide-react';

export default function CircularTimer({
  secondsLeft,
  totalSeconds = 1200,
  isRunning = true,
  onToggleRunning,
  onReset,
  size = 96,
  strokeWidth = 6,
  colorScheme = 'focus', // 'focus' | 'script'
  label = '',
  completedLabel = 'DONE',
  subLabel = '',
  showControls = true,
  isUnlockedState = false
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  
  // Progress from 0 to 1
  const progress = Math.max(0, Math.min(1, (totalSeconds - secondsLeft) / totalSeconds));
  const strokeDashoffset = circumference - (progress * circumference);

  const isCompleted = secondsLeft === 0 || isUnlockedState;

  // Format mm:ss
  const m = Math.floor(secondsLeft / 60);
  const s = secondsLeft % 60;
  const formattedDigits = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;

  // Dynamic color selection based on remaining time and scheme
  let strokeColor = '#10b981'; // emerald
  let glowColor = 'rgba(16, 185, 129, 0.25)';
  let bgTrack = '#f1f1f4';

  if (colorScheme === 'script') {
    if (isCompleted) {
      strokeColor = '#10b981'; // emerald
      glowColor = 'rgba(16, 185, 129, 0.35)';
    } else {
      strokeColor = '#8b5cf6'; // vibrant purple
      glowColor = 'rgba(139, 92, 246, 0.25)';
    }
  } else {
    // Focus 20m color stages
    if (isCompleted) {
      strokeColor = '#10b981'; // emerald
      glowColor = 'rgba(16, 185, 129, 0.35)';
    } else if (secondsLeft <= 5 * 60) {
      strokeColor = '#ef4444'; // rose/red (<5m)
      glowColor = 'rgba(239, 68, 68, 0.25)';
    } else if (secondsLeft <= 10 * 60) {
      strokeColor = '#f59e0b'; // amber/orange (5-10m)
      glowColor = 'rgba(245, 158, 11, 0.25)';
    } else {
      strokeColor = '#06b6d4'; // cyan/blue (>10m)
      glowColor = 'rgba(6, 182, 212, 0.25)';
    }
  }

  return (
    <div className="flex flex-col items-center select-none">
      {label && (
        <span className="text-[10px] font-mono font-bold tracking-wider text-zinc-400 uppercase mb-1">
          {label}
        </span>
      )}

      {/* The Colored Circular Clock Face */}
      <div 
        className="relative flex items-center justify-center transition-all duration-300"
        style={{ width: size, height: size }}
      >
        <svg 
          width={size} 
          height={size} 
          className="transform -rotate-90"
        >
          {/* Background track circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={bgTrack}
            strokeWidth={strokeWidth}
            fill="transparent"
          />

          {/* Dynamic Colored Progress Arc with smooth stroke */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-300"
            style={{
              filter: `drop-shadow(0 0 5px ${glowColor})`
            }}
          />
        </svg>

        {/* Center Digital Digits & Status */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-1">
          {isCompleted ? (
            <div className="flex flex-col items-center">
              <span className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xs">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </span>
              <span className="text-[9px] font-mono font-extrabold text-emerald-700 tracking-wider mt-0.5 uppercase">
                {completedLabel}
              </span>
            </div>
          ) : (
            <>
              <span 
                className="font-mono font-extrabold tracking-tight text-zinc-950 leading-none"
                style={{ fontSize: size > 80 ? '14px' : '12px' }}
              >
                {formattedDigits}
              </span>
              <span className="text-[8px] font-mono font-semibold text-zinc-400 uppercase tracking-wider mt-1">
                {subLabel || (isRunning ? 'ACTIVE' : 'PAUSED')}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Tactile Timer Controls */}
      {showControls && (
        <div className="flex items-center gap-1.5 mt-2">
          {onToggleRunning && (
            <button
              type="button"
              onClick={onToggleRunning}
              title={isRunning ? 'Pause Timer' : 'Start Timer'}
              className="p-1 rounded-md border border-zinc-200 bg-white hover:bg-zinc-100 text-zinc-700 transition-colors shadow-xs"
            >
              {isRunning ? (
                <Pause className="w-3 h-3 text-zinc-700" />
              ) : (
                <Play className="w-3 h-3 fill-zinc-700 text-zinc-700 ml-0.5" />
              )}
            </button>
          )}

          {onReset && (
            <button
              type="button"
              onClick={onReset}
              title="Reset Timer"
              className="p-1 rounded-md border border-zinc-200 bg-white hover:bg-zinc-100 text-zinc-400 hover:text-zinc-800 transition-colors shadow-xs"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
