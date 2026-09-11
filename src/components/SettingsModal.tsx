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
    name: 'NOIR MONOCHROME',
    description: 'Deep obsidian #090909, hairline borders, stark off-white typography.',
    previewBg: '#090909',
    previewBorder: '#333333',
    previewText: '#f0f0f0',
    previewAccent: '#ffffff',
  },
  {
    id: 'concrete',
    index: '02',
    name: 'CONCRETE SLAB',
    description: 'Industrial cement slate #151619, cold shadows, crisp steel tones.',
    previewBg: '#151619',
    previewBorder: '#4d5463',
    previewText: '#f8fafc',
    previewAccent: '#38bdf8',
  },
  {
    id: 'amber',
    index: '03',
    name: 'PHOSPHOR AMBER',
    description: 'Vintage 1980s monochrome CRT terminal, warm phosphor glow.',
    previewBg: '#090703',
    previewBorder: '#61481c',
    previewText: '#ffb703',
    previewAccent: '#fb8500',
  },
  {
    id: 'acid',
    index: '04',
    name: 'ACID BRUTALIST',
    description: 'Underground Berlin techno darkness with harsh acid green signals.',
    previewBg: '#060907',
    previewBorder: '#315c3f',
    previewText: '#bbf7d0',
    previewAccent: '#4ade80',
  },
  {
    id: 'paper',
    index: '05',
    name: 'SWISS INVERTED / PAPER',
    description: 'Stark bone-white editorial catalogue, heavy pure black ink typography.',
    previewBg: '#ebebe5',
    previewBorder: '#98988a',
    previewText: '#0f0f0f',
    previewAccent: '#111111',
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
    if (window.confirm('PURGE ALL SAVED ARCHIVES AND RESET VAULT?')) {
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
        style={{ maxWidth: '580px', maxHeight: '90vh', overflowY: 'auto' }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '14px 20px',
            borderBottom: '1px solid var(--border-color)',
            background: 'var(--bg-secondary)',
            position: 'sticky',
            top: 0,
            zIndex: 10,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sliders size={14} color="var(--text-secondary)" />
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                letterSpacing: '0.12em',
                color: 'var(--text-primary)',
              }}
            >
              SHONO.FM SYSTEM & THEME CONFIGURATION
            </span>
          </div>
          <button
            className="bma-btn-icon"
            onClick={() => setIsSettingsOpen(false)}
            style={{ padding: '4px' }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSave} style={{ padding: '20px' }}>
          {/* Permanent Locked Ingestion Status Banner */}
          <div
            style={{
              padding: '10px 14px',
              border: '1px solid var(--border-color)',
              background: 'var(--bg-secondary)',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <ShieldCheck size={16} color="var(--status-active)" />
              <div>
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '10px',
                    fontWeight: 600,
                    letterSpacing: '0.08em',
                    color: 'var(--text-primary)',
                  }}
                >
                  YOUTUBE API ENGINE: ACTIVE & SECURED
                </div>
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '8.5px',
                    color: 'var(--text-muted)',
                  }}
                >
                  Global API credentials locked &bull; Ingestion pipeline ready
                </div>
              </div>
            </div>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontFamily: 'var(--font-mono)',
                fontSize: '8.5px',
                color: 'var(--status-active)',
                border: '1px solid var(--status-active)',
                padding: '2px 8px',
              }}
            >
              <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--status-active)' }} />
              DEFAULT_LOCKED
            </span>
          </div>

          {/* PLAYER MODE SELECTOR (Archive vs 007 / MI6) */}
          <div style={{ marginBottom: '22px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '10px',
              }}
            >
              <Disc size={13} color="var(--text-secondary)" />
              <label
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '10px',
                  fontWeight: 600,
                  letterSpacing: '0.12em',
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
                gap: '10px',
              }}
            >
              {/* Option 1: ARCHIVE */}
              <button
                type="button"
                onClick={() => setPlayerMode('ARCHIVE')}
                style={{
                  padding: '12px 14px',
                  background: playerMode === 'ARCHIVE' ? 'var(--bg-tertiary)' : 'var(--bg-secondary)',
                  border: playerMode === 'ARCHIVE' ? '2px solid var(--text-primary)' : '1px solid var(--border-color)',
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
                    width: '14px',
                    height: '14px',
                    borderRadius: '50%',
                    border: '2px solid var(--text-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {playerMode === 'ARCHIVE' && (
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--text-primary)' }} />
                  )}
                </div>
                <div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em' }}>
                    ARCHIVE
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '8.5px', color: 'var(--text-secondary)' }}>
                    Standard brutalist 3-column index
                  </div>
                </div>
              </button>

              {/* Option 2: 007 / MI6 */}
              <button
                type="button"
                onClick={() => setPlayerMode('MI6')}
                style={{
                  padding: '12px 14px',
                  background: playerMode === 'MI6' ? 'rgba(212, 175, 55, 0.12)' : 'var(--bg-secondary)',
                  border: playerMode === 'MI6' ? '2px solid #d4af37' : '1px solid var(--border-color)',
                  color: playerMode === 'MI6' ? '#d4af37' : 'var(--text-primary)',
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
                    width: '14px',
                    height: '14px',
                    borderRadius: '50%',
                    border: playerMode === 'MI6' ? '2px solid #d4af37' : '2px solid var(--text-secondary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {playerMode === 'MI6' && (
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#d4af37' }} />
                  )}
                </div>
                <div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em' }}>
                    007 / MI6
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '8.5px', color: playerMode === 'MI6' ? '#c5a059' : 'var(--text-secondary)' }}>
                    Analog vinyl turntable & dossier
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Theme Selector Section */}
          <div style={{ marginBottom: '22px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '10px',
              }}
            >
              <Palette size={13} color="var(--text-secondary)" />
              <label
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '10px',
                  fontWeight: 600,
                  letterSpacing: '0.12em',
                  color: 'var(--text-primary)',
                  textTransform: 'uppercase',
                }}
              >
                SHONO.FM INTERFACE THEMES
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
                      border: isSelected ? '1px solid var(--text-primary)' : '1px solid var(--border-color)',
                      background: isSelected ? 'var(--bg-secondary)' : 'transparent',
                      cursor: 'pointer',
                      transition: 'all 0.12s ease',
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) e.currentTarget.style.borderColor = 'var(--border-bright)';
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) e.currentTarget.style.borderColor = 'var(--border-color)';
                    }}
                  >
                    {/* Left info */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      {/* Live Palette Swatch */}
                      <div
                        style={{
                          width: '28px',
                          height: '28px',
                          background: opt.previewBg,
                          border: `1px solid ${opt.previewBorder}`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <span style={{ width: '8px', height: '8px', background: opt.previewAccent }} />
                      </div>

                      <div>
                        <div
                          style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: '10.5px',
                            fontWeight: isSelected ? 600 : 500,
                            color: 'var(--text-primary)',
                            letterSpacing: '0.06em',
                          }}
                        >
                          <span style={{ color: 'var(--text-muted)', marginRight: '6px' }}>{opt.index}</span>
                          {opt.name}
                        </div>
                        <div
                          style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: '8.5px',
                            color: 'var(--text-muted)',
                            marginTop: '2px',
                          }}
                        >
                          {opt.description}
                        </div>
                      </div>
                    </div>

                    {/* Radio indicator */}
                    <div
                      style={{
                        width: '12px',
                        height: '12px',
                        border: isSelected ? '1px solid var(--text-primary)' : '1px solid var(--border-bright)',
                        background: isSelected ? 'var(--text-primary)' : 'transparent',
                        flexShrink: 0,
                        marginLeft: '12px',
                      }}
                    />
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
              padding: '10px 0',
              borderTop: '1px solid var(--border-subtle)',
            }}
          >
            <div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10.5px', color: 'var(--text-primary)' }}>
                SYNTHESIS AUDIO FALLBACK ENGINE
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '8.5px', color: 'var(--text-muted)' }}>
                Generates ambient darkwave harmonic chords when YouTube videos are geo-restricted
              </div>
            </div>
            <input
              type="checkbox"
              checked={synthFallback}
              onChange={(e) => setSynthFallback(e.target.checked)}
              style={{ width: '15px', height: '15px', accentColor: 'var(--text-primary)' }}
            />
          </div>

          {/* Continuous Advancement Toggle */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '10px 0',
              borderTop: '1px solid var(--border-subtle)',
              borderBottom: '1px solid var(--border-subtle)',
              marginBottom: '20px',
            }}
          >
            <div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10.5px', color: 'var(--text-primary)' }}>
                CONTINUOUS AUDIO ADVANCEMENT
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '8.5px', color: 'var(--text-muted)' }}>
                Automatically play next track in queue or archive on completion
              </div>
            </div>
            <input
              type="checkbox"
              checked={autoPlay}
              onChange={(e) => setAutoPlay(e.target.checked)}
              style={{ width: '15px', height: '15px', accentColor: 'var(--text-primary)' }}
            />
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button
              type="button"
              onClick={handleResetArchives}
              className="bma-btn"
              style={{ fontSize: '9.5px', color: 'var(--text-muted)' }}
            >
              CLEAR ALL ARCHIVES
            </button>

            <button
              type="submit"
              className="bma-btn bma-btn-primary"
              style={{ padding: '8px 22px', fontSize: '10px' }}
            >
              {savedSuccess ? (
                <>
                  <Check size={12} style={{ marginRight: '6px' }} /> SAVED
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
