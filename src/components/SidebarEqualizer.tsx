import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Sliders, RotateCcw, ChevronDown, ChevronUp, Power } from 'lucide-react';
import { audioEngine } from '../services/audioEngine';
import {
  EQ_PRESETS,
  loadEqualizerState,
  saveEqualizerState,
  type EqualizerState,
} from '../services/equalizerService';

export const SidebarEqualizer: React.FC = () => {
  const [eqState, setEqState] = useState<EqualizerState>(() => loadEqualizerState());
  const [isExpanded, setIsExpanded] = useState<boolean>(() => {
    try {
      return localStorage.getItem('muszix_eq_expanded_v2') !== 'false';
    } catch {
      return true;
    }
  });

  const toggleExpand = () => {
    setIsExpanded((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('muszix_eq_expanded_v2', String(next));
      } catch {}
      return next;
    });
  };

  // Sync state to audio engine and storage
  const applyAndSave = useCallback((newState: EqualizerState) => {
    setEqState(newState);
    saveEqualizerState(newState);
    audioEngine.setEqEnabled(newState.enabled);
    audioEngine.setEqualizerBands(newState.bands);
  }, []);

  useEffect(() => {
    audioEngine.setEqEnabled(eqState.enabled);
    audioEngine.setEqualizerBands(eqState.bands);
  }, [eqState.enabled, eqState.bands]);

  // Toggle EQ power
  const toggleEnabled = (e: React.MouseEvent) => {
    e.stopPropagation();
    const next = !eqState.enabled;
    const updated = { ...eqState, enabled: next };
    applyAndSave(updated);
  };

  // Select Preset
  const selectPreset = (presetId: string) => {
    const found = EQ_PRESETS.find((p) => p.id === presetId);
    if (!found) return;

    const updated: EqualizerState = {
      ...eqState,
      selectedPreset: found.id,
      bands: [...found.bands],
      enabled: true, // Auto-enable when selecting a preset
    };
    applyAndSave(updated);
  };

  // Reset to flat
  const handleResetFlat = (e: React.MouseEvent) => {
    e.stopPropagation();
    selectPreset('flat');
  };

  // Smooth SVG Frequency Curve
  const { curvePath, areaPath } = useMemo(() => {
    const width = 230;
    const height = 44;
    const midY = height / 2;
    const maxDb = 10;

    const points = eqState.bands.map((db, idx) => {
      const x = (idx / (eqState.bands.length - 1)) * width;
      const effectiveDb = eqState.enabled ? db : 0;
      const y = midY - (effectiveDb / maxDb) * (midY - 6);
      return { x, y };
    });

    if (points.length < 2) return { curvePath: '', areaPath: '' };

    let path = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i === 0 ? 0 : i - 1];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[i + 2 >= points.length ? points.length - 1 : i + 2];

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      path += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
    }

    const fill = `${path} L ${width} ${height} L 0 ${height} Z`;
    return { curvePath: path, areaPath: fill };
  }, [eqState.bands, eqState.enabled]);

  const activePreset = EQ_PRESETS.find((p) => p.id === eqState.selectedPreset) || EQ_PRESETS[0];

  return (
    <div
      style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
        borderRadius: '6px',
        overflow: 'hidden',
        transition: 'border-color 0.2s ease',
      }}
    >
      {/* Header Bar */}
      <div
        onClick={toggleExpand}
        style={{
          padding: '10px 14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          background: 'rgba(255, 255, 255, 0.02)',
          userSelect: 'none',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sliders size={13} color={eqState.enabled ? 'var(--accent-color)' : 'var(--text-muted)'} />
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.08em',
              color: 'var(--text-primary)',
            }}
          >
            EQUALIZER
          </span>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '9px',
              fontWeight: 700,
              color: eqState.enabled ? 'var(--accent-color)' : 'var(--text-muted)',
              background: eqState.enabled ? 'var(--accent-subtle)' : 'rgba(255, 255, 255, 0.05)',
              padding: '1px 6px',
              borderRadius: '2px',
              border: `1px solid ${eqState.enabled ? 'var(--accent-color)' : 'transparent'}`,
            }}
          >
            {activePreset.name}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Power toggle */}
          <button
            type="button"
            onClick={toggleEnabled}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: eqState.enabled ? 'var(--accent-color)' : 'var(--text-muted)',
              transition: 'transform 0.1s ease',
            }}
            title={eqState.enabled ? 'Bypass Equalizer' : 'Enable Equalizer'}
          >
            <Power size={13} />
          </button>

          {isExpanded ? <ChevronUp size={14} color="var(--text-muted)" /> : <ChevronDown size={14} color="var(--text-muted)" />}
        </div>
      </div>

      {/* Expanded Controls Surface */}
      {isExpanded && (
        <div style={{ padding: '12px 14px', borderTop: '1px solid var(--border-color)' }}>
          {/* Acoustic Response Spectrum Visual */}
          <div
            style={{
              height: '44px',
              background: 'rgba(0, 0, 0, 0.35)',
              borderRadius: '4px',
              border: '1px solid var(--border-subtle)',
              marginBottom: '12px',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Center zero-dB guide line */}
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: 0,
                right: 0,
                height: '1px',
                background: 'rgba(255, 255, 255, 0.07)',
              }}
            />

            <svg
              width="100%"
              height="100%"
              viewBox="0 0 230 44"
              preserveAspectRatio="none"
              style={{ display: 'block', position: 'relative', zIndex: 1 }}
            >
              <defs>
                <linearGradient id="eqAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--accent-color)" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="var(--accent-color)" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              {areaPath && <path d={areaPath} fill="url(#eqAreaGrad)" />}
              {curvePath && (
                <path
                  d={curvePath}
                  fill="none"
                  stroke={eqState.enabled ? 'var(--accent-color)' : 'var(--text-muted)'}
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              )}
            </svg>
          </div>

          {/* 6 Curated Preset Buttons in 2x3 Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '6px',
            }}
          >
            {EQ_PRESETS.map((preset) => {
              const isSelected = eqState.selectedPreset === preset.id && eqState.enabled;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => selectPreset(preset.id)}
                  style={{
                    padding: '8px 4px',
                    borderRadius: '4px',
                    background: isSelected ? 'var(--accent-color)' : 'rgba(255, 255, 255, 0.04)',
                    border: isSelected ? '1px solid var(--accent-color)' : '1px solid var(--border-subtle)',
                    color: isSelected ? 'var(--text-inverse, #000000)' : 'var(--text-secondary)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '10px',
                    fontWeight: 700,
                    letterSpacing: '0.06em',
                    cursor: 'pointer',
                    transition: 'all 0.14s ease',
                    textAlign: 'center',
                    boxShadow: isSelected ? '0 0 10px var(--accent-glow)' : 'none',
                  }}
                  title={preset.description}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.borderColor = 'var(--border-bright)';
                      e.currentTarget.style.color = 'var(--text-primary)';
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.borderColor = 'var(--border-subtle)';
                      e.currentTarget.style.color = 'var(--text-secondary)';
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
                    }
                  }}
                >
                  {preset.name}
                </button>
              );
            })}
          </div>

          {/* Quick Flat Reset */}
          <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={handleResetFlat}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                fontFamily: 'var(--font-mono)',
                fontSize: '9px',
                fontWeight: 600,
                letterSpacing: '0.04em',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '2px 4px',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
            >
              <RotateCcw size={10} />
              <span>RESET FLAT</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
