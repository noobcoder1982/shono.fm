import React, { useRef } from 'react';
import { usePlayer } from '../context/PlayerContext';
import { Search as SearchIcon, X } from 'lucide-react';

export const SearchModule: React.FC = () => {
  const { searchQuery, setSearchQuery, setIsSearchOpen } = usePlayer();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleOpenSearch = () => {
    setIsSearchOpen(true);
  };

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
        onClick={handleOpenSearch}
        role="button"
        tabIndex={0}
        title="Open Floating Apple Glass Spotlight (⌘K or /)"
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          width: '100%',
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: '4px',
          cursor: 'pointer',
          transition: 'all 0.15s ease',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--border-bright)')}
        onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border-color)')}
      >
        <div style={{ padding: '0 10px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
          <SearchIcon size={13} />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onFocus={handleOpenSearch}
          onClick={handleOpenSearch}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search tracks, artists, albums (⌘K)..."
          readOnly
          style={{
            flex: 1,
            height: '30px',
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-mono)',
            fontSize: '10px',
            letterSpacing: '0.04em',
            cursor: 'pointer',
          }}
        />
        {searchQuery ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSearchQuery('');
            }}
            className="bma-btn-icon"
            style={{ padding: '0 10px', color: 'var(--text-secondary)' }}
            title="Clear search"
          >
            <X size={14} />
          </button>
        ) : (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '0 8px',
              fontFamily: 'var(--font-mono)',
              fontSize: '8.5px',
              color: 'var(--text-muted)',
              marginRight: '6px',
            }}
          >
            <span
              style={{
                border: '1px solid var(--border-subtle)',
                padding: '1px 5px',
                borderRadius: '3px',
                background: 'var(--bg-tertiary)',
              }}
            >
              ⌘K
            </span>
            <span
              style={{
                border: '1px solid var(--border-subtle)',
                padding: '1px 5px',
                borderRadius: '3px',
                background: 'var(--bg-tertiary)',
              }}
            >
              /
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
