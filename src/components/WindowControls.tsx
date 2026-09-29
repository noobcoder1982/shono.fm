import React, { useState, useEffect } from 'react';
import { Minus, Square, Copy, X } from 'lucide-react';

interface WindowControlsProps {
  className?: string;
  style?: React.CSSProperties;
  buttonSize?: number;
}

export const WindowControls: React.FC<WindowControlsProps> = ({
  className = '',
  style,
  buttonSize = 13,
}) => {
  const [isElectron, setIsElectron] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).electronAPI?.isElectron) {
      setIsElectron(true);
    }
  }, []);

  // Only render if running inside Electron desktop app
  if (!isElectron) return null;

  const handleMinimize = (e: React.MouseEvent) => {
    e.stopPropagation();
    (window as any).electronAPI?.minimize();
  };

  const handleMaximize = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMaximized((prev) => !prev);
    (window as any).electronAPI?.maximize();
  };

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    (window as any).electronAPI?.close();
  };

  const baseBtnStyle: React.CSSProperties = {
    WebkitAppRegion: 'no-drag',
    width: '38px',
    height: '28px',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'transparent',
    border: 'none',
    color: '#a1a1aa',
    cursor: 'pointer',
    transition: 'background 0.14s ease, color 0.14s ease',
    borderRadius: '4px',
    padding: 0,
  } as React.CSSProperties;

  return (
    <div
      className={`custom-window-controls ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '2px',
        ['-webkit-app-region' as any]: 'no-drag',
        zIndex: 50,
        ...style,
      }}
      aria-label="Window Controls"
    >
      {/* Minimize */}
      <button
        type="button"
        onClick={handleMinimize}
        style={baseBtnStyle}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
          e.currentTarget.style.color = '#ffffff';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent';
          e.currentTarget.style.color = '#a1a1aa';
        }}
        title="Minimize"
      >
        <Minus size={buttonSize} />
      </button>

      {/* Maximize / Restore */}
      <button
        type="button"
        onClick={handleMaximize}
        style={baseBtnStyle}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
          e.currentTarget.style.color = '#ffffff';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent';
          e.currentTarget.style.color = '#a1a1aa';
        }}
        title={isMaximized ? 'Restore' : 'Maximize'}
      >
        {isMaximized ? <Copy size={buttonSize - 2} /> : <Square size={buttonSize - 2} />}
      </button>

      {/* Close */}
      <button
        type="button"
        onClick={handleClose}
        style={baseBtnStyle}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = '#e11d48';
          e.currentTarget.style.color = '#ffffff';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent';
          e.currentTarget.style.color = '#a1a1aa';
        }}
        title="Close"
      >
        <X size={buttonSize + 1} />
      </button>
    </div>
  );
};
