import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Sliders, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';
import { audioEngine } from '../services/audioEngine';
import {
  EQ_FREQUENCIES,
  EQ_FREQ_LABELS,
  EQ_PRESETS,
  loadEqualizerState,
  saveEqualizerState,
  calculate10BandsFromMacro,
  type EqualizerState,
} from '../services/equalizerService';

// Short friendly names for preset chips (strictly no long sentences or paragraphs)
const PRESET_SHORT_NAMES: Record<string, string> = {
  flat: 'FLAT',
  bass_boost: 'BASS+',
  club: 'CLUB',
  vocal: 'VOCAL',
  rock: 'ROCK',
  lofi: 'LO-FI',
  acoustic: 'ACOUSTIC',
  jazz: 'JAZZ',
  electronic: 'ELECTRO',
};

export const SidebarEqualizer: React.FC = () => {
  const [eqState, setEqState] = useState<EqualizerState>(() => loadEqualizerState());
  const [isExpanded, setIsExpanded] = useState<boolean>(() => {
    try {
      return localStorage.getItem('muszix_eq_expanded_v1') === 'true';
    } catch {
      return false;
    }
  });

  const toggleExpand = () => {
    setIsExpanded((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('muszix_eq_expanded_v1', String(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  // Apply state to audio engine and save to local storage
  const applyAndSave = useCallback((newState: EqualizerState) => {
    setEqState(newState);
    saveEqualizerState(newState);
    audioEngine.setEqEnabled(newState.enabled);
    audioEngine.setEqualizerBands(newState.bands);
    audioEngine.setPreamp(newState.preamp);
  }, []);

  // Sync state to audio engine
  useEffect(() => {
    audioEngine.setEqEnabled(eqState.enabled);
    audioEngine.setEqualizerBands(eqState.bands);
    audioEngine.setPreamp(eqState.preamp);
  }, [eqState.enabled, eqState.bands, eqState.preamp]);

  // Toggle EQ bypass / enabled
  const toggleEnabled = () => {
    const next = !eqState.enabled;
    const updated = { ...eqState, enabled: next };
    applyAndSave(updated);
  };

  // Switch between Easy and Advanced modes
  const setMode = (mode: 'easy' | 'advanced') => {
    const updated: EqualizerState = { ...eqState, mode };
    applyAndSave(updated);
  };

  // Preset Selection
  const selectPreset = (presetId: string) => {
    const found = EQ_PRESETS.find((p) => p.id === presetId);
    if (!found) return;

    const updated: EqualizerState = {
      ...eqState,
      selectedPreset: found.id,
      bands: [...found.bands],
      bass: found.bass,
      mid: found.mid,
      treble: found.treble,
    };
    applyAndSave(updated);
  };

  // Macro fader adjustment (Easy mode)
  const handleMacroChange = (param: 'bass' | 'mid' | 'treble', value: number) => {
    const nextBass = param === 'bass' ? value : eqState.bass;
    const nextMid = param === 'mid' ? value : eqState.mid;
    const nextTreb = param === 'treble' ? value : eqState.treble;
    const calculatedBands = calculate10BandsFromMacro(nextBass, nextMid, nextTreb);

    const updated: EqualizerState = {
      ...eqState,
      [param]: value,
      bands: calculatedBands,
      selectedPreset: 'custom',
    };
    applyAndSave(updated);
  };

  // Single ISO band adjustment (Advanced mode)
  const handleBandChange = (index: number, value: number) => {
    const newBands = [...eqState.bands];
    newBands[index] = value;

    const approxBass = Math.round(((newBands[0] + newBands[1]) / 2) * 10) / 10;
    const approxMid = Math.round(newBands[5] * 10) / 10;
    const approxTreb = Math.round(((newBands[8] + newBands[9]) / 2) * 10) / 10;

    const updated: EqualizerState = {
      ...eqState,
      bands: newBands,
      bass: approxBass,
      mid: approxMid,
      treble: approxTreb,
      selectedPreset: 'custom',
    };
    applyAndSave(updated);
  };

  // Reset to neutral flat response
  const handleResetFlat = () => {
    selectPreset('flat');
  };

  // SVG Frequency Response Curve path & gradient area generation
  const { curvePath, areaPath } = useMemo(() => {
    const width = 280;
    const height = 50;
    const midY = height / 2;
    const maxDb = 12;

    const points = eqState.bands.map((db, idx) => {
      const x = (idx / (eqState.bands.length - 1)) * width;
      const effectiveDb = eqState.enabled ? db : 0;
      const y = midY - (effectiveDb / maxDb) * (midY - 6);
      return { x, y };
    });

    if (points.length < 2) return { curvePath: '', areaPath: '' };

    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const cx = (p0.x + p1.x) / 2;
      d += ` C ${cx} ${p0.y}, ${cx} ${p1.y}, ${p1.x} ${p1.y}`;
    }

    const a = `${d} L ${width} ${height} L 0 ${height} Z`;
    return { curvePath: d, areaPath: a };
  }, [eqState.bands, eqState.enabled]);

  // Interactive mouse drag handler for custom vertical faders in Advanced mode
  const handleFaderMouseDown = (idx: number, e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    const trackEl = e.currentTarget;
    const rect = trackEl.getBoundingClientRect();

    const updateValue = (clientY: number) => {
      const frac = Math.max(0, Math.min(1, (rect.bottom - clientY) / rect.height));
      const db = Math.round((frac * 24 - 12) * 2) / 2; // -12dB to +12dB, step 0.5
      handleBandChange(idx, db);
    };

    updateValue(e.clientY);

    const onMouseMove = (me: MouseEvent) => {
      updateValue(me.clientY);
    };

    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  return (
    <div
      style={{
        border: '1px solid var(--border-color)',
        background: 'var(--bg-secondary)',
        fontFamily: 'var(--font-mono)',
        fontSize: '9.5px',
        userSelect: 'none',
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        maxWidth: '100%',
        overflow: 'hidden',
        boxSizing: 'border-box',
      }}
    >
      {/* Header Bar */}
      <div
        onClick={toggleExpand}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 12px',
          borderBottom: isExpanded ? '1px solid var(--border-color)' : 'none',
          background: 'var(--bg-tertiary)',
          overflow: 'hidden',
          cursor: 'pointer',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0 }}>
          <Sliders size={12} color={eqState.enabled ? 'var(--accent-color)' : 'var(--text-muted)'} />
          <span
            style={{
              fontWeight: 700,
              letterSpacing: '0.12em',
              color: 'var(--text-primary)',
              fontSize: '10px',
              whiteSpace: 'nowrap',
            }}
          >
            EQUALIZER
          </span>
          <span
            style={{
              fontSize: '8px',
              padding: '1px 5px',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--accent-color)',
              fontWeight: 600,
            }}
          >
            {PRESET_SHORT_NAMES[eqState.selectedPreset] || eqState.selectedPreset.toUpperCase()}
          </span>
        </div>

        {/* Mode Selector & Power */}
        <div
          style={{ display: 'flex', alignItems: 'center', gap: '5px', flexShrink: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Easy / Advanced Toggle */}
          {isExpanded && (
            <button
              onClick={() => setMode(eqState.mode === 'easy' ? 'advanced' : 'easy')}
              style={{
                background: eqState.mode === 'advanced' ? 'var(--accent-color)' : 'var(--bg-primary)',
                color: eqState.mode === 'advanced' ? 'var(--text-inverse)' : 'var(--text-secondary)',
                border: eqState.mode === 'advanced' ? '1px solid var(--accent-color)' : '1px solid var(--border-bright)',
                padding: '3px 7px',
                fontSize: '8px',
                fontWeight: 700,
                letterSpacing: '0.08em',
                cursor: 'pointer',
                transition: 'all 0.12s ease',
              }}
              title={eqState.mode === 'easy' ? 'Switch to 10-Band Advanced Mode' : 'Switch to Easy Mode'}
            >
              {eqState.mode === 'easy' ? 'ADV' : 'EASY'}
            </button>
          )}

          {/* Active / Bypass Toggle */}
          <button
            onClick={toggleEnabled}
            style={{
              background: eqState.enabled ? 'rgba(74, 222, 128, 0.15)' : 'transparent',
              color: eqState.enabled ? 'var(--status-active)' : 'var(--text-muted)',
              border: eqState.enabled ? '1px solid var(--status-active)' : '1px solid var(--border-subtle)',
              padding: '3px 7px',
              fontSize: '8px',
              fontWeight: 700,
              letterSpacing: '0.08em',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              transition: 'all 0.12s ease',
            }}
            title={eqState.enabled ? 'Bypass Equalizer' : 'Engage Equalizer'}
          >
            <span
              style={{
                width: '5px',
                height: '5px',
                borderRadius: '50%',
                background: eqState.enabled ? 'var(--status-active)' : 'var(--text-muted)',
                boxShadow: eqState.enabled ? '0 0 5px var(--status-active)' : 'none',
              }}
            />
            {eqState.enabled ? 'ON' : 'OFF'}
          </button>

          {/* Collapse/Expand Toggle Chevron */}
          <button
            onClick={toggleExpand}
            className="bma-btn-icon"
            style={{ padding: '2px 4px' }}
            title={isExpanded ? 'Collapse Equalizer' : 'Expand Equalizer'}
          >
            {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <>
      {/* Dynamic Visual Frequency Response Curve Screen */}
      <div
        style={{
          padding: '6px 12px 4px 12px',
          background: '#070709',
          borderBottom: '1px solid var(--border-color)',
          overflow: 'hidden',
          boxSizing: 'border-box',
          width: '100%',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '7.5px',
            color: 'var(--text-muted)',
            marginBottom: '3px',
            letterSpacing: '0.08em',
          }}
        >
          <span>32 Hz</span>
          <span style={{ color: eqState.enabled ? 'var(--accent-color)' : 'var(--text-muted)', fontWeight: 600 }}>
            {eqState.selectedPreset.toUpperCase()} CURVE
          </span>
          <span>16 kHz</span>
        </div>

        <svg
          viewBox="0 0 280 50"
          preserveAspectRatio="none"
          style={{ width: '100%', height: '42px', display: 'block' }}
        >
          <defs>
            <linearGradient id="eqCurveGradientV2" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={eqState.enabled ? 'var(--accent-color)' : '#666'} stopOpacity="0.22" />
              <stop offset="100%" stopColor={eqState.enabled ? 'var(--accent-color)' : '#666'} stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Reference dB Horizontal Grid Lines */}
          <line x1="0" y1="9" x2="280" y2="9" stroke="var(--border-subtle)" strokeWidth="0.75" strokeDasharray="2 4" />
          <line x1="0" y1="25" x2="280" y2="25" stroke="var(--border-bright)" strokeWidth="1" strokeDasharray="3 3" />
          <line x1="0" y1="41" x2="280" y2="41" stroke="var(--border-subtle)" strokeWidth="0.75" strokeDasharray="2 4" />

          {/* Shaded Area Under Curve */}
          <path d={areaPath} fill="url(#eqCurveGradientV2)" />

          {/* Dynamic Frequency Line */}
          <path
            d={curvePath}
            fill="none"
            stroke={eqState.enabled ? 'var(--accent-color)' : 'var(--text-muted)'}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              filter: eqState.enabled ? 'drop-shadow(0 0 4px var(--accent-subtle))' : 'none',
              transition: 'd 0.12s ease',
            }}
          />

          {/* Control point markers */}
          {eqState.bands.map((db, idx) => {
            const x = (idx / (eqState.bands.length - 1)) * 280;
            const effectiveDb = eqState.enabled ? db : 0;
            const y = 25 - (effectiveDb / 12) * 19;
            return (
              <circle
                key={idx}
                cx={x}
                cy={y}
                r="2.5"
                fill={eqState.enabled ? 'var(--text-primary)' : 'var(--text-muted)'}
                stroke={eqState.enabled ? 'var(--accent-color)' : '#444'}
                strokeWidth="1"
              />
            );
          })}
        </svg>
      </div>

      {/* Preset Chips Row (Shared across Easy & Advanced) */}
      <div
        style={{
          padding: '8px 12px',
          borderBottom: '1px solid var(--border-subtle)',
          background: 'var(--bg-secondary)',
          boxSizing: 'border-box',
          width: '100%',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '8px',
            color: 'var(--text-muted)',
            marginBottom: '6px',
            letterSpacing: '0.1em',
          }}
        >
          <span>SOUND PROFILES</span>
          <button
            onClick={handleResetFlat}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              fontSize: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '3px',
              padding: '2px 4px',
              transition: 'color 0.12s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
            title="Reset to Flat Reference Curve (0 dB)"
          >
            <RotateCcw size={8} /> RESET FLAT
          </button>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(64px, 1fr))',
            gap: '4px',
            width: '100%',
            boxSizing: 'border-box',
          }}
        >
          {EQ_PRESETS.map((p) => {
            const isSelected = eqState.selectedPreset === p.id;
            const shortName = PRESET_SHORT_NAMES[p.id] || p.name;
            return (
              <button
                key={p.id}
                onClick={() => selectPreset(p.id)}
                style={{
                  background: isSelected ? 'var(--text-primary)' : 'var(--bg-tertiary)',
                  color: isSelected ? 'var(--text-inverse)' : 'var(--text-secondary)',
                  border: isSelected ? '1px solid var(--text-primary)' : '1px solid var(--border-subtle)',
                  padding: '5px 4px',
                  fontSize: '8px',
                  fontWeight: isSelected ? 700 : 500,
                  letterSpacing: '0.04em',
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'all 0.12s ease',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.borderColor = 'var(--border-bright)';
                    e.currentTarget.style.color = 'var(--text-primary)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.borderColor = 'var(--border-subtle)';
                    e.currentTarget.style.color = 'var(--text-secondary)';
                  }
                }}
                title={p.description}
              >
                {shortName}
              </button>
            );
          })}
        </div>
      </div>

      {/* ============================================================ */}
      {/* EASY MODE: 3 MACRO FADERS (BASS, MID, TREBLE)                */}
      {/* ============================================================ */}
      {eqState.mode === 'easy' ? (
        <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '10px', boxSizing: 'border-box' }}>
          {/* Bass Fader Card */}
          <div
            style={{
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border-subtle)',
              padding: '8px 10px',
              boxSizing: 'border-box',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
              <div>
                <span style={{ color: 'var(--text-primary)', fontWeight: 700, letterSpacing: '0.08em', fontSize: '9.5px' }}>
                  BASS
                </span>
                <span style={{ fontSize: '7.5px', color: 'var(--text-muted)', marginLeft: '6px' }}>
                  100 Hz • LOW END
                </span>
              </div>
              <span
                style={{
                  color: eqState.bass !== 0 ? 'var(--accent-color)' : 'var(--text-muted)',
                  fontWeight: 700,
                  fontSize: '10px',
                }}
              >
                {eqState.bass > 0 ? `+${eqState.bass.toFixed(1)}` : eqState.bass.toFixed(1)} dB
              </span>
            </div>
            <input
              type="range"
              min="-12"
              max="12"
              step="0.5"
              value={eqState.bass}
              onChange={(e) => handleMacroChange('bass', parseFloat(e.target.value))}
              onDoubleClick={() => handleMacroChange('bass', 0)}
              style={{
                width: '100%',
                height: '5px',
                accentColor: 'var(--accent-color)',
                cursor: 'pointer',
                display: 'block',
              }}
              title="Drag to adjust bass. Double-click to reset to 0dB."
            />
          </div>

          {/* Mid Fader Card */}
          <div
            style={{
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border-subtle)',
              padding: '8px 10px',
              boxSizing: 'border-box',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
              <div>
                <span style={{ color: 'var(--text-primary)', fontWeight: 700, letterSpacing: '0.08em', fontSize: '9.5px' }}>
                  MID
                </span>
                <span style={{ fontSize: '7.5px', color: 'var(--text-muted)', marginLeft: '6px' }}>
                  1 kHz • VOCALS
                </span>
              </div>
              <span
                style={{
                  color: eqState.mid !== 0 ? 'var(--accent-color)' : 'var(--text-muted)',
                  fontWeight: 700,
                  fontSize: '10px',
                }}
              >
                {eqState.mid > 0 ? `+${eqState.mid.toFixed(1)}` : eqState.mid.toFixed(1)} dB
              </span>
            </div>
            <input
              type="range"
              min="-12"
              max="12"
              step="0.5"
              value={eqState.mid}
              onChange={(e) => handleMacroChange('mid', parseFloat(e.target.value))}
              onDoubleClick={() => handleMacroChange('mid', 0)}
              style={{
                width: '100%',
                height: '5px',
                accentColor: 'var(--accent-color)',
                cursor: 'pointer',
                display: 'block',
              }}
              title="Drag to adjust mid. Double-click to reset to 0dB."
            />
          </div>

          {/* Treble Fader Card */}
          <div
            style={{
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border-subtle)',
              padding: '8px 10px',
              boxSizing: 'border-box',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
              <div>
                <span style={{ color: 'var(--text-primary)', fontWeight: 700, letterSpacing: '0.08em', fontSize: '9.5px' }}>
                  TREBLE
                </span>
                <span style={{ fontSize: '7.5px', color: 'var(--text-muted)', marginLeft: '6px' }}>
                  8 kHz • AIR
                </span>
              </div>
              <span
                style={{
                  color: eqState.treble !== 0 ? 'var(--accent-color)' : 'var(--text-muted)',
                  fontWeight: 700,
                  fontSize: '10px',
                }}
              >
                {eqState.treble > 0 ? `+${eqState.treble.toFixed(1)}` : eqState.treble.toFixed(1)} dB
              </span>
            </div>
            <input
              type="range"
              min="-12"
              max="12"
              step="0.5"
              value={eqState.treble}
              onChange={(e) => handleMacroChange('treble', parseFloat(e.target.value))}
              onDoubleClick={() => handleMacroChange('treble', 0)}
              style={{
                width: '100%',
                height: '5px',
                accentColor: 'var(--accent-color)',
                cursor: 'pointer',
                display: 'block',
              }}
              title="Drag to adjust treble. Double-click to reset to 0dB."
            />
          </div>

          {/* Preamp Output Trim */}
          <div
            style={{
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border-subtle)',
              padding: '8px 10px',
              boxSizing: 'border-box',
              width: '100%',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
              <div>
                <span style={{ color: 'var(--text-primary)', fontWeight: 700, letterSpacing: '0.08em', fontSize: '9.5px' }}>
                  PREAMP TRIM
                </span>
                <span style={{ fontSize: '7.5px', color: 'var(--text-muted)', marginLeft: '6px' }}>
                  OUTPUT GAIN
                </span>
              </div>
              <span
                style={{
                  color: eqState.preamp !== 0 ? 'var(--accent-color)' : 'var(--text-muted)',
                  fontWeight: 700,
                  fontSize: '10px',
                }}
              >
                {eqState.preamp > 0 ? `+${eqState.preamp.toFixed(1)}` : eqState.preamp.toFixed(1)} dB
              </span>
            </div>
            <input
              type="range"
              min="-6"
              max="6"
              step="0.5"
              value={eqState.preamp}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                const updated = { ...eqState, preamp: val };
                applyAndSave(updated);
              }}
              onDoubleClick={() => {
                const updated = { ...eqState, preamp: 0 };
                applyAndSave(updated);
              }}
              style={{
                width: '100%',
                height: '5px',
                accentColor: 'var(--accent-color)',
                cursor: 'pointer',
                display: 'block',
                boxSizing: 'border-box',
              }}
              title="Preamp Output Trim (-6dB to +6dB). Double click to reset to 0dB."
            />
          </div>
        </div>
      ) : (
        /* ============================================================ */
        /* ADVANCED MODE: 10-BAND ISO GRAPHIC EQUALIZER RACK            */
        /* ============================================================ */
        <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '10px', boxSizing: 'border-box', width: '100%', overflow: 'hidden' }}>
          {/* 10 Precision Interactive Vertical Faders Rack */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(10, 1fr)',
              gap: '2px',
              background: '#070709',
              padding: '10px 4px',
              border: '1px solid var(--border-color)',
              position: 'relative',
              boxSizing: 'border-box',
              width: '100%',
            }}
          >
            {/* Horizontal 0dB Reference Guideline */}
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: 0,
                right: 0,
                height: '1px',
                background: 'var(--border-bright)',
                pointerEvents: 'none',
                zIndex: 1,
              }}
            />

            {eqState.bands.map((db, idx) => {
              // Percentage height of slider handle: 0dB is 50%, +12dB is 100%, -12dB is 0%
              const frac = (db + 12) / 24;
              const handleBottomPct = Math.round(frac * 100);

              return (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px',
                    boxSizing: 'border-box',
                    overflow: 'hidden',
                  }}
                >
                  {/* dB readout */}
                  <span
                    style={{
                      fontSize: '7px',
                      color: db !== 0 ? 'var(--accent-color)' : 'var(--text-muted)',
                      fontWeight: 700,
                      lineHeight: 1,
                    }}
                  >
                    {db > 0 ? `+${Math.round(db)}` : Math.round(db)}
                  </span>

                  {/* Tactile Vertical Fader Slot (Click or Drag anywhere to set) */}
                  <div
                    onMouseDown={(e) => handleFaderMouseDown(idx, e)}
                    onDoubleClick={() => handleBandChange(idx, 0)}
                    style={{
                      position: 'relative',
                      width: '100%',
                      height: '84px',
                      cursor: 'ns-resize',
                      display: 'flex',
                      justifyContent: 'center',
                      background: 'rgba(255,255,255,0.02)',
                    }}
                    title={`${EQ_FREQUENCIES[idx]} Hz: ${db} dB (Click & drag, double-click to zero)`}
                  >
                    {/* Vertical Slot Groove */}
                    <div
                      style={{
                        position: 'absolute',
                        top: '4px',
                        bottom: '4px',
                        width: '2px',
                        background: 'var(--border-subtle)',
                        borderRadius: '1px',
                      }}
                    />

                    {/* Active Accent Bar from center 0dB to handle */}
                    <div
                      style={{
                        position: 'absolute',
                        width: '3px',
                        left: 'calc(50% - 1.5px)',
                        top: db >= 0 ? `${100 - handleBottomPct}%` : '50%',
                        height: db >= 0 ? `${handleBottomPct - 50}%` : `${50 - handleBottomPct}%`,
                        background: 'var(--accent-color)',
                        opacity: db !== 0 ? 0.8 : 0,
                        transition: 'height 0.05s ease',
                      }}
                    />

                    {/* Draggable Fader Knob */}
                    <div
                      style={{
                        position: 'absolute',
                        bottom: `calc(${handleBottomPct}% - 6px)`,
                        left: 'calc(50% - 7px)',
                        width: '14px',
                        height: '12px',
                        background: 'var(--text-primary)',
                        border: '1px solid var(--accent-color)',
                        borderRadius: '1px',
                        boxShadow: db !== 0 ? '0 0 6px var(--accent-subtle)' : 'none',
                        zIndex: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {/* Center Grip Line on Knob */}
                      <div style={{ width: '8px', height: '1.5px', background: 'var(--text-inverse)' }} />
                    </div>
                  </div>

                  {/* Frequency Label */}
                  <span
                    style={{
                      fontSize: '7px',
                      color: 'var(--text-secondary)',
                      lineHeight: 1,
                      letterSpacing: '-0.02em',
                      fontWeight: 600,
                    }}
                  >
                    {EQ_FREQ_LABELS[idx]}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Preamp Trim & Station Telemetry */}
          <div
            style={{
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border-subtle)',
              padding: '8px 10px',
              boxSizing: 'border-box',
              width: '100%',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
              <div>
                <span style={{ color: 'var(--text-primary)', fontWeight: 700, letterSpacing: '0.08em', fontSize: '9.5px' }}>
                  PREAMP TRIM
                </span>
                <span style={{ fontSize: '7.5px', color: 'var(--text-muted)', marginLeft: '6px' }}>
                  MASTER GAIN
                </span>
              </div>
              <span
                style={{
                  color: eqState.preamp !== 0 ? 'var(--accent-color)' : 'var(--text-muted)',
                  fontWeight: 700,
                  fontSize: '10px',
                }}
              >
                {eqState.preamp > 0 ? `+${eqState.preamp.toFixed(1)}` : eqState.preamp.toFixed(1)} dB
              </span>
            </div>
            <input
              type="range"
              min="-6"
              max="6"
              step="0.5"
              value={eqState.preamp}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                const updated = { ...eqState, preamp: val };
                applyAndSave(updated);
              }}
              onDoubleClick={() => {
                const updated = { ...eqState, preamp: 0 };
                applyAndSave(updated);
              }}
              style={{
                width: '100%',
                height: '5px',
                accentColor: 'var(--accent-color)',
                cursor: 'pointer',
                display: 'block',
                boxSizing: 'border-box',
              }}
              title="Preamp Output Trim (-6dB to +6dB). Double click to reset to 0dB."
            />
          </div>
        </div>
      )}
      </>
      )}
    </div>
  );
};
