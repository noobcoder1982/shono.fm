import React from 'react';
import { usePlayer } from '../context/PlayerContext';
import { Play, Shuffle } from 'lucide-react';

export const ArchiveHeader: React.FC = () => {
  const { activeArchive, playEntireArchive } = usePlayer();

  if (!activeArchive) return null;

  return (
    <div
      style={{
        padding: '10px 20px',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        background: 'var(--bg-primary)',
        flexWrap: 'wrap',
        gap: '12px',
        flexShrink: 0,
      }}
    >
      {/* Title & Index */}
      <div>
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
        <h2
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '28px',
            lineHeight: 1,
            letterSpacing: '0.04em',
            color: 'var(--text-primary)',
            margin: '0 0 4px 0',
          }}
        >
          {activeArchive.title}
        </h2>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <button
            onClick={() => playEntireArchive(activeArchive, false)}
            className="bma-btn"
            style={{ padding: '3px 8px', fontSize: '9px' }}
            title="Play all tracks in sequence"
          >
            <Play size={9} style={{ marginRight: '4px' }} /> PLAY ALL
          </button>
          <button
            onClick={() => playEntireArchive(activeArchive, true)}
            className="bma-btn"
            style={{ padding: '3px 8px', fontSize: '9px' }}
            title="Shuffle play all tracks"
          >
            <Shuffle size={9} style={{ marginRight: '4px' }} /> SHUFFLE
          </button>
        </div>
      </div>
    </div>
  );
};
