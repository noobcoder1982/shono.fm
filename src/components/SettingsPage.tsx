import React, { useState, useEffect, useRef } from 'react';
import { usePlayer } from '../context/PlayerContext';
import {
  storage,
  CURRENT_APP_VERSION,
  type BrutalistTheme,
  type DynamicColorSource,
  type LyricsFontSize,
  type CustomCursorStyle,
} from '../services/storage';
import { dynamicColorService } from '../services/dynamicColorService';
import {
  loadEqualizerState,
  saveEqualizerState,
  EQ_PRESETS,
  type EqualizerState,
} from '../services/equalizerService';
import { updateService, type UpdateState } from '../services/updateService';
import { discordRpcService } from '../services/discordRpcService';
import { startTutorial } from './TutorialOverlay';
import {
  Palette,
  Disc,
  AlignLeft,
  Sliders,
  Database,
  Info,
  Check,
  RefreshCw,
  Download,
  Upload,
  ExternalLink,
  Sparkles,
  RotateCcw,
  Radio,
  MousePointer,
} from 'lucide-react';

export type SettingsSection = 'APPEARANCE' | 'PLAYER' | 'LYRICS' | 'PLAYBACK' | 'CURSOR' | 'DISCORD' | 'STORAGE' | 'ABOUT' | 'BETA';

interface ThemeOption {
  id: BrutalistTheme;
  name: string;
  subtitle: string;
  previewBg: string;
  previewAccent: string;
}

const THEME_OPTIONS: ThemeOption[] = [
  {
    id: 'noir',
    name: 'Noir',
    subtitle: 'Dark Amber Gold',
    previewBg: '#090909',
    previewAccent: '#d4af37',
  },
  {
    id: 'concrete',
    name: 'Concrete',
    subtitle: 'Basalt Slate & Cyan',
    previewBg: '#101114',
    previewAccent: '#0ea5e9',
  },
  {
    id: 'braun',
    name: 'Braun',
    subtitle: 'Anthracite & Safety Orange',
    previewBg: '#121215',
    previewAccent: '#ff5722',
  },
  {
    id: 'tapedeck',
    name: 'Tapedeck',
    subtitle: 'Roasted Espresso & Ruby',
    previewBg: '#0f0d0b',
    previewAccent: '#e11d48',
  },
  {
    id: 'phosphor',
    name: 'Phosphor',
    subtitle: 'Cathode Obsidian & Emerald',
    previewBg: '#070907',
    previewAccent: '#22c55e',
  },
  {
    id: 'stealth',
    name: 'Stealth',
    subtitle: 'Carbon Void & Laser Violet',
    previewBg: '#040405',
    previewAccent: '#818cf8',
  },
  {
    id: 'swiss',
    name: 'Swiss',
    subtitle: 'Clean High-Contrast Edition',
    previewBg: '#18181c',
    previewAccent: '#d90429',
  },
  {
    id: 'dark',
    name: 'Dark',
    subtitle: 'Pitch Black & Clean Silver',
    previewBg: '#0a0a0a',
    previewAccent: '#f5f5f5',
  },
  {
    id: 'dark_plus',
    name: 'Dark+',
    subtitle: 'OLED Midnight & Cyber Glow',
    previewBg: '#020408',
    previewAccent: '#38bdf8',
  },
  {
    id: 'blue',
    name: 'Blue',
    subtitle: 'Deep Cobalt & Marine Azure',
    previewBg: '#060e1a',
    previewAccent: '#3b82f6',
  },
  {
    id: 'beige',
    name: 'Beige',
    subtitle: 'Vintage Hi-Fi Cream & Walnut',
    previewBg: '#151310',
    previewAccent: '#d4a373',
  },
  {
    id: 'green',
    name: 'Green',
    subtitle: 'Forest Obsidian & Emerald Sage',
    previewBg: '#050d08',
    previewAccent: '#10b981',
  },
];

