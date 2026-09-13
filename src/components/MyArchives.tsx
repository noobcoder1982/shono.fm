import React, { useState } from 'react';
import { usePlayer } from '../context/PlayerContext';
import { Plus, Trash2, Edit2, Play, Shuffle } from 'lucide-react';

export const MyArchives: React.FC = () => {
  const {
    archives,
    activeArchive,
    setActiveArchive,
    playEntireArchive,
    deleteArchive,
    setActiveTab,
  } = usePlayer();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

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

  return (
    <div
      style={{
        padding: '8px 16px',
        borderTop: '1px solid var(--border-color)',
        background: 'var(--bg-primary)',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
      }}
    >
      {/* Title / Click to open COLLECTIONS tab */}
      <div
        onClick={() => setActiveTab('COLLECTIONS')}
        role="button"
        tabIndex={0}
        title="Open Collections Vault (03 / COLLECTIONS)"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          fontFamily: 'var(--font-mono)',
          fontSize: '9px',
          letterSpacing: '0.14em',
          color: 'var(--text-secondary)',
          marginBottom: '6px',
          cursor: 'pointer',
          width: 'fit-content',
          transition: 'color 0.15s ease',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
        onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
      >
        <span>MY ARCHIVES</span>
        <span>→</span>
      </div>

      {/* Archives Horizontal List / Grid */}
      <div
        style={{
          display: 'flex',
          gap: '10px',
          overflowX: 'auto',
          paddingBottom: '4px',
        }}
      >
        {archives.length === 0 ? (
          <div
            style={{
              padding: '8px 10px',
              fontFamily: 'var(--font-mono)',
              fontSize: '8px',
              color: 'var(--text-muted)',
              letterSpacing: '0.08em',
              border: '1px dashed var(--border-color)',
              background: 'var(--bg-secondary)',
              width: '100%',
            }}
          >
            NO ARCHIVES SAVED // INGEST A PLAYLIST ABOVE TO POPULATE VAULT
          </div>
        ) : (
          archives.map((archive) => {
          const isActive = activeArchive?.id === archive.id;
          const isEditing = editingId === archive.id;

          return (
            <div
              key={archive.id}
              onClick={() => setActiveArchive(archive)}
              style={{
                minWidth: '140px',
                padding: '8px 10px',
                background: isActive ? 'var(--bg-secondary)' : 'transparent',
                border: isActive ? '1px solid var(--text-primary)' : '1px solid var(--border-color)',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.borderColor = 'var(--border-bright)';
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.borderColor = 'var(--border-color)';
              }}
            >
              <div>
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '8.5px',
                    color: 'var(--text-muted)',
                    marginBottom: '2px',
                  }}
                >
                  {archive.indexNumber}
                </div>

                {isEditing ? (
                  <form onSubmit={(e) => handleSaveRename(archive.id, e)} onClick={(e) => e.stopPropagation()}>
                    <input
                      type="text"
                      className="bma-input"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      autoFocus
                      onBlur={() => setEditingId(null)}
                      style={{
                        width: '100%',
                        fontSize: '10px',
                        padding: '2px 4px',
                        marginBottom: '4px',
                      }}
                    />
                  </form>
                ) : (
                  <div
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '15px',
                      lineHeight: 1.1,
                      letterSpacing: '0.04em',
                      color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                      marginBottom: '4px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {archive.title}
                  </div>
                )}
              </div>

              <div>
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '8.5px',
                    color: 'var(--text-muted)',
                    lineHeight: 1.3,
                  }}
                >
                  <div>{archive.tracks.length} TRACKS</div>
                  <div>{archive.totalDurationFormatted}</div>
                </div>

                {/* Quick actions hover bar */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    marginTop: '6px',
                    paddingTop: '4px',
                    borderTop: '1px solid var(--border-subtle)',
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    className="bma-btn-icon"
                    onClick={() => playEntireArchive(archive, false)}
                    title="Play archive"
                    style={{ padding: '2px' }}
                  >
                    <Play size={10} fill="currentColor" />
                  </button>
                  <button
                    className="bma-btn-icon"
                    onClick={() => playEntireArchive(archive, true)}
                    title="Shuffle archive"
                    style={{ padding: '2px' }}
                  >
                    <Shuffle size={10} />
                  </button>
                  <button
                    className="bma-btn-icon"
                    onClick={(e) => handleStartRename(archive.id, archive.title, e)}
                    title="Rename"
                    style={{ padding: '2px' }}
                  >
                    <Edit2 size={10} />
                  </button>
                  {archives.length > 1 && (
                    <button
                      className="bma-btn-icon"
                      onClick={() => deleteArchive(archive.id)}
                      title="Delete archive"
                      style={{ padding: '2px', marginLeft: 'auto' }}
                    >
                      <Trash2 size={10} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        }))}

        {/* Import New Playlist Slot */}
        <div
          onClick={() => {
            const input = document.querySelector('.bma-input') as HTMLInputElement | null;
            if (input) input.focus();
          }}
          style={{
            minWidth: '130px',
            border: '1px dashed var(--border-bright)',
            padding: '8px 10px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            textAlign: 'center',
            transition: 'border-color 0.15s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--text-primary)')}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border-bright)')}
        >
          <Plus size={14} color="var(--text-secondary)" style={{ marginBottom: '4px' }} />
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '8px',
              letterSpacing: '0.1em',
              color: 'var(--text-secondary)',
              lineHeight: 1.3,
              textTransform: 'uppercase',
            }}
          >
            + IMPORT NEW<br />PLAYLIST
          </div>
        </div>
      </div>
    </div>
  );
};
