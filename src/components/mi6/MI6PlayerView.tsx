import React from 'react';
import { usePlayer } from '../../context/PlayerContext';
import { Turntable } from './Turntable';
import { MI6Tracklist } from './MI6Tracklist';
import { MasterWaveform } from '../MasterWaveform';
import {
  Shuffle,
  SkipBack,
  Play,
  Pause,
  SkipForward,
  Repeat,
  Repeat1,
  Volume2,
  VolumeX,
  Radio,
  Disc,
} from 'lucide-react';

export const MI6PlayerView: React.FC = () => {
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
    isShuffle,
    toggleShuffle,
    repeatMode,
    cycleRepeat,
    activeArchive,
    playTrack,
    setPlayerMode,
    isVinylCrackle,
    toggleVinylCrackle,
    turntableSpeed,
    setTurntableSpeed,
    turntablePitch,
    setTurntablePitch,
    openTrackDetail,
    setActiveTab,
  } = usePlayer();

  const isPlaying = playbackStatus === 'PLAYING';
  const tracks = activeArchive?.tracks || [];

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(100vh - var(--bottom-bar-height))',
        maxHeight: 'calc(100vh - var(--bottom-bar-height))',
        background: '#0a0a0c',
        color: '#e5e7eb',
        overflow: 'hidden',
        userSelect: 'none',
      }}
    >
      {/* 1. MI6 Classified Dossier Top Header */}
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '10px 24px',
          background: '#0e1013',
          borderBottom: '1px solid #1f2229',
          flexShrink: 0,
        }}
      >
        {/* Left: 007 Monogram & System Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'baseline',
              gap: '6px',
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '28px',
                fontWeight: 900,
                color: '#ffffff',
                letterSpacing: '0.04em',
                lineHeight: 1,
              }}
            >
              007
            </span>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                fontWeight: 700,
                color: '#d4af37',
                letterSpacing: '0.14em',
              }}
            >
              / MI6
            </span>
          </div>

          <div
            style={{
              height: '18px',
              width: '1px',
              background: '#2b2e38',
            }}
          />

          <div style={{ lineHeight: 1.2 }}>
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '8.5px',
                fontWeight: 600,
                color: '#9ba0ad',
                letterSpacing: '0.1em',
              }}
            >
              VINYL PLAYER UI • MINIMAL ANALOG PROTOCOL
            </div>
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '7.5px',
                color: '#555863',
                letterSpacing: '0.08em',
              }}
            >
              CLASSIFIED DOSSIER • SOUNDTRACKS FOR A MORE DANGEROUS WORLD
            </div>
          </div>
        </div>

        {/* Center Telemetry Readouts */}
        <div
          className="hide-mobile"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '18px',
            fontFamily: 'var(--font-mono)',
            fontSize: '8.5px',
            letterSpacing: '0.1em',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: isPlaying ? '#22c55e' : '#ef4444',
                boxShadow: isPlaying ? '0 0 8px #22c55e' : '0 0 8px #ef4444',
              }}
            />
            <span style={{ color: isPlaying ? '#22c55e' : '#888' }}>
              {isPlaying ? 'AUDIO RECON ACTIVE' : 'SYSTEM STANDBY'}
            </span>
          </div>

          <div style={{ color: '#8b8e99' }}>
            SPEED: <span style={{ color: '#d4af37', fontWeight: 600 }}>{turntableSpeed} RPM</span>
          </div>

          <div style={{ color: '#8b8e99' }}>
            ANALOG NOISE:{' '}
            <span style={{ color: isVinylCrackle ? '#d4af37' : '#555863', fontWeight: 600 }}>
              {isVinylCrackle ? 'ACTIVE' : 'OFF'}
            </span>
          </div>
        </div>

        {/* Right: Controls (Crackle toggle, Exit Mode, Bond badge) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Vinyl Crackle Ambient Toggle */}
          <button
            onClick={toggleVinylCrackle}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: isVinylCrackle ? 'rgba(212,175,55,0.12)' : '#14161b',
              border: isVinylCrackle ? '1px solid #d4af37' : '1px solid #282b35',
              color: isVinylCrackle ? '#d4af37' : '#8b8e99',
              padding: '5px 10px',
              fontFamily: 'var(--font-mono)',
              fontSize: '8.5px',
              letterSpacing: '0.1em',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            title="Toggle procedural vinyl crackle atmosphere"
          >
            <Radio size={12} />
            <span>CRACKLE: {isVinylCrackle ? 'ON' : 'OFF'}</span>
          </button>

          {/* Exit 007 Mode */}
          <button
            onClick={() => setPlayerMode('ARCHIVE')}
            style={{
              background: '#d4af37',
              color: '#0a0a0c',
              border: 'none',
              padding: '6px 14px',
              fontFamily: 'var(--font-mono)',
              fontSize: '9px',
              fontWeight: 700,
              letterSpacing: '0.12em',
              cursor: 'pointer',
              transition: 'opacity 0.15s ease',
            }}
            title="Return to standard Archive layout"
          >
            EXIT 007 MODE
          </button>

          {/* System Settings Button */}
          <button
            onClick={() => setActiveTab('SETTINGS')}
            style={{
              background: 'transparent',
              color: '#d4af37',
              border: '1px solid #3d414e',
              padding: '6px 12px',
              fontFamily: 'var(--font-mono)',
              fontSize: '9px',
              fontWeight: 700,
              letterSpacing: '0.12em',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            title="Open Full-Screen Settings Page"
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#d4af37';
              e.currentTarget.style.background = 'rgba(212,175,55,0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#3d414e';
              e.currentTarget.style.background = 'transparent';
            }}
          >
            SETTINGS
          </button>

          {/* Bond Tagline Badge */}
          <div
            className="hide-mobile"
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '7.5px',
              letterSpacing: '0.12em',
              color: '#555863',
              textAlign: 'right',
              borderLeft: '1px solid #252832',
              paddingLeft: '10px',
              lineHeight: 1.2,
            }}
          >
            BOND MUSIC<br />
            NEVER DIES
          </div>
        </div>
      </header>

      {/* 2. Main Stage: Turntable (Left) + Dossier & Tracklist (Right) */}
      <div
        style={{
          flex: 1,
          display: 'grid',
          gridTemplateColumns: 'minmax(420px, 1fr) minmax(460px, 1.15fr)',
          gap: '24px',
          padding: '16px 24px 10px 24px',
          minHeight: 0,
          overflow: 'hidden',
          alignItems: 'center',
        }}
      >
        {/* Left Column: Physical Turntable Unit */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            minHeight: 0,
          }}
        >
          <Turntable
            currentTrack={currentTrack}
            isPlaying={isPlaying}
            currentTime={currentTime}
            duration={duration}
            speed={turntableSpeed}
            onSpeedChange={setTurntableSpeed}
            pitch={turntablePitch}
            onPitchChange={setTurntablePitch}
            onTogglePlay={togglePlayPause}
            onSeek={seek}
            onDropTrack={(track) => playTrack(track)}
          />
        </div>

        {/* Right Column: Now Playing Classified Console + Tracklist */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            height: '100%',
            minHeight: 0,
            overflow: 'hidden',
            justifyContent: 'center',
          }}
        >
          {/* Classified Now Playing Unit */}
          <div
            style={{
              background: '#0f1115',
              border: '1px solid #242731',
              padding: '16px 18px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            {/* Top Dossier Title Tag */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '8.5px',
                  color: '#8b8e99',
                  letterSpacing: '0.12em',
                  fontWeight: 600,
                }}
              >
                NOW PLAYING (VINYL MODE)
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '8px',
                  color: '#d4af37',
                  letterSpacing: '0.15em',
                }}
              >
                SIDE A • MI6 #007
              </span>
            </div>

            {/* Artwork + Classified Metadata Row */}
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              {/* Vinyl / Cover Artwork Frame */}
              <div
                style={{
                  width: '90px',
                  height: '90px',
                  background: '#07080a',
                  border: '1px solid #2f3440',
                  overflow: 'hidden',
                  flexShrink: 0,
                  position: 'relative',
                  cursor: 'pointer',
                }}
                onClick={() => currentTrack && openTrackDetail(currentTrack)}
                title="View Full Track Dossier"
              >
                {currentTrack?.thumbnail ? (
                  <img
                    src={currentTrack.thumbnail}
                    alt={currentTrack.title}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block',
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: '#111317',
                      color: '#555',
                    }}
                  >
                    <Disc size={32} color="#d4af37" />
                  </div>
                )}
              </div>

              {/* Track Details Dossier */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '10px',
                    color: '#d4af37',
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    marginBottom: '2px',
                  }}
                >
                  {currentTrack?.artist || 'MI6 SURVEILLANCE ARCHIVE'}
                </div>
                <div
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '26px',
                    color: '#ffffff',
                    letterSpacing: '0.04em',
                    lineHeight: 1,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    marginBottom: '8px',
                  }}
                >
                  {currentTrack?.title || 'STANDBY RECORDING'}
                </div>

                {/* Tech Specs Micro-Grid */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '10px',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '8px',
                    color: '#656975',
                    letterSpacing: '0.08em',
                  }}
                >
                  <div>
                    <div style={{ color: '#444852' }}>ALBUM</div>
                    <div style={{ color: '#a0a4b0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {currentTrack?.album || 'YouTube Archive'}
                    </div>
                  </div>
                  <div>
                    <div style={{ color: '#444852' }}>DURATION</div>
                    <div style={{ color: '#a0a4b0' }}>{currentTrack?.durationFormatted || '03:46'}</div>
                  </div>
                  <div>
                    <div style={{ color: '#444852' }}>FORMAT</div>
                    <div style={{ color: '#d4af37' }}>PCM / 48.0 kHz</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Gold Waveform Scrubber */}
            <div style={{ marginTop: '2px' }}>
              <MasterWaveform
                track={currentTrack}
                currentTime={currentTime}
                duration={duration}
                isPlaying={isPlaying}
                onSeek={seek}
                height={28}
                showTimeLabels={true}
              />
            </div>

            {/* Playback Controls & Volume Row */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingTop: '6px',
                borderTop: '1px solid #1a1c22',
              }}
            >
              {/* Transport Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <button
                  onClick={toggleShuffle}
                  className="bma-btn-icon"
                  title="Shuffle"
                  style={{ color: isShuffle ? '#d4af37' : '#555863' }}
                >
                  <Shuffle size={14} />
                </button>

                <button onClick={playPrev} className="bma-btn-icon" title="Previous Track">
                  <SkipBack size={15} fill="currentColor" />
                </button>

                {/* Big Circular Gold Play/Pause */}
                <button
                  onClick={togglePlayPause}
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    background: '#0d0e11',
                    border: '2px solid #d4af37',
                    color: '#d4af37',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 0 12px rgba(212,175,55,0.25)',
                    transition: 'transform 0.15s ease',
                  }}
                  onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.95)')}
                  onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                >
                  {isPlaying ? (
                    <Pause size={17} fill="#d4af37" />
                  ) : (
                    <Play size={17} fill="#d4af37" style={{ marginLeft: '2px' }} />
                  )}
                </button>

                <button onClick={playNext} className="bma-btn-icon" title="Next Track">
                  <SkipForward size={15} fill="currentColor" />
                </button>

                <button
                  onClick={cycleRepeat}
                  className="bma-btn-icon"
                  title={`Repeat: ${repeatMode}`}
                  style={{ color: repeatMode !== 'OFF' ? '#d4af37' : '#555863' }}
                >
                  {repeatMode === 'ONE' ? <Repeat1 size={14} /> : <Repeat size={14} />}
                </button>
              </div>

              {/* Volume Slider Deck */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button onClick={toggleMute} className="bma-btn-icon" title="Mute">
                  {isMuted || volume === 0 ? <VolumeX size={14} /> : <Volume2 size={14} />}
                </button>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '7.5px', color: '#656975', letterSpacing: '0.1em' }}>
                    VOLUME
                  </span>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={isMuted ? 0 : volume}
                    onChange={(e) => setVolume(parseFloat(e.target.value))}
                    style={{
                      width: '75px',
                      accentColor: '#d4af37',
                      cursor: 'pointer',
                      height: '2px',
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Compact MI6 Tracklist Module */}
          <div style={{ flex: 1, minHeight: '140px', overflow: 'hidden' }}>
            <MI6Tracklist
              tracks={tracks}
              currentTrack={currentTrack}
              onSelectTrack={(track) => playTrack(track)}
            />
          </div>
        </div>
      </div>

      {/* 3. Lower Section: Physical Details & Interactions Footnote Bar */}
      <footer
        style={{
          display: 'grid',
          gridTemplateColumns: '1.4fr 1fr auto',
          gap: '20px',
          alignItems: 'center',
          padding: '8px 24px',
          background: '#090a0c',
          borderTop: '1px solid #1c1e24',
          flexShrink: 0,
        }}
      >
        {/* Hardware Details Chips */}
        <div>
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '8px',
              color: '#555863',
              letterSpacing: '0.12em',
              marginBottom: '3px',
            }}
          >
            PHYSICAL SPECIFICATIONS
          </div>
          <div
            style={{
              display: 'flex',
              gap: '14px',
              fontFamily: 'var(--font-mono)',
              fontSize: '7.5px',
              color: '#8b8e99',
              letterSpacing: '0.06em',
            }}
          >
            <span>TONEARM / S-SHAPED CHROME</span>
            <span>CARTRIDGE / MOVING MAGNET GOLD</span>
            <span>PLATTER / STROBOSCOPIC DIE-CAST</span>
            <span>MOTOR / DIRECT DRIVE QUARTZ</span>
          </div>
        </div>

        {/* Optional Interactions Guide */}
        <div className="hide-mobile">
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '8px',
              color: '#555863',
              letterSpacing: '0.12em',
              marginBottom: '3px',
            }}
          >
            ANALOG CONTROLS
          </div>
          <div
            style={{
              display: 'flex',
              gap: '12px',
              fontFamily: 'var(--font-mono)',
              fontSize: '7.5px',
              color: '#8b8e99',
              letterSpacing: '0.06em',
            }}
          >
            <span>CLICK VINYL / TOGGLE MOTOR</span>
            <span>SCRUB WAVEFORM / SEEK</span>
            <span>CRACKLE TOGGLE / AMBIENT TAPE</span>
          </div>
        </div>

        {/* Brand Stamp */}
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '8px',
            letterSpacing: '0.12em',
            color: '#d4af37',
            textAlign: 'right',
          }}
        >
          ANALOG FEEL. DIGITAL PRECISION.<br />
          <span style={{ color: '#555863' }}>SHONO.FM // 2026</span>
        </div>
      </footer>
    </div>
  );
};
