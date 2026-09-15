import React from 'react';
import { usePlayer } from '../context/PlayerContext';
import { Play, Shuffle } from 'lucide-react';

export const ArchiveHeader: React.FC = () => {
  const { activeArchive, playEntireArchive, theme } = usePlayer();

  if (!activeArchive) return null;

  const isAppleGlass = Boolean(theme && theme.startsWith('apple-glass'));

  return (
    <div
      style={{
        padding: isAppleGlass ? '12px 22px 8px 22px' : '10px 20px',
        borderBottom: isAppleGlass ? 'none' : '1px solid var(--border-color)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        background: isAppleGlass ? 'transparent' : 'var(--bg-primary)',
        flexWrap: 'wrap',
        gap: '12px',
        flexShrink: 0,
      }}
    >
      {/* Title & Index */}
      <div>
        {!isAppleGlass ? (
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '9.5px',
              letterSpacing: '0.1em',
              color: 'var(--text-muted)',
              marginBottom: '2px',
            }}
          >
            ARCHIVE / {activeArchive.indexNumber}
          </div>
        ) : (
          <div
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '11px',
              color: 'var(--text-muted)',
              marginBottom: '3px',
              fontWeight: 500,
            }}
          >
            Playlist • {activeArchive.tracks.length} tracks
          </div>
        )}
        <h2
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: isAppleGlass ? '24px' : '28px',
            lineHeight: 1.1,
            letterSpacing: isAppleGlass ? '-0.02em' : '0.04em',
            fontWeight: isAppleGlass ? 700 : 400,
            color: 'var(--text-primary)',
            margin: '0 0 6px 0',
          }}
        >
          {activeArchive.title}
        </h2>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: isAppleGlass ? '10px' : '8px',
          }}
        >
          <button
            onClick={() => playEntireArchive(activeArchive, false)}
            className="bma-btn"
            style={{
              padding: isAppleGlass ? '6px 16px' : '3px 8px',
              fontSize: isAppleGlass ? '12px' : '9px',
              borderRadius: isAppleGlass ? '999px' : '0',
              background: isAppleGlass ? 'var(--accent-color)' : undefined,
              color: isAppleGlass ? '#ffffff' : undefined,
              border: isAppleGlass ? 'none' : undefined,
              fontWeight: isAppleGlass ? 600 : 500,
            }}
            title="Play all tracks in sequence"
          >
            <Play size={isAppleGlass ? 13 : 9} style={{ marginRight: '6px' }} /> Play All
          </button>
          <button
            onClick={() => playEntireArchive(activeArchive, true)}
            className="bma-btn"
            style={{
              padding: isAppleGlass ? '6px 16px' : '3px 8px',
              fontSize: isAppleGlass ? '12px' : '9px',
              borderRadius: isAppleGlass ? '999px' : '0',
              fontWeight: isAppleGlass ? 600 : 500,
            }}
            title="Shuffle play all tracks"
          >
            <Shuffle size={isAppleGlass ? 13 : 9} style={{ marginRight: '6px' }} /> Shuffle
          </button>
        </div>
      </div>
    </div>
  );
};
