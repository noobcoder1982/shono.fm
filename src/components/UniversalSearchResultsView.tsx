import React, { useState, useRef, useEffect } from 'react';
import { usePlayer } from '../context/PlayerContext';
import { type YoutubeSearchResultCollection, type YoutubeSearchResultTrack } from '../services/youtubeSearchService';
import { Play, Plus, Check, MoreHorizontal, ListPlus, Heart, Copy, Loader2, ArrowRight, Disc, Music, UserCheck, X } from 'lucide-react';
import type { Track } from '../types';

export const UniversalSearchResultsView: React.FC = () => {
  const {
    universalSearchQuery,
    universalSearchFilter,
    setUniversalSearchFilter,
    universalSearchResults,
    isUniversalSearching,
    universalSearchError,
    performUniversalSearch,
    clearUniversalSearch,
    playTrack,
    addToQueue,
    playNextInQueue,
    toggleLike,
    likedTrackIds,
    currentTrack,
    playbackStatus,
    addTrackToStandaloneArchive,
    addCollectionArchive,
  } = usePlayer();

  // Per-item loading and confirmation state for collections
  const [addingCollectionId, setAddingCollectionId] = useState<string | null>(null);
  const [addedCollectionIds, setAddedCollectionIds] = useState<Record<string, boolean>>({});

  // Per-item added confirmation state for individual tracks
  const [addedTrackIds, setAddedTrackIds] = useState<Record<string, boolean>>({});

  // Overflow menu state for tracks
  const [activeMenuTrackId, setActiveMenuTrackId] = useState<string | null>(null);
  const [copiedTrackId, setCopiedTrackId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setActiveMenuTrackId(null);
      }
    };
    if (activeMenuTrackId) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [activeMenuTrackId]);

  const handleFilterClick = (filter: 'ALL' | 'COLLECTIONS' | 'TRACKS' | 'CHANNELS') => {
    setUniversalSearchFilter(filter);
    performUniversalSearch(universalSearchQuery, filter);
  };

  const handleAddCollection = async (collection: YoutubeSearchResultCollection) => {
    if (addingCollectionId) return;
    setAddingCollectionId(collection.id);

    try {
      const addedArchive = await addCollectionArchive(collection);
      if (addedArchive) {
        setAddedCollectionIds((prev) => ({ ...prev, [collection.id]: true }));
        setTimeout(() => {
          setAddedCollectionIds((prev) => ({ ...prev, [collection.id]: false }));
        }, 3000);
      }
    } catch (err: any) {
      console.warn('Failed to ingest collection archive to vault:', err);
    } finally {
      setAddingCollectionId(null);
    }
  };

  const handleAddTrack = async (trackItem: YoutubeSearchResultTrack) => {
    try {
      await addTrackToStandaloneArchive(trackItem.track);
      setAddedTrackIds((prev) => ({ ...prev, [trackItem.id]: true }));
      setTimeout(() => {
        setAddedTrackIds((prev) => ({ ...prev, [trackItem.id]: false }));
      }, 2500);
    } catch (err: any) {
      console.warn('Failed to add track to standalone album:', err);
    }
  };

  const handleCopyLink = (track: Track, e: React.MouseEvent) => {
    e.stopPropagation();
    const link = track.youtubeId
      ? `https://www.youtube.com/watch?v=${track.youtubeId}`
      : window.location.href;
    navigator.clipboard.writeText(link);
    setCopiedTrackId(track.id);
    setTimeout(() => {
      setCopiedTrackId(null);
      setActiveMenuTrackId(null);
    }, 1200);
  };

  const collections = universalSearchResults?.collections || [];
  const tracks = universalSearchResults?.tracks || [];
  const channels = universalSearchResults?.channels || [];

  const showCollections =
    (universalSearchFilter === 'ALL' || universalSearchFilter === 'COLLECTIONS') &&
    collections.length > 0;

  const showTracks =
    (universalSearchFilter === 'ALL' || universalSearchFilter === 'TRACKS') &&
    tracks.length > 0;

  const showChannels =
    (universalSearchFilter === 'ALL' || universalSearchFilter === 'CHANNELS') &&
    channels.length > 0;

  const hasAnyResults = collections.length > 0 || tracks.length > 0 || channels.length > 0;

  return (
    <div
      className="universal-search-results-view"
      style={{
        flex: 1,
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--bg-primary)',
        overflowY: 'auto',
      }}
    >
      {/* 1. SEARCH HEADER */}
      <div
        style={{
          padding: '16px 26px 12px 26px',
          borderBottom: '1px solid var(--border-color)',
          background: 'var(--bg-primary)',
          flexShrink: 0,
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '12px',
          }}
        >
          <div>
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '9.5px',
                letterSpacing: '0.12em',
                color: 'var(--text-muted)',
                marginBottom: '4px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <span>YOUTUBE / SEARCH</span>
              {isUniversalSearching && (
                <span
                  style={{
                    color: 'var(--accent-color)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <Loader2 size={10} className="animate-spin" />
                  <span>SEARCHING...</span>
                </span>
              )}
            </div>
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '30px',
                lineHeight: 1.05,
                letterSpacing: '0.04em',
                fontWeight: 700,
                color: 'var(--text-primary)',
                margin: 0,
                textTransform: 'uppercase',
                wordBreak: 'break-word',
              }}
            >
              {universalSearchQuery || 'ALL RESULTS'}
            </h2>
          </div>

          <button
            onClick={clearUniversalSearch}
            className="bma-btn"
            style={{
              padding: '6px 12px',
              fontSize: '9.5px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              borderColor: 'var(--border-subtle)',
              color: 'var(--text-secondary)',
            }}
            title="Clear search and return to current archive"
          >
            <X size={12} />
            <span>RESTORE ARCHIVE</span>
          </button>
        </div>

        {/* Filter Navigation Row: ALL | COLLECTIONS | TRACKS | CHANNELS */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            overflowX: 'auto',
            paddingBottom: '2px',
          }}
        >
          {(['ALL', 'COLLECTIONS', 'TRACKS', 'CHANNELS'] as const).map((filterOption) => {
            const isActive = universalSearchFilter === filterOption;
            return (
              <button
                key={filterOption}
                type="button"
                onClick={() => handleFilterClick(filterOption)}
                style={{
                  background: isActive ? 'var(--accent-color)' : 'var(--bg-secondary)',
                  color: isActive ? '#050505' : 'var(--text-secondary)',
                  border: isActive ? '1px solid var(--accent-color)' : '1px solid var(--border-color)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '9.5px',
                  fontWeight: isActive ? 800 : 600,
                  letterSpacing: '0.08em',
                  padding: '4px 14px',
                  borderRadius: '2px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  userSelect: 'none',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.borderColor = 'var(--border-bright)';
                    e.currentTarget.style.color = 'var(--text-primary)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.borderColor = 'var(--border-color)';
                    e.currentTarget.style.color = 'var(--text-secondary)';
                  }
                }}
              >
                {filterOption === 'ALL'
                  ? 'ALL'
                  : filterOption === 'COLLECTIONS'
                  ? 'COLLECTIONS'
                  : filterOption === 'TRACKS'
                  ? 'TRACKS'
                  : 'CHANNELS'}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. ERROR STATE BANNER */}
      {universalSearchError && (
        <div
          style={{
            margin: '16px 26px 8px 26px',
            padding: '12px 18px',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            background: 'rgba(239, 68, 68, 0.08)',
            color: '#fca5a5',
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            letterSpacing: '0.04em',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span>{universalSearchError}</span>
          <button
            onClick={() => performUniversalSearch(universalSearchQuery, universalSearchFilter)}
            className="bma-btn"
            style={{ padding: '3px 10px', fontSize: '9px', borderColor: '#ef4444' }}
          >
            RETRY
          </button>
        </div>
      )}

      {/* 3. LOADING SKELETON / INDICATOR */}
      {isUniversalSearching && !hasAnyResults && (
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '60px 20px',
            color: 'var(--text-muted)',
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            letterSpacing: '0.08em',
          }}
        >
          <Loader2 size={24} className="animate-spin" color="var(--accent-color)" style={{ marginBottom: '14px' }} />
          <div>SCANNING YOUTUBE ARCHIVES...</div>
        </div>
      )}

      {/* 4. EMPTY / NO RESULTS STATE */}
      {!isUniversalSearching && !hasAnyResults && !universalSearchError && (
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '60px 20px',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '22px',
              color: 'var(--text-primary)',
              letterSpacing: '0.04em',
              marginBottom: '8px',
            }}
          >
            NO RESULTS FOUND FOR "{universalSearchQuery}"
          </div>
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '10.5px',
              color: 'var(--text-muted)',
              letterSpacing: '0.06em',
              maxWidth: '380px',
              lineHeight: 1.5,
            }}
          >
            Try searching for an artist name, album, playlist, or song title.
          </div>
        </div>
      )}

      {/* 5. SEARCH RESULTS LISTING */}
      <div style={{ flex: 1, paddingBottom: '32px' }}>
        {/* SECTION A: COLLECTIONS (PLAYLISTS & ALBUMS) */}
        {showCollections && (
          <div style={{ marginBottom: '24px' }}>
            <div
              style={{
                padding: '12px 26px 8px 26px',
                borderBottom: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '10px',
                  fontWeight: 800,
                  letterSpacing: '0.12em',
                  color: 'var(--text-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <Disc size={13} color="var(--accent-color)" />
                <span>COLLECTIONS &bull; PLAYLISTS</span>
              </div>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '9px',
                  color: 'var(--text-muted)',
                  letterSpacing: '0.06em',
                }}
              >
                {collections.length} COLLECTIONS
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {collections.map((col, idx) => {
                const isAdding = addingCollectionId === col.id;
                const isAdded = Boolean(addedCollectionIds[col.id]);

                return (
                  <div
                    key={`col_${col.id}_${idx}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '10px 26px',
                      borderBottom: '1px solid var(--border-color)',
                      background: 'var(--bg-primary)',
                      gap: '16px',
                      transition: 'background 0.15s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-secondary)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--bg-primary)')}
                  >
                    {/* Square Thumbnail */}
                    <div
                      style={{
                        width: '52px',
                        height: '52px',
                        flexShrink: 0,
                        border: '1px solid var(--border-color)',
                        background: 'var(--bg-secondary)',
                        overflow: 'hidden',
                        position: 'relative',
                      }}
                    >
                      <img
                        src={col.thumbnail || 'https://img.youtube.com/vi/0/hqdefault.jpg'}
                        alt={col.title}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          filter: 'grayscale(100%) contrast(110%)',
                          transition: 'filter 0.2s ease',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.filter = 'none')}
                        onMouseLeave={(e) => (e.currentTarget.style.filter = 'grayscale(100%) contrast(110%)')}
                      />
                    </div>

                    {/* Metadata */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontFamily: 'var(--font-display)',
                          fontSize: '14.5px',
                          fontWeight: 700,
                          letterSpacing: '0.02em',
                          color: 'var(--text-primary)',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          lineHeight: 1.2,
                        }}
                        title={col.title}
                      >
                        {col.title}
                      </div>
                      <div
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '10.5px',
                          color: 'var(--text-secondary)',
                          marginTop: '3px',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {col.channelTitle}
                      </div>
                      <div
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '9px',
                          color: 'var(--text-muted)',
                          marginTop: '2px',
                          letterSpacing: '0.04em',
                        }}
                      >
                        Playlist &bull; {col.trackCount != null ? `${col.trackCount} tracks` : 'Collection'}
                      </div>
                    </div>

                    {/* Action: ADD -> (Ingests to Collections Vault) */}
                    <button
                      type="button"
                      onClick={() => handleAddCollection(col)}
                      disabled={isAdding}
                      className={`col-vault-add-btn ${isAdded ? 'is-added' : ''}`}
                      title="Add collection to Collections Vault"
                    >
                      {isAdding ? (
                        <>
                          <Loader2 size={12} className="animate-spin" />
                          <span>INGESTING...</span>
                        </>
                      ) : isAdded ? (
                        <>
                          <Check size={12} />
                          <span>✓ ADDED</span>
                        </>
                      ) : (
                        <>
                          <span>ADD</span>
                          <ArrowRight size={11} />
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* SECTION B: INDIVIDUAL TRACK RESULTS */}
        {showTracks && (
          <div style={{ marginBottom: '24px' }}>
            <div
              style={{
                padding: '12px 26px 8px 26px',
                borderBottom: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '10px',
                  fontWeight: 800,
                  letterSpacing: '0.12em',
                  color: 'var(--text-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <Music size={13} color="var(--accent-color)" />
                <span>TRACKS</span>
              </div>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '9px',
                  color: 'var(--text-muted)',
                  letterSpacing: '0.06em',
                }}
              >
                {tracks.length} TRACKS
              </span>
            </div>

            <table className="track-table">
              <thead>
                <tr>
                  <th style={{ width: '46px' }}>#</th>
                  <th style={{ width: '48px' }}>THUMB</th>
                  <th>TITLE</th>
                  <th>ARTIST</th>
                  <th style={{ width: '60px' }}>TIME</th>
                  <th style={{ width: '130px', textAlign: 'right' }}>ACTIONS</th>
                  <th style={{ width: '40px', textAlign: 'right' }}></th>
                </tr>
              </thead>
              <tbody>
                {tracks.map((trackItem, idx) => {
                  const track = trackItem.track;
                  const isCurrent = currentTrack?.youtubeId === trackItem.id;
                  const isPlaying = isCurrent && playbackStatus === 'PLAYING';
                  const isAdded = Boolean(addedTrackIds[trackItem.id]);
                  const isLiked = likedTrackIds.includes(track.id);
                  const isMenuOpen = activeMenuTrackId === trackItem.id;
                  const formattedIndex = (idx + 1).toString().padStart(3, '0');

                  return (
                    <tr
                      key={`track_${trackItem.id}_${idx}`}
                      className={`track-row ${isCurrent ? 'active-row' : ''}`}
                      onClick={() => playTrack(track)}
                    >
                      {/* Index */}
                      <td
                        style={{
                          width: '46px',
                          color: isCurrent ? 'var(--text-primary)' : 'var(--text-muted)',
                          fontSize: '10.5px',
                          fontFamily: 'var(--font-mono)',
                        }}
                      >
                        {isCurrent ? (
                          <span style={{ fontWeight: 700, color: 'var(--accent-color)' }}>| {formattedIndex}</span>
                        ) : (
                          formattedIndex
                        )}
                      </td>

                      {/* Square Artwork */}
                      <td style={{ width: '48px', padding: '6px 10px' }}>
                        <div
                          className="square-artwork-container"
                          style={{
                            width: '36px',
                            height: '36px',
                            background: 'var(--bg-secondary)',
                            border: '1px solid var(--border-color)',
                            overflow: 'hidden',
                            position: 'relative',
                          }}
                        >
                          <img
                            src={trackItem.thumbnail}
                            alt={trackItem.title}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                              filter: 'grayscale(100%) contrast(110%)',
                            }}
                          />
                        </div>
                      </td>

                      {/* Title + Equalizer */}
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
                          <span
                            style={{
                              fontSize: '12px',
                              fontFamily: 'var(--font-mono)',
                              fontWeight: isCurrent ? 700 : 500,
                              letterSpacing: '0.02em',
                            }}
                          >
                            {trackItem.title}
                          </span>
                        </div>
                      </td>

                      {/* Artist / Channel */}
                      <td
                        style={{
                          color: isCurrent ? 'var(--text-primary)' : 'var(--text-secondary)',
                          fontSize: '11px',
                          fontFamily: 'var(--font-mono)',
                        }}
                      >
                        {trackItem.channelTitle}
                      </td>

                      {/* Duration */}
                      <td
                        style={{
                          color: isCurrent ? 'var(--text-primary)' : 'var(--text-secondary)',
                          fontFamily: 'var(--font-mono)',
                          fontSize: '10px',
                        }}
                      >
                        {trackItem.durationFormatted || '03:35'}
                      </td>

                      {/* Fast Action Buttons: Play + Add */}
                      <td style={{ textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          <button
                            type="button"
                            onClick={() => playTrack(track)}
                            className="bma-btn"
                            style={{
                              padding: '3px 8px',
                              fontSize: '9px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                            title="Play track"
                          >
                            <Play size={10} fill="currentColor" />
                            <span>PLAY</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleAddTrack(trackItem)}
                            className={`bma-btn track-add-standalone-btn ${isAdded ? 'is-added' : ''}`}
                            style={{
                              padding: '3px 8px',
                              fontSize: '9px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                            title="Add track to Singles / Standalone album"
                          >
                            {isAdded ? (
                              <>
                                <Check size={10} />
                                <span>ADDED</span>
                              </>
                            ) : (
                              <>
                                <Plus size={10} />
                                <span>ADD</span>
                              </>
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Overflow Menu */}
                      <td
                        style={{ width: '40px', textAlign: 'right', position: 'relative' }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          className="bma-btn-icon"
                          onClick={() => setActiveMenuTrackId(isMenuOpen ? null : trackItem.id)}
                          title="Track actions"
                          style={{ padding: '4px' }}
                        >
                          <MoreHorizontal size={14} />
                        </button>

                        {isMenuOpen && (
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
                                setActiveMenuTrackId(null);
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
                                setActiveMenuTrackId(null);
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
                                setActiveMenuTrackId(null);
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
                              onClick={(e) => handleCopyLink(track, e)}
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
                              <Copy size={12} /> {copiedTrackId === track.id ? 'LINK COPIED' : 'COPY SOURCE LINK'}
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* SECTION C: CHANNELS */}
        {showChannels && (
          <div style={{ marginBottom: '24px' }}>
            <div
              style={{
                padding: '12px 26px 8px 26px',
                borderBottom: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '10px',
                  fontWeight: 800,
                  letterSpacing: '0.12em',
                  color: 'var(--text-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <UserCheck size={13} color="var(--accent-color)" />
                <span>CHANNELS</span>
              </div>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '9px',
                  color: 'var(--text-muted)',
                  letterSpacing: '0.06em',
                }}
              >
                {channels.length} CHANNELS
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {channels.map((ch, idx) => (
                <div
                  key={`ch_${ch.id}_${idx}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '12px 26px',
                    borderBottom: '1px solid var(--border-color)',
                    background: 'var(--bg-primary)',
                    gap: '16px',
                    transition: 'background 0.15s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-secondary)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--bg-primary)')}
                >
                  <div
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '50%',
                      overflow: 'hidden',
                      border: '1px solid var(--border-color)',
                      flexShrink: 0,
                    }}
                  >
                    <img
                      src={ch.thumbnail}
                      alt={ch.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: '14px',
                        fontWeight: 700,
                        color: 'var(--text-primary)',
                        letterSpacing: '0.02em',
                      }}
                    >
                      {ch.title}
                    </div>
                    {ch.description && (
                      <div
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '10px',
                          color: 'var(--text-muted)',
                          marginTop: '3px',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {ch.description}
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const query = `${ch.title} playlist`;
                      performUniversalSearch(query, 'COLLECTIONS');
                    }}
                    className="bma-btn"
                    style={{
                      padding: '5px 12px',
                      fontSize: '9.5px',
                      letterSpacing: '0.06em',
                      flexShrink: 0,
                    }}
                    title="Find collections by this channel"
                  >
                    <span>EXPLORE PLAYLISTS →</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
