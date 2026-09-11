import React, { useEffect, useRef, useState, useCallback } from 'react';
import { audioEngine } from '../services/audioEngine';
import type { Track } from '../types';

interface MasterWaveformProps {
  track: Track | null;
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  onSeek: (seconds: number) => void;
  height?: number;
  showTimeLabels?: boolean;
  compact?: boolean;
}

// Deterministic seed generation based on track metadata
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

// Pseudo-random generator with seed
function pseudoRandom(seed: number): () => number {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

// Generates an authentic, structured audio mastering waveform profile
function generateWaveformProfile(trackId: string, title: string, duration: number, numBars: number): number[] {
  const seed = hashString(`${trackId}-${title}-${duration}`);
  const rand = pseudoRandom(seed);
  const bars: number[] = [];

  for (let i = 0; i < numBars; i++) {
    const p = i / (numBars - 1 || 1);

    // Realistic musical envelope curve
    let structure = 0.35;
    if (p < 0.12) {
      // Intro ramp
      structure = 0.18 + (p / 0.12) * 0.32;
    } else if (p < 0.34) {
      // Verse 1 / Groove
      structure = 0.42 + Math.sin((p - 0.12) * 16) * 0.18;
    } else if (p < 0.44) {
      // Build-up / Riser
      structure = 0.52 + ((p - 0.34) / 0.1) * 0.34;
    } else if (p < 0.65) {
      // Main Chorus / Drop 1
      structure = 0.72 + Math.sin((p - 0.44) * 22) * 0.22;
    } else if (p < 0.76) {
      // Breakdown / Ambient bridge
      structure = 0.28 + Math.sin((p - 0.65) * 14) * 0.15;
    } else if (p < 0.9) {
      // Climax / Outro peak
      structure = 0.78 + Math.cos((p - 0.76) * 24) * 0.18;
    } else {
      // Outro fade
      structure = 0.6 * (1 - (p - 0.9) / 0.1) + 0.12;
    }

    // Micro acoustic dynamics (transients, drum spikes, harmonics)
    const micro = (rand() * 0.5 + rand() * 0.5) - 0.5;
    const harmonic = Math.sin(p * 36 * Math.PI) * 0.08;

    const val = Math.max(0.14, Math.min(1.0, structure + micro + harmonic));
    bars.push(val);
  }

  return bars;
}

// Global cache for calculated profiles
const profileCache = new Map<string, number[]>();

export const MasterWaveform: React.FC<MasterWaveformProps> = ({
  track,
  currentTime,
  duration,
  isPlaying,
  onSeek,
  height = 34,
  showTimeLabels = true,
  compact = false,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [containerWidth, setContainerWidth] = useState<number>(compact ? 240 : 540);
  const [isScrubbing, setIsScrubbing] = useState<boolean>(false);
  const [hoverState, setHoverState] = useState<{ x: number; time: number } | null>(null);
  const [showRemainingTime, setShowRemainingTime] = useState<boolean>(false);

  const animationFrameRef = useRef<number | null>(null);
  const smoothedBoostsRef = useRef<Float32Array>(new Float32Array(160));
  const isScrubbingRef = useRef<boolean>(false);
  isScrubbingRef.current = isScrubbing;

  // Number of bars based on width
  const barWidth = compact ? 2 : 2.5;
  const barGap = compact ? 1.5 : 1.5;
  const numBars = Math.max(30, Math.floor(containerWidth / (barWidth + barGap)));

  // Format time utility
  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) secs = 0;
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Measure container width responsively
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const updateWidth = () => {
      const rect = el.getBoundingClientRect();
      if (rect.width > 0) {
        setContainerWidth(Math.floor(rect.width));
      }
    };

    updateWidth();

    const ro = new ResizeObserver(updateWidth);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Retrieve or compute waveform profile
  const waveformProfile = React.useMemo(() => {
    if (!track) {
      // Return subtle idle pattern
      return Array.from({ length: numBars }, (_, i) => 0.2 + Math.sin(i * 0.4) * 0.08);
    }

    const cacheKey = `${track.id}-${numBars}`;
    if (profileCache.has(cacheKey)) {
      return profileCache.get(cacheKey)!;
    }

    const profile = generateWaveformProfile(track.id, track.title, track.duration || 240, numBars);
    profileCache.set(cacheKey, profile);
    return profile;
  }, [track, numBars]);

  // Handle Scrubbing & Global Mouse Events
  const seekFromClientX = useCallback(
    (clientX: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const relativeX = Math.max(0, Math.min(rect.width, clientX - rect.left));
      const ratio = rect.width > 0 ? relativeX / rect.width : 0;
      const targetTime = ratio * (duration || 1);
      onSeek(targetTime);
    },
    [duration, onSeek]
  );

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsScrubbing(true);
    seekFromClientX(e.clientX);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const relativeX = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    const ratio = rect.width > 0 ? relativeX / rect.width : 0;
    const hoverTime = ratio * (duration || 1);

    setHoverState({ x: relativeX, time: hoverTime });

    if (isScrubbingRef.current) {
      seekFromClientX(e.clientX);
    }
  };

  const handleMouseLeave = () => {
    if (!isScrubbingRef.current) {
      setHoverState(null);
    }
  };

  // Global mouseup and mousemove for smooth dragging outside canvas
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (isScrubbingRef.current) {
        seekFromClientX(e.clientX);
      }
    };

    const handleGlobalMouseUp = () => {
      if (isScrubbingRef.current) {
        setIsScrubbing(false);
      }
    };

    window.addEventListener('mousemove', handleGlobalMouseMove);
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [seekFromClientX]);

  // Main Canvas Rendering Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const targetWidth = containerWidth;
    const targetHeight = height;

    canvas.width = targetWidth * dpr;
    canvas.height = targetHeight * dpr;

    let isSubscribed = true;

    const render = () => {
      if (!isSubscribed) return;

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, targetWidth, targetHeight);

      // Read current theme colors dynamically
      const style = getComputedStyle(document.documentElement);
      const colorActive = style.getPropertyValue('--text-primary').trim() || '#ffffff';
      const colorInactive = style.getPropertyValue('--border-bright').trim() || '#555555';
      const colorCenterAxis = style.getPropertyValue('--border-color').trim() || '#222222';
      const colorLive = style.getPropertyValue('--status-live').trim() || '#ef4444';

      // Audio Frequency Reactivity
      const freqData = audioEngine.getFrequencyData();
      const numProfileBars = waveformProfile.length;
      if (smoothedBoostsRef.current.length < numProfileBars) {
        smoothedBoostsRef.current = new Float32Array(numProfileBars);
      }

      const progress = duration > 0 ? Math.max(0, Math.min(1, currentTime / duration)) : 0;
      const playheadX = progress * targetWidth;
      const playheadBarIdx = Math.floor(progress * numProfileBars);

      // Center baseline (asymmetrical: 60% upper positive phase, 40% lower mirror)
      const centerY = Math.floor(targetHeight * 0.6);

      // Draw subtle zero-dB axis line across canvas
      ctx.beginPath();
      ctx.strokeStyle = colorCenterAxis;
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 4]);
      ctx.moveTo(0, centerY);
      ctx.lineTo(targetWidth, centerY);
      ctx.stroke();
      ctx.setLineDash([]); // reset

      // Calculate audio energy
      let totalFreq = 0;
      for (let f = 0; f < freqData.length; f++) totalFreq += freqData[f];
      const avgFreqEnergy = freqData.length > 0 ? totalFreq / (freqData.length * 255) : 0;

      // Draw waveform bars
      const actualTotalBarSpan = numProfileBars * barWidth + (numProfileBars - 1) * barGap;
      const startX = Math.max(0, (targetWidth - actualTotalBarSpan) / 2);

      for (let i = 0; i < numProfileBars; i++) {
        const baseAmp = waveformProfile[i] || 0.2;
        const x = startX + i * (barWidth + barGap);

        // Real-time Audio Reactivity calculation
        let targetBoost = 0;
        if (isPlaying) {
          const binIdx = Math.floor((i / numProfileBars) * freqData.length);
          const binEnergy = (freqData[binIdx] || 0) / 255;
          const distFromPlayhead = Math.abs(i - playheadBarIdx);
          const playheadProximity = Math.max(0, 1 - distFromPlayhead / 8);

          targetBoost = binEnergy * 0.35 + playheadProximity * binEnergy * 0.45 + avgFreqEnergy * 0.15;
        }

        // Smooth damping interpolation (no jitter)
        smoothedBoostsRef.current[i] += (targetBoost - smoothedBoostsRef.current[i]) * 0.25;
        const effectiveAmp = Math.min(1.0, baseAmp * (1 + smoothedBoostsRef.current[i]));

        const upperAvailable = centerY - 2;
        const lowerAvailable = targetHeight - centerY - 2;

        const upperHeight = Math.max(2, Math.round(effectiveAmp * upperAvailable));
        const lowerHeight = Math.max(1, Math.round(effectiveAmp * lowerAvailable * 0.58));

        const isPlayed = x + barWidth <= playheadX;

        // Played vs Unplayed coloration
        if (isPlayed) {
          ctx.fillStyle = colorActive;
        } else {
          // Unplayed bars: subtle semi-transparent theme muted color
          ctx.fillStyle = colorInactive;
        }

        // Upper bar
        ctx.fillRect(x, centerY - upperHeight, barWidth, upperHeight);

        // Lower mirrored bar (1px gap below centerY)
        ctx.fillRect(x, centerY + 1, barWidth, lowerHeight);
      }

      // Draw Precision Playhead Needle
      if (duration > 0 && playheadX >= 0 && playheadX <= targetWidth) {
        ctx.fillStyle = colorActive;
        // 1.5px vertical line
        ctx.fillRect(playheadX - 0.75, 0, 1.5, targetHeight);

        // Precision brutalist indicator notch at top
        ctx.fillStyle = isPlaying ? colorLive : colorActive;
        ctx.fillRect(playheadX - 2, 0, 4, 3);
      }

      // Draw Hover Indicator Line
      if (hoverState && hoverState.x >= 0 && hoverState.x <= targetWidth) {
        ctx.strokeStyle = colorActive;
        ctx.lineWidth = 1;
        ctx.setLineDash([1, 2]);
        ctx.beginPath();
        ctx.moveTo(hoverState.x, 0);
        ctx.lineTo(hoverState.x, targetHeight);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      ctx.restore();

      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      isSubscribed = false;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [
    containerWidth,
    height,
    waveformProfile,
    currentTime,
    duration,
    isPlaying,
    hoverState,
    barWidth,
    barGap,
  ]);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        gap: compact ? '8px' : '14px',
      }}
    >
      {/* Current Time Elapsed */}
      {showTimeLabels && (
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: compact ? '9px' : '10px',
            color: 'var(--text-primary)',
            letterSpacing: '0.04em',
            minWidth: compact ? '32px' : '36px',
            textAlign: 'right',
            userSelect: 'none',
          }}
        >
          {formatTime(currentTime)}
        </div>
      )}

      {/* Waveform Canvas & Scrub Container */}
      <div
        ref={containerRef}
        style={{
          position: 'relative',
          flex: 1,
          height: `${height}px`,
          display: 'flex',
          alignItems: 'center',
          cursor: 'pointer',
        }}
      >
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{
            width: '100%',
            height: `${height}px`,
            display: 'block',
          }}
        />

        {/* Hover Time Tooltip Pill */}
        {hoverState && (
          <div
            style={{
              position: 'absolute',
              left: `${Math.max(16, Math.min(containerWidth - 16, hoverState.x))}px`,
              top: '-18px',
              transform: 'translateX(-50%)',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-bright)',
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-mono)',
              fontSize: '8.5px',
              padding: '1px 5px',
              letterSpacing: '0.06em',
              pointerEvents: 'none',
              whiteSpace: 'nowrap',
              boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
              zIndex: 10,
            }}
          >
            {formatTime(hoverState.time)}
          </div>
        )}
      </div>

      {/* Duration / Remaining Time Display */}
      {showTimeLabels && (
        <div
          onClick={() => setShowRemainingTime((prev) => !prev)}
          title="Click to toggle remaining time"
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: compact ? '9px' : '10px',
            color: 'var(--text-secondary)',
            letterSpacing: '0.04em',
            minWidth: compact ? '32px' : '36px',
            cursor: 'pointer',
            textAlign: 'left',
            userSelect: 'none',
          }}
        >
          {showRemainingTime ? `-${formatTime(Math.max(0, duration - currentTime))}` : formatTime(duration)}
        </div>
      )}
    </div>
  );
};
