import React, { useState } from 'react';
import { usePlayer } from '../context/PlayerContext';
import { useArtwork } from '../services/artworkService';
import { Play, Pause, SkipBack, SkipForward, Maximize2, Volume2, VolumeX, Disc } from 'lucide-react';

interface MiniDeckWidgetProps {
  onRestore: () => void;
}

export const MiniDeckWidget: React.FC<MiniDeckWidgetProps> = ({ onRestore }) => {
  const {
    currentTrack,
    playbackStatus,
    togglePlayPause,
    playNext,
    playPrev,
    currentTime,
    duration,
    seek,
    isMuted,
    toggleMute,
    activeArchive,
  } = usePlayer();

  const isPlaying = playbackStatus === 'PLAYING';
  const { artworkUrl } = useArtwork(currentTrack);
  const progressPercent = duration > 0 ? Math.min(100, Math.max(0, (currentTime / duration) * 100)) : 0;

  const [isHoveringSeek, setIsHoveringSeek] = useState(false);

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (!duration || duration <= 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    seek(ratio * duration);
  };

  return (
    <div
      className="mini-deck-drag-region"
      style={{
        width: '100vw',
        height: '100vh',
        background: 'rgba(14, 16, 24, 0.88)',
        backdropFilter: 'blur(36px) saturate(200%)',
        WebkitBackdropFilter: 'blur(36px) saturate(200%)',
        color: '#f4f4f5',
        display: 'flex',
        flexDirection: 'column',
        userSelect: 'none',
        overflow: 'hidden',
        position: 'relative',
        border: '1px solid rgba(255, 255, 255, 0.16)',
        boxShadow:
          '0 24px 60px rgba(0, 0, 0, 0.85), inset 0 1px 0 rgba(255, 255, 255, 0.28), inset 0 0 20px rgba(255, 255, 255, 0.02)',
        fontFamily: 'var(--font-sans)',
        ['-webkit-app-region' as any]: 'drag',
        boxSizing: 'border-box',
      }}
    >
      {/* Top Acrylic Specular Highlight */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '1px',
          background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)',
          pointerEvents: 'none',
        }}
      />

      {/* Header Bar */}
      <div
        className="mini-deck-drag-region"
        style={{
          height: '28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 12px',
          background: 'rgba(255, 255, 255, 0.03)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
          ['-webkit-app-region' as any]: 'drag',
          cursor: 'grab',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div
            style={{
              width: '7px',
              height: '7px',
              borderRadius: '50%',
              background: isPlaying ? 'var(--accent-color, #eab308)' : '#71717a',
              boxShadow: isPlaying ? '0 0 10px var(--accent-color, #eab308)' : 'none',
              transition: 'all 0.3s ease',
            }}
          />
          <span
            style={{
              fontSize: '10px',
              fontWeight: 800,
              letterSpacing: '0.1em',
              color: 'rgba(255, 255, 255, 0.7)',
              fontFamily: 'var(--font-mono)',
            }}
          >
            SHONO.FM // ACRYLIC DECK
          </span>
        </div>

        <button
          type="button"
          onClick={onRestore}
          title="Restore Full App (ESC / Double Click)"
          className="mini-deck-no-drag"
          style={{
            ['-webkit-app-region' as any]: 'no-drag',
            background: 'rgba(255, 255, 255, 0.06)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: 'rgba(255, 255, 255, 0.8)',
            cursor: 'pointer',
            padding: '3px 6px',
            display: 'flex',
            alignItems: 'center',
            borderRadius: '6px',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#fff';
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.16)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)';
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
          }}
        >
          <Maximize2 size={12} />
        </button>
      </div>

      {/* Main Glass Deck Body */}
      <div
        style={{
          flex: 1,
          padding: '10px 14px',
          display: 'flex',
          gap: '14px',
          alignItems: 'center',
          minWidth: 0,
        }}
      >
        {/* Album Artwork Squircle with Soft Glow */}
        <div
          className="mini-deck-no-drag"
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '14px',
            overflow: 'hidden',
            border: '1px solid rgba(255, 255, 255, 0.18)',
            position: 'relative',
            flexShrink: 0,
            background: '#12141a',
            boxShadow: isPlaying
              ? '0 8px 24px rgba(0, 0, 0, 0.6), 0 0 16px rgba(234, 179, 8, 0.25)'
              : '0 6px 16px rgba(0, 0, 0, 0.5)',
            cursor: 'pointer',
            ['-webkit-app-region' as any]: 'no-drag',
            transition: 'box-shadow 0.4s ease',
          }}
          onClick={togglePlayPause}
          title={isPlaying ? 'Click to Pause' : 'Click to Play'}
        >
          {artworkUrl ? (
            <img
              src={artworkUrl}
              alt={currentTrack?.title || 'Cover'}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                transform: isPlaying ? 'scale(1.04)' : 'scale(1)',
                transition: 'transform 0.4s ease',
              }}
            />
          ) : (
            <div
              style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #1c1d24, #0f1014)',
              }}
            >
              <Disc size={28} color="var(--accent-color, #eab308)" />
            </div>
          )}

          {/* Frosted Play/Pause overlay indicator on hover */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.35)',
              opacity: isPlaying ? 0 : 0.85,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'opacity 0.2s ease',
            }}
          >
            {!isPlaying && <Play size={20} fill="#fff" color="#fff" />}
          </div>
        </div>

        {/* Track Metadata & Controls Capsule */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {/* Title & Artist */}
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontSize: '13px',
                fontWeight: 700,
                color: '#ffffff',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                letterSpacing: '-0.01em',
              }}
              title={currentTrack?.title || 'No Track'}
            >
              {currentTrack?.title || 'No Track Selected'}
            </div>
            <div
              style={{
                fontSize: '11px',
                color: 'rgba(255, 255, 255, 0.65)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {currentTrack?.artist || 'Ready to stream'}
              </span>
              {activeArchive?.title && (
                <span
                  style={{
                    fontSize: '9px',
                    fontFamily: 'var(--font-mono)',
                    padding: '1px 5px',
                    borderRadius: '4px',
                    background: 'rgba(255, 255, 255, 0.08)',
                    color: 'var(--accent-color, #eab308)',
                    flexShrink: 0,
                  }}
                >
                  {activeArchive.title.slice(0, 14)}
                </span>
              )}
            </div>
          </div>

          {/* Interactive Progress Bar */}
          <div
            className="mini-deck-no-drag"
            onClick={handleProgressBarClick}
            onMouseEnter={() => setIsHoveringSeek(true)}
            onMouseLeave={() => setIsHoveringSeek(false)}
            style={{
              position: 'relative',
              height: isHoveringSeek ? '6px' : '4px',
              background: 'rgba(255, 255, 255, 0.12)',
              borderRadius: '999px',
              cursor: 'pointer',
              transition: 'height 0.15s ease',
              ['-webkit-app-region' as any]: 'no-drag',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                height: '100%',
                width: `${progressPercent}%`,
                background: 'linear-gradient(90deg, var(--accent-color, #eab308), #fef08a)',
                borderRadius: '999px',
                boxShadow: isPlaying ? '0 0 10px var(--accent-color, #eab308)' : 'none',
              }}
            />
          </div>

          {/* Time & Transport Buttons Rail */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              minWidth: 0,
            }}
          >
            {/* Time Indicator */}
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '9.5px',
                color: 'rgba(255, 255, 255, 0.5)',
                letterSpacing: '0.04em',
              }}
            >
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>

            {/* Transport Capsule */}
            <div
              className="mini-deck-no-drag"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                ['-webkit-app-region' as any]: 'no-drag',
              }}
            >
              {/* Prev */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  playPrev();
                }}
                title="Previous Track"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'rgba(255, 255, 255, 0.75)',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  borderRadius: '6px',
                  transition: 'color 0.15s ease, transform 0.1s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#fff')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255, 255, 255, 0.75)')}
              >
                <SkipBack size={14} fill="currentColor" />
              </button>

              {/* Play / Pause Glow Pill */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  togglePlayPause();
                }}
                title={isPlaying ? 'Pause' : 'Play'}
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: 'var(--accent-color, #eab308)',
                  color: '#000',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 2px 10px rgba(234, 179, 8, 0.4)',
                  transition: 'transform 0.15s ease, box-shadow 0.2s ease',
                }}
                onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.92)')}
                onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
              >
                {isPlaying ? (
                  <Pause size={14} fill="#000" />
                ) : (
                  <Play size={14} fill="#000" style={{ marginLeft: '1px' }} />
                )}
              </button>

              {/* Next */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  playNext();
                }}
                title="Next Track"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'rgba(255, 255, 255, 0.75)',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  borderRadius: '6px',
                  transition: 'color 0.15s ease, transform 0.1s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#fff')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255, 255, 255, 0.75)')}
              >
                <SkipForward size={14} fill="currentColor" />
              </button>

              {/* Mute / Unmute */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleMute();
                }}
                title={isMuted ? 'Unmute' : 'Mute'}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: isMuted ? '#ef4444' : 'rgba(255, 255, 255, 0.6)',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  borderRadius: '6px',
                  transition: 'color 0.15s ease',
                }}
              >
                {isMuted ? <VolumeX size={13} /> : <Volume2 size={13} />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
