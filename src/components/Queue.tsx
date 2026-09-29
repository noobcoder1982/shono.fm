import React, { useState } from 'react';
import { usePlayer } from '../context/PlayerContext';
import { Trash2, GripVertical } from 'lucide-react';

export const Queue: React.FC = () => {
  const { queue, clearQueue, removeFromQueue, playTrack, reorderQueue } = usePlayer();
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);

  const handleDrop = (targetIdx: number) => {
    if (draggedIdx === null || draggedIdx === targetIdx) {
      setDraggedIdx(null);
      setDragOverIdx(null);
      return;
    }
    const copy = [...queue];
    const [draggedItem] = copy.splice(draggedIdx, 1);
    copy.splice(targetIdx, 0, draggedItem);
    reorderQueue(copy);
    setDraggedIdx(null);
    setDragOverIdx(null);
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
            const isDragged = draggedIdx === idx;
            const isOver = dragOverIdx === idx;
            const isDropAbove = isOver && draggedIdx !== null && draggedIdx > idx;
            const isDropBelow = isOver && draggedIdx !== null && draggedIdx < idx;

            return (
              <div
                key={`${track.id}_queue_${idx}`}
                draggable={true}
                onDragStart={(e) => {
                  e.dataTransfer.effectAllowed = 'move';
                  setDraggedIdx(idx);
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = 'move';
                  if (dragOverIdx !== idx) setDragOverIdx(idx);
                }}
                onDragLeave={() => {
                  setDragOverIdx((prev) => (prev === idx ? null : prev));
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  handleDrop(idx);
                }}
                onDragEnd={() => {
                  setDraggedIdx(null);
                  setDragOverIdx(null);
                }}
                onClick={() => {
                  const nextQueue = queue.slice(idx + 1);
                  reorderQueue(nextQueue);
                  playTrack(track);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '10px 24px',
                  borderBottom: isDropBelow ? '2px solid var(--accent-color)' : '1px solid var(--border-subtle)',
                  borderTop: isDropAbove ? '2px solid var(--accent-color)' : 'none',
                  cursor: 'pointer',
                  transition: 'background-color 0.12s ease',
                  gap: '10px',
                  opacity: isDragged ? 0.35 : 1,
                  background: isOver ? 'var(--bg-hover)' : 'transparent',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = isOver ? 'var(--bg-hover)' : 'transparent')}
              >
                {/* Grip Handle */}
                <div
                  style={{
                    cursor: 'grab',
                    display: 'flex',
                    alignItems: 'center',
                    color: isDragged ? 'var(--accent-color)' : 'var(--text-muted)',
                    opacity: 0.6,
                    padding: '2px 0',
                    flexShrink: 0,
                  }}
                  title="Drag up or down to reorder"
                  onClick={(e) => e.stopPropagation()}
                >
                  <GripVertical size={13} />
                </div>

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
                  className="square-artwork-container"
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '2px',
                    border: '1px solid var(--border-color)',
                    background: '#000',
                    overflow: 'hidden',
                    flexShrink: 0,
                  }}
                >
                  <img
                    src={track.thumbnail}
                    alt={track.title}
                    className="square-artwork-img is-yt-fallback"
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

                {/* Delete */}
                <div
                  style={{ display: 'flex', alignItems: 'center' }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    className="bma-btn-icon"
                    onClick={() => removeFromQueue(track.id)}
                    title="Remove from queue"
                    style={{ padding: '4px' }}
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
