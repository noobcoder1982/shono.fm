import React, { useState, useEffect } from 'react';
import { updateService, type UpdateState } from '../services/updateService';
import { Zap, RefreshCw, X, ExternalLink, Download, ChevronDown } from 'lucide-react';

export const UpdateNotificationPill: React.FC = () => {
  const [updateState, setUpdateState] = useState<UpdateState>(() => updateService.getState());
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const unsub = updateService.subscribe((state) => {
      setUpdateState(state);
    });
    return unsub;
  }, []);

  // Only render if an update is available or active
  if (!updateState.hasUpdate && !updateState.isDownloading && !updateState.isReadyToRestart) {
    return null;
  }

  const handleActionClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateService.downloadAndRestart();
  };

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(false);
    updateService.dismissUpdate();
  };

  return (
    <>
      {/* Discord-Style Floating Top Pill */}
      <aside
        aria-label="Application Update"
        className="discord-update-pill"
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          position: 'fixed',
          top: '10px',
          right: '160px', // Leaves clearance for Windows frameless titlebar min/max/close controls (140px width)
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 14px',
          background: 'rgba(17, 17, 17, 0.92)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid var(--accent-color)',
          borderRadius: '20px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5), 0 0 12px var(--accent-subtle)',
          cursor: 'pointer',
          fontFamily: 'var(--font-mono)',
          fontSize: '10.5px',
          fontWeight: 600,
          letterSpacing: '0.06em',
          color: 'var(--text-primary)',
          transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
          userSelect: 'none',
          animation: 'pillPulse 2.5s infinite ease-in-out',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-1px) scale(1.02)';
          e.currentTarget.style.boxShadow = '0 6px 24px rgba(0, 0, 0, 0.6), 0 0 18px var(--accent-subtle)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0) scale(1)';
          e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.5), 0 0 12px var(--accent-subtle)';
        }}
      >
        {/* Glowing Indicator Dot */}
        <span
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: updateState.isReadyToRestart
              ? 'var(--status-active)'
              : updateState.isDownloading
              ? 'var(--status-warn)'
              : 'var(--accent-color)',
            boxShadow: `0 0 8px ${
              updateState.isReadyToRestart
                ? 'var(--status-active)'
                : updateState.isDownloading
                ? 'var(--status-warn)'
                : 'var(--accent-color)'
            }`,
            display: 'inline-block',
            flexShrink: 0,
          }}
        />

        {/* Dynamic Label */}
        {updateState.isDownloading ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Download size={13} className="animate-bounce" />
            <span>DOWNLOADING UPDATE {updateState.downloadPercent}%</span>
          </div>
        ) : updateState.isReadyToRestart ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Zap size={13} color="var(--status-active)" />
            <span style={{ color: 'var(--status-active)' }}>RESTART TO UPDATE</span>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Zap size={13} color="var(--accent-color)" />
            <span>UPDATE v{updateState.latestVersion} AVAILABLE</span>
          </div>
        )}

        {/* Direct One-Click Restart / Download Action Button */}
        <button
          onClick={handleActionClick}
          title={updateState.isReadyToRestart ? 'Restart App Now' : 'Download and Apply Update'}
          style={{
            marginLeft: '4px',
            padding: '2px 8px',
            background: 'var(--accent-color)',
            color: 'var(--bg-primary)',
            border: 'none',
            borderRadius: '12px',
            fontFamily: 'var(--font-mono)',
            fontSize: '9.5px',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'opacity 0.15s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.85')}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
        >
          {updateState.isReadyToRestart ? (
            <>
              <RefreshCw size={10} />
              <span>RESTART</span>
            </>
          ) : updateState.isDownloading ? (
            <span>{updateState.downloadPercent}%</span>
          ) : (
            <>
              <Download size={10} />
              <span>UPDATE</span>
            </>
          )}
        </button>

        {/* Dropdown Chevron */}
        <ChevronDown
          size={13}
          style={{
            transform: isExpanded ? 'rotate(180deg)' : 'none',
            transition: 'transform 0.2s ease',
            color: 'var(--text-muted)',
          }}
        />

        {/* Quick Dismiss Button */}
        <button
          onClick={handleDismiss}
          title="Dismiss banner"
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            padding: '2px',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
        >
          <X size={12} />
        </button>
      </aside>

      {/* Expanded Release Details Flyout */}
      {isExpanded && (
        <div
          style={{
            position: 'fixed',
            top: '48px',
            right: '160px',
            width: '360px',
            maxHeight: '400px',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-bright)',
            borderRadius: '12px',
            padding: '18px',
            boxShadow: '0 12px 32px rgba(0, 0, 0, 0.7)',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '10px',
                  color: 'var(--accent-color)',
                  letterSpacing: '0.08em',
                  fontWeight: 700,
                }}
              >
                GITHUB RELEASE
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '15px',
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  marginTop: '2px',
                }}
              >
                {updateState.releaseTitle || `Version ${updateState.latestVersion}`}
              </div>
            </div>
            <button
              onClick={() => setIsExpanded(false)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
              }}
            >
              <X size={15} />
            </button>
          </div>

          {/* Progress bar if downloading */}
          {updateState.isDownloading && (
            <div style={{ width: '100%', background: 'var(--bg-tertiary)', height: '6px', borderRadius: '3px', overflow: 'hidden' }}>
              <div
                style={{
                  width: `${updateState.downloadPercent}%`,
                  height: '100%',
                  background: 'var(--accent-color)',
                  transition: 'width 0.2s ease',
                }}
              />
            </div>
          )}

          {/* Release Notes Snippet */}
          <div
            style={{
              maxHeight: '160px',
              overflowY: 'auto',
              background: 'var(--bg-tertiary)',
              padding: '10px 12px',
              borderRadius: '6px',
              fontFamily: 'var(--font-sans)',
              fontSize: '12px',
              color: 'var(--text-secondary)',
              lineHeight: 1.45,
              whiteSpace: 'pre-wrap',
            }}
          >
            {updateState.releaseNotes}
          </div>

          {/* Action Row */}
          <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
            <button
              onClick={handleActionClick}
              className="bma-btn bma-btn-primary"
              style={{
                flex: 1,
                padding: '8px 12px',
                fontSize: '10.5px',
                background: 'var(--accent-color)',
                color: 'var(--bg-primary)',
                borderColor: 'var(--accent-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
              }}
            >
              {updateState.isReadyToRestart ? (
                <>
                  <RefreshCw size={12} />
                  <span>RESTART & APPLY NOW</span>
                </>
              ) : updateState.isDownloading ? (
                <span>DOWNLOADING ({updateState.downloadPercent}%)</span>
              ) : (
                <>
                  <Download size={12} />
                  <span>DOWNLOAD & RESTART</span>
                </>
              )}
            </button>

            {updateState.releaseUrl && (
              <a
                href={updateState.releaseUrl}
                target="_blank"
                rel="noreferrer"
                className="bma-btn"
                style={{
                  padding: '8px 10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  textDecoration: 'none',
                  color: 'var(--text-secondary)',
                }}
                title="Open GitHub Release Page"
              >
                <ExternalLink size={12} />
              </a>
            )}
          </div>
        </div>
      )}
    </>
  );
};
