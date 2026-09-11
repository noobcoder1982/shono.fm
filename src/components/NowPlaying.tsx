import React from 'react';
import { usePlayer } from '../context/PlayerContext';
import {
  Shuffle,
  SkipBack,
  Play,
  Pause,
  SkipForward,
  Repeat,
  Repeat1,
} from 'lucide-react';
import { MasterWaveform } from './MasterWaveform';

export const NowPlaying: React.FC = () => {
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
  } = usePlayer();

  const isPlaying = playbackStatus === 'PLAYING';

  if (!currentTrack) {
    return (
      <div
        style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--border-color)',
          background: 'var(--bg-secondary)',
          flexShrink: 0,
          fontFamily: 'var(--font-mono)',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '10px',
          }}
        >
          <span
            style={{
              fontSize: '9px',
              letterSpacing: '0.12em',
              color: 'var(--text-secondary)',
              border: '1px solid var(--border-color)',
              padding: '2px 6px',
            }}
          >
            NOW PLAYING
          </span>
          <span style={{ fontSize: '8.5px', color: 'var(--text-muted)' }}>STANDBY</span>
        </div>
        <div
          style={{
            height: '110px',
            border: '1px dashed var(--border-color)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            background: 'var(--bg-primary)',
          }}
        >
          <div style={{ fontSize: '9.5px', color: 'var(--text-secondary)', letterSpacing: '0.1em' }}>
            NO AUDIO STREAM LOADED
          </div>
          <div style={{ fontSize: '8px', color: 'var(--text-muted)', textAlign: 'center', maxWidth: '170px' }}>
            AWAITING PLAYLIST OR TRACK INGESTION
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        padding: '12px 16px 10px 16px',
        borderBottom: '1px solid var(--border-color)',
        background: 'var(--bg-secondary)',
        flexShrink: 0,
      }}
    >
      {/* Header Tag */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '8px',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '9px',
            letterSpacing: '0.12em',
            color: 'var(--text-secondary)',
            border: '1px solid var(--border-color)',
            padding: '2px 6px',
          }}
        >
          NOW PLAYING
        </span>
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '8.5px',
            color: 'var(--text-muted)',
            letterSpacing: '0.06em',
          }}
        >
          TRACK #{currentTrack.index.toString().padStart(3, '0')}
        </span>
      </div>

      {/* Brutalist Cover Artwork */}
      <div
        style={{
          width: '100%',
          height: '130px',
          background: '#000',
          border: '1px solid var(--border-color)',
          overflow: 'hidden',
          marginBottom: '8px',
          position: 'relative',
          cursor: 'pointer',
        }}
        onClick={() => openTrackDetail(currentTrack)}
        title="Click to view track details"
      >
        <img
          src={currentTrack.thumbnail || '/assets/now_playing_art.jpg'}
          alt={currentTrack.title}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            filter: 'grayscale(100%) contrast(120%) brightness(95%)',
            transition: 'transform 0.5s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.02)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        />
        {/* Subtle hover prompt */}
        <div
          style={{
            position: 'absolute',
            bottom: '6px',
            right: '6px',
            background: 'rgba(0,0,0,0.85)',
            border: '1px solid var(--border-bright)',
            fontFamily: 'var(--font-mono)',
            fontSize: '8px',
            color: 'var(--text-secondary)',
            padding: '2px 5px',
            letterSpacing: '0.1em',
          }}
        >
          DETAILS ↗
        </div>
      </div>

      {/* Artist & Title */}
      <div style={{ marginBottom: '8px' }}>
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '9.5px',
            letterSpacing: '0.12em',
            color: 'var(--text-secondary)',
            textTransform: 'uppercase',
            marginBottom: '2px',
          }}
        >
          {currentTrack.artist}
        </div>
        <h3
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '24px',
            lineHeight: 0.95,
            letterSpacing: '0.03em',
            color: 'var(--text-primary)',
            margin: 0,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {currentTrack.title}
        </h3>
      </div>

      {/* Compact Master Waveform & Scrubber */}
      <div style={{ marginBottom: '10px' }}>
        <MasterWaveform
          track={currentTrack}
          currentTime={currentTime}
          duration={duration}
          isPlaying={isPlaying}
          onSeek={seek}
          height={26}
          compact={true}
          showTimeLabels={true}
        />
      </div>

      {/* Control Surface */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 2px',
        }}
      >
        {/* Shuffle */}
        <button
          className="bma-btn-icon"
          onClick={toggleShuffle}
          title="Shuffle (S)"
          style={{
            color: isShuffle ? 'var(--text-primary)' : 'var(--text-muted)',
            padding: '4px',
          }}
        >
          <Shuffle size={14} />
        </button>

        {/* Previous */}
        <button
          className="bma-btn-icon"
          onClick={playPrev}
          title="Previous Track (P)"
          style={{ padding: '4px' }}
        >
          <SkipBack size={15} fill="currentColor" />
        </button>

        {/* Main Big Circular Inverted Play/Pause Button */}
        <button
          onClick={togglePlayPause}
          title="Play / Pause (Space)"
          style={{
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            background: 'var(--text-primary)',
            color: 'var(--text-inverse)',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'transform 0.15s ease, background-color 0.15s ease',
          }}
          onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.95)')}
          onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        >
          {isPlaying ? (
            <Pause size={17} fill="currentColor" />
          ) : (
            <Play size={17} fill="currentColor" style={{ marginLeft: '2px' }} />
          )}
        </button>

        {/* Next */}
        <button
          className="bma-btn-icon"
          onClick={playNext}
          title="Next Track (N)"
          style={{ padding: '4px' }}
        >
          <SkipForward size={15} fill="currentColor" />
        </button>

        {/* Repeat */}
        <button
          className="bma-btn-icon"
          onClick={cycleRepeat}
          title={`Repeat: ${repeatMode} (R)`}
          style={{
            color: repeatMode !== 'OFF' ? 'var(--text-primary)' : 'var(--text-muted)',
            padding: '4px',
          }}
        >
          {repeatMode === 'ONE' ? <Repeat1 size={14} /> : <Repeat size={14} />}
        </button>
      </div>
    </div>
  );
};
