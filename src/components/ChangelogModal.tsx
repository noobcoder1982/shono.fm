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
  Sparkles,
  Maximize2,
  Mic2,
  Tv,
  Download,
  FolderArchive,
  Layers,
} from 'lucide-react';

type VersionTab = 'v1.9.0' | 'v1.8.0' | 'v1.7.0' | 'v1.6.0' | 'v1.5.0' | 'v1.4.0' | 'v1.3.0' | 'v1.2.0' | 'v1.1.0' | 'v1.0.0';

export const ChangelogModal: React.FC = () => {
  const {
    isChangelogOpen,
    closeChangelog,
    setTheme,
    theme,
    setActiveTab,
    toggleFullscreenPlayer,
    openZipModal,
  } = usePlayer();

  const [activeVersionTab, setActiveVersionTab] = useState<VersionTab>('v1.9.0');
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
              UPDATE 09
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
                RELEASE v{CURRENT_APP_VERSION} &bull; CLIENT-SIDE PLAYLIST ARCHIVE ZIP EXPORTER & DOSSIER BUNDLER
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
            onClick={() => setActiveVersionTab('v1.9.0')}
            style={{
              padding: '6px 14px',
              borderRadius: '2px',
              background: activeVersionTab === 'v1.9.0' ? 'var(--bg-secondary)' : 'transparent',
              border: activeVersionTab === 'v1.9.0' ? '1px solid var(--border-bright)' : '1px solid transparent',
              color: activeVersionTab === 'v1.9.0' ? 'var(--text-primary)' : 'var(--text-muted)',
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
            <Sparkles size={12} color={activeVersionTab === 'v1.9.0' ? 'var(--accent-color)' : 'currentColor'} />
            v1.9.0 (Update 09 // Playlist Archive ZIP Exporter)
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
            onClick={() => setActiveVersionTab('v1.8.0')}
            style={{
              padding: '6px 14px',
              borderRadius: '2px',
              background: activeVersionTab === 'v1.8.0' ? 'var(--bg-secondary)' : 'transparent',
              border: activeVersionTab === 'v1.8.0' ? '1px solid var(--border-bright)' : '1px solid transparent',
              color: activeVersionTab === 'v1.8.0' ? 'var(--text-primary)' : 'var(--text-muted)',
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
            v1.8.0 (Update 08 // Player Dock Stabilization)
          </button>

          <button
            type="button"
            onClick={() => setActiveVersionTab('v1.7.0')}
            style={{
              padding: '6px 14px',
              borderRadius: '2px',
              background: activeVersionTab === 'v1.7.0' ? 'var(--bg-secondary)' : 'transparent',
              border: activeVersionTab === 'v1.7.0' ? '1px solid var(--border-bright)' : '1px solid transparent',
              color: activeVersionTab === 'v1.7.0' ? 'var(--text-primary)' : 'var(--text-muted)',
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
            v1.7.0 (Update 07 // Minimalist Lyrics Cleanse)
          </button>

          <button
            type="button"
            onClick={() => setActiveVersionTab('v1.6.0')}
            style={{
              padding: '6px 14px',
              borderRadius: '2px',
              background: activeVersionTab === 'v1.6.0' ? 'var(--bg-secondary)' : 'transparent',
              border: activeVersionTab === 'v1.6.0' ? '1px solid var(--border-bright)' : '1px solid transparent',
              color: activeVersionTab === 'v1.6.0' ? 'var(--text-primary)' : 'var(--text-muted)',
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
            v1.6.0 (Update 06 // Square Artwork)
          </button>

          <button
            type="button"
            onClick={() => setActiveVersionTab('v1.5.0')}
            style={{
              padding: '6px 14px',
              borderRadius: '2px',
              background: activeVersionTab === 'v1.5.0' ? 'var(--bg-secondary)' : 'transparent',
              border: activeVersionTab === 'v1.5.0' ? '1px solid var(--border-bright)' : '1px solid transparent',
              color: activeVersionTab === 'v1.5.0' ? 'var(--text-primary)' : 'var(--text-muted)',
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
            v1.5.0 (Update 05 // Kinetic Blur Lyrics)
          </button>

          <button
            type="button"
            onClick={() => setActiveVersionTab('v1.4.0')}
            style={{
              padding: '6px 14px',
              borderRadius: '2px',
              background: activeVersionTab === 'v1.4.0' ? 'var(--bg-secondary)' : 'transparent',
              border: activeVersionTab === 'v1.4.0' ? '1px solid var(--border-bright)' : '1px solid transparent',
              color: activeVersionTab === 'v1.4.0' ? 'var(--text-primary)' : 'var(--text-muted)',
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
            <Rocket size={12} color={activeVersionTab === 'v1.4.0' ? 'var(--accent-color)' : 'currentColor'} />
            v1.4.0 (Update 04 // Fullscreen Mode)
          </button>

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
            <History size={12} />
            v1.3.0 (Update 03 // Ingestion Dock)
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
          {activeVersionTab === 'v1.9.0' ? (
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
                  <Sparkles size={16} color="var(--accent-color)" />
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
                    Manifesto // Client-Side Playlist Archive ZIP Exporter & Standalone Dossier Bundler
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
                  Digital music vaults must respect data sovereignty. When you curate, collect, or import a playlist into SHONO.FM, your library should never remain trapped in a closed browser tab or tied to third-party streaming whims. True audio preservation demands unencumbered, standalone offline portability.
                </p>
                <p
                  style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: '13.5px',
                    lineHeight: '1.65',
                    color: 'var(--text-secondary)',
                    marginBottom: '14px',
                  }}
                >
                  Update 09 introduces the <strong>Client-Side Playlist Archive ZIP Exporter</strong>. Operating entirely within browser memory via <code>JSZip</code>, SHONO.FM compiles a comprehensive, multi-tiered archive dossier for any active or imported playlist into a clean <code>.zip</code> package with zero server proxying, zero compression degradation, and instantaneous local generation.
                </p>

                {/* Quick Launch CTA */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    paddingTop: '10px',
                    borderTop: '1px solid var(--border-subtle)',
                  }}
                >
                  <button
                    type="button"
                    onClick={() => {
                      closeChangelog(dontShowAgain);
                      openZipModal();
                    }}
                    className="bma-btn"
                    style={{
                      padding: '7px 16px',
                      fontSize: '10px',
                      background: 'var(--accent-color)',
                      color: 'var(--text-inverse)',
                      borderColor: 'var(--accent-color)',
                      fontWeight: 700,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      boxShadow: '0 0 14px var(--accent-glow)',
                    }}
                  >
                    <Download size={13} /> LAUNCH ZIP EXPORTER FOR CURRENT ARCHIVE
                  </button>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '9px',
                      color: 'var(--text-muted)',
                    }}
                  >
                    Packages covers, synced .lrc lyrics, .m3u8, .json, and 1-click audio scripts.
                  </span>
                </div>
              </div>

              {/* SECTION: 5-TIER DOSSIER PACKAGE BREAKDOWN */}
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
                  <FolderArchive size={14} color="var(--accent-color)" />
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
                    01 // 5-TIER DOSSIER SPECIFICATION (INSIDE THE GENERATED .ZIP)
                  </span>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                    gap: '12px',
                  }}
                >
                  {/* Item 1 */}
                  <div
                    style={{
                      padding: '14px',
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border-color)',
                    }}
                  >
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--accent-color)', marginBottom: '4px' }}>
                      covers/*.jpg
                    </div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
                      Studio 1000x1000 Square Artwork
                    </div>
                    <p style={{ fontFamily: 'var(--font-sans)', fontSize: '11.5px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                      Full uncompressed 1000x1000 studio square artwork retrieved per track via high-res CDN resolvers with HTML5 Canvas binary extraction fallbacks.
                    </p>
                  </div>

                  {/* Item 2 */}
                  <div
                    style={{
                      padding: '14px',
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border-color)',
                    }}
                  >
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--accent-color)', marginBottom: '4px' }}>
                      lyrics/*.lrc
                    </div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
                      Synced Karaoke Lyrics Files
                    </div>
                    <p style={{ fontFamily: 'var(--font-sans)', fontSize: '11.5px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                      Individual <code>.lrc</code> files containing exact millimeter timestamps formatted <code>[mm:ss.xx]</code> compatible with Apple Music, VLC, DAPs, and Sony Walkmans.
                    </p>
                  </div>

                  {/* Item 3 */}
                  <div
                    style={{
                      padding: '14px',
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border-color)',
                    }}
                  >
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--accent-color)', marginBottom: '4px' }}>
                      playlist.m3u8
                    </div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
                      Universal M3U8 Playlist
                    </div>
                    <p style={{ fontFamily: 'var(--font-sans)', fontSize: '11.5px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                      Standardized UTF-8 playlist file pre-configured for one-drag playback into desktop media engines including VLC, AIMP, foobar2000, and iTunes.
                    </p>
                  </div>

                  {/* Item 4 */}
                  <div
                    style={{
                      padding: '14px',
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border-color)',
                    }}
                  >
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--accent-color)', marginBottom: '4px' }}>
                      playlist.json & README.txt
                    </div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
                      Structured Metadata Dossier
                    </div>
                    <p style={{ fontFamily: 'var(--font-sans)', fontSize: '11.5px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                      Machine-readable JSON specification containing video IDs, durations, audio tokens, and track metadata alongside a brutalist monospaced catalog document.
                    </p>
                  </div>

                  {/* Item 5 */}
                  <div
                    style={{
                      padding: '14px',
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border-color)',
                      gridColumn: '1 / -1',
                    }}
                  >
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--accent-color)', marginBottom: '4px' }}>
                      download_audio_windows.bat & download_audio_mac_linux.sh
                    </div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
                      1-Click yt-dlp Automated Audio Extraction Scripts
                    </div>
                    <p style={{ fontFamily: 'var(--font-sans)', fontSize: '11.5px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                      Pre-populated bash and Windows batch scripts with all track streaming URLs. Running the script automatically fetches studio-grade 320kbps MP3s with embedded thumbnails and tags directly into a local <code>audio/</code> folder.
                    </p>
                  </div>
                </div>
              </div>

              {/* SECTION: DISCOVERY & ACCESS POINTS */}
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
                  <Layers size={14} color="var(--accent-color)" />
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
                    02 // 3 EASY DISCOVERY POINTS ACROSS THE VAULT
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ padding: '10px 14px', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', padding: '3px 8px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--accent-color)' }}>
                      01 / ARCHIVE HEADER
                    </div>
                    <span style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', color: 'var(--text-secondary)' }}>
                      Click <strong>[DOWNLOAD ZIP]</strong> in the top header next to PLAY ALL and SHUFFLE.
                    </span>
                  </div>

                  <div style={{ padding: '10px 14px', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', padding: '3px 8px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--accent-color)' }}>
                      02 / IMPORT BANNER
                    </div>
                    <span style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', color: 'var(--text-secondary)' }}>
                      Upon ingesting any YouTube playlist, the glowing Voila celebration banner features an instant <strong>[DOWNLOAD ZIP]</strong> button.
                    </span>
                  </div>

                  <div style={{ padding: '10px 14px', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', padding: '3px 8px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--accent-color)' }}>
                      03 / COLLECTIONS VIEW
                    </div>
                    <span style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', color: 'var(--text-secondary)' }}>
                      Each archive dossier card in 03 / COLLECTIONS features a quick download cloud icon for 1-click packaging.
                    </span>
                  </div>
                </div>
              </div>
            </>
          ) : activeVersionTab === 'v1.8.0' ? (
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
                  <Sparkles size={16} color="var(--accent-color)" />
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
                    Manifesto // Persistent Player Dock Architecture & Layout Stabilization
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
                  The persistent bottom player dock is the physical and structural bedrock of SHONO.FM. It must remain impenetrable, opaque, and strictly ordered across all viewport dimensions. When layout docking fails, non-docked elements and unconstrained tables can bleed behind controls, shattering the brutalist architectural hierarchy.
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
                  Update 08 re-establishes the permanent fixed docking engine (<code>position: fixed; bottom: 0; left: 0; width: 100%; height: var(--bottom-bar-height); z-index: 100;</code>), applies deep opaque backgrounds (<code>var(--bg-secondary)</code>), and reinforces the 3-column horizontal grid (<code>300px 1fr auto</code>). Concurrently, the TrackList table is hardened with <code>min-height: 0; overflow-y: auto;</code> ensuring long playlists scroll strictly within their allocated flex viewport and never displace or clip the archive chrome tab strip.
                </p>
              </div>

              {/* SECTION: ARCHITECTURAL DETAILS */}
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
                      letterSpacing: '0.12em',
                      color: 'var(--text-primary)',
                      textTransform: 'uppercase',
                    }}
                  >
                    Engineering Specifications // Dock Stabilization
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
                  <div
                    style={{
                      padding: '12px 14px',
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '2px',
                    }}
                  >
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', fontWeight: 800, color: 'var(--accent-color)', marginBottom: '6px' }}>
                      [01] FIXED VIEWPORT DOCK & Z-INDEX ISOLATION
                    </div>
                    <div style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', lineHeight: 1.5, color: 'var(--text-secondary)' }}>
                      Re-established absolute bottom viewport docking with <code>position: fixed; bottom: 0; left: 0; width: 100%; height: var(--bottom-bar-height); z-index: 100;</code>. Completely eliminates jitter and guarantees the dock stays solidly planted.
                    </div>
                  </div>

                  <div
                    style={{
                      padding: '12px 14px',
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '2px',
                    }}
                  >
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', fontWeight: 800, color: 'var(--accent-color)', marginBottom: '6px' }}>
                      [02] OPAQUE BACKGROUND & SHADOW DIVIDER
                    </div>
                    <div style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', lineHeight: 1.5, color: 'var(--text-secondary)' }}>
                      Restored opaque theme background (<code>var(--bg-secondary)</code>), <code>borderTop: 1px solid var(--border-color)</code>, and drop elevation (<code>box-shadow: 0 -8px 24px rgba(0,0,0,0.5)</code>). Background tab text and underline bleeding are permanently resolved.
                    </div>
                  </div>

                  <div
                    style={{
                      padding: '12px 14px',
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '2px',
                    }}
                  >
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', fontWeight: 800, color: 'var(--accent-color)', marginBottom: '6px' }}>
                      [03] 3-COLUMN BALANCED GRID ALIGNMENT
                    </div>
                    <div style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', lineHeight: 1.5, color: 'var(--text-secondary)' }}>
                      Enforced <code>gridTemplateColumns: 300px 1fr auto</code> with <code>alignItems: center</code> across all themes, locking the sleeve art, centered waveform scrubber, and right-hand transport controls onto a single horizontal plane.
                    </div>
                  </div>

                  <div
                    style={{
                      padding: '12px 14px',
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '2px',
                    }}
                  >
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', fontWeight: 800, color: 'var(--accent-color)', marginBottom: '6px' }}>
                      [04] TRACK TABLE SCROLL CONTAINMENT
                    </div>
                    <div style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', lineHeight: 1.5, color: 'var(--text-secondary)' }}>
                      Injected <code>min-height: 0</code> and <code>overflow-y: auto</code> on the track table container. Playlists with hundreds of tracks scroll cleanly within the center panel without displacing the archive tab strip.
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : activeVersionTab === 'v1.7.0' ? (
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
                  <Sparkles size={16} color="var(--accent-color)" />
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
                    Manifesto // Minimalist Lyrics Cleanse & Distraction-Free Immersion
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
                  The essence of a truly transcendent listening environment is restraint. In Fullscreen Now Playing mode, the visual experience should be purely about the artist, the artwork, and the lyrical poetry. Unnecessary branding chips, corporate logos, and telemetry pills only serve as visual static that pulls focus from the music.
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
                  Update 07 officially retires the &ldquo;Apple Kinetic Lyrics&rdquo; badge from the lyrics viewport. The lyrics header is stripped down to its essential ergonomics: a razor-thin, unobtrusive alignment selector ([RIGHT], [CENTER], [LEFT]) and the full lyrics sheet trigger. By eliminating top-line clutter, the listener enjoys uninterrupted vertical focus and pure typographic beauty.
                </p>
              </div>

              {/* Quick Launch Action Banner */}
              <div
                style={{
                  padding: '14px 18px',
                  background: 'rgba(234, 179, 8, 0.08)',
                  border: '1px solid rgba(234, 179, 8, 0.35)',
                  borderRadius: '3px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Sparkles size={16} color="#eab308" />
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11.5px', color: '#f4f4f5', fontWeight: 600 }}>
                    Experience Pure Distraction-Free Fullscreen Lyrics
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleLaunchFullscreen}
                  className="bma-btn bma-btn-primary"
                  style={{
                    padding: '6px 14px',
                    fontSize: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <Maximize2 size={12} />
                  <span>OPEN FULLSCREEN (F)</span>
                </button>
              </div>

              {/* SECTION: ARCHITECTURAL DETAILS */}
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
                      letterSpacing: '0.12em',
                      color: 'var(--text-primary)',
                      textTransform: 'uppercase',
                    }}
                  >
                    Engineering Specifications // The Cleanse
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
                  <div
                    style={{
                      padding: '12px 14px',
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '2px',
                    }}
                  >
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', fontWeight: 800, color: 'var(--accent-color)', marginBottom: '6px' }}>
                      [01] DECOMMISSIONED BRANDING PILL
                    </div>
                    <div style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', lineHeight: 1.5, color: 'var(--text-secondary)' }}>
                      Permanently excised the corporate Apple icon, neon status dot, and &ldquo;APPLE KINETIC LYRICS&rdquo; telemetry badge from the fullscreen stage.
                    </div>
                  </div>

                  <div
                    style={{
                      padding: '12px 14px',
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '2px',
                    }}
                  >
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', fontWeight: 800, color: 'var(--accent-color)', marginBottom: '6px' }}>
                      [02] UNCLUTTERED TOP BAR ERGONOMICS
                    </div>
                    <div style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', lineHeight: 1.5, color: 'var(--text-secondary)' }}>
                      The lyrics column header now cleanly pairs the ergonomic <code>[RIGHT] [LEFT] [CENTER]</code> placement pills with the <code>FULL LYRICS</code> modal button, preserving complete functionality with 0 visual fatigue.
                    </div>
                  </div>

                  <div
                    style={{
                      padding: '12px 14px',
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '2px',
                    }}
                  >
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', fontWeight: 800, color: 'var(--accent-color)', marginBottom: '6px' }}>
                      [03] EXPANDED VERTICAL HEADROOM
                    </div>
                    <div style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', lineHeight: 1.5, color: 'var(--text-secondary)' }}>
                      Eliminating the badge grants additional vertical breathing room to the lyrics viewport, ensuring the active vocal line maintains perfect optical centering during fast verse transitions.
                    </div>
                  </div>

                  <div
                    style={{
                      padding: '12px 14px',
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '2px',
                    }}
                  >
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', fontWeight: 800, color: 'var(--accent-color)', marginBottom: '6px' }}>
                      [04] HI-FI BRUTALIST ALIGNMENT
                    </div>
                    <div style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', lineHeight: 1.5, color: 'var(--text-secondary)' }}>
                      The overall fullscreen stage achieves pure aesthetic parity with professional audiophile software—focused strictly on high-resolution square sleeve art, master waveforms, and kinetic vocal sweeps.
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : activeVersionTab === 'v1.6.0' ? (
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
                  <Sparkles size={16} color="var(--accent-color)" />
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
                    Manifesto // High-Definition Square Artwork Engine & Optical Lyrics Placement
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
                  Update 06 addresses two paramount visual cornerstones of SHONO.FM: <strong>lossless high-definition 1:1 square sleeve presentation</strong> throughout the platform and <strong>ergonomically perfected optical placement for live lyrics</strong>.
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
                  YouTube 16:9 video thumbnails historically compromised playback with ugly pillarbox or letterbox black/brown bars. Update 06 introduces a client-side multi-tier artwork resolution pipeline querying Apple Music / iTunes Store master records (upgrading 100x100 previews to 1000x1000 studio squares), unmasking Genius CDN proxies, caching artwork locally for instantaneous loads, and applying automated 1.36x anti-pillarbox scaling for YouTube video fallbacks. Concurrently, Fullscreen Live Lyrics are re-anchored with generous right-aligned modern typography and an interactive alignment switcher ([RIGHT], [CENTER], [LEFT]).
                </p>
              </div>

              {/* Quick Launch Action Banner */}
              <div
                style={{
                  padding: '14px 18px',
                  background: 'rgba(234, 179, 8, 0.08)',
                  border: '1px solid rgba(234, 179, 8, 0.35)',
                  borderRadius: '3px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Sparkles size={16} color="#eab308" />
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11.5px', color: '#f4f4f5', fontWeight: 600 }}>
                    Inspect High-Definition Square Artworks & Right-Aligned Lyrics in Fullscreen Player
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleLaunchFullscreen}
                  className="bma-btn bma-btn-primary"
                  style={{
                    padding: '6px 14px',
                    fontSize: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <Maximize2 size={12} />
                  <span>LAUNCH FULLSCREEN (F)</span>
                </button>
              </div>

              {/* SECTION: ARCHITECTURAL DEEP-DIVE OF UPDATE 06 */}
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
                      letterSpacing: '0.12em',
                      color: 'var(--text-primary)',
                      textTransform: 'uppercase',
                    }}
                  >
                    Engineering Specifications // High-Definition Square Artwork Engine
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
                  <div
                    style={{
                      padding: '12px 14px',
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '2px',
                    }}
                  >
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', fontWeight: 800, color: 'var(--accent-color)', marginBottom: '6px' }}>
                      [01] APPLE MUSIC / ITUNES CATALOG PROBE
                    </div>
                    <div style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', lineHeight: 1.5, color: 'var(--text-secondary)' }}>
                      Cleans YouTube video titles (stripping noise like &ldquo;Official Music Video&rdquo;, &ldquo;4K&rdquo;, &ldquo;Lyrics&rdquo;, and &ldquo;feat.&rdquo;), queries iTunes Search API with open CORS, and transforms standard preview assets to 1000x1000 master studio sleeve covers.
                    </div>
                  </div>

                  <div
                    style={{
                      padding: '12px 14px',
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '2px',
                    }}
                  >
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', fontWeight: 800, color: 'var(--accent-color)', marginBottom: '6px' }}>
                      [02] GENIUS STUDIO ARTWORK RESOLVER
                    </div>
                    <div style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', lineHeight: 1.5, color: 'var(--text-secondary)' }}>
                      Supports Genius CDN URLs, unmasking nested <code>t2.genius.com/unsafe/...</code> proxy wrappers into pristine full-resolution 1000x1000 master images.
                    </div>
                  </div>

                  <div
                    style={{
                      padding: '12px 14px',
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '2px',
                    }}
                  >
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', fontWeight: 800, color: 'var(--accent-color)', marginBottom: '6px' }}>
                      [03] DUAL-TIER ZERO-LATENCY CACHING
                    </div>
                    <div style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', lineHeight: 1.5, color: 'var(--text-secondary)' }}>
                      In-memory LRU map coupled with persistent LocalStorage keys (<code>muszix_art_cache_*</code>). Artwork resolved once is retrieved instantaneously on subsequent playback without network round-trips.
                    </div>
                  </div>

                  <div
                    style={{
                      padding: '12px 14px',
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '2px',
                    }}
                  >
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', fontWeight: 800, color: 'var(--accent-color)', marginBottom: '6px' }}>
                      [04] ANTI-PILLARBOX CSS VIEWPORT
                    </div>
                    <div style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', lineHeight: 1.5, color: 'var(--text-secondary)' }}>
                      When tracks fallback to YouTube 16:9 thumbnails, an automated 1.36x zoom filter within an <code>overflow: hidden</code> 1:1 container precisely crops out letterbox/pillarbox borders, guaranteeing true edge-to-edge square presentation across all views.
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION: LYRICS OPTICAL PLACEMENT */}
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
                  <Sliders size={14} color="var(--accent-color)" />
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
                    Engineering Specifications // Lyrics Optical Placement & Typography
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
                  <div
                    style={{
                      padding: '12px 14px',
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '2px',
                    }}
                  >
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', fontWeight: 800, color: 'var(--accent-color)', marginBottom: '6px' }}>
                      [05] OPTICAL RIGHT-ALIGNED STAGING
                    </div>
                    <div style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', lineHeight: 1.5, color: 'var(--text-secondary)' }}>
                      Re-engineered Fullscreen Player grid with a balanced 42% sleeve / 58% lyrics split. Lyrics comfortably anchor to the right margin with dynamic responsive scaling (<code>clamp(28px, 3.2vw, 42px)</code>) eliminating dead whitespace.
                    </div>
                  </div>

                  <div
                    style={{
                      padding: '12px 14px',
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '2px',
                    }}
                  >
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', fontWeight: 800, color: 'var(--accent-color)', marginBottom: '6px' }}>
                      [06] TRI-STATE ALIGNMENT SELECTOR
                    </div>
                    <div style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', lineHeight: 1.5, color: 'var(--text-secondary)' }}>
                      Interactive switcher in the top lyrics header allows instant switching between <strong>RIGHT</strong> (modern streaming standard), <strong>CENTER</strong> (cinema stage mode), and <strong>LEFT</strong> (traditional typographic reading mode).
                    </div>
                  </div>

                  <div
                    style={{
                      padding: '12px 14px',
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '2px',
                    }}
                  >
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', fontWeight: 800, color: 'var(--accent-color)', marginBottom: '6px' }}>
                      [07] DIRECTIONAL KINETIC EXPANSIONS
                    </div>
                    <div style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', lineHeight: 1.5, color: 'var(--text-secondary)' }}>
                      Active lyric scale transforms adapt dynamically to the active alignment mode, anchoring transforms cleanly (<code>transform-origin: right center</code>) so text never drifts or stutters during karaoke transitions.
                    </div>
                  </div>

                  <div
                    style={{
                      padding: '12px 14px',
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '2px',
                    }}
                  >
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', fontWeight: 800, color: 'var(--accent-color)', marginBottom: '6px' }}>
                      [08] CUSTOM SLEEVE OVERRIDE IN TRACK DETAILS
                    </div>
                    <div style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', lineHeight: 1.5, color: 'var(--text-secondary)' }}>
                      Listeners can customize sleeve art directly via the Track Details modal by pasting any direct Genius, Apple Music, or Spotify high-definition cover image URL.
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : activeVersionTab === 'v1.5.0' ? (
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
                  <Sparkles size={16} color="var(--accent-color)" />
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
                    Manifesto // Apple-Grade Kinetic Blur Lyrics & Depth-of-Field Karaoke
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
                  Update 05 elevates SHONO.FM&rsquo;s Fullscreen Now Playing experience with Apple Music&rsquo;s
                  signature <strong>progressive Gaussian depth-of-field blur</strong> and fluid,
                  <strong> 60fps word-by-word kinetic karaoke sweeps</strong>. Rather than flat static lines of text,
                  the lyrics column becomes an alive, optical focal plane tuned to the vocalist&rsquo;s cadence.
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
                  Lines further from the singing vocalist progressively defocus into soft, Gaussian ambient clouds.
                  Hovering over any blurred line immediately pulls it into razor-sharp optical focus, allowing the listener
                  to effortlessly inspect previous or upcoming lyrics and seek immediately with a single click.
                </p>
              </div>

              {/* Quick Launch Action Banner */}
              <div
                style={{
                  padding: '14px 18px',
                  background: 'rgba(234, 179, 8, 0.08)',
                  border: '1px solid rgba(234, 179, 8, 0.35)',
                  borderRadius: '3px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Sparkles size={16} color="#eab308" />
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11.5px', color: '#f4f4f5', fontWeight: 600 }}>
                    Experience Apple-Grade Kinetic Blur Lyrics in Fullscreen Mode
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleLaunchFullscreen}
                  className="bma-btn bma-btn-primary"
                  style={{
                    padding: '6px 14px',
                    fontSize: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <Maximize2 size={12} />
                  <span>OPEN FULLSCREEN (F)</span>
                </button>
              </div>

              {/* SECTION: ARCHITECTURAL DEEP-DIVE OF UPDATE 05 */}
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
                      letterSpacing: '0.12em',
                      color: 'var(--text-primary)',
                      textTransform: 'uppercase',
                    }}
                  >
                    Engineering Specifications // Kinetic Blur & Syllable Sweeper
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
                  <div
                    style={{
                      padding: '12px 14px',
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '2px',
                    }}
                  >
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', fontWeight: 800, color: 'var(--accent-color)', marginBottom: '6px' }}>
                      [01] OPTICAL GAUSSIAN BLUR CURVE
                    </div>
                    <div style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', lineHeight: 1.5, color: 'var(--text-secondary)' }}>
                      Strict mathematical distance decay curve: Active line is crisp (0px blur, 100% opacity, 1.035x scale). Lines &plusmn;1 are softened (2.5px blur, 40% opacity). Lines &plusmn;2 defocus further (5.0px blur, 22% opacity), and lines &plusmn;3+ blend into peripheral background clouds (8.5px+ blur, 12% opacity).
                    </div>
                  </div>

                  <div
                    style={{
                      padding: '12px 14px',
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '2px',
                    }}
                  >
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', fontWeight: 800, color: 'var(--accent-color)', marginBottom: '6px' }}>
                      [02] 60FPS VOCAL SWEEP ENGINE
                    </div>
                    <div style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', lineHeight: 1.5, color: 'var(--text-secondary)' }}>
                      Active lyric line uses <code>requestAnimationFrame</code> sub-frame interpolation and <code>computeWordTimings</code>. Words transition with smooth CSS gradient text-clips (<code>--word-sweep</code>) from translucent white to glowing pure white in exact musical tempo.
                    </div>
                  </div>

                  <div
                    style={{
                      padding: '12px 14px',
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '2px',
                    }}
                  >
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', fontWeight: 800, color: 'var(--accent-color)', marginBottom: '6px' }}>
                      [03] OPTICAL FOCUS PEEK & SCRUB
                    </div>
                    <div style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', lineHeight: 1.5, color: 'var(--text-secondary)' }}>
                      Interactive hover state: Moving the cursor over any blurred inactive line immediately cancels the blur filter (<code>blur(0px)</code>) and raises opacity to 92%, giving the listener full legibility before clicking to jump audio playback.
                    </div>
                  </div>

                  <div
                    style={{
                      padding: '12px 14px',
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '2px',
                    }}
                  >
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', fontWeight: 800, color: 'var(--accent-color)', marginBottom: '6px' }}>
                      [04] DYNAMIC NOTE SWELL & BLOOM
                    </div>
                    <div style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', lineHeight: 1.5, color: 'var(--text-secondary)' }}>
                      Held notes and sustained words calculate acoustic pressure, applying a subtle breathing scale (up to 1.15x) and a radiant dual drop-shadow white bloom that smoothly resolves when the note ends.
                    </div>
                  </div>

                  <div
                    style={{
                      padding: '12px 14px',
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '2px',
                    }}
                  >
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', fontWeight: 800, color: 'var(--accent-color)', marginBottom: '6px' }}>
                      [05] MONOTONIC PROGRESS LOCKING
                    </div>
                    <div style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', lineHeight: 1.5, color: 'var(--text-secondary)' }}>
                      Prevents any jarring syllable flickering or backwards progress jumps caused by audio clock drift or YouTube iframe API time polling latency. Words stay locked at 100% white once sung.
                    </div>
                  </div>

                  <div
                    style={{
                      padding: '12px 14px',
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '2px',
                    }}
                  >
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', fontWeight: 800, color: 'var(--accent-color)', marginBottom: '6px' }}>
                      [06] SMART USER SCROLL DETECTOR
                    </div>
                    <div style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', lineHeight: 1.5, color: 'var(--text-secondary)' }}>
                      Manual user scrolling with mouse wheel or touch temporarily pauses auto-centering for 3.5 seconds, avoiding unwanted jumpiness while reading. It resumes vertical centering automatically once idle.
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : activeVersionTab === 'v1.4.0' ? (
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
                  <Maximize2 size={16} color="var(--accent-color)" />
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
                    Manifesto // The Cinematic Fullscreen Now Playing Experience
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
                  Update 04 introduces a dedicated, distraction-free <strong>Fullscreen Now Playing Mode</strong>.
                  Rather than viewing playback through compact utility sidebars, the listening experience expands
                  into an immersive, cinematic amphitheater.
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
                  Featuring heavily blurred ambient artwork backdrops, large square vinyl-inspired sleeves,
                  precision high-contrast audio controls, and an Apple Music-style live synchronized lyrics engine
                  with golden glowing active lines, click-to-seek timestamp navigation, and a dedicated acoustic visuals mode.
                </p>
              </div>

              {/* Quick Launch Action Banner */}
              <div
                style={{
                  padding: '14px 18px',
                  background: 'rgba(234, 179, 8, 0.08)',
                  border: '1px solid rgba(234, 179, 8, 0.35)',
                  borderRadius: '3px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Sparkles size={16} color="#eab308" />
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11.5px', color: '#f4f4f5', fontWeight: 600 }}>
                    Experience Fullscreen Now Playing with current playback
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleLaunchFullscreen}
                  className="bma-btn bma-btn-primary"
                  style={{
                    padding: '6px 14px',
                    fontSize: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <Maximize2 size={12} />
                  <span>OPEN FULLSCREEN (F)</span>
                </button>
              </div>

              {/* SECTION: DETAILED BREAKDOWN OF UPDATE 04 */}
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
                    UPDATE 04 ARCHITECTURAL SPECIFICATIONS
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {/* Item 1: Blurred Ambient Backdrop & Dark Vignette */}
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
                        <Tv size={14} color="var(--accent-color)" />
                        Blurred Ambient Artwork Refraction Canvas
                      </span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '8.5px', background: 'rgba(234, 179, 8, 0.15)', color: '#eab308', border: '1px solid rgba(234, 179, 8, 0.4)', padding: '2px 6px' }}>
                        CINEMATIC FX
                      </span>
                    </div>
                    <p style={{ fontFamily: 'var(--font-sans)', fontSize: '12.5px', lineHeight: '1.6', color: 'var(--text-secondary)', margin: 0 }}>
                      The entire viewport is enveloped in a magnified, 60px Gaussian-blurred version of the active track&apos;s album sleeve, overlaid with a multi-directional radial and linear dark vignette. Contrast remains pristine so lyrics and controls achieve 100% readability while generating luxurious ambient presence.
                    </p>
                  </div>

                  {/* Item 2: Live Synced Lyrics Engine */}
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
                        <Mic2 size={14} color="var(--accent-color)" />
                        Apple Music-Style Live Synced Lyrics
                      </span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '8.5px', background: 'rgba(34, 197, 94, 0.15)', color: '#22c55e', border: '1px solid rgba(34, 197, 94, 0.4)', padding: '2px 6px' }}>
                        LIVE STREAM
                      </span>
                    </div>
                    <p style={{ fontFamily: 'var(--font-sans)', fontSize: '12.5px', lineHeight: '1.6', color: 'var(--text-secondary)', margin: 0 }}>
                      The right side of the screen houses a live synchronized lyric stream. The currently active vocal line lights up in pure bright white with an illuminated golden yellow accent aura (`#eab308`), while upcoming and past lines rest in elegant dimmed transparency. Smooth auto-centering scrolling tracks playback in real-time, and clicking any line instantly seeks the song to that timestamp.
                    </p>
                  </div>

                  {/* Item 3: Honest "Lyrics Unavailable" State */}
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
                        <Terminal size={14} color="var(--accent-color)" />
                        Honest &ldquo;Lyrics Unavailable&rdquo; Fallback
                      </span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '8.5px', background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.4)', padding: '2px 6px' }}>
                        DATA INTEGRITY
                      </span>
                    </div>
                    <p style={{ fontFamily: 'var(--font-sans)', fontSize: '12.5px', lineHeight: '1.6', color: 'var(--text-secondary)', margin: 0 }}>
                      Adhering strictly to user requirements, when synchronized lyrics are unavailable for an audio stream, the player presents a minimal, honest &ldquo;Lyrics unavailable for this song&rdquo; interface. Zero fake or placeholder lyrics are ever displayed.
                    </p>
                  </div>

                  {/* Item 4: Telemetry Visuals Mode */}
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
                        Acoustic Visuals Telemetry Mode
                      </span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '8.5px', background: 'rgba(212, 175, 55, 0.15)', color: 'var(--accent-color)', border: '1px solid var(--border-bright)', padding: '2px 6px' }}>
                        AUDIO ENGINE
                      </span>
                    </div>
                    <p style={{ fontFamily: 'var(--font-sans)', fontSize: '12.5px', lineHeight: '1.6', color: 'var(--text-secondary)', margin: 0 }}>
                      Users can toggle between `[LYRICS]` and `[VISUALS]` using the top-right segmented pill controls. Visuals mode engages the real-time audio waveform canvas rendering 48kHz frequency spectrum fluctuations directly from the Web Audio analyser.
                    </p>
                  </div>

                  {/* Item 5: Ergonomics & Zero Disturbance */}
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
                        <Maximize2 size={14} color="var(--accent-color)" />
                        Keyboard Accessibility & Uninterrupted Pipeline
                      </span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '8.5px', background: 'rgba(34, 197, 94, 0.15)', color: '#22c55e', border: '1px solid rgba(34, 197, 94, 0.4)', padding: '2px 6px' }}>
                        ZERO LOSS
                      </span>
                    </div>
                    <p style={{ fontFamily: 'var(--font-sans)', fontSize: '12.5px', lineHeight: '1.6', color: 'var(--text-secondary)', margin: 0 }}>
                      The fullscreen player is accessed via the button in the SidePlayer header, bottom PersistentPlayer expand button, or by pressing `[F]`. Pressing `[ESC]` or `[F]` smoothly exits. Crucially, the underlying archive page, side player, queue, and YouTube audio pipeline continue running uninterrupted with zero state resets.
                    </p>
                  </div>
                </div>
              </div>
            </>
          ) : activeVersionTab === 'v1.3.0' ? (
            /* Update 03 Notes */
            <>
              <div
                style={{
                  padding: '16px 20px',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                }}
              >
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '6px' }}>
                  UPDATE 03 // QUANTUM INGESTION DOCK & HYPERGLOW (HISTORICAL ARCHIVE)
                </div>
                <p style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', lineHeight: '1.6', color: 'var(--text-secondary)', margin: 0 }}>
                  Redesigned the playlist ingestion console, eliminated the white-on-white button washout, added animated hyperglow feedback when a link is docked, and integrated a holographic radar scanner with celebratory Web Audio &ldquo;Voila!&rdquo; payoff.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ padding: '12px 16px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11.5px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
                    High-Contrast Button Visibility
                  </div>
                  <div style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', color: 'var(--text-secondary)' }}>
                    Illuminated solid accent backgrounds with dark bold text, resolving white-on-white text washout.
                  </div>
                </div>
                <div style={{ padding: '12px 16px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11.5px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
                    Reactive Ingestion HyperGlow
                  </div>
                  <div style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', color: 'var(--text-secondary)' }}>
                    Console envelope activates a pulsing 2.2s breathing neon aura and top hairline laser scanning beam when a URL is docked.
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
                  Permanently purged Apple Glass and replaced monochromatic color washes with 7 authentic Sound System hardware themes (German Hi-Fi Noir, Tokyo Studio Concrete, Dieter Rams Braun, Studer Tapedeck, Sony Trinitron Phosphor, Josef Müller-Brockmann Swiss Paper, and MI6 Bunker Stealth).
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
                    03 // BRAUN DIETER RAMS
                  </div>
                  <div style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', color: 'var(--text-secondary)' }}>
                    Warm anthracite (#121215), linen typography, and Rams safety orange switches.
                  </div>
                  <button type="button" onClick={() => handleQuickTheme('braun')} className="bma-btn" style={{ marginTop: '8px', padding: '3px 8px', fontSize: '9px' }}>
                    {theme === 'braun' ? 'Active' : 'Apply Braun'}
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
              Don&apos;t show again until Update 05
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
