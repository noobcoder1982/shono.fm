import React, { useState, useEffect, useRef } from 'react';
import { usePlayer } from '../context/PlayerContext';
import { storage, CURRENT_APP_VERSION, type BrutalistTheme } from '../services/storage';
import type { TurntableSpeed } from '../types';
import {
  LayoutGrid,
  Disc,
  Check,
  ExternalLink,
  Sparkles,
  Sliders,
  Volume2,
  Tv,
  Database,
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
    description: 'Deep obsidian #090909, hairline borders, and stark off-white typography.',
    previewBg: '#090909',
    previewBorder: '#333333',
    previewText: '#f0f0f0',
    previewAccent: '#ffffff',
  },
  {
    id: 'concrete',
    index: '02',
    name: 'CONCRETE SLAB',
    description: 'Industrial cement slate #151619, cold shadows, and crisp steel tones.',
    previewBg: '#151619',
    previewBorder: '#4d5463',
    previewText: '#f8fafc',
    previewAccent: '#38bdf8',
  },
  {
    id: 'amber',
    index: '03',
    name: 'PHOSPHOR AMBER',
    description: 'Vintage 1980s monochrome CRT terminal with warm amber phosphor glow.',
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
    description: 'Stark bone-white editorial catalogue with heavy pure black ink typography.',
    previewBg: '#ebebe5',
    previewBorder: '#98988a',
    previewText: '#0f0f0f',
    previewAccent: '#111111',
  },
  {
    id: 'apple-glass',
    index: '06',
    name: 'APPLE GLASS (DARK)',
    description: 'Frosted translucent obsidian glass, dynamic album refraction, and rich depth.',
    previewBg: '#141419',
    previewBorder: 'rgba(255, 255, 255, 0.22)',
    previewText: '#ffffff',
    previewAccent: '#fa2d48',
  },
  {
    id: 'apple-glass-light',
    index: '07',
    name: 'APPLE GLASS (LIGHT)',
    description: 'Luminous crystal frosted glass with daylight refraction and crisp typography.',
    previewBg: '#f5f5f7',
    previewBorder: 'rgba(0, 0, 0, 0.15)',
    previewText: '#1d1d1f',
    previewAccent: '#0071e3',
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
    setIsChangelogOpen,
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
      setCurrentTimeStr(`${dayName}, ${day} ${month} ${year} • ${hours}:${minutes}:${seconds}`);
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
        version: CURRENT_APP_VERSION,
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
            borderRadius: '8px',
            padding: '10px 18px',
            fontFamily: 'var(--font-mono)',
            fontSize: '12px',
            fontWeight: 600,
            letterSpacing: '0.08em',
            color: 'var(--accent-color)',
            boxShadow: '0 10px 30px rgba(0,0,0,0.6), 0 0 16px var(--accent-subtle)',
            zIndex: 99,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-color)' }} />
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
          alignItems: 'center',
          padding: '24px 36px 18px 36px',
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
              fontSize: '36px',
              lineHeight: 1,
              letterSpacing: '0.04em',
              color: 'var(--text-primary)',
              margin: 0,
            }}
          >
            SETTINGS
          </h1>
          <div
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '13px',
              color: 'var(--text-secondary)',
              marginTop: '5px',
              fontWeight: 500,
            }}
          >
            Configure audio telemetry, playback physics, and architectural interface themes.
          </div>
        </div>

        {/* Right Corner: Live Clock */}
        <div style={{ textAlign: 'right' }}>
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              letterSpacing: '0.12em',
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              marginBottom: '4px',
            }}
          >
            SYSTEM CLOCK
          </div>
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '12px',
              fontWeight: 700,
              letterSpacing: '0.06em',
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
          gap: '4px',
          padding: '0 36px',
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
                padding: '13px 20px',
                fontFamily: 'var(--font-mono)',
                fontSize: '11.5px',
                fontWeight: isActive ? 700 : 500,
                letterSpacing: '0.1em',
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
          padding: '28px 36px 48px 36px',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
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
                gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))',
                gap: '24px',
              }}
            >
              {/* CARD 01: PLAYER MODE */}
              <div className="settings-card">
                <div className="settings-card-header">
                  <div className="settings-card-title">
                    <LayoutGrid size={15} color="var(--accent-color)" />
                    <span>PLAYER MODE</span>
                  </div>
                  <div className="settings-card-badge">01</div>
                </div>

                {/* Mode Selector Cards */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '14px',
                  }}
                >
                  {/* ARCHIVE MODE CARD */}
                  <div
                    className={`settings-mode-card ${playerMode === 'ARCHIVE' ? 'is-active' : ''}`}
                    onClick={() => setPlayerMode('ARCHIVE')}
                  >
                    {/* Radio Indicator */}
                    <div
                      style={{
                        position: 'absolute',
                        top: '14px',
                        right: '14px',
                        width: '16px',
                        height: '16px',
                        borderRadius: '50%',
                        border: playerMode === 'ARCHIVE' ? '2px solid var(--accent-color)' : '1.5px solid var(--border-bright)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {playerMode === 'ARCHIVE' && (
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-color)' }} />
                      )}
                    </div>

                    <LayoutGrid size={26} color={playerMode === 'ARCHIVE' ? 'var(--accent-color)' : 'var(--text-muted)'} />

                    <div style={{ marginTop: '12px' }}>
                      <div
                        style={{
                          fontFamily: 'var(--font-sans)',
                          fontSize: '16px',
                          fontWeight: 700,
                          letterSpacing: '0.02em',
                          color: playerMode === 'ARCHIVE' ? 'var(--text-primary)' : 'var(--text-secondary)',
                          marginBottom: '4px',
                        }}
                      >
                        ARCHIVE MODE
                      </div>
                      <div
                        style={{
                          fontFamily: 'var(--font-sans)',
                          fontSize: '12.5px',
                          color: 'var(--text-secondary)',
                          lineHeight: 1.45,
                        }}
                      >
                        Standard brutalist 3-column index with precision track catalogue and telemetry.
                      </div>
                    </div>
                  </div>

                  {/* 007 / MI6 MODE CARD */}
                  <div
                    className={`settings-mode-card ${playerMode === 'MI6' ? 'is-active' : ''}`}
                    onClick={() => setPlayerMode('MI6')}
                  >
                    {/* Radio Indicator */}
                    <div
                      style={{
                        position: 'absolute',
                        top: '14px',
                        right: '14px',
                        width: '16px',
                        height: '16px',
                        borderRadius: '50%',
                        border: playerMode === 'MI6' ? '2px solid var(--accent-color)' : '1.5px solid var(--border-bright)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {playerMode === 'MI6' && (
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-color)' }} />
                      )}
                    </div>

                    <Disc size={26} color={playerMode === 'MI6' ? 'var(--accent-color)' : 'var(--text-muted)'} />

                    <div style={{ marginTop: '12px' }}>
                      <div
                        style={{
                          fontFamily: 'var(--font-sans)',
                          fontSize: '16px',
                          fontWeight: 700,
                          letterSpacing: '0.02em',
                          color: playerMode === 'MI6' ? 'var(--text-primary)' : 'var(--text-secondary)',
                          marginBottom: '4px',
                        }}
                      >
                        007 / MI6 DOSSIER
                      </div>
                      <div
                        style={{
                          fontFamily: 'var(--font-sans)',
                          fontSize: '12.5px',
                          color: 'var(--text-secondary)',
                          lineHeight: 1.45,
                        }}
                      >
                        Analog vinyl turntable with spinning record, physical tonearm, and vintage dossier.
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* CARD 02: AUDIO OPTIONS */}
              <div className="settings-card">
                <div className="settings-card-header">
                  <div className="settings-card-title">
                    <Volume2 size={15} color="var(--accent-color)" />
                    <span>AUDIO OPTIONS</span>
                  </div>
                  <div className="settings-card-badge">02</div>
                </div>

                <div>
                  {/* Synthesis Audio Fallback */}
                  <div className="settings-row">
                    <div className="settings-row-text">
                      <div className="settings-row-title">SYNTHESIS AUDIO FALLBACK</div>
                      <div className="settings-row-desc">
                        Generates ambient harmonic chord synthesis when YouTube streams are region-blocked.
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleToggleSynthFallback}
                      className={`settings-toggle ${synthFallback ? 'is-on' : ''}`}
                      aria-label="Toggle synthesis audio fallback"
                    >
                      <div className="settings-toggle-knob" />
                    </button>
                  </div>

                  {/* Continuous Audio Advancement */}
                  <div className="settings-row">
                    <div className="settings-row-text">
                      <div className="settings-row-title">CONTINUOUS PLAYBACK</div>
                      <div className="settings-row-desc">
                        Automatically advance to the next track in the current archive or playback queue.
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleToggleAutoPlay}
                      className={`settings-toggle ${autoPlay ? 'is-on' : ''}`}
                      aria-label="Toggle continuous playback"
                    >
                      <div className="settings-toggle-knob" />
                    </button>
                  </div>

                  {/* Vinyl Crackle (007 Mode) */}
                  <div className="settings-row">
                    <div className="settings-row-text">
                      <div className="settings-row-title">VINYL CRACKLE SIMULATION</div>
                      <div className="settings-row-desc">
                        Injects authentic analog vinyl dust & needle friction texture into playback audio.
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={toggleVinylCrackle}
                      className={`settings-toggle ${isVinylCrackle ? 'is-on' : ''}`}
                      aria-label="Toggle vinyl crackle"
                    >
                      <div className="settings-toggle-knob" />
                    </button>
                  </div>

                  {/* Normalise Volume */}
                  <div className="settings-row">
                    <div className="settings-row-text">
                      <div className="settings-row-title">NORMALIZE VOLUME</div>
                      <div className="settings-row-desc">
                        Smooth dynamic range to keep volume output consistent across diverse audio sources.
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleToggleNormalize}
                      className={`settings-toggle ${normalizeVolume ? 'is-on' : ''}`}
                      aria-label="Toggle volume normalization"
                    >
                      <div className="settings-toggle-knob" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Middle Row: Quick Actions & Theme Palette */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))',
                gap: '24px',
              }}
            >
              {/* CARD 03: QUICK ACTIONS */}
              <div className="settings-card">
                <div className="settings-card-header">
                  <div className="settings-card-title">
                    <Sliders size={15} color="var(--accent-color)" />
                    <span>QUICK ACTIONS</span>
                  </div>
                  <div className="settings-card-badge">03</div>
                </div>

                <div>
                  {/* Clear All Archives */}
                  <div className="settings-row">
                    <div className="settings-row-text">
                      <div className="settings-row-title">PURGE SAVED ARCHIVES</div>
                      <div className="settings-row-desc">
                        Remove all imported playlists and cached audio data from local storage.
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleClearArchives}
                      className="settings-action-btn is-danger"
                    >
                      PURGE VAULT
                    </button>
                  </div>

                  {/* Reset Settings */}
                  <div className="settings-row">
                    <div className="settings-row-text">
                      <div className="settings-row-title">RESET CONFIGURATION</div>
                      <div className="settings-row-desc">
                        Restore all audio preferences, theme, and player modes to factory defaults.
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleResetSettings}
                      className="settings-action-btn"
                    >
                      RESET DEFAULT
                    </button>
                  </div>

                  {/* Export Settings */}
                  <div className="settings-row">
                    <div className="settings-row-text">
                      <div className="settings-row-title">EXPORT CONFIGURATION</div>
                      <div className="settings-row-desc">
                        Save a complete JSON snapshot of your preferences and playlist repository.
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleExportSettings}
                      className="settings-action-btn"
                    >
                      EXPORT JSON
                    </button>
                  </div>

                  {/* Import Settings */}
                  <div className="settings-row">
                    <div className="settings-row-text">
                      <div className="settings-row-title">IMPORT CONFIGURATION</div>
                      <div className="settings-row-desc">
                        Load and restore settings or playlists from a previously exported JSON backup.
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="settings-action-btn"
                    >
                      IMPORT FILE
                    </button>
                  </div>

                  {/* Clear Current Queue */}
                  <div className="settings-row">
                    <div className="settings-row-text">
                      <div className="settings-row-title">CLEAR PLAYBACK QUEUE</div>
                      <div className="settings-row-desc">
                        Empty all pending tracks from the active playback queue list.
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        clearQueue();
                        showNotification('PLAYBACK QUEUE CLEARED');
                      }}
                      className="settings-action-btn"
                    >
                      CLEAR QUEUE
                    </button>
                  </div>
                </div>
              </div>

              {/* CARD 04: THEME PALETTE */}
              <div className="settings-card">
                <div className="settings-card-header">
                  <div className="settings-card-title">
                    <Sparkles size={15} color="var(--accent-color)" />
                    <span>THEME PALETTE</span>
                  </div>
                  <div className="settings-card-badge">04</div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {THEME_OPTIONS.map((thm) => {
                    const isCurrent = theme === thm.id;
                    return (
                      <div
                        key={thm.id}
                        className={`settings-theme-row ${isCurrent ? 'is-active' : ''}`}
                        onClick={() => {
                          setTheme(thm.id);
                          showNotification(`THEME APPLIED: ${thm.name}`);
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: 0 }}>
                          {/* Color Swatch Dot */}
                          <div
                            className="settings-theme-swatch"
                            style={{
                              background: thm.previewBg,
                              border: `1.5px solid ${thm.previewAccent}`,
                            }}
                          >
                            <div
                              style={{
                                width: '8px',
                                height: '8px',
                                borderRadius: '50%',
                                background: thm.previewAccent,
                              }}
                            />
                          </div>

                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div
                              className="settings-theme-title"
                              style={{
                                color: isCurrent ? 'var(--accent-color)' : 'var(--text-primary)',
                              }}
                            >
                              {thm.name}
                            </div>
                            <div className="settings-theme-desc">
                              {thm.description}
                            </div>
                          </div>
                        </div>

                        {isCurrent && (
                          <div
                            style={{
                              width: '24px',
                              height: '24px',
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
                            <Check size={14} strokeWidth={3} />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* CARD 05: ABOUT & SPECIFICATION (FULL-WIDTH BOTTOM BANNER) */}
            <div className="settings-card" style={{ padding: '26px 30px' }}>
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '24px',
                }}
              >
                {/* Brand & Version Info */}
                <div style={{ minWidth: '280px', flex: 1 }}>
                  <div
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '28px',
                      letterSpacing: '0.04em',
                      color: 'var(--text-primary)',
                      lineHeight: 1,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <span>SHONO.FM</span>
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '11px',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        background: 'rgba(212, 175, 55, 0.15)',
                        border: '1px solid var(--accent-color)',
                        color: 'var(--accent-color)',
                        fontWeight: 700,
                      }}
                    >
                      v{CURRENT_APP_VERSION}
                    </span>
                  </div>

                  <div
                    style={{
                      fontFamily: 'var(--font-sans)',
                      fontSize: '13px',
                      color: 'var(--text-secondary)',
                      lineHeight: 1.5,
                      maxWidth: '520px',
                      marginTop: '8px',
                    }}
                  >
                    High-fidelity personal music vault engineered with Web Audio synthesizers, analog vinyl physical modeling, and brutalist architecture.
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsChangelogOpen(true)}
                    className="settings-action-btn"
                    style={{
                      marginTop: '14px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      color: 'var(--accent-color)',
                      borderColor: 'var(--accent-color)',
                    }}
                  >
                    <Sparkles size={13} />
                    <span>WHAT'S NEW IN UPDATE 01</span>
                  </button>
                </div>

                {/* Useful Links */}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                    fontFamily: 'var(--font-sans)',
                    fontSize: '13px',
                  }}
                >
                  <a
                    href="https://github.com"
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      color: 'var(--text-secondary)',
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      transition: 'color 0.15s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent-color)')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
                  >
                    <span>GitHub Open Source Repository</span>
                    <ExternalLink size={12} />
                  </a>
                  <a
                    href="#documentation"
                    onClick={(e) => {
                      e.preventDefault();
                      showNotification('DOCUMENTATION: VAULT AUDIO ENGINE v1.1');
                    }}
                    style={{
                      color: 'var(--text-secondary)',
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      transition: 'color 0.15s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent-color)')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
                  >
                    <span>System Manual & Keyboard Shortcuts</span>
                    <ExternalLink size={12} />
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
                      fontFamily: 'var(--font-display)',
                      fontSize: '18px',
                      letterSpacing: '0.06em',
                      color: 'var(--text-primary)',
                      marginBottom: '4px',
                    }}
                  >
                    “SAME SONGS. DIFFERENT WORLDS.”
                  </div>
                  <div
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '11px',
                      color: 'var(--text-muted)',
                      textTransform: 'uppercase',
                    }}
                  >
                    SHONO.FM AUDIO ARCHIVE // 2026
                  </div>
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
            <div className="settings-card">
              <div className="settings-card-header">
                <div className="settings-card-title">
                  <Disc size={15} color="var(--accent-color)" />
                  <span>TURNTABLE & VINYL ENGINE</span>
                </div>
                <div className="settings-card-badge">PHYSICAL MODELING</div>
              </div>

              {/* Speed Selector */}
              <div className="settings-row">
                <div className="settings-row-text">
                  <div className="settings-row-title">TURNTABLE ROTATION SPEED</div>
                  <div className="settings-row-desc">
                    Governs physical platter angular velocity and analog needle scratch simulation.
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  {([33, 45] as const).map((spd) => (
                    <button
                      key={spd}
                      type="button"
                      onClick={() => {
                        setTurntableSpeed(spd as TurntableSpeed);
                        showNotification(`PLATTER SPEED: ${spd} RPM`);
                      }}
                      className="settings-action-btn"
                      style={{
                        background: turntableSpeed === spd ? 'var(--accent-color)' : 'transparent',
                        color: turntableSpeed === spd ? 'var(--bg-primary)' : 'var(--text-primary)',
                        borderColor: turntableSpeed === spd ? 'var(--accent-color)' : 'var(--border-bright)',
                      }}
                    >
                      {spd} RPM
                    </button>
                  ))}
                </div>
              </div>

              {/* CRT Scanline Phosphor Overlay */}
              <div className="settings-row">
                <div className="settings-row-text">
                  <div className="settings-row-title">CRT MONITOR PHOSPHOR SCANLINES</div>
                  <div className="settings-row-desc">
                    Overlays hardware-calibrated cathode ray tube phosphor raster scanlines over UI.
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleToggleCrt}
                  className={`settings-toggle ${crtEffect ? 'is-on' : ''}`}
                  aria-label="Toggle CRT Scanlines"
                >
                  <div className="settings-toggle-knob" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: APPEARANCE (COMPREHENSIVE THEME GALLERY)           */}
        {/* ========================================================= */}
        {activeTab === 'APPEARANCE' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="settings-card">
              <div className="settings-card-header">
                <div className="settings-card-title">
                  <Sparkles size={15} color="var(--accent-color)" />
                  <span>ARCHITECTURAL THEME GALLERY</span>
                </div>
                <div className="settings-card-badge">{THEME_OPTIONS.length} PALETTES</div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '18px' }}>
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
                        borderRadius: '12px',
                        padding: '20px',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        minHeight: '150px',
                        boxShadow: isCurrent ? '0 0 20px var(--accent-subtle)' : 'none',
                        transition: 'all 0.16s ease',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: thm.previewAccent, fontWeight: 700 }}>
                          PALETTE {thm.index}
                        </span>
                        {isCurrent && (
                          <div
                            style={{
                              width: '22px',
                              height: '22px',
                              borderRadius: '50%',
                              background: thm.previewAccent,
                              color: thm.previewBg,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <Check size={13} strokeWidth={3} />
                          </div>
                        )}
                      </div>

                      <div style={{ marginTop: '16px' }}>
                        <div
                          style={{
                            fontFamily: 'var(--font-sans)',
                            fontSize: '16px',
                            fontWeight: 700,
                            color: thm.previewText,
                            marginBottom: '6px',
                          }}
                        >
                          {thm.name}
                        </div>
                        <div style={{ fontFamily: 'var(--font-sans)', fontSize: '12.5px', color: thm.previewText, opacity: 0.8, lineHeight: 1.45 }}>
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
            <div className="settings-card">
              <div className="settings-card-header">
                <div className="settings-card-title">
                  <Database size={15} color="var(--accent-color)" />
                  <span>STREAM PIPELINE & VAULT STORAGE</span>
                </div>
                <div className="settings-card-badge">STATUS // ACTIVE</div>
              </div>

              {/* Status Row */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  padding: '16px 20px',
                }}
              >
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--status-active)', boxShadow: '0 0 10px var(--status-active)' }} />
                <div>
                  <div style={{ fontFamily: 'var(--font-sans)', fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>
                    YOUTUBE AUDIO PIPELINE: ACTIVE & ENCRYPTED
                  </div>
                  <div style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', color: 'var(--text-secondary)', marginTop: '3px' }}>
                    Real-time metadata extraction with Web Audio synthesis fallback for regional or copyright restrictions.
                  </div>
                </div>
              </div>

              {/* Storage Stats */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: '14px',
                  marginTop: '10px',
                }}
              >
                <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '16px' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)' }}>SAVED VAULTS</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '28px', color: 'var(--accent-color)', marginTop: '4px' }}>
                    {archives.length}
                  </div>
                </div>
                <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '16px' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)' }}>STORAGE DRIVER</div>
                  <div style={{ fontFamily: 'var(--font-sans)', fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '6px' }}>
                    LOCAL STORAGE
                  </div>
                </div>
                <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '16px' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)' }}>STREAM ENGINE</div>
                  <div style={{ fontFamily: 'var(--font-sans)', fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '6px' }}>
                    IFRAME + WEB AUDIO
                  </div>
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
            <div className="settings-card">
              <div className="settings-card-header">
                <div className="settings-card-title">
                  <Sliders size={15} color="var(--accent-color)" />
                  <span>DSP EQUALIZATION & SPECTRAL ANALYSIS</span>
                </div>
                <div className="settings-card-badge">24-BIT / 48 KHZ</div>
              </div>

              <div style={{ fontFamily: 'var(--font-sans)', fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Hardware-accelerated Web Audio API pipeline with 256-band Fast Fourier Transform (FFT) real-time spectral matrix, stereo VU peak metering, and parametric EQ.
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '10px' }}>
                <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '16px' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)' }}>FFT RESOLUTION</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '15px', fontWeight: 700, color: 'var(--accent-color)', marginTop: '4px' }}>
                    256 BINS (32Hz — 16kHz)
                  </div>
                </div>
                <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '16px' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)' }}>AUDIO SAMPLE RATE</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '15px', fontWeight: 700, color: 'var(--status-active)', marginTop: '4px' }}>
                    48,000 HZ • STUDIO MASTER
                  </div>
                </div>
              </div>

              {/* Master Studio Equalizer Module */}
              <div style={{ marginTop: '16px', maxWidth: '480px' }}>
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '11px',
                    letterSpacing: '0.1em',
                    color: 'var(--text-muted)',
                    marginBottom: '10px',
                    textTransform: 'uppercase',
                  }}
                >
                  LIVE FREQUENCY MATRIX
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
            <div className="settings-card">
              <div className="settings-card-header">
                <div className="settings-card-title">
                  <Tv size={15} color="var(--accent-color)" />
                  <span>ADVANCED SYSTEM DIAGNOSTICS</span>
                </div>
                <div className="settings-card-badge">MAINTENANCE</div>
              </div>

              <div>
                <div className="settings-row">
                  <div className="settings-row-text">
                    <div className="settings-row-title">PURGE LOCAL STORAGE CACHE</div>
                    <div className="settings-row-desc">
                      Clears all cached tokens, playback positions, and preferences, resetting application state.
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      localStorage.clear();
                      window.location.reload();
                    }}
                    className="settings-action-btn is-danger"
                  >
                    PURGE ALL CACHE
                  </button>
                </div>

                <div className="settings-row">
                  <div className="settings-row-text">
                    <div className="settings-row-title">DOWNLOAD COMPLETE DATABASE</div>
                    <div className="settings-row-desc">
                      Exports all playlists, history, tracks, and metadata into a raw JSON archive.
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleExportSettings}
                    className="settings-action-btn"
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
