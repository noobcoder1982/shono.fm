import React, { useState, useEffect, useMemo } from 'react';
import { usePlayer } from '../context/PlayerContext';
import { audioEngine } from '../services/audioEngine';
import { Heart, Shuffle, Command, RefreshCw, Disc } from 'lucide-react';

const ARCHITECTURE_PHOTOS = [
  {
    url: '/assets/sidebar_arch.jpg',
    quote: '“MUSIC EXISTS OUTSIDE OF TIME.”',
    label: 'ARCH / 001',
  },
  {
    url: '/assets/now_playing_art.jpg',
    quote: '“FORM FOLLOWS FREQUENCY.”',
    label: 'ARCH / 002',
  },
  {
    url: '/assets/status_monolith.jpg',
    quote: '“ARCHITECTURE IS FROZEN SOUND.”',
    label: 'ARCH / 003',
  },
];

export const Sidebar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    setIsShortcutsOpen,
    activeArchive,
    playEntireArchive,
    likedTrackIds,
    genreFilter,
    setGenreFilter,
    showFavouritesOnly,
    setShowFavouritesOnly,
    playbackStatus,
    playerMode,
    setPlayerMode,
  } = usePlayer();

  const [photoIndex, setPhotoIndex] = useState(0);
  const [vuLeft, setVuLeft] = useState(0);
  const [vuRight, setVuRight] = useState(0);

  const isPlaying = playbackStatus === 'PLAYING';

  // Live stereo VU meters
  useEffect(() => {
    let animId: number;
    const updateMeter = () => {
      if (isPlaying) {
        const freqData = audioEngine.getFrequencyData();
        // Compute left and right channels from frequency bands
        let sumL = 0;
        let sumR = 0;
        const half = Math.floor(freqData.length / 2);
        for (let i = 0; i < half; i++) sumL += freqData[i];
        for (let i = half; i < freqData.length; i++) sumR += freqData[i];

        const avgL = Math.min(100, Math.round((sumL / (half * 255)) * 100));
        const avgR = Math.min(100, Math.round((sumR / (half * 255)) * 100));
        setVuLeft(avgL);
        setVuRight(avgR);
      } else {
        setVuLeft(0);
        setVuRight(0);
      }
      animId = requestAnimationFrame(updateMeter);
    };

    animId = requestAnimationFrame(updateMeter);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying]);

  // Unique genres from active archive
  const availableGenres = useMemo(() => {
    if (!activeArchive) return [];
    const set = new Set<string>();
    activeArchive.tracks.forEach((t) => {
      if (t.genre) {
        // split slash if any
        t.genre.split('/').forEach((g) => set.add(g.trim().toUpperCase()));
      }
    });
    return Array.from(set).slice(0, 6);
  }, [activeArchive]);

  const navItems = [
    { id: 'ARCHIVE', label: '01 / ARCHIVE', index: '01' },
    { id: 'SEARCH', label: '02 / SEARCH', index: '02' },
    { id: 'COLLECTIONS', label: '03 / COLLECTIONS', index: '03' },
    { id: 'SETTINGS', label: '04 / SETTINGS', index: '04' },
  ];

  const handleNavClick = (id: string) => {
    setActiveTab(id);
    if (id === 'SETTINGS') {
      setShowFavouritesOnly(false);
    } else if (id === 'SEARCH') {
      setShowFavouritesOnly(false);
      const searchInput = document.querySelector('input[placeholder*="Search"]') as HTMLInputElement | null;
      if (searchInput) searchInput.focus();
    } else if (id === 'COLLECTIONS') {
      setShowFavouritesOnly((prev) => !prev);
      setGenreFilter(null);
    } else if (id === 'ARCHIVE') {
      setShowFavouritesOnly(false);
      setGenreFilter(null);
    }
  };

  const handleCyclePhoto = () => {
    setPhotoIndex((prev) => (prev + 1) % ARCHITECTURE_PHOTOS.length);
  };

  const currentPhoto = ARCHITECTURE_PHOTOS[photoIndex];

  return (
    <aside className="col-sidebar" style={{ minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Brand & Logo */}
      <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border-color)', flexShrink: 0 }}>
        <div
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '28px',
            lineHeight: 0.95,
            letterSpacing: '0.04em',
            color: 'var(--text-primary)',
            marginBottom: '4px',
          }}
        >
          SHONO<span style={{ color: 'var(--text-muted)' }}>.FM</span>
        </div>
        <div
          className="logo-sub"
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '8px',
            lineHeight: 1.3,
            letterSpacing: '0.12em',
            color: 'var(--text-secondary)',
            textTransform: 'uppercase',
          }}
        >
          PRECISION<br />
          AUDIO<br />
          STATION
        </div>
      </div>

      {/* Main Navigation */}
      <nav style={{ padding: '6px 0', borderBottom: '1px solid var(--border-color)', flexShrink: 0 }}>
        {navItems.map((item) => {
          const isActive =
            item.id === 'SETTINGS'
              ? activeTab === 'SETTINGS'
              : item.id === 'COLLECTIONS'
              ? showFavouritesOnly
              : activeTab === item.id && !showFavouritesOnly;

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
                padding: '7px 16px',
                background: isAccentActive
                  ? 'var(--accent-subtle)'
                  : isActive
                  ? 'var(--bg-secondary)'
                  : 'transparent',
                border: isAccentActive ? '1px solid var(--accent-color)' : 'none',
                borderLeft: isAccentActive
                  ? '1px solid var(--accent-color)'
                  : isActive
                  ? '2px solid var(--text-primary)'
                  : '2px solid transparent',
                color: isAccentActive
                  ? 'var(--accent-color)'
                  : isActive
                  ? 'var(--text-primary)'
                  : 'var(--text-secondary)',
                fontFamily: 'var(--font-mono)',
                fontSize: '10.5px',
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
                  fontSize: '8.5px',
                  color: isAccentActive ? 'var(--accent-color)' : isActive ? 'var(--text-primary)' : 'var(--text-muted)',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 700,
                }}
              >
                {item.id === 'COLLECTIONS' && likedTrackIds.length > 0
                  ? `★ ${likedTrackIds.length}`
                  : item.index}
              </span>
            </button>
          );
        })}

        {/* 007 / MI6 Player Mode Selector */}
        <div style={{ padding: '6px 16px 2px 16px', borderTop: '1px solid var(--border-subtle)', marginTop: '4px' }}>
          <button
            onClick={() => setPlayerMode(playerMode === 'MI6' ? 'ARCHIVE' : 'MI6')}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '6px 10px',
              background: playerMode === 'MI6' ? 'rgba(212,175,55,0.15)' : 'var(--bg-secondary)',
              border: playerMode === 'MI6' ? '1px solid #d4af37' : '1px solid var(--border-color)',
              color: playerMode === 'MI6' ? '#d4af37' : 'var(--text-secondary)',
              fontFamily: 'var(--font-mono)',
              fontSize: '9px',
              fontWeight: 700,
              letterSpacing: '0.1em',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            title="Toggle 007 / MI6 Vinyl Turntable Mode"
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Disc size={12} color={playerMode === 'MI6' ? '#d4af37' : 'currentColor'} />
              <span>{playerMode === 'MI6' ? 'MI6 MODE ON' : '007 / MI6 MODE'}</span>
            </span>
            <span style={{ fontSize: '7.5px', opacity: 0.8 }}>
              {playerMode === 'MI6' ? '●' : '○'}
            </span>
          </button>
        </div>
      </nav>

      {/* Interactive Middle Scrollable Section */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {/* Quick Favourites Action */}
        <button
          onClick={() => {
            setShowFavouritesOnly((prev) => !prev);
            setGenreFilter(null);
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            padding: '7px 10px',
            background: showFavouritesOnly ? 'var(--bg-secondary)' : 'transparent',
            border: showFavouritesOnly ? '1px solid var(--status-live)' : '1px solid var(--border-color)',
            color: showFavouritesOnly ? 'var(--status-live)' : 'var(--text-primary)',
            fontFamily: 'var(--font-mono)',
            fontSize: '9.5px',
            letterSpacing: '0.06em',
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
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Heart size={11} fill={likedTrackIds.length > 0 ? 'var(--status-live)' : 'none'} color="var(--status-live)" />
            FAVOURITES
          </span>
          <span style={{ color: 'var(--text-muted)' }}>[{likedTrackIds.length.toString().padStart(2, '0')}]</span>
        </button>

        {/* Genre Mood Filter Taxonomy */}
        {availableGenres.length > 0 && (
          <div>
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '8.5px',
                letterSpacing: '0.12em',
                color: 'var(--text-muted)',
                marginBottom: '6px',
                textTransform: 'uppercase',
              }}
            >
              GENRE INDEX /
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
              {availableGenres.map((g) => {
                const isSelected = genreFilter?.toLowerCase() === g.toLowerCase();
                return (
                  <button
                    key={g}
                    onClick={() => {
                      if (isSelected) {
                        setGenreFilter(null);
                      } else {
                        setGenreFilter(g);
                        setShowFavouritesOnly(false);
                      }
                    }}
                    style={{
                      padding: '3px 7px',
                      background: isSelected ? 'var(--text-primary)' : 'transparent',
                      color: isSelected ? 'var(--text-inverse)' : 'var(--text-secondary)',
                      border: isSelected ? '1px solid var(--text-primary)' : '1px solid var(--border-subtle)',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '8px',
                      letterSpacing: '0.04em',
                      cursor: 'pointer',
                      transition: 'all 0.12s ease',
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.borderColor = 'var(--text-primary)';
                        e.currentTarget.style.color = 'var(--text-primary)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.borderColor = 'var(--border-subtle)';
                        e.currentTarget.style.color = 'var(--text-secondary)';
                      }
                    }}
                  >
                    {g}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Live Stereo Hardware VU Meter */}
        <div
          style={{
            padding: '8px 10px',
            border: '1px solid var(--border-color)',
            background: 'var(--bg-secondary)',
            fontFamily: 'var(--font-mono)',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '8px',
              color: 'var(--text-muted)',
              marginBottom: '5px',
              letterSpacing: '0.1em',
            }}
          >
            <span>MONITOR / STEREO</span>
            <span style={{ color: isPlaying ? 'var(--status-active)' : 'var(--text-muted)' }}>
              {isPlaying ? 'ACTIVE' : 'STANDBY'}
            </span>
          </div>

          {/* Left Channel */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
            <span style={{ fontSize: '8px', color: 'var(--text-muted)', width: '8px' }}>L</span>
            <div style={{ flex: 1, height: '4px', background: 'var(--border-subtle)', position: 'relative' }}>
              <div
                style={{
                  height: '100%',
                  width: `${vuLeft}%`,
                  background: vuLeft > 85 ? 'var(--status-live)' : 'var(--text-primary)',
                  transition: 'width 0.08s linear',
                }}
              />
            </div>
            <span style={{ fontSize: '7.5px', color: 'var(--text-muted)', width: '22px', textAlign: 'right' }}>
              {isPlaying ? `-${Math.max(0, 100 - vuLeft)}` : 'OFF'}
            </span>
          </div>

          {/* Right Channel */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '8px', color: 'var(--text-muted)', width: '8px' }}>R</span>
            <div style={{ flex: 1, height: '4px', background: 'var(--border-subtle)', position: 'relative' }}>
              <div
                style={{
                  height: '100%',
                  width: `${vuRight}%`,
                  background: vuRight > 85 ? 'var(--status-live)' : 'var(--text-primary)',
                  transition: 'width 0.08s linear',
                }}
              />
            </div>
            <span style={{ fontSize: '7.5px', color: 'var(--text-muted)', width: '22px', textAlign: 'right' }}>
              {isPlaying ? `-${Math.max(0, 100 - vuRight)}` : 'OFF'}
            </span>
          </div>

          <div
            style={{
              fontSize: '7.5px',
              color: 'var(--text-muted)',
              marginTop: '5px',
              textAlign: 'center',
              letterSpacing: '0.08em',
            }}
          >
            44.1 KHZ &bull; 24-BIT DIGITAL
          </div>
        </div>

        {/* Quick Action Commands */}
        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            className="bma-btn"
            onClick={() => activeArchive && playEntireArchive(activeArchive, true)}
            style={{ flex: 1, padding: '5px 8px', fontSize: '8.5px' }}
            title="Shuffle play active archive"
          >
            <Shuffle size={10} style={{ marginRight: '4px' }} /> SHUFFLE
          </button>
          <button
            className="bma-btn"
            onClick={() => setIsShortcutsOpen(true)}
            style={{ padding: '5px 8px', fontSize: '8.5px' }}
            title="Keyboard shortcuts"
          >
            <Command size={10} />
          </button>
        </div>
      </div>

      {/* Interactive Brutalist Architectural Photo & Quote Vault */}
      <div
        style={{
          padding: '10px 16px',
          borderTop: '1px solid var(--border-color)',
          flexShrink: 0,
          background: 'var(--bg-primary)',
        }}
      >
        <div
          onClick={handleCyclePhoto}
          style={{
            position: 'relative',
            width: '100%',
            height: '120px',
            border: '1px solid var(--border-color)',
            overflow: 'hidden',
            marginBottom: '6px',
            background: '#000',
            cursor: 'pointer',
          }}
          title="Click to cycle architectural vault image"
        >
          <img
            src={currentPhoto.url}
            alt="Brutalist Architecture"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              filter: 'grayscale(100%) contrast(125%) brightness(90%)',
              transition: 'transform 0.4s ease, opacity 0.3s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.04)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          />
          {/* Overlay Tag */}
          <div
            style={{
              position: 'absolute',
              top: '4px',
              right: '4px',
              background: 'rgba(0,0,0,0.85)',
              border: '1px solid var(--border-bright)',
              fontFamily: 'var(--font-mono)',
              fontSize: '7.5px',
              color: 'var(--text-primary)',
              padding: '1px 5px',
              display: 'flex',
              alignItems: 'center',
              gap: '3px',
              letterSpacing: '0.08em',
            }}
          >
            <RefreshCw size={8} /> {currentPhoto.label}
          </div>
        </div>

        <div
          className="sidebar-quote"
          onClick={handleCyclePhoto}
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '8px',
            letterSpacing: '0.1em',
            color: 'var(--text-muted)',
            lineHeight: 1.3,
            textTransform: 'uppercase',
            cursor: 'pointer',
          }}
          title="Click to change quote"
        >
          {currentPhoto.quote}
        </div>
      </div>
    </aside>
  );
};
