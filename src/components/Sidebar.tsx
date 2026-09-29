import React, { useState, useEffect, useCallback, useRef } from 'react';
import { usePlayer } from '../context/PlayerContext';
import { Heart, Shuffle, Command, Radio, Download, RefreshCw } from 'lucide-react';
import { SidebarEqualizer } from './SidebarEqualizer';
import { updateService, type UpdateState } from '../services/updateService';

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
    theme,
  } = usePlayer();

  const [updateState, setUpdateState] = useState<UpdateState>(() => updateService.getState());

  useEffect(() => {
    return updateService.subscribe(setUpdateState);
  }, []);

  const isAppleGlass = Boolean(theme && theme.startsWith('apple-glass'));

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

  const navItems = isAppleGlass
    ? [
        { id: 'ARCHIVE', label: 'Home', index: '' },
        { id: 'COLLECTIONS', label: 'Added / Playlists', index: '' },
        { id: 'SETTINGS', label: 'Settings', index: '' },
      ]
    : [
        { id: 'ARCHIVE', label: '01 / HOME', index: '01' },
        { id: 'COLLECTIONS', label: '02 / ADDED', index: '02' },
        { id: 'SETTINGS', label: '03 / SETTINGS', index: '03' },
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
      {/* Draggable Custom Resize Bar on Right Border (Hidden in Apple Glass) */}
      {!isAppleGlass && (
        <div
          className={`sidebar-resize-handle ${isResizing ? 'is-resizing' : ''}`}
          onMouseDown={handleResizeMouseDown}
          onDoubleClick={handleResetWidth}
          title="Drag horizontally to resize sidebar width (Double-click to reset)"
        />
      )}

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
      {isAppleGlass ? (
        <div
          className="titlebar-drag-region"
          style={{
            padding: '16px 18px 12px 18px',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <img
            src="./logo.png"
            alt="Shono FM"
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '9px',
              objectFit: 'contain',
              boxShadow: '0 4px 14px rgba(255, 149, 0, 0.3)',
            }}
          />
          <div>
            <div
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '20px',
                fontWeight: 700,
                letterSpacing: '-0.02em',
                lineHeight: 1.1,
                color: 'var(--text-primary)',
              }}
            >
              Shono
            </div>
            <div
              style={{
                fontSize: '11px',
                color: 'var(--text-muted)',
                fontWeight: 500,
              }}
            >
              Music Vault
            </div>
          </div>
        </div>
      ) : (
        <div
          className="titlebar-drag-region"
          style={{
            padding: '16px 18px',
            borderBottom: '1px solid var(--border-color)',
            flexShrink: 0,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img
              src="./logo.png"
              alt="Shono FM"
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                objectFit: 'contain',
                boxShadow: '0 0 14px rgba(255, 160, 0, 0.25)',
              }}
            />
            <div>
              <div
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '26px',
                  lineHeight: 0.95,
                  letterSpacing: '0.04em',
                  color: 'var(--text-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <span>SHONO<span style={{ color: 'var(--text-muted)' }}>.FM</span></span>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '8px',
                    fontWeight: 800,
                    color: 'var(--accent-color)',
                    background: 'var(--accent-subtle)',
                    padding: '2px 5px',
                    borderRadius: '2px',
                    border: '1px solid var(--accent-color)',
                    letterSpacing: '0.08em',
                  }}
                >
                  BETA
                </span>
              </div>
            </div>
          </div>

          {/* Live Broadcast Engine Tag */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
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
        </div>
      )}

      {/* Main Navigation */}
      <nav
        data-tutorial="archives"
        style={{
          padding: isAppleGlass ? '6px 8px' : '6px 0',
          borderBottom: isAppleGlass ? 'none' : '1px solid var(--border-color)',
          flexShrink: 0,
        }}
      >
        {navItems.map((item) => {
          const isActive = item.id === 'SEARCH' ? isSearchOpen : activeTab === item.id;
          const isAccentActive = item.id === 'SETTINGS' && isActive;

          if (isAppleGlass) {
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`sidebar-nav-btn ${isActive ? 'is-active' : ''}`}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '9px 16px',
                  borderRadius: '16px',
                  margin: '3px 0',
                  background: isActive ? 'var(--glass-bg-active)' : 'transparent',
                  border: 'none',
                  color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                  fontFamily: 'var(--font-sans)',
                  fontSize: '13px',
                  fontWeight: isActive ? 600 : 500,
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease',
                }}
              >
                <span className="nav-label">{item.label}</span>
                {item.id === 'COLLECTIONS' && archives.length > 0 && (
                  <span
                    style={{
                      fontSize: '10px',
                      color: 'var(--text-muted)',
                      background: 'rgba(255, 255, 255, 0.08)',
                      padding: '2px 7px',
                      borderRadius: '999px',
                      fontWeight: 600,
                    }}
                  >
                    {archives.length}
                  </span>
                )}
              </button>
            );
          }

          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 20px',
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
                fontSize: '11.5px',
                fontWeight: isActive ? 700 : 400,
                letterSpacing: '0.09em',
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
                  fontSize: '9.5px',
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
      </nav>

      {/* Main Interactive Middle Surface Area (Spacious & Nicely Spaced) */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px 18px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
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
            padding: isAppleGlass ? '11px 16px' : '10px 14px',
            borderRadius: isAppleGlass ? '14px' : '0',
            background: showFavouritesOnly
              ? isAppleGlass ? 'rgba(255, 45, 85, 0.15)' : 'var(--bg-secondary)'
              : isAppleGlass ? 'var(--glass-bg-secondary)' : 'var(--bg-tertiary)',
            border: showFavouritesOnly
              ? '1px solid var(--status-live)'
              : isAppleGlass ? '1px solid var(--glass-border)' : '1px solid var(--border-color)',
            color: showFavouritesOnly ? 'var(--status-live)' : 'var(--text-primary)',
            fontFamily: isAppleGlass ? 'var(--font-sans)' : 'var(--font-mono)',
            fontSize: isAppleGlass ? '12px' : '10.5px',
            fontWeight: isAppleGlass ? 500 : 500,
            letterSpacing: isAppleGlass ? 'normal' : '0.08em',
            cursor: 'pointer',
            textAlign: 'left',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => {
            if (!showFavouritesOnly) e.currentTarget.style.borderColor = isAppleGlass ? 'var(--glass-border-bright)' : 'var(--border-bright)';
          }}
          onMouseLeave={(e) => {
            if (!showFavouritesOnly) e.currentTarget.style.borderColor = isAppleGlass ? 'var(--glass-border)' : 'var(--border-color)';
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Heart size={14} fill={likedTrackIds.length > 0 ? 'var(--status-live)' : 'none'} color="var(--status-live)" />
            <span>{isAppleGlass ? 'Favorites' : 'FAVOURITES ARCHIVE'}</span>
          </span>
          <span
            style={{
              color: 'var(--text-muted)',
              fontWeight: 600,
              fontSize: isAppleGlass ? '11px' : '9px',
              background: isAppleGlass ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
              padding: isAppleGlass ? '2px 8px' : '0',
              borderRadius: isAppleGlass ? '999px' : '0',
            }}
          >
            {isAppleGlass ? likedTrackIds.length : `[${likedTrackIds.length.toString().padStart(2, '0')}]`}
          </span>
        </button>

        {/* Dual-Mode Brutalist Equalizer (Takes full advantage of width & surface area) */}
        <div data-tutorial="equalizer" id="tutorial-step-eq">
          <SidebarEqualizer />
        </div>

        {/* Quick Action Commands: Redesigned Tactile Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {/* Shuffle Button */}
          <button
            className="bma-btn"
            onClick={() => activeArchive && playEntireArchive(activeArchive, true)}
            style={{
              width: '100%',
              padding: isAppleGlass ? '10px 14px' : '9px 12px',
              fontSize: isAppleGlass ? '12px' : '10px',
              fontWeight: 700,
              borderRadius: isAppleGlass ? '12px' : '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              letterSpacing: '0.08em',
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              transition: 'all 0.16s ease',
            }}
            title="Shuffle play active archive"
          >
            <Shuffle size={13} color="var(--accent-color)" />
            <span>{isAppleGlass ? 'Shuffle All' : 'SHUFFLE ARCHIVE'}</span>
          </button>

          {/* Dedicated Wide Keyboard Shortcuts Button */}
          <button
            className="bma-btn"
            onClick={() => setIsShortcutsOpen(true)}
            style={{
              width: '100%',
              padding: isAppleGlass ? '9px 14px' : '8px 12px',
              fontSize: isAppleGlass ? '11px' : '9.5px',
              fontWeight: 600,
              borderRadius: isAppleGlass ? '12px' : '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              transition: 'all 0.16s ease',
            }}
            title="Open keyboard shortcuts cheat sheet"
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-bright)';
              e.currentTarget.style.color = 'var(--text-primary)';
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-subtle)';
              e.currentTarget.style.color = 'var(--text-secondary)';
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Command size={13} />
              <span>KEYBOARD SHORTCUTS</span>
            </span>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '9px',
                fontWeight: 700,
                background: 'rgba(255, 255, 255, 0.08)',
                padding: '2px 6px',
                borderRadius: '3px',
                color: 'var(--text-primary)',
              }}
            >
              ⌘ / ?
            </span>
          </button>
        </div>

        {/* Sidebar In-App Update Widget */}
        {updateState.hasUpdate && (
          <div
            style={{
              marginTop: '12px',
              padding: isAppleGlass ? '12px 14px' : '10px 12px',
              background: isAppleGlass ? 'rgba(255, 199, 44, 0.08)' : 'var(--bg-secondary)',
              border: '1px solid var(--accent-color)',
              borderRadius: isAppleGlass ? '12px' : '0',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent-color)', display: 'inline-block', boxShadow: '0 0 8px var(--accent-color)' }} />
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '9.5px',
                    fontWeight: 700,
                    color: 'var(--accent-color)',
                    letterSpacing: '0.08em',
                  }}
                >
                  UPDATE AVAILABLE
                </span>
              </div>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '9px',
                  color: 'var(--text-muted)',
                }}
              >
                v{updateState.latestVersion}
              </span>
            </div>

            {updateState.isDownloading && (
              <div style={{ width: '100%', background: 'var(--bg-tertiary)', height: '4px', overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${updateState.downloadPercent}%`,
                    height: '100%',
                    background: 'var(--accent-color)',
                    transition: 'width 0.2s ease',
                  }}
                />
              </div>
            )}

            <button
              onClick={() => updateService.downloadAndRestart()}
              className="bma-btn"
              style={{
                width: '100%',
                padding: '7px 10px',
                fontSize: '9.5px',
                fontWeight: 700,
                background: 'var(--accent-color)',
                color: 'var(--bg-primary)',
                borderColor: 'var(--accent-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                cursor: 'pointer',
              }}
            >
              {updateState.isReadyToRestart ? (
                <>
                  <RefreshCw size={11} />
                  <span>RESTART TO APPLY</span>
                </>
              ) : updateState.isDownloading ? (
                <span>DOWNLOADING ({updateState.downloadPercent}%)</span>
              ) : (
                <>
                  <Download size={11} />
                  <span>INSTALL UPDATE v{updateState.latestVersion}</span>
                </>
              )}
            </button>

            <button
              onClick={() => updateService.dismissUpdate()}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                fontSize: '9px',
                cursor: 'pointer',
                textAlign: 'center',
                padding: '2px',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
            >
              Dismiss for now
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};
