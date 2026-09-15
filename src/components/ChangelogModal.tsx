import React, { useState } from 'react';
import { usePlayer } from '../context/PlayerContext';
import { CURRENT_APP_VERSION } from '../services/storage';
import {
  Sparkles,
  Layers,
  Mic2,
  Maximize2,
  Radio,
  Disc,
  Search,
  Check,
  X,
  History,
  Rocket,
  ArrowRight,
} from 'lucide-react';

interface FeatureCard {
  title: string;
  tag: string;
  status: 'NEW' | 'ENHANCED' | 'CORE';
  description: string;
  icon: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
}

export const ChangelogModal: React.FC = () => {
  const {
    isChangelogOpen,
    closeChangelog,
    setTheme,
    setPlayerMode,
    playerMode,
    theme,
    setIsSearchOpen,
  } = usePlayer();

  const [activeVersionTab, setActiveVersionTab] = useState<'v1.1.0' | 'v1.0.0'>('v1.1.0');
  const [dontShowAgain, setDontShowAgain] = useState(true);

  if (!isChangelogOpen) return null;

  const isAppleGlass = Boolean(theme && theme.startsWith('apple-glass'));

  const handleDismiss = () => {
    closeChangelog(dontShowAgain);
  };

  const handleSwitchToGlass = () => {
    setTheme('apple-glass');
  };

  const handleToggleMI6 = () => {
    setPlayerMode(playerMode === 'MI6' ? 'ARCHIVE' : 'MI6');
  };

  const featuresV110: FeatureCard[] = [
    {
      title: 'Apple Glass & Dynamic Ambient Refraction',
      tag: 'AESTHETICS',
      status: 'NEW',
      icon: <Sparkles size={16} color="var(--accent-color)" />,
      description:
        'Frosted translucent obsidian and crystal light glass themes with dynamic real-time color extraction from active album covers. Ambient backdrops react and glow with every track change.',
      actionLabel: theme.startsWith('apple-glass') ? 'Active: Apple Glass' : 'Switch to Apple Glass',
      onAction: handleSwitchToGlass,
    },
    {
      title: 'Synchronized Apple Music Lyrics',
      tag: 'AUDIO FIDELITY',
      status: 'NEW',
      icon: <Mic2 size={16} color="var(--status-active)" />,
      description:
        'Live karaoke-style lyric sync embedded in the right player column. Follows playback timestamps in real-time with glowing lines and smooth auto-scrolling.',
    },
    {
      title: 'Draggable Resizable Brutalist Sidebar',
      tag: 'INTERFACE',
      status: 'NEW',
      icon: <Maximize2 size={16} color="var(--text-primary)" />,
      description:
        'Custom interactive drag-to-resize handle on the sidebar border. Includes a live floating width badge (240px–480px), persistence in storage, and double-click to snap back to default.',
    },
    {
      title: 'Synthesizer Darkwave Backup Engine',
      tag: 'CORE AUDIO',
      status: 'ENHANCED',
      icon: <Radio size={16} color="var(--status-buffering)" />,
      description:
        'Intelligent harmonic audio fallback generator. When YouTube tracks encounter geo-restrictions or network drops, ambient darkwave harmonic chords seamlessly sustain the session.',
    },
    {
      title: 'Collections Vault & Instant Search',
      tag: 'NAVIGATION',
      status: 'ENHANCED',
      icon: <Search size={16} color="var(--accent-color)" />,
      description:
        'Dedicated full-screen Collections vault view (03 / COLLECTIONS) with live genre filter badges and a glassy instant search overlay triggerable anytime via [⌘K] or [/].',
      actionLabel: 'Open Search (⌘K)',
      onAction: () => {
        closeChangelog(dontShowAgain);
        setIsSearchOpen(true);
      },
    },
    {
      title: '007 / MI6 Analog Vinyl Player Mode',
      tag: 'EASTER EGG',
      status: 'NEW',
      icon: <Disc size={16} color="#d4af37" />,
      description:
        'Tactile vintage vinyl turntable deck with authentic needle crackle acoustics, 33 / 45 / 78 RPM speed switching, variable pitch fader, and secret MI6 operational dossier styling.',
      actionLabel: playerMode === 'MI6' ? 'MI6 Mode Engaged' : 'Engage 007 / MI6 Mode',
      onAction: handleToggleMI6,
    },
  ];

  const featuresV100: FeatureCard[] = [
    {
      title: 'Genesis Brutalist Music Vault',
      tag: 'ARCHITECTURE',
      status: 'CORE',
      icon: <Layers size={16} color="var(--text-primary)" />,
      description:
        'High-contrast 3-column brutalist design system with raw typographic hierarchy, industrial monochrome palettes, and precision track indexes.',
    },
    {
      title: 'YouTube Audio Pipeline Ingestion',
      tag: 'STREAMING',
      status: 'CORE',
      icon: <Radio size={16} color="var(--status-active)" />,
      description:
        'Direct playlist parsing and audio extraction from YouTube playlists with queue management, persistent bottom player, and keyboard controls.',
    },
  ];

  return (
    <div className="modal-backdrop" onClick={handleDismiss}>
      <div
        className="modal-card changelog-modal-card"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '720px',
          maxHeight: '88vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Top Header Banner */}
        <div
          style={{
            padding: '16px 22px',
            borderBottom: '1px solid var(--border-color)',
            background: 'var(--bg-secondary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                background: 'var(--accent-color)',
                color: 'var(--text-inverse)',
                fontSize: '9px',
                fontFamily: 'var(--font-mono)',
                fontWeight: 700,
                letterSpacing: '0.12em',
                padding: '3px 8px',
                borderRadius: isAppleGlass ? '999px' : '2px',
              }}
            >
              UPDATE 01
            </div>
            <div>
              <div
                style={{
                  fontFamily: isAppleGlass ? 'var(--font-sans)' : 'var(--font-display)',
                  fontSize: isAppleGlass ? '15px' : '17px',
                  fontWeight: 700,
                  letterSpacing: isAppleGlass ? '-0.01em' : '0.04em',
                  color: 'var(--text-primary)',
                  lineHeight: 1.2,
                }}
              >
                SHONO.FM // SYSTEM CHANGELOG
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '9px',
                  color: 'var(--text-muted)',
                  letterSpacing: '0.06em',
                }}
              >
                RELEASE v{CURRENT_APP_VERSION} &bull; AUDIO FIDELITY & APPLE GLASS
              </div>
            </div>
          </div>

          <button
            className="bma-btn-icon"
            onClick={handleDismiss}
            style={{ padding: '6px', borderRadius: isAppleGlass ? '50%' : '0' }}
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
            padding: '10px 22px',
            background: 'var(--bg-primary)',
            borderBottom: '1px solid var(--border-subtle)',
            flexShrink: 0,
          }}
        >
          <button
            type="button"
            onClick={() => setActiveVersionTab('v1.1.0')}
            style={{
              padding: '6px 14px',
              borderRadius: isAppleGlass ? '12px' : '0',
              background: activeVersionTab === 'v1.1.0' ? 'var(--bg-secondary)' : 'transparent',
              border: activeVersionTab === 'v1.1.0' ? '1px solid var(--border-bright)' : '1px solid transparent',
              color: activeVersionTab === 'v1.1.0' ? 'var(--text-primary)' : 'var(--text-muted)',
              fontFamily: 'var(--font-mono)',
              fontSize: '10px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Rocket size={12} color={activeVersionTab === 'v1.1.0' ? 'var(--accent-color)' : 'currentColor'} />
            v1.1.0 (Latest Update)
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
            onClick={() => setActiveVersionTab('v1.0.0')}
            style={{
              padding: '6px 14px',
              borderRadius: isAppleGlass ? '12px' : '0',
              background: activeVersionTab === 'v1.0.0' ? 'var(--bg-secondary)' : 'transparent',
              border: activeVersionTab === 'v1.0.0' ? '1px solid var(--border-bright)' : '1px solid transparent',
              color: activeVersionTab === 'v1.0.0' ? 'var(--text-primary)' : 'var(--text-muted)',
              fontFamily: 'var(--font-mono)',
              fontSize: '10px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
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
            padding: '18px 22px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
          }}
        >
          {/* Release Headline Banner */}
          {activeVersionTab === 'v1.1.0' ? (
            <div
              style={{
                padding: '14px 16px',
                background: isAppleGlass ? 'var(--glass-bg-secondary)' : 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: isAppleGlass ? '14px' : '0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div
                  style={{
                    fontFamily: isAppleGlass ? 'var(--font-sans)' : 'var(--font-mono)',
                    fontSize: '12px',
                    fontWeight: 700,
                    color: 'var(--text-primary)',
                    letterSpacing: '0.04em',
                    marginBottom: '2px',
                  }}
                >
                  WHAT&apos;S NEW IN UPDATE 01
                </div>
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '9.5px',
                    color: 'var(--text-secondary)',
                    lineHeight: 1.4,
                  }}
                >
                  This update brings dynamic ambient album backdrops, synced Apple Music lyrics,
                  customizable sidebar dimensions, and enhanced audio synthesis fallback.
                </div>
              </div>
            </div>
          ) : (
            <div
              style={{
                padding: '12px 16px',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                fontFamily: 'var(--font-mono)',
                fontSize: '9.5px',
                color: 'var(--text-secondary)',
              }}
            >
              Initial public release of Shono.fm brutalist audio streaming vault and YouTube API integration.
            </div>
          )}

          {/* Cards List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {(activeVersionTab === 'v1.1.0' ? featuresV110 : featuresV100).map((card, idx) => (
              <div
                key={idx}
                style={{
                  padding: '14px 16px',
                  background: isAppleGlass ? 'var(--glass-bg-active)' : 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: isAppleGlass ? '14px' : '0',
                  transition: 'border-color 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-bright)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-color)';
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '8px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div
                      style={{
                        padding: '5px',
                        background: 'var(--bg-primary)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: isAppleGlass ? '8px' : '2px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {card.icon}
                    </div>
                    <span
                      style={{
                        fontFamily: isAppleGlass ? 'var(--font-sans)' : 'var(--font-mono)',
                        fontSize: isAppleGlass ? '13px' : '11.5px',
                        fontWeight: 700,
                        color: 'var(--text-primary)',
                      }}
                    >
                      {card.title}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '8px',
                        fontWeight: 700,
                        letterSpacing: '0.08em',
                        padding: '2px 6px',
                        borderRadius: isAppleGlass ? '999px' : '2px',
                        border: '1px solid var(--border-bright)',
                        color: 'var(--text-secondary)',
                      }}
                    >
                      {card.tag}
                    </span>
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '8px',
                        fontWeight: 700,
                        letterSpacing: '0.08em',
                        padding: '2px 6px',
                        borderRadius: isAppleGlass ? '999px' : '2px',
                        background:
                          card.status === 'NEW'
                            ? 'var(--status-active)'
                            : card.status === 'ENHANCED'
                            ? 'var(--accent-color)'
                            : 'var(--text-muted)',
                        color: 'var(--text-inverse)',
                      }}
                    >
                      {card.status}
                    </span>
                  </div>
                </div>

                <div
                  style={{
                    fontFamily: isAppleGlass ? 'var(--font-sans)' : 'var(--font-mono)',
                    fontSize: isAppleGlass ? '12px' : '10px',
                    lineHeight: 1.5,
                    color: 'var(--text-secondary)',
                    marginBottom: card.actionLabel ? '10px' : '0',
                  }}
                >
                  {card.description}
                </div>

                {card.actionLabel && card.onAction && (
                  <button
                    type="button"
                    onClick={card.onAction}
                    className="bma-btn"
                    style={{
                      marginTop: '8px',
                      padding: '5px 12px',
                      fontSize: '9.5px',
                      borderRadius: isAppleGlass ? '999px' : '0',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <span>{card.actionLabel}</span>
                    <ArrowRight size={10} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div
          style={{
            padding: '14px 22px',
            borderTop: '1px solid var(--border-color)',
            background: 'var(--bg-secondary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
            gap: '12px',
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
              Don&apos;t show again until next update
            </span>
          </label>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              onClick={handleDismiss}
              className="bma-btn bma-btn-primary"
              style={{
                padding: '8px 20px',
                fontSize: '10.5px',
                borderRadius: isAppleGlass ? '999px' : '0',
                letterSpacing: '0.08em',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <Check size={13} />
              EXPLORE SHONO.FM
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
