import React, { useEffect, useRef, useState } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  SkipBack, 
  SkipForward, 
  ExternalLink, 
  Volume2, 
  Repeat, 
  FastForward, 
  CheckCircle2, 
  Sparkles,
  Clock
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
  const containerRef = useRef(null);
  const intervalRef = useRef(null);

  const [apiReady, setApiReady] = useState(false);
  const [playerState, setPlayerState] = useState(-1); // -1: unstarted, 1: playing, 2: paused, 0: ended
  const [currentTime, setCurrentTime] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [iframeFallbackKey, setIframeFallbackKey] = useState(0);
  const [useIframeFallback, setUseIframeFallback] = useState(false);

  // Load YouTube IFrame API
  useEffect(() => {
    // Check if script already loaded
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

    // Timeout safety: if API doesn't load in 4s, fallback to native iframe
    const timeout = setTimeout(() => {
      if (!window.YT || !window.YT.Player) {
        setUseIframeFallback(true);
      }
    }, 4000);

    return () => clearTimeout(timeout);
  }, []);

  // Initialize player when API is ready and container exists
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
            // Player ready
            try {
              event.target.loadVideoById({
                videoId: VIDEO_ID,
                startSeconds: currentQuestion.startSeconds,
                endSeconds: currentQuestion.endSeconds,
              });
              event.target.setPlaybackRate(playbackRate);
            } catch (err) {
              console.warn('onReady load error', err);
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
      console.warn('YT player initialization error', err);
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

  // Handle question change
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
        console.warn('Failed to load video via API, refreshing fallback', e);
        setIframeFallbackKey((prev) => prev + 1);
      }
    } else {
      setIframeFallbackKey((prev) => prev + 1);
    }
  }, [currentQuestion]);

  // Interval timer to enforce exact end second boundary
  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = setInterval(() => {
      if (!playerRef.current || !playerRef.current.getCurrentTime) return;
      try {
        const time = playerRef.current.getCurrentTime();
        setCurrentTime(time);

        // If player reaches or exceeds segment end
        if (time >= currentQuestion.endSeconds) {
          handleSegmentEnd();
        }
      } catch (e) {
        // ignore polling errors
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

  const handlePlayPause = () => {
    if (!playerRef.current) return;
    try {
      if (playerState === 1) {
        playerRef.current.pauseVideo();
      } else {
        playerRef.current.playVideo();
      }
    } catch (e) {
      console.warn(e);
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

  // Calculate segment progress percentage
  const segmentDuration = Math.max(1, currentQuestion.endSeconds - currentQuestion.startSeconds);
  const currentProgressSeconds = Math.max(0, Math.min(segmentDuration, currentTime - currentQuestion.startSeconds));
  const segmentPercent = Math.min(100, (currentProgressSeconds / segmentDuration) * 100);

  const formatSecs = (sec) => {
    const s = Math.floor(sec);
    const m = Math.floor(s / 60);
    const rem = s % 60;
    return `${m}:${rem < 10 ? '0' : ''}${rem}`;
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
      {/* Question Header Strip */}
      <div className="px-5 py-4 bg-slate-900/90 backdrop-blur border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="px-2.5 py-1 text-xs font-semibold uppercase tracking-wider rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            {currentQuestion.partName.split(':')[0]}
          </span>
          <span className="text-xs font-medium text-slate-400">
            Question #{currentQuestion.questionNumber} of 54
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Mark Complete Checkbox in Player */}
          <button
            onClick={() => onToggleCompleted(currentQuestion.id)}
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              isCompleted
                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700'
            }`}
          >
            <CheckCircle2 className={`w-4 h-4 ${isCompleted ? 'text-white' : 'text-slate-400'}`} />
            <span>{isCompleted ? 'Completed' : 'Mark Done'}</span>
          </button>

          {/* Open on YouTube */}
          <a
            href={`${VIDEO_BASE_URL}&t=${currentQuestion.startSeconds}s`}
            target="_blank"
            rel="noopener noreferrer"
            title="Open on YouTube at this exact timestamp"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* Video Container (16:9 responsive aspect ratio) */}
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

      {/* Segment Progress Bar */}
      <div className="relative w-full h-1.5 bg-slate-800 cursor-pointer group">
        <div 
          className="h-full bg-emerald-500 transition-all duration-200 relative"
          style={{ width: `${segmentPercent}%` }}
        >
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-md scale-0 group-hover:scale-100 transition-transform" />
        </div>
      </div>

      {/* Controls & Question Info */}
      <div className="p-5 space-y-4">
        {/* Title and Time */}
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 mb-1">
            <Clock className="w-3.5 h-3.5" />
            <span>{currentQuestion.startTime} - {currentQuestion.endTime}</span>
            <span className="text-slate-500">({segmentDuration} seconds segment)</span>
          </div>
          <h2 className="text-lg md:text-xl font-bold text-white tracking-tight leading-snug">
            {currentQuestion.title}
          </h2>
          {currentQuestion.tip && (
            <p className="mt-2 text-xs md:text-sm text-slate-400 bg-slate-800/60 border border-slate-700/50 rounded-lg p-2.5 font-mono text-emerald-300/90">
              💡 <span className="text-slate-300 font-sans font-medium">Quick Recall:</span> {currentQuestion.tip}
            </p>
          )}
        </div>

        {/* Action Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800/80">
          {/* Playback navigation */}
          <div className="flex items-center gap-2">
            <button
              onClick={onPreviousQuestion}
              disabled={!hasPrevious}
              title="Previous Question"
              className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors"
            >
              <SkipBack className="w-4 h-4" />
            </button>

            <button
              onClick={() => handleSeekRelative(-5)}
              title="Rewind 5s within segment"
              className="px-2.5 py-1.5 rounded-xl bg-slate-800 text-xs text-slate-300 hover:bg-slate-700 hover:text-white font-mono transition-colors"
            >
              -5s
            </button>

            <button
              onClick={handleReplaySegment}
              title="Replay this answer segment"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 text-xs font-semibold transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Replay</span>
            </button>

            <button
              onClick={() => handleSeekRelative(5)}
              title="Forward 5s within segment"
              className="px-2.5 py-1.5 rounded-xl bg-slate-800 text-xs text-slate-300 hover:bg-slate-700 hover:text-white font-mono transition-colors"
            >
              +5s
            </button>

            <button
              onClick={onNextQuestion}
              disabled={!hasNext}
              title="Next Question"
              className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors"
            >
              <SkipForward className="w-4 h-4" />
            </button>
          </div>

          {/* Speed & Mode toggles */}
          <div className="flex items-center gap-2">
            {/* Speed selector */}
            <div className="flex items-center bg-slate-800/80 p-0.5 rounded-lg border border-slate-700/60 text-xs">
              {[1, 1.25, 1.5, 2].map((rate) => (
                <button
                  key={rate}
                  onClick={() => handleRateChange(rate)}
                  className={`px-2 py-1 rounded font-mono font-medium transition-colors ${
                    playbackRate === rate
                      ? 'bg-emerald-500 text-white font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {rate}x
                </button>
              ))}
            </div>

            {/* Loop Segment Toggle */}
            <button
              onClick={() => setLoopMode(!loopMode)}
              title={loopMode ? 'Loop Segment ON' : 'Loop Segment OFF'}
              className={`p-2 rounded-xl border text-xs transition-colors ${
                loopMode
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
              }`}
            >
              <Repeat className="w-4 h-4" />
            </button>

            {/* Auto Advance Toggle */}
            <button
              onClick={() => setAutoAdvance(!autoAdvance)}
              title={autoAdvance ? 'Auto-play Next ON' : 'Auto-play Next OFF'}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-medium transition-colors ${
                autoAdvance
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
              }`}
            >
              <FastForward className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Auto-Next</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
