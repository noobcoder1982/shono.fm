import React, { useState } from 'react';
import { usePlayer } from '../context/PlayerContext';
import { CURRENT_APP_VERSION, type BrutalistTheme } from '../services/storage';
import {
  Check,
  X,
  History,
  Rocket,
  Sliders,
  Terminal,
  Zap,
  DownloadCloud,
  Sparkles,
} from 'lucide-react';

type VersionTab = 'v1.3.0' | 'v1.2.0' | 'v1.1.0' | 'v1.0.0';

export const ChangelogModal: React.FC = () => {
  const {
    isChangelogOpen,
    closeChangelog,
    setTheme,
    theme,
    setActiveTab,
  } = usePlayer();

  const [activeVersionTab, setActiveVersionTab] = useState<VersionTab>('v1.3.0');
  const [dontShowAgain, setDontShowAgain] = useState(true);

  if (!isChangelogOpen) return null;

  const handleDismiss = () => {
    closeChangelog(dontShowAgain);
  };

  const handleQuickTheme = (t: BrutalistTheme) => {
    setTheme(t);
  };

  const handleOpenSettings = () => {
    closeChangelog(dontShowAgain);
    setActiveTab('SETTINGS');
  };

  return (
    <div className="modal-backdrop" onClick={handleDismiss}>
      <div
        className="modal-card changelog-modal-card"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '800px',
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
              UPDATE 03
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
                RELEASE v{CURRENT_APP_VERSION} &bull; QUANTUM INGESTION DOCK & HYPERGLOW
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

        {/* Version Switcher Tabs */}
        <div
          style={{
            display: 'flex',
            gap: '8px',
            padding: '10px 24px',
            background: 'var(--bg-primary)',
            borderBottom: '1px solid var(--border-subtle)',
            flexShrink: 0,
            overflowX: 'auto',
          }}
        >
          <button
            type="button"
            onClick={() => setActiveVersionTab('v1.3.0')}
            style={{
              padding: '6px 14px',
              borderRadius: '2px',
              background: activeVersionTab === 'v1.3.0' ? 'var(--bg-secondary)' : 'transparent',
              border: activeVersionTab === 'v1.3.0' ? '1px solid var(--border-bright)' : '1px solid transparent',
              color: activeVersionTab === 'v1.3.0' ? 'var(--text-primary)' : 'var(--text-muted)',
              fontFamily: 'var(--font-mono)',
              fontSize: '10px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              whiteSpace: 'nowrap',
            }}
          >
            <Rocket size={12} color={activeVersionTab === 'v1.3.0' ? 'var(--accent-color)' : 'currentColor'} />
            v1.3.0 (Update 03 // Ingestion & Hyperglow)
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: 'var(--status-active)',
                display: 'inline-block',
              }}
            />
          </button>

          <button
            type="button"
            onClick={() => setActiveVersionTab('v1.2.0')}
            style={{
              padding: '6px 14px',
              borderRadius: '2px',
              background: activeVersionTab === 'v1.2.0' ? 'var(--bg-secondary)' : 'transparent',
              border: activeVersionTab === 'v1.2.0' ? '1px solid var(--border-bright)' : '1px solid transparent',
              color: activeVersionTab === 'v1.2.0' ? 'var(--text-primary)' : 'var(--text-muted)',
              fontFamily: 'var(--font-mono)',
              fontSize: '10px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              whiteSpace: 'nowrap',
            }}
          >
            <History size={12} />
            v1.2.0 (Update 02 // Appearances)
          </button>

          <button
            type="button"
            onClick={() => setActiveVersionTab('v1.1.0')}
            style={{
              padding: '6px 14px',
              borderRadius: '2px',
              background: activeVersionTab === 'v1.1.0' ? 'var(--bg-secondary)' : 'transparent',
              border: activeVersionTab === 'v1.1.0' ? '1px solid var(--border-bright)' : '1px solid transparent',
              color: activeVersionTab === 'v1.1.0' ? 'var(--text-primary)' : 'var(--text-muted)',
              fontFamily: 'var(--font-mono)',
              fontSize: '10px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              whiteSpace: 'nowrap',
            }}
          >
            <History size={12} />
            v1.1.0 (Update 01)
          </button>

          <button
            type="button"
            onClick={() => setActiveVersionTab('v1.0.0')}
            style={{
              padding: '6px 14px',
              borderRadius: '2px',
              background: activeVersionTab === 'v1.0.0' ? 'var(--bg-secondary)' : 'transparent',
              border: activeVersionTab === 'v1.0.0' ? '1px solid var(--border-bright)' : '1px solid transparent',
              color: activeVersionTab === 'v1.0.0' ? 'var(--text-primary)' : 'var(--text-muted)',
              fontFamily: 'var(--font-mono)',
              fontSize: '10px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              whiteSpace: 'nowrap',
            }}
          >
            <History size={12} />
            v1.0.0 (Genesis)
          </button>
        </div>

        {/* Scrollable Changelog Content */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '22px 26px',
            display: 'flex',
            flexDirection: 'column',
            gap: '22px',
          }}
        >
          {activeVersionTab === 'v1.3.0' ? (
            <>
              {/* Manifesto & Architecture Overview */}
              <div
                style={{
                  padding: '18px 20px',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-bright)',
                  borderRadius: '3px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '10px',
                  }}
                >
                  <Zap size={16} color="var(--accent-color)" />
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '11px',
                      fontWeight: 800,
                      letterSpacing: '0.12em',
                      color: 'var(--text-primary)',
                      textTransform: 'uppercase',
                    }}
                  >
                    Manifesto // Transforming Ingestion into a Kinetic Audio Terminal
                  </span>
                </div>
                <p
                  style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: '13.5px',
                    lineHeight: '1.65',
                    color: 'var(--text-secondary)',
                    marginBottom: '12px',
                  }}
                >
                  Ingestion is the heartbeat of Shono.fm: it is how new sound enters the archive. Yet
                  previously, the import field was a static, washed-out text box with an invisible white-on-white
                  button that gave zero visual or kinetic feedback.
                </p>
                <p
                  style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: '13.5px',
                    lineHeight: '1.65',
                    color: 'var(--text-secondary)',
                    margin: 0,
                  }}
                >
                  In Update 03, we rebuilt the import system into a <strong>Quantum Ingestion Dock</strong>.
                  The moment a playlist link is entered or pasted, the entire dock awakens with an animated
                  hyperglow envelope and laser scanning beam. Clicking Import engages a high-precision holographic
                  radar scanner, synthesized Web Audio harmonic chime, and a triumphant &ldquo;Voila!&rdquo; celebration.
                </p>
              </div>

              {/* SECTION: DETAILED BREAKDOWN OF UPDATE 03 */}
              <div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    borderBottom: '1px solid var(--border-color)',
                    paddingBottom: '8px',
                    marginBottom: '14px',
                  }}
                >
                  <Terminal size={14} color="var(--accent-color)" />
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '11px',
                      fontWeight: 800,
                      letterSpacing: '0.1em',
                      color: 'var(--text-primary)',
                    }}
                  >
                    UPDATE 03 TECHNICAL SPECIFICATIONS
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {/* Item 1: Button Visibility Overhaul */}
                  <div
                    style={{
                      padding: '14px 18px',
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '2px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <DownloadCloud size={14} color="var(--accent-color)" />
                        High-Contrast Import Button Visibility Fix
                      </span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '8.5px', background: 'rgba(34, 197, 94, 0.15)', color: '#22c55e', border: '1px solid rgba(34, 197, 94, 0.4)', padding: '2px 6px' }}>
                        FIXED
                      </span>
                    </div>
                    <p style={{ fontFamily: 'var(--font-sans)', fontSize: '12.5px', lineHeight: '1.6', color: 'var(--text-secondary)', margin: 0 }}>
                      Eliminated the severe white-on-white text washout on the Import button. When dormant, the button maintains clean tactile contrast against the console. When a link is detected, it immediately illuminates with high-voltage solid accent background coloring, crisp dark lettering (`#050505`), neon aura radiance, and an active status arrow icon.
                    </p>
                  </div>

                  {/* Item 2: Reactive Ingestion HyperGlow */}
                  <div
                    style={{
                      padding: '14px 18px',
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '2px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Zap size={14} color="var(--accent-color)" />
                        Reactive HyperGlow & Laser Scanning Beam
                      </span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '8.5px', background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.4)', padding: '2px 6px' }}>
                        NEW ANIMATION
                      </span>
                    </div>
                    <p style={{ fontFamily: 'var(--font-sans)', fontSize: '12.5px', lineHeight: '1.6', color: 'var(--text-secondary)', margin: 0 }}>
                      The instant a link is typed or pasted into the console, the `@keyframes ingestionHyperGlow` resonance engine activates. The console envelope pulses in a rhythmic 2.2s breathing cycle with dynamic box shadows and border shifts, accompanied by a continuous horizontal laser scanning beam across the top hairline.
                    </p>
                  </div>

                  {/* Item 3: Holographic Radar & Voila Celebration */}
                  <div
                    style={{
                      padding: '14px 18px',
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '2px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Sparkles size={14} color="var(--accent-color)" />
                        Holographic Radar Scanner & Magical &ldquo;Voila!&rdquo; Celebration
                      </span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '8.5px', background: 'rgba(212, 175, 55, 0.15)', color: 'var(--accent-color)', border: '1px solid var(--border-bright)', padding: '2px 6px' }}>
                        MAGICAL FX
                      </span>
                    </div>
                    <p style={{ fontFamily: 'var(--font-sans)', fontSize: '12.5px', lineHeight: '1.6', color: 'var(--text-secondary)', margin: 0 }}>
                      Clicking Import engages a cybernetic holographic radar scanner overlay featuring counter-rotating outer and inner calibrated rings and a pulsing telemetry core. Upon completion, a synthesized 4-tone ascending major chord chime (C5 &rarr; E5 &rarr; G5 &rarr; C6) sounds through the Web Audio API, alongside a radiant &ldquo;Voila!&rdquo; celebration banner and floating sparkle particles.
                    </p>
                  </div>

                  {/* Item 4: Workflow Accelerators */}
                  <div
                    style={{
                      padding: '14px 18px',
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '2px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Sliders size={14} color="var(--accent-color)" />
                        Clipboard Auto-Paste & Demo Playlist Launcher
                      </span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '8.5px', background: 'rgba(34, 197, 94, 0.15)', color: '#22c55e', border: '1px solid rgba(34, 197, 94, 0.4)', padding: '2px 6px' }}>
                        ERGONOMICS
                      </span>
                    </div>
                    <p style={{ fontFamily: 'var(--font-sans)', fontSize: '12.5px', lineHeight: '1.6', color: 'var(--text-secondary)', margin: 0 }}>
                      Integrated an inline `[PASTE]` button directly inside the console for immediate clipboard ingestion with one click, a quick-clear `[X]` action, and a `[LOAD DEMO]` header button allowing instant testing with a verified YouTube playlist catalog.
                    </p>
                  </div>
                </div>
              </div>
            </>
          ) : activeVersionTab === 'v1.2.0' ? (
            /* Update 02 Notes */
            <>
              <div
                style={{
                  padding: '16px 20px',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-bright)',
                }}
              >
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '6px' }}>
                  UPDATE 02 // APPEARANCES & SOUND SYSTEMS ENGINE (HISTORICAL ARCHIVE)
                </div>
                <p style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', lineHeight: '1.6', color: 'var(--text-secondary)', margin: 0 }}>
                  Permanently purged the Apple Glass themes and replaced monochromatic color washes with 7 authentic Sound System hardware themes (German Hi-Fi Noir, Tokyo Studio Concrete, Dieter Rams Braun, Studer Tapedeck, Sony Trinitron Phosphor, Josef Müller-Brockmann Swiss Paper, and MI6 Bunker Stealth).
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '12px' }}>
                <div style={{ padding: '12px 16px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
                    01 // NOIR GERMAN HI-FI
                  </div>
                  <div style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', color: 'var(--text-secondary)' }}>
                    Deep obsidian (#08080a), brushed titanium framing, and warm brass indicators.
                  </div>
                  <button type="button" onClick={() => handleQuickTheme('noir')} className="bma-btn" style={{ marginTop: '8px', padding: '3px 8px', fontSize: '9px' }}>
                    {theme === 'noir' ? 'Active' : 'Apply Noir'}
                  </button>
                </div>

                <div style={{ padding: '12px 16px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
                    02 // CONCRETE TOKYO STUDIO
                  </div>
                  <div style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', color: 'var(--text-secondary)' }}>
                    Basalt slate (#101114), cold studio framing, and electric cyan meters.
                  </div>
                  <button type="button" onClick={() => handleQuickTheme('concrete')} className="bma-btn" style={{ marginTop: '8px', padding: '3px 8px', fontSize: '9px' }}>
                    {theme === 'concrete' ? 'Active' : 'Apply Concrete'}
                  </button>
                </div>

                <div style={{ padding: '12px 16px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
                    03 // BRAUN DIETER RAMS
                  </div>
                  <div style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', color: 'var(--text-secondary)' }}>
                    Warm anthracite (#121215), linen typography, and Rams safety orange switches.
                  </div>
                  <button type="button" onClick={() => handleQuickTheme('braun')} className="bma-btn" style={{ marginTop: '8px', padding: '3px 8px', fontSize: '9px' }}>
                    {theme === 'braun' ? 'Active' : 'Apply Braun'}
                  </button>
                </div>

                <div style={{ padding: '12px 16px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
                    04 // TAPEDECK STUDER
                  </div>
                  <div style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', color: 'var(--text-secondary)' }}>
                    Roasted espresso (#0f0d0b), parchment text, and analog ruby LEDs.
                  </div>
                  <button type="button" onClick={() => handleQuickTheme('tapedeck')} className="bma-btn" style={{ marginTop: '8px', padding: '3px 8px', fontSize: '9px' }}>
                    {theme === 'tapedeck' ? 'Active' : 'Apply Tapedeck'}
                  </button>
                </div>
              </div>
            </>
          ) : activeVersionTab === 'v1.1.0' ? (
            /* Historical Update 01 Notes */
            <>
              <div
                style={{
                  padding: '16px 20px',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                }}
              >
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '6px' }}>
                  UPDATE 01 // AUDIO FIDELITY & EXPANDED VAULT (HISTORICAL ARCHIVE)
                </div>
                <p style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', lineHeight: '1.6', color: 'var(--text-secondary)', margin: 0 }}>
                  Release v1.1.0 introduced synchronized karaoke lyric tracking, Web Audio API frequency visualizer telemetry, draggable resizable sidebars, and the 007 / MI6 Analog Turntable deck.
                </p>
              </div>
            </>
          ) : (
            /* Historical Genesis Notes */
            <>
              <div
                style={{
                  padding: '16px 20px',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                }}
              >
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '6px' }}>
                  GENESIS RELEASE // v1.0.0 (FOUNDATIONAL LAUNCH)
                </div>
                <p style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', lineHeight: '1.6', color: 'var(--text-secondary)', margin: 0 }}>
                  Initial public release of Shono.fm brutalist audio streaming vault. Established the high-contrast 3-column brutalist design system, YouTube audio pipeline ingestion, and local storage state persistence.
                </p>
              </div>
            </>
          )}
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
            gap: '14px',
          }}
        >
          {/* Dismissal Remember Checkbox */}
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              userSelect: 'none',
            }}
          >
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
              style={{
                width: '15px',
                height: '15px',
                accentColor: 'var(--accent-color)',
                cursor: 'pointer',
              }}
            />
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '9.5px',
                color: 'var(--text-secondary)',
              }}
            >
              Don&apos;t show again until Update 04
            </span>
          </label>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              onClick={handleOpenSettings}
              className="bma-btn"
              style={{
                padding: '8px 14px',
                fontSize: '10px',
                letterSpacing: '0.06em',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Sliders size={12} />
              <span>THEME SETTINGS</span>
            </button>

            <button
              type="button"
              onClick={handleDismiss}
              className="bma-btn bma-btn-primary"
              style={{
                padding: '8px 20px',
                fontSize: '10.5px',
                letterSpacing: '0.08em',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <Check size={13} />
              DISMISS & EXPLORE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
