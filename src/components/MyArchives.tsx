import React, { useState, useRef } from 'react';
import { usePlayer } from '../context/PlayerContext';
import {
  Plus,
  Play,
  X,
  Search as SearchIcon,
  Radio,
  ArrowRight,
} from 'lucide-react';

export const MyArchives: React.FC = () => {
  const {
    archives,
    activeArchive,
    setActiveArchive,
    playEntireArchive,
    deleteArchive,
    setActiveTab,
    setIsSearchOpen,
    currentTrack,
    playbackStatus,
  } = usePlayer();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const tabListRef = useRef<HTMLDivElement>(null);

  const isPlaying = playbackStatus === 'PLAYING';

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

  const handleNewTabClick = () => {
    // Focus and scroll to the playlist importer input at top of page
    const input = document.querySelector('input.bma-input') as HTMLInputElement | null;
    if (input) {
      input.focus();
      input.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleDeleteTab = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (archives.length > 1) {
      deleteArchive(id);
    }
  };

  return (
    <nav className="chrome-tab-strip" aria-label="Archive Vault Tabs">
      {/* Scrollable Chrome Tab Bar */}
      <div ref={tabListRef} className="chrome-tab-list">
        {archives.map((archive) => {
          const isActive = activeArchive?.id === archive.id;
          const isArchivePlaying =
            currentTrack &&
            archive.tracks.some((t) => t.id === currentTrack.id) &&
            isPlaying;
          const isEditing = editingId === archive.id;

          return (
            <div
              key={archive.id}
              className={`chrome-tab-item ${isActive ? 'is-active' : ''}`}
              onClick={() => setActiveArchive(archive)}
              onDoubleClick={(e) => handleStartRename(archive.id, archive.title, e)}
              title={`${archive.title} (${archive.tracks.length} tracks) • Double-click to rename`}
            >
              {/* Tab Icon / Playing wave / Index */}
              {isArchivePlaying ? (
                <Radio size={12} color="#38bdf8" style={{ animation: 'pulse 1.5s infinite', flexShrink: 0 }} />
              ) : (
                <span className="chrome-tab-index">[{archive.indexNumber}]</span>
              )}

              {/* Title / Inline Rename Form */}
              {isEditing ? (
                <form
                  onSubmit={(e) => handleSaveRename(archive.id, e)}
                  onClick={(e) => e.stopPropagation()}
                  style={{ display: 'inline-flex', alignItems: 'center' }}
                >
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    autoFocus
                    onBlur={() => setEditingId(null)}
                    style={{
                      background: 'var(--bg-primary)',
                      color: 'var(--text-primary)',
                      border: '1px solid var(--accent-color)',
                      fontSize: '11px',
                      padding: '1px 4px',
                      fontFamily: 'inherit',
                      outline: 'none',
                      width: '120px',
                    }}
                  />
                </form>
              ) : (
                <span className="chrome-tab-title">{archive.title}</span>
              )}

              {/* Track Count Pill */}
              <span className="chrome-tab-count">{archive.tracks.length}</span>

              {/* Quick Hover Actions (Play & Close) */}
              <div className="chrome-tab-actions" onClick={(e) => e.stopPropagation()}>
                <button
                  className="chrome-tab-action-icon"
                  onClick={() => playEntireArchive(archive, false)}
                  title="Play entire archive"
                >
                  <Play size={9} fill="currentColor" />
                </button>
                {archives.length > 1 && (
                  <button
                    className="chrome-tab-action-icon"
                    onClick={(e) => handleDeleteTab(archive.id, e)}
                    title="Close / remove archive"
                  >
                    <X size={10} />
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {/* "+" New Tab Button (Chrome style) */}
        <button
          className="chrome-tab-new-btn"
          onClick={handleNewTabClick}
          title="Add / Ingest New Playlist Tab"
          aria-label="New tab"
        >
          <Plus size={14} />
        </button>
      </div>

      {/* Right-Side Utility Rail */}
      <div className="chrome-tab-rail-end">
        <button
          type="button"
          onClick={() => setIsSearchOpen(true)}
          className="chrome-tab-rail-btn"
          title="Global Spotlight Search (⌘K)"
        >
          <SearchIcon size={11} />
          <span>SEARCH</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('COLLECTIONS')}
          className="chrome-tab-rail-btn"
          title="Open Dedicated Repository Vault (03 / COLLECTIONS)"
          style={{
            borderColor: 'var(--border-bright)',
            color: 'var(--text-primary)',
            fontWeight: 600,
          }}
        >
          <span>COLLECTIONS [{archives.length.toString().padStart(2, '0')}]</span>
          <ArrowRight size={10} />
        </button>
      </div>
    </nav>
  );
};
