import React from 'react';
import type { CheatNotificationState } from '../hooks/useMovieModeCheat';

interface CheatNotificationProps {
  notification: CheatNotificationState;
}

export const CheatNotification: React.FC<CheatNotificationProps> = ({ notification }) => {
  if (!notification.visible) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: '28px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 999999,
        background: '#0a0a0f',
        border: '1.5px solid #d4af37',
        boxShadow: '0 0 24px rgba(212, 175, 55, 0.45), 0 10px 30px rgba(0, 0, 0, 0.8)',
        borderRadius: '6px',
        padding: '8px 24px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        color: '#d4af37',
        fontFamily: 'var(--font-mono)',
        fontSize: '13px',
        fontWeight: 800,
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        pointerEvents: 'none',
        animation: 'cheatPop 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      }}
    >
      <style>{`
        @keyframes cheatPop {
          0% { opacity: 0; transform: translate(-50%, -20px) scale(0.9); }
          100% { opacity: 1; transform: translate(-50%, 0) scale(1); }
        }
      `}</style>
      <span>{notification.message}</span>
    </div>
  );
};
