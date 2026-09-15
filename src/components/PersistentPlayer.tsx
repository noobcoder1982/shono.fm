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
import { useArtwork } from '../services/artworkService';

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
    toggleFullscreenPlayer,
    setIsQueueDrawerOpen,
    playerMode,
    setPlayerMode,
    theme,
  } = usePlayer();

  const { artworkUrl, isYouTube } = useArtwork(currentTrack);
  const isPlaying = playbackStatus === 'PLAYING';
  const isLiked = currentTrack ? likedTrackIds.includes(currentTrack.id) : false;
  const isMI6 = playerMode === 'MI6';
  const isAppleGlass = Boolean(theme && theme.startsWith('apple-glass'));

  return (
    <footer
      className={`persistent-player-bottom ${isAppleGlass ? 'apple-glass-player' : ''}`}
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        width: '100%',
        height: 'var(--bottom-bar-height, 74px)',
        background: isMI6 ? '#0d0e11' : 'var(--bg-secondary)',
        borderTop: isMI6 ? '1px solid #3d3419' : '1px solid var(--border-color)',
        zIndex: 100,
        display: 'grid',
        gridTemplateColumns: '300px 1fr auto',
        alignItems: 'center',
        padding: '0 24px',
        gap: '20px',
        boxSizing: 'border-box',
        boxShadow: '0 -8px 24px rgba(0, 0, 0, 0.5)',
        transition: 'background-color 0.3s ease, border-color 0.3s ease',
      }}
    >
      {/* Left: Track Thumbnail, Title, Artist, Like */}
      <div style={{ display: 'flex', alignItems: 'center', gap: isAppleGlass ? '14px' : '12px', minWidth: 0, width: '280px' }}>
        <div
          className="square-artwork-container"
          style={{
            width: isAppleGlass ? '46px' : '40px',
            height: isAppleGlass ? '46px' : '40px',
            borderRadius: isAppleGlass ? '14px' : '0',
            border: isAppleGlass ? '1px solid rgba(255,255,255,0.15)' : '1px solid var(--border-bright)',
            flexShrink: 0,
            overflow: 'hidden',
            background: 'var(--bg-primary)',
            cursor: 'pointer',
            boxShadow: isAppleGlass ? '0 4px 12px rgba(0,0,0,0.3)' : 'none',
          }}
          onClick={() => currentTrack && openTrackDetail(currentTrack)}
          title="View Track Details"
        >
          {artworkUrl && (
            <img
              src={artworkUrl}
              alt={currentTrack?.title || 'Cover'}
              className={`square-artwork-img ${isYouTube ? 'is-yt-fallback' : ''}`}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                filter: isAppleGlass ? 'none' : 'grayscale(100%)',
                borderRadius: isAppleGlass ? '14px' : '0',
              }}
            />
          )}
        </div>

        <div style={{ minWidth: 0, flex: 1 }}>
          <div
            style={{
              fontFamily: isAppleGlass ? 'var(--font-sans)' : 'var(--font-mono)',
              fontSize: isAppleGlass ? '13px' : '12px',
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
              fontFamily: isAppleGlass ? 'var(--font-sans)' : 'var(--font-mono)',
              fontSize: isAppleGlass ? '11px' : '10px',
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
            style={{ padding: '6px', borderRadius: isAppleGlass ? '50%' : '0' }}
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
        {/* Precision Sub-Rail Telemetry (Only in Brutalist mode) */}
        {!isAppleGlass && (
          <div
            className="telemetry-rail"
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
        )}
      </div>

      {/* Right: Controls, Volume, Drawer, Watermark */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', justifyContent: 'flex-end' }}>
        {/* Playback Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: isAppleGlass ? '12px' : '8px' }}>
          <button
            className="bma-btn-icon"
            onClick={playPrev}
            title="Previous (P)"
            style={{ padding: '6px', borderRadius: isAppleGlass ? '50%' : '0' }}
          >
            <SkipBack size={17} fill="currentColor" />
          </button>

          <button
            onClick={togglePlayPause}
            title="Play / Pause (Space)"
            style={{
              width: isAppleGlass ? '42px' : '34px',
              height: isAppleGlass ? '42px' : '34px',
              borderRadius: '50%',
              background: isAppleGlass ? 'var(--accent-color)' : 'var(--text-primary)',
              color: isAppleGlass ? '#ffffff' : 'var(--text-inverse)',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: isAppleGlass ? '0 4px 16px rgba(250, 45, 72, 0.45)' : 'none',
              transition: 'all 0.2s ease',
            }}
          >
            {isPlaying ? (
              <Pause size={17} fill="currentColor" />
            ) : (
              <Play size={17} fill="currentColor" style={{ marginLeft: '2px' }} />
            )}
          </button>

          <button
            className="bma-btn-icon"
            onClick={playNext}
            title="Next (N)"
            style={{ padding: '6px', borderRadius: isAppleGlass ? '50%' : '0' }}
          >
            <SkipForward size={17} fill="currentColor" />
          </button>
        </div>

        {/* Volume Slider */}
        <div className="hide-mobile" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            className="bma-btn-icon"
            onClick={toggleMute}
            title="Mute (M)"
            style={{ padding: '6px', borderRadius: isAppleGlass ? '50%' : '0' }}
          >
            {isMuted || volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
          <input
            type="range"
            min={0}
            max={100}
            value={isMuted ? 0 : volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            style={{
              width: '64px',
              accentColor: 'var(--accent-color)',
              cursor: 'pointer',
              height: '3px',
            }}
          />
        </div>

        {/* Queue Drawer Toggle */}
        <button
          className="bma-btn-icon"
          onClick={() => setIsQueueDrawerOpen((prev) => !prev)}
          title="Queue (Q)"
          style={{ padding: '6px', borderRadius: isAppleGlass ? '50%' : '0' }}
        >
          <ListMusic size={17} />
        </button>

        {/* Track Detail / Fullscreen */}
        <button
          className="bma-btn-icon hide-mobile"
          onClick={toggleFullscreenPlayer}
          title="Fullscreen Now Playing (F)"
          style={{ padding: '6px', borderRadius: isAppleGlass ? '50%' : '0' }}
        >
          <Maximize2 size={16} />
        </button>

        {/* Watermark Tag & Mode Switcher (Only in Brutalist Themes) */}
        {!isAppleGlass && (
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
        )}
      </div>
    </footer>
  );
};
