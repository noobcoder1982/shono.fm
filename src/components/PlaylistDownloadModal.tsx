import React, { useState, useEffect, useRef } from 'react';
import { usePlayer } from '../context/PlayerContext';
import {
  exportArchiveToZip,
  triggerBlobDownload,
  DEFAULT_ZIP_OPTIONS,
  type ZipOptions,
  type ZipProgress,
} from '../services/archiveZipService';
import {
  Download,
  FolderArchive,
  CheckCircle2,
  AlertCircle,
  X,
  FileCode,
  Image as ImageIcon,
  Music,
  FileText,
  Terminal,
  Layers,
} from 'lucide-react';
import gsap from 'gsap';

export const PlaylistDownloadModal: React.FC = () => {
  const { isZipModalOpen, closeZipModal, archiveToExport, activeArchive } = usePlayer();
  const modalRef = useRef<HTMLDivElement>(null);
  const targetArchive = archiveToExport || activeArchive;

  const [options, setOptions] = useState<ZipOptions>(DEFAULT_ZIP_OPTIONS);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<ZipProgress | null>(null);
  const [generatedBlob, setGeneratedBlob] = useState<Blob | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isZipModalOpen && !isProcessing) {
        closeZipModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isZipModalOpen, isProcessing, closeZipModal]);

  // Entrance animation
  useEffect(() => {
    if (isZipModalOpen && modalRef.current) {
      gsap.fromTo(
        modalRef.current,
        { opacity: 0, scale: 0.96, y: 12 },
        { opacity: 1, scale: 1, y: 0, duration: 0.28, ease: 'power3.out' }
      );
      // Reset state on open
      setProgress(null);
      setGeneratedBlob(null);
      setErrorMessage(null);
      setIsProcessing(false);
    }
  }, [isZipModalOpen]);

  if (!isZipModalOpen || !targetArchive) return null;

  const totalTracks = targetArchive.tracks?.length || 0;
  const totalDurationSecs = (targetArchive.tracks || []).reduce((acc, t) => acc + (t.duration || 0), 0);
  const hours = Math.floor(totalDurationSecs / 3600);
  const minutes = Math.floor((totalDurationSecs % 3600) / 60);
  const timeFormatted = hours > 0 ? `${hours}h ${minutes}m` : `${minutes} min`;

  const handleStartExport = async () => {
    setIsProcessing(true);
    setErrorMessage(null);
    setProgress({
      step: 'INIT',
      current: 0,
      total: totalTracks,
      percent: 2,
      message: 'Preparing local ZIP packaging pipeline...',
    });

    try {
      const blob = await exportArchiveToZip(targetArchive, options, (p) => {
        setProgress(p);
      });

      setGeneratedBlob(blob);
      const safeTitle = (targetArchive.title || 'Playlist')
        .replace(/[<>:"/\\|?*\x00-\x1F]/g, '_')
        .trim();
      const filename = `${safeTitle}_SHONO_VAULT_ARCHIVE.zip`;

      // Trigger instant browser download
      triggerBlobDownload(blob, filename);
    } catch (err: any) {
      setErrorMessage(err.message || 'FAILED TO COMPILE ZIP ARCHIVE');
      setProgress(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadAgain = () => {
    if (generatedBlob) {
      const safeTitle = (targetArchive.title || 'Playlist')
        .replace(/[<>:"/\\|?*\x00-\x1F]/g, '_')
        .trim();
      triggerBlobDownload(generatedBlob, `${safeTitle}_SHONO_VAULT_ARCHIVE.zip`);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(4, 4, 6, 0.82)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !isProcessing) {
          closeZipModal();
        }
      }}
    >
      <div
        ref={modalRef}
        style={{
          width: '100%',
          maxWidth: '580px',
          background: 'var(--bg-primary)',
          border: '1px solid var(--border-color)',
          boxShadow: '0 24px 80px rgba(0, 0, 0, 0.75), 0 0 30px var(--accent-subtle)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* Top Header Bar */}
        <div
          style={{
            padding: '14px 20px',
            borderBottom: '1px solid var(--border-color)',
            background: 'var(--bg-secondary)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FolderArchive size={16} style={{ color: 'var(--accent-color)' }} />
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '10px',
                fontWeight: 700,
                letterSpacing: '0.12em',
                color: 'var(--text-primary)',
              }}
            >
              ARCHIVE DOSSIER EXPORTER // v1.9.0
            </span>
          </div>

          <button
            onClick={() => !isProcessing && closeZipModal()}
            disabled={isProcessing}
            style={{
              background: 'transparent',
              border: 'none',
              color: isProcessing ? 'var(--text-muted)' : 'var(--text-secondary)',
              cursor: isProcessing ? 'not-allowed' : 'pointer',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
              lineHeight: 1,
            }}
            title="Close Exporter"
          >
            <X size={15} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '22px 24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Target Playlist Banner */}
          <div
            style={{
              padding: '14px 16px',
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '16px',
            }}
          >
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '8.5px',
                  color: 'var(--accent-color)',
                  letterSpacing: '0.14em',
                  marginBottom: '3px',
                }}
              >
                TARGET PLAYLIST REPOSITORY
              </div>
              <h3
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '19px',
                  lineHeight: 1.1,
                  margin: 0,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  color: 'var(--text-primary)',
                }}
              >
                {targetArchive.title}
              </h3>
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '9px',
                  color: 'var(--text-secondary)',
                  marginTop: '4px',
                }}
              >
                {totalTracks} Tracks &bull; {timeFormatted} &bull; {targetArchive.source === 'youtube' ? 'YouTube Playlist' : 'Vault Catalog'}
              </div>
            </div>

            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                padding: '6px 12px',
                background: 'var(--bg-primary)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-secondary)',
                flexShrink: 0,
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '7.5px', color: 'var(--text-muted)' }}>FORMAT</div>
              <strong>.ZIP ARCHIVE</strong>
            </div>
          </div>

          {/* Package Composition Selector */}
          <div>
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '9px',
                letterSpacing: '0.12em',
                color: 'var(--text-muted)',
                marginBottom: '10px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Layers size={11} />
              <span>PACKAGE ASSETS TO INCLUDE IN ZIP</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
              {/* Option 1: 1000x1000 Studio Covers */}
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '9px 12px',
                  background: options.includeCovers ? 'var(--bg-secondary)' : 'transparent',
                  border: `1px solid ${options.includeCovers ? 'var(--border-bright)' : 'var(--border-subtle)'}`,
                  cursor: isProcessing ? 'not-allowed' : 'pointer',
                  userSelect: 'none',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <ImageIcon size={13} style={{ color: 'var(--accent-color)' }} />
                  <div>
                    <div style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', fontWeight: 600, color: 'var(--text-primary)' }}>
                      Lossless 1000x1000 Studio Album Artwork
                    </div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '8.5px', color: 'var(--text-muted)' }}>
                      covers/*.jpg &bull; Square studio artwork fetched per track
                    </div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={options.includeCovers}
                  disabled={isProcessing}
                  onChange={(e) => setOptions({ ...options, includeCovers: e.target.checked })}
                  style={{ accentColor: 'var(--accent-color)', cursor: 'pointer' }}
                />
              </label>

              {/* Option 2: Synced LRC Lyrics */}
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '9px 12px',
                  background: options.includeLyrics ? 'var(--bg-secondary)' : 'transparent',
                  border: `1px solid ${options.includeLyrics ? 'var(--border-bright)' : 'var(--border-subtle)'}`,
                  cursor: isProcessing ? 'not-allowed' : 'pointer',
                  userSelect: 'none',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Music size={13} style={{ color: 'var(--accent-color)' }} />
                  <div>
                    <div style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', fontWeight: 600, color: 'var(--text-primary)' }}>
                      Synchronized Karaoke Lyrics (.lrc)
                    </div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '8.5px', color: 'var(--text-muted)' }}>
                      lyrics/*.lrc &bull; Timestamped for Apple Music, Walkmans & VLC
                    </div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={options.includeLyrics}
                  disabled={isProcessing}
                  onChange={(e) => setOptions({ ...options, includeLyrics: e.target.checked })}
                  style={{ accentColor: 'var(--accent-color)', cursor: 'pointer' }}
                />
              </label>

              {/* Option 3: Universal M3U8 Playlist */}
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '9px 12px',
                  background: options.includeM3U8 ? 'var(--bg-secondary)' : 'transparent',
                  border: `1px solid ${options.includeM3U8 ? 'var(--border-bright)' : 'var(--border-subtle)'}`,
                  cursor: isProcessing ? 'not-allowed' : 'pointer',
                  userSelect: 'none',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <FileCode size={13} style={{ color: 'var(--accent-color)' }} />
                  <div>
                    <div style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', fontWeight: 600, color: 'var(--text-primary)' }}>
                      Universal Playlist File (playlist.m3u8)
                    </div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '8.5px', color: 'var(--text-muted)' }}>
                      Standard M3U8 format for direct playback in VLC & players
                    </div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={options.includeM3U8}
                  disabled={isProcessing}
                  onChange={(e) => setOptions({ ...options, includeM3U8: e.target.checked })}
                  style={{ accentColor: 'var(--accent-color)', cursor: 'pointer' }}
                />
              </label>

              {/* Option 4: Full JSON Dossier */}
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '9px 12px',
                  background: options.includeJsonDossier ? 'var(--bg-secondary)' : 'transparent',
                  border: `1px solid ${options.includeJsonDossier ? 'var(--border-bright)' : 'var(--border-subtle)'}`,
                  cursor: isProcessing ? 'not-allowed' : 'pointer',
                  userSelect: 'none',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <FileText size={13} style={{ color: 'var(--accent-color)' }} />
                  <div>
                    <div style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', fontWeight: 600, color: 'var(--text-primary)' }}>
                      Structured Metadata Dossier (playlist.json)
                    </div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '8.5px', color: 'var(--text-muted)' }}>
                      Complete JSON file with stream tokens, IDs, and artists
                    </div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={options.includeJsonDossier}
                  disabled={isProcessing}
                  onChange={(e) => setOptions({ ...options, includeJsonDossier: e.target.checked })}
                  style={{ accentColor: 'var(--accent-color)', cursor: 'pointer' }}
                />
              </label>

              {/* Option 5: 1-Click yt-dlp Audio Downloader Scripts */}
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '9px 12px',
                  background: options.includeDownloaderScripts ? 'var(--bg-secondary)' : 'transparent',
                  border: `1px solid ${options.includeDownloaderScripts ? 'var(--border-bright)' : 'var(--border-subtle)'}`,
                  cursor: isProcessing ? 'not-allowed' : 'pointer',
                  userSelect: 'none',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Terminal size={13} style={{ color: 'var(--accent-color)' }} />
                  <div>
                    <div style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', fontWeight: 600, color: 'var(--text-primary)' }}>
                      1-Click yt-dlp Downloader Scripts (.bat & .sh)
                    </div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '8.5px', color: 'var(--text-muted)' }}>
                      Automated 1-click batch script to grab all MP3s locally via yt-dlp
                    </div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={options.includeDownloaderScripts}
                  disabled={isProcessing}
                  onChange={(e) => setOptions({ ...options, includeDownloaderScripts: e.target.checked })}
                  style={{ accentColor: 'var(--accent-color)', cursor: 'pointer' }}
                />
              </label>
            </div>
          </div>

          {/* Telemetry / Live Progress Bar */}
          {progress && (
            <div
              style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                padding: '14px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {progress.step === 'DONE' ? (
                    <CheckCircle2 size={14} style={{ color: 'var(--status-active)' }} />
                  ) : (
                    <div
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: 'var(--accent-color)',
                        boxShadow: '0 0 8px var(--accent-color)',
                        animation: 'pulse 1.2s infinite',
                      }}
                    />
                  )}
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '9.5px',
                      fontWeight: 700,
                      letterSpacing: '0.08em',
                      color: progress.step === 'DONE' ? 'var(--status-active)' : 'var(--text-primary)',
                    }}
                  >
                    {progress.step === 'DONE' ? 'ARCHIVE COMPILED SUCCESSFULLY' : `STATUS // ${progress.step}`}
                  </span>
                </div>

                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '11px',
                    fontWeight: 700,
                    color: 'var(--accent-color)',
                  }}
                >
                  {progress.percent}%
                </span>
              </div>

              {/* Progress Bar Track */}
              <div
                style={{
                  width: '100%',
                  height: '6px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: `${progress.percent}%`,
                    height: '100%',
                    background: progress.step === 'DONE' ? 'var(--status-active)' : 'var(--accent-color)',
                    boxShadow: progress.step === 'DONE' ? '0 0 12px var(--status-active)' : '0 0 12px var(--accent-color)',
                    transition: 'width 0.2s ease',
                  }}
                />
              </div>

              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '8.5px',
                  color: 'var(--text-secondary)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {progress.message}
                </span>
                {progress.bytesFormatted && (
                  <span style={{ color: 'var(--text-primary)', fontWeight: 600, marginLeft: '8px' }}>
                    {progress.bytesFormatted}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div
              style={{
                padding: '10px 14px',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid var(--status-live)',
                color: 'var(--status-live)',
                fontFamily: 'var(--font-mono)',
                fontSize: '9.5px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <AlertCircle size={14} />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Actions Bottom Row */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              alignItems: 'center',
              gap: '10px',
              paddingTop: '6px',
              borderTop: '1px solid var(--border-subtle)',
            }}
          >
            <button
              type="button"
              onClick={closeZipModal}
              disabled={isProcessing}
              className="bma-btn"
              style={{
                padding: '8px 16px',
                fontSize: '10px',
                color: 'var(--text-secondary)',
                opacity: isProcessing ? 0.5 : 1,
              }}
            >
              {generatedBlob ? 'CLOSE' : 'CANCEL'}
            </button>

            {generatedBlob ? (
              <button
                type="button"
                onClick={handleDownloadAgain}
                className="bma-btn"
                style={{
                  padding: '8px 18px',
                  fontSize: '10px',
                  background: 'var(--accent-color)',
                  color: 'var(--text-inverse)',
                  borderColor: 'var(--accent-color)',
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 0 16px var(--accent-glow)',
                }}
              >
                <Download size={13} /> DOWNLOAD ARCHIVE AGAIN (.ZIP)
              </button>
            ) : (
              <button
                type="button"
                onClick={handleStartExport}
                disabled={isProcessing || totalTracks === 0}
                className="bma-btn"
                style={{
                  padding: '9px 20px',
                  fontSize: '10.5px',
                  background: isProcessing ? 'var(--bg-tertiary)' : 'var(--accent-color)',
                  color: isProcessing ? 'var(--text-muted)' : 'var(--text-inverse)',
                  borderColor: isProcessing ? 'var(--border-color)' : 'var(--accent-color)',
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '7px',
                  cursor: isProcessing || totalTracks === 0 ? 'not-allowed' : 'pointer',
                  boxShadow: isProcessing ? 'none' : '0 0 18px var(--accent-glow)',
                  letterSpacing: '0.06em',
                }}
              >
                {isProcessing ? (
                  <>
                    <div
                      style={{
                        width: '10px',
                        height: '10px',
                        border: '2px solid var(--text-muted)',
                        borderTopColor: 'transparent',
                        borderRadius: '50%',
                        animation: 'spin 0.8s linear infinite',
                      }}
                    />
                    <span>PACKAGING DOSSIER ({progress?.percent || 0}%)...</span>
                  </>
                ) : (
                  <>
                    <Download size={13} />
                    <span>START ZIP EXPORT</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
