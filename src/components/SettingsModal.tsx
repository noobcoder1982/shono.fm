import React, { useState } from 'react';
import { usePlayer } from '../context/PlayerContext';
import { storage, type BrutalistTheme } from '../services/storage';
import { X, Sliders, Check, ShieldCheck, Palette, Disc } from 'lucide-react';

interface ThemeOption {
  id: BrutalistTheme;
  index: string;
  name: string;
  description: string;
  previewBg: string;
  previewBorder: string;
  previewText: string;
  previewAccent: string;
}

const THEME_OPTIONS: ThemeOption[] = [
  {
    id: 'noir',
    index: '01',
    name: 'NOIR // GERMAN HI-FI',
    description: 'Deep obsidian #08080a, brushed titanium borders, and calibrated warm brass accents.',
    previewBg: '#08080a',
    previewBorder: '#26262c',
    previewText: '#f3f3f6',
    previewAccent: '#d4af37',
  },
  {
    id: 'concrete',
    index: '02',
    name: 'CONCRETE // TOKYO STUDIO',
    description: 'Basalt slate #101114, cold studio steel borders, and electric cyan telemetry meters.',
    previewBg: '#101114',
    previewBorder: '#272a30',
    previewText: '#e2e8f0',
    previewAccent: '#0ea5e9',
  },
  {
    id: 'braun',
    index: '03',
    name: 'BRAUN // DIETER RAMS ATELIER',
    description: 'Warm anthracite #121215, matte graphite framing, linen text, and safety orange switches.',
    previewBg: '#121215',
    previewBorder: '#2a2a30',
    previewText: '#edece6',
    previewAccent: '#ff5722',
  },
  {
    id: 'tapedeck',
    index: '04',
    name: 'TAPEDECK // REEL-TO-REEL',
    description: 'Roasted espresso #0f0d0b, dark umber framing, parchment text, and analog ruby record LEDs.',
    previewBg: '#0f0d0b',
    previewBorder: '#2c241e',
    previewText: '#f5ede6',
    previewAccent: '#e11d48',
  },
  {
    id: 'phosphor',
    index: '05',
    name: 'PHOSPHOR // SONY TRINITRON',
    description: 'Dark cathode #070907, calibrated emerald text, and surgical P1 phosphor green meters.',
    previewBg: '#070907',
    previewBorder: '#1a291f',
    previewText: '#ecfdf5',
    previewAccent: '#22c55e',
  },
  {
    id: 'swiss',
    index: '06',
    name: 'SWISS // MÜLLER-BROCKMANN',
    description: 'Alabaster paper #f4f3ee, architectural graphite borders, stark black ink, and vermilion accents.',
    previewBg: '#f4f3ee',
    previewBorder: '#d2d0c8',
    previewText: '#121214',
    previewAccent: '#d90429',
  },
  {
    id: 'stealth',
    index: '07',
    name: 'STEALTH // MI6 VOID',
    description: 'Pitch carbon #040405, ultra-dark steel framing, titanium text, and laser violet telemetry.',
    previewBg: '#040405',
    previewBorder: '#1a1b22',
    previewText: '#eceff4',
    previewAccent: '#818cf8',
  },
];

