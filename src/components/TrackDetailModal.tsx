import React, { useState } from 'react';
import { usePlayer } from '../context/PlayerContext';
import { useArtwork, setCustomTrackArtwork } from '../services/artworkService';
import { Play, Pause, X, Heart, ExternalLink, Image as ImageIcon, Check } from 'lucide-react';

export const TrackDetailModal: React.FC = () => {
  const {
    selectedTrackForDetail,
    openTrackDetail,
    currentTrack,
    playbackStatus,
    playTrack,
    togglePlayPause,
    likedTrackIds,
    toggleLike,
  } = usePlayer();

  if (!selectedTrackForDetail) return null;

  const { artworkUrl, isYouTube } = useArtwork(selectedTrackForDetail);
  const [customArtInput, setCustomArtInput] = useState('');
  const [isEditingArt, setIsEditingArt] = useState(false);
  const [artSaved, setArtSaved] = useState(false);

  const isCurrent = currentTrack?.id === selectedTrackForDetail.id;
  const isPlaying = isCurrent && playbackStatus === 'PLAYING';
  const isLiked = likedTrackIds.includes(selectedTrackForDetail.id);

  const handleSaveCustomArt = () => {
    if (!customArtInput.trim()) return;
    setCustomTrackArtwork(selectedTrackForDetail.id, customArtInput.trim());
    setArtSaved(true);
    setTimeout(() => {
      setArtSaved(false);
      setIsEditingArt(false);
      // Trigger reload of artwork
      window.location.reload();
    }, 800);
  };

  return (
    <div className="modal-backdrop" onClick={() => openTrackDetail(null)}>
      <div
        className="modal-card"
        onClick={(e) => e.stopPropagation()}
        style={{ padding: '0', overflow: 'hidden', maxWidth: '780px' }}
      >
        {/* Top bar */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '16px 24px',
            borderBottom: '1px solid var(--border-color)',
            background: 'var(--bg-secondary)',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '10px',
              letterSpacing: '0.14em',
              color: 'var(--text-secondary)',
            }}
          >
            CATALOGUE RECORD / TRACK #{selectedTrackForDetail.index.toString().padStart(3, '0')}
          </span>
          <button
            className="bma-btn-icon"
            onClick={() => openTrackDetail(null)}
            style={{ padding: '4px' }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Content Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1.15fr',
            background: 'var(--bg-primary)',
          }}
        >
          {/* Left: Artwork with Anti-Pillarbox Scaling & Custom URL Editor */}
          <div
            style={{
              borderRight: '1px solid var(--border-color)',
              background: '#09090b',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div
              className="square-artwork-container"
              style={{
                width: '100%',
                aspectRatio: '1 / 1',
                overflow: 'hidden',
                background: '#000',
              }}
            >
              <img
                src={artworkUrl || selectedTrackForDetail.thumbnail}
                alt={selectedTrackForDetail.title}
                className={`square-artwork-img ${isYouTube ? 'is-yt-fallback' : ''}`}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
            </div>

            {/* Custom Artwork / Genius URL Bar */}
            <div style={{ padding: '12px 14px', borderTop: '1px solid var(--border-subtle)', background: 'var(--bg-secondary)' }}>
              {!isEditingArt ? (
                <button
                  type="button"
                  onClick={() => setIsEditingArt(true)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    width: '100%',
                    background: 'transparent',
                    border: '1px dashed var(--border-bright)',
                    color: 'var(--text-muted)',
                    padding: '6px 10px',
                    borderRadius: '2px',
                    fontSize: '9.5px',
                    fontFamily: 'var(--font-mono)',
                    cursor: 'pointer',
                    justifyContent: 'center',
                  }}
                >
                  <ImageIcon size={12} />
                  <span>SET SQUARE ARTWORK (GENIUS / WEB)</span>
                </button>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <input
                    type="text"
                    placeholder="Paste Genius or image URL..."
                    value={customArtInput}
                    onChange={(e) => setCustomArtInput(e.target.value)}
                    style={{
                      padding: '6px 8px',
                      fontSize: '10px',
                      fontFamily: 'var(--font-mono)',
                      background: 'var(--bg-primary)',
                      border: '1px solid var(--border-bright)',
                      color: 'var(--text-primary)',
                      borderRadius: '2px',
                      outline: 'none',
                    }}
                  />
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      type="button"
                      onClick={handleSaveCustomArt}
                      className="bma-btn bma-btn-primary"
                      style={{ flex: 1, padding: '4px', fontSize: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                    >
                      {artSaved ? <Check size={11} /> : null}
                      <span>{artSaved ? 'SAVED' : 'SAVE ARTWORK'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditingArt(false)}
                      className="bma-btn"
                      style={{ padding: '4px 8px', fontSize: '9px' }}
                    >
                      CANCEL
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right: Brutalist Editorial Metadata */}
          <div
            style={{
              padding: '28px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '10px',
                  letterSpacing: '0.12em',
                  color: 'var(--text-muted)',
                  marginBottom: '6px',
                }}
              >
                {selectedTrackForDetail.artist}
              </div>

              <h2
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '36px',
                  lineHeight: 0.95,
                  letterSpacing: '0.04em',
                  color: 'var(--text-primary)',
                  marginBottom: '20px',
                }}
              >
                {selectedTrackForDetail.title}
              </h2>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '14px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '10px',
                  paddingTop: '16px',
                  borderTop: '1px solid var(--border-subtle)',
                }}
              >
                <div>
                  <div style={{ color: 'var(--text-muted)', marginBottom: '2px' }}>ALBUM</div>
                  <div style={{ color: 'var(--text-primary)' }}>{selectedTrackForDetail.album}</div>
                </div>
                <div>
                  <div style={{ color: 'var(--text-muted)', marginBottom: '2px' }}>YEAR</div>
                  <div style={{ color: 'var(--text-primary)' }}>{selectedTrackForDetail.year}</div>
                </div>
                <div>
                  <div style={{ color: 'var(--text-muted)', marginBottom: '2px' }}>DURATION</div>
                  <div style={{ color: 'var(--text-primary)' }}>{selectedTrackForDetail.durationFormatted}</div>
                </div>
                <div>
                  <div style={{ color: 'var(--text-muted)', marginBottom: '2px' }}>GENRE</div>
                  <div style={{ color: 'var(--text-primary)' }}>{selectedTrackForDetail.genre || 'Archive'}</div>
                </div>
                {selectedTrackForDetail.bpm && (
                  <div>
                    <div style={{ color: 'var(--text-muted)', marginBottom: '2px' }}>TEMPO</div>
                    <div style={{ color: 'var(--text-primary)' }}>{selectedTrackForDetail.bpm} BPM</div>
                  </div>
                )}
                {selectedTrackForDetail.key && (
                  <div>
                    <div style={{ color: 'var(--text-muted)', marginBottom: '2px' }}>KEY</div>
                    <div style={{ color: 'var(--text-primary)' }}>{selectedTrackForDetail.key}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div
              style={{
                display: 'flex',
                gap: '12px',
                marginTop: '24px',
                paddingTop: '16px',
                borderTop: '1px solid var(--border-color)',
              }}
            >
              <button
                className="bma-btn bma-btn-primary"
                onClick={() => {
                  if (isCurrent) {
                    togglePlayPause();
                  } else {
                    playTrack(selectedTrackForDetail);
                  }
                }}
                style={{ flex: 1, padding: '10px 16px' }}
              >
                {isPlaying ? (
                  <>
                    <Pause size={14} style={{ marginRight: '8px' }} /> PAUSE
                  </>
                ) : (
                  <>
                    <Play size={14} style={{ marginRight: '8px' }} fill="currentColor" /> PLAY TRACK
                  </>
                )}
              </button>

              <button
                className="bma-btn"
                onClick={() => toggleLike(selectedTrackForDetail.id)}
                style={{ padding: '10px 14px' }}
                title="Favourite"
              >
                <Heart
                  size={14}
                  fill={isLiked ? 'var(--status-live)' : 'none'}
                  color={isLiked ? 'var(--status-live)' : 'currentColor'}
                />
              </button>

              {selectedTrackForDetail.youtubeId && (
                <a
                  href={`https://www.youtube.com/watch?v=${selectedTrackForDetail.youtubeId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bma-btn"
                  style={{ padding: '10px 14px', textDecoration: 'none' }}
                  title="Open source on YouTube"
                >
                  <ExternalLink size={14} />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
