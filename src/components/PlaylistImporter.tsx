import React, { useState, useEffect } from 'react';
import { usePlayer } from '../context/PlayerContext';
import type { Archive } from '../types';
import {
  DownloadCloud,
  Download,
  Sparkles,
  Clipboard,
  X,
  Radio,
  CheckCircle2,
  AlertCircle,
  Play,
  Zap,
} from 'lucide-react';

// Web Audio API synthesized magical chime for "Voila!" celebration
const playVoilaChime = () => {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;
    // Ascending major chord chime (C5: 523Hz -> E5: 659Hz -> G5: 784Hz -> C6: 1046Hz)
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);

      gain.gain.setValueAtTime(0, now + idx * 0.08);
      gain.gain.linearRampToValueAtTime(0.16, now + idx * 0.08 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + 0.55);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.6);
    });
  } catch {
    // AudioContext blocked or not supported
  }
};

const SAMPLE_PLAYLIST = 'https://www.youtube.com/playlist?list=PL4fGSI1pDJn6jXS_PEoNEDb428264';

export const PlaylistImporter: React.FC = () => {
  const [url, setUrl] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showVoila, setShowVoila] = useState(false);
  const [ingestedTitle, setIngestedTitle] = useState<string>('');
  const [ingestedCount, setIngestedCount] = useState<number>(0);
  const [lastIngestedArchive, setLastIngestedArchive] = useState<Archive | null>(null);

  const {
    importPlaylist,
    isImporting,
    importProgressText,
    importProgressPercent,
    openZipModal,
  } = usePlayer();

  const hasLink = url.trim().length > 0;
  const isYouTubePlaylist = /list=([a-zA-Z0-9_-]+)/.test(url);

  // Trigger celebration when import hits 100%
  useEffect(() => {
    if (isImporting && importProgressPercent === 100) {
      playVoilaChime();
      setShowVoila(true);
      const timer = setTimeout(() => {
        setShowVoila(false);
      }, 7000);
      return () => clearTimeout(timer);
    }
  }, [isImporting, importProgressPercent]);

  const handleImport = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!url.trim()) {
      setErrorMessage('INPUT REQUIRED: PASTE A YOUTUBE OR YOUTUBE MUSIC PLAYLIST LINK');
      return;
    }
    setErrorMessage(null);

    try {
      const importedArchive = await importPlaylist(url);
      setLastIngestedArchive(importedArchive);
      setIngestedTitle(importedArchive.title);
      setIngestedCount(importedArchive.tracks.length);
      setUrl('');
      setShowVoila(true);
      playVoilaChime();
      setTimeout(() => setShowVoila(false), 9000);
    } catch (err: any) {
      setErrorMessage(err.message || 'INGESTION ERROR: UNABLE TO PARSE PLAYLIST');
    }
  };

  const handlePaste = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (text && text.trim()) {
          setUrl(text.trim());
          setErrorMessage(null);
        }
      }
    } catch {
      // Clipboard access denied
    }
  };

  const handleLoadSample = () => {
    setUrl(SAMPLE_PLAYLIST);
    setErrorMessage(null);
  };

  return (
    <section
      style={{
        padding: '16px 26px 14px 26px',
        borderBottom: '1px solid var(--border-color)',
        position: 'relative',
        background: 'var(--bg-primary)',
        flexShrink: 0,
      }}
    >
      {/* Top Header Row */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '10px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '22px',
              lineHeight: 1,
              letterSpacing: '0.04em',
              fontWeight: 800,
              color: 'var(--text-primary)',
              margin: 0,
              textTransform: 'uppercase',
            }}
          >
            SHONO ARCHIVE
          </h1>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '9px',
              fontWeight: 700,
              color: 'var(--accent-color)',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-subtle)',
              padding: '2px 7px',
              borderRadius: '2px',
              letterSpacing: '0.08em',
            }}
          >
            INGESTION DOCK // 03
          </span>
        </div>

        {/* Quick Helper Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            type="button"
            onClick={handleLoadSample}
            className="chrome-tab-rail-btn"
            style={{
              fontSize: '8.5px',
              padding: '3px 8px',
              borderColor: 'var(--border-subtle)',
            }}
            title="Load popular demo playlist link into console"
          >
            <Play size={10} />
            <span>LOAD DEMO</span>
          </button>

          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '8.5px',
              color: 'var(--text-muted)',
              letterSpacing: '0.06em',
            }}
          >
            YT &bull; YT MUSIC
          </span>
        </div>
      </div>

      {/* Main Ingestion Console Bar */}
      <div className={`ingestion-console ${hasLink ? 'has-link' : ''}`}>
        {/* Animated Hairline Scanner Beam (Active when URL is docked or importing) */}
        {(hasLink || isImporting) && (
          <div className="ingestion-beam-bar">
            <div className="ingestion-beam-glow" />
          </div>
        )}

        <form
          onSubmit={handleImport}
          style={{
            display: 'flex',
            alignItems: 'center',
            width: '100%',
            position: 'relative',
          }}
        >
          {/* Left Radio/Connection Indicator Icon */}
          <div
            style={{
              paddingLeft: '14px',
              paddingRight: '6px',
              display: 'flex',
              alignItems: 'center',
              color: hasLink ? 'var(--accent-color)' : 'var(--text-muted)',
              transition: 'color 0.2s ease',
            }}
          >
            {hasLink ? (
              <Zap size={15} color="var(--accent-color)" />
            ) : (
              <Radio size={15} />
            )}
          </div>

          {/* Primary Input Field */}
          <input
            type="text"
            className="ingestion-input"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              if (errorMessage) setErrorMessage(null);
            }}
            placeholder="Paste YouTube or YouTube Music playlist link (e.g. https://www.youtube.com/playlist?list=...)"
            disabled={isImporting}
            spellCheck={false}
            autoComplete="off"
          />

          {/* Inline Quick Action: Clear Input or Paste from Clipboard */}
          {hasLink ? (
            <button
              type="button"
              onClick={() => setUrl('')}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: '8px 10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'color 0.15s ease',
              }}
              title="Clear input"
            >
              <X size={15} />
            </button>
          ) : (
            <button
              type="button"
              onClick={handlePaste}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '3px',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                padding: '4px 8px',
                marginRight: '8px',
                fontFamily: 'var(--font-mono)',
                fontSize: '9px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                transition: 'all 0.15s ease',
              }}
              title="Paste URL from clipboard"
            >
              <Clipboard size={11} />
              <span>PASTE</span>
            </button>
          )}

          {/* REDESIGNED HIGH-CONTRAST IMPORT BUTTON */}
          <button
            type="submit"
            className={`ingestion-btn ${hasLink ? 'is-ready' : 'is-dormant'}`}
            disabled={isImporting}
            title="Ingest playlist into local vault"
          >
            {isImporting ? (
              <>
                <DownloadCloud size={15} className="animate-spin" />
                <span>INGESTING...</span>
              </>
            ) : hasLink ? (
              <>
                <Sparkles size={15} />
                <span>IMPORT PLAYLIST →</span>
              </>
            ) : (
              <>
                <DownloadCloud size={14} />
                <span>IMPORT →</span>
              </>
            )}
          </button>
        </form>

        {/* MAGICAL INGESTION OVERLAY (Active during import) */}
        {isImporting && (
          <div className="ingestion-magical-overlay">
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
              {/* Holographic Radar Scanner */}
              <div className="ingestion-radar-widget">
                <div className="ingestion-radar-ring-outer" />
                <div className="ingestion-radar-ring-inner" />
                <div className="ingestion-radar-core" />
              </div>

              {/* Live Technical Pipeline Status */}
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '6px',
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '11px',
                      fontWeight: 800,
                      letterSpacing: '0.08em',
                      color: 'var(--text-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <span
                      style={{
                        width: '7px',
                        height: '7px',
                        borderRadius: '50%',
                        background: 'var(--status-active)',
                        display: 'inline-block',
                      }}
                    />
                    {importProgressText || 'QUANTUM INGESTION ACTIVE'}
                  </span>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '12px',
                      fontWeight: 800,
                      color: 'var(--accent-color)',
                      letterSpacing: '0.04em',
                    }}
                  >
                    {importProgressPercent}%
                  </span>
                </div>

                {/* Shimmering Progress Bar */}
                <div
                  style={{
                    width: '100%',
                    height: '4px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '2px',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      width: `${importProgressPercent}%`,
                      height: '100%',
                      background: 'var(--accent-color)',
                      boxShadow: '0 0 12px var(--accent-color)',
                      transition: 'width 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
                    }}
                  />
                </div>
              </div>
            </div>

            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '9px',
                color: 'var(--text-muted)',
                letterSpacing: '0.08em',
              }}
            >
              STREAM PIPELINE &bull; PCM AUDIO METADATA
            </span>
          </div>
        )}

        {/* MAGICAL VOILA CELEBRATION BANNER */}
        {showVoila && (
          <div className="ingestion-magical-overlay" style={{ background: 'rgba(8, 8, 11, 0.98)' }}>
            {/* Ambient Sparkle Particles */}
            <span className="sparkle-particle" style={{ left: '15%', top: '20%', ['--tx' as any]: '-20px', ['--ty' as any]: '-30px' }}>✦</span>
            <span className="sparkle-particle" style={{ left: '35%', top: '70%', ['--tx' as any]: '25px', ['--ty' as any]: '-25px' }}>★</span>
            <span className="sparkle-particle" style={{ left: '60%', top: '15%', ['--tx' as any]: '-15px', ['--ty' as any]: '-35px' }}>✧</span>
            <span className="sparkle-particle" style={{ left: '80%', top: '65%', ['--tx' as any]: '20px', ['--ty' as any]: '-20px' }}>✦</span>

            <div className="ingestion-voila-banner">
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: 'rgba(34, 197, 94, 0.15)',
                  border: '1.5px solid var(--status-active)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--status-active)',
                  flexShrink: 0,
                  boxShadow: '0 0 20px rgba(34, 197, 94, 0.4)',
                }}
              >
                <CheckCircle2 size={20} />
              </div>

              <div>
                <div
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '15px',
                    fontWeight: 800,
                    letterSpacing: '0.06em',
                    color: 'var(--text-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <span>VOILA!</span>
                  <span style={{ color: 'var(--accent-color)' }}>
                    {ingestedTitle ? `"${ingestedTitle.toUpperCase()}" INGESTED` : 'PLAYLIST LOADED INTO VAULT'}
                  </span>
                </div>
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '9.5px',
                    color: 'var(--text-secondary)',
                    letterSpacing: '0.04em',
                    marginTop: '2px',
                  }}
                >
                  {ingestedCount > 0 ? `${ingestedCount} tracks ready` : 'Catalog ready'} &bull; Engaging audio playback session
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                type="button"
                onClick={() => {
                  if (lastIngestedArchive) {
                    openZipModal(lastIngestedArchive);
                  } else {
                    openZipModal();
                  }
                }}
                className="bma-btn"
                style={{
                  padding: '5px 12px',
                  fontSize: '9.5px',
                  background: 'var(--accent-color)',
                  color: 'var(--text-inverse)',
                  borderColor: 'var(--accent-color)',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  boxShadow: '0 0 14px var(--accent-glow)',
                }}
                title="Download entire playlist archive as .ZIP"
              >
                <Download size={11} />
                <span>DOWNLOAD ZIP</span>
              </button>

              <button
                type="button"
                onClick={() => setShowVoila(false)}
                className="bma-btn"
                style={{
                  padding: '5px 12px',
                  fontSize: '9.5px',
                  borderColor: 'var(--border-bright)',
                  color: 'var(--text-secondary)',
                }}
              >
                DISMISS
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Reactive Link Status Indicator Strip */}
      {hasLink && !isImporting && !showVoila && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: '7px',
            padding: '0 4px',
            animation: 'modalCardFadeIn 0.18s ease-out forwards',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: isYouTubePlaylist ? 'var(--status-active)' : 'var(--status-buffering)',
                boxShadow: isYouTubePlaylist ? '0 0 8px var(--status-active)' : 'none',
                display: 'inline-block',
              }}
            />
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '9.5px',
                fontWeight: 600,
                color: isYouTubePlaylist ? 'var(--text-primary)' : 'var(--text-secondary)',
                letterSpacing: '0.04em',
              }}
            >
              {isYouTubePlaylist
                ? 'QUANTUM INGESTION DOCKED // YOUTUBE PLAYLIST IDENTIFIED'
                : 'LINK DETECTED // READY FOR PARSING'}
            </span>
          </div>

          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '9px',
              color: 'var(--text-muted)',
              letterSpacing: '0.04em',
            }}
          >
            Press [ENTER] or click [IMPORT PLAYLIST →]
          </span>
        </div>
      )}

      {/* Error readout */}
      {errorMessage && (
        <div
          style={{
            marginTop: '10px',
            padding: '8px 14px',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            background: 'rgba(239, 68, 68, 0.1)',
            color: '#fca5a5',
            fontFamily: 'var(--font-mono)',
            fontSize: '10.5px',
            letterSpacing: '0.04em',
            borderRadius: '4px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={14} color="#ef4444" />
            <span>{errorMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            style={{
              background: 'none',
              border: 'none',
              color: '#fca5a5',
              cursor: 'pointer',
              fontFamily: 'var(--font-mono)',
              fontSize: '10px',
              fontWeight: 700,
            }}
          >
            [DISMISS]
          </button>
        </div>
      )}
    </section>
  );
};