export const SettingsModal: React.FC = () => {
  const { isSettingsOpen, setIsSettingsOpen, theme, setTheme, playerMode, setPlayerMode } = usePlayer();
  const [selectedTheme, setSelectedTheme] = useState<BrutalistTheme>(theme);
  const [autoPlay, setAutoPlay] = useState(() => storage.getSettings().autoPlayNext);
  const [synthFallback, setSynthFallback] = useState(() => storage.getSettings().synthFallbackEnabled);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isSettingsOpen) return null;

  const handleSelectTheme = (thm: BrutalistTheme) => {
    setSelectedTheme(thm);
    setTheme(thm);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    storage.saveSettings({
      theme: selectedTheme,
      autoPlayNext: autoPlay,
      synthFallbackEnabled: synthFallback,
    });
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      setIsSettingsOpen(false);
    }, 600);
  };

  const handleResetArchives = () => {
    if (window.confirm('PURGE ALL SAVED ARCHIVES AND RESET VAULT? This cannot be undone.')) {
      storage.saveArchives([]);
      storage.setActiveArchiveId('');
      storage.saveQueue([]);
      window.location.reload();
    }
  };

  return (
    <div className="modal-backdrop" onClick={() => setIsSettingsOpen(false)}>
      <div
        className="modal-card"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '620px', maxHeight: '90vh', overflowY: 'auto' }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '16px 24px',
            borderBottom: '1px solid var(--border-color)',
            background: 'var(--bg-secondary)',
            position: 'sticky',
            top: 0,
            zIndex: 10,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Sliders size={16} color="var(--accent-color)" />
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '12px',
                fontWeight: 700,
                letterSpacing: '0.1em',
                color: 'var(--text-primary)',
              }}
            >
              SYSTEM CONFIGURATION
            </span>
          </div>
          <button
            className="bma-btn-icon"
            onClick={() => setIsSettingsOpen(false)}
            style={{ padding: '4px' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSave} style={{ padding: '24px' }}>
          {/* Locked Ingestion Status Banner */}
          <div
            style={{
              padding: '12px 16px',
              borderRadius: '8px',
              border: '1px solid var(--border-color)',
              background: 'var(--bg-secondary)',
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <ShieldCheck size={18} color="var(--status-active)" />
              <div>
                <div
                  style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: '13px',
                    fontWeight: 700,
                    color: 'var(--text-primary)',
                  }}
                >
                  YOUTUBE API ENGINE: ACTIVE & SECURED
                </div>
                <div
                  style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: '12px',
                    color: 'var(--text-secondary)',
                    marginTop: '2px',
                  }}
                >
                  Global API credentials locked • Stream ingestion pipeline ready
                </div>
              </div>
            </div>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontFamily: 'var(--font-mono)',
                fontSize: '10px',
                color: 'var(--status-active)',
                border: '1px solid var(--status-active)',
                borderRadius: '4px',
                padding: '3px 8px',
              }}
            >
              <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'var(--status-active)' }} />
              DEFAULT_LOCKED
            </span>
          </div>

          {/* PLAYER MODE SELECTOR */}
          <div style={{ marginBottom: '26px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '10px',
              }}
            >
              <Disc size={15} color="var(--accent-color)" />
              <label
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  color: 'var(--text-primary)',
                }}
              >
                PLAYER MODE
              </label>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '12px',
              }}
            >
              {/* Option 1: ARCHIVE */}
              <button
                type="button"
                onClick={() => setPlayerMode('ARCHIVE')}
                style={{
                  padding: '14px 16px',
                  borderRadius: '8px',
                  background: playerMode === 'ARCHIVE' ? 'var(--bg-tertiary)' : 'var(--bg-secondary)',
                  border: playerMode === 'ARCHIVE' ? '2px solid var(--accent-color)' : '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                  textAlign: 'left',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  transition: 'all 0.15s ease',
                }}
              >
                <div
                  style={{
                    width: '16px',
                    height: '16px',
                    borderRadius: '50%',
                    border: playerMode === 'ARCHIVE' ? '2px solid var(--accent-color)' : '1.5px solid var(--border-bright)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {playerMode === 'ARCHIVE' && (
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-color)' }} />
                  )}
                </div>
                <div>
                  <div style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', fontWeight: 700 }}>
                    ARCHIVE MODE
                  </div>
                  <div style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    Standard brutalist 3-column index
                  </div>
                </div>
              </button>

              {/* Option 2: 007 / MI6 */}
              <button
                type="button"
                onClick={() => setPlayerMode('MI6')}
                style={{
                  padding: '14px 16px',
                  borderRadius: '8px',
                  background: playerMode === 'MI6' ? 'rgba(212, 175, 55, 0.1)' : 'var(--bg-secondary)',
                  border: playerMode === 'MI6' ? '2px solid var(--accent-color)' : '1px solid var(--border-color)',
                  color: playerMode === 'MI6' ? 'var(--accent-color)' : 'var(--text-primary)',
                  textAlign: 'left',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  transition: 'all 0.15s ease',
                }}
              >
                <div
                  style={{
                    width: '16px',
                    height: '16px',
                    borderRadius: '50%',
                    border: playerMode === 'MI6' ? '2px solid var(--accent-color)' : '1.5px solid var(--border-bright)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {playerMode === 'MI6' && (
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-color)' }} />
                  )}
                </div>
                <div>
                  <div style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', fontWeight: 700 }}>
                    007 / MI6 DOSSIER
                  </div>
                  <div style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    Analog vinyl turntable & dossier
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Theme Selector Section */}
          <div style={{ marginBottom: '26px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '10px',
              }}
            >
              <Palette size={15} color="var(--accent-color)" />
              <label
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  color: 'var(--text-primary)',
                  textTransform: 'uppercase',
                }}
              >
                INTERFACE THEMES
              </label>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {THEME_OPTIONS.map((opt) => {
                const isSelected = selectedTheme === opt.id;
                return (
                  <div
                    key={opt.id}
                    onClick={() => handleSelectTheme(opt.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: isSelected ? '1.5px solid var(--accent-color)' : '1px solid var(--border-color)',
                      background: isSelected ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                      cursor: 'pointer',
                      transition: 'all 0.12s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div
                        style={{
                          width: '26px',
                          height: '26px',
                          borderRadius: '6px',
                          background: opt.previewBg,
                          border: `1.5px solid ${opt.previewAccent}`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: opt.previewAccent }} />
                      </div>

                      <div>
                        <div
                          style={{
                            fontFamily: 'var(--font-sans)',
                            fontSize: '13.5px',
                            fontWeight: 700,
                            color: isSelected ? 'var(--accent-color)' : 'var(--text-primary)',
                          }}
                        >
                          {opt.name}
                        </div>
                        <div
                          style={{
                            fontFamily: 'var(--font-sans)',
                            fontSize: '12px',
                            color: 'var(--text-secondary)',
                            marginTop: '2px',
                          }}
                        >
                          {opt.description}
                        </div>
                      </div>
                    </div>

                    {isSelected && (
                      <div
                        style={{
                          width: '22px',
                          height: '22px',
                          borderRadius: '50%',
                          background: 'var(--accent-color)',
                          color: 'var(--bg-primary)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          marginLeft: '12px',
                        }}
                      >
                        <Check size={12} strokeWidth={3} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Synthesis Fallback Toggle */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px 0',
              borderTop: '1px solid var(--border-subtle)',
            }}
          >
            <div>
              <div style={{ fontFamily: 'var(--font-sans)', fontSize: '13.5px', fontWeight: 600, color: 'var(--text-primary)' }}>
                SYNTHESIS AUDIO FALLBACK
              </div>
              <div style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Generates ambient harmonic chords when YouTube streams are restricted
              </div>
            </div>
            <input
              type="checkbox"
              checked={synthFallback}
              onChange={(e) => setSynthFallback(e.target.checked)}
              style={{ width: '18px', height: '18px', accentColor: 'var(--accent-color)', cursor: 'pointer' }}
            />
          </div>

          {/* Continuous Advancement Toggle */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px 0',
              borderTop: '1px solid var(--border-subtle)',
              borderBottom: '1px solid var(--border-subtle)',
              marginBottom: '24px',
            }}
          >
            <div>
              <div style={{ fontFamily: 'var(--font-sans)', fontSize: '13.5px', fontWeight: 600, color: 'var(--text-primary)' }}>
                CONTINUOUS AUDIO ADVANCEMENT
              </div>
              <div style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Automatically play next track in queue or archive on completion
              </div>
            </div>
            <input
              type="checkbox"
              checked={autoPlay}
              onChange={(e) => setAutoPlay(e.target.checked)}
              style={{ width: '18px', height: '18px', accentColor: 'var(--accent-color)', cursor: 'pointer' }}
            />
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button
              type="button"
              onClick={handleResetArchives}
              className="bma-btn"
              style={{ fontSize: '11px', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.4)' }}
            >
              PURGE ALL ARCHIVES
            </button>

            <button
              type="submit"
              className="bma-btn bma-btn-primary"
              style={{ padding: '10px 24px', fontSize: '12px', fontWeight: 700 }}
            >
              {savedSuccess ? (
                <>
                  <Check size={14} style={{ marginRight: '6px' }} /> SAVED
                </>
              ) : (
                'APPLY CONFIGURATION'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
