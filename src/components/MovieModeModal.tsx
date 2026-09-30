import React, { useEffect, useRef, useState } from 'react';
import { usePlayer } from '../context/PlayerContext';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  X,
  Film,
  Sparkles,
  Tv,
} from 'lucide-react';

interface MovieModeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MovieModeModal: React.FC<MovieModeModalProps> = ({ isOpen, onClose }) => {
  const {
    currentTrack,
    playbackStatus,
    togglePlayPause,
    playNext,
    playPrev,
    currentTime,
    duration,
    seek,
    volume,
    setVolume,
    isMuted,
    toggleMute,
  } = usePlayer();

  const isPlaying = playbackStatus === 'PLAYING';
  const togglePlay = togglePlayPause;
  const playPrevious = playPrev;

  const screenContainerRef = useRef<HTMLDivElement>(null);
  const [ambientGlow, setAmbientGlow] = useState<boolean>(true);
  const [isCinematicFullscreen, setIsCinematicFullscreen] = useState<boolean>(false);
  const [, setIsPlayerDocked] = useState<boolean>(false);

  // Format MM:SS
  const formatTime = (secs: number) => {
    if (!secs || isNaN(secs)) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Dock / Undock the global YouTube iframe cleanly
  useEffect(() => {
    if (!isOpen) {
      // Restore player offscreen
      const mount = document.getElementById('youtube-engine-mount');
      if (mount) {
        document.body.appendChild(mount);
        mount.style.position = 'fixed';
        mount.style.left = '-9999px';
        mount.style.top = '-9999px';
        mount.style.width = '240px';
        mount.style.height = '240px';
        mount.style.zIndex = '-9999';
        mount.style.pointerEvents = 'none';
        mount.style.borderRadius = '0';
      }
      setIsPlayerDocked(false);
      return;
    }

    // When modal opens, dock the existing YouTube iframe into the theater screen container
    const timer = setTimeout(() => {
      const mount = document.getElementById('youtube-engine-mount');
      const container = screenContainerRef.current;
      if (mount && container) {
        container.appendChild(mount);
        mount.style.position = 'absolute';
        mount.style.left = '0';
        mount.style.top = '0';
        mount.style.width = '100%';
        mount.style.height = '100%';
        mount.style.zIndex = '10';
        mount.style.pointerEvents = 'auto';
        mount.style.borderRadius = '8px';
        setIsPlayerDocked(true);
      }
    }, 100);

    return () => {
      clearTimeout(timer);
      const mount = document.getElementById('youtube-engine-mount');
      if (mount) {
        document.body.appendChild(mount);
        mount.style.position = 'fixed';
        mount.style.left = '-9999px';
        mount.style.top = '-9999px';
        mount.style.width = '240px';
        mount.style.height = '240px';
        mount.style.zIndex = '-9999';
        mount.style.pointerEvents = 'none';
        mount.style.borderRadius = '0';
      }
      setIsPlayerDocked(false);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const youtubeVideoId = currentTrack?.youtubeId;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99990,
        backgroundColor: '#040406',
        backgroundImage: ambientGlow && currentTrack?.thumbnail
          ? `radial-gradient(circle at 50% 45%, rgba(212, 175, 55, 0.12) 0%, rgba(14, 165, 233, 0.08) 40%, rgba(4, 4, 6, 0.98) 80%)`
          : 'radial-gradient(circle at 50% 50%, #0d0d12 0%, #040406 100%)',
        display: 'flex',
        flexDirection: 'column',
        userSelect: 'none',
        animation: 'movieFadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      <style>{`
        @keyframes movieFadeIn {
          from { opacity: 0; transform: scale(0.98); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>

      {/* Top Header Bar */}
      <div
        style={{
          height: '56px',
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          background: 'rgba(10, 10, 15, 0.8)',
          backdropFilter: 'blur(20px)',
          flexShrink: 0,
          zIndex: 20,
        }}
      >
        {/* Left: Secret Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px',
              borderRadius: '4px',
              background: 'rgba(212, 175, 55, 0.15)',
              border: '1px solid rgba(212, 175, 55, 0.35)',
              color: '#d4af37',
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.08em',
            }}
          >
            <Film size={13} />
            <span>MOVIE MODE // ARCHIVE THEATER</span>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '11px',
              fontFamily: 'var(--font-mono)',
              color: '#4ade80',
            }}
          >
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: '#4ade80',
                boxShadow: '0 0 8px #4ade80',
                animation: isPlaying ? 'pulse 2s infinite' : 'none',
              }}
            />
            <span>LIVE VIDEO SYNC</span>
          </div>
        </div>

        {/* Center: Current Track Metadata */}
        <div
          style={{
            textAlign: 'center',
            maxWidth: '450px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          <div
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '16px',
              fontWeight: 700,
              letterSpacing: '0.04em',
              color: '#ffffff',
            }}
          >
            {currentTrack?.title || 'No Track Selected'}
          </div>
          <div
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '11.5px',
              color: 'rgba(255, 255, 255, 0.55)',
            }}
          >
            {currentTrack?.artist || 'Unknown Artist'} &bull; {currentTrack?.album || 'Archive Session'}
          </div>
        </div>

        {/* Right Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            type="button"
            onClick={() => setAmbientGlow(!ambientGlow)}
            title="Toggle Ambient Cinema Backlight"
            style={{
              padding: '6px 12px',
              borderRadius: '4px',
              border: `1px solid ${ambientGlow ? 'rgba(212, 175, 55, 0.4)' : 'rgba(255, 255, 255, 0.1)'}`,
              background: ambientGlow ? 'rgba(212, 175, 55, 0.15)' : 'transparent',
              color: ambientGlow ? '#d4af37' : 'rgba(255, 255, 255, 0.6)',
              fontSize: '11px',
              fontFamily: 'var(--font-mono)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
            }}
          >
            <Sparkles size={12} />
            <span>AMBIENT GLOW</span>
          </button>

          <button
            type="button"
            onClick={() => setIsCinematicFullscreen(!isCinematicFullscreen)}
            title={isCinematicFullscreen ? 'Exit Cinema Frame' : 'Cinema Theater Scale'}
            style={{
              padding: '6px 10px',
              borderRadius: '4px',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              background: 'transparent',
              color: 'rgba(255, 255, 255, 0.8)',
              cursor: 'pointer',
            }}
          >
            {isCinematicFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>

          <button
            type="button"
            onClick={onClose}
            title="Exit Movie Mode (ESC)"
            style={{
              padding: '6px 12px',
              borderRadius: '4px',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              background: 'rgba(239, 68, 68, 0.15)',
              color: '#ef4444',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '11px',
              fontFamily: 'var(--font-mono)',
              fontWeight: 700,
            }}
          >
            <X size={14} />
            <span>EXIT (ESC)</span>
          </button>
        </div>
      </div>

      {/* Main Theater Viewing Area */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: isCinematicFullscreen ? '0' : '28px 48px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Dynamic Ambilight Glow behind screen */}
        {ambientGlow && (
          <div
            style={{
              position: 'absolute',
              width: '85%',
              height: '75%',
              background: 'radial-gradient(circle, rgba(212, 175, 55, 0.22) 0%, rgba(56, 189, 248, 0.12) 40%, transparent 75%)',
              filter: 'blur(70px)',
              pointerEvents: 'none',
              transform: 'scale(1.15)',
              opacity: 0.7,
              zIndex: 1,
            }}
          />
        )}

        {/* 16:9 Cinema Projection Frame */}
        <div
          ref={screenContainerRef}
          style={{
            width: isCinematicFullscreen ? '100%' : 'min(1280px, 92vw)',
            height: isCinematicFullscreen ? '100%' : 'min(720px, calc(92vw * 9 / 16))',
            aspectRatio: isCinematicFullscreen ? 'unset' : '16 / 9',
            backgroundColor: '#000000',
            borderRadius: isCinematicFullscreen ? '0' : '12px',
            overflow: 'hidden',
            position: 'relative',
            boxShadow: isCinematicFullscreen
              ? 'none'
              : '0 20px 60px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.12)',
            zIndex: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* Fallback if no video ID exists */}
          {!youtubeVideoId && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'rgba(255, 255, 255, 0.5)',
                gap: '12px',
                textAlign: 'center',
                padding: '24px',
              }}
            >
              <Tv size={48} color="#d4af37" style={{ opacity: 0.6 }} />
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '20px', color: '#fff' }}>
                STANDBY // DIRECT AUDIO FEED ONLY
              </div>
              <div style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', maxWidth: '400px' }}>
                The current track is streaming from a local or direct source without an active video track. Select a YouTube archive track to activate full motion picture playback.
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Cinematic Transport Controls Footer */}
      <div
        style={{
          padding: '14px 32px 18px 32px',
          background: 'rgba(10, 10, 15, 0.85)',
          backdropFilter: 'blur(20px)',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          flexShrink: 0,
          zIndex: 20,
        }}
      >
        {/* Scrubber Bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'rgba(255, 255, 255, 0.6)', minWidth: '40px' }}>
            {formatTime(currentTime)}
          </span>

          <div
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const clickPos = (e.clientX - rect.left) / rect.width;
              if (duration > 0) seek(clickPos * duration);
            }}
            style={{
              flex: 1,
              height: '6px',
              background: 'rgba(255, 255, 255, 0.12)',
              borderRadius: '3px',
              cursor: 'pointer',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${progressPercent}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #d4af37 0%, #f59e0b 100%)',
                borderRadius: '3px',
                transition: 'width 0.1s linear',
              }}
            />
          </div>

          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'rgba(255, 255, 255, 0.6)', minWidth: '40px', textAlign: 'right' }}>
            {formatTime(duration)}
          </span>
        </div>

        {/* Transport Buttons & Volume */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                fontSize: '10px',
                fontFamily: 'var(--font-mono)',
                color: 'rgba(255, 255, 255, 0.4)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                padding: '2px 6px',
                borderRadius: '3px',
              }}
            >
              1080P // ARCHIVE THEATER
            </span>
          </div>

          {/* Core Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button
              type="button"
              onClick={playPrevious}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'rgba(255, 255, 255, 0.8)',
                cursor: 'pointer',
                padding: '6px',
              }}
            >
              <SkipBack size={18} />
            </button>

            <button
              type="button"
              onClick={togglePlay}
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                background: '#d4af37',
                color: '#000000',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 16px rgba(212, 175, 55, 0.4)',
                transition: 'transform 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.06)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            >
              {isPlaying ? <Pause size={18} fill="#000" /> : <Play size={18} fill="#000" style={{ marginLeft: '2px' }} />}
            </button>

            <button
              type="button"
              onClick={playNext}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'rgba(255, 255, 255, 0.8)',
                cursor: 'pointer',
                padding: '6px',
              }}
            >
              <SkipForward size={18} />
            </button>
          </div>

          {/* Volume Slider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              type="button"
              onClick={toggleMute}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'rgba(255, 255, 255, 0.7)',
                cursor: 'pointer',
              }}
            >
              {isMuted || volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>
            <input
              type="range"
              min="0"
              max="100"
              value={isMuted ? 0 : volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              style={{
                width: '80px',
                accentColor: '#d4af37',
                cursor: 'pointer',
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
