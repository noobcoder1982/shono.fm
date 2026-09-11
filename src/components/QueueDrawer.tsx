import React from 'react';
import { usePlayer } from '../context/PlayerContext';
import { Queue } from './Queue';
import { X } from 'lucide-react';

export const QueueDrawer: React.FC = () => {
  const { isQueueDrawerOpen, setIsQueueDrawerOpen } = usePlayer();

  if (!isQueueDrawerOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.65)',
        zIndex: 150,
        display: 'flex',
        justifyContent: 'flex-end',
      }}
      onClick={() => setIsQueueDrawerOpen(false)}
    >
      <div
        style={{
          width: '380px',
          maxWidth: '100%',
          height: '100%',
          background: 'var(--bg-secondary)',
          borderLeft: '1px solid var(--border-bright)',
          display: 'flex',
          flexDirection: 'column',
          paddingBottom: 'var(--bottom-bar-height)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '16px 20px',
            borderBottom: '1px solid var(--border-color)',
            background: 'var(--bg-primary)',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              letterSpacing: '0.12em',
              color: 'var(--text-primary)',
            }}
          >
            PLAYBACK QUEUE DRAWER
          </span>
          <button
            className="bma-btn-icon"
            onClick={() => setIsQueueDrawerOpen(false)}
            style={{ padding: '4px' }}
          >
            <X size={16} />
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto' }}>
          <Queue />
        </div>
      </div>
    </div>
  );
};
