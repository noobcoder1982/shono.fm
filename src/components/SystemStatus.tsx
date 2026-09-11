import React from 'react';
import { usePlayer } from '../context/PlayerContext';

export const SystemStatus: React.FC = () => {
  const { systemStatus } = usePlayer();

  const isStreaming = systemStatus.playback === 'PLAYING';
  const isBuffering = systemStatus.playback === 'BUFFERING';

  return (
    <div
      style={{
        display: 'flex',
        borderTop: '1px solid var(--border-color)',
        background: 'var(--bg-secondary)',
        minHeight: '105px',
        maxHeight: '120px',
        flexShrink: 0,
      }}
    >
      {/* Monospace Readout Table */}
      <div
        style={{
          flex: 1,
          padding: '10px 14px',
          borderRight: '1px solid var(--border-color)',
          fontFamily: 'var(--font-mono)',
          fontSize: '8.5px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        <div
          style={{
            letterSpacing: '0.14em',
            color: 'var(--text-muted)',
            marginBottom: '4px',
            fontWeight: 600,
          }}
        >
          SYSTEM STATUS
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
          {/* SOURCE */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-muted)' }}>SOURCE</span>
            <span style={{ color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '5px' }}>
              {systemStatus.source}
              <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--text-primary)' }} />
            </span>
          </div>

          {/* CONNECTION */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-muted)' }}>CONNECTION</span>
            <span style={{ color: 'var(--status-active)', display: 'flex', alignItems: 'center', gap: '5px' }}>
              {systemStatus.connection}
              <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--status-active)' }} />
            </span>
          </div>

          {/* PLAYBACK */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-muted)' }}>PLAYBACK</span>
            <span
              style={{
                color: isStreaming ? 'var(--status-active)' : isBuffering ? 'var(--status-warn)' : 'var(--text-secondary)',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
              }}
            >
              {systemStatus.playback === 'PLAYING' ? 'STREAMING' : systemStatus.playback}
              <span
                style={{
                  width: '4px',
                  height: '4px',
                  borderRadius: '50%',
                  background: isStreaming ? 'var(--status-active)' : isBuffering ? 'var(--status-warn)' : 'var(--text-muted)',
                }}
              />
            </span>
          </div>

          {/* ARCHIVE */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-muted)' }}>ARCHIVE</span>
            <span style={{ color: 'var(--text-primary)' }}>{systemStatus.archiveId}</span>
          </div>

          {/* ITEMS */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-muted)' }}>ITEMS</span>
            <span style={{ color: 'var(--text-primary)' }}>{systemStatus.itemCount.toString().padStart(3, '0')}</span>
          </div>

          {/* STATUS */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-muted)' }}>STATUS</span>
            <span style={{ color: 'var(--text-primary)' }}>{systemStatus.statusText}</span>
          </div>
        </div>
      </div>

      {/* Editorial Brutalist Monolith Art & Caption */}
      <div
        style={{
          width: '110px',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          overflow: 'hidden',
          background: '#000',
        }}
      >
        <img
          src="/assets/status_monolith.jpg"
          alt="Monolith structure"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            filter: 'grayscale(100%) contrast(120%) brightness(80%)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '6px',
            left: '8px',
            right: '8px',
            fontFamily: 'var(--font-mono)',
            fontSize: '7.5px',
            color: 'var(--text-primary)',
            letterSpacing: '0.1em',
            lineHeight: 1.25,
            textTransform: 'uppercase',
            textShadow: '0 1px 4px rgba(0,0,0,0.9)',
          }}
        >
          GOOD MUSIC<br />
          BETTER DAYS —
        </div>
      </div>
    </div>
  );
};
