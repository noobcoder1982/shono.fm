import React, { useMemo } from 'react';
import { usePlayer } from '../context/PlayerContext';
import { TrackRow } from './TrackRow';

export const TrackList: React.FC = () => {
  const {
    activeArchive,
    searchQuery,
    genreFilter,
    setGenreFilter,
    showFavouritesOnly,
    setShowFavouritesOnly,
    likedTrackIds,
    theme,
  } = usePlayer();

  const isAppleGlass = Boolean(theme && theme.startsWith('apple-glass'));

  const tracks = useMemo(() => {
    if (!activeArchive) return [];
    let list = activeArchive.tracks;

    if (showFavouritesOnly) {
      list = list.filter((t) => likedTrackIds.includes(t.id));
    }

    if (genreFilter) {
      list = list.filter((t) => t.genre?.toLowerCase().includes(genreFilter.toLowerCase()));
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      list = list.filter(
        (t) =>
          t.title.toLowerCase().includes(query) ||
          t.artist.toLowerCase().includes(query) ||
          t.album.toLowerCase().includes(query) ||
          t.genre?.toLowerCase().includes(query) ||
          t.year.toString().includes(query)
      );
    }

    return list;
  }, [activeArchive, searchQuery, genreFilter, showFavouritesOnly, likedTrackIds]);

  if (!activeArchive) {
    return (
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 24px',
          background: isAppleGlass ? 'transparent' : 'var(--bg-primary)',
        }}
      >
        <div
          style={{
            maxWidth: '480px',
            width: '100%',
            borderRadius: isAppleGlass ? '24px' : '0',
            border: isAppleGlass ? '1px solid var(--glass-border)' : '1px solid var(--border-color)',
            background: isAppleGlass ? 'var(--glass-bg-secondary)' : 'var(--bg-secondary)',
            backdropFilter: isAppleGlass ? 'blur(20px)' : 'none',
            padding: '28px 32px',
            textAlign: 'left',
            boxShadow: isAppleGlass ? 'var(--glass-shadow)' : 'none',
          }}
        >
          <div
            style={{
              fontFamily: isAppleGlass ? 'var(--font-sans)' : 'var(--font-mono)',
              fontSize: isAppleGlass ? '11px' : '9px',
              letterSpacing: isAppleGlass ? 'normal' : '0.14em',
              color: 'var(--text-muted)',
              marginBottom: '10px',
              borderBottom: isAppleGlass ? 'none' : '1px solid var(--border-subtle)',
              paddingBottom: '6px',
            }}
          >
            {isAppleGlass ? 'Vault Ready • Zero Pre-loaded Data' : '// SHONO.FM ARCHIVE VAULT • ZERO PRE-LOADED DATA'}
          </div>
          <div
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: isAppleGlass ? '22px' : '26px',
              fontWeight: isAppleGlass ? 700 : 400,
              letterSpacing: isAppleGlass ? '-0.015em' : '0.04em',
              color: 'var(--text-primary)',
              lineHeight: 1.2,
              marginBottom: '8px',
            }}
          >
            {isAppleGlass ? 'Awaiting Playlist Import' : 'AWAITING PLAYLIST INGESTION'}
          </div>
          <p
            style={{
              fontFamily: isAppleGlass ? 'var(--font-sans)' : 'var(--font-mono)',
              fontSize: isAppleGlass ? '12px' : '10px',
              lineHeight: 1.65,
              color: 'var(--text-secondary)',
              margin: '0 0 18px 0',
            }}
          >
            This system runs purely on user-curated streams. Paste any public <strong>YouTube</strong> or <strong>YouTube Music</strong> playlist URL into the ingestion field above to index tracks, cover artwork, and waveform telemetry.
          </p>
          <div
            style={{
              fontFamily: isAppleGlass ? 'var(--font-sans)' : 'var(--font-mono)',
              fontSize: isAppleGlass ? '11px' : '8.5px',
              color: 'var(--text-muted)',
              display: 'flex',
              flexDirection: 'column',
              gap: '5px',
              borderTop: isAppleGlass ? '1px solid var(--glass-border-subtle)' : '1px dashed var(--border-color)',
              paddingTop: '12px',
            }}
          >
            <div>• Accepts: Public Playlists, Album Compilations, DJ Sets & Direct Videos</div>
            <div style={{ color: 'var(--text-primary)' }}>Data saved securely in your local browser vault</div>
          </div>
        </div>
      </div>
    );
  }

  const hasFilter = Boolean(genreFilter || showFavouritesOnly);

  return (
    <div
      style={{
        flex: 1,
        overflowX: 'auto',
        background: isAppleGlass ? 'transparent' : 'var(--bg-primary)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Active Filter Pill */}
      {hasFilter && (
        <div
          style={{
            padding: isAppleGlass ? '8px 16px' : '6px 16px',
            margin: isAppleGlass ? '6px 16px' : '0',
            borderRadius: isAppleGlass ? '14px' : '0',
            background: isAppleGlass ? 'var(--glass-bg-secondary)' : 'var(--bg-secondary)',
            border: isAppleGlass ? '1px solid var(--glass-border)' : undefined,
            borderBottom: isAppleGlass ? '1px solid var(--glass-border)' : '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontFamily: isAppleGlass ? 'var(--font-sans)' : 'var(--font-mono)',
            fontSize: isAppleGlass ? '11.5px' : '9.5px',
            color: 'var(--text-primary)',
            flexShrink: 0,
          }}
        >
          <span>
            Filter active: &nbsp;
            {showFavouritesOnly && <strong style={{ color: 'var(--status-live)' }}>[Favourites Only]</strong>}
            {genreFilter && <strong style={{ color: 'var(--text-primary)', marginLeft: '6px' }}>[Genre: {genreFilter}]</strong>}
          </span>
          <button
            onClick={() => {
              setGenreFilter(null);
              setShowFavouritesOnly(false);
            }}
            className="bma-btn"
            style={{ padding: '2px 8px', fontSize: '8.5px', borderRadius: isAppleGlass ? '999px' : '0' }}
          >
            Clear Filter ×
          </button>
        </div>
      )}

      <table className="track-table">
        <thead>
          {isAppleGlass ? (
            <tr>
              <th style={{ width: '46px', textAlign: 'center' }}>#</th>
              <th style={{ width: '52px' }}></th>
              <th>Title</th>
              <th>Artist</th>
              <th className="hide-mobile">Album</th>
              <th className="hide-mobile" style={{ width: '60px' }}>Year</th>
              <th style={{ width: '60px' }}>Time</th>
              <th style={{ width: '40px', textAlign: 'right' }}></th>
            </tr>
          ) : (
            <tr>
              <th style={{ width: '46px' }}>#</th>
              <th style={{ width: '48px' }}>THUMB</th>
              <th>TITLE</th>
              <th>ARTIST</th>
              <th className="hide-mobile">ALBUM</th>
              <th className="hide-mobile" style={{ width: '60px' }}>YEAR</th>
              <th style={{ width: '60px' }}>TIME</th>
              <th style={{ width: '40px', textAlign: 'right' }}></th>
            </tr>
          )}
        </thead>
        <tbody>
          {tracks.length === 0 ? (
            <tr>
              <td
                colSpan={8}
                style={{
                  padding: '36px',
                  textAlign: 'center',
                  color: 'var(--text-muted)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                }}
              >
                {showFavouritesOnly
                  ? 'NO FAVOURITED TRACKS IN THIS ARCHIVE. HEART TRACKS TO ADD TO YOUR COLLECTION.'
                  : `NO TRACKS MATCHING CURRENT CRITERIA`}
              </td>
            </tr>
          ) : (
            tracks.map((track, idx) => (
              <TrackRow key={track.id} track={track} index={idx} />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};
