import React, { useState } from 'react';
import { usePlayer } from '../context/PlayerContext';

export const PlaylistImporter: React.FC = () => {
  const [url, setUrl] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { importPlaylist, isImporting, importProgressText, importProgressPercent } = usePlayer();

  const handleImport = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!url.trim()) {
      setErrorMessage('INPUT REQUIRED: ENTER YOUTUBE OR YOUTUBE MUSIC PLAYLIST URL');
      return;
    }
    setErrorMessage(null);

    try {
      await importPlaylist(url);
      setUrl('');
    } catch (err: any) {
      setErrorMessage(err.message || 'INGESTION ERROR: UNABLE TO PARSE PLAYLIST');
    }
  };

  return (
    <section
      style={{
        padding: '12px 20px',
        borderBottom: '1px solid var(--border-color)',
        position: 'relative',
        background: 'var(--bg-primary)',
        flexShrink: 0,
      }}
    >
      {/* Top Header Row */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '10px',
        }}
      >
        <div>
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '32px',
              lineHeight: 0.88,
              letterSpacing: '0.02em',
              color: 'var(--text-primary)',
              margin: 0,
            }}
          >
            SHONO<br />ARCHIVE
          </h1>
        </div>

        <div
          style={{
            textAlign: 'right',
            fontFamily: 'var(--font-mono)',
            fontSize: '9px',
            color: 'var(--text-secondary)',
            letterSpacing: '0.08em',
            lineHeight: 1.4,
          }}
        >
          <div>DIGITAL MUSIC INDEX</div>
          <div style={{ color: 'var(--text-primary)' }}>/ PLAYLIST INGESTION SYSTEM</div>
        </div>
      </div>

      {/* Main Ingestion Input Form */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto',
          gap: '16px',
          alignItems: 'center',
          marginBottom: '8px',
        }}
      >
        <form
          onSubmit={handleImport}
          style={{
            display: 'flex',
            width: '100%',
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
            placeholder="https://www.youtube.com/playlist?list=PL4fGSI1pDJn6jXS_PEoNEDb428264"
            disabled={isImporting}
            style={{
              flex: 1,
              height: '34px',
              borderRight: 'none',
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              padding: '6px 12px',
            }}
          />
          <button
            type="submit"
            className="bma-btn bma-btn-primary"
            disabled={isImporting}
            style={{
              height: '34px',
              padding: '0 18px',
              borderLeft: '1px solid var(--border-active)',
              cursor: isImporting ? 'not-allowed' : 'pointer',
              whiteSpace: 'nowrap',
              fontSize: '10px',
            }}
          >
            {isImporting ? 'INGESTING...' : 'IMPORT →'}
          </button>
        </form>

        {/* Technical Taxonomy Tags (Right Column) */}
        <div
          className="hide-mobile"
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '8px',
            letterSpacing: '0.1em',
            color: 'var(--text-muted)',
            lineHeight: 1.4,
            whiteSpace: 'nowrap',
          }}
        >
          YOUTUBE /<br />
          YOUTUBE MUSIC /<br />
          PLAYLISTS /<br />
          ARCHIVE /<br />
          FOREVER /
        </div>
      </div>

      {/* Supporting Copy */}
      <div
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '8.5px',
          color: 'var(--text-secondary)',
          letterSpacing: '0.12em',
          lineHeight: 1.3,
          textTransform: 'uppercase',
        }}
      >
        IMPORT A PLAYLIST. &nbsp; BUILD AN ARCHIVE. &nbsp; PRESS PLAY.
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
