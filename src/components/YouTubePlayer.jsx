import React, { useEffect, useRef, useState } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  SkipBack, 
  SkipForward, 
  ExternalLink, 
  Repeat, 
  FastForward, 
  Check, 
  Clock,
  Sparkles
} from 'lucide-react';
import { VIDEO_ID, VIDEO_BASE_URL } from '../data/questions';

export default function YouTubePlayer({
  currentQuestion,
  onNextQuestion,
  onPreviousQuestion,
  hasPrevious,
  hasNext,
  isCompleted,
  onToggleCompleted,
  autoAdvance,
  setAutoAdvance,
  loopMode,
  setLoopMode
}) {
  const playerRef = useRef(null);
  const intervalRef = useRef(null);

  const [apiReady, setApiReady] = useState(false);
  const [playerState, setPlayerState] = useState(-1);
  const [currentTime, setCurrentTime] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [iframeFallbackKey, setIframeFallbackKey] = useState(0);
  const [useIframeFallback, setUseIframeFallback] = useState(false);

  // Load YouTube IFrame API
  useEffect(() => {
    if (window.YT && window.YT.Player) {
      setApiReady(true);
      return;
    }

    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

    window.onYouTubeIframeAPIReady = () => {
      setApiReady(true);
    };

    const timeout = setTimeout(() => {
      if (!window.YT || !window.YT.Player) {
        setUseIframeFallback(true);
      }
    }, 3500);

    return () => clearTimeout(timeout);
  }, []);

  // Initialize YT player
  useEffect(() => {
    if (!apiReady || playerRef.current || useIframeFallback) return;

    try {
      playerRef.current = new window.YT.Player('yt-iframe-instance', {
        videoId: VIDEO_ID,
        playerVars: {
          start: currentQuestion.startSeconds,
          end: currentQuestion.endSeconds,
          autoplay: 1,
          controls: 1,
          modestbranding: 1,
          rel: 0,
        },
        events: {
          onReady: (event) => {
            try {
              event.target.loadVideoById({
                videoId: VIDEO_ID,
                startSeconds: currentQuestion.startSeconds,
                endSeconds: currentQuestion.endSeconds,
              });
              event.target.setPlaybackRate(playbackRate);
            } catch (err) {
              console.warn(err);
            }
          },
          onStateChange: (event) => {
            setPlayerState(event.data);
            if (event.data === window.YT.PlayerState.ENDED) {
              handleSegmentEnd();
            }
          },
          onError: () => {
            setUseIframeFallback(true);
          }
        },
      });
    } catch (err) {
      console.warn('YT Init error:', err);
      setUseIframeFallback(true);
    }

    return () => {
      if (playerRef.current && playerRef.current.destroy) {
        try {
          playerRef.current.destroy();
          playerRef.current = null;
        } catch (e) {
          // ignore
        }
      }
    };
  }, [apiReady, useIframeFallback]);

  // Handle question switch
  useEffect(() => {
    setCurrentTime(currentQuestion.startSeconds);

    if (playerRef.current && playerRef.current.loadVideoById) {
      try {
        playerRef.current.loadVideoById({
          videoId: VIDEO_ID,
          startSeconds: currentQuestion.startSeconds,
          endSeconds: currentQuestion.endSeconds,
        });
        playerRef.current.setPlaybackRate(playbackRate);
      } catch (e) {
        setIframeFallbackKey((prev) => prev + 1);
      }
    } else {
      setIframeFallbackKey((prev) => prev + 1);
    }
  }, [currentQuestion]);

  // Interval timer to strictly bound segment playback
  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = setInterval(() => {
      if (!playerRef.current || !playerRef.current.getCurrentTime) return;
      try {
        const time = playerRef.current.getCurrentTime();
        setCurrentTime(time);

        if (time >= currentQuestion.endSeconds) {
          handleSegmentEnd();
        }
      } catch (e) {
        // ignore polling error
      }
    }, 250);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [currentQuestion, loopMode, autoAdvance]);

  const handleSegmentEnd = () => {
    if (loopMode) {
      if (playerRef.current && playerRef.current.seekTo) {
        playerRef.current.seekTo(currentQuestion.startSeconds, true);
        playerRef.current.playVideo();
      }
    } else if (autoAdvance && hasNext) {
      onNextQuestion();
    } else {
      if (playerRef.current && playerRef.current.pauseVideo) {
        playerRef.current.pauseVideo();
        playerRef.current.seekTo(currentQuestion.startSeconds, true);
      }
    }
  };

  const handleReplaySegment = () => {
    if (playerRef.current && playerRef.current.seekTo) {
      try {
        playerRef.current.seekTo(currentQuestion.startSeconds, true);
        playerRef.current.playVideo();
      } catch (e) {
        setIframeFallbackKey((prev) => prev + 1);
      }
    } else {
      setIframeFallbackKey((prev) => prev + 1);
    }
  };

  const handleSeekRelative = (seconds) => {
    if (!playerRef.current || !playerRef.current.getCurrentTime) return;
    try {
      const now = playerRef.current.getCurrentTime();
      const target = Math.max(
        currentQuestion.startSeconds,
        Math.min(currentQuestion.endSeconds, now + seconds)
      );
      playerRef.current.seekTo(target, true);
    } catch (e) {
      console.warn(e);
    }
  };

  const handleRateChange = (rate) => {
    setPlaybackRate(rate);
    if (playerRef.current && playerRef.current.setPlaybackRate) {
      try {
        playerRef.current.setPlaybackRate(rate);
      } catch (e) {
        console.warn(e);
      }
    }
  };

  const segmentDuration = Math.max(1, currentQuestion.endSeconds - currentQuestion.startSeconds);
  const currentProgressSeconds = Math.max(0, Math.min(segmentDuration, currentTime - currentQuestion.startSeconds));
  const segmentPercent = Math.min(100, (currentProgressSeconds / segmentDuration) * 100);

  return (
    <div className="border border-line rounded-[14px] bg-white shadow-card overflow-hidden">
      {/* Player Header Banner */}
      <div className="p-4 sm:p-5 pb-3 border-b border-line flex flex-wrap items-center justify-between gap-3 bg-white">
        <div>
          <p className="m-0 text-[10px] font-extrabold uppercase tracking-widest text-ink">
            NOW PLAYING • {currentQuestion.partName.toUpperCase()}
          </p>
          <h2 className="m-0 mt-1 text-base sm:text-lg font-bold font-heading text-ink tracking-tight">
            {currentQuestion.title}
          </h2>
          <div className="mt-1 flex items-center gap-2 text-xs text-muted">
            <span className="font-mono font-semibold text-ink">
              {currentQuestion.startTime} — {currentQuestion.endTime}
            </span>
            <span>•</span>
            <span>{segmentDuration}s segment</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Mark Complete Checkbox / Button */}
          <button
            type="button"
            onClick={() => onToggleCompleted(currentQuestion.id)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all ${
              isCompleted
                ? 'bg-ink border-ink text-white shadow-sm'
                : 'bg-white border-line-strong text-ink hover:bg-paper-muted'
            }`}
          >
            <Check className={`w-3.5 h-3.5 ${isCompleted ? 'stroke-[2.5]' : 'text-muted'}`} />
            <span>{isCompleted ? 'Mastered' : 'Mark Done'}</span>
          </button>

          {/* Open on YouTube */}
          <a
            href={`${VIDEO_BASE_URL}&t=${currentQuestion.startSeconds}s`}
            target="_blank"
            rel="noopener noreferrer"
            title="Open on YouTube at this exact timestamp"
            className="p-1.5 rounded-lg border border-line text-muted hover:text-ink hover:bg-paper-muted transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* Video Container (16:9 ratio) */}
      <div className="relative w-full pt-[56.25%] bg-black">
        {!useIframeFallback ? (
          <div className="absolute inset-0 w-full h-full">
            <div id="yt-iframe-instance" className="w-full h-full" />
          </div>
        ) : (
          <iframe
            key={iframeFallbackKey}
            src={`https://www.youtube.com/embed/${VIDEO_ID}?start=${currentQuestion.startSeconds}&end=${currentQuestion.endSeconds}&autoplay=1&rel=0&modestbranding=1`}
            title={currentQuestion.title}
            className="absolute inset-0 w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        )}
      </div>

      {/* Segment Timeline Bar */}
      <div className="w-full h-1.5 bg-line overflow-hidden">
        <div 
          className="h-full bg-ink transition-all duration-150"
          style={{ width: `${segmentPercent}%` }}
        />
      </div>

      {/* Recall Tip Box */}
      {currentQuestion.tip && (
        <div className="mx-4 sm:mx-5 mt-3.5 p-3 rounded-xl border border-line bg-paper-muted text-xs text-ink flex items-start gap-2.5">
          <span className="font-bold text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded bg-white border border-line text-ink flex-shrink-0">
            QUICK RECALL
          </span>
          <span className="font-mono text-xs text-ink/90">{currentQuestion.tip}</span>
        </div>
      )}

      {/* Player Controls Bar */}
      <div className="p-4 sm:p-5 pt-3 flex flex-wrap items-center justify-between gap-3">
        {/* Navigation buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={onPreviousQuestion}
            disabled={!hasPrevious}
            title="Previous question"
            className="h-8 px-2.5 rounded-lg border border-line bg-white hover:bg-paper-muted text-ink disabled:opacity-30 disabled:pointer-events-none transition-colors flex items-center justify-center text-xs font-bold"
          >
            <SkipBack className="w-3.5 h-3.5 mr-1" />
            <span className="hidden sm:inline">Prev</span>
          </button>

          <button
            type="button"
            onClick={() => handleSeekRelative(-5)}
            title="Rewind 5 seconds"
            className="h-8 px-2 rounded-lg border border-line bg-white hover:bg-paper-muted text-xs font-mono font-medium text-ink transition-colors"
          >
            -5s
          </button>

          <button
            type="button"
            onClick={handleReplaySegment}
            title="Replay this answer segment"
            className="h-8 px-3 rounded-lg border border-ink bg-ink text-white hover:bg-brand-hover text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Replay Answer</span>
          </button>

          <button
            type="button"
            onClick={() => handleSeekRelative(5)}
            title="Fast forward 5 seconds"
            className="h-8 px-2 rounded-lg border border-line bg-white hover:bg-paper-muted text-xs font-mono font-medium text-ink transition-colors"
          >
            +5s
          </button>

          <button
            type="button"
            onClick={onNextQuestion}
            disabled={!hasNext}
            title="Next question"
            className="h-8 px-2.5 rounded-lg border border-line bg-white hover:bg-paper-muted text-ink disabled:opacity-30 disabled:pointer-events-none transition-colors flex items-center justify-center text-xs font-bold"
          >
            <span className="hidden sm:inline mr-1">Next</span>
            <SkipForward className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Speed & Option Controls */}
        <div className="flex items-center gap-2">
          {/* Speed switcher */}
          <div className="flex items-center border border-line rounded-lg p-0.5 bg-paper-muted text-xs">
            {[1, 1.25, 1.5, 2].map((rate) => (
              <button
                key={rate}
                type="button"
                onClick={() => handleRateChange(rate)}
                className={`px-2 py-0.5 rounded font-mono font-bold text-xs transition-colors ${
                  playbackRate === rate
                    ? 'bg-ink text-white shadow-sm'
                    : 'text-muted hover:text-ink'
                }`}
              >
                {rate}x
              </button>
            ))}
          </div>

          {/* Loop toggle */}
          <button
            type="button"
            onClick={() => setLoopMode(!loopMode)}
            title={loopMode ? 'Looping Answer ON' : 'Looping Answer OFF'}
            className={`h-8 px-2.5 rounded-lg border text-xs font-bold transition-all flex items-center gap-1 ${
              loopMode
                ? 'bg-ink border-ink text-white'
                : 'bg-white border-line text-muted hover:text-ink hover:bg-paper-muted'
            }`}
          >
            <Repeat className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Loop</span>
          </button>

          {/* Auto-Advance toggle */}
          <button
            type="button"
            onClick={() => setAutoAdvance(!autoAdvance)}
            title={autoAdvance ? 'Auto Next ON' : 'Auto Next OFF'}
            className={`h-8 px-2.5 rounded-lg border text-xs font-bold transition-all flex items-center gap-1 ${
              autoAdvance
                ? 'bg-ink border-ink text-white'
                : 'bg-white border-line text-muted hover:text-ink hover:bg-paper-muted'
            }`}
          >
            <FastForward className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Auto-Next</span>
          </button>
        </div>
      </div>
    </div>
  );
}
