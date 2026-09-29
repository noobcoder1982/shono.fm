import React, { useState } from 'react';
import { usePlayer } from '../context/PlayerContext';
import { CURRENT_APP_VERSION, type BrutalistTheme } from '../services/storage';
import {
  Check,
  X,
  Sparkles,
  Maximize2,
  Sliders,
  AppWindow,
  Cpu,
  Radio,
  Zap,
  ShieldCheck,
} from 'lucide-react';

export const ChangelogModal: React.FC = () => {
  const {
    isChangelogOpen,
    closeChangelog,
    setTheme,
    theme,
    toggleFullscreenPlayer,
  } = usePlayer();

  const [dontShowAgain, setDontShowAgain] = useState(true);

  if (!isChangelogOpen) return null;

  const handleDismiss = () => {
    closeChangelog(dontShowAgain);
  };

  const handleQuickTheme = (t: BrutalistTheme) => {
    setTheme(t);
  };

  const handleLaunchFullscreen = () => {
    closeChangelog(dontShowAgain);
    toggleFullscreenPlayer();
  };

  return (
    <div className="modal-backdrop" onClick={handleDismiss}>
      <div
        className="modal-card changelog-modal-card"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '820px',
          width: '92vw',
          maxHeight: '88vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          background: 'var(--bg-primary)',
          border: '1px solid var(--border-bright)',
          boxShadow: '0 24px 70px rgba(0, 0, 0, 0.65)',
        }}
      >
        {/* Top Header Banner */}
        <div
          style={{
            padding: '16px 24px',
            borderBottom: '1px solid var(--border-color)',
            background: 'var(--bg-secondary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                background: 'var(--accent-color)',
                color: 'var(--text-inverse)',
                fontSize: '9.5px',
                fontFamily: 'var(--font-mono)',
                fontWeight: 800,
                letterSpacing: '0.14em',
                padding: '4px 9px',
                borderRadius: '2px',
              }}
            >
              UPDATE 01 // DESKTOP RELEASE
            </div>
            <div>
              <div
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '17px',
                  fontWeight: 800,
                  letterSpacing: '0.04em',
                  color: 'var(--text-primary)',
                  lineHeight: 1.2,
                }}
              >
                SHONO.FM // SYSTEM CHANGELOG
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '9.5px',
                  color: 'var(--text-muted)',
                  letterSpacing: '0.06em',
                }}
              >
                RELEASE v{CURRENT_APP_VERSION} &bull; STANDALONE DESKTOP APPLICATION & IMMERSIVE AUDIO ENGINE
              </div>
            </div>
          </div>

          <button
            className="bma-btn-icon"
            onClick={handleDismiss}
            style={{ padding: '7px', borderRadius: '2px' }}
            title="Dismiss changelog (ESC)"
          >
            <X size={18} />
          </button>
        </div>

        {/* Version Banner Tab */}
        <div
          style={{
            display: 'flex',
            gap: '8px',
            padding: '10px 24px',
            background: 'var(--bg-primary)',
            borderBottom: '1px solid var(--border-subtle)',
            flexShrink: 0,
          }}
        >
          <div
            style={{
              padding: '6px 14px',
              borderRadius: '2px',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-bright)',
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-mono)',
              fontSize: '10px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Sparkles size={12} color="var(--accent-color)" />
            <span>v1.3.0 (Universal Search & Kinetic Audio Vault)</span>
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: 'var(--status-active)',
                display: 'inline-block',
              }}
            />
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div
          style={{
            padding: '24px',
            overflowY: 'auto',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
          }}
        >
          {/* Main Hero Card */}
          <div
            style={{
              padding: '20px',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              borderRadius: '2px',
              position: 'relative',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                marginBottom: '10px',
              }}
            >
              <AppWindow size={20} color="var(--accent-color)" />
              <div
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '22px',
                  fontWeight: 800,
                  letterSpacing: '0.04em',
                  color: 'var(--text-primary)',
                }}
              >
                UNIVERSAL SEARCH & KINETIC ENGINE // v1.3.0
              </div>
            </div>
            <p
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '13.5px',
                lineHeight: 1.6,
                color: 'var(--text-secondary)',
                margin: 0,
              }}
            >
              SHONO.FM now finds music instantly. The unified input console seamlessly parses YouTube links or executes debounced YouTube Data searches with priority-ranked Collections, Tracks, and Channels. Features kinetic typographic loader with philosophy quotes, high-precision audio click triggers, and zero-interruption session queueing.
            </p>
          </div>

          {/* Key Changes Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '16px',
            }}
          >
            {/* Feature 1 */}
            <div
              style={{
                padding: '16px',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '2px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <Cpu size={16} color="var(--accent-color)" />
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '0.08em' }}>
                  NATIVE WINDOWS RUNTIME
                </span>
              </div>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                Direct installation with Start Menu integration, desktop shortcuts, native memory management, and automatic update capabilities.
              </p>
            </div>

            {/* Feature 2 */}
            <div
              style={{
                padding: '16px',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '2px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <Radio size={16} color="var(--accent-color)" />
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '0.08em' }}>
                  IMMERSIVE BORDERLESS VIEW
                </span>
              </div>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                Native OS titlebar stripped for an uninterrupted sound console aesthetic with seamless top-edge drag zones and corner controls.
              </p>
            </div>

            {/* Feature 3 */}
            <div
              style={{
                padding: '16px',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '2px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <Zap size={16} color="var(--accent-color)" />
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '0.08em' }}>
                  48KHZ AUDIO PRECISION ENGINE
                </span>
              </div>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                High-definition audio playback, real-time multi-band equalizer, dynamic waveform telemetry, and kinetic Apple Music-style lyrics.
              </p>
            </div>

            {/* Feature 4 */}
            <div
              style={{
                padding: '16px',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '2px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <ShieldCheck size={16} color="var(--accent-color)" />
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '0.08em' }}>
                  PERSISTENT AUDIO VAULT
                </span>
              </div>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                Full local persistence for custom playlists, liked tracks, equalizer presets, artwork caching, and exportable JSON archive dossiers.
              </p>
            </div>
          </div>

          {/* Hardware Themes Quick Select */}
          <div
            style={{
              padding: '16px 20px',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              borderRadius: '2px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <Sliders size={14} color="var(--accent-color)" />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10.5px', fontWeight: 700, letterSpacing: '0.1em', color: 'var(--text-primary)' }}>
                7 STUDIO HARDWARE THEMES
              </span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {(['noir', 'concrete', 'braun', 'tapedeck', 'phosphor', 'swiss', 'stealth'] as BrutalistTheme[]).map((thm) => (
                <button
                  key={thm}
                  type="button"
                  onClick={() => handleQuickTheme(thm)}
                  style={{
                    padding: '6px 12px',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '9.5px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    background: theme === thm ? 'var(--accent-color)' : 'var(--bg-primary)',
                    color: theme === thm ? 'var(--text-inverse)' : 'var(--text-secondary)',
                    border: '1px solid var(--border-bright)',
                    cursor: 'pointer',
                    borderRadius: '2px',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {thm}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div
          style={{
            padding: '14px 24px',
            borderTop: '1px solid var(--border-color)',
            background: 'var(--bg-secondary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
          }}
        >
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontFamily: 'var(--font-mono)',
              fontSize: '10px',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              userSelect: 'none',
            }}
          >
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
              style={{ accentColor: 'var(--accent-color)', cursor: 'pointer' }}
            />
            DON'T SHOW THIS ON STARTUP
          </label>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              type="button"
              className="bma-btn"
              onClick={handleLaunchFullscreen}
              style={{ padding: '8px 14px', fontSize: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Maximize2 size={13} />
              <span>FULLSCREEN NOW PLAYING</span>
            </button>
            <button
              type="button"
              className="bma-btn bma-btn-primary"
              onClick={handleDismiss}
              style={{ padding: '8px 18px', fontSize: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Check size={13} />
              <span>ACKNOWLEDGE & ENTER</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
