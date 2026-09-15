import React, { useState, useRef, useEffect } from 'react';
import type { Track } from '../types';
import { usePlayer } from '../context/PlayerContext';
import { MoreHorizontal, Play, Plus, ListPlus, Heart, Info, Copy } from 'lucide-react';

interface TrackRowProps {
  track: Track;
  index: number;
}

export const TrackRow: React.FC<TrackRowProps> = ({ track, index }) => {
  const {
    currentTrack,
    playbackStatus,
    playTrack,
    addToQueue,
    playNextInQueue,
    toggleLike,
    likedTrackIds,
    openTrackDetail,
    theme,
  } = usePlayer();

  const isAppleGlass = Boolean(theme && theme.startsWith('apple-glass'));

  const [menuOpen, setMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const isCurrent = currentTrack?.id === track.id;
  const isPlaying = isCurrent && playbackStatus === 'PLAYING';
  const isLiked = likedTrackIds.includes(track.id);

  const formattedIndex = (index + 1).toString().padStart(3, '0');

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  const handleCopyLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    const link = track.youtubeId
      ? `https://www.youtube.com/watch?v=s${track.youtubeId}`
      : window.location.href;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
      setMenuOpen(false);
    }, 1200);
  };

  return (
    <tr
      className={`track-row ${isCurrent ? 'active-row' : ''}`}
      onClick={() => playTrack(track)}
    >
      {/* Index Number */}
      <td
        style={{
          width: '46px',
          color: isCurrent ? 'var(--text-primary)' : 'var(--text-muted)',
          fontSize: isAppleGlass ? '12px' : '10px',
          fontFamily: isAppleGlass ? 'var(--font-sans)' : 'var(--font-mono)',
        }}
      >
        {isAppleGlass ? (
          isCurrent ? (
            <span style={{ fontWeight: 700, color: 'var(--accent-color)' }}>{index + 1}</span>
          ) : (
            <span>{index + 1}</span>
          )
        ) : isCurrent ? (
          <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>| {formattedIndex}</span>
        ) : (
          formattedIndex
        )}
      </td>

      {/* Thumbnail */}
      <td style={{ width: isAppleGlass ? '52px' : '48px', padding: '6px 8px' }}>
        <div
          style={{
            width: isAppleGlass ? '36px' : '32px',
            height: isAppleGlass ? '36px' : '32px',
            borderRadius: isAppleGlass ? '8px' : '0',
            background: 'var(--bg-secondary)',
            border: isAppleGlass ? 'none' : '1px solid var(--border-color)',
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          <img
            src={track.thumbnail}
            alt={track.title}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              filter: isAppleGlass ? 'none' : 'grayscale(100%) contrast(115%)',
              borderRadius: isAppleGlass ? '8px' : '0',
            }}
          />
        </div>
      </td>

      {/* Title + Equalizer Indicator */}
      <td style={{ fontWeight: isCurrent ? 600 : 400, color: 'var(--text-primary)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {isPlaying ? (
            <div className="eq-bars">
              <span className="eq-bar" />
              <span className="eq-bar" />
              <span className="eq-bar" />
              <span className="eq-bar" />
            </div>
          ) : isCurrent ? (
            <Play size={10} fill="currentColor" />
          ) : null}
          <span>{track.title}</span>
        </div>
      </td>

      {/* Artist */}
      <td style={{ color: 'var(--text-secondary)' }}>{track.artist}</td>

      {/* Album */}
      <td className="hide-mobile" style={{ color: 'var(--text-muted)' }}>
        {track.album}
      </td>

      {/* Year */}
      <td className="hide-mobile" style={{ color: 'var(--text-muted)', width: '60px' }}>
        {track.year}
      </td>

      {/* Time */}
      <td style={{ width: '60px', color: 'var(--text-secondary)' }}>
        {track.durationFormatted}
      </td>

      {/* Overflow Menu */}
      <td
        style={{ width: '40px', textAlign: 'right', position: 'relative' }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="bma-btn-icon"
          onClick={() => setMenuOpen(!menuOpen)}
          title="Track actions"
          style={{ padding: '4px' }}
        >
          <MoreHorizontal size={14} />
        </button>

        {menuOpen && (
          <div
            ref={menuRef}
            style={{
              position: 'absolute',
              right: '10px',
              top: '24px',
              background: 'var(--bg-primary)',
              border: '1px solid var(--border-bright)',
              zIndex: 50,
              minWidth: '150px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.8)',
              padding: '4px 0',
            }}
          >
            <button
              onClick={() => {
                playNextInQueue(track);
                setMenuOpen(false);
              }}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 12px',
                background: 'transparent',
                border: 'none',
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-mono)',
                fontSize: '10px',
                cursor: 'pointer',
                textAlign: 'left',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-secondary)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              <Plus size={12} /> PLAY NEXT
            </button>

            <button
              onClick={() => {
                addToQueue(track);
                setMenuOpen(false);
              }}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 12px',
                background: 'transparent',
                border: 'none',
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-mono)',
                fontSize: '10px',
                cursor: 'pointer',
                textAlign: 'left',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-secondary)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              <ListPlus size={12} /> ADD TO QUEUE
            </button>

            <button
              onClick={() => {
                toggleLike(track.id);
                setMenuOpen(false);
              }}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 12px',
                background: 'transparent',
                border: 'none',
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-mono)',
                fontSize: '10px',
                cursor: 'pointer',
                textAlign: 'left',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-secondary)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              <Heart
                size={12}
                fill={isLiked ? 'var(--status-live)' : 'none'}
                color={isLiked ? 'var(--status-live)' : 'currentColor'}
              />
              {isLiked ? 'UNFAVOURITE' : 'FAVOURITE'}
            </button>

            <button
              onClick={() => {
                openTrackDetail(track);
                setMenuOpen(false);
              }}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 12px',
                background: 'transparent',
                border: 'none',
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-mono)',
                fontSize: '10px',
                cursor: 'pointer',
                textAlign: 'left',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-secondary)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              <Info size={12} /> TRACK DETAILS
            </button>

            <button
              onClick={handleCopyLink}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 12px',
                background: 'transparent',
                border: 'none',
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-mono)',
                fontSize: '10px',
                cursor: 'pointer',
                textAlign: 'left',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-secondary)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              <Copy size={12} /> {copied ? 'LINK COPIED' : 'COPY SOURCE LINK'}
            </button>
          </div>
        )}
      </td>
    </tr>
  );
};
