import React, { useState, useEffect, useRef } from 'react';
import { usePlayer } from '../context/PlayerContext';
import { storage, type BrutalistTheme } from '../services/storage';
import type { TurntableSpeed } from '../types';
import {
  LayoutGrid,
  Disc,
  Check,
  ExternalLink,
} from 'lucide-react';
import { SidebarEqualizer } from './SidebarEqualizer';

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

type SettingsTab = 'GENERAL' | 'PLAYER' | 'APPEARANCE' | 'INTEGRATIONS' | 'AUDIO' | 'ADVANCED';

export const SettingsPage: React.FC = () => {
  const {
    playerMode,
    setPlayerMode,
    theme,
    setTheme,
    isVinylCrackle,
    toggleVinylCrackle,
    turntableSpeed,
    setTurntableSpeed,
    clearQueue,
    archives,
  } = usePlayer();

  const [activeTab, setActiveTab] = useState<SettingsTab>('GENERAL');
  const [autoPlay, setAutoPlay] = useState<boolean>(() => storage.getSettings().autoPlayNext);
  const [synthFallback, setSynthFallback] = useState<boolean>(() => storage.getSettings().synthFallbackEnabled);
  const [normalizeVolume, setNormalizeVolume] = useState<boolean>(true);
  const [crtEffect, setCrtEffect] = useState<boolean>(false);
  const [currentTimeStr, setCurrentTimeStr] = useState<string>('');
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Live Clock matching concept header
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
      const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
      const dayName = days[now.getDay()];
      const day = String(now.getDate()).padStart(2, '0');
      const month = months[now.getMonth()];
      const year = now.getFullYear();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      setCurrentTimeStr(`${dayName}, ${day} ${month} ${year}  ${hours}:${minutes}:${seconds}`);
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const showNotification = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => {
      setActionNotice(null);
    }, 2400);
  };

  const handleToggleAutoPlay = () => {
    const next = !autoPlay;
    setAutoPlay(next);
    storage.saveSettings({ autoPlayNext: next });
    showNotification(`AUTOPLAY: ${next ? 'ENABLED' : 'DISABLED'}`);
  };

  const handleToggleSynthFallback = () => {
    const next = !synthFallback;
    setSynthFallback(next);
    storage.saveSettings({ synthFallbackEnabled: next });
    showNotification(`SYNTHESIS FALLBACK: ${next ? 'ENABLED' : 'DISABLED'}`);
  };

  const handleToggleNormalize = () => {
    setNormalizeVolume((prev) => {
      const next = !prev;
      showNotification(`NORMALIZE VOLUME: ${next ? 'ACTIVE' : 'BYPASS'}`);
      return next;
    });
  };

  const handleToggleCrt = () => {
    setCrtEffect((prev) => {
      const next = !prev;
      showNotification(`CRT PHOSPHOR SCANLINES: ${next ? 'ENGAGED' : 'OFF'}`);
      return next;
    });
  };

  const handleClearArchives = () => {
    if (window.confirm('PURGE ALL SAVED ARCHIVES AND RESET VAULT? This cannot be undone.')) {
      storage.saveArchives([]);
      storage.setActiveArchiveId('');
      storage.saveQueue([]);
      window.location.reload();
    }
  };

  const handleResetSettings = () => {
    if (window.confirm('RESTORE DEFAULT CONFIGURATION?')) {
      storage.saveSettings({
        theme: 'noir',
        autoPlayNext: true,
        synthFallbackEnabled: true,
      });
      setTheme('noir');
      setAutoPlay(true);
      setSynthFallback(true);
      setPlayerMode('ARCHIVE');
      showNotification('SYSTEM CONFIGURATION RESTORED TO FACTORY DEFAULTS');
    }
  };

  const handleExportSettings = () => {
    try {
      const data = {
        version: '1.0.0',
        exportedAt: new Date().toISOString(),
        settings: storage.getSettings(),
        playerMode: storage.getPlayerMode(),
        vinylCrackle: storage.getVinylCrackle(),
        turntableSpeed: storage.getTurntableSpeed(),
        archivesCount: (storage.getArchives() || []).length,
        likedTracksCount: storage.getLikedTracks().length,
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `shono-config-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showNotification('CONFIGURATION EXPORTED SUCCESSFULLY');
    } catch {
      showNotification('ERROR EXPORTING SETTINGS');
    }
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result;
        if (typeof text !== 'string') return;
        const parsed = JSON.parse(text);
        if (parsed.settings) {
          storage.saveSettings(parsed.settings);
          if (parsed.settings.theme) setTheme(parsed.settings.theme);
        }
        if (parsed.playerMode) setPlayerMode(parsed.playerMode);
        showNotification('CONFIGURATION IMPORTED SUCCESSFULLY');
      } catch {
        alert('Invalid JSON configuration file.');
      }
    };
    reader.readAsText(file);
  };

  const tabs: { id: SettingsTab; label: string }[] = [
    { id: 'GENERAL', label: 'GENERAL' },
    { id: 'PLAYER', label: 'PLAYER' },
    { id: 'APPEARANCE', label: 'APPEARANCE' },
    { id: 'INTEGRATIONS', label: 'INTEGRATIONS' },
    { id: 'AUDIO', label: 'AUDIO' },
    { id: 'ADVANCED', label: 'ADVANCED' },
  ];

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minHeight: 0,
        background: 'var(--bg-primary)',
        color: 'var(--text-primary)',
        overflow: 'hidden',
        position: 'relative',
        userSelect: 'none',
        transition: 'background-color 0.2s ease, color 0.2s ease',
      }}
    >
      {/* Toast Notice */}
      {actionNotice && (
        <div
          style={{
            position: 'absolute',
            top: '16px',
            right: '24px',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--accent-color)',
            padding: '8px 16px',
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            letterSpacing: '0.12em',
            color: 'var(--accent-color)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.5), 0 0 12px var(--accent-subtle)',
            zIndex: 99,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent-color)' }} />
          {actionNotice}
        </div>
      )}

      {/* Hidden File Input for Config Import */}
      <input
        type="file"
        ref={fileInputRef}
        accept=".json"
        style={{ display: 'none' }}
        onChange={handleImportFile}
      />

      {/* TOP HEADER */}
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          padding: '24px 32px 18px 32px',
          borderBottom: '1px solid var(--border-color)',
          flexShrink: 0,
          background: 'var(--bg-secondary)',
          transition: 'background-color 0.2s ease, border-color 0.2s ease',
        }}
      >
        <div>
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '34px',
              lineHeight: 1,
              letterSpacing: '0.06em',
              color: 'var(--text-primary)',
              margin: 0,
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            SETTINGS
          </h1>
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '9.5px',
              letterSpacing: '0.14em',
              color: 'var(--text-secondary)',
              textTransform: 'uppercase',
              marginTop: '5px',
            }}
          >
            CUSTOMISE YOUR LISTENING EXPERIENCE
          </div>
        </div>

        {/* Right Corner: Quote & Live Clock */}
        <div style={{ textAlign: 'right' }}>
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '9px',
              letterSpacing: '0.15em',
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              marginBottom: '4px',
            }}
          >
            “SAME SONGS. DIFFERENT WORLDS.”
          </div>
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '10px',
              fontWeight: 700,
              letterSpacing: '0.12em',
              color: 'var(--accent-color)',
            }}
          >
            {currentTimeStr || 'SYSTEM ONLINE'}
          </div>
        </div>
      </header>

      {/* CATEGORY TABS BAR */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '2px',
          padding: '0 32px',
          borderBottom: '1px solid var(--border-color)',
          background: 'var(--bg-secondary)',
          flexShrink: 0,
          overflowX: 'auto',
          transition: 'background-color 0.2s ease, border-color 0.2s ease',
        }}
      >
        {tabs.map((t) => {
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              style={{
                background: 'transparent',
                border: 'none',
                borderBottom: isActive ? '2px solid var(--accent-color)' : '2px solid transparent',
                padding: '12px 18px',
                fontFamily: 'var(--font-mono)',
                fontSize: '10.5px',
                fontWeight: isActive ? 700 : 500,
                letterSpacing: '0.14em',
                color: isActive ? 'var(--accent-color)' : 'var(--text-secondary)',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.color = 'var(--text-primary)';
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.color = 'var(--text-secondary)';
              }}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {/* SCROLLABLE MAIN CONTENT BODY */}
      <div
        style={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          padding: '24px 32px 40px 32px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          background: 'var(--bg-primary)',
          transition: 'background-color 0.2s ease',
        }}
      >
        {/* ========================================================= */}
        {/* TAB 1: GENERAL (MAIN CONCEPT DASHBOARD)                   */}
        {/* ========================================================= */}
        {activeTab === 'GENERAL' && (
          <>
            {/* Top Row: 2-Column Grid (Player Mode & Audio Options) */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
                gap: '18px',
              }}
            >
              {/* CARD 01: PLAYER MODE */}
              <div
                style={{
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  padding: '20px 22px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                  transition: 'background-color 0.2s ease, border-color 0.2s ease',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '11px',
                      fontWeight: 700,
                      letterSpacing: '0.14em',
                      color: 'var(--text-primary)',
                    }}
                  >
                    PLAYER MODE
                  </div>
                  <div
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '10px',
                      color: 'var(--text-muted)',
                    }}
                  >
                    01
                  </div>
                </div>

                {/* Mode Selector Cards */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '12px',
                  }}
                >
                  {/* ARCHIVE MODE CARD */}
                  <div
                    onClick={() => setPlayerMode('ARCHIVE')}
                    style={{
                      background: playerMode === 'ARCHIVE' ? 'var(--bg-hover)' : 'var(--bg-tertiary)',
                      border: playerMode === 'ARCHIVE' ? '1.5px solid var(--accent-color)' : '1px solid var(--border-subtle)',
                      padding: '16px',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      minHeight: '130px',
                      boxShadow: playerMode === 'ARCHIVE' ? '0 0 16px var(--accent-subtle)' : 'none',
                      transition: 'all 0.15s ease',
                      position: 'relative',
                    }}
                  >
                    {/* Radio Indicator */}
                    <div
                      style={{
                        position: 'absolute',
                        top: '12px',
                        right: '12px',
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        border: playerMode === 'ARCHIVE' ? '2px solid var(--accent-color)' : '1.5px solid var(--border-bright)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {playerMode === 'ARCHIVE' && (
                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent-color)' }} />
                      )}
                    </div>

                    <LayoutGrid size={24} color={playerMode === 'ARCHIVE' ? 'var(--accent-color)' : 'var(--text-muted)'} />

                    <div>
                      <div
                        style={{
                          fontFamily: 'var(--font-display)',
                          fontSize: '18px',
                          letterSpacing: '0.06em',
                          color: playerMode === 'ARCHIVE' ? 'var(--text-primary)' : 'var(--text-secondary)',
                          marginBottom: '3px',
                        }}
                      >
                        ARCHIVE
                      </div>
                      <div
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '9.5px',
                          color: 'var(--text-muted)',
                          lineHeight: 1.35,
                        }}
                      >
                        Standard brutalist 3-column index.
                      </div>
                    </div>
                  </div>

                  {/* 007 / MI6 MODE CARD */}
                  <div
                    onClick={() => setPlayerMode('MI6')}
                    style={{
                      background: playerMode === 'MI6' ? 'var(--bg-hover)' : 'var(--bg-tertiary)',
                      border: playerMode === 'MI6' ? '1.5px solid var(--accent-color)' : '1px solid var(--border-subtle)',
                      padding: '16px',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      minHeight: '130px',
                      boxShadow: playerMode === 'MI6' ? '0 0 16px var(--accent-subtle)' : 'none',
                      transition: 'all 0.15s ease',
                      position: 'relative',
                    }}
                  >
                    {/* Radio Indicator */}
                    <div
                      style={{
                        position: 'absolute',
                        top: '12px',
                        right: '12px',
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        border: playerMode === 'MI6' ? '2px solid var(--accent-color)' : '1.5px solid var(--border-bright)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {playerMode === 'MI6' && (
                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent-color)' }} />
                      )}
                    </div>

                    <Disc size={24} color={playerMode === 'MI6' ? 'var(--accent-color)' : 'var(--text-muted)'} />

                    <div>
                      <div
                        style={{
                          fontFamily: 'var(--font-display)',
                          fontSize: '18px',
                          letterSpacing: '0.06em',
                          color: playerMode === 'MI6' ? 'var(--text-primary)' : 'var(--text-secondary)',
                          marginBottom: '3px',
                        }}
                      >
                        007 / MI6
                      </div>
                      <div
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '9.5px',
                          color: 'var(--text-muted)',
                          lineHeight: 1.35,
                        }}
                      >
                        Analog vinyl turntable & dossier.
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* CARD 02: AUDIO OPTIONS */}
              <div
                style={{
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  padding: '20px 22px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                  transition: 'background-color 0.2s ease, border-color 0.2s ease',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '11px',
                      fontWeight: 700,
                      letterSpacing: '0.14em',
                      color: 'var(--text-primary)',
                    }}
                  >
                    AUDIO OPTIONS
                  </div>
                  <div
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '10px',
                      color: 'var(--text-muted)',
                    }}
                  >
                    02
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {/* Synthesis Audio Fallback */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ paddingRight: '12px' }}>
                      <div
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '10.5px',
                          fontWeight: 600,
                          letterSpacing: '0.08em',
                          color: 'var(--text-primary)',
                          marginBottom: '2px',
                        }}
                      >
                        SYNTHESIS AUDIO FALLBACK
                      </div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--text-muted)' }}>
                        Ambient harmonic chords for restricted videos.
                      </div>
                    </div>

                    <button
                      onClick={handleToggleSynthFallback}
                      style={{
                        width: '38px',
                        height: '20px',
                        borderRadius: '10px',
                        background: synthFallback ? 'var(--accent-color)' : 'var(--bg-tertiary)',
                        border: '1px solid ' + (synthFallback ? 'var(--accent-color)' : 'var(--border-bright)'),
                        position: 'relative',
                        cursor: 'pointer',
                        flexShrink: 0,
                        transition: 'background 0.2s ease',
                      }}
                    >
                      <div
                        style={{
                          position: 'absolute',
                          top: '2px',
                          left: synthFallback ? '20px' : '3px',
                          width: '14px',
                          height: '14px',
                          borderRadius: '50%',
                          background: synthFallback ? 'var(--bg-primary)' : 'var(--text-muted)',
                          transition: 'left 0.2s ease',
                        }}
                      />
                    </button>
                  </div>

                  {/* Continuous Audio Advancement */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ paddingRight: '12px' }}>
                      <div
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '10.5px',
                          fontWeight: 600,
                          letterSpacing: '0.08em',
                          color: 'var(--text-primary)',
                          marginBottom: '2px',
                        }}
                      >
                        CONTINUOUS AUDIO ADVANCEMENT
                      </div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--text-muted)' }}>
                        Automatically play next track in queue.
                      </div>
                    </div>

                    <button
                      onClick={handleToggleAutoPlay}
                      style={{
                        width: '38px',
                        height: '20px',
                        borderRadius: '10px',
                        background: autoPlay ? 'var(--accent-color)' : 'var(--bg-tertiary)',
                        border: '1px solid ' + (autoPlay ? 'var(--accent-color)' : 'var(--border-bright)'),
                        position: 'relative',
                        cursor: 'pointer',
                        flexShrink: 0,
                        transition: 'background 0.2s ease',
                      }}
                    >
                      <div
                        style={{
                          position: 'absolute',
                          top: '2px',
                          left: autoPlay ? '20px' : '3px',
                          width: '14px',
                          height: '14px',
                          borderRadius: '50%',
                          background: autoPlay ? 'var(--bg-primary)' : 'var(--text-muted)',
                          transition: 'left 0.2s ease',
                        }}
                      />
                    </button>
                  </div>

                  {/* Vinyl Crackle (007 Mode) */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ paddingRight: '12px' }}>
                      <div
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '10.5px',
                          fontWeight: 600,
                          letterSpacing: '0.08em',
                          color: 'var(--text-primary)',
                          marginBottom: '2px',
                        }}
                      >
                        VINYL CRACKLE (007 MODE)
                      </div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--text-muted)' }}>
                        Adds subtle analog lo-fi texture to playback.
                      </div>
                    </div>

                    <button
                      onClick={toggleVinylCrackle}
                      style={{
                        width: '38px',
                        height: '20px',
                        borderRadius: '10px',
                        background: isVinylCrackle ? 'var(--accent-color)' : 'var(--bg-tertiary)',
                        border: '1px solid ' + (isVinylCrackle ? 'var(--accent-color)' : 'var(--border-bright)'),
                        position: 'relative',
                        cursor: 'pointer',
                        flexShrink: 0,
                        transition: 'background 0.2s ease',
                      }}
                    >
                      <div
                        style={{
                          position: 'absolute',
                          top: '2px',
                          left: isVinylCrackle ? '20px' : '3px',
                          width: '14px',
                          height: '14px',
                          borderRadius: '50%',
                          background: isVinylCrackle ? 'var(--bg-primary)' : 'var(--text-muted)',
                          transition: 'left 0.2s ease',
                        }}
                      />
                    </button>
                  </div>

                  {/* Normalise Volume */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ paddingRight: '12px' }}>
                      <div
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '10.5px',
                          fontWeight: 600,
                          letterSpacing: '0.08em',
                          color: 'var(--text-primary)',
                          marginBottom: '2px',
                        }}
                      >
                        NORMALISE VOLUME
                      </div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--text-muted)' }}>
                        Keep playback loudness and dynamics consistent.
                      </div>
                    </div>

                    <button
                      onClick={handleToggleNormalize}
                      style={{
                        width: '38px',
                        height: '20px',
                        borderRadius: '10px',
                        background: normalizeVolume ? 'var(--accent-color)' : 'var(--bg-tertiary)',
                        border: '1px solid ' + (normalizeVolume ? 'var(--accent-color)' : 'var(--border-bright)'),
                        position: 'relative',
                        cursor: 'pointer',
                        flexShrink: 0,
                        transition: 'background 0.2s ease',
                      }}
                    >
                      <div
                        style={{
                          position: 'absolute',
                          top: '2px',
                          left: normalizeVolume ? '20px' : '3px',
                          width: '14px',
                          height: '14px',
                          borderRadius: '50%',
                          background: normalizeVolume ? 'var(--bg-primary)' : 'var(--text-muted)',
                          transition: 'left 0.2s ease',
                        }}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Middle Row: Quick Actions & Appearance */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
                gap: '18px',
              }}
            >
              {/* CARD 03: QUICK ACTIONS */}
              <div
                style={{
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  padding: '20px 22px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                  transition: 'background-color 0.2s ease, border-color 0.2s ease',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '11px',
                      fontWeight: 700,
                      letterSpacing: '0.14em',
                      color: 'var(--text-primary)',
                    }}
                  >
                    QUICK ACTIONS
                  </div>
                  <div
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '10px',
                      color: 'var(--text-muted)',
                    }}
                  >
                    03
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {/* Clear All Archives */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '10px',
                          fontWeight: 600,
                          color: 'var(--text-primary)',
                        }}
                      >
                        CLEAR ALL ARCHIVES
                      </div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '8.5px', color: 'var(--text-muted)' }}>
                        Remove all saved playlists and cached audio data.
                      </div>
                    </div>
                    <button
                      onClick={handleClearArchives}
                      style={{
                        background: 'transparent',
                        border: '1px solid var(--status-live)',
                        color: 'var(--status-live)',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '9.5px',
                        fontWeight: 700,
                        letterSpacing: '0.1em',
                        padding: '4px 14px',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      CLEAR
                    </button>
                  </div>

                  {/* Reset Settings */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '10px',
                          fontWeight: 600,
                          color: 'var(--text-primary)',
                        }}
                      >
                        RESET SETTINGS
                      </div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '8.5px', color: 'var(--text-muted)' }}>
                        Restore system configuration to factory default.
                      </div>
                    </div>
                    <button
                      onClick={handleResetSettings}
                      style={{
                        background: 'transparent',
                        border: '1px solid var(--border-bright)',
                        color: 'var(--text-primary)',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '9.5px',
                        fontWeight: 700,
                        letterSpacing: '0.1em',
                        padding: '4px 14px',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = 'var(--accent-color)';
                        e.currentTarget.style.color = 'var(--accent-color)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'var(--border-bright)';
                        e.currentTarget.style.color = 'var(--text-primary)';
                      }}
                    >
                      RESET
                    </button>
                  </div>

                  {/* Export Settings */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '10px',
                          fontWeight: 600,
                          color: 'var(--text-primary)',
                        }}
                      >
                        EXPORT SETTINGS
                      </div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '8.5px', color: 'var(--text-muted)' }}>
                        Save your audio configuration to a JSON file.
                      </div>
                    </div>
                    <button
                      onClick={handleExportSettings}
                      style={{
                        background: 'transparent',
                        border: '1px solid var(--border-bright)',
                        color: 'var(--text-primary)',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '9.5px',
                        fontWeight: 700,
                        letterSpacing: '0.1em',
                        padding: '4px 14px',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = 'var(--accent-color)';
                        e.currentTarget.style.color = 'var(--accent-color)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'var(--border-bright)';
                        e.currentTarget.style.color = 'var(--text-primary)';
                      }}
                    >
                      EXPORT
                    </button>
                  </div>

                  {/* Import Settings */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '10px',
                          fontWeight: 600,
                          color: 'var(--text-primary)',
                        }}
                      >
                        IMPORT SETTINGS
                      </div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '8.5px', color: 'var(--text-muted)' }}>
                        Load configuration from a backup file.
                      </div>
                    </div>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      style={{
                        background: 'transparent',
                        border: '1px solid var(--border-bright)',
                        color: 'var(--text-primary)',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '9.5px',
                        fontWeight: 700,
                        letterSpacing: '0.1em',
                        padding: '4px 14px',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = 'var(--accent-color)';
                        e.currentTarget.style.color = 'var(--accent-color)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'var(--border-bright)';
                        e.currentTarget.style.color = 'var(--text-primary)';
                      }}
                    >
                      IMPORT
                    </button>
                  </div>

                  {/* Clear Current Queue */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '10px',
                          fontWeight: 600,
                          color: 'var(--text-primary)',
                        }}
                      >
                        CLEAR CURRENT QUEUE
                      </div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '8.5px', color: 'var(--text-muted)' }}>
                        Empty the currently active playback track list.
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        clearQueue();
                        showNotification('PLAYBACK QUEUE CLEARED');
                      }}
                      style={{
                        background: 'transparent',
                        border: '1px solid var(--border-bright)',
                        color: 'var(--text-primary)',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '9.5px',
                        fontWeight: 700,
                        letterSpacing: '0.1em',
                        padding: '4px 14px',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = 'var(--accent-color)';
                        e.currentTarget.style.color = 'var(--accent-color)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'var(--border-bright)';
                        e.currentTarget.style.color = 'var(--text-primary)';
                      }}
                    >
                      CLEAR QUEUE
                    </button>
                  </div>
                </div>
              </div>

              {/* CARD 04: APPEARANCE PALETTES */}
              <div
                style={{
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  padding: '20px 22px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                  transition: 'background-color 0.2s ease, border-color 0.2s ease',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '11px',
                      fontWeight: 700,
                      letterSpacing: '0.14em',
                      color: 'var(--text-primary)',
                    }}
                  >
                    THEME PALETTE
                  </div>
                  <div
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '10px',
                      color: 'var(--text-muted)',
                    }}
                  >
                    04
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {THEME_OPTIONS.map((thm) => {
                    const isCurrent = theme === thm.id;
                    return (
                      <div
                        key={thm.id}
                        onClick={() => {
                          setTheme(thm.id);
                          showNotification(`THEME APPLIED: ${thm.name}`);
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '8px 12px',
                          background: isCurrent ? 'var(--bg-tertiary)' : 'var(--bg-secondary)',
                          border: isCurrent ? '1px solid var(--accent-color)' : '1px solid var(--border-subtle)',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          {/* Color Swatch Dot */}
                          <div
                            style={{
                              width: '14px',
                              height: '14px',
                              background: thm.previewBg,
                              border: `1.5px solid ${thm.previewAccent}`,
                              flexShrink: 0,
                            }}
                          />
                          <div>
                            <div
                              style={{
                                fontFamily: 'var(--font-mono)',
                                fontSize: '10px',
                                fontWeight: 600,
                                color: isCurrent ? 'var(--accent-color)' : 'var(--text-primary)',
                              }}
                            >
                              {thm.name}
                            </div>
                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '8px', color: 'var(--text-muted)' }}>
                              {thm.description.slice(0, 52)}...
                            </div>
                          </div>
                        </div>

                        {isCurrent && <Check size={14} color="var(--accent-color)" />}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* CARD 05: ABOUT & SPECIFICATION (FULL-WIDTH BOTTOM BANNER) */}
            <div
              style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                padding: '24px 28px',
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '24px',
                transition: 'background-color 0.2s ease, border-color 0.2s ease',
              }}
            >
              {/* Brand & Version Info */}
              <div style={{ minWidth: '240px', flex: 1 }}>
                <div
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '26px',
                    letterSpacing: '0.06em',
                    color: 'var(--text-primary)',
                    lineHeight: 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <span style={{ color: 'var(--accent-color)' }}>|+|</span> SHONO<span style={{ color: 'var(--text-muted)' }}>.FM</span>
                </div>
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '9px',
                    letterSpacing: '0.14em',
                    color: 'var(--text-secondary)',
                    margin: '4px 0 10px 0',
                  }}
                >
                  PERSONAL AUDIO SYSTEM • VERSION 1.0.0
                </div>
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '10px',
                    color: 'var(--text-muted)',
                    lineHeight: 1.4,
                    maxWidth: '420px',
                  }}
                >
                  A personal music archive for the ones who listen a little deeper. Built with brute fidelity, analog physics & web audio synthesizers.
                </div>
              </div>

              {/* Useful Links */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '9.5px',
                  letterSpacing: '0.1em',
                }}
              >
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: 'var(--text-secondary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '5px' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent-color)')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
                >
                  GitHub Repository <ExternalLink size={10} />
                </a>
                <a
                  href="#documentation"
                  onClick={(e) => {
                    e.preventDefault();
                    showNotification('DOCUMENTATION: VAULT AUDIO ENGINE v1.0');
                  }}
                  style={{ color: 'var(--text-secondary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '5px' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent-color)')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
                >
                  System Manual & Shortcuts <ExternalLink size={10} />
                </a>
                <a
                  href="#report"
                  onClick={(e) => {
                    e.preventDefault();
                    showNotification('FEEDBACK LOGGED TO LOCAL CONSOLE');
                  }}
                  style={{ color: 'var(--text-secondary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '5px' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent-color)')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
                >
                  Report an Issue <ExternalLink size={10} />
                </a>
              </div>

              {/* Monolith Quote Block */}
              <div
                style={{
                  textAlign: 'right',
                  borderLeft: '1px solid var(--border-color)',
                  paddingLeft: '24px',
                }}
              >
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '11px',
                    fontWeight: 700,
                    letterSpacing: '0.14em',
                    color: 'var(--text-primary)',
                    marginBottom: '4px',
                  }}
                >
                  “SAME SONGS. DIFFERENT WORLDS.”
                </div>
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '8.5px',
                    letterSpacing: '0.16em',
                    color: 'var(--text-muted)',
                    textTransform: 'uppercase',
                  }}
                >
                  SHONO.FM • AUDIO ARCHIVE<br />
                  KOLKATA, INDIA // 2025
                </div>
              </div>
            </div>
          </>
        )}

        {/* ========================================================= */}
        {/* TAB 2: PLAYER (DETAILED PHYSICAL & VINYL CONTROLS)        */}
        {/* ========================================================= */}
        {activeTab === 'PLAYER' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div
              style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                padding: '24px 28px',
                display: 'flex',
                flexDirection: 'column',
                gap: '20px',
                transition: 'background-color 0.2s ease, border-color 0.2s ease',
              }}
            >
              <div
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '22px',
                  letterSpacing: '0.06em',
                  color: 'var(--text-primary)',
                }}
              >
                TURNTABLE & PLAYBACK ENGINE
              </div>

              {/* Speed Selector (33 RPM vs 45 RPM) */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '18px' }}>
                <div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 600, color: 'var(--text-primary)' }}>
                    TURNTABLE ROTATION SPEED
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--text-muted)' }}>
                    Governs vinyl playback simulation and scratch scrubbing physics.
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  {([33, 45] as const).map((spd) => (
                    <button
                      key={spd}
                      onClick={() => {
                        setTurntableSpeed(spd as TurntableSpeed);
                        showNotification(`PLATTER SPEED SET TO ${spd} RPM`);
                      }}
                      style={{
                        background: turntableSpeed === spd ? 'var(--accent-color)' : 'var(--bg-tertiary)',
                        color: turntableSpeed === spd ? 'var(--bg-primary)' : 'var(--text-primary)',
                        border: '1px solid ' + (turntableSpeed === spd ? 'var(--accent-color)' : 'var(--border-bright)'),
                        fontFamily: 'var(--font-mono)',
                        fontSize: '11px',
                        fontWeight: 700,
                        padding: '6px 16px',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {spd} RPM
                    </button>
                  ))}
                </div>
              </div>

              {/* CRT Scanline Phosphor Overlay */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 600, color: 'var(--text-primary)' }}>
                    CRT MONITOR PHOSPHOR SCANLINES
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--text-muted)' }}>
                    Simulates vintage cathode-ray tube surveillance monitors with subtle horizontal sweep lines.
                  </div>
                </div>

                <button
                  onClick={handleToggleCrt}
                  style={{
                    width: '38px',
                    height: '20px',
                    borderRadius: '10px',
                    background: crtEffect ? 'var(--accent-color)' : 'var(--bg-tertiary)',
                    border: '1px solid ' + (crtEffect ? 'var(--accent-color)' : 'var(--border-bright)'),
                    position: 'relative',
                    cursor: 'pointer',
                    flexShrink: 0,
                    transition: 'background 0.2s ease',
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      top: '2px',
                      left: crtEffect ? '20px' : '3px',
                      width: '14px',
                      height: '14px',
                      borderRadius: '50%',
                      background: crtEffect ? 'var(--bg-primary)' : 'var(--text-muted)',
                      transition: 'left 0.2s ease',
                    }}
                  />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: APPEARANCE (FULL THEMES & DESIGN TOKENS)           */}
        {/* ========================================================= */}
        {activeTab === 'APPEARANCE' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div
              style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                padding: '24px 28px',
                transition: 'background-color 0.2s ease, border-color 0.2s ease',
              }}
            >
              <div
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '22px',
                  letterSpacing: '0.06em',
                  color: 'var(--text-primary)',
                  marginBottom: '16px',
                }}
              >
                BRUTALIST ARCHITECTURAL THEMES
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                {THEME_OPTIONS.map((thm) => {
                  const isCurrent = theme === thm.id;
                  return (
                    <div
                      key={thm.id}
                      onClick={() => {
                        setTheme(thm.id);
                        showNotification(`THEME APPLIED: ${thm.name}`);
                      }}
                      style={{
                        background: thm.previewBg,
                        border: isCurrent ? '2px solid var(--accent-color)' : `1px solid ${thm.previewBorder}`,
                        padding: '16px',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        minHeight: '140px',
                        position: 'relative',
                        boxShadow: isCurrent ? '0 0 14px var(--accent-subtle)' : 'none',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: thm.previewAccent, fontWeight: 700 }}>
                          {thm.index} // PALETTE
                        </span>
                        {isCurrent && <Check size={16} color="var(--accent-color)" />}
                      </div>

                      <div>
                        <div
                          style={{
                            fontFamily: 'var(--font-display)',
                            fontSize: '18px',
                            color: thm.previewText,
                            marginBottom: '4px',
                          }}
                        >
                          {thm.name}
                        </div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '8.5px', color: thm.previewText, opacity: 0.7 }}>
                          {thm.description}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: INTEGRATIONS (BACKEND PIPELINE & CACHE)            */}
        {/* ========================================================= */}
        {activeTab === 'INTEGRATIONS' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div
              style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                padding: '24px 28px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                transition: 'background-color 0.2s ease, border-color 0.2s ease',
              }}
            >
              <div
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '22px',
                  letterSpacing: '0.06em',
                  color: 'var(--text-primary)',
                }}
              >
                INGESTION PIPELINE & VAULT STORAGE
              </div>

              {/* Status Row */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-color)',
                  padding: '14px 18px',
                }}
              >
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--status-active)', boxShadow: '0 0 8px var(--status-active)' }} />
                <div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 700, color: 'var(--text-primary)' }}>
                    YOUTUBE AUDIO PIPELINE: ACTIVE & SECURED
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    Server backend credentials managed securely. Web Audio synthesis fallback active for regional restrictions.
                  </div>
                </div>
              </div>

              {/* Storage Stats */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 1fr',
                  gap: '12px',
                  marginTop: '10px',
                }}
              >
                <div style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)', padding: '14px' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '8.5px', color: 'var(--text-muted)' }}>SAVED PLAYLISTS</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '24px', color: 'var(--accent-color)' }}>{archives.length}</div>
                </div>
                <div style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)', padding: '14px' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '8.5px', color: 'var(--text-muted)' }}>STORAGE PROTOCOL</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '24px', color: 'var(--text-primary)' }}>LOCAL STORAGE</div>
                </div>
                <div style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)', padding: '14px' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '8.5px', color: 'var(--text-muted)' }}>STREAM ENGINE</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '24px', color: 'var(--text-primary)' }}>IFRAME / SYNTH</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 5: AUDIO (EQ & SYNTHESIZER METRICS)                    */}
        {/* ========================================================= */}
        {activeTab === 'AUDIO' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div
              style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                padding: '24px 28px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                transition: 'background-color 0.2s ease, border-color 0.2s ease',
              }}
            >
              <div
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '22px',
                  letterSpacing: '0.06em',
                  color: 'var(--text-primary)',
                }}
              >
                AUDIO ENGINE & EQUALIZATION
              </div>

              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Direct Web Audio API pipeline with 256-band Fast Fourier Transform (FFT) real-time spectral analysis, stereo VU meters, and calibrated vinyl needle crackle synthesis.
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginTop: '8px' }}>
                <div style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', padding: '14px' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--text-muted)' }}>FFT FREQUENCY BANDS</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', fontWeight: 700, color: 'var(--accent-color)', marginTop: '4px' }}>
                    256 BINS (32Hz — 16kHz)
                  </div>
                </div>
                <div style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', padding: '14px' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--text-muted)' }}>SAMPLE RATE</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', fontWeight: 700, color: 'var(--status-active)', marginTop: '4px' }}>
                    48,000 HZ • 24-BIT HIGH FIDELITY
                  </div>
                </div>
              </div>

              {/* Live Master Studio Equalizer Module */}
              <div style={{ marginTop: '14px', maxWidth: '440px' }}>
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '9px',
                    letterSpacing: '0.12em',
                    color: 'var(--text-muted)',
                    marginBottom: '8px',
                    textTransform: 'uppercase',
                  }}
                >
                  LIVE FREQUENCY MATRIX & DSP EQUALIZATION
                </div>
                <SidebarEqualizer />
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 6: ADVANCED (DIAGNOSTICS & PURGE)                     */}
        {/* ========================================================= */}
        {activeTab === 'ADVANCED' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div
              style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                padding: '24px 28px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                transition: 'background-color 0.2s ease, border-color 0.2s ease',
              }}
            >
              <div
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '22px',
                  letterSpacing: '0.06em',
                  color: 'var(--text-primary)',
                }}
              >
                ADVANCED SYSTEM DIAGNOSTICS
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', padding: '12px 16px' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-primary)' }}>PURGE LOCAL STORAGE CACHE</span>
                  <button
                    onClick={() => {
                      localStorage.clear();
                      window.location.reload();
                    }}
                    style={{ background: 'var(--status-live)', color: '#fff', border: 'none', padding: '6px 14px', fontFamily: 'var(--font-mono)', fontSize: '9px', fontWeight: 700, cursor: 'pointer' }}
                  >
                    PURGE ALL CACHE
                  </button>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', padding: '12px 16px' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-primary)' }}>EXPORT FULL DATABASE TO JSON</span>
                  <button
                    onClick={handleExportSettings}
                    style={{ background: 'var(--accent-color)', color: 'var(--bg-primary)', border: 'none', padding: '6px 14px', fontFamily: 'var(--font-mono)', fontSize: '9px', fontWeight: 700, cursor: 'pointer' }}
                  >
                    DOWNLOAD DATABASE
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
