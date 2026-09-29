import React, { useState, useEffect, useRef } from 'react';
import { usePlayer } from '../context/PlayerContext';
import { useArtwork } from '../services/artworkService';
import { Disc, Play, Pause, RotateCw } from 'lucide-react';

interface SpinningVinylTurntableProps {
  onSeek?: (seconds: number) => void;
}

export const SpinningVinylTurntable: React.FC<SpinningVinylTurntableProps> = ({ onSeek }) => {
  const {
    currentTrack,
    playbackStatus,
    currentTime,
    duration,
    togglePlayPause,
    seek,
    turntableSpeed,
    setTurntableSpeed,
  } = usePlayer();

  const isPlaying = playbackStatus === 'PLAYING';
  const { artworkUrl } = useArtwork(currentTrack);

  const [rotationAngle, setRotationAngle] = useState(0);
  const animFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(performance.now());

  // Speed in degrees per millisecond
  // 33.33 RPM = 33.33 * 360 / 60000 = ~0.2 deg/ms
  // 45 RPM = 45 * 360 / 60000 = ~0.27 deg/ms
  const currentSpeedRpm = turntableSpeed || 33;
  const targetDegPerMs = (currentSpeedRpm * 360) / 60000;
  const speedRef = useRef(0);

  useEffect(() => {
    const loop = (now: number) => {
      const dt = Math.min(64, now - lastTimeRef.current);
      lastTimeRef.current = now;

      const target = isPlaying ? targetDegPerMs : 0;
      // Smooth acceleration & deceleration
      speedRef.current += (target - speedRef.current) * 0.04;

      if (speedRef.current > 0.0001) {
        setRotationAngle((prev) => (prev + speedRef.current * dt) % 360);
      }

      animFrameRef.current = requestAnimationFrame(loop);
    };

    lastTimeRef.current = performance.now();
    animFrameRef.current = requestAnimationFrame(loop);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlaying, targetDegPerMs]);

  // Tonearm angle calculation
  // Rest position when stopped/idle: ~ -18 degrees
  // Track start: ~ 0 degrees (outer rim)
  // Track end: ~ 26 degrees (inner groove)
  const progress = duration > 0 ? Math.min(1, Math.max(0, currentTime / duration)) : 0;
  const armAngle = isPlaying ? 3 + progress * 24 : -16;

  // Handle platter click to seek
  const handlePlatterClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!duration || duration <= 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const dx = e.clientX - centerX;
    const dy = e.clientY - centerY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const radius = rect.width / 2;

    // Outer rim: radius * 0.95, inner label: radius * 0.35
    const minR = radius * 0.35;
    const maxR = radius * 0.92;
    if (dist >= minR && dist <= maxR) {
      // Closer to outer rim = beginning (0), closer to inner = end (1)
      const ratio = 1 - (dist - minR) / (maxR - minR);
      const targetTime = ratio * duration;
      if (onSeek) onSeek(targetTime);
      else seek(targetTime);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        maxWidth: '820px',
        margin: '0 auto',
        padding: '20px',
        userSelect: 'none',
      }}
    >
      {/* 3D Turntable Plinth / Chassis */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '640px',
          aspectRatio: '1.3 / 1',
          background: 'linear-gradient(145deg, #18191f 0%, #0d0e12 100%)',
          borderRadius: '24px',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          boxShadow:
            '0 32px 80px rgba(0, 0, 0, 0.85), inset 0 1px 0 rgba(255, 255, 255, 0.2), inset 0 -2px 6px rgba(0, 0, 0, 0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          padding: '24px',
        }}
      >
        {/* Subtle brushed metal plinth texture & highlights */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              'radial-gradient(circle at 20% 20%, rgba(255, 255, 255, 0.05) 0%, transparent 60%)',
            pointerEvents: 'none',
          }}
        />

        {/* Top-Left Plinth Telemetry & Brand */}
        <div
          style={{
            position: 'absolute',
            top: '20px',
            left: '26px',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                fontWeight: 800,
                color: 'var(--accent-color, #eab308)',
                letterSpacing: '0.12em',
              }}
            >
              SHONO.FM // DECK MK-II
            </span>
            <div
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: isPlaying ? '#22c55e' : '#71717a',
                boxShadow: isPlaying ? '0 0 8px #22c55e' : 'none',
              }}
            />
          </div>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'rgba(255, 255, 255, 0.4)' }}>
            DIRECT DRIVE AUDIOPHILE TURNTABLE
          </span>
        </div>

        {/* Bottom-Left Controls: Speed 33 / 45 & Power Button */}
        <div
          style={{
            position: 'absolute',
            bottom: '22px',
            left: '26px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            zIndex: 10,
          }}
        >
          {/* Start/Stop Platter Button */}
          <button
            type="button"
            onClick={togglePlayPause}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              background: isPlaying ? 'rgba(255, 255, 255, 0.12)' : 'var(--accent-color, #eab308)',
              color: isPlaying ? '#fff' : '#000',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
              transition: 'all 0.15s ease',
            }}
          >
            {isPlaying ? <Pause size={12} fill="currentColor" /> : <Play size={12} fill="currentColor" />}
            <span>{isPlaying ? 'PAUSE MOTOR' : 'START MOTOR'}</span>
          </button>

          {/* RPM Selector (33 / 45) */}
          <div
            style={{
              display: 'flex',
              background: 'rgba(0, 0, 0, 0.4)',
              borderRadius: '8px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              padding: '3px',
              gap: '2px',
            }}
          >
            <button
              type="button"
              onClick={() => setTurntableSpeed(33)}
              style={{
                padding: '4px 10px',
                borderRadius: '6px',
                border: 'none',
                background: currentSpeedRpm === 33 ? 'rgba(255, 255, 255, 0.18)' : 'transparent',
                color: currentSpeedRpm === 33 ? '#fff' : '#71717a',
                fontFamily: 'var(--font-mono)',
                fontSize: '10px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              33 ⅓
            </button>
            <button
              type="button"
              onClick={() => setTurntableSpeed(45)}
              style={{
                padding: '4px 10px',
                borderRadius: '6px',
                border: 'none',
                background: currentSpeedRpm === 45 ? 'rgba(255, 255, 255, 0.18)' : 'transparent',
                color: currentSpeedRpm === 45 ? '#fff' : '#71717a',
                fontFamily: 'var(--font-mono)',
                fontSize: '10px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              45
            </button>
          </div>
        </div>

        {/* Strobe Light Beam on Platter Edge (Vintage Orange glow) */}
        <div
          style={{
            position: 'absolute',
            bottom: '60px',
            left: '70px',
            width: '18px',
            height: '18px',
            borderRadius: '50%',
            background: '#ff5722',
            boxShadow: '0 0 24px 8px rgba(255, 87, 34, 0.5)',
            pointerEvents: 'none',
            zIndex: 8,
          }}
        />

        {/* 1. CAST ALUMINUM PLATTER WELL */}
        <div
          style={{
            position: 'relative',
            width: '380px',
            height: '380px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, #1a1b20 0%, #0d0e11 96%, #282a32 100%)',
            boxShadow:
              'inset 0 4px 18px rgba(0, 0, 0, 0.95), 0 0 0 4px rgba(255, 255, 255, 0.04), 0 16px 36px rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: '60px',
            cursor: 'crosshair',
          }}
          onClick={handlePlatterClick}
          title="Click groove to seek time on record"
        >
          {/* Strobe dots ring along outer aluminum rim */}
          <div
            style={{
              position: 'absolute',
              inset: '-4px',
              borderRadius: '50%',
              border: '3px dotted rgba(255, 255, 255, 0.18)',
              transform: `rotate(${rotationAngle * 1.5}deg)`,
              pointerEvents: 'none',
            }}
          />

          {/* 2. REALISTIC VINYL DISC */}
          <div
            style={{
              position: 'relative',
              width: '356px',
              height: '356px',
              borderRadius: '50%',
              background: '#090a0d',
              boxShadow:
                '0 8px 30px rgba(0, 0, 0, 0.9), inset 0 0 0 1px rgba(255, 255, 255, 0.15)',
              transform: `rotate(${rotationAngle}deg)`,
              transition: isPlaying ? 'none' : 'transform 0.1s linear',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
            }}
          >
            {/* Vinyl Microgroove Concentric Rings */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                borderRadius: '50%',
                backgroundImage:
                  'repeating-radial-gradient(circle at center, transparent 0, transparent 2px, rgba(255, 255, 255, 0.025) 3px, transparent 4px)',
                pointerEvents: 'none',
              }}
            />

            {/* Realistic Vinyl Conic Light Sheen (Specular Reflections) */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                borderRadius: '50%',
                background:
                  'conic-gradient(from 45deg, transparent 0deg, rgba(255, 255, 255, 0.08) 35deg, transparent 70deg, transparent 180deg, rgba(255, 255, 255, 0.08) 215deg, transparent 250deg)',
                pointerEvents: 'none',
              }}
            />

            {/* Runout Groove (Lead-out deadwax) */}
            <div
              style={{
                position: 'absolute',
                width: '160px',
                height: '160px',
                borderRadius: '50%',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                pointerEvents: 'none',
              }}
            />

            {/* 3. CENTER ALBUM ART LABEL (4-inch Label) */}
            <div
              style={{
                position: 'relative',
                width: '130px',
                height: '130px',
                borderRadius: '50%',
                overflow: 'hidden',
                border: '3px solid #18191f',
                boxShadow:
                  '0 0 16px rgba(0, 0, 0, 0.8), inset 0 0 10px rgba(0, 0, 0, 0.6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#121316',
                zIndex: 3,
              }}
            >
              {artworkUrl ? (
                <img
                  src={artworkUrl}
                  alt={currentTrack?.title || 'Label Art'}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
              ) : (
                <Disc size={64} color="var(--accent-color, #eab308)" />
              )}

              {/* Label Circular Typography / Overlay */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'rgba(0, 0, 0, 0.25)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '8px',
                  textAlign: 'center',
                }}
              >
                <div
                  style={{
                    fontSize: '8px',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 800,
                    color: '#fff',
                    textShadow: '0 1px 3px rgba(0,0,0,0.9)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    width: '100%',
                  }}
                >
                  {currentTrack?.title || 'SHONO.FM'}
                </div>
                <div
                  style={{
                    fontSize: '6.5px',
                    fontFamily: 'var(--font-mono)',
                    color: 'rgba(255, 255, 255, 0.8)',
                    textShadow: '0 1px 2px rgba(0,0,0,0.9)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    width: '100%',
                  }}
                >
                  {currentTrack?.artist || 'Master Tape'}
                </div>
              </div>

              {/* Spindle Hole & Center Brass Grommet */}
              <div
                style={{
                  position: 'absolute',
                  width: '14px',
                  height: '14px',
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, #000 40%, #c49746 80%, #5e461a 100%)',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.8)',
                  zIndex: 5,
                }}
              />
            </div>
          </div>
        </div>

        {/* 4. METALLIC TONEARM ASSEMBLY */}
        <div
          style={{
            position: 'absolute',
            top: '30px',
            right: '48px',
            width: '120px',
            height: '340px',
            pointerEvents: 'none',
            zIndex: 12,
          }}
        >
          {/* Tonearm Base / Gimbal Pivot */}
          <div
            style={{
              position: 'absolute',
              top: '16px',
              right: '20px',
              width: '54px',
              height: '54px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, #52525b 0%, #27272a 70%, #18181b 100%)',
              border: '2px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {/* Chrome Counterweight */}
            <div
              style={{
                position: 'absolute',
                top: '-18px',
                width: '32px',
                height: '24px',
                borderRadius: '4px',
                background: 'linear-gradient(90deg, #71717a 0%, #e4e4e7 50%, #52525b 100%)',
                boxShadow: '0 4px 10px rgba(0, 0, 0, 0.5)',
              }}
            />
            {/* Center Pivot Screw */}
            <div
              style={{
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                background: '#d4d4d8',
                boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.6)',
              }}
            />
          </div>

          {/* S-Shaped Tone-Arm Shaft & Cartridge (Rotates based on track playback progress) */}
          <div
            style={{
              position: 'absolute',
              top: '43px',
              right: '47px',
              width: '8px',
              height: '260px',
              transformOrigin: 'top center',
              transform: `rotate(${armAngle}deg)`,
              transition: isPlaying ? 'transform 0.4s ease-out' : 'transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            {/* Metallic Aluminum Tube */}
            <div
              style={{
                width: '6px',
                height: '220px',
                background: 'linear-gradient(90deg, #71717a 0%, #f4f4f5 50%, #52525b 100%)',
                borderRadius: '3px',
                boxShadow: '3px 6px 14px rgba(0, 0, 0, 0.5)',
              }}
            />

            {/* Headshell & Phono Cartridge */}
            <div
              style={{
                position: 'absolute',
                bottom: '10px',
                left: '-14px',
                width: '26px',
                height: '36px',
                background: '#18181b',
                borderRadius: '4px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                transform: 'rotate(-16deg)',
                boxShadow: '0 6px 16px rgba(0, 0, 0, 0.8)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'flex-end',
                padding: '4px',
              }}
            >
              {/* Golden Stylus Needle Tip */}
              <div
                style={{
                  width: '4px',
                  height: '10px',
                  background: 'var(--accent-color, #eab308)',
                  borderRadius: '1px',
                  boxShadow: '0 0 6px rgba(234, 179, 8, 0.8)',
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Track Info & Vinyl Run Time Readout */}
      <div
        style={{
          marginTop: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          maxWidth: '640px',
          padding: '0 8px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <RotateCw
            size={14}
            color="var(--accent-color, #eab308)"
            style={{
              animation: isPlaying ? 'spin 3s linear infinite' : 'none',
            }}
          />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#a1a1aa' }}>
            TRACK PROGRESS: {Math.round(progress * 100)}% // {currentSpeedRpm} RPM
          </span>
        </div>

        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--accent-color, #eab308)' }}>
          {isPlaying ? 'ACTIVE ANALOG TRACKING' : 'TONEARM PARKED'}
        </span>
      </div>
    </div>
  );
};
