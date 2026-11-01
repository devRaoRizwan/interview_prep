import React, { useEffect, useRef, useState } from 'react';
import { 
  RotateCcw, 
  ExternalLink, 
  Repeat, 
  Clock 
} from 'lucide-react';
import { VIDEO_ID, VIDEO_BASE_URL } from '../data/questions';

export default function YouTubePlayer({
  currentQuestion,
  videoId = VIDEO_ID,
  videoBaseUrl = VIDEO_BASE_URL,
  onSegmentEnd,
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

  // Initialize YT player instance
  useEffect(() => {
    if (!apiReady || playerRef.current || useIframeFallback) return;

    try {
      playerRef.current = new window.YT.Player('yt-single-player', {
        videoId: videoId,
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
                videoId: videoId,
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
              handleEnded();
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

  // Handle question switch: reload at exact start second
  useEffect(() => {
    setCurrentTime(currentQuestion.startSeconds);

    if (playerRef.current && playerRef.current.loadVideoById) {
      try {
        playerRef.current.loadVideoById({
          videoId: videoId,
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

  // Strictly enforce stopping at question.endSeconds
  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = setInterval(() => {
      if (!playerRef.current || !playerRef.current.getCurrentTime) return;
      try {
        const time = playerRef.current.getCurrentTime();
        setCurrentTime(time);

        if (time >= currentQuestion.endSeconds) {
          handleEnded();
        }
      } catch (e) {
        // ignore polling errors
      }
    }, 250);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [currentQuestion, loopMode]);

  const handleEnded = () => {
    if (loopMode) {
      if (playerRef.current && playerRef.current.seekTo) {
        playerRef.current.seekTo(currentQuestion.startSeconds, true);
        playerRef.current.playVideo();
      }
    } else {
      if (playerRef.current && playerRef.current.pauseVideo) {
        playerRef.current.pauseVideo();
        playerRef.current.seekTo(currentQuestion.startSeconds, true);
      }
      if (onSegmentEnd) {
        onSegmentEnd();
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
    <div className="w-full rounded-xl overflow-hidden border border-zinc-200/90 bg-[#161a22] shadow-xs">
      {/* 16:9 Video Container */}
      <div className="relative w-full aspect-video bg-[#161a22]">
        {!useIframeFallback ? (
          <div className="absolute inset-0 w-full h-full">
            <div id="yt-single-player" className="w-full h-full" />
          </div>
        ) : (
          <iframe
            key={iframeFallbackKey}
            src={`https://www.youtube.com/embed/${videoId}?start=${currentQuestion.startSeconds}&end=${currentQuestion.endSeconds}&autoplay=1&rel=0&modestbranding=1`}
            title={currentQuestion.title}
            className="absolute inset-0 w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        )}
      </div>

      {/* Segment Timeline Progress Bar */}
      <div className="w-full h-1 bg-[#e7e7ec] overflow-hidden">
        <div 
          className="h-full comback-progress-fill transition-all duration-150"
          style={{ width: `${segmentPercent}%` }}
        />
      </div>

      {/* Player Utility Bar */}
      <div className="px-3 sm:px-4 py-2.5 bg-paper-muted border-t border-line flex flex-wrap items-center justify-between gap-2.5 text-xs">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={handleReplaySegment}
            title="Replay this answer segment"
            className="comback-button h-8 px-2.5 sm:px-3 text-xs flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="font-bold">Replay</span>
          </button>

          <button
            type="button"
            onClick={() => handleSeekRelative(-5)}
            title="Rewind 5 seconds"
            className="comback-button h-8 px-2 font-mono text-xs"
          >
            -5s
          </button>

          <button
            type="button"
            onClick={() => handleSeekRelative(5)}
            title="Forward 5 seconds"
            className="comback-button h-8 px-2 font-mono text-xs"
          >
            +5s
          </button>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Speed Presets */}
          <div className="flex items-center border border-line-strong rounded-lg p-0.5 bg-white shadow-subtle">
            {[1, 1.25, 1.5, 2].map((rate) => (
              <button
                key={rate}
                type="button"
                onClick={() => handleRateChange(rate)}
                className={`px-1.5 sm:px-2 py-0.5 rounded font-mono font-bold text-[11px] transition-colors ${
                  playbackRate === rate
                    ? 'bg-ink text-white shadow-sm'
                    : 'text-muted hover:text-ink'
                }`}
              >
                {rate}x
              </button>
            ))}
          </div>

          {/* Loop Mode Toggle */}
          <button
            type="button"
            onClick={() => setLoopMode(!loopMode)}
            title={loopMode ? 'Looping answer ON' : 'Looping answer OFF'}
            className={`h-8 px-2.5 rounded-lg border text-xs font-bold transition-all flex items-center gap-1 ${
              loopMode
                ? 'border-ink bg-ink text-white shadow-subtle'
                : 'comback-button text-muted hover:text-ink'
            }`}
          >
            <Repeat className="w-3 h-3" />
            <span className="hidden sm:inline">Loop</span>
          </button>

          {/* External Link */}
          <a
            href={`${videoBaseUrl}&t=${currentQuestion.startSeconds}s`}
            target="_blank"
            rel="noopener noreferrer"
            title="Open on YouTube at this exact timestamp"
            className="comback-button h-8 w-8 flex items-center justify-center p-0 text-muted hover:text-ink"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}
