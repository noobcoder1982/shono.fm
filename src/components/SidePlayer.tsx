import React, { useState } from 'react';
import { usePlayer } from '../context/PlayerContext';
import { AppleLyrics } from './AppleLyrics';
import { useArtwork } from '../services/artworkService';
import { WindowControls } from './WindowControls';
import {
  MoreVertical,
  Maximize2,
  Disc,
  Trash2,
  GripVertical,
  ListMusic,
} from 'lucide-react';

export const SidePlayer: React.FC = () => {
  const {
    currentTrack,
    playbackStatus: _playbackStatus,
    seek,
    openTrackDetail,
    toggleFullscreenPlayer,
    queue,
    clearQueue,
    removeFromQueue,
    playTrack,
    reorderQueue,
    theme,
    sidePlayerTab,
    setSidePlayerTab,
  } = usePlayer();

  const { artworkUrl, isYouTube } = useArtwork(currentTrack);

  const isAppleGlass = Boolean(theme && theme.startsWith('apple-glass'));

  const activeTab = sidePlayerTab;
  const setActiveTab = setSidePlayerTab;

  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);

  const handleSeek = (targetTime: number) => {
    seek(targetTime);
  };

  const handleDrop = (targetIdx: number) => {
    if (draggedIdx === null || draggedIdx === targetIdx) {
      setDraggedIdx(null);
      setDragOverIdx(null);
      return;
    }
    const copy = [...queue];
    const [draggedItem] = copy.splice(draggedIdx, 1);
    copy.splice(targetIdx, 0, draggedItem);
    reorderQueue(copy);
    setDraggedIdx(null);
    setDragOverIdx(null);
  };

  if (!currentTrack) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          background: 'var(--bg-secondary)',
          color: 'var(--text-muted)',
          fontFamily: 'var(--font-mono)',
          padding: '24px 20px',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '3px', height: '14px', background: 'var(--accent-color)' }} />
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', color: 'var(--text-primary)' }}>
              SHONO.FM
            </div>
            <div style={{ fontSize: '8.5px', color: 'var(--text-secondary)', letterSpacing: '0.14em' }}>
              NOW PLAYING
            </div>
          </div>
        </div>

        <div
          style={{
            border: '1px dashed var(--border-color)',
            padding: '36px 20px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px',
            background: 'var(--bg-primary)',
          }}
        >
          <Disc size={32} opacity={0.3} />
          <div style={{ fontSize: '10px', letterSpacing: '0.1em', color: 'var(--text-secondary)' }}>
            NO AUDIO STREAM LOADED
          </div>
          <div style={{ fontSize: '8.5px', color: 'var(--text-muted)', maxWidth: '200px' }}>
            Select a track from the archive or import a playlist to begin playback.
          </div>
        </div>

        <div style={{ textAlign: 'center', fontSize: '8px', letterSpacing: '0.15em', color: 'var(--text-muted)' }}>
          PRECISION AUDIO ENGINE • 48KHZ
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minHeight: 0,
        background: 'var(--bg-secondary)',
        overflow: 'hidden',
        position: 'relative',
        userSelect: 'none',
        borderLeft: '1px solid var(--border-color)',
        transition: 'background-color 0.2s ease',
      }}
    >
      <style>{`
        @keyframes liveEq1 {
          0%, 100% { height: 4px; }
          50% { height: 9px; }
        }
        @keyframes liveEq2 {
          0%, 100% { height: 12px; }
          50% { height: 6px; }
        }
        @keyframes liveEq3 {
          0%, 100% { height: 5px; }
          50% { height: 11px; }
        }
        @keyframes liveEq4 {
          0%, 100% { height: 8px; }
          50% { height: 3px; }
        }
      `}</style>
      {/* 1. TOP HEADER */}
      {isAppleGlass ? (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '16px 20px 8px 20px',
            flexShrink: 0,
          }}
        >
          <div
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '15px',
              fontWeight: 600,
              color: 'var(--text-secondary)',
            }}
          >
            Now Playing
          </div>

          <button
            onClick={() => openTrackDetail(currentTrack)}
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid var(--glass-border)',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s ease',
            }}
            title="Open Track Dossier & Specifications"
          >
            <MoreVertical size={15} />
          </button>
        </div>
      ) : (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '14px 20px 10px 20px',
            flexShrink: 0,
            borderBottom: '1px solid var(--border-subtle)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '3px', height: '15px', background: 'var(--accent-color)', borderRadius: '1px' }} />
            <div>
              <div
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '15px',
                  letterSpacing: '0.08em',
                  lineHeight: 1,
                  color: 'var(--text-primary)',
                }}
              >
                SHONO<span style={{ color: 'var(--text-muted)' }}>.FM</span>
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '8px',
                  letterSpacing: '0.15em',
                  color: 'var(--text-secondary)',
                  marginTop: '1px',
                }}
              >
                NOW PLAYING
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            {/* Fullscreen Player Mode Button */}
            <button
              onClick={toggleFullscreenPlayer}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'color 0.15s ease',
              }}
              title="Open Fullscreen Now Playing & Live Lyrics (F)"
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent-color)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
            >
              <Maximize2 size={15} />
            </button>

            {/* Dossier Details Button */}
            <button
              onClick={() => openTrackDetail(currentTrack)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'color 0.15s ease',
              }}
              title="Open Track Dossier & Specifications"
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
            >
              <MoreVertical size={16} />
            </button>

            {/* Subtle Divider & Window Controls */}
            <div style={{ width: '1px', height: '14px', background: 'var(--border-subtle)', margin: '0 4px' }} />
            <WindowControls />
          </div>
        </div>
      )}

      {/* 2. ALBUM ARTWORK CONTAINER */}
      {isAppleGlass ? (
        <div
          style={{
            padding: '10px 22px 14px 22px',
            flexShrink: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <div
            className="sideplayer-art-card"
            onClick={() => openTrackDetail(currentTrack)}
            style={{
              width: '100%',
              maxWidth: '250px',
              aspectRatio: '1 / 1',
              borderRadius: '26px',
              overflow: 'hidden',
              border: 'none',
              background: '#000',
              position: 'relative',
              cursor: 'pointer',
              boxShadow: '0 24px 50px var(--ambient-color-1, rgba(0,0,0,0.5)), 0 6px 18px rgba(0,0,0,0.3)',
              transition: 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
            title="Click to view full dossier"
          >
            <img
              src={artworkUrl || '/assets/now_playing_art.jpg'}
              alt={currentTrack.title}
              className={`square-artwork-img ${isYouTube ? 'is-yt-fallback' : ''}`}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block',
                borderRadius: '26px',
                filter: 'none',
              }}
            />
          </div>

          {/* Song Title & Artist Metadata directly below artwork */}
          <div style={{ textAlign: 'center', marginTop: '12px', width: '100%', padding: '0 8px' }}>
            <div
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '17px',
                fontWeight: 700,
                letterSpacing: '-0.015em',
                color: 'var(--text-primary)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {currentTrack.title}
            </div>
            <div
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '12.5px',
                color: 'var(--text-secondary)',
                marginTop: '2px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {currentTrack.artist} • {currentTrack.album}
            </div>
          </div>
        </div>
      ) : (
        <div
          style={{
            padding: '12px 20px 14px 20px',
            flexShrink: 0,
            borderBottom: '1px solid var(--border-color)',
            background: 'var(--bg-secondary)',
          }}
        >
          <div
            className="square-artwork-container"
            onClick={() => openTrackDetail(currentTrack)}
            style={{
              width: '100%',
              aspectRatio: '1 / 1',
              maxHeight: '260px',
              borderRadius: '8px',
              overflow: 'hidden',
              border: '1px solid var(--border-color)',
              background: '#000',
              position: 'relative',
              cursor: 'pointer',
              boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
              margin: '0 auto',
            }}
            title="Click to view full dossier"
          >
            <img
              src={artworkUrl || '/assets/now_playing_art.jpg'}
              alt={currentTrack.title}
              className={`square-artwork-img ${isYouTube ? 'is-yt-fallback' : ''}`}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block',
                transition: 'transform 0.4s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.02)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            />
          </div>
        </div>
      )}

      {/* 3. DYNAMIC EXPANDED LOWER SECTION (LYRICS / LIVE / QUEUE) */}
      <div
        style={{
          flex: 1,
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          background: 'var(--bg-primary)',
          position: 'relative',
        }}
      >

        {/* View Content Area */}
        <div style={{ flex: 1, minHeight: 0, overflow: 'hidden', position: 'relative' }}>
          {/* TAB 1: APPLE MUSIC TIME-SYNCED LYRICS */}
          {activeTab === 'LYRICS' && <AppleLyrics compact={true} onSeek={handleSeek} />}

          {/* TAB 2: QUEUE LIST */}
          {activeTab === 'QUEUE' && (
            <div style={{ height: '100%', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '10px 18px 8px 18px',
                  borderBottom: '1px solid var(--border-subtle)',
                  background: 'var(--bg-secondary)',
                  flexShrink: 0,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '9.5px',
                      fontWeight: 700,
                      letterSpacing: '0.12em',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    QUEUE ({queue.length})
                  </span>
                  {queue.length > 1 && (
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '7.5px',
                        color: 'var(--text-muted)',
                        letterSpacing: '0.08em',
                        background: 'rgba(255, 255, 255, 0.05)',
                        padding: '1px 5px',
                        borderRadius: '3px',
                      }}
                    >
                      DRAG TO REORDER
                    </span>
                  )}
                </div>
                {queue.length > 0 && (
                  <button
                    onClick={clearQueue}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-muted)',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '8.5px',
                      letterSpacing: '0.1em',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--status-live)')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
                  >
                    CLEAR
                  </button>
                )}
              </div>
              <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '6px 0' }}>
              {queue.length === 0 ? (
                <div
                  style={{
                    padding: '30px 20px',
                    textAlign: 'center',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '9px',
                    color: 'var(--text-muted)',
                  }}
                >
                  QUEUE IS EMPTY
                </div>
              ) : (
                queue.map((track, idx) => {
                  const isCurrent = track.id === currentTrack.id;
                  const isDragged = draggedIdx === idx;
                  const isOver = dragOverIdx === idx;
                  const isDropAbove = isOver && draggedIdx !== null && draggedIdx > idx;
                  const isDropBelow = isOver && draggedIdx !== null && draggedIdx < idx;

                  return (
                    <div
                      key={`${track.id}-${idx}`}
                      draggable={true}
                      onDragStart={(e) => {
                        e.dataTransfer.effectAllowed = 'move';
                        setDraggedIdx(idx);
                      }}
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.dataTransfer.dropEffect = 'move';
                        if (dragOverIdx !== idx) setDragOverIdx(idx);
                      }}
                      onDragLeave={() => {
                        setDragOverIdx((prev) => (prev === idx ? null : prev));
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        handleDrop(idx);
                      }}
                      onDragEnd={() => {
                        setDraggedIdx(null);
                        setDragOverIdx(null);
                      }}
                      onClick={() => playTrack(track)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '7px 18px',
                        borderBottom: isDropBelow ? '2px solid var(--accent-color)' : '1px solid var(--border-subtle)',
                        borderTop: isDropAbove ? '2px solid var(--accent-color)' : 'none',
                        background: isCurrent
                          ? 'var(--bg-tertiary)'
                          : isOver
                          ? 'var(--bg-hover)'
                          : 'transparent',
                        opacity: isDragged ? 0.35 : 1,
                        cursor: 'pointer',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '9.5px',
                        transition: 'background 0.12s ease, opacity 0.12s ease',
                      }}
                      onMouseEnter={(e) => {
                        if (!isCurrent && !isDragged) e.currentTarget.style.background = 'var(--bg-hover)';
                      }}
                      onMouseLeave={(e) => {
                        if (!isCurrent && !isDragged && !isOver) e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flex: 1 }}>
                        {/* Tactile Drag Handle */}
                        <div
                          style={{
                            cursor: 'grab',
                            display: 'flex',
                            alignItems: 'center',
                            color: isDragged ? 'var(--accent-color)' : 'var(--text-muted)',
                            opacity: 0.6,
                            padding: '2px 0',
                            flexShrink: 0,
                          }}
                          title="Drag up or down to reorder songs"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <GripVertical size={13} />
                        </div>

                        <span style={{ color: isCurrent ? 'var(--accent-color)' : 'var(--text-muted)', width: '16px', fontSize: '8px' }}>
                          {(idx + 1).toString().padStart(2, '0')}
                        </span>
                        <div style={{ minWidth: 0 }}>
                          <div
                            style={{
                              color: isCurrent ? 'var(--accent-color)' : 'var(--text-primary)',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              fontWeight: isCurrent ? 600 : 400,
                            }}
                          >
                            {track.title}
                          </div>
                          <div style={{ fontSize: '8px', color: 'var(--text-muted)' }}>{track.artist}</div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFromQueue(track.id);
                          }}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--text-muted)',
                            cursor: 'pointer',
                            padding: '4px',
                            display: 'flex',
                            alignItems: 'center',
                          }}
                          title="Remove from queue"
                          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--status-live)')}
                          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
        </div>
      </div>

      {/* 4. BOTTOM DOCK */}
      {isAppleGlass ? (
        <div
          style={{
            padding: '12px 18px 14px 18px',
            background: 'transparent',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexShrink: 0,
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              background: 'rgba(255, 255, 255, 0.08)',
              backdropFilter: 'blur(20px)',
              border: '1px solid var(--glass-border)',
              borderRadius: '999px',
              padding: '3px',
              gap: '2px',
            }}
          >
            <button
              onClick={() => setActiveTab('LYRICS')}
              style={{
                padding: '6px 16px',
                borderRadius: '999px',
                border: 'none',
                background: activeTab === 'LYRICS' ? 'var(--glass-bg-active)' : 'transparent',
                color: activeTab === 'LYRICS' ? 'var(--text-primary)' : 'var(--text-muted)',
                fontFamily: 'var(--font-sans)',
                fontSize: '12px',
                fontWeight: activeTab === 'LYRICS' ? 600 : 500,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              Lyrics
            </button>
            <button
              onClick={() => setActiveTab('QUEUE')}
              style={{
                padding: '6px 16px',
                borderRadius: '999px',
                border: 'none',
                background: activeTab === 'QUEUE' ? 'var(--glass-bg-active)' : 'transparent',
                color: activeTab === 'QUEUE' ? 'var(--text-primary)' : 'var(--text-muted)',
                fontFamily: 'var(--font-sans)',
                fontSize: '12px',
                fontWeight: activeTab === 'QUEUE' ? 600 : 500,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              Queue {queue.length > 0 ? `(${queue.length})` : ''}
            </button>
          </div>
        </div>
      ) : (
        <div
          style={{
            padding: '10px 24px 12px 24px',
            borderTop: '1px solid var(--border-color)',
            background: 'var(--bg-secondary)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexShrink: 0,
          }}
        >
          {/* Left: LYRICS tab */}
          <button
            onClick={() => setActiveTab('LYRICS')}
            style={{
              background: 'transparent',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: activeTab === 'LYRICS' ? 'var(--accent-color)' : 'var(--text-muted)',
              cursor: 'pointer',
              padding: '6px 12px',
              borderRadius: '4px',
              transition: 'all 0.15s ease',
            }}
            title="Lyrics View"
          >
            <span style={{ fontSize: '14px', lineHeight: 1 }}>💬</span>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '10px',
                fontWeight: 700,
                letterSpacing: '0.12em',
              }}
            >
              LYRICS
            </span>
          </button>

          {/* Right: QUEUE tab */}
          <button
            onClick={() => setActiveTab('QUEUE')}
            style={{
              background: 'transparent',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: activeTab === 'QUEUE' ? 'var(--accent-color)' : 'var(--text-muted)',
              cursor: 'pointer',
              padding: '6px 12px',
              borderRadius: '4px',
              transition: 'all 0.15s ease',
            }}
            title={`Queue (${queue.length})`}
          >
            <ListMusic size={15} />
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '10px',
                fontWeight: 700,
                letterSpacing: '0.12em',
              }}
            >
              QUEUE {queue.length > 0 ? `[${queue.length.toString().padStart(2, '0')}]` : ''}
            </span>
          </button>
        </div>
      )}
    </div>
  );
};
