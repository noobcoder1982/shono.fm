import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { Track, TurntableSpeed } from '../../types';
import { audioEngine } from '../../services/audioEngine';
import { Disc } from 'lucide-react';

interface TurntableProps {
  currentTrack: Track | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  speed: TurntableSpeed;
  onSpeedChange: (speed: TurntableSpeed) => void;
  pitch: number;
  onPitchChange: (pitch: number) => void;
  onTogglePlay: () => void;
  onSeek?: (time: number) => void;
  onDropTrack?: (track: Track) => void;
}

const formatTime = (secs: number) => {
  const m = Math.floor(Math.max(0, secs) / 60);
  const s = Math.floor(Math.max(0, secs) % 60);
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

export const Turntable: React.FC<TurntableProps> = ({
  currentTrack,
  isPlaying,
  currentTime,
  duration,
  speed,
  onSpeedChange,
  pitch,
  onPitchChange,
  onTogglePlay,
  onSeek,
  onDropTrack,
}) => {
  // Smooth continuous physical rotation state
  const angleRef = useRef(0);
  const isScratchingRef = useRef(false);
  const lastTimeRef = useRef<number | null>(null);

  // Scratch / Jog-wheel physics refs & state
  const recordRef = useRef<HTMLDivElement>(null);
  const centerRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const lastAngleRef = useRef(0);
  const startSeekTimeRef = useRef(0);
  const accumulatedDeltaAngleRef = useRef(0);
  const totalPointerDistanceRef = useRef(0);
  const lastSeekEmitRef = useRef(0);

  const [isScratching, setIsScratching] = useState(false);
  const [scrubDeltaSeconds, setScrubDeltaSeconds] = useState(0);
  const [scrubPreviewTime, setScrubPreviewTime] = useState(0);

  // Platter Drop-Zone state
  const [isDragOverPlatter, setIsDragOverPlatter] = useState(false);
  const [isDroppingDisc, setIsDroppingDisc] = useState(false);

  // Reset lastTimeRef when isPlaying changes so rotation resumes smoothly
  useEffect(() => {
    lastTimeRef.current = null;
    if (recordRef.current) {
      recordRef.current.style.transform = `rotate(${angleRef.current}deg) scale(${isDroppingDisc ? 1.08 : 1})`;
    }
  }, [isPlaying, isDroppingDisc]);

  // Continuous realistic turntable motor rotation loop
  useEffect(() => {
    let animId: number;
    const rpm = speed === 78 ? 78 : speed === 45 ? 45 : 33.33;
    const speedMultiplier = 1 + pitch / 100;
    const degreesPerSecond = (rpm / 60) * 360 * speedMultiplier;

    const tick = (now: number) => {
      if (lastTimeRef.current !== null && isPlaying && !isScratchingRef.current) {
        const dt = (now - lastTimeRef.current) / 1000;
        // Continuous, smooth forward rotation without modulo 360 wrap-around
        angleRef.current += degreesPerSecond * dt;
        if (recordRef.current) {
          recordRef.current.style.transform = `rotate(${angleRef.current}deg) scale(${isDroppingDisc ? 1.08 : 1})`;
        }
      }
      lastTimeRef.current = now;
      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, speed, pitch, isDroppingDisc]);

  // Throttled seek callback for scrubbing
  const throttledSeek = useCallback(
    (targetTime: number) => {
      const now = Date.now();
      if (now - lastSeekEmitRef.current > 50) {
        lastSeekEmitRef.current = now;
        onSeek?.(targetTime);
      }
    },
    [onSeek]
  );

  // --- Vinyl Disc Pointer Scratching / Jog-Wheel Handlers ---

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return; // Only main left-click
    e.preventDefault();
    e.stopPropagation();

    if (!recordRef.current) return;
    const rect = recordRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    centerRef.current = { x: cx, y: cy };

    const initialAngle = Math.atan2(e.clientY - cy, e.clientX - cx);
    lastAngleRef.current = initialAngle;
    startSeekTimeRef.current = currentTime;
    accumulatedDeltaAngleRef.current = 0;
    totalPointerDistanceRef.current = 0;

    isScratchingRef.current = true;
    setIsScratching(true);
    setScrubDeltaSeconds(0);
    setScrubPreviewTime(currentTime);

    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isScratchingRef.current) return;
    e.preventDefault();

    const cx = centerRef.current.x;
    const cy = centerRef.current.y;
    const currentAngle = Math.atan2(e.clientY - cy, e.clientX - cx);

    let delta = currentAngle - lastAngleRef.current;
    // Unwrap angle between -PI and PI
    if (delta > Math.PI) delta -= 2 * Math.PI;
    if (delta < -Math.PI) delta += 2 * Math.PI;

    lastAngleRef.current = currentAngle;
    accumulatedDeltaAngleRef.current += delta;
    totalPointerDistanceRef.current += Math.abs(delta);

    // Update physical rotation angle smoothly without modulo 360
    angleRef.current += (delta * 180) / Math.PI;
    if (recordRef.current) {
      recordRef.current.style.transform = `rotate(${angleRef.current}deg) scale(${isDroppingDisc ? 1.08 : 1})`;
    }

    // 1 full 360° turn (2 * PI radians) = 15 seconds scrub
    const SECONDS_PER_TURN = 15;
    const timeOffset = (accumulatedDeltaAngleRef.current / (2 * Math.PI)) * SECONDS_PER_TURN;
    setScrubDeltaSeconds(timeOffset);

    const maxDur = duration > 0 ? duration : 240;
    const targetSeek = Math.max(0, Math.min(maxDur, startSeekTimeRef.current + timeOffset));
    setScrubPreviewTime(targetSeek);

    throttledSeek(targetSeek);
    audioEngine.triggerScratch(Math.abs(delta) * 16);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isScratchingRef.current) return;
    e.preventDefault();

    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }

    isScratchingRef.current = false;
    setIsScratching(false);

    // If pointer barely moved, treat it as a click to toggle play/pause
    if (totalPointerDistanceRef.current < 0.08) {
      onTogglePlay();
    } else {
      // Commit final scrub position to audio engine
      const maxDur = duration > 0 ? duration : 240;
      const finalSeek = Math.max(
        0,
        Math.min(maxDur, startSeekTimeRef.current + (accumulatedDeltaAngleRef.current / (2 * Math.PI)) * 15)
      );
      onSeek?.(finalSeek);
    }

    setTimeout(() => {
      setScrubDeltaSeconds(0);
    }, 1200);
  };

  // --- Drag and Drop Song onto Turntable Platter ---

  const handlePlatterDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    if (!isDragOverPlatter) setIsDragOverPlatter(true);
  };

  const handlePlatterDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    if (
      e.clientX <= rect.left ||
      e.clientX >= rect.right ||
      e.clientY <= rect.top ||
      e.clientY >= rect.bottom
    ) {
      setIsDragOverPlatter(false);
    }
  };

  const handlePlatterDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOverPlatter(false);

    try {
      const trackJson = e.dataTransfer.getData('application/json');
      if (trackJson) {
        const track: Track = JSON.parse(trackJson);
        setIsDroppingDisc(true);
        audioEngine.triggerNeedleDrop();
        onDropTrack?.(track);
        setTimeout(() => setIsDroppingDisc(false), 700);
      }
    } catch (err) {
      console.warn('Could not parse dropped track:', err);
    }
  };

  // Compute tonearm tracking angle: 0deg when at rest; 19deg (outer groove) to 27deg (inner groove)
  const displayTime = isScratching ? scrubPreviewTime : currentTime;
  const progressRatio = duration > 0 ? Math.min(1, Math.max(0, displayTime / duration)) : 0;
  const tonearmAngle = isPlaying || isScratching ? 19 + progressRatio * 8 : 0;

  return (
    <div
      style={{
        position: 'relative',
        background: 'linear-gradient(145deg, #141619 0%, #0d0e11 100%)',
        border: isDragOverPlatter ? '1px solid #d4af37' : '1px solid #262930',
        boxShadow: isDragOverPlatter
          ? '0 0 25px rgba(212, 175, 55, 0.25), inset 0 1px 0 rgba(255,255,255,0.06)'
          : 'inset 0 1px 0 rgba(255,255,255,0.06), 0 20px 40px rgba(0,0,0,0.85)',
        width: '100%',
        maxWidth: '560px',
        aspectRatio: '1 / 0.95',
        margin: '0 auto',
        padding: '24px 26px 20px 26px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        userSelect: 'none',
        transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
      }}
    >
      {/* 4 Corner Industrial Hex Bolts */}
      <div style={{ position: 'absolute', top: '10px', left: '10px', width: '9px', height: '9px', borderRadius: '50%', background: '#30333c', border: '1px solid #1a1b20', boxShadow: 'inset 0 1px 1px #555', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '5px', height: '1px', background: '#111' }} />
      </div>
      <div style={{ position: 'absolute', top: '10px', right: '10px', width: '9px', height: '9px', borderRadius: '50%', background: '#30333c', border: '1px solid #1a1b20', boxShadow: 'inset 0 1px 1px #555', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '5px', height: '1px', background: '#111' }} />
      </div>
      <div style={{ position: 'absolute', bottom: '10px', left: '10px', width: '9px', height: '9px', borderRadius: '50%', background: '#30333c', border: '1px solid #1a1b20', boxShadow: 'inset 0 1px 1px #555', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '5px', height: '1px', background: '#111' }} />
      </div>
      <div style={{ position: 'absolute', bottom: '10px', right: '10px', width: '9px', height: '9px', borderRadius: '50%', background: '#30333c', border: '1px solid #1a1b20', boxShadow: 'inset 0 1px 1px #555', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '5px', height: '1px', background: '#111' }} />
      </div>

      {/* Turntable Top Chassis Header Labels */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
        <div>
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '10px',
              fontWeight: 700,
              color: '#d4af37',
              letterSpacing: '0.14em',
              lineHeight: 1.2,
            }}
          >
            MI6 AUDIO ARCHIVE
          </div>
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '7.5px',
              color: '#656975',
              letterSpacing: '0.12em',
            }}
          >
            {isScratching ? 'TACTILE JOG-WHEEL SCRUBBING ACTIVE' : 'DIRECT-DRIVE QUARTZ PLATTER'}
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '8.5px',
              color: '#8b8e99',
              letterSpacing: '0.14em',
              fontWeight: 600,
              lineHeight: 1.2,
            }}
          >
            MODEL 007-A
          </div>
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '7px',
              color: '#555861',
              letterSpacing: '0.1em',
            }}
          >
            ROTATE DISC TO SCRUB • DROP TRACK TO PLAY
          </div>
        </div>
      </div>

      {/* Main Platter & Tonearm Assembly Stage */}
      <div
        style={{
          position: 'relative',
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 0,
        }}
      >
        {/* Outer Heavy Turntable Platter Basin & Drop Zone */}
        <div
          onDragOver={handlePlatterDragOver}
          onDragLeave={handlePlatterDragLeave}
          onDrop={handlePlatterDrop}
          style={{
            position: 'relative',
            width: '82%',
            aspectRatio: '1 / 1',
            borderRadius: '50%',
            background: isDragOverPlatter
              ? 'radial-gradient(circle, #252830 0%, #15181f 65%, #0d0f12 100%)'
              : 'radial-gradient(circle, #1e2127 0%, #111317 65%, #08090a 100%)',
            border: isDragOverPlatter ? '2px solid #d4af37' : '2px solid #2e323b',
            boxShadow: isDragOverPlatter
              ? '0 0 35px rgba(212, 175, 55, 0.4), inset 0 0 25px rgba(212,175,55,0.2)'
              : isScratching
              ? '0 15px 35px rgba(212, 175, 55, 0.25), inset 0 2px 6px rgba(0,0,0,0.8)'
              : '0 12px 30px rgba(0,0,0,0.9), inset 0 2px 6px rgba(0,0,0,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
          }}
        >
          {/* Stroboscopic Rim Dots */}
          <div
            style={{
              position: 'absolute',
              inset: '4px',
              borderRadius: '50%',
              border: '1px dashed rgba(255,255,255,0.14)',
              pointerEvents: 'none',
            }}
          />

          {/* Interactive Rotating Vinyl Record Disk */}
          <div
            ref={recordRef}
            className={`vinyl-record ${isDroppingDisc ? 'dropping-disc' : ''}`}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            title="Rotate disc clockwise to fast-forward, counter-clockwise to rewind"
            style={{
              position: 'relative',
              width: '92%',
              height: '92%',
              borderRadius: '50%',
              background: 'radial-gradient(circle, #16171a 0%, #0d0e10 100%)',
              boxShadow: isScratching
                ? '0 8px 30px rgba(212, 175, 55, 0.4), inset 0 0 25px rgba(0,0,0,0.9)'
                : '0 8px 25px rgba(0,0,0,0.95), inset 0 0 15px rgba(0,0,0,0.9)',
              cursor: isScratching ? 'grabbing' : 'grab',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: isDroppingDisc
                ? 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                : 'none',
              touchAction: 'none',
              userSelect: 'none',
            }}
          >
            {/* Concentric Vinyl Grooves Micro-Rings */}
            <div
              style={{
                position: 'absolute',
                inset: '6px',
                borderRadius: '50%',
                border: '1px solid rgba(255,255,255,0.04)',
                boxShadow: `
                  inset 0 0 0 10px #0e1012,
                  inset 0 0 0 12px rgba(255,255,255,0.03),
                  inset 0 0 0 22px #0c0d0f,
                  inset 0 0 0 24px rgba(255,255,255,0.04),
                  inset 0 0 0 36px #0b0c0d,
                  inset 0 0 0 38px rgba(255,255,255,0.03),
                  inset 0 0 0 52px #0a0b0c,
                  inset 0 0 0 54px rgba(255,255,255,0.04)
                `,
                pointerEvents: 'none',
              }}
            />

            {/* Anisotropic Specular Sheen (Vinyl Light Reflection Flares) */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                borderRadius: '50%',
                background:
                  'conic-gradient(from 45deg, transparent 0deg, rgba(255,255,255,0.08) 35deg, transparent 70deg, transparent 180deg, rgba(255,255,255,0.08) 215deg, transparent 250deg)',
                pointerEvents: 'none',
                opacity: 0.85,
              }}
            />

            {/* Center Vinyl Paper Label (Real Song Cover Artwork) */}
            <div
              style={{
                position: 'relative',
                width: '38%',
                height: '38%',
                borderRadius: '50%',
                background: '#0e1014',
                border: isScratching ? '2.5px solid #ffffff' : '2.5px solid #d4af37',
                boxShadow: isScratching
                  ? '0 0 16px rgba(212,175,55,0.8), inset 0 0 10px rgba(212,175,55,0.4)'
                  : '0 0 12px rgba(0,0,0,0.9), inset 0 0 8px rgba(0,0,0,0.6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                zIndex: 2,
                transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
              }}
            >
              {/* Full Color Real Song Cover Photo */}
              {currentTrack?.thumbnail ? (
                <img
                  src={currentTrack.thumbnail}
                  alt={currentTrack.title}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
              ) : (
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'radial-gradient(circle, #252830 0%, #0d0e11 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Disc size={28} color="#d4af37" opacity={0.6} />
                </div>
              )}

              {/* Concentric Vinyl Paper Ring Overlay Line */}
              <div
                style={{
                  position: 'absolute',
                  inset: '3px',
                  borderRadius: '50%',
                  border: '1px solid rgba(255,255,255,0.22)',
                  pointerEvents: 'none',
                }}
              />

              {/* Center Metallic Spindle Hole */}
              <div
                style={{
                  position: 'relative',
                  width: '11px',
                  height: '11px',
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, #f0f0f0 0%, #7a7a7a 65%, #222222 100%)',
                  border: '1.5px solid #000000',
                  boxShadow: '0 0 5px rgba(0,0,0,0.95), inset 0 1px 1px rgba(255,255,255,0.6)',
                  zIndex: 3,
                }}
              />
            </div>
          </div>

          {/* Drag-over Target Overlay (Lights up when dragging a song from tracklist) */}
          {isDragOverPlatter && (
            <div
              style={{
                position: 'absolute',
                inset: '0',
                borderRadius: '50%',
                border: '3px dashed #d4af37',
                boxShadow: '0 0 35px rgba(212, 175, 55, 0.6), inset 0 0 30px rgba(212, 175, 55, 0.25)',
                background: 'rgba(10, 12, 15, 0.85)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 25,
                pointerEvents: 'none',
                backdropFilter: 'blur(3px)',
              }}
            >
              <Disc size={38} color="#d4af37" style={{ marginBottom: '6px' }} />
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  fontWeight: 700,
                  color: '#ffffff',
                  letterSpacing: '0.14em',
                  textShadow: '0 2px 6px rgba(0,0,0,0.9)',
                }}
              >
                DROP VINYL TO PLAY
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '8px',
                  color: '#d4af37',
                  letterSpacing: '0.1em',
                  marginTop: '3px',
                }}
              >
                AUTO-LOAD ONTO SPINDLE
              </div>
            </div>
          )}

          {/* Scrubbing HUD Badge (Visible when dragging / spinning the disc) */}
          {isScratching && (
            <div
              style={{
                position: 'absolute',
                top: '-32px',
                left: '50%',
                transform: 'translateX(-50%)',
                background: 'rgba(10, 11, 14, 0.95)',
                border: '1px solid #d4af37',
                boxShadow: '0 4px 16px rgba(0,0,0,0.9), 0 0 10px rgba(212, 175, 55, 0.3)',
                padding: '4px 12px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                zIndex: 30,
                pointerEvents: 'none',
                whiteSpace: 'nowrap',
              }}
            >
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '9px',
                  fontWeight: 700,
                  color: scrubDeltaSeconds >= 0 ? '#d4af37' : '#e06c75',
                  letterSpacing: '0.12em',
                }}
              >
                {scrubDeltaSeconds >= 0 ? 'FORWARD ►►' : '◄◄ REVERSE'}
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '10px',
                  fontWeight: 700,
                  color: '#ffffff',
                  letterSpacing: '0.08em',
                }}
              >
                {scrubDeltaSeconds >= 0 ? `+${scrubDeltaSeconds.toFixed(1)}s` : `${scrubDeltaSeconds.toFixed(1)}s`}
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '9px',
                  color: '#8b8e99',
                  borderLeft: '1px solid #333',
                  paddingLeft: '8px',
                }}
              >
                {formatTime(scrubPreviewTime)} / {formatTime(duration)}
              </span>
            </div>
          )}
        </div>

        {/* Physical Tonearm Assembly (Positioned Upper-Right) */}
        <div
          style={{
            position: 'absolute',
            top: '-6px',
            right: '18px',
            width: '130px',
            height: '240px',
            pointerEvents: 'none',
            zIndex: 10,
          }}
        >
          {/* Kinematic Pivoting Arm SVG */}
          <div
            style={{
              position: 'absolute',
              top: '20px',
              right: '25px',
              width: '120px',
              height: '220px',
              transformOrigin: '95px 25px',
              transform: `rotate(${tonearmAngle}deg)`,
              transition: isScratching ? 'transform 0.1s linear' : 'transform 0.85s cubic-bezier(0.25, 1, 0.5, 1)',
            }}
          >
            <svg viewBox="0 0 120 220" width="120" height="220" style={{ overflow: 'visible' }}>
              {/* Tonearm S-shaped Metallic Chrome Tube */}
              <path
                d="M 95,25 Q 92,75 75,115 T 45,185"
                fill="none"
                stroke="url(#armChromeGradient)"
                strokeWidth="4"
                strokeLinecap="round"
              />
              <path
                d="M 95,25 Q 92,75 75,115 T 45,185"
                fill="none"
                stroke="rgba(255,255,255,0.7)"
                strokeWidth="1"
                strokeLinecap="round"
              />

              {/* Head-shell / Gold Cartridge with Stylus */}
              <g transform="translate(45, 185) rotate(-18)">
                <rect x="-6" y="0" width="12" height="24" rx="2" fill="#181a1f" stroke="#333742" strokeWidth="1" />
                <rect x="-4" y="14" width="8" height="9" fill="#d4af37" rx="1" />
                {/* Needle Point */}
                <circle cx="0" cy="24" r="1.5" fill="#ffffff" />
                {/* Stylus Illumination Beam when Playing or Scratching */}
                {(isPlaying || isScratching) && (
                  <ellipse cx="0" cy="24" rx="6" ry="3" fill="rgba(212,175,55,0.4)" filter="blur(2px)" />
                )}
              </g>

              {/* Counterweight Cylindrical Ring */}
              <rect x="85" y="0" width="20" height="14" rx="2" fill="#2d3038" stroke="#484d59" strokeWidth="1" />
              <line x1="90" y1="0" x2="90" y2="14" stroke="#666" strokeWidth="0.75" />
              <line x1="95" y1="0" x2="95" y2="14" stroke="#d4af37" strokeWidth="0.75" />
              <line x1="100" y1="0" x2="100" y2="14" stroke="#666" strokeWidth="0.75" />

              {/* Tonearm Base Pivot Cylinder */}
              <circle cx="95" cy="25" r="14" fill="#1a1c22" stroke="#3d424e" strokeWidth="2" />
              <circle cx="95" cy="25" r="8" fill="#2b2e38" stroke="#111" strokeWidth="1" />
              <circle cx="95" cy="25" r="3" fill="#d4af37" />

              {/* Gradients */}
              <defs>
                <linearGradient id="armChromeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#dcdde0" />
                  <stop offset="40%" stopColor="#8c909c" />
                  <stop offset="70%" stopColor="#e8eaed" />
                  <stop offset="100%" stopColor="#4e5159" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>
      </div>

      {/* Turntable Bottom Controls Deck */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          marginTop: '10px',
          paddingTop: '8px',
          borderTop: '1px solid #1f2228',
        }}
      >
        {/* Speed Selector Buttons: 33 / 45 / 78 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
          {([33, 45, 78] as TurntableSpeed[]).map((spd) => {
            const isActive = speed === spd;
            return (
              <button
                key={spd}
                onClick={() => onSpeedChange(spd)}
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '9.5px',
                  fontWeight: 700,
                  width: '26px',
                  height: '20px',
                  border: isActive ? '1px solid #d4af37' : '1px solid #2a2d36',
                  background: isActive ? 'rgba(212,175,55,0.15)' : '#121418',
                  color: isActive ? '#d4af37' : '#5a5e6b',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 0,
                  transition: 'all 0.15s ease',
                  boxShadow: isActive ? '0 0 8px rgba(212,175,55,0.3)' : 'none',
                }}
                title={`Set RPM speed to ${spd}`}
              >
                {spd}
              </button>
            );
          })}
        </div>

        {/* Rotary Power Switch & Speed Stability LED */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Power Switch Dial */}
          <div
            onClick={onTogglePlay}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              cursor: 'pointer',
            }}
            title={isPlaying ? 'Switch turntable motor OFF' : 'Switch turntable motor ON'}
          >
            <div
              style={{
                width: '30px',
                height: '30px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, #252830 0%, #131418 100%)',
                border: '1px solid #3d424f',
                boxShadow: '0 4px 10px rgba(0,0,0,0.8), inset 0 1px 2px rgba(255,255,255,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                transform: isPlaying ? 'rotate(35deg)' : 'rotate(0deg)',
                transition: 'transform 0.25s ease',
              }}
            >
              {/* Power Indicator Pip */}
              <div
                style={{
                  position: 'absolute',
                  top: '3px',
                  width: '3px',
                  height: '6px',
                  borderRadius: '1px',
                  background: isPlaying ? '#d4af37' : '#555861',
                  boxShadow: isPlaying ? '0 0 6px #d4af37' : 'none',
                }}
              />
            </div>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '7.5px',
                letterSpacing: '0.12em',
                color: isPlaying ? '#d4af37' : '#555861',
                marginTop: '4px',
                fontWeight: 600,
              }}
            >
              POWER
            </span>
          </div>

          {/* Speed Stability LED Bar */}
          <div>
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '7.5px',
                color: '#656975',
                letterSpacing: '0.1em',
                marginBottom: '4px',
              }}
            >
              SPEED STABILITY
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '2px',
                height: '5px',
                width: '70px',
                background: '#0a0b0d',
                padding: '1px',
                border: '1px solid #23262f',
              }}
            >
              <div
                style={{
                  flex: 1,
                  height: '100%',
                  background: isPlaying ? '#d4af37' : '#1e2129',
                  boxShadow: isPlaying ? '0 0 4px rgba(212,175,55,0.5)' : 'none',
                  transition: 'background 0.3s ease',
                }}
              />
            </div>
          </div>
        </div>

        {/* Pitch Fine Adjustment Slider */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '7.5px',
              color: '#656975',
              letterSpacing: '0.1em',
              marginBottom: '3px',
            }}
          >
            PITCH {pitch > 0 ? `+${pitch}%` : `${pitch}%`}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '8px', color: '#555861' }}>-</span>
            <input
              type="range"
              min={-8}
              max={8}
              step={0.5}
              value={pitch}
              onChange={(e) => onPitchChange(parseFloat(e.target.value))}
              style={{
                width: '80px',
                height: '2px',
                accentColor: '#d4af37',
                cursor: 'pointer',
              }}
            />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '8px', color: '#555861' }}>+</span>
          </div>
        </div>
      </div>
    </div>
  );
};
