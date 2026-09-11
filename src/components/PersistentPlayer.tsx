import React from 'react';
import { usePlayer } from '../context/PlayerContext';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Heart,
  ListMusic,
  Maximize2,
} from 'lucide-react';
import { MasterWaveform } from './MasterWaveform';

export const PersistentPlayer: React.FC = () => {
  const {
    currentTrack,
    playbackStatus,
    currentTime,
    duration,
    togglePlayPause,
    playNext,
    playPrev,
    seek,
    volume,
    setVolume,
    isMuted,
    toggleMute,
    likedTrackIds,
    toggleLike,
    openTrackDetail,
    setIsQueueDrawerOpen,
    playerMode,
    setPlayerMode,
  } = usePlayer();

  const isPlaying = playbackStatus === 'PLAYING';
  const isLiked = currentTrack ? likedTrackIds.includes(currentTrack.id) : false;
  const isMI6 = playerMode === 'MI6';

  return (
    <footer
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        width: '100%',
        height: 'var(--bottom-bar-height)',
        background: isMI6 ? '#0d0e11' : 'var(--bg-secondary)',
        borderTop: isMI6 ? '1px solid #3d3419' : '1px solid var(--border-color)',
        zIndex: 100,
        display: 'grid',
        gridTemplateColumns: '320px 1fr auto',
        alignItems: 'center',
        padding: '0 24px',
        gap: '24px',
        transition: 'background-color 0.3s ease, border-color 0.3s ease',
      }}
    >
      {/* Left: Track Thumbnail, Title, Artist, Like */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: 0 }}>
        <div
          style={{
            width: '38px',
            height: '38px',
            border: '1px solid var(--border-color)',
            background: '#000',
            overflow: 'hidden',
            flexShrink: 0,
            cursor: 'pointer',
          }}
          onClick={() => currentTrack && openTrackDetail(currentTrack)}
          title="View Track Details"
        >
          {currentTrack?.thumbnail && (
            <img
              src={currentTrack.thumbnail}
              alt={currentTrack.title}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                filter: 'grayscale(100%)',
              }}
            />
          )}
        </div>

        <div style={{ minWidth: 0, flex: 1 }}>
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '12px',
              fontWeight: 600,
              color: 'var(--text-primary)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {currentTrack?.title || 'No Track Selected'}
          </div>
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '10px',
              color: 'var(--text-secondary)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {currentTrack ? `${currentTrack.artist} — ${currentTrack.album}` : 'Select a track to begin'}
          </div>
        </div>

        {currentTrack && (
          <button
            className="bma-btn-icon"
            onClick={() => toggleLike(currentTrack.id)}
            title="Favourite"
            style={{ padding: '6px' }}
          >
            <Heart
              size={16}
              fill={isLiked ? 'var(--status-live)' : 'none'}
              color={isLiked ? 'var(--status-live)' : 'var(--text-muted)'}
            />
          </button>
        )}
      </div>

      {/* Middle: High-Res Master Waveform Scrubber */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          maxWidth: '640px',
          margin: '0 auto',
          width: '100%',
          padding: '0 8px',
        }}
      >
        <MasterWaveform
          track={currentTrack}
          currentTime={currentTime}
          duration={duration}
          isPlaying={isPlaying}
          onSeek={seek}
          height={30}
          showTimeLabels={true}
        />
        {/* Precision Sub-Rail Telemetry */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            width: '100%',
            padding: '0 48px',
            marginTop: '2px',
            fontFamily: 'var(--font-mono)',
            fontSize: '7.5px',
            color: 'var(--text-muted)',
            letterSpacing: '0.1em',
          }}
        >
          <span>PCM / STEREO 48.0 kHz</span>
          <span style={{ display: 'flex', gap: '8px' }}>
            <span>-12dB</span>
            <span>-6dB</span>
            <span style={{ color: isPlaying ? 'var(--status-live)' : 'inherit' }}>0dB PK</span>
          </span>
          <span>{isPlaying ? 'ACTIVE STREAM' : 'STANDBY'}</span>
        </div>
      </div>

      {/* Right: Controls, Volume, Drawer, Watermark */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', justifyContent: 'flex-end' }}>
        {/* Playback Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button className="bma-btn-icon" onClick={playPrev} title="Previous (P)" style={{ padding: '4px' }}>
            <SkipBack size={16} fill="currentColor" />
          </button>

          <button
            onClick={togglePlayPause}
            title="Play / Pause (Space)"
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              background: 'var(--text-primary)',
              color: 'var(--text-inverse)',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            {isPlaying ? (
              <Pause size={16} fill="currentColor" />
            ) : (
              <Play size={16} fill="currentColor" style={{ marginLeft: '2px' }} />
            )}
          </button>

          <button className="bma-btn-icon" onClick={playNext} title="Next (N)" style={{ padding: '4px' }}>
            <SkipForward size={16} fill="currentColor" />
          </button>
        </div>

        {/* Volume Slider */}
        <div className="hide-mobile" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button className="bma-btn-icon" onClick={toggleMute} title="Mute (M)" style={{ padding: '4px' }}>
            {isMuted || volume === 0 ? <VolumeX size={15} /> : <Volume2 size={15} />}
          </button>
          <input
            type="range"
            min={0}
            max={100}
            value={isMuted ? 0 : volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            style={{
              width: '60px',
              accentColor: 'var(--text-primary)',
              cursor: 'pointer',
              height: '2px',
            }}
          />
        </div>

        {/* Queue Drawer Toggle */}
        <button
          className="bma-btn-icon"
          onClick={() => setIsQueueDrawerOpen((prev) => !prev)}
          title="Queue (Q)"
          style={{ padding: '4px' }}
        >
          <ListMusic size={16} />
        </button>

        {/* Track Detail / Fullscreen */}
        <button
          className="bma-btn-icon hide-mobile"
          onClick={() => currentTrack && openTrackDetail(currentTrack)}
          title="Track Detail View"
          style={{ padding: '4px' }}
        >
          <Maximize2 size={15} />
        </button>

        {/* Watermark Tag & Mode Switcher */}
        <div
          className="hide-mobile"
          onClick={() => setPlayerMode(isMI6 ? 'ARCHIVE' : 'MI6')}
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '8px',
            letterSpacing: '0.12em',
            color: isMI6 ? '#d4af37' : 'var(--text-muted)',
            textAlign: 'right',
            borderLeft: isMI6 ? '1px solid #3d3419' : '1px solid var(--border-color)',
            paddingLeft: '14px',
            lineHeight: 1.3,
            cursor: 'pointer',
          }}
          title="Click to toggle between Archive and 007 / MI6 Mode"
        >
          {isMI6 ? (
            <>
              007 / MI6 • SHONO.FM<br />
              <span style={{ color: '#656975' }}>[CLICK TO EXIT]</span>
            </>
          ) : (
            <>
              SHONO.FM // PRECISION AUDIO<br />
              / 2026
            </>
          )}
        </div>
      </div>
    </footer>
  );
};
