import React, { useRef } from 'react';
import { usePlayer } from '../context/PlayerContext';
import { Search as SearchIcon, X } from 'lucide-react';

export const SearchModule: React.FC = () => {
  const { searchQuery, setSearchQuery } = usePlayer();
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div
      style={{
        padding: '8px 16px',
        borderTop: '1px solid var(--border-color)',
        borderRight: '1px solid var(--border-color)',
        background: 'var(--bg-primary)',
        display: 'flex',
        alignItems: 'center',
        flexShrink: 0,
      }}
    >
      <div
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          width: '100%',
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
        }}
      >
        <div style={{ padding: '0 10px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
          <SearchIcon size={13} />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search tracks, artists, albums..."
          style={{
            flex: 1,
            height: '30px',
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-mono)',
            fontSize: '10.5px',
            letterSpacing: '0.04em',
          }}
        />
        {searchQuery ? (
          <button
            onClick={() => setSearchQuery('')}
            className="bma-btn-icon"
            style={{ padding: '0 10px', color: 'var(--text-secondary)' }}
            title="Clear search"
          >
            <X size={14} />
          </button>
        ) : (
          <div
            style={{
              padding: '0 10px',
              fontFamily: 'var(--font-mono)',
              fontSize: '9px',
              color: 'var(--text-muted)',
              border: '1px solid var(--border-subtle)',
              marginRight: '6px',
            }}
          >
            /
          </div>
        )}
      </div>
    </div>
  );
};
