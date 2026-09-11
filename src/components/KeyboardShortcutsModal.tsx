import React from 'react';
import { usePlayer } from '../context/PlayerContext';
import { X, Command } from 'lucide-react';

export const KeyboardShortcutsModal: React.FC = () => {
  const { isShortcutsOpen, setIsShortcutsOpen } = usePlayer();

  if (!isShortcutsOpen) return null;

  const shortcuts = [
    { key: 'SPACE', label: 'Play / Pause stream' },
    { key: 'N', label: 'Next track' },
    { key: 'P', label: 'Previous track' },
    { key: 'S', label: 'Toggle shuffle playback' },
    { key: 'R', label: 'Cycle repeat mode (OFF / ALL / ONE)' },
    { key: 'M', label: 'Mute / Unmute master output' },
    { key: '/', label: 'Focus instant archive search' },
    { key: 'Q', label: 'Toggle queue drawer' },
    { key: 'ESC', label: 'Dismiss active overlay or blur search' },
    { key: '?', label: 'Open / close keyboard manual' },
  ];

  return (
    <div className="modal-backdrop" onClick={() => setIsShortcutsOpen(false)}>
      <div
        className="modal-card"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '520px' }}
      >
        {/* Header */}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Command size={14} color="var(--text-secondary)" />
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                letterSpacing: '0.12em',
                color: 'var(--text-primary)',
              }}
            >
              KEYBOARD PROTOCOLS
            </span>
          </div>
          <button
            className="bma-btn-icon"
            onClick={() => setIsShortcutsOpen(false)}
            style={{ padding: '4px' }}
          >
            <X size={16} />
          </button>
        </div>

        {/* List */}
        <div style={{ padding: '20px 24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {shortcuts.map((sc) => (
              <div
                key={sc.key}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  paddingBottom: '8px',
                  borderBottom: '1px solid var(--border-subtle)',
                }}
              >
                <span style={{ color: 'var(--text-secondary)' }}>{sc.label}</span>
                <kbd
                  style={{
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-bright)',
                    color: 'var(--text-primary)',
                    padding: '3px 8px',
                    fontSize: '10px',
                    fontWeight: 600,
                  }}
                >
                  {sc.key}
                </kbd>
              </div>
            ))}
          </div>

          <div
            style={{
              marginTop: '16px',
              fontFamily: 'var(--font-mono)',
              fontSize: '9px',
              color: 'var(--text-muted)',
              textAlign: 'center',
            }}
          >
            PRESS [ESC] OR [?] TO DISMISS
          </div>
        </div>
      </div>
    </div>
  );
};
