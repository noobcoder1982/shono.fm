import React from 'react';
import { usePlayer } from '../context/PlayerContext';
import { Trash2, ChevronUp, ChevronDown } from 'lucide-react';

export const Queue: React.FC = () => {
  const { queue, clearQueue, removeFromQueue, playTrack, reorderQueue } = usePlayer();

  const handleMoveUp = (idx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (idx === 0) return;
    const copy = [...queue];
    const temp = copy[idx - 1];
    copy[idx - 1] = copy[idx];
    copy[idx] = temp;
    reorderQueue(copy);
  };

  const handleMoveDown = (idx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (idx === queue.length - 1) return;
    const copy = [...queue];
    const temp = copy[idx + 1];
    copy[idx + 1] = copy[idx];
    copy[idx] = temp;
    reorderQueue(copy);
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        background: 'var(--bg-secondary)',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 24px 12px 24px',
          borderBottom: '1px solid var(--border-color)',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            letterSpacing: '0.12em',
            color: 'var(--text-primary)',
            fontWeight: 600,
          }}
        >
          QUEUE ({queue.length})
        </span>

        {queue.length > 0 && (
          <button
            onClick={clearQueue}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              fontFamily: 'var(--font-mono)',
              fontSize: '10px',
              letterSpacing: '0.08em',
              cursor: 'pointer',
              padding: '2px 6px',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
          >
            CLEAR
          </button>
        )}
      </div>

      {/* Queue items */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          maxHeight: '380px',
        }}
      >
        {queue.length === 0 ? (
          <div
            style={{
              padding: '32px 24px',
              textAlign: 'center',
              color: 'var(--text-muted)',
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              letterSpacing: '0.04em',
            }}
          >
            QUEUE EMPTY &bull; ADD TRACKS FROM ARCHIVE
          </div>
        ) : (
          queue.map((track, idx) => {
            const formattedIdx = (idx + 1).toString().padStart(3, '0');
            return (
              <div
                key={`${track.id}_queue_${idx}`}
                onClick={() => {
                  // Play track and pop earlier tracks
                  const nextQueue = queue.slice(idx + 1);
                  reorderQueue(nextQueue);
                  playTrack(track);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '10px 24px',
                  borderBottom: '1px solid var(--border-subtle)',
                  cursor: 'pointer',
                  transition: 'background-color 0.12s ease',
                  gap: '12px',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                {/* Index */}
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '10px',
                    color: 'var(--text-muted)',
                    width: '26px',
                  }}
                >
                  {formattedIdx}
                </span>

                {/* Thumb */}
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    border: '1px solid var(--border-color)',
                    background: '#000',
                    overflow: 'hidden',
                    flexShrink: 0,
                  }}
                >
                  <img
                    src={track.thumbnail}
                    alt={track.title}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      filter: 'grayscale(100%)',
                    }}
                  />
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '11px',
                      color: 'var(--text-primary)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {track.title}
                  </div>
                  <div
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '9px',
                      color: 'var(--text-secondary)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    - {track.artist}
                  </div>
                </div>

                {/* Duration */}
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '10px',
                    color: 'var(--text-muted)',
                    marginRight: '6px',
                  }}
                >
                  {track.durationFormatted}
                </div>

                {/* Reorder controls & delete */}
                <div
                  style={{ display: 'flex', alignItems: 'center', gap: '2px' }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    className="bma-btn-icon"
                    onClick={(e) => handleMoveUp(idx, e)}
                    disabled={idx === 0}
                    style={{ opacity: idx === 0 ? 0.3 : 1, padding: '2px' }}
                    title="Move up"
                  >
                    <ChevronUp size={12} />
                  </button>
                  <button
                    className="bma-btn-icon"
                    onClick={(e) => handleMoveDown(idx, e)}
                    disabled={idx === queue.length - 1}
                    style={{ opacity: idx === queue.length - 1 ? 0.3 : 1, padding: '2px' }}
                    title="Move down"
                  >
                    <ChevronDown size={12} />
                  </button>
                  <button
                    className="bma-btn-icon"
                    onClick={() => removeFromQueue(track.id)}
                    title="Remove from queue"
                    style={{ padding: '2px', marginLeft: '4px' }}
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
