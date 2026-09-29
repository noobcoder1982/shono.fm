import React from 'react';
import { usePlayer } from '../context/PlayerContext';
import { Play, Shuffle, Disc } from 'lucide-react';

export const ArchiveHeader: React.FC = () => {
  const { activeArchive, playEntireArchive, theme, setIsMixtapeModalOpen } = usePlayer();

  if (!activeArchive) return null;

  const isAppleGlass = Boolean(theme && theme.startsWith('apple-glass'));

  return (
    <div
      style={{
        padding: isAppleGlass ? '18px 28px 12px 28px' : '16px 26px 14px 26px',
        borderBottom: isAppleGlass ? 'none' : '1px solid var(--border-color)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        background: isAppleGlass ? 'transparent' : 'var(--bg-primary)',
        flexWrap: 'wrap',
        gap: '16px',
        flexShrink: 0,
      }}
    >
      {/* Title & Index */}
      <div>
        {!isAppleGlass ? (
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '10px',
              letterSpacing: '0.12em',
              color: 'var(--text-muted)',
              marginBottom: '4px',
            }}
          >
            ARCHIVE / {activeArchive.indexNumber}
          </div>
        ) : (
          <div
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '12px',
              color: 'var(--text-muted)',
              marginBottom: '4px',
              fontWeight: 500,
            }}
          >
            Playlist • {activeArchive.tracks.length} tracks
          </div>
        )}
        <h2
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: isAppleGlass ? '28px' : '34px',
            lineHeight: 1.05,
            letterSpacing: isAppleGlass ? '-0.02em' : '0.04em',
            fontWeight: isAppleGlass ? 700 : 400,
            color: 'var(--text-primary)',
            margin: '0 0 10px 0',
          }}
        >
          {activeArchive.title}
        </h2>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: isAppleGlass ? '12px' : '10px',
          }}
        >
          <button
            onClick={() => playEntireArchive(activeArchive, false)}
            className="bma-btn"
            style={{
              padding: isAppleGlass ? '8px 20px' : '6px 16px',
              fontSize: isAppleGlass ? '12px' : '10px',
              borderRadius: isAppleGlass ? '999px' : '0',
              background: isAppleGlass ? 'var(--accent-color)' : undefined,
              color: isAppleGlass ? '#ffffff' : undefined,
              border: isAppleGlass ? 'none' : undefined,
              fontWeight: 600,
              letterSpacing: '0.08em',
              display: 'inline-flex',
              alignItems: 'center',
            }}
            title="Play all tracks in sequence"
          >
            <Play size={isAppleGlass ? 13 : 10} style={{ marginRight: '6px' }} /> PLAY ALL
          </button>
          <button
            onClick={() => playEntireArchive(activeArchive, true)}
            className="bma-btn"
            style={{
              padding: isAppleGlass ? '8px 20px' : '6px 16px',
              fontSize: isAppleGlass ? '12px' : '10px',
              borderRadius: isAppleGlass ? '999px' : '0',
              fontWeight: 600,
              letterSpacing: '0.08em',
              display: 'inline-flex',
              alignItems: 'center',
            }}
            title="Shuffle play all tracks"
          >
            <Shuffle size={isAppleGlass ? 13 : 10} style={{ marginRight: '6px' }} /> SHUFFLE
          </button>
          <button
            onClick={() => setIsMixtapeModalOpen(true)}
            className="bma-btn"
            style={{
              padding: isAppleGlass ? '8px 20px' : '6px 16px',
              fontSize: isAppleGlass ? '12px' : '10px',
              borderRadius: isAppleGlass ? '999px' : '0',
              fontWeight: 600,
              letterSpacing: '0.08em',
              display: 'inline-flex',
              alignItems: 'center',
            }}
            title="Create Virtual Cassette Mixtape (A-Side & B-Side)"
          >
            <Disc size={isAppleGlass ? 13 : 10} style={{ marginRight: '6px' }} /> MIXTAPE
          </button>
        </div>
      </div>

      {/* Right Column: Audio Repository Metrics & Artwork Monolith */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
        }}
      >
        {/* Repository Hardware Tags */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            gap: '4px',
            fontFamily: 'var(--font-mono)',
            fontSize: '9px',
          }}
        >
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <span
              style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                padding: '2px 7px',
                color: 'var(--accent-color)',
                fontWeight: 700,
                letterSpacing: '0.08em',
              }}
            >
              {activeArchive.tracks.length} TRACKS
            </span>

            <span
              style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                padding: '2px 7px',
                color: 'var(--text-secondary)',
                letterSpacing: '0.06em',
              }}
            >
              {activeArchive.totalDurationFormatted || '00:00:00'}
            </span>
          </div>

          <div
            style={{
              color: 'var(--text-muted)',
              fontSize: '8px',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              maxWidth: '220px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            CURATOR: {activeArchive.curator || 'USER CURATED'}
          </div>
        </div>

        {/* Thumbnail Preview Monolith */}
        {activeArchive.coverImage && (
          <div
            style={{
              width: '44px',
              height: '44px',
              border: '1px solid var(--border-color)',
              background: 'var(--bg-secondary)',
              overflow: 'hidden',
              flexShrink: 0,
              boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
            }}
          >
            <img
              src={activeArchive.coverImage}
              alt={activeArchive.title}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                filter: 'contrast(1.05)',
              }}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};
