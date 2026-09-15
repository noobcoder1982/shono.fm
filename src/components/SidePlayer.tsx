import React, { useState, useEffect, useRef } from 'react';
import { usePlayer } from '../context/PlayerContext';
import { AppleLyrics } from './AppleLyrics';
import { MasterWaveform } from './MasterWaveform';
import { useArtwork } from '../services/artworkService';
import {
  MoreVertical,
  Maximize2,
  Disc,
  Trash2,
  ChevronUp,
  ChevronDown,
  RotateCcw,
} from 'lucide-react';

type SidePlayerTab = 'LYRICS' | 'LIVE' | 'QUEUE';

export const SidePlayer: React.FC = () => {
  const {
    currentTrack,
    playbackStatus,
    currentTime,
    duration,
    seek,
    openTrackDetail,
    toggleFullscreenPlayer,
    queue,
    clearQueue,
    removeFromQueue,
    playTrack,
    reorderQueue,
    theme,
  } = usePlayer();

  const { artworkUrl, isYouTube } = useArtwork(currentTrack);

  const isAppleGlass = Boolean(theme && theme.startsWith('apple-glass'));

  const [activeTab, setActiveTab] = useState<SidePlayerTab>('LYRICS');

  // Live playback head tracking & Jump to Live control
  const [isLivePosition, setIsLivePosition] = useState<boolean>(true);
  const liveHeadRef = useRef<number>(currentTime);
  const prevTimeRef = useRef<number>(currentTime);
  const lastWallClockRef = useRef<number>(performance.now());
  const trackIdRef = useRef<string | null>(currentTrack ? currentTrack.id : null);

  const isPlaying = playbackStatus === 'PLAYING';

  // Track playback time to detect external seeks or natural progression
  useEffect(() => {
    // Reset live state when track changes
    if (currentTrack?.id !== trackIdRef.current) {
      trackIdRef.current = currentTrack ? currentTrack.id : null;
      liveHeadRef.current = currentTime;
      prevTimeRef.current = currentTime;
      lastWallClockRef.current = performance.now();
      setIsLivePosition(true);
      return;
    }

    const now = performance.now();
    const dt = (now - lastWallClockRef.current) / 1000;
    lastWallClockRef.current = now;

    const expectedDelta = isPlaying ? dt : 0;
    const actualDelta = currentTime - prevTimeRef.current;
    const timeJump = Math.abs(actualDelta - expectedDelta);

    // Noticeable jump outside standard linear playback (scrub / seek)
    if (timeJump > 1.2) {
      if (isLivePosition) {
        liveHeadRef.current = prevTimeRef.current;
        setIsLivePosition(false);
      } else {
        if (Math.abs(currentTime - liveHeadRef.current) <= 1.2) {
          setIsLivePosition(true);
        }
      }
    } else {
      if (isLivePosition) {
        liveHeadRef.current = currentTime;
      } else {
        if (isPlaying && dt > 0 && dt < 2) {
          liveHeadRef.current = Math.min(duration || Infinity, liveHeadRef.current + dt);
        }
        if (currentTime >= liveHeadRef.current - 0.5) {
          setIsLivePosition(true);
        }
      }
    }

    prevTimeRef.current = currentTime;
  }, [currentTime, isPlaying, duration, currentTrack?.id, isLivePosition]);

  const handleSeek = (targetTime: number) => {
    if (isLivePosition) {
      if (Math.abs(targetTime - currentTime) > 1.0) {
        liveHeadRef.current = currentTime;
        setIsLivePosition(false);
      }
    } else {
      if (Math.abs(targetTime - liveHeadRef.current) <= 1.0) {
        setIsLivePosition(true);
      }
    }
    prevTimeRef.current = targetTime;
    seek(targetTime);
  };

  const handleJumpToLive = () => {
    if (!isLivePosition) {
      const target = Math.min(duration || Infinity, Math.max(0, liveHeadRef.current));
      prevTimeRef.current = target;
      seek(target);
      setIsLivePosition(true);
    }
    if (activeTab !== 'LIVE') {
      setActiveTab('LIVE');
    }
  };



  const handleMoveUp = (idx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (idx === 0) return;
    const copy = [...queue];
    const temp = copy[idx - 1];
    copy[idx - 1] = copy[idx];
    copy[idx] = temp;
    reorderQueue(copy);
  };

  const handleMoveDown = (idx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (idx === queue.length - 1) return;
    const copy = [...queue];
    const temp = copy[idx + 1];
    copy[idx + 1] = copy[idx];
    copy[idx] = temp;
    reorderQueue(copy);
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

          {/* TAB 2: LIVE MASTER WAVEFORM & AUDIO VISUALIZER */}
          {activeTab === 'LIVE' && (
            <div
              style={{
                height: '100%',
                padding: '24px 20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                gap: '16px',
              }}
            >
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--text-muted)', textAlign: 'center' }}>
                REAL-TIME SPECTRAL ANALYSIS & WAVEFORM
              </div>
              <MasterWaveform
                track={currentTrack}
                currentTime={currentTime}
                duration={duration}
                isPlaying={isPlaying}
                onSeek={handleSeek}
                height={55}
                compact={false}
                showTimeLabels={true}
              />
            </div>
          )}

          {/* TAB 3: QUEUE LIST */}
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
                  return (
                    <div
                      key={`${track.id}-${idx}`}
                      onClick={() => playTrack(track)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '7px 18px',
                        borderBottom: '1px solid var(--border-subtle)',
                        background: isCurrent ? 'var(--bg-tertiary)' : 'transparent',
                        cursor: 'pointer',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '9.5px',
                        transition: 'background 0.12s ease',
                      }}
                      onMouseEnter={(e) => {
                        if (!isCurrent) e.currentTarget.style.background = 'var(--bg-hover)';
                      }}
                      onMouseLeave={(e) => {
                        if (!isCurrent) e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flex: 1 }}>
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
                          onClick={(e) => handleMoveUp(idx, e)}
                          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '2px' }}
                          title="Move up"
                        >
                          <ChevronUp size={11} />
                        </button>
                        <button
                          onClick={(e) => handleMoveDown(idx, e)}
                          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '2px' }}
                          title="Move down"
                        >
                          <ChevronDown size={11} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFromQueue(track.id);
                          }}
                          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '2px' }}
                          title="Remove"
                        >
                          <Trash2 size={11} />
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
                padding: '6px 14px',
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
              onClick={handleJumpToLive}
              style={{
                padding: '6px 14px',
                borderRadius: '999px',
                border: 'none',
                background: activeTab === 'LIVE' ? 'var(--glass-bg-active)' : 'transparent',
                color: activeTab === 'LIVE' ? 'var(--text-primary)' : 'var(--text-muted)',
                fontFamily: 'var(--font-sans)',
                fontSize: '12px',
                fontWeight: activeTab === 'LIVE' ? 600 : 500,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              Waveform
            </button>
            <button
              onClick={() => setActiveTab('QUEUE')}
              style={{
                padding: '6px 14px',
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
          {/* Left: LYRICS tab (Image 1 reference) */}
          <button
            onClick={() => setActiveTab('LYRICS')}
            style={{
              background: 'transparent',
              border: 'none',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              color: activeTab === 'LYRICS' ? 'var(--accent-color)' : 'var(--text-muted)',
              cursor: 'pointer',
              padding: '4px 8px',
              transition: 'all 0.15s ease',
            }}
            title="Lyrics View"
          >
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '17px' }}>
              <span style={{ fontSize: '15px', lineHeight: 1 }}>💬</span>
            </div>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '8px',
                fontWeight: 700,
                letterSpacing: '0.14em',
              }}
            >
              LYRICS
            </span>
          </button>

          {/* Center: LIVE Audio Visualizer Pill / Jump to Live Control */}
          <button
            onClick={handleJumpToLive}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'var(--accent-subtle)',
              border: '1px solid var(--accent-color)',
              borderRadius: '20px',
              padding: '6px 18px',
              color: 'var(--accent-color)',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              fontFamily: 'var(--font-mono)',
              fontSize: '9.5px',
              fontWeight: 700,
              letterSpacing: '0.12em',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(212, 175, 55, 0.16)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--accent-subtle)';
            }}
            title="Jump to Live Position"
            aria-label="Jump to Live Position"
          >
            {isLivePosition ? (
              /* Tiny 4-bar waveform icon reacting subtly to playback */
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'flex-end',
                  gap: '2px',
                  height: '12px',
                  width: '14px',
                  justifyContent: 'center',
                }}
              >
                <span
                  style={{
                    width: '2px',
                    height: isPlaying ? '9px' : '4px',
                    background: 'currentColor',
                    borderRadius: '1px',
                    animation: isPlaying ? 'liveEq1 0.75s ease-in-out infinite alternate' : 'none',
                  }}
                />
                <span
                  style={{
                    width: '2px',
                    height: isPlaying ? '12px' : '8px',
                    background: 'currentColor',
                    borderRadius: '1px',
                    animation: isPlaying ? 'liveEq2 0.65s ease-in-out infinite alternate' : 'none',
                  }}
                />
                <span
                  style={{
                    width: '2px',
                    height: isPlaying ? '11px' : '5px',
                    background: 'currentColor',
                    borderRadius: '1px',
                    animation: isPlaying ? 'liveEq3 0.85s ease-in-out infinite alternate' : 'none',
                  }}
                />
                <span
                  style={{
                    width: '2px',
                    height: isPlaying ? '8px' : '3px',
                    background: 'currentColor',
                    borderRadius: '1px',
                    animation: isPlaying ? 'liveEq4 0.7s ease-in-out infinite alternate' : 'none',
                  }}
                />
              </span>
            ) : (
              /* Jump to live return icon */
              <RotateCcw
                size={11}
                strokeWidth={2.4}
                style={{
                  display: 'block',
                  flexShrink: 0,
                }}
              />
            )}
            <span>LIVE</span>
          </button>

          {/* Right: QUEUE tab (Image 1 reference) */}
          <button
            onClick={() => setActiveTab('QUEUE')}
            style={{
              background: 'transparent',
              border: 'none',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              color: activeTab === 'QUEUE' ? 'var(--accent-color)' : 'var(--text-muted)',
              cursor: 'pointer',
              padding: '4px 8px',
              transition: 'all 0.15s ease',
            }}
            title={`Queue (${queue.length})`}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5px', width: '15px', padding: '3px 0' }}>
              <span style={{ height: '1.5px', background: 'currentColor', borderRadius: '1px', width: '100%' }} />
              <span style={{ height: '1.5px', background: 'currentColor', borderRadius: '1px', width: '100%' }} />
              <span style={{ height: '1.5px', background: 'currentColor', borderRadius: '1px', width: '100%' }} />
            </div>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '8px',
                fontWeight: 700,
                letterSpacing: '0.14em',
              }}
            >
              QUEUE
            </span>
          </button>
        </div>
      )}
    </div>
  );
};