export const SettingsPage: React.FC = () => {
  const {
    theme,
    setTheme,
    isVinylCrackle,
    toggleVinylCrackle,
    turntableSpeed,
    setTurntableSpeed,
    clearQueue,
    setActiveTab: setGlobalActiveTab,
    currentTrack,
    playbackStatus,
    currentTime,
    duration,
    activeArchive,
  } = usePlayer();

  const [activeSection, setActiveSection] = useState<SettingsSection>('APPEARANCE');

  // Dynamic colors settings
  const [dynamicColorsEnabled, setDynamicColorsEnabled] = useState<boolean>(
    () => storage.getSettings().dynamicColorsEnabled ?? true
  );
  const [colorSource, setColorSource] = useState<DynamicColorSource>(
    () => storage.getSettings().colorSource ?? 'album'
  );
  const [dynamicIntensity, setDynamicIntensity] = useState<number>(
    () => storage.getSettings().dynamicColorIntensity ?? 0.65
  );

  // Player & lyrics settings
  const [reducedMotion, setReducedMotion] = useState<boolean>(
    () => storage.getSettings().reducedMotion ?? false
  );
  const [startupView, setStartupView] = useState<'ARCHIVE' | 'MI6'>(
    () => storage.getPlayerMode()
  );
  const [lyricsEnabled, setLyricsEnabled] = useState<boolean>(
    () => storage.getSettings().lyricsEnabled ?? true
  );
  const [lyricsFontSize, setLyricsFontSize] = useState<LyricsFontSize>(
    () => storage.getSettings().lyricsFontSize ?? 'medium'
  );
  const [autoScrollLyrics, setAutoScrollLyrics] = useState<boolean>(
    () => storage.getSettings().autoScrollLyrics ?? true
  );

  // Playback settings
  const [autoPlay, setAutoPlay] = useState<boolean>(
    () => storage.getSettings().autoPlayNext ?? true
  );
  const [eqState, setEqState] = useState<EqualizerState>(() => loadEqualizerState());
  const [synthFallback, setSynthFallback] = useState<boolean>(
    () => storage.getSettings().synthFallbackEnabled ?? false
  );

  // Discord Rich Presence state
  const [discordRpcEnabled, setDiscordRpcEnabled] = useState<boolean>(
    () => storage.getSettings().discordRpcEnabled ?? true
  );
  const [discordClientId, setDiscordClientId] = useState<string>(
    () => storage.getSettings().discordClientId || '1348057284918284348'
  );
  const [discordStatus, setDiscordStatus] = useState<{ isConnected: boolean; isReady: boolean } | null>(null);
  const [isCheckingDiscord, setIsCheckingDiscord] = useState(false);

  // v1.2 Desktop, Crossfade & Beta Features states
  const [minimizeToTray, setMinimizeToTray] = useState<boolean>(
    () => storage.getSettings().minimizeToTrayOnClose ?? true
  );
  const [crossfadeDuration, setCrossfadeDuration] = useState<number>(
    () => storage.getSettings().crossfadeDuration ?? 3
  );
  const [betaInfiniteArchive, setBetaInfiniteArchive] = useState<boolean>(
    () => storage.getSettings().betaInfiniteArchive ?? true
  );
  const [betaWordKaraoke, setBetaWordKaraoke] = useState<boolean>(
    () => storage.getSettings().betaWordKaraoke ?? true
  );
  const [showBpmKeyBadges, setShowBpmKeyBadges] = useState<boolean>(
    () => storage.getSettings().showBpmKeyBadges ?? true
  );

  const handleToggleMinimizeToTray = () => {
    const next = !minimizeToTray;
    setMinimizeToTray(next);
    storage.saveSettings({ minimizeToTrayOnClose: next });
    if (typeof window !== 'undefined' && (window as any).electronAPI?.setMinimizeToTray) {
      (window as any).electronAPI.setMinimizeToTray(next);
    }
    showNotification(next ? 'Minimize to Tray on close enabled' : 'Minimize to Tray on close disabled');
  };

  const handleCrossfadeChange = (val: number) => {
    setCrossfadeDuration(val);
    storage.saveSettings({ crossfadeDuration: val });
    showNotification(`DJ Crossfade set to ${val === 0 ? 'Off (Gapless)' : `${val}s`}`);
  };

  const handleToggleInfiniteArchive = () => {
    const next = !betaInfiniteArchive;
    setBetaInfiniteArchive(next);
    storage.saveSettings({ betaInfiniteArchive: next });
    showNotification(next ? 'Infinite Archive (Radio Mode) enabled' : 'Infinite Archive disabled');
  };

  const handleToggleWordKaraoke = () => {
    const next = !betaWordKaraoke;
    setBetaWordKaraoke(next);
    storage.saveSettings({ betaWordKaraoke: next });
    showNotification(next ? 'Word-by-word Karaoke sweep enabled' : 'Word-by-word Karaoke disabled');
  };

  const handleToggleBpmKeyBadges = () => {
    const next = !showBpmKeyBadges;
    setShowBpmKeyBadges(next);
    storage.saveSettings({ showBpmKeyBadges: next });
    showNotification(next ? 'BPM & Key badges enabled' : 'BPM & Key badges hidden');
  };

  // Rounded UI and Custom Cursor states
  const [roundedCorners, setRoundedCorners] = useState<boolean>(
    () => storage.getSettings().roundedCorners ?? false
  );
  const [customCursor, setCustomCursor] = useState<CustomCursorStyle>(
    () => storage.getSettings().customCursor || 'none'
  );

  const handleToggleRoundedCorners = () => {
    const next = !roundedCorners;
    setRoundedCorners(next);
    storage.saveSettings({ roundedCorners: next });
    window.dispatchEvent(new CustomEvent('shono:settings-updated'));
    showNotification(next ? 'Rounded Corner UI enabled' : 'Sharp industrial UI restored');
  };

  const handleSelectCustomCursor = (val: CustomCursorStyle) => {
    setCustomCursor(val);
    storage.saveSettings({ customCursor: val });
    window.dispatchEvent(new CustomEvent('shono:settings-updated'));
    showNotification(`Hardware cursor set to ${val === 'none' ? 'Default OS' : val.toUpperCase()}`);
  };

  // Storage and update state
  const [updateState, setUpdateState] = useState<UpdateState>(() => updateService.getState());
  const [notice, setNotice] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return updateService.subscribe((state) => {
      setUpdateState(state);
    });
  }, []);

  const showNotification = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 3000);
  };

  // Handlers for dynamic colors
  const handleToggleDynamicColors = () => {
    const next = !dynamicColorsEnabled;
    setDynamicColorsEnabled(next);
    storage.saveSettings({ dynamicColorsEnabled: next });
    dynamicColorService.updateSettings();
    showNotification(next ? 'Dynamic album art colors enabled' : 'Dynamic colors disabled (using fixed theme)');
  };

  const handleChangeColorSource = (source: DynamicColorSource) => {
    setColorSource(source);
    storage.saveSettings({ colorSource: source });
    dynamicColorService.updateSettings();
    showNotification(source === 'album' ? 'Using colors from album artwork' : 'Using fixed theme accent');
  };

  const handleIntensityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setDynamicIntensity(val);
    storage.saveSettings({ dynamicColorIntensity: val });
    dynamicColorService.updateSettings();
  };

  const handleToggleReducedMotion = () => {
    const next = !reducedMotion;
    setReducedMotion(next);
    storage.saveSettings({ reducedMotion: next });
    showNotification(next ? 'Reduced motion enabled' : 'Reduced motion disabled');
  };

  // Handlers for player & lyrics
  const handleToggleLyrics = () => {
    const next = !lyricsEnabled;
    setLyricsEnabled(next);
    storage.saveSettings({ lyricsEnabled: next });
    showNotification(next ? 'Real-time lyrics enabled' : 'Real-time lyrics disabled');
  };

  const handleChangeLyricsSize = (size: LyricsFontSize) => {
    setLyricsFontSize(size);
    storage.saveSettings({ lyricsFontSize: size });
    showNotification(`Lyrics size set to ${size}`);
  };

  const handleToggleAutoScroll = () => {
    const next = !autoScrollLyrics;
    setAutoScrollLyrics(next);
    storage.saveSettings({ autoScrollLyrics: next });
    showNotification(next ? 'Lyrics auto-scroll enabled' : 'Lyrics auto-scroll disabled');
  };

  // Handlers for playback
  const handleToggleAutoPlay = () => {
    const next = !autoPlay;
    setAutoPlay(next);
    storage.saveSettings({ autoPlayNext: next });
    showNotification(next ? 'Autoplay enabled' : 'Autoplay disabled');
  };

  const handleToggleEqualizer = () => {
    const next = !eqState.enabled;
    const updated = { ...eqState, enabled: next };
    setEqState(updated);
    saveEqualizerState(updated);
    showNotification(next ? 'Equalizer enabled' : 'Equalizer bypassed');
  };

  const handleSelectPreset = (presetKey: string) => {
    const preset = EQ_PRESETS.find((p) => p.id === presetKey);
    if (!preset) return;
    const updated: EqualizerState = {
      ...eqState,
      enabled: true,
      selectedPreset: presetKey,
      bands: [...preset.bands],
    };
    setEqState(updated);
    saveEqualizerState(updated);
    showNotification(`Preset applied: ${preset.name}`);
  };

  const handleToggleSynthFallback = () => {
    const next = !synthFallback;
    setSynthFallback(next);
    storage.saveSettings({ synthFallbackEnabled: next });
    showNotification(next ? 'Audio synthesizer fallback enabled' : 'Synthesizer fallback disabled');
  };

  // Discord Rich Presence Handlers
  useEffect(() => {
    if (activeSection === 'DISCORD') {
      discordRpcService.getStatus().then((st) => {
        if (st) setDiscordStatus({ isConnected: st.isConnected, isReady: st.isReady });
      });
    }
  }, [activeSection]);

  const handleToggleDiscordRpc = () => {
    const next = !discordRpcEnabled;
    setDiscordRpcEnabled(next);
    storage.saveSettings({ discordRpcEnabled: next });
    discordRpcService.syncConfig();
    if (!next) {
      discordRpcService.clearActivity();
    } else if (currentTrack) {
      discordRpcService.updateActivity(currentTrack, playbackStatus, currentTime, duration, activeArchive?.title);
    }
    showNotification(next ? 'Discord Rich Presence enabled' : 'Discord Rich Presence disabled');
  };

  const handleDiscordClientIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.trim();
    setDiscordClientId(val);
    storage.saveSettings({ discordClientId: val });
    discordRpcService.syncConfig();
  };

  const handleResetDiscordClientId = () => {
    const defaultId = '1348057284918284348';
    setDiscordClientId(defaultId);
    storage.saveSettings({ discordClientId: defaultId });
    discordRpcService.syncConfig();
    showNotification('Discord Application ID reset to default');
  };

  const handleTestDiscordConnection = async () => {
    setIsCheckingDiscord(true);
    const st = await discordRpcService.getStatus();
    setIsCheckingDiscord(false);
    if (st) {
      setDiscordStatus({ isConnected: st.isConnected, isReady: st.isReady });
      if (st.isConnected) {
        showNotification('Connected to Discord desktop client!');
      } else {
        showNotification('Discord client not detected. Ensure Discord desktop is running.');
      }
    } else {
      showNotification('Discord RPC is only supported in the desktop app.');
    }
  };

  // Storage operations
  const handleClearCache = () => {
    try {
      localStorage.removeItem('bma_yt_alternative_cache_v1');
      showNotification('Temporary stream cache cleared');
    } catch {
      showNotification('Cache cleared');
    }
  };

  const handleExportBackup = () => {
    try {
      const data = {
        app: 'shono.fm',
        version: CURRENT_APP_VERSION,
        exportedAt: new Date().toISOString(),
        settings: storage.getSettings(),
        archives: storage.getArchives() || [],
        likedTracks: storage.getLikedTracks() || [],
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `shono-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showNotification('Library and settings backup exported');
    } catch {
      showNotification('Error exporting backup file');
    }
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
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
        if (Array.isArray(parsed.archives)) {
          storage.saveArchives(parsed.archives);
        }
        showNotification('Backup imported successfully');
        setTimeout(() => window.location.reload(), 800);
      } catch {
        alert('Invalid backup JSON file.');
      }
    };
    reader.readAsText(file);
  };

  const handleResetData = () => {
    if (window.confirm('Are you sure you want to reset all data? This will clear custom playlists and restore default settings.')) {
      localStorage.clear();
      storage.saveSettings({
        theme: 'noir',
        autoPlayNext: true,
        dynamicColorsEnabled: true,
        colorSource: 'album',
        dynamicColorIntensity: 0.65,
      });
      clearQueue();
      showNotification('Application reset to factory defaults');
      setTimeout(() => window.location.reload(), 800);
    }
  };

  const sections: { id: SettingsSection; label: string; icon: React.ReactNode }[] = [
    { id: 'APPEARANCE', label: 'Appearance', icon: <Palette size={16} /> },
    { id: 'PLAYER', label: 'Player', icon: <Disc size={16} /> },
    { id: 'LYRICS', label: 'Lyrics', icon: <AlignLeft size={16} /> },
    { id: 'PLAYBACK', label: 'Playback', icon: <Sliders size={16} /> },
    { id: 'CURSOR', label: 'Cursor', icon: <MousePointer size={16} /> },
    { id: 'DISCORD', label: 'Discord RPC', icon: <Radio size={16} /> },
    { id: 'STORAGE', label: 'Storage', icon: <Database size={16} /> },
    { id: 'ABOUT', label: 'About', icon: <Info size={16} /> },
    { id: 'BETA', label: 'Beta Testing', icon: <Sparkles size={16} /> },
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
      }}
    >
      {/* Toast Notice */}
      {notice && (
        <div
          style={{
            position: 'absolute',
            top: '20px',
            right: '28px',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--accent-color)',
            borderRadius: '8px',
            padding: '10px 18px',
            fontSize: '13px',
            fontWeight: 500,
            color: 'var(--accent-color)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
            zIndex: 99,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            animation: 'fadeIn 0.2s ease',
          }}
        >
          <Check size={14} />
          <span>{notice}</span>
        </div>
      )}

      {/* Top Header */}
      <header
        style={{
          height: '64px',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 28px',
          flexShrink: 0,
          background: 'var(--bg-secondary)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <h1
            style={{
              fontSize: '17px',
              fontWeight: 700,
              letterSpacing: '0.02em',
              margin: 0,
              color: 'var(--text-primary)',
              textTransform: 'none',
              fontFamily: 'var(--font-sans)',
            }}
          >
            Settings
          </h1>
          <span
            style={{
              fontSize: '12px',
              padding: '2px 8px',
              borderRadius: '9999px',
              background: 'var(--accent-subtle)',
              color: 'var(--accent-color)',
              fontWeight: 600,
            }}
          >
            v{CURRENT_APP_VERSION}
          </span>
        </div>

        <button
          type="button"
          onClick={() => setGlobalActiveTab('ARCHIVE')}
          style={{
            background: 'transparent',
            border: '1px solid var(--border-color)',
            color: 'var(--text-secondary)',
            borderRadius: '6px',
            padding: '6px 14px',
            fontSize: '12px',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--text-primary)';
            e.currentTarget.style.color = 'var(--text-primary)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--border-color)';
            e.currentTarget.style.color = 'var(--text-secondary)';
          }}
        >
          Done
        </button>
      </header>

      {/* Section Navigation Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '4px',
          padding: '12px 28px',
          borderBottom: '1px solid var(--border-color)',
          background: 'var(--bg-primary)',
          overflowX: 'auto',
          flexShrink: 0,
        }}
      >
        {sections.map((sec) => {
          const isActive = activeSection === sec.id;
          return (
            <button
              key={sec.id}
              type="button"
              onClick={() => setActiveSection(sec.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                background: isActive ? 'var(--bg-secondary)' : 'transparent',
                color: isActive ? 'var(--text-primary)' : 'var(--text-muted)',
                fontWeight: isActive ? 600 : 400,
                fontSize: '13px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                position: 'relative',
              }}
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.color = 'var(--text-primary)';
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.color = 'var(--text-muted)';
              }}
            >
              <span style={{ color: isActive ? 'var(--accent-color)' : 'inherit' }}>{sec.icon}</span>
              <span>{sec.label}</span>
              {isActive && (
                <div
                  style={{
                    position: 'absolute',
                    bottom: '-12px',
                    left: '16px',
                    right: '16px',
                    height: '2px',
                    background: 'var(--accent-color)',
                    borderRadius: '2px',
                  }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Main Settings Content Area */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '28px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <div style={{ width: '100%', maxWidth: '780px', display: 'flex', flexDirection: 'column', gap: '22px' }}>
          
          {/* =========================================================================
              SECTION: APPEARANCE
             ========================================================================= */}
          {activeSection === 'APPEARANCE' && (
            <>
              {/* 1. Theme Palette */}
              <section className="settings-card">
                <div className="settings-card-header">
                  <div>
                    <h2 style={{ fontSize: '15px', fontWeight: 600, margin: '0 0 4px 0', textTransform: 'none', fontFamily: 'var(--font-sans)' }}>
                      Theme
                    </h2>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
                      Choose a dark color palette for the player interface.
                    </p>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '10px' }}>
                  {THEME_OPTIONS.map((item) => {
                    const isSelected = theme === item.id;
                    return (
                      <div
                        key={item.id}
                        onClick={() => setTheme(item.id)}
                        style={{
                          background: isSelected ? 'var(--bg-hover)' : 'var(--bg-primary)',
                          border: `1px solid ${isSelected ? 'var(--accent-color)' : 'var(--border-color)'}`,
                          borderRadius: '8px',
                          padding: '12px 14px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div
                            style={{
                              width: '18px',
                              height: '18px',
                              borderRadius: '50%',
                              background: item.previewAccent,
                              border: `2px solid ${item.previewBg}`,
                              boxShadow: '0 0 8px rgba(0,0,0,0.4)',
                            }}
                          />
                          <div>
                            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                              {item.name}
                            </div>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                              {item.subtitle}
                            </div>
                          </div>
                        </div>
                        {isSelected && <Check size={16} style={{ color: 'var(--accent-color)' }} />}
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* 2. Dynamic Album Art Colors */}
              <section className="settings-card">
                <div className="settings-card-header">
                  <div>
                    <h2 style={{ fontSize: '15px', fontWeight: 600, margin: '0 0 4px 0', textTransform: 'none', fontFamily: 'var(--font-sans)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span>Dynamic colors</span>
                      <span style={{ fontSize: '10px', background: 'var(--accent-subtle)', color: 'var(--accent-color)', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>NEW</span>
                    </h2>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
                      Use colors from the current song artwork to subtly tint navigation, buttons, sliders, and ambient glow.
                    </p>
                  </div>
                </div>

                <div className="settings-row">
                  <div className="settings-row-text">
                    <div className="settings-row-title" style={{ textTransform: 'none', fontSize: '14px' }}>
                      Enable dynamic colors
                    </div>
                    <div className="settings-row-desc">
                      Keeps the application dark while smoothly adapting accent highlights to match each track.
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleToggleDynamicColors}
                    className={`settings-toggle ${dynamicColorsEnabled ? 'is-on' : ''}`}
                    aria-label="Toggle dynamic colors"
                  >
                    <div className="settings-toggle-knob" />
                  </button>
                </div>

                {dynamicColorsEnabled && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', paddingTop: '10px', borderTop: '1px solid var(--border-subtle)' }}>
                    {/* Color Source Selector */}
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 500, marginBottom: '8px', color: 'var(--text-primary)' }}>
                        Color source
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          type="button"
                          onClick={() => handleChangeColorSource('album')}
                          style={{
                            flex: 1,
                            padding: '10px 14px',
                            borderRadius: '8px',
                            border: `1px solid ${colorSource === 'album' ? 'var(--accent-color)' : 'var(--border-color)'}`,
                            background: colorSource === 'album' ? 'var(--accent-subtle)' : 'var(--bg-primary)',
                            color: colorSource === 'album' ? 'var(--accent-color)' : 'var(--text-secondary)',
                            fontWeight: 500,
                            fontSize: '13px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          <Sparkles size={14} />
                          <span>Album artwork</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleChangeColorSource('fixed')}
                          style={{
                            flex: 1,
                            padding: '10px 14px',
                            borderRadius: '8px',
                            border: `1px solid ${colorSource === 'fixed' ? 'var(--accent-color)' : 'var(--border-color)'}`,
                            background: colorSource === 'fixed' ? 'var(--accent-subtle)' : 'var(--bg-primary)',
                            color: colorSource === 'fixed' ? 'var(--accent-color)' : 'var(--text-secondary)',
                            fontWeight: 500,
                            fontSize: '13px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          <Palette size={14} />
                          <span>Fixed accent</span>
                        </button>
                      </div>
                    </div>

                    {/* Intensity Slider */}
                    {colorSource === 'album' && (
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>
                            Tint intensity
                          </span>
                          <span style={{ fontSize: '12px', color: 'var(--accent-color)', fontWeight: 600 }}>
                            {Math.round(dynamicIntensity * 100)}%
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.04em' }}>
                            SUBTLE
                          </span>
                          <input
                            type="range"
                            min="0.1"
                            max="1.0"
                            step="0.05"
                            value={dynamicIntensity}
                            onChange={handleIntensityChange}
                            style={{
                              flex: 1,
                              accentColor: 'var(--accent-color)',
                              cursor: 'pointer',
                              height: '4px',
                            }}
                          />
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.04em' }}>
                            STRONG
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </section>

              {/* 3. Interface Motion */}
              <section className="settings-card">
                <div className="settings-row">
                  <div className="settings-row-text">
                    <div className="settings-row-title" style={{ textTransform: 'none', fontSize: '14px' }}>
                      Reduced motion
                    </div>
                    <div className="settings-row-desc">
                      Minimizes transitions and decorative animations for lower power usage.
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleToggleReducedMotion}
                    className={`settings-toggle ${reducedMotion ? 'is-on' : ''}`}
                    aria-label="Toggle reduced motion"
                  >
                    <div className="settings-toggle-knob" />
                  </button>
                </div>
              </section>

              {/* 4. Rounded Corner UI */}
              <section className="settings-card">
                <div className="settings-row">
                  <div className="settings-row-text">
                    <div className="settings-row-title" style={{ textTransform: 'none', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span>Rounded corner UI</span>
                      <span style={{ fontSize: '10px', background: 'var(--accent-subtle)', color: 'var(--accent-color)', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>NEW</span>
                    </div>
                    <div className="settings-row-desc">
                      Softens the industrial brutalist edges into modern curved corners for cards, buttons, drawers, and modal panels.
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleToggleRoundedCorners}
                    className={`settings-toggle ${roundedCorners ? 'is-on' : ''}`}
                    aria-label="Toggle rounded corner UI"
                  >
                    <div className="settings-toggle-knob" />
                  </button>
                </div>
              </section>
            </>
          )}

          {/* =========================================================================
              SECTION: PLAYER
             ========================================================================= */}
          {activeSection === 'PLAYER' && (
            <>
              {/* 1. Default View */}
              <section className="settings-card">
                <div className="settings-card-header">
                  <div>
                    <h2 style={{ fontSize: '15px', fontWeight: 600, margin: '0 0 4px 0', textTransform: 'none', fontFamily: 'var(--font-sans)' }}>
                      Default start screen
                    </h2>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
                      Choose which view opens when launching the application.
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setStartupView('ARCHIVE');
                      storage.savePlayerMode('ARCHIVE');
                      showNotification('Default view set to Archive Library');
                    }}
                    style={{
                      flex: 1,
                      padding: '12px 16px',
                      borderRadius: '8px',
                      border: `1px solid ${startupView === 'ARCHIVE' ? 'var(--accent-color)' : 'var(--border-color)'}`,
                      background: startupView === 'ARCHIVE' ? 'var(--accent-subtle)' : 'var(--bg-primary)',
                      color: startupView === 'ARCHIVE' ? 'var(--accent-color)' : 'var(--text-secondary)',
                      fontSize: '13px',
                      fontWeight: 500,
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div style={{ fontWeight: 600, marginBottom: '2px', color: startupView === 'ARCHIVE' ? 'var(--accent-color)' : 'var(--text-primary)' }}>
                      Archive Library
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      Sidebar, track list, and collection vaults
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setStartupView('MI6');
                      storage.savePlayerMode('MI6');
                      showNotification('Default view set to Studio Mode');
                    }}
                    style={{
                      flex: 1,
                      padding: '12px 16px',
                      borderRadius: '8px',
                      border: `1px solid ${startupView === 'MI6' ? 'var(--accent-color)' : 'var(--border-color)'}`,
                      background: startupView === 'MI6' ? 'var(--accent-subtle)' : 'var(--bg-primary)',
                      color: startupView === 'MI6' ? 'var(--accent-color)' : 'var(--text-secondary)',
                      fontSize: '13px',
                      fontWeight: 500,
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div style={{ fontWeight: 600, marginBottom: '2px', color: startupView === 'MI6' ? 'var(--accent-color)' : 'var(--text-primary)' }}>
                      Studio Mode
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      Immersive live waveform and lyrics
                    </div>
                  </button>
                </div>
              </section>

              {/* 2. Analog Vinyl Effects */}
              <section className="settings-card">
                <div className="settings-card-header">
                  <div>
                    <h2 style={{ fontSize: '15px', fontWeight: 600, margin: '0 0 4px 0', textTransform: 'none', fontFamily: 'var(--font-sans)' }}>
                      Turntable effects
                    </h2>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
                      Subtle tactile sound and analog speed emulation.
                    </p>
                  </div>
                </div>

                <div className="settings-row">
                  <div className="settings-row-text">
                    <div className="settings-row-title" style={{ textTransform: 'none', fontSize: '14px' }}>
                      Vinyl crackle sound
                    </div>
                    <div className="settings-row-desc">
                      Adds gentle analog groove texture and warm stylus needle noise during playback.
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      toggleVinylCrackle();
                      showNotification(isVinylCrackle ? 'Vinyl crackle turned off' : 'Vinyl crackle turned on');
                    }}
                    className={`settings-toggle ${isVinylCrackle ? 'is-on' : ''}`}
                    aria-label="Toggle vinyl crackle"
                  >
                    <div className="settings-toggle-knob" />
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>
                    Turntable RPM speed
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {([33, 45, 78] as const).map((speed) => {
                      const isSelected = turntableSpeed === speed;
                      return (
                        <button
                          key={speed}
                          type="button"
                          onClick={() => {
                            setTurntableSpeed(speed);
                            showNotification(`Turntable speed: ${speed} RPM`);
                          }}
                          style={{
                            flex: 1,
                            padding: '8px 12px',
                            borderRadius: '6px',
                            border: `1px solid ${isSelected ? 'var(--accent-color)' : 'var(--border-color)'}`,
                            background: isSelected ? 'var(--accent-subtle)' : 'var(--bg-primary)',
                            color: isSelected ? 'var(--accent-color)' : 'var(--text-secondary)',
                            fontWeight: isSelected ? 600 : 400,
                            fontSize: '13px',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          {speed} RPM {speed === 33 && '(Standard)'}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </section>

              {/* 3. Walkthrough Guide */}
              <section className="settings-card">
                <div className="settings-row">
                  <div className="settings-row-text">
                    <div className="settings-row-title" style={{ textTransform: 'none', fontSize: '14px' }}>
                      Guided tour
                    </div>
                    <div className="settings-row-desc">
                      Replay the interactive 4-step tutorial on search, archives, equalizer, and playback controls.
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setGlobalActiveTab('ARCHIVE');
                      setTimeout(() => startTutorial(), 350);
                    }}
                    style={{
                      background: 'var(--accent-subtle)',
                      border: '1px solid var(--accent-color)',
                      color: 'var(--accent-color)',
                      borderRadius: '6px',
                      padding: '8px 16px',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      whiteSpace: 'nowrap',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <Sparkles size={14} />
                    <span>Replay Tour</span>
                  </button>
                </div>
              </section>

              {/* 4. Windows Desktop & System Tray Controller */}
              <section className="settings-card">
                <div className="settings-row">
                  <div className="settings-row-text">
                    <div className="settings-row-title" style={{ textTransform: 'none', fontSize: '14px' }}>
                      Minimize to system tray on close
                    </div>
                    <div className="settings-row-desc">
                      Keep music playing seamlessly in background when closing window. Access controls from the Windows taskbar system tray.
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleToggleMinimizeToTray}
                    className={`settings-toggle ${minimizeToTray ? 'is-on' : ''}`}
                    aria-label="Toggle minimize to tray"
                  >
                    <div className="settings-toggle-knob" />
                  </button>
                </div>
              </section>
            </>
          )}

          {/* =========================================================================
              SECTION: LYRICS
             ========================================================================= */}
          {activeSection === 'LYRICS' && (
            <>
              {/* 1. Synchronized Lyrics Toggle */}
              <section className="settings-card">
                <div className="settings-row">
                  <div className="settings-row-text">
                    <div className="settings-row-title" style={{ textTransform: 'none', fontSize: '14px' }}>
                      Real-time synchronized lyrics
                    </div>
                    <div className="settings-row-desc">
                      Show karaoke-style scrolling lyrics in the side player and fullscreen view when available.
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleToggleLyrics}
                    className={`settings-toggle ${lyricsEnabled ? 'is-on' : ''}`}
                    aria-label="Toggle lyrics"
                  >
                    <div className="settings-toggle-knob" />
                  </button>
                </div>
              </section>

              {/* 2. Lyrics Text Size */}
              <section className="settings-card">
                <div className="settings-card-header">
                  <div>
                    <h2 style={{ fontSize: '15px', fontWeight: 600, margin: '0 0 4px 0', textTransform: 'none', fontFamily: 'var(--font-sans)' }}>
                      Lyrics text size
                    </h2>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
                      Adjust the size of lyrics lines for optimal readability.
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  {(['small', 'medium', 'large'] as const).map((size) => {
                    const isSelected = lyricsFontSize === size;
                    return (
                      <button
                        key={size}
                        type="button"
                        onClick={() => handleChangeLyricsSize(size)}
                        style={{
                          flex: 1,
                          padding: '10px 14px',
                          borderRadius: '8px',
                          border: `1px solid ${isSelected ? 'var(--accent-color)' : 'var(--border-color)'}`,
                          background: isSelected ? 'var(--accent-subtle)' : 'var(--bg-primary)',
                          color: isSelected ? 'var(--accent-color)' : 'var(--text-secondary)',
                          fontSize: '13px',
                          fontWeight: isSelected ? 600 : 400,
                          cursor: 'pointer',
                          textTransform: 'capitalize',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </section>

              {/* 3. Auto-scroll */}
              <section className="settings-card">
                <div className="settings-row">
                  <div className="settings-row-text">
                    <div className="settings-row-title" style={{ textTransform: 'none', fontSize: '14px' }}>
                      Auto-scroll lyrics
                    </div>
                    <div className="settings-row-desc">
                      Automatically centers the active singing line smoothly on screen during playback.
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleToggleAutoScroll}
                    className={`settings-toggle ${autoScrollLyrics ? 'is-on' : ''}`}
                    aria-label="Toggle lyrics auto-scroll"
                  >
                    <div className="settings-toggle-knob" />
                  </button>
                </div>
              </section>
            </>
          )}

          {/* =========================================================================
              SECTION: PLAYBACK
             ========================================================================= */}
          {activeSection === 'PLAYBACK' && (
            <>
              {/* 1. Autoplay */}
              <section className="settings-card">
                <div className="settings-row">
                  <div className="settings-row-text">
                    <div className="settings-row-title" style={{ textTransform: 'none', fontSize: '14px' }}>
                      Autoplay next track
                    </div>
                    <div className="settings-row-desc">
                      Automatically play related songs or continue to the next track when your queue ends.
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleToggleAutoPlay}
                    className={`settings-toggle ${autoPlay ? 'is-on' : ''}`}
                    aria-label="Toggle autoplay"
                  >
                    <div className="settings-toggle-knob" />
                  </button>
                </div>
              </section>

              {/* DJ Crossfade & Gapless Playback */}
              <section className="settings-card">
                <div className="settings-row">
                  <div className="settings-row-text">
                    <div className="settings-row-title" style={{ textTransform: 'none', fontSize: '14px' }}>
                      DJ Crossfade & Gapless Playback
                    </div>
                    <div className="settings-row-desc">
                      Smooth, configurable crossfade transition between queue tracks so playback never cuts abruptly between songs.
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <input
                      type="range"
                      min={0}
                      max={8}
                      step={1}
                      value={crossfadeDuration}
                      onChange={(e) => handleCrossfadeChange(Number(e.target.value))}
                      style={{
                        width: '120px',
                        accentColor: 'var(--accent-color)',
                        cursor: 'pointer',
                      }}
                    />
                    <span style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', minWidth: '70px', textAlign: 'right', fontWeight: 600 }}>
                      {crossfadeDuration === 0 ? 'Off (0s)' : `${crossfadeDuration}s Fade`}
                    </span>
                  </div>
                </div>
              </section>

              {/* 2. Equalizer */}
              <section className="settings-card">
                <div className="settings-card-header">
                  <div>
                    <h2 style={{ fontSize: '15px', fontWeight: 600, margin: '0 0 4px 0', textTransform: 'none', fontFamily: 'var(--font-sans)' }}>
                      10-Band Equalizer
                    </h2>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
                      Fine-tune sound frequencies or choose an acoustic sound profile.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleToggleEqualizer}
                    className={`settings-toggle ${eqState.enabled ? 'is-on' : ''}`}
                    aria-label="Toggle equalizer"
                  >
                    <div className="settings-toggle-knob" />
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>
                    Sound profile presets
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '8px' }}>
                    {[
                      { key: 'flat', label: 'Flat' },
                      { key: 'bass_boost', label: 'Bass Boost' },
                      { key: 'vocal', label: 'Vocal' },
                      { key: 'rock', label: 'Rock' },
                      { key: 'electronic', label: 'Electronic' },
                      { key: 'acoustic', label: 'Acoustic' },
                    ].map((p) => {
                      const isSelected = eqState.selectedPreset === p.key && eqState.enabled;
                      return (
                        <button
                          key={p.key}
                          type="button"
                          onClick={() => handleSelectPreset(p.key)}
                          style={{
                            padding: '8px 12px',
                            borderRadius: '6px',
                            border: `1px solid ${isSelected ? 'var(--accent-color)' : 'var(--border-color)'}`,
                            background: isSelected ? 'var(--accent-subtle)' : 'var(--bg-primary)',
                            color: isSelected ? 'var(--accent-color)' : 'var(--text-secondary)',
                            fontWeight: isSelected ? 600 : 400,
                            fontSize: '12px',
                            cursor: 'pointer',
                            textAlign: 'center',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          {p.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </section>

              {/* 3. Audio Synthesizer Fallback */}
              <section className="settings-card">
                <div className="settings-row">
                  <div className="settings-row-text">
                    <div className="settings-row-title" style={{ textTransform: 'none', fontSize: '14px' }}>
                      Audio stream fallback
                    </div>
                    <div className="settings-row-desc">
                      Generates synthetic preview audio if an external music stream is temporarily unreachable.
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleToggleSynthFallback}
                    className={`settings-toggle ${synthFallback ? 'is-on' : ''}`}
                    aria-label="Toggle synthesizer fallback"
                  >
                    <div className="settings-toggle-knob" />
                  </button>
                </div>
              </section>
            </>
          )}

          {/* =========================================================================
              SECTION: STORAGE
             ========================================================================= */}
          {activeSection === 'STORAGE' && (
            <>
              {/* 1. Cache */}
              <section className="settings-card">
                <div className="settings-row">
                  <div className="settings-row-text">
                    <div className="settings-row-title" style={{ textTransform: 'none', fontSize: '14px' }}>
                      Temporary cache
                    </div>
                    <div className="settings-row-desc">
                      Clear cached audio streams and temporary artwork to free up space.
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleClearCache}
                    style={{
                      background: 'transparent',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-primary)',
                      borderRadius: '6px',
                      padding: '8px 14px',
                      fontSize: '12px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      whiteSpace: 'nowrap',
                      transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'var(--text-primary)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border-color)';
                    }}
                  >
                    <RotateCcw size={14} />
                    <span>Clear Cache</span>
                  </button>
                </div>
              </section>

              {/* 2. Backup & Restore */}
              <section className="settings-card">
                <div className="settings-card-header">
                  <div>
                    <h2 style={{ fontSize: '15px', fontWeight: 600, margin: '0 0 4px 0', textTransform: 'none', fontFamily: 'var(--font-sans)' }}>
                      Backup & Restore
                    </h2>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
                      Export your custom playlists and favorites to a JSON file, or restore from a previous backup.
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={handleExportBackup}
                    style={{
                      flex: 1,
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)',
                      background: 'var(--bg-primary)',
                      color: 'var(--text-primary)',
                      fontSize: '13px',
                      fontWeight: 500,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'var(--accent-color)';
                      e.currentTarget.style.color = 'var(--accent-color)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border-color)';
                      e.currentTarget.style.color = 'var(--text-primary)';
                    }}
                  >
                    <Download size={15} />
                    <span>Export Backup</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      flex: 1,
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)',
                      background: 'var(--bg-primary)',
                      color: 'var(--text-primary)',
                      fontSize: '13px',
                      fontWeight: 500,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'var(--accent-color)';
                      e.currentTarget.style.color = 'var(--accent-color)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border-color)';
                      e.currentTarget.style.color = 'var(--text-primary)';
                    }}
                  >
                    <Upload size={15} />
                    <span>Import Backup</span>
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json"
                    onChange={handleImportBackup}
                    style={{ display: 'none' }}
                  />
                </div>
              </section>

              {/* 3. Reset All Data */}
              <section className="settings-card" style={{ borderColor: 'rgba(239, 68, 68, 0.25)' }}>
                <div className="settings-row">
                  <div className="settings-row-text">
                    <div className="settings-row-title" style={{ textTransform: 'none', fontSize: '14px', color: '#ef4444' }}>
                      Reset all application data
                    </div>
                    <div className="settings-row-desc">
                      Clears all saved playlists, favorites, and restores all settings to default.
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleResetData}
                    style={{
                      background: 'rgba(239, 68, 68, 0.1)',
                      border: '1px solid rgba(239, 68, 68, 0.4)',
                      color: '#ef4444',
                      borderRadius: '6px',
                      padding: '8px 14px',
                      fontSize: '12px',
                      fontWeight: 500,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#ef4444';
                      e.currentTarget.style.color = '#fff';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                      e.currentTarget.style.color = '#ef4444';
                    }}
                  >
                    Reset All Data
                  </button>
                </div>
              </section>
            </>
          )}

          {/* =========================================================================
              SECTION: CUSTOM HARDWARE CURSOR
             ========================================================================= */}
          {activeSection === 'CURSOR' && (
            <>
              {/* Header Card */}
              <section className="settings-card">
                <div className="settings-card-header">
                  <div>
                    <h2 style={{ fontSize: '15px', fontWeight: 600, margin: '0 0 4px 0', textTransform: 'none', fontFamily: 'var(--font-sans)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span>Hardware Custom Cursor Engine</span>
                      <span style={{ fontSize: '10px', background: 'var(--accent-subtle)', color: 'var(--accent-color)', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>v1.3</span>
                    </h2>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
                      Low-latency custom pointer physics with dynamic tactile feedback and reactive magnetic target hover.
                    </p>
                  </div>
                </div>

                {/* Cursor Style Options Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: '12px' }}>
                  {[
                    {
                      id: 'none',
                      name: 'System Default',
                      desc: 'Standard operating system mouse pointer',
                      preview: (
                        <div style={{ width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <MousePointer size={20} color="var(--text-secondary)" />
                        </div>
                      ),
                    },
                    {
                      id: 'dot',
                      name: 'Neon Cyber Dot',
                      desc: 'Precision laser point with glowing ambient particle halo',
                      preview: (
                        <div style={{ width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                          <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'radial-gradient(circle, var(--accent-subtle) 0%, transparent 70%)' }} />
                          <div style={{ position: 'absolute', width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent-color)', boxShadow: '0 0 8px var(--accent-color)' }} />
                        </div>
                      ),
                    },
                    {
                      id: 'ring',
                      name: 'Precision Ring',
                      desc: 'High-tech reticle that smoothly expands around buttons',
                      preview: (
                        <div style={{ width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                          <div style={{ width: '24px', height: '24px', borderRadius: '50%', border: '1.5px solid var(--accent-color)', background: 'var(--accent-subtle)' }} />
                          <div style={{ position: 'absolute', width: '5px', height: '5px', borderRadius: '50%', background: 'var(--accent-color)' }} />
                        </div>
                      ),
                    },
                    {
                      id: 'crosshair',
                      name: 'Tactical Reticle',
                      desc: 'Audio studio crosshair with alignment tick marks',
                      preview: (
                        <div style={{ width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                          <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.3)' }} />
                          <div style={{ position: 'absolute', top: 2, width: '2px', height: '6px', background: 'var(--accent-color)' }} />
                          <div style={{ position: 'absolute', bottom: 2, width: '2px', height: '6px', background: 'var(--accent-color)' }} />
                          <div style={{ position: 'absolute', left: 2, width: '6px', height: '2px', background: 'var(--accent-color)' }} />
                          <div style={{ position: 'absolute', right: 2, width: '6px', height: '2px', background: 'var(--accent-color)' }} />
                          <div style={{ position: 'absolute', width: '4px', height: '4px', borderRadius: '50%', background: 'var(--accent-color)' }} />
                        </div>
                      ),
                    },
                  ].map((item) => {
                    const isSelected = customCursor === item.id;
                    return (
                      <div
                        key={item.id}
                        onClick={() => handleSelectCustomCursor(item.id as CustomCursorStyle)}
                        style={{
                          background: isSelected ? 'var(--bg-secondary)' : 'var(--bg-primary)',
                          border: `1px solid ${isSelected ? 'var(--accent-color)' : 'var(--border-color)'}`,
                          borderRadius: '8px',
                          padding: '14px',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '10px',
                          transition: 'all 0.15s ease',
                          boxShadow: isSelected ? '0 0 12px var(--accent-subtle)' : 'none',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          {item.preview}
                          {isSelected && <Check size={14} color="var(--accent-color)" />}
                        </div>
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                            {item.name}
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px', lineHeight: 1.3 }}>
                            {item.desc}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* Interactive Test Playground */}
              <section className="settings-card">
                <div className="settings-card-header">
                  <div>
                    <h3 style={{ fontSize: '14px', fontWeight: 600, margin: '0 0 2px 0', textTransform: 'none', fontFamily: 'var(--font-sans)' }}>
                      Interactive Cursor Playground
                    </h3>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>
                      Move around, hover over buttons and trigger click interactions below to test pointer responsiveness.
                    </p>
                  </div>
                </div>

                <div
                  style={{
                    background: 'var(--bg-primary)',
                    border: '1px dashed var(--border-color)',
                    borderRadius: '8px',
                    padding: '24px',
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '16px',
                  }}
                >
                  <button
                    type="button"
                    className="bma-btn"
                    style={{ padding: '8px 18px', fontSize: '11px' }}
                    onClick={() => showNotification('Hover interaction confirmed!')}
                  >
                    HOVER ME
                  </button>

                  <button
                    type="button"
                    className="col-vault-add-btn"
                    style={{ padding: '8px 18px', fontSize: '11px' }}
                    onClick={() => showNotification('Vault button target confirmed!')}
                  >
                    VAULT TARGET
                  </button>

                  <button
                    type="button"
                    className="bma-btn bma-btn-primary"
                    style={{ padding: '8px 18px', fontSize: '11px' }}
                    onClick={() => showNotification('Primary button response confirmed!')}
                  >
                    CLICK TEST
                  </button>

                  <input
                    type="text"
                    placeholder="Input focus test..."
                    style={{
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-primary)',
                      padding: '8px 12px',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '11px',
                      outline: 'none',
                    }}
                  />
                </div>
              </section>
            </>
          )}

          {/* =========================================================================
              SECTION: DISCORD RICH PRESENCE (BENTO BOX UI)
             ========================================================================= */}
          {activeSection === 'DISCORD' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '16px' }}>
              {/* BENTO 1: MASTER CONNECTION & DIAGNOSTICS (6 cols) */}
              <div
                className="settings-card"
                style={{
                  gridColumn: 'span 6',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                  background: 'rgba(16, 18, 26, 0.85)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '16px',
                  padding: '22px',
                  boxShadow: '0 8px 30px rgba(0, 0, 0, 0.5)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '10px',
                        background: 'rgba(88, 101, 242, 0.2)',
                        border: '1px solid rgba(88, 101, 242, 0.4)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#5865F2',
                      }}
                    >
                      <Radio size={18} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '15px', fontWeight: 700, margin: 0, color: '#fff' }}>
                        Discord RPC Bridge
                      </h3>
                      <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>
                        Local Named Pipe Direct IPC
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleToggleDiscordRpc}
                    className={`settings-toggle ${discordRpcEnabled ? 'is-on' : ''}`}
                    aria-label="Toggle Discord Rich Presence"
                  >
                    <div className="settings-toggle-knob" />
                  </button>
                </div>

                {/* Connection Status Pill & Force Reconnect */}
                <div
                  style={{
                    background: 'rgba(0, 0, 0, 0.35)',
                    borderRadius: '10px',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    padding: '12px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: !discordRpcEnabled
                          ? '#ef4444'
                          : discordStatus?.isConnected
                          ? '#22c55e'
                          : '#eab308',
                        boxShadow: discordStatus?.isConnected ? '0 0 10px #22c55e' : 'none',
                      }}
                    />
                    <span style={{ fontSize: '12.5px', fontWeight: 600, color: '#fff' }}>
                      {!discordRpcEnabled
                        ? 'Broadcasting Disabled'
                        : discordStatus?.isConnected
                        ? 'Connected to Discord Desktop'
                        : 'Searching for Discord Client...'}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleTestDiscordConnection}
                    disabled={isCheckingDiscord}
                    style={{
                      background: 'rgba(255, 255, 255, 0.08)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      color: '#fff',
                      borderRadius: '6px',
                      padding: '6px 12px',
                      fontSize: '11px',
                      fontWeight: 600,
                      cursor: isCheckingDiscord ? 'wait' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                    }}
                  >
                    <RefreshCw size={12} className={isCheckingDiscord ? 'spin' : ''} />
                    <span>{isCheckingDiscord ? 'Probing...' : 'Test Pipe'}</span>
                  </button>
                </div>

                {/* Client ID Setting */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: 'auto' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                      Application Client ID
                    </label>
                    <button
                      type="button"
                      onClick={handleResetDiscordClientId}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--accent-color, #eab308)',
                        fontSize: '11px',
                        cursor: 'pointer',
                        padding: 0,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <RotateCcw size={10} />
                      <span>Default</span>
                    </button>
                  </div>
                  <input
                    type="text"
                    value={discordClientId}
                    onChange={handleDiscordClientIdChange}
                    style={{
                      background: 'rgba(0, 0, 0, 0.4)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      color: '#fff',
                      fontSize: '12px',
                      fontFamily: 'var(--font-mono)',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              {/* BENTO 2: LIVE DISCORD PROFILE MOCKUP (6 cols) */}
              <div
                className="settings-card"
                style={{
                  gridColumn: 'span 6',
                  display: 'flex',
                  flexDirection: 'column',
                  background: '#1e1f22',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '16px',
                  padding: '20px',
                  color: '#dbdee1',
                  boxShadow: '0 8px 30px rgba(0, 0, 0, 0.5)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '0.06em', color: '#949ba4' }}>
                    PLAYING A GAME
                  </span>
                  <span style={{ fontSize: '10px', background: 'rgba(88, 101, 242, 0.25)', color: '#5865F2', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
                    DISCORD PROFILE
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                  {/* Artwork with Small Status Circle */}
                  <div style={{ position: 'relative', width: '68px', height: '68px', flexShrink: 0 }}>
                    <img
                      src={
                        currentTrack?.thumbnail ||
                        'https://raw.githubusercontent.com/noobcoder1982/shono.fm/main/public/icon.png'
                      }
                      alt="Album Cover"
                      style={{
                        width: '100%',
                        height: '100%',
                        borderRadius: '10px',
                        objectFit: 'cover',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        background: '#111214',
                      }}
                    />
                    <div
                      style={{
                        position: 'absolute',
                        bottom: '-4px',
                        right: '-4px',
                        width: '22px',
                        height: '22px',
                        borderRadius: '50%',
                        background: '#2b2d31',
                        border: '2px solid #1e1f22',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '10px',
                        color: '#fff',
                      }}
                    >
                      {playbackStatus === 'PLAYING' ? '▶' : '⏸'}
                    </div>
                  </div>

                  {/* Metadata Text */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0, flex: 1 }}>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#f2f3f5', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      SHONO.FM
                    </div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#dbdee1', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {currentTrack?.title || 'Timeless'}
                    </div>
                    <div style={{ fontSize: '12px', color: '#949ba4', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      by {currentTrack?.artist || 'The Weeknd'}
                    </div>
                    <div style={{ fontSize: '11px', color: '#949ba4', marginTop: '2px', fontFamily: 'var(--font-mono)' }}>
                      {playbackStatus === 'PLAYING'
                        ? `${Math.floor(currentTime / 60)}:${Math.floor(currentTime % 60).toString().padStart(2, '0')} elapsed`
                        : 'Paused'}
                    </div>
                  </div>
                </div>

                {/* Mockup Action Pills */}
                <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                  <div
                    style={{
                      flex: 1,
                      background: '#2b2d31',
                      borderRadius: '6px',
                      padding: '7px',
                      fontSize: '12px',
                      fontWeight: 600,
                      color: '#f2f3f5',
                      textAlign: 'center',
                    }}
                  >
                    Play on YouTube
                  </div>
                  <div
                    style={{
                      flex: 1,
                      background: '#2b2d31',
                      borderRadius: '6px',
                      padding: '7px',
                      fontSize: '12px',
                      fontWeight: 600,
                      color: '#f2f3f5',
                      textAlign: 'center',
                    }}
                  >
                    Listen on SHONO.FM
                  </div>
                </div>
              </div>

              {/* BENTO 3: STEP-BY-STEP SETUP TUTORIAL (7 cols) */}
              <div
                className="settings-card"
                style={{
                  gridColumn: 'span 7',
                  background: 'rgba(16, 18, 26, 0.85)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '16px',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <Sparkles size={16} color="var(--accent-color, #eab308)" />
                  <h4 style={{ fontSize: '14px', fontWeight: 700, margin: 0, color: '#fff' }}>
                    How to Enable Discord Status (4 Steps)
                  </h4>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                    <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--accent-color, #eab308)', marginBottom: '3px' }}>
                      STEP 1: DESKTOP APP
                    </div>
                    <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                      Open the official Discord Desktop client on your PC. (Browser web Discord cannot connect to local named pipes).
                    </div>
                  </div>

                  <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                    <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--accent-color, #eab308)', marginBottom: '3px' }}>
                      STEP 2: ACTIVITY PRIVACY
                    </div>
                    <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                      In Discord, go to User Settings ⚙️ &gt; Activity Privacy.
                    </div>
                  </div>

                  <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                    <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--accent-color, #eab308)', marginBottom: '3px' }}>
                      STEP 3: TURN STATUS ON
                    </div>
                    <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                      Turn ON "Display current activity as a status message".
                    </div>
                  </div>

                  <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                    <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--accent-color, #eab308)', marginBottom: '3px' }}>
                      STEP 4: PLAY MUSIC
                    </div>
                    <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                      Play any song in SHONO.FM. Your profile status updates instantaneously with song title, artist, and elapsed timeline!
                    </div>
                  </div>
                </div>
              </div>

              {/* BENTO 4: BROADCAST TELEMETRY CONTROLS (5 cols) */}
              <div
                className="settings-card"
                style={{
                  gridColumn: 'span 5',
                  background: 'rgba(16, 18, 26, 0.85)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '16px',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}
              >
                <h4 style={{ fontSize: '14px', fontWeight: 700, margin: 0, color: '#fff' }}>
                  Broadcasting Preferences
                </h4>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  <div style={{ fontSize: '12px', color: '#fff', fontWeight: 500 }}>
                    Live Timestamps & Timeline
                  </div>
                  <span style={{ fontSize: '10px', color: '#22c55e', fontWeight: 700 }}>ACTIVE</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  <div style={{ fontSize: '12px', color: '#fff', fontWeight: 500 }}>
                    High-Res Album Artwork
                  </div>
                  <span style={{ fontSize: '10px', color: '#22c55e', fontWeight: 700 }}>ACTIVE</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0' }}>
                  <div style={{ fontSize: '12px', color: '#fff', fontWeight: 500 }}>
                    Stream Action Buttons
                  </div>
                  <span style={{ fontSize: '10px', color: '#22c55e', fontWeight: 700 }}>ACTIVE</span>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              SECTION: ABOUT
             ========================================================================= */}
          {activeSection === 'ABOUT' && (
            <>
              {/* 1. App Info & Updates */}
              <section className="settings-card">
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                      <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0, textTransform: 'none', fontFamily: 'var(--font-sans)', color: 'var(--text-primary)' }}>
                        SHONO.FM
                      </h2>
                      <span
                        style={{
                          fontSize: '12px',
                          padding: '2px 8px',
                          borderRadius: '9999px',
                          background: 'var(--accent-subtle)',
                          color: 'var(--accent-color)',
                          fontWeight: 600,
                        }}
                      >
                        v{CURRENT_APP_VERSION}
                      </span>
                    </div>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
                      A clean, modern music player and universal streaming archive.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      updateService.checkForUpdates();
                      showNotification('Checking for updates...');
                    }}
                    disabled={updateState.isChecking}
                    style={{
                      background: 'var(--bg-primary)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-primary)',
                      borderRadius: '6px',
                      padding: '8px 14px',
                      fontSize: '12px',
                      cursor: updateState.isChecking ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      whiteSpace: 'nowrap',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <RefreshCw size={13} className={updateState.isChecking ? 'spin' : ''} />
                    <span>{updateState.isChecking ? 'Checking...' : 'Check for Updates'}</span>
                  </button>
                </div>

                {/* Update Banner if available */}
                {updateState.hasUpdate && (
                  <div
                    style={{
                      marginTop: '12px',
                      padding: '12px 16px',
                      borderRadius: '8px',
                      background: 'var(--accent-subtle)',
                      border: '1px solid var(--accent-color)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '12px',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--accent-color)' }}>
                        Version {updateState.latestVersion} is available
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                        {updateState.isReadyToRestart
                          ? 'Update is ready to install'
                          : updateState.isDownloading
                          ? `Downloading update (${updateState.downloadPercent}%)...`
                          : 'A new version is ready to download'}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => updateService.downloadAndRestart()}
                      disabled={updateState.isDownloading}
                      style={{
                        background: 'var(--accent-color)',
                        color: '#000',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '6px 14px',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: updateState.isDownloading ? 'wait' : 'pointer',
                      }}
                    >
                      {updateState.isReadyToRestart
                        ? 'Restart & Install'
                        : updateState.isDownloading
                        ? `${updateState.downloadPercent}%`
                        : 'Download Update'}
                    </button>
                  </div>
                )}
              </section>

              {/* 2. What's New Release Notes */}
              <section className="settings-card">
                <div className="settings-card-header">
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <h2 style={{ fontSize: '15px', fontWeight: 600, margin: 0, textTransform: 'none', fontFamily: 'var(--font-sans)' }}>
                        What's New in v1.2.0
                      </h2>
                      <span style={{ fontSize: '9px', fontWeight: 800, padding: '2px 6px', borderRadius: '4px', background: 'rgba(212, 175, 55, 0.15)', color: 'var(--accent-color)', border: '1px solid rgba(212, 175, 55, 0.3)' }}>
                        BETA
                      </span>
                    </div>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
                      Latest features and improvements in this release.
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                      🖥️ Compact Floating Mini-Deck & Windows Desktop Integration
                    </div>
                    <div>
                      Always-on-top frosted-glass floating widget styled like a vintage cassette tape with spinning hubs, playback scrubber, and quick controls. Native Windows Media Transport Controls (SMTC), global keyboard media keys, and system tray controller with minimize-to-tray.
                    </div>
                  </div>

                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                      📝 Aesthetic Lyric Card / Poster Generator
                    </div>
                    <div>
                      Select 2–4 lines of lyrics in the Fullscreen player to generate high-res, beautifully typeset graphic cards featuring album artwork, track title, and typography ready to copy or download.
                    </div>
                  </div>

                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                      🎤 Word-by-Word Karaoke Glow & Enhanced LRC Support
                    </div>
                    <div>
                      Smooth word-level highlight animation synced to vocals for tracks with enhanced timestamp data.
                    </div>
                  </div>

                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                      📼 Virtual Mixtape / Cassette Deck (A-Side & B-Side)
                    </div>
                    <div>
                      Create custom virtual cassettes with fixed run times (C-60, C-90), customizable J-card spine labels, and animated spinning cassette reels.
                    </div>
                  </div>

                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                      🏷️ BPM & Musical Key Badges
                    </div>
                    <div>
                      Minimalist hardware tags displayed on track rows and player info (e.g., 124 BPM • D Minor), perfect for cohesive playlist curation.
                    </div>
                  </div>

                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                      🎚️ DJ Crossfade & Gapless Playback
                    </div>
                    <div>
                      Smooth, configurable 1s to 8s crossfade transition between queue tracks so playback never cuts abruptly.
                    </div>
                  </div>

                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                      📻 "Infinite Archive" (Radio Mode) & Dual-Needle Vintage VU Meters
                    </div>
                    <div>
                      Auto-resolves and queues 5 matching tracks when queue ends. Switchable dual-needle analog stereo VU meters with realistic ballistic inertia and CRT oscilloscope.
                    </div>
                  </div>

                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                      🎨 5 New Clean Themes
                    </div>
                    <div>
                      Added Blue, Dark, Dark+, Beige, and Green themes with curated color palettes.
                    </div>
                  </div>
                </div>
              </section>

              {/* 3. External Links */}
              <section className="settings-card">
                <div style={{ display: 'flex', gap: '10px' }}>
                  <a
                    href="https://github.com/noobcoder1982/shono.fm"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      flex: 1,
                      padding: '12px 16px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)',
                      background: 'var(--bg-primary)',
                      color: 'var(--text-primary)',
                      fontSize: '13px',
                      fontWeight: 500,
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'var(--text-primary)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border-color)';
                    }}
                  >
                    <span>GitHub Repository</span>
                    <ExternalLink size={14} style={{ color: 'var(--text-muted)' }} />
                  </a>

                  <a
                    href="https://github.com/noobcoder1982/shono.fm/issues"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      flex: 1,
                      padding: '12px 16px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)',
                      background: 'var(--bg-primary)',
                      color: 'var(--text-primary)',
                      fontSize: '13px',
                      fontWeight: 500,
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'var(--text-primary)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border-color)';
                    }}
                  >
                    <span>Report an Issue</span>
                    <ExternalLink size={14} style={{ color: 'var(--text-muted)' }} />
                  </a>
                </div>
              </section>
            </>
          )}

          {/* =========================================================================
              SECTION: BETA FEATURES FOR TESTING
             ========================================================================= */}
          {activeSection === 'BETA' && (
            <>
              {/* 1. Infinite Archive (Radio Mode) */}
              <section className="settings-card">
                <div className="settings-row">
                  <div className="settings-row-text">
                    <div className="settings-row-title" style={{ textTransform: 'none', fontSize: '14px' }}>
                      "Infinite Archive" (Radio Mode)
                    </div>
                    <div className="settings-row-desc">
                      When your playback queue reaches the end, SHONO.FM automatically resolves and queues 5 contextually matching tracks based on the vibe, genre, and era of the last played songs.
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleToggleInfiniteArchive}
                    className={`settings-toggle ${betaInfiniteArchive ? 'is-on' : ''}`}
                    aria-label="Toggle Infinite Archive"
                  >
                    <div className="settings-toggle-knob" />
                  </button>
                </div>
              </section>

              {/* 2. Word-by-Word Karaoke Glow */}
              <section className="settings-card">
                <div className="settings-row">
                  <div className="settings-row-text">
                    <div className="settings-row-title" style={{ textTransform: 'none', fontSize: '14px' }}>
                      Word-by-Word Karaoke Glow
                    </div>
                    <div className="settings-row-desc">
                      Smooth word-level highlight animation synced to vocals for tracks with enhanced .lrc timestamp data.
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleToggleWordKaraoke}
                    className={`settings-toggle ${betaWordKaraoke ? 'is-on' : ''}`}
                    aria-label="Toggle Word Karaoke"
                  >
                    <div className="settings-toggle-knob" />
                  </button>
                </div>
              </section>

              {/* 4. BPM & Musical Key Badges */}
              <section className="settings-card">
                <div className="settings-row">
                  <div className="settings-row-text">
                    <div className="settings-row-title" style={{ textTransform: 'none', fontSize: '14px' }}>
                      BPM & Musical Key Badges
                    </div>
                    <div className="settings-row-desc">
                      Display minimalist hardware badges on track rows and player info (e.g., 124 BPM • D Minor), perfect for cohesive sequencing and curation.
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleToggleBpmKeyBadges}
                    className={`settings-toggle ${showBpmKeyBadges ? 'is-on' : ''}`}
                    aria-label="Toggle BPM Badges"
                  >
                    <div className="settings-toggle-knob" />
                  </button>
                </div>
              </section>
            </>
          )}

        </div>
      </div>
    </div>
  );
};
