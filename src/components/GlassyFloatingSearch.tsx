import React, { useState, useEffect, useRef, useMemo } from 'react';
import { usePlayer } from '../context/PlayerContext';
import {
  Search,
  X,
  Play,
  Pause,
  Plus,
  Heart,
  Folder,
  Sparkles,
  Radio,
} from 'lucide-react';
import type { Track, Archive } from '../types';

type SearchCategory = 'ALL' | 'TRACKS' | 'ARTISTS' | 'ALBUMS' | 'ARCHIVES' | 'LIKED';

interface SearchTrackResult {
  track: Track;
  archive: Archive;
}

export const GlassyFloatingSearch: React.FC = () => {
  const {
    isSearchOpen,
    setIsSearchOpen,
    searchQuery,
    setSearchQuery,
    archives,
    activeArchive,
    setActiveArchive,
    playTrack,
    currentTrack,
    playbackStatus,
    addToQueue,
    toggleLike,
    likedTrackIds,
    setActiveTab,
  } = usePlayer();

  const isPlaying = playbackStatus === 'PLAYING';

  const [category, setCategory] = useState<SearchCategory>('ALL');
  const [selectedIndex, setSelectedIndex] = useState<number>(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const resultsContainerRef = useRef<HTMLDivElement>(null);

  // Auto-focus input and reset selection when search opens
  useEffect(() => {
    if (isSearchOpen) {
      setSelectedIndex(0);
      const timer = setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          inputRef.current.select();
        }
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isSearchOpen]);

  // Flatten all tracks from all archives with archive reference
  const allTracksWithArchive = useMemo(() => {
    const list: SearchTrackResult[] = [];
    const seenTrackIds = new Set<string>();

    // Put active archive tracks first
    const sortedArchives = [...archives].sort((a, b) => {
      if (a.id === activeArchive?.id) return -1;
      if (b.id === activeArchive?.id) return 1;
      return 0;
    });

    sortedArchives.forEach((archive) => {
      (archive.tracks || []).forEach((track) => {
        const uniqueKey = `${archive.id}-${track.id}`;
        if (!seenTrackIds.has(uniqueKey)) {
          seenTrackIds.add(uniqueKey);
          list.push({ track, archive });
        }
      });
    });

    return list;
  }, [archives, activeArchive]);

  // Filtered tracks based on query and category
  const filteredTrackResults = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    return allTracksWithArchive.filter(({ track }) => {
      // Category filtering
      if (category === 'LIKED' && !likedTrackIds.includes(track.id)) {
        return false;
      }

      if (!q) {
        if (category === 'LIKED') return likedTrackIds.includes(track.id);
        return true;
      }

      const titleMatch = track.title.toLowerCase().includes(q);
      const artistMatch = track.artist.toLowerCase().includes(q);
      const albumMatch = track.album?.toLowerCase().includes(q);
      const genreMatch = track.genre?.toLowerCase().includes(q);

      if (category === 'TRACKS') return titleMatch;
      if (category === 'ARTISTS') return artistMatch;
      if (category === 'ALBUMS') return albumMatch;

      return titleMatch || artistMatch || albumMatch || genreMatch;
    });
  }, [allTracksWithArchive, searchQuery, category, likedTrackIds]);

  // Filtered archives
  const filteredArchives = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return archives;
    return archives.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.curator.toLowerCase().includes(q) ||
        a.description?.toLowerCase().includes(q)
    );
  }, [archives, searchQuery]);

  // Top result (Hero Spotlight match)
  const topResult = useMemo(() => {
    if (!searchQuery.trim() || filteredTrackResults.length === 0) return null;
    return filteredTrackResults[0];
  }, [searchQuery, filteredTrackResults]);

  // List of tracks to show under hero (or full list if no query)
  const displayTrackResults = useMemo(() => {
    if (topResult) {
      return filteredTrackResults.slice(1);
    }
    return filteredTrackResults.slice(0, 16);
  }, [filteredTrackResults, topResult]);

  // Total navigable items count for keyboard navigation
  const totalNavigableCount = useMemo(() => {
    let count = 0;
    if (topResult) count += 1;
    count += displayTrackResults.length;
    if (category === 'ALL' || category === 'ARCHIVES') {
      count += filteredArchives.length;
    }
    return count;
  }, [topResult, displayTrackResults, filteredArchives, category]);

  // Keep selected index in valid bounds
  useEffect(() => {
    if (selectedIndex >= totalNavigableCount && totalNavigableCount > 0) {
      setSelectedIndex(totalNavigableCount - 1);
    }
  }, [totalNavigableCount, selectedIndex]);

  // Keyboard navigation inside search
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < totalNavigableCount - 1 ? prev + 1 : 0));
      scrollSelectedIntoView();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : totalNavigableCount - 1));
      scrollSelectedIntoView();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      executeSelection(selectedIndex, e.shiftKey);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsSearchOpen(false);
    }
  };

  const scrollSelectedIntoView = () => {
    setTimeout(() => {
      const selectedEl = resultsContainerRef.current?.querySelector('.is-selected');
      if (selectedEl) {
        selectedEl.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }, 10);
  };

  const executeSelection = (index: number, isShift = false) => {
    if (topResult && index === 0) {
      if (isShift) {
        addToQueue(topResult.track);
      } else {
        playTrack(topResult.track);
        setIsSearchOpen(false);
      }
      return;
    }

    const trackIndexOffset = topResult ? 1 : 0;
    const trackItemIndex = index - trackIndexOffset;

    if (trackItemIndex >= 0 && trackItemIndex < displayTrackResults.length) {
      const item = displayTrackResults[trackItemIndex];
      if (isShift) {
        addToQueue(item.track);
      } else {
        playTrack(item.track);
        setIsSearchOpen(false);
      }
      return;
    }

    const archiveItemIndex = trackItemIndex - displayTrackResults.length;
    if (archiveItemIndex >= 0 && archiveItemIndex < filteredArchives.length) {
      const arch = filteredArchives[archiveItemIndex];
      setActiveArchive(arch);
      setActiveTab('ARCHIVE');
      setIsSearchOpen(false);
    }
  };

  const handleTrackClick = (item: SearchTrackResult) => {
    playTrack(item.track);
    setIsSearchOpen(false);
  };

  const handleArchiveClick = (archive: Archive) => {
    setActiveArchive(archive);
    setActiveTab('ARCHIVE');
    setIsSearchOpen(false);
  };

  if (!isSearchOpen) return null;

  return (
    <div
      className={`apple-search-overlay ${isSearchOpen ? 'is-open' : ''}`}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          setIsSearchOpen(false);
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Apple Glass Spotlight Search"
    >
      <div ref={modalRef} className="apple-search-modal" onKeyDown={handleKeyDown}>
        {/* Apple Search Input Row */}
        <div className="apple-search-input-wrap">
          <div className="apple-search-icon-orb">
            <Search size={18} strokeWidth={2.2} />
          </div>

          <input
            ref={inputRef}
            type="text"
            className="apple-search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tracks, artists, albums, or archives..."
            autoComplete="off"
            spellCheck="false"
          />

          {searchQuery ? (
            <button
              onClick={() => {
                setSearchQuery('');
                inputRef.current?.focus();
              }}
              className="apple-search-clear-btn"
              title="Clear search"
            >
              <X size={14} />
            </button>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span className="apple-search-kbd">⌘K</span>
              <span className="apple-search-kbd">/</span>
            </div>
          )}

          <button
            onClick={() => setIsSearchOpen(false)}
            className="apple-search-kbd"
            style={{ cursor: 'pointer', padding: '4px 8px' }}
            title="Dismiss search"
          >
            ESC
          </button>
        </div>

        {/* Apple Filter Pills Bar */}
        <div className="apple-search-pills-bar">
          {(
            [
              { id: 'ALL', label: `ALL (${filteredTrackResults.length})` },
              { id: 'TRACKS', label: 'TRACKS' },
              { id: 'ARTISTS', label: 'ARTISTS' },
              { id: 'ALBUMS', label: 'ALBUMS' },
              { id: 'ARCHIVES', label: `ARCHIVES (${filteredArchives.length})` },
              { id: 'LIKED', label: `★ FAVORITES (${likedTrackIds.length})` },
            ] as const
          ).map((pill) => {
            const isActive = category === pill.id;
            return (
              <button
                key={pill.id}
                className={`apple-search-pill ${isActive ? 'active' : ''}`}
                onClick={() => setCategory(pill.id)}
              >
                {pill.label}
              </button>
            );
          })}
        </div>

        {/* Results List */}
        <div ref={resultsContainerRef} className="apple-search-results-list">
          {/* TOP MATCH SPOTLIGHT HERO CARD (when query active) */}
          {topResult && (category === 'ALL' || category === 'TRACKS') && (
            <div>
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '9px',
                  letterSpacing: '0.12em',
                  color: 'rgba(255, 255, 255, 0.5)',
                  marginBottom: '6px',
                  paddingLeft: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                }}
              >
                <Sparkles size={11} color="#38bdf8" />
                <span>TOP MATCH SPOTLIGHT</span>
              </div>

              <div
                className={`apple-search-hero-card ${selectedIndex === 0 ? 'is-selected' : ''}`}
                onClick={() => handleTrackClick(topResult)}
                style={{
                  outline: selectedIndex === 0 ? '2px solid rgba(56, 189, 248, 0.5)' : 'none',
                }}
              >
                {/* Vinyl / Cover Artwork */}
                <div
                  style={{
                    position: 'relative',
                    width: '64px',
                    height: '64px',
                    borderRadius: '10px',
                    overflow: 'hidden',
                    flexShrink: 0,
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                  }}
                >
                  <img
                    src={topResult.track.thumbnail || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200&auto=format&fit=crop&q=80'}
                    alt={topResult.track.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200&auto=format&fit=crop&q=80';
                    }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'rgba(0,0,0,0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <div
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        background: '#ffffff',
                        color: '#000000',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
                      }}
                    >
                      {currentTrack?.id === topResult.track.id && isPlaying ? (
                        <Pause size={12} fill="currentColor" />
                      ) : (
                        <Play size={12} fill="currentColor" style={{ marginLeft: '2px' }} />
                      )}
                    </div>
                  </div>
                </div>

                {/* Track Information */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      background: 'rgba(56, 189, 248, 0.15)',
                      border: '1px solid rgba(56, 189, 248, 0.3)',
                      padding: '1px 6px',
                      borderRadius: '4px',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '8px',
                      color: '#38bdf8',
                      marginBottom: '4px',
                      letterSpacing: '0.06em',
                    }}
                  >
                    <span>VAULT</span>
                    <span>{topResult.archive.indexNumber}</span>
                    <span>•</span>
                    <span>{topResult.archive.title}</span>
                  </div>

                  <div
                    style={{
                      fontFamily: 'var(--font-sans)',
                      fontSize: '17px',
                      fontWeight: 700,
                      color: '#ffffff',
                      lineHeight: 1.2,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {topResult.track.title}
                  </div>

                  <div
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '11px',
                      color: 'rgba(255, 255, 255, 0.65)',
                      marginTop: '2px',
                    }}
                  >
                    {topResult.track.artist}
                    {topResult.track.album && ` • ${topResult.track.album}`}
                  </div>
                </div>

                {/* Right side actions */}
                <div
                  style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => toggleLike(topResult.track.id)}
                    className="bma-btn-icon"
                    title="Like track"
                    style={{
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.12)',
                      borderRadius: '8px',
                      padding: '6px',
                      color: likedTrackIds.includes(topResult.track.id) ? '#ef4444' : 'rgba(255,255,255,0.6)',
                    }}
                  >
                    <Heart
                      size={14}
                      fill={likedTrackIds.includes(topResult.track.id) ? 'currentColor' : 'none'}
                    />
                  </button>

                  <button
                    onClick={() => addToQueue(topResult.track)}
                    className="bma-btn-icon"
                    title="Add to queue (Shift+Enter)"
                    style={{
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.12)',
                      borderRadius: '8px',
                      padding: '6px',
                      color: 'rgba(255,255,255,0.75)',
                    }}
                  >
                    <Plus size={14} />
                  </button>

                  <button
                    onClick={() => handleTrackClick(topResult)}
                    style={{
                      background: '#ffffff',
                      color: '#000000',
                      border: 'none',
                      borderRadius: '20px',
                      padding: '6px 14px',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '10.5px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.04)')}
                    onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                  >
                    <Play size={11} fill="currentColor" />
                    <span>PLAY</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* SECTION: TRACKS */}
          {displayTrackResults.length > 0 && (
            <div>
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '9px',
                  letterSpacing: '0.12em',
                  color: 'rgba(255, 255, 255, 0.45)',
                  marginBottom: '6px',
                  paddingLeft: '4px',
                  marginTop: topResult ? '10px' : '4px',
                }}
              >
                {searchQuery.trim() ? 'MATCHING TRACKS' : 'RECENT & SUGGESTED TRACKS'}
              </div>

              {displayTrackResults.map((item, idx) => {
                const navIndex = (topResult ? 1 : 0) + idx;
                const isSelected = selectedIndex === navIndex;
                const isPlayingThis = currentTrack?.id === item.track.id;
                const isLiked = likedTrackIds.includes(item.track.id);

                return (
                  <div
                    key={`${item.archive.id}-${item.track.id}-${idx}`}
                    className={`apple-search-item ${isSelected ? 'is-selected' : ''} ${
                      isPlayingThis ? 'is-playing' : ''
                    }`}
                    onClick={() => handleTrackClick(item)}
                    onMouseEnter={() => setSelectedIndex(navIndex)}
                  >
                    {/* Thumbnail */}
                    <div
                      style={{
                        position: 'relative',
                        width: '36px',
                        height: '36px',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        flexShrink: 0,
                        background: 'rgba(0,0,0,0.4)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                      }}
                    >
                      <img
                        src={item.track.thumbnail || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=100&auto=format&fit=crop&q=80'}
                        alt={item.track.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      {isPlayingThis && (
                        <div
                          style={{
                            position: 'absolute',
                            inset: 0,
                            background: 'rgba(0, 0, 0, 0.55)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#38bdf8',
                          }}
                        >
                          <Radio size={14} />
                        </div>
                      )}
                    </div>

                    {/* Track info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontFamily: 'var(--font-sans)',
                          fontSize: '13px',
                          fontWeight: 600,
                          color: isPlayingThis ? '#38bdf8' : '#ffffff',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          lineHeight: 1.25,
                        }}
                      >
                        {item.track.title}
                      </div>
                      <div
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '10px',
                          color: 'rgba(255, 255, 255, 0.5)',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {item.track.artist}
                        {item.track.album && ` • ${item.track.album}`}
                      </div>
                    </div>

                    {/* Archive tag badge */}
                    <div
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '8px',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        background: 'rgba(255, 255, 255, 0.06)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        color: 'rgba(255, 255, 255, 0.55)',
                        maxWidth: '120px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {item.archive.title}
                    </div>

                    {/* Duration */}
                    <div
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '10px',
                        color: 'rgba(255, 255, 255, 0.45)',
                        minWidth: '40px',
                        textAlign: 'right',
                      }}
                    >
                      {item.track.durationFormatted}
                    </div>

                    {/* Quick actions on hover */}
                    <div
                      style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => toggleLike(item.track.id)}
                        className="bma-btn-icon"
                        title="Like"
                        style={{
                          padding: '4px',
                          color: isLiked ? '#ef4444' : 'rgba(255, 255, 255, 0.4)',
                        }}
                      >
                        <Heart size={12} fill={isLiked ? 'currentColor' : 'none'} />
                      </button>
                      <button
                        onClick={() => addToQueue(item.track)}
                        className="bma-btn-icon"
                        title="Add to queue (Shift+Enter)"
                        style={{ padding: '4px', color: 'rgba(255, 255, 255, 0.5)' }}
                      >
                        <Plus size={12} />
                      </button>
                      <button
                        onClick={() => handleTrackClick(item)}
                        className="bma-btn-icon"
                        title="Play track"
                        style={{ padding: '4px', color: '#ffffff' }}
                      >
                        <Play size={12} fill="currentColor" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* SECTION: MATCHING ARCHIVES / REPOSITORIES */}
          {(category === 'ALL' || category === 'ARCHIVES') && filteredArchives.length > 0 && (
            <div style={{ marginTop: '10px' }}>
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '9px',
                  letterSpacing: '0.12em',
                  color: 'rgba(255, 255, 255, 0.45)',
                  marginBottom: '6px',
                  paddingLeft: '4px',
                }}
              >
                VAULT ARCHIVES & PLAYLISTS
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                  gap: '8px',
                }}
              >
                {filteredArchives.map((archive, archIdx) => {
                  const navIndex =
                    (topResult ? 1 : 0) + displayTrackResults.length + archIdx;
                  const isSelected = selectedIndex === navIndex;
                  const isActiveArchive = activeArchive?.id === archive.id;

                  return (
                    <div
                      key={archive.id}
                      className={`apple-search-item ${isSelected ? 'is-selected' : ''}`}
                      onClick={() => handleArchiveClick(archive)}
                      onMouseEnter={() => setSelectedIndex(navIndex)}
                      style={{
                        padding: '10px 12px',
                        border: isSelected
                          ? '1px solid rgba(255, 255, 255, 0.3)'
                          : isActiveArchive
                          ? '1px solid #38bdf8'
                          : '1px solid rgba(255, 255, 255, 0.1)',
                        background: isActiveArchive
                          ? 'rgba(56, 189, 248, 0.08)'
                          : 'rgba(255, 255, 255, 0.03)',
                        borderRadius: '12px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', width: '100%' }}>
                        <div>
                          <span
                            style={{
                              fontFamily: 'var(--font-mono)',
                              fontSize: '8px',
                              color: '#38bdf8',
                              letterSpacing: '0.08em',
                            }}
                          >
                            VAULT {archive.indexNumber}
                          </span>
                          <div
                            style={{
                              fontFamily: 'var(--font-display)',
                              fontSize: '15px',
                              color: '#ffffff',
                              marginTop: '2px',
                              lineHeight: 1.15,
                              letterSpacing: '0.03em',
                            }}
                          >
                            {archive.title}
                          </div>
                        </div>
                        <Folder size={14} color="rgba(255, 255, 255, 0.4)" />
                      </div>

                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          marginTop: '8px',
                          paddingTop: '6px',
                          borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                          width: '100%',
                          fontFamily: 'var(--font-mono)',
                          fontSize: '8.5px',
                          color: 'rgba(255, 255, 255, 0.5)',
                        }}
                      >
                        <span>{archive.tracks.length} TRACKS</span>
                        <span>{archive.totalDurationFormatted}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* EMPTY RESULTS STATE */}
          {filteredTrackResults.length === 0 && filteredArchives.length === 0 && (
            <div
              style={{
                padding: '40px 20px',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'rgba(255, 255, 255, 0.4)',
              }}
            >
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '12px',
                }}
              >
                <Search size={20} color="rgba(255, 255, 255, 0.3)" />
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '15px',
                  fontWeight: 600,
                  color: '#ffffff',
                  marginBottom: '4px',
                }}
              >
                No results found for "{searchQuery}"
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '10px',
                  color: 'rgba(255, 255, 255, 0.5)',
                  maxWidth: '320px',
                  lineHeight: 1.4,
                }}
              >
                Try searching by a different artist name, track title, or choose another filter category above.
              </div>
            </div>
          )}
        </div>

        {/* Apple-style Bottom Status Bar */}
        <div className="apple-search-footer">
          <div>
            <span>INDEXED // </span>
            <span style={{ color: '#ffffff' }}>{allTracksWithArchive.length} TRACKS</span>
            <span> ACROSS </span>
            <span style={{ color: '#ffffff' }}>{archives.length} ARCHIVES</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span>
              <kbd className="apple-search-kbd">↑↓</kbd> NAVIGATE
            </span>
            <span>
              <kbd className="apple-search-kbd">↵</kbd> PLAY
            </span>
            <span>
              <kbd className="apple-search-kbd">⇧↵</kbd> QUEUE
            </span>
            <span>
              <kbd className="apple-search-kbd">ESC</kbd> CLOSE
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
