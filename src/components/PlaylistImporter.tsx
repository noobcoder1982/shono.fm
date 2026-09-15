import React, { useState } from 'react';
import { usePlayer } from '../context/PlayerContext';

export const PlaylistImporter: React.FC = () => {
  const [url, setUrl] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { importPlaylist, isImporting, importProgressText, importProgressPercent, theme } = usePlayer();

  const isAppleGlass = Boolean(theme && theme.startsWith('apple-glass'));

  const handleImport = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!url.trim()) {
      setErrorMessage(isAppleGlass ? 'Please enter a playlist URL' : 'INPUT REQUIRED: ENTER YOUTUBE OR YOUTUBE MUSIC PLAYLIST URL');
      return;
    }
    setErrorMessage(null);

    try {
      await importPlaylist(url);
      setUrl('');
    } catch (err: any) {
      setErrorMessage(err.message || (isAppleGlass ? 'Unable to parse playlist' : 'INGESTION ERROR: UNABLE TO PARSE PLAYLIST'));
    }
  };

  return (
    <section
      style={{
        padding: isAppleGlass ? '20px 28px 12px 28px' : '18px 26px 14px 26px',
        borderBottom: isAppleGlass ? 'none' : '1px solid var(--border-color)',
        position: 'relative',
        background: isAppleGlass ? 'transparent' : 'var(--bg-primary)',
        flexShrink: 0,
      }}
    >
      {/* Top Header Row */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: isAppleGlass ? '14px' : '12px',
        }}
      >
        <div>
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: isAppleGlass ? '26px' : '34px',
              lineHeight: isAppleGlass ? 1.1 : 0.88,
              letterSpacing: isAppleGlass ? '-0.02em' : '0.02em',
              fontWeight: isAppleGlass ? 700 : 400,
              color: 'var(--text-primary)',
              margin: 0,
            }}
          >
            {isAppleGlass ? 'Archive Library' : (
              <>
                SHONO<br />ARCHIVE
              </>
            )}
          </h1>
        </div>
      </div>

      {/* Main Ingestion Input Form */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: errorMessage ? '8px' : '0px',
        }}
      >
        <form
          onSubmit={handleImport}
          style={{
            display: 'flex',
            width: '100%',
            borderRadius: isAppleGlass ? '20px' : '0',
            overflow: 'hidden',
            border: isAppleGlass ? '1px solid var(--glass-border)' : 'none',
            background: isAppleGlass ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
            backdropFilter: isAppleGlass ? 'blur(12px)' : 'none',
          }}
        >
          <input
            type="text"
            className="bma-input"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              if (errorMessage) setErrorMessage(null);
            }}
            placeholder={isAppleGlass ? 'Paste YouTube or YouTube Music playlist link...' : 'https://www.youtube.com/playlist?list=PL4fGSI1pDJn6jXS_PEoNEDb428264'}
            disabled={isImporting}
            style={{
              flex: 1,
              height: isAppleGlass ? '42px' : '38px',
              border: isAppleGlass ? 'none' : undefined,
              borderRight: 'none',
              background: isAppleGlass ? 'transparent' : undefined,
              fontFamily: isAppleGlass ? 'var(--font-sans)' : 'var(--font-mono)',
              fontSize: isAppleGlass ? '13px' : '11.5px',
              padding: isAppleGlass ? '10px 18px' : '8px 14px',
              outline: 'none',
            }}
          />
          <button
            type="submit"
            className="bma-btn bma-btn-primary"
            disabled={isImporting}
            style={{
              height: isAppleGlass ? '42px' : '38px',
              padding: isAppleGlass ? '0 22px' : '0 20px',
              border: 'none',
              borderLeft: isAppleGlass ? 'none' : '1px solid var(--border-active)',
              borderRadius: isAppleGlass ? '0 20px 20px 0' : '0',
              background: isAppleGlass ? 'var(--accent-color)' : undefined,
              color: '#ffffff',
              cursor: isImporting ? 'not-allowed' : 'pointer',
              whiteSpace: 'nowrap',
              fontSize: isAppleGlass ? '12px' : '10px',
              fontWeight: isAppleGlass ? 600 : 500,
              fontFamily: isAppleGlass ? 'var(--font-sans)' : 'var(--font-mono)',
            }}
          >
            {isImporting ? 'Ingesting...' : (isAppleGlass ? 'Import' : 'IMPORT →')}
          </button>
        </form>
      </div>

      {/* Ingestion Technical Loading Terminal Modal / Overlay */}
      {isImporting && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(9, 9, 9, 0.94)',
            zIndex: 10,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '24px 32px',
            backdropFilter: 'blur(2px)',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              color: 'var(--text-primary)',
              marginBottom: '10px',
              letterSpacing: '0.08em',
            }}
          >
            <span>{importProgressText || 'PROCESSING INGESTION PIPELINE'}</span>
            <span>{importProgressPercent}%</span>
          </div>
          {/* Brutalist Progress Bar */}
          <div
            style={{
              width: '100%',
              height: '4px',
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border-color)',
            }}
          >
            <div
              style={{
                width: `${importProgressPercent}%`,
                height: '100%',
                background: 'var(--text-primary)',
                transition: 'width 0.25s ease',
              }}
            />
          </div>
          <div
            style={{
              marginTop: '10px',
              fontFamily: 'var(--font-mono)',
              fontSize: '9px',
              color: 'var(--text-muted)',
              letterSpacing: '0.1em',
            }}
          >
            PARSING YOUTUBE MANIFEST &bull; DECODING AUDIO METADATA &bull; PERSISTING LOCAL ARCHIVE
          </div>
        </div>
      )}

      {/* Error readout */}
      {errorMessage && (
        <div
          style={{
            marginTop: '12px',
            padding: '8px 12px',
            border: '1px solid var(--status-live)',
            background: 'rgba(239, 68, 68, 0.08)',
            color: '#fca5a5',
            fontFamily: 'var(--font-mono)',
            fontSize: '10px',
            letterSpacing: '0.06em',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span>{errorMessage}</span>
          <button
            onClick={() => setErrorMessage(null)}
            style={{
              background: 'none',
              border: 'none',
              color: '#fca5a5',
              cursor: 'pointer',
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
            }}
          >
            [DISMISS]
          </button>
        </div>
      )}
    </section>
  );
};
