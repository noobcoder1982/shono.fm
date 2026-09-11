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
  } = usePlayer();

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
          background: 'var(--bg-primary)',
        }}
      >
        <div
          style={{
            maxWidth: '480px',
            width: '100%',
            border: '1px solid var(--border-color)',
            background: 'var(--bg-secondary)',
            padding: '28px 32px',
            textAlign: 'left',
          }}
        >
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '9px',
              letterSpacing: '0.14em',
              color: 'var(--text-muted)',
              marginBottom: '10px',
              borderBottom: '1px solid var(--border-subtle)',
              paddingBottom: '6px',
            }}
          >
            // SHONO.FM ARCHIVE VAULT &bull; ZERO PRE-LOADED DATA
          </div>
          <div
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '26px',
              letterSpacing: '0.04em',
              color: 'var(--text-primary)',
              lineHeight: 1.1,
              marginBottom: '8px',
            }}
          >
            AWAITING PLAYLIST INGESTION
          </div>
          <p
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '10px',
              lineHeight: 1.65,
              color: 'var(--text-secondary)',
              margin: '0 0 18px 0',
            }}
          >
            This system runs purely on user-curated streams. Paste any public <strong>YouTube</strong> or <strong>YouTube Music</strong> playlist URL into the ingestion field above to index tracks, cover artwork, and waveform telemetry.
          </p>
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '8.5px',
              color: 'var(--text-muted)',
              display: 'flex',
              flexDirection: 'column',
              gap: '5px',
              borderTop: '1px dashed var(--border-color)',
              paddingTop: '12px',
            }}
          >
            <div>&bull; ACCEPTS: PUBLIC PLAYLISTS, ALBUM COMPILATIONS, DJ SETS &amp; DIRECT VIDEOS</div>
            <div style={{ color: 'var(--text-primary)' }}>DATA SAVED SECURELY IN YOUR LOCAL BROWSER VAULT</div>
          </div>
        </div>
      </div>
    );
  }

  const hasFilter = Boolean(genreFilter || showFavouritesOnly);

  return (
    <div style={{ flex: 1, overflowX: 'auto', background: 'var(--bg-primary)', display: 'flex', flexDirection: 'column' }}>
      {/* Active Filter Pill */}
      {hasFilter && (
        <div
          style={{
            padding: '6px 16px',
            background: 'var(--bg-secondary)',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontFamily: 'var(--font-mono)',
            fontSize: '9.5px',
            color: 'var(--text-primary)',
            flexShrink: 0,
          }}
        >
          <span>
            FILTER ACTIVE: &nbsp;
            {showFavouritesOnly && <strong style={{ color: 'var(--status-live)' }}>[FAVOURITES ONLY]</strong>}
            {genreFilter && <strong style={{ color: 'var(--text-primary)', marginLeft: '6px' }}>[GENRE: {genreFilter.toUpperCase()}]</strong>}
          </span>
          <button
            onClick={() => {
              setGenreFilter(null);
              setShowFavouritesOnly(false);
            }}
            className="bma-btn"
            style={{ padding: '2px 8px', fontSize: '8.5px' }}
          >
            CLEAR FILTER ×
          </button>
        </div>
      )}

      <table className="track-table">
        <thead>
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
