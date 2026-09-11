import React from 'react';
import { usePlayer } from '../context/PlayerContext';
import { Play, Pause, X, Heart, ExternalLink } from 'lucide-react';

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

  const isCurrent = currentTrack?.id === selectedTrackForDetail.id;
  const isPlaying = isCurrent && playbackStatus === 'PLAYING';
  const isLiked = likedTrackIds.includes(selectedTrackForDetail.id);

  return (
    <div className="modal-backdrop" onClick={() => openTrackDetail(null)}>
      <div
        className="modal-card"
        onClick={(e) => e.stopPropagation()}
        style={{ padding: '0', overflow: 'hidden' }}
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
            gridTemplateColumns: '1fr 1fr',
            background: 'var(--bg-primary)',
          }}
        >
          {/* Left: Artwork */}
          <div
            style={{
              borderRight: '1px solid var(--border-color)',
              background: '#000',
              position: 'relative',
              minHeight: '340px',
            }}
          >
            <img
              src={selectedTrackForDetail.thumbnail}
              alt={selectedTrackForDetail.title}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                filter: 'grayscale(100%) contrast(120%)',
              }}
            />
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
