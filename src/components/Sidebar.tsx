import React, { useState, useEffect, useCallback, useRef } from 'react';
import { usePlayer } from '../context/PlayerContext';
import { Heart, Shuffle, Command, Disc, Radio } from 'lucide-react';
import { SidebarEqualizer } from './SidebarEqualizer';

const DEFAULT_SIDEBAR_WIDTH = 300;
const MIN_SIDEBAR_WIDTH = 240;
const MAX_SIDEBAR_WIDTH = 480;

export const Sidebar: React.FC = () => {
  const {
    archives,
    activeTab,
    setActiveTab,
    setIsShortcutsOpen,
    activeArchive,
    playEntireArchive,
    likedTrackIds,
    setGenreFilter,
    showFavouritesOnly,
    setShowFavouritesOnly,
    isSearchOpen,
    setIsSearchOpen,
    playerMode,
    setPlayerMode,
  } = usePlayer();

  // Custom adjustable sidebar width state (persisted in localStorage)
  const [sidebarWidth, setSidebarWidth] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('muszix_sidebar_width_v1');
      if (saved) {
        const val = parseInt(saved, 10);
        if (!isNaN(val)) return Math.max(MIN_SIDEBAR_WIDTH, Math.min(MAX_SIDEBAR_WIDTH, val));
      }
    } catch {
      // ignore
    }
    return DEFAULT_SIDEBAR_WIDTH;
  });

  const [isResizing, setIsResizing] = useState(false);
  const widthRef = useRef(sidebarWidth);
  widthRef.current = sidebarWidth;

  // Apply CSS custom property whenever width updates
  useEffect(() => {
    document.documentElement.style.setProperty('--sidebar-width', `${sidebarWidth}px`);
  }, [sidebarWidth]);

  // Drag handler for interactive sidebar resizing
  const handleResizeMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    const startX = e.clientX;
    const startW = widthRef.current;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const delta = moveEvent.clientX - startX;
      const newWidth = Math.max(MIN_SIDEBAR_WIDTH, Math.min(MAX_SIDEBAR_WIDTH, startW + delta));
      setSidebarWidth(newWidth);
      document.documentElement.style.setProperty('--sidebar-width', `${newWidth}px`);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      try {
        localStorage.setItem('muszix_sidebar_width_v1', widthRef.current.toString());
      } catch {
        // ignore
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  }, []);

  const handleResetWidth = () => {
    setSidebarWidth(DEFAULT_SIDEBAR_WIDTH);
    document.documentElement.style.setProperty('--sidebar-width', `${DEFAULT_SIDEBAR_WIDTH}px`);
    try {
      localStorage.setItem('muszix_sidebar_width_v1', DEFAULT_SIDEBAR_WIDTH.toString());
    } catch {
      // ignore
    }
  };

  const navItems = [
    { id: 'ARCHIVE', label: '01 / ARCHIVE', index: '01' },
    { id: 'SEARCH', label: '02 / SEARCH', index: '02' },
    { id: 'COLLECTIONS', label: '03 / COLLECTIONS', index: '03' },
    { id: 'SETTINGS', label: '04 / SETTINGS', index: '04' },
  ];

  const handleNavClick = (id: string) => {
    if (id === 'SEARCH') {
      setIsSearchOpen(true);
      return;
    }
    setActiveTab(id);
    if (id === 'SETTINGS') {
      setShowFavouritesOnly(false);
    } else if (id === 'COLLECTIONS') {
      setShowFavouritesOnly(false);
      setGenreFilter(null);
    } else if (id === 'ARCHIVE') {
      setShowFavouritesOnly(false);
      setGenreFilter(null);
    }
  };

  return (
    <aside
      className="col-sidebar"
      style={{
        minHeight: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
      }}
    >
      {/* Draggable Custom Resize Bar on Right Border */}
      <div
        className={`sidebar-resize-handle ${isResizing ? 'is-resizing' : ''}`}
        onMouseDown={handleResizeMouseDown}
        onDoubleClick={handleResetWidth}
        title="Drag horizontally to resize sidebar width (Double-click to reset)"
      />

      {/* Live Resizing Tooltip Badge */}
      {isResizing && (
        <div
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            background: 'var(--accent-color)',
            color: 'var(--text-inverse)',
            fontFamily: 'var(--font-mono)',
            fontSize: '9px',
            fontWeight: 700,
            padding: '3px 7px',
            borderRadius: '2px',
            zIndex: 100,
            boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
            pointerEvents: 'none',
          }}
        >
          {sidebarWidth} PX
        </div>
      )}

      {/* Brand & Logo Header */}
      <div
        style={{
          padding: '16px 18px',
          borderBottom: '1px solid var(--border-color)',
          flexShrink: 0,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
        }}
      >
        <div>
          <div
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '32px',
              lineHeight: 0.95,
              letterSpacing: '0.04em',
              color: 'var(--text-primary)',
            }}
          >
            SHONO<span style={{ color: 'var(--text-muted)' }}>.FM</span>
          </div>
        </div>

        {/* Live Broadcast Engine Tag */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-subtle)',
            padding: '3px 6px',
            fontFamily: 'var(--font-mono)',
            fontSize: '7.5px',
            color: 'var(--status-active)',
          }}
        >
          <Radio size={9} />
          <span>48kHz</span>
        </div>
      </div>

      {/* Main Navigation */}
      <nav style={{ padding: '6px 0', borderBottom: '1px solid var(--border-color)', flexShrink: 0 }}>
        {navItems.map((item) => {
          const isActive = (item.id === 'SEARCH' ? isSearchOpen : activeTab === item.id);
          const isAccentActive = item.id === 'SETTINGS' && isActive;

          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 18px',
                background: isAccentActive
                  ? 'var(--accent-subtle)'
                  : isActive
                  ? 'var(--bg-secondary)'
                  : 'transparent',
                border: isAccentActive ? '1px solid var(--accent-color)' : 'none',
                borderLeft: isAccentActive
                  ? '2px solid var(--accent-color)'
                  : isActive
                  ? '2px solid var(--text-primary)'
                  : '2px solid transparent',
                color: isAccentActive
                  ? 'var(--accent-color)'
                  : isActive
                  ? 'var(--text-primary)'
                  : 'var(--text-secondary)',
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                fontWeight: isActive ? 700 : 400,
                letterSpacing: '0.08em',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.12s ease',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.color = 'var(--text-primary)';
                  e.currentTarget.style.background = 'var(--bg-tertiary)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.color = 'var(--text-secondary)';
                  e.currentTarget.style.background = 'transparent';
                }
              }}
            >
              <span className="nav-label">{item.label}</span>
              <span
                style={{
                  fontSize: '9px',
                  color: isAccentActive ? 'var(--accent-color)' : isActive ? 'var(--text-primary)' : 'var(--text-muted)',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 700,
                }}
              >
                {item.id === 'COLLECTIONS'
                  ? `[${archives.length.toString().padStart(2, '0')}]`
                  : item.index}
              </span>
            </button>
          );
        })}

        {/* 007 / MI6 Player Mode Selector */}
        <div style={{ padding: '6px 16px 4px 16px', borderTop: '1px solid var(--border-subtle)', marginTop: '4px' }}>
          <button
            onClick={() => setPlayerMode(playerMode === 'MI6' ? 'ARCHIVE' : 'MI6')}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '7px 12px',
              background: playerMode === 'MI6' ? 'rgba(212,175,55,0.15)' : 'var(--bg-secondary)',
              border: playerMode === 'MI6' ? '1px solid var(--accent-color)' : '1px solid var(--border-color)',
              color: playerMode === 'MI6' ? 'var(--accent-color)' : 'var(--text-secondary)',
              fontFamily: 'var(--font-mono)',
              fontSize: '9.5px',
              fontWeight: 700,
              letterSpacing: '0.1em',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            title="Toggle 007 / MI6 Vinyl Turntable Mode"
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
              <Disc size={13} color={playerMode === 'MI6' ? 'var(--accent-color)' : 'currentColor'} />
              <span>{playerMode === 'MI6' ? 'MI6 MODE ENGAGED' : '007 / MI6 MODE'}</span>
            </span>
            <span style={{ fontSize: '8px', opacity: 0.9 }}>
              {playerMode === 'MI6' ? '●' : '○'}
            </span>
          </button>
        </div>
      </nav>

      {/* Main Interactive Middle Surface Area (Spacious & Nicely Spaced) */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '14px 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
        }}
      >
        {/* Quick Favourites Action */}
        <button
          onClick={() => {
            setActiveTab('ARCHIVE');
            setShowFavouritesOnly((prev) => !prev);
            setGenreFilter(null);
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            padding: '8px 12px',
            background: showFavouritesOnly ? 'var(--bg-secondary)' : 'var(--bg-tertiary)',
            border: showFavouritesOnly ? '1px solid var(--status-live)' : '1px solid var(--border-color)',
            color: showFavouritesOnly ? 'var(--status-live)' : 'var(--text-primary)',
            fontFamily: 'var(--font-mono)',
            fontSize: '10px',
            letterSpacing: '0.08em',
            cursor: 'pointer',
            textAlign: 'left',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => {
            if (!showFavouritesOnly) e.currentTarget.style.borderColor = 'var(--border-bright)';
          }}
          onMouseLeave={(e) => {
            if (!showFavouritesOnly) e.currentTarget.style.borderColor = 'var(--border-color)';
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
            <Heart size={12} fill={likedTrackIds.length > 0 ? 'var(--status-live)' : 'none'} color="var(--status-live)" />
            FAVOURITES ARCHIVE
          </span>
          <span style={{ color: 'var(--text-muted)', fontWeight: 700 }}>
            [{likedTrackIds.length.toString().padStart(2, '0')}]
          </span>
        </button>

        {/* Dual-Mode Brutalist Equalizer (Takes full advantage of width & surface area) */}
        <SidebarEqualizer />

        {/* Quick Action Commands */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            className="bma-btn"
            onClick={() => activeArchive && playEntireArchive(activeArchive, true)}
            style={{
              flex: 1,
              padding: '7px 10px',
              fontSize: '9px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
            title="Shuffle play active archive"
          >
            <Shuffle size={11} /> SHUFFLE ARCHIVE
          </button>
          <button
            className="bma-btn"
            onClick={() => setIsShortcutsOpen(true)}
            style={{ padding: '7px 12px', fontSize: '9px' }}
            title="Keyboard shortcuts (⌘ / ?)"
          >
            <Command size={11} />
          </button>
        </div>
      </div>
    </aside>
  );
};
