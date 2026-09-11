import React, { useState } from 'react';
import { usePlayer } from '../context/PlayerContext';
import { AppleLyrics } from './AppleLyrics';
import { MasterWaveform } from './MasterWaveform';
import {
  Shuffle,
  SkipBack,
  Play,
  Pause,
  SkipForward,
  Repeat,
  Repeat1,
  Heart,
  MoreVertical,
  Disc,
  Trash2,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';

type SidePlayerTab = 'LYRICS' | 'LIVE' | 'QUEUE';

export const SidePlayer: React.FC = () => {
  const {
    currentTrack,
    playbackStatus,
    currentTime,
    duration,
    togglePlayPause,
    playNext,
    playPrev,
    seek,
    isShuffle,
    toggleShuffle,
    repeatMode,
    cycleRepeat,
    openTrackDetail,
    likedTrackIds,
    toggleLike,
    queue,
    clearQueue,
    removeFromQueue,
    playTrack,
    reorderQueue,
  } = usePlayer();

  const [activeTab, setActiveTab] = useState<SidePlayerTab>('LYRICS');
  const [isScrubbing, setIsScrubbing] = useState<boolean>(false);
  const [scrubTime, setScrubTime] = useState<number>(0);

  const isPlaying = playbackStatus === 'PLAYING';
  const isLiked = currentTrack ? likedTrackIds.includes(currentTrack.id) : false;

  // Scrubber calculation
  const effectiveTime = isScrubbing ? scrubTime : currentTime;
  const progressRatio = duration > 0 ? Math.min(1, Math.max(0, effectiveTime / duration)) : 0;
  const progressPercent = (progressRatio * 100).toFixed(2);

  const handleScrubberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setScrubTime(val);
  };

  const handleScrubberStart = () => {
    setIsScrubbing(true);
  };

  const handleScrubberEnd = () => {
    seek(scrubTime);
    setIsScrubbing(false);
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
      {/* 1. TOP HEADER (Image 1 reference) */}
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

      {/* 2. FIXED PLAYER SECTION (Artwork, Track Info, Scrubber, Controls) */}
      <div
        style={{
          padding: '12px 20px 14px 20px',
          flexShrink: 0,
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
      >
        {/* Album Artwork Frame */}
        <div
          onClick={() => openTrackDetail(currentTrack)}
          style={{
            width: '100%',
            aspectRatio: '1 / 0.88',
            maxHeight: '190px',
            borderRadius: '6px',
            overflow: 'hidden',
            border: '1px solid var(--border-color)',
            background: '#000',
            position: 'relative',
            cursor: 'pointer',
            boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
          }}
          title="Click to view full dossier"
        >
          <img
            src={currentTrack.thumbnail || '/assets/now_playing_art.jpg'}
            alt={currentTrack.title}
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

        {/* Track Title & Artist Row with Heart Button */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ minWidth: 0, flex: 1, paddingRight: '12px' }}>
            <h2
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '18px',
                fontWeight: 700,
                color: 'var(--text-primary)',
                margin: 0,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                letterSpacing: '-0.01em',
              }}
            >
              {currentTrack.title}
            </h2>
            <div
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '12px',
                color: 'var(--text-secondary)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                marginTop: '2px',
              }}
            >
              {currentTrack.artist}
            </div>
          </div>

          {/* Heart / Favorite Button */}
          <button
            onClick={() => toggleLike(currentTrack.id)}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'transform 0.15s ease',
            }}
            title={isLiked ? 'Remove from Favourites' : 'Add to Favourites'}
            onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.88)')}
            onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          >
            <Heart
              size={18}
              fill={isLiked ? 'var(--accent-color)' : 'none'}
              color={isLiked ? 'var(--accent-color)' : 'var(--text-secondary)'}
            />
          </button>
        </div>

        {/* Scrubber Bar (Image 1 reference) */}
        <div>
          <div
            style={{
              position: 'relative',
              width: '100%',
              height: '5px',
              borderRadius: '2.5px',
              background: 'var(--bg-tertiary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {/* Active Progress Fill */}
            <div
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                bottom: 0,
                width: `${progressPercent}%`,
                background: 'var(--accent-color)',
                borderRadius: '2.5px',
              }}
            />
            {/* Scrubber Thumb */}
            <div
              style={{
                position: 'absolute',
                left: `calc(${progressPercent}% - 5px)`,
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                background: '#ffffff',
                boxShadow: '0 0 6px rgba(0,0,0,0.6)',
                pointerEvents: 'none',
              }}
            />
            {/* Invisible Range Input for Drag & Touch */}
            <input
              type="range"
              min={0}
              max={duration || 100}
              step={0.1}
              value={effectiveTime}
              onMouseDown={handleScrubberStart}
              onTouchStart={handleScrubberStart}
              onChange={handleScrubberChange}
              onMouseUp={handleScrubberEnd}
              onTouchEnd={handleScrubberEnd}
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                opacity: 0,
                cursor: 'pointer',
                margin: 0,
              }}
            />
          </div>

          {/* Time Readout Row */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontFamily: 'var(--font-mono)',
              fontSize: '9px',
              color: 'var(--text-secondary)',
              marginTop: '5px',
            }}
          >
            <span>{formatTime(effectiveTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Media Controls (Shuffle, Prev, Play/Pause Ring, Next, Repeat) */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 8px',
          }}
        >
          {/* Shuffle */}
          <button
            onClick={toggleShuffle}
            style={{
              background: 'transparent',
              border: 'none',
              color: isShuffle ? 'var(--accent-color)' : 'var(--text-secondary)',
              cursor: 'pointer',
              padding: '6px',
            }}
            title="Shuffle (S)"
          >
            <Shuffle size={15} />
          </button>

          {/* Previous */}
          <button
            onClick={playPrev}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              padding: '6px',
            }}
            title="Previous (P)"
          >
            <SkipBack size={18} />
          </button>

          {/* Center Play/Pause in Accent Ring */}
          <button
            onClick={togglePlayPause}
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              background: 'var(--bg-primary)',
              border: '1.5px solid var(--accent-color)',
              color: 'var(--accent-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: isPlaying ? '0 0 16px var(--accent-subtle)' : 'none',
              transition: 'transform 0.12s ease, box-shadow 0.2s ease',
            }}
            title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
            onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.92)')}
            onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          >
            {isPlaying ? <Pause size={18} /> : <Play size={18} style={{ marginLeft: '2px' }} />}
          </button>

          {/* Next */}
          <button
            onClick={playNext}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              padding: '6px',
            }}
            title="Next (N)"
          >
            <SkipForward size={18} />
          </button>

          {/* Repeat */}
          <button
            onClick={cycleRepeat}
            style={{
              background: 'transparent',
              border: 'none',
              color: repeatMode !== 'OFF' ? 'var(--accent-color)' : 'var(--text-secondary)',
              cursor: 'pointer',
              padding: '6px',
            }}
            title={`Repeat: ${repeatMode} (R)`}
          >
            {repeatMode === 'ONE' ? <Repeat1 size={15} /> : <Repeat size={15} />}
          </button>
        </div>
      </div>

      {/* 3. DYNAMIC LOWER SECTION (LYRICS / LIVE / QUEUE) */}
      <div
        style={{
          flex: 1,
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          background: 'var(--bg-primary)',
        }}
      >
        {/* Sub-Header for Active View */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '10px 20px 6px 20px',
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
              letterSpacing: '0.14em',
              color: 'var(--text-secondary)',
            }}
          >
            {activeTab === 'LYRICS' ? 'LYRICS' : activeTab === 'LIVE' ? 'LIVE AUDIO BUS' : `QUEUE (${queue.length})`}
          </span>

          {activeTab === 'LYRICS' && (
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '8.5px',
                color: 'var(--accent-color)',
                letterSpacing: '0.12em',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                fontWeight: 600,
              }}
            >
              <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'var(--accent-color)' }} />
              LIVE
            </span>
          )}

          {activeTab === 'QUEUE' && queue.length > 0 && (
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

        {/* View Content Area */}
        <div style={{ flex: 1, minHeight: 0, overflow: 'hidden', position: 'relative' }}>
          {/* TAB 1: APPLE MUSIC TIME-SYNCED LYRICS */}
          {activeTab === 'LYRICS' && <AppleLyrics compact={true} onSeek={seek} />}

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
                onSeek={seek}
                height={55}
                compact={false}
                showTimeLabels={true}
              />
            </div>
          )}

          {/* TAB 3: QUEUE LIST */}
          {activeTab === 'QUEUE' && (
            <div style={{ height: '100%', overflowY: 'auto', padding: '6px 0' }}>
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
          )}
        </div>
      </div>

      {/* 4. BOTTOM DOCK (Image 1 reference) */}
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

        {/* Center: LIVE Audio Visualizer Pill (Image 1 reference) */}
        <button
          onClick={() => setActiveTab('LIVE')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: activeTab === 'LIVE' ? 'var(--accent-subtle)' : 'transparent',
            border: `1px solid ${activeTab === 'LIVE' ? 'var(--accent-color)' : 'var(--border-color)'}`,
            borderRadius: '20px',
            padding: '6px 18px',
            color: activeTab === 'LIVE' ? 'var(--accent-color)' : 'var(--text-secondary)',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            fontFamily: 'var(--font-mono)',
            fontSize: '9.5px',
            fontWeight: 700,
            letterSpacing: '0.12em',
          }}
          title="Live Audio Bus / Spectrum"
        >
          {/* Animated/styled equalizer bars ılı */}
          <span style={{ display: 'inline-flex', alignItems: 'flex-end', gap: '2px', height: '12px' }}>
            <span
              style={{
                width: '2px',
                height: isPlaying ? '7px' : '5px',
                background: 'currentColor',
                borderRadius: '1px',
                transition: 'height 0.2s ease',
              }}
            />
            <span
              style={{
                width: '2px',
                height: isPlaying ? '12px' : '8px',
                background: 'currentColor',
                borderRadius: '1px',
                transition: 'height 0.2s ease',
              }}
            />
            <span
              style={{
                width: '2px',
                height: isPlaying ? '5px' : '3px',
                background: 'currentColor',
                borderRadius: '1px',
                transition: 'height 0.2s ease',
              }}
            />
          </span>
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
    </div>
  );
};

function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}
