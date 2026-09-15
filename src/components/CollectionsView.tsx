import React, { useState, useMemo } from 'react';
import { usePlayer } from '../context/PlayerContext';
import {
  Folder,
  Play,
  Shuffle,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  Search,
  ArrowRight,
  ListMusic,
  Download,
} from 'lucide-react';
import { PlaylistImporter } from './PlaylistImporter';
import type { Archive } from '../types';

export const CollectionsView: React.FC = () => {
  const {
    archives,
    activeArchive,
    setActiveArchive,
    playEntireArchive,
    deleteArchive,
    setActiveTab,
    openZipModal,
  } = usePlayer();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'PLAYLIST' | 'ALBUM' | 'CUSTOM'>('ALL');
  const [sortBy, setSortBy] = useState<'ID' | 'TRACKS' | 'DURATION' | 'TITLE'>('ID');
  const [isImporterOpen, setIsImporterOpen] = useState(false);

  // Inline rename state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  // Overall Vault Metrics
  const totalTracks = useMemo(() => {
    return archives.reduce((acc, a) => acc + (a.tracks?.length || 0), 0);
  }, [archives]);

  const totalDurationSeconds = useMemo(() => {
    return archives.reduce((acc, a) => {
      const archiveSecs = (a.tracks || []).reduce((tAcc, t) => tAcc + (t.duration || 0), 0);
      return acc + archiveSecs;
    }, 0);
  }, [archives]);

  const formatTotalTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
      return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatArchiveDuration = (archive: Archive) => {
    const totalSecs = (archive.tracks || []).reduce((acc, t) => acc + (t.duration || 0), 0);
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    if (hrs > 0) {
      return `${hrs}h ${mins}m`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Filter and Sort Collections
  const filteredArchives = useMemo(() => {
    return archives
      .filter((a) => {
        // Search filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = a.title.toLowerCase().includes(q);
          const matchDesc = a.description?.toLowerCase().includes(q);
          const matchTrack = a.tracks?.some(
            (t) => t.title.toLowerCase().includes(q) || t.artist.toLowerCase().includes(q)
          );
          if (!matchTitle && !matchDesc && !matchTrack) return false;
        }

        // Type filter
        const isYoutube = a.source === 'youtube' || (a.sourceUrl && a.sourceUrl.includes('youtu'));
        if (filterType === 'PLAYLIST') {
          return isYoutube || a.title.toUpperCase().includes('PLAYLIST') || a.title.toUpperCase().includes('MIX');
        }
        if (filterType === 'ALBUM') {
          return a.title.toUpperCase().includes('ALBUM');
        }
        if (filterType === 'CUSTOM') {
          return !isYoutube && !a.title.toUpperCase().includes('ALBUM');
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'TRACKS') {
          return (b.tracks?.length || 0) - (a.tracks?.length || 0);
        }
        if (sortBy === 'DURATION') {
          const durA = (a.tracks || []).reduce((sum, t) => sum + (t.duration || 0), 0);
          const durB = (b.tracks || []).reduce((sum, t) => sum + (t.duration || 0), 0);
          return durB - durA;
        }
        if (sortBy === 'TITLE') {
          return a.title.localeCompare(b.title);
        }
        return a.id.localeCompare(b.id);
      });
  }, [archives, searchQuery, filterType, sortBy]);

  // Rename handlers
  const handleStartRename = (id: string, currentTitle: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(id);
    setEditTitle(currentTitle);
  };

  const handleSaveRename = (id: string, e: React.FormEvent) => {
    e.preventDefault();
    if (editTitle.trim()) {
      const target = archives.find((a) => a.id === id);
      if (target) {
        target.title = editTitle.trim().toUpperCase();
      }
    }
    setEditingId(null);
  };

  const handleOpenInArchive = (archive: Archive, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setActiveArchive(archive);
    setActiveTab('ARCHIVE');
  };

  return (
    <section
      className="col-main"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minHeight: 0,
        overflow: 'hidden',
        background: 'var(--bg-primary)',
        color: 'var(--text-primary)',
      }}
    >
      {/* SECTION HEADER */}
      <header
        style={{
          padding: '16px 24px',
          borderBottom: '1px solid var(--border-color)',
          background: 'var(--bg-secondary)',
          flexShrink: 0,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: '16px',
        }}
      >
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontFamily: 'var(--font-mono)',
              fontSize: '9px',
              letterSpacing: '0.14em',
              color: 'var(--accent-color)',
              marginBottom: '4px',
              textTransform: 'uppercase',
            }}
          >
            <Folder size={11} />
            <span>03 // REPOSITORIES & PLAYLISTS</span>
          </div>

          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '34px',
              lineHeight: 1,
              letterSpacing: '0.04em',
              margin: '0 0 4px 0',
              color: 'var(--text-primary)',
            }}
          >
            COLLECTIONS VAULT
          </h1>

          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '9.5px',
              letterSpacing: '0.06em',
              color: 'var(--text-secondary)',
            }}
          >
            MANAGE, INGEST & DISPATCH ALL CURATED AUDIO ARCHIVES
          </div>
        </div>

        {/* Quick jump to tracklist */}
        <button
          onClick={() => setActiveTab('ARCHIVE')}
          className="bma-btn"
          style={{
            padding: '7px 12px',
            fontSize: '9.5px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'var(--bg-tertiary)',
          }}
          title="Open Tracklist for currently active archive"
        >
          <span>01 / ARCHIVE TRACKLIST</span>
          <ArrowRight size={11} />
        </button>
      </header>

      {/* METRICS STATS MONOLITH BAR */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          borderBottom: '1px solid var(--border-color)',
          background: 'var(--bg-tertiary)',
          flexShrink: 0,
        }}
      >
        <div style={{ padding: '10px 18px', borderRight: '1px solid var(--border-color)' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '8px', color: 'var(--text-muted)', letterSpacing: '0.1em' }}>
            TOTAL REPOSITORIES
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
            {archives.length.toString().padStart(2, '0')}
          </div>
        </div>

        <div style={{ padding: '10px 18px', borderRight: '1px solid var(--border-color)' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '8px', color: 'var(--text-muted)', letterSpacing: '0.1em' }}>
            TOTAL CATALOG TRACKS
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '18px', fontWeight: 700, color: 'var(--accent-color)', marginTop: '2px' }}>
            {totalTracks}
          </div>
        </div>

        <div style={{ padding: '10px 18px', borderRight: '1px solid var(--border-color)' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '8px', color: 'var(--text-muted)', letterSpacing: '0.1em' }}>
            CUMULATIVE RUNTIME
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
            {formatTotalTime(totalDurationSeconds)}
          </div>
        </div>

        <div style={{ padding: '10px 18px' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '8px', color: 'var(--text-muted)', letterSpacing: '0.1em' }}>
            ACTIVE LOADED VAULT
          </div>
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '13px',
              fontWeight: 700,
              color: 'var(--status-active)',
              marginTop: '4px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
            }}
          >
            <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'var(--status-active)' }} />
            {activeArchive?.title || 'NONE'}
          </div>
        </div>
      </div>

      {/* SEARCH, FILTER & INGEST TOOLBAR */}
      <div
        style={{
          padding: '10px 20px',
          borderBottom: '1px solid var(--border-color)',
          background: 'var(--bg-primary)',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          flexWrap: 'wrap',
        }}
      >
        {/* Left: Search input */}
        <div
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            minWidth: '220px',
            maxWidth: '320px',
            flex: 1,
          }}
        >
          <div style={{ padding: '0 8px', color: 'var(--text-muted)' }}>
            <Search size={12} />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter collections by name or track..."
            style={{
              width: '100%',
              height: '28px',
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-mono)',
              fontSize: '10px',
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                padding: '0 8px',
                cursor: 'pointer',
              }}
            >
              <X size={12} />
            </button>
          )}
        </div>

        {/* Center: Type Filter Chips */}
        <div style={{ display: 'flex', gap: '4px' }}>
          {(['ALL', 'PLAYLIST', 'ALBUM', 'CUSTOM'] as const).map((type) => {
            const isSelected = filterType === type;
            return (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                style={{
                  background: isSelected ? 'var(--text-primary)' : 'var(--bg-secondary)',
                  color: isSelected ? 'var(--text-inverse)' : 'var(--text-secondary)',
                  border: isSelected ? '1px solid var(--text-primary)' : '1px solid var(--border-subtle)',
                  padding: '4px 10px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '8.5px',
                  fontWeight: isSelected ? 700 : 500,
                  letterSpacing: '0.06em',
                  cursor: 'pointer',
                  transition: 'all 0.12s ease',
                }}
              >
                {type}
              </button>
            );
          })}
        </div>

        {/* Right: Sort & Importer Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            style={{
              background: 'var(--bg-secondary)',
              color: 'var(--text-secondary)',
              border: '1px solid var(--border-color)',
              fontFamily: 'var(--font-mono)',
              fontSize: '8.5px',
              padding: '5px 8px',
              cursor: 'pointer',
              outline: 'none',
            }}
          >
            <option value="ID">SORT: ARCHIVE ID</option>
            <option value="TRACKS">SORT: TRACK COUNT</option>
            <option value="DURATION">SORT: DURATION</option>
            <option value="TITLE">SORT: TITLE (A-Z)</option>
          </select>

          <button
            onClick={() => setIsImporterOpen((prev) => !prev)}
            className="bma-btn"
            style={{
              padding: '5px 10px',
              fontSize: '9px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              background: isImporterOpen ? 'var(--accent-color)' : 'var(--bg-secondary)',
              color: isImporterOpen ? 'var(--text-inverse)' : 'var(--text-primary)',
              border: isImporterOpen ? '1px solid var(--accent-color)' : '1px solid var(--border-color)',
            }}
          >
            <Plus size={11} />
            <span>{isImporterOpen ? 'CLOSE INGESTOR' : '+ INGEST PLAYLIST'}</span>
          </button>
        </div>
      </div>

      {/* COLLAPSIBLE PLAYLIST INGESTOR */}
      {isImporterOpen && (
        <div style={{ borderBottom: '1px solid var(--border-color)', background: 'var(--bg-secondary)' }}>
          <PlaylistImporter />
        </div>
      )}

      {/* SCROLLABLE MAIN COLLECTIONS GRID BODY */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '20px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
        }}
      >
        {/* CURRENTLY LOADED HERO BANNER */}
        {activeArchive && (
          <div
            style={{
              border: '1px solid var(--accent-color)',
              background: 'var(--bg-secondary)',
              padding: '16px 20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '16px',
              boxShadow: '0 0 16px var(--accent-subtle)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '8px',
                  letterSpacing: '0.12em',
                  color: 'var(--status-active)',
                  marginBottom: '4px',
                }}
              >
                <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'var(--status-active)' }} />
                <span>LOADED CURRENTLY IN MASTER BUS</span>
                <span style={{ color: 'var(--text-muted)' }}>//</span>
                <span style={{ color: 'var(--text-muted)' }}>{activeArchive.id.toUpperCase()}</span>
              </div>

              <div
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '26px',
                  letterSpacing: '0.04em',
                  color: 'var(--text-primary)',
                  marginBottom: '3px',
                }}
              >
                {activeArchive.title}
              </div>

              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '9.5px',
                  color: 'var(--text-secondary)',
                  letterSpacing: '0.04em',
                }}
              >
                {activeArchive.tracks.length} TRACKS &bull; {formatArchiveDuration(activeArchive)} &bull; {activeArchive.description || 'Curated Sound Archive'}
              </div>
            </div>

            {/* Quick action buttons on hero */}
            <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
              <button
                onClick={() => playEntireArchive(activeArchive, false)}
                className="bma-btn"
                style={{
                  background: 'var(--accent-color)',
                  color: 'var(--text-inverse)',
                  border: '1px solid var(--accent-color)',
                  padding: '7px 14px',
                  fontSize: '9.5px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                }}
              >
                <Play size={11} fill="currentColor" /> PLAY ALL
              </button>

              <button
                onClick={() => playEntireArchive(activeArchive, true)}
                className="bma-btn"
                style={{
                  padding: '7px 12px',
                  fontSize: '9.5px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                }}
              >
                <Shuffle size={11} /> SHUFFLE
              </button>

              <button
                onClick={(e) => handleOpenInArchive(activeArchive, e)}
                className="bma-btn"
                style={{
                  padding: '7px 12px',
                  fontSize: '9.5px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                }}
                title="View and play individual tracks in Archive view"
              >
                <ListMusic size={11} /> VIEW TRACKLIST
              </button>
            </div>
          </div>
        )}

        {/* COLLECTIONS GALLERY GRID */}
        <div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontFamily: 'var(--font-mono)',
              fontSize: '9px',
              letterSpacing: '0.12em',
              color: 'var(--text-muted)',
              marginBottom: '10px',
              textTransform: 'uppercase',
            }}
          >
            <span>REPOSITORIES LISTING [{filteredArchives.length}]</span>
            <span>CLICK CARD TO LOAD INTO PLAYER</span>
          </div>

          {filteredArchives.length === 0 ? (
            <div
              style={{
                padding: '36px',
                border: '1px dashed var(--border-color)',
                background: 'var(--bg-secondary)',
                textAlign: 'center',
                fontFamily: 'var(--font-mono)',
              }}
            >
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                NO COLLECTIONS FOUND MATCHING QUERY
              </div>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setFilterType('ALL');
                }}
                className="bma-btn"
                style={{ padding: '6px 14px', fontSize: '9px' }}
              >
                CLEAR FILTERS
              </button>
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '14px',
              }}
            >
              {filteredArchives.map((archive, idx) => {
                const isActive = activeArchive?.id === archive.id;
                const isEditing = editingId === archive.id;
                const trackSnippet = (archive.tracks || []).slice(0, 3);

                return (
                  <div
                    key={archive.id}
                    onClick={() => setActiveArchive(archive)}
                    style={{
                      border: isActive ? '1px solid var(--accent-color)' : '1px solid var(--border-color)',
                      background: isActive ? 'var(--bg-secondary)' : 'var(--bg-tertiary)',
                      padding: '16px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      position: 'relative',
                      minHeight: '190px',
                      boxShadow: isActive ? '0 0 14px var(--accent-subtle)' : 'none',
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) e.currentTarget.style.borderColor = 'var(--border-bright)';
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) e.currentTarget.style.borderColor = 'var(--border-color)';
                    }}
                  >
                    {/* Top Row: Index + Type + Delete */}
                    <div>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: '8px',
                          fontFamily: 'var(--font-mono)',
                          fontSize: '8px',
                          letterSpacing: '0.1em',
                        }}
                      >
                        <span style={{ color: isActive ? 'var(--accent-color)' : 'var(--text-muted)', fontWeight: 700 }}>
                          ARCH // {archive.id.slice(-3).toUpperCase() || (idx + 1).toString().padStart(3, '0')}
                        </span>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span
                            style={{
                              background: 'var(--bg-primary)',
                              border: '1px solid var(--border-subtle)',
                              padding: '2px 5px',
                              color: 'var(--text-secondary)',
                              fontSize: '7px',
                            }}
                          >
                            {archive.source === 'youtube' ? 'YOUTUBE' : 'CATALOG'}
                          </span>

                          {archives.length > 1 && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (window.confirm(`Delete archive "${archive.title}"?`)) {
                                  deleteArchive(archive.id);
                                }
                              }}
                              style={{
                                background: 'transparent',
                                border: 'none',
                                color: 'var(--text-muted)',
                                cursor: 'pointer',
                                padding: '2px',
                                display: 'flex',
                                alignItems: 'center',
                              }}
                              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--status-live)')}
                              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
                              title="Delete Archive"
                            >
                              <Trash2 size={11} />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Title / Inline Rename */}
                      {isEditing ? (
                        <form
                          onSubmit={(e) => handleSaveRename(archive.id, e)}
                          onClick={(e) => e.stopPropagation()}
                          style={{ display: 'flex', gap: '4px', marginBottom: '8px' }}
                        >
                          <input
                            type="text"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            autoFocus
                            style={{
                              flex: 1,
                              background: 'var(--bg-primary)',
                              border: '1px solid var(--accent-color)',
                              color: 'var(--text-primary)',
                              fontFamily: 'var(--font-display)',
                              fontSize: '18px',
                              padding: '2px 6px',
                              outline: 'none',
                            }}
                          />
                          <button
                            type="submit"
                            style={{
                              background: 'var(--accent-color)',
                              border: 'none',
                              color: 'var(--text-inverse)',
                              padding: '0 6px',
                              cursor: 'pointer',
                            }}
                          >
                            <Check size={12} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingId(null)}
                            style={{
                              background: 'transparent',
                              border: '1px solid var(--border-bright)',
                              color: 'var(--text-secondary)',
                              padding: '0 6px',
                              cursor: 'pointer',
                            }}
                          >
                            <X size={12} />
                          </button>
                        </form>
                      ) : (
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginBottom: '6px',
                          }}
                        >
                          <h2
                            style={{
                              fontFamily: 'var(--font-display)',
                              fontSize: '22px',
                              letterSpacing: '0.04em',
                              margin: 0,
                              color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                              lineHeight: 1.1,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {archive.title}
                          </h2>
                          <button
                            onClick={(e) => handleStartRename(archive.id, archive.title, e)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: 'var(--text-muted)',
                              cursor: 'pointer',
                              padding: '2px 4px',
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
                            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
                            title="Rename Collection"
                          >
                            <Edit2 size={10} />
                          </button>
                        </div>
                      )}

                      {/* Track count & duration */}
                      <div
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '8.5px',
                          color: 'var(--text-muted)',
                          marginBottom: '10px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>
                          {archive.tracks.length} TRACKS
                        </span>
                        <span>&bull;</span>
                        <span>{formatArchiveDuration(archive)}</span>
                      </div>

                      {/* Snippet track preview */}
                      <div
                        style={{
                          borderTop: '1px solid var(--border-subtle)',
                          paddingTop: '8px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '3px',
                          fontFamily: 'var(--font-mono)',
                          fontSize: '8px',
                          color: 'var(--text-muted)',
                          marginBottom: '12px',
                        }}
                      >
                        {trackSnippet.map((t, tIdx) => (
                          <div
                            key={t.id}
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {tIdx + 1}. {t.title}
                            </span>
                            <span style={{ marginLeft: '4px', flexShrink: 0 }}>
                              {Math.floor(t.duration / 60)}:{(t.duration % 60).toString().padStart(2, '0')}
                            </span>
                          </div>
                        ))}
                        {archive.tracks.length > 3 && (
                          <div style={{ color: 'var(--text-muted)', fontSize: '7.5px' }}>
                            + {archive.tracks.length - 3} more tracks...
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Card Footer Actions */}
                    <div
                      style={{
                        display: 'flex',
                        gap: '5px',
                        borderTop: '1px solid var(--border-color)',
                        paddingTop: '8px',
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => {
                          setActiveArchive(archive);
                          playEntireArchive(archive, false);
                        }}
                        className="bma-btn"
                        style={{
                          flex: 1,
                          padding: '5px 8px',
                          fontSize: '8.5px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '4px',
                          background: isActive ? 'var(--accent-color)' : 'var(--bg-primary)',
                          color: isActive ? 'var(--text-inverse)' : 'var(--text-primary)',
                          border: isActive ? '1px solid var(--accent-color)' : '1px solid var(--border-color)',
                          fontWeight: 700,
                        }}
                        title="Play collection from beginning"
                      >
                        <Play size={9} fill="currentColor" /> PLAY
                      </button>

                      <button
                        onClick={() => {
                          setActiveArchive(archive);
                          playEntireArchive(archive, true);
                        }}
                        className="bma-btn"
                        style={{ padding: '5px 8px', fontSize: '8.5px' }}
                        title="Shuffle play collection"
                      >
                        <Shuffle size={10} />
                      </button>

                      <button
                        onClick={(e) => handleOpenInArchive(archive, e)}
                        className="bma-btn"
                        style={{ padding: '5px 8px', fontSize: '8.5px' }}
                        title="Open tracklist in 01 / ARCHIVE"
                      >
                        <ListMusic size={10} />
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openZipModal(archive);
                        }}
                        className="bma-btn"
                        style={{
                          padding: '5px 8px',
                          fontSize: '8.5px',
                          color: 'var(--accent-color)',
                          borderColor: 'var(--accent-color)',
                        }}
                        title="Download complete playlist package as .ZIP"
                      >
                        <Download size={10} />
                      </button>
                    </div>
                  </div>
                );
              })}

              {/* Plus Import Card */}
              <div
                onClick={() => setIsImporterOpen(true)}
                style={{
                  border: '1px dashed var(--border-bright)',
                  background: 'transparent',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  minHeight: '190px',
                  transition: 'all 0.15s ease',
                  fontFamily: 'var(--font-mono)',
                  textAlign: 'center',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--accent-color)';
                  e.currentTarget.style.background = 'var(--bg-secondary)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-bright)';
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    border: '1px solid var(--border-bright)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--accent-color)',
                  }}
                >
                  <Plus size={18} />
                </div>
                <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', color: 'var(--text-primary)' }}>
                  + INGEST NEW REPOSITORY
                </div>
                <div style={{ fontSize: '8px', color: 'var(--text-muted)', lineHeight: 1.4, maxWidth: '180px' }}>
                  Paste YouTube playlist, album link, or JSON archive
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
