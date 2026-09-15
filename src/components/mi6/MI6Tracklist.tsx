import React, { useState } from 'react';
import type { Track } from '../../types';
import { Disc } from 'lucide-react';
import { isYouTubeArtwork } from '../../services/artworkService';

interface MI6TracklistProps {
  tracks: Track[];
  currentTrack: Track | null;
  onSelectTrack: (track: Track) => void;
}

export const MI6Tracklist: React.FC<MI6TracklistProps> = ({
  tracks,
  currentTrack,
  onSelectTrack,
}) => {
  const [draggingTrackId, setDraggingTrackId] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, track: Track) => {
    setDraggingTrackId(track.id);
    e.dataTransfer.setData('application/json', JSON.stringify(track));
    e.dataTransfer.setData('text/plain', track.id);
    e.dataTransfer.effectAllowed = 'copyMove';

    // Create realistic floating vinyl disc ghost preview
    const ghost = document.createElement('div');
    ghost.style.width = '64px';
    ghost.style.height = '64px';
    ghost.style.borderRadius = '50%';
    ghost.style.background = 'radial-gradient(circle, #1a1b20 0%, #08090b 100%)';
    ghost.style.border = '2px solid #d4af37';
    ghost.style.boxShadow = '0 10px 24px rgba(0,0,0,0.9), 0 0 12px rgba(212,175,55,0.5)';
    ghost.style.display = 'flex';
    ghost.style.alignItems = 'center';
    ghost.style.justifyContent = 'center';
    ghost.style.position = 'absolute';
    ghost.style.top = '-1000px';
    ghost.style.left = '-1000px';
    ghost.style.zIndex = '9999';

    // Micro grooves ring on ghost
    const grooves = document.createElement('div');
    grooves.style.position = 'absolute';
    grooves.style.inset = '5px';
    grooves.style.borderRadius = '50%';
    grooves.style.border = '1px dashed rgba(255,255,255,0.15)';
    ghost.appendChild(grooves);

    // Center Label with Real Song Cover Photo
    const label = document.createElement('div');
    label.style.width = '26px';
    label.style.height = '26px';
    label.style.borderRadius = '50%';
    label.style.background = '#0e1014';
    label.style.border = '1.5px solid #d4af37';
    label.style.display = 'flex';
    label.style.alignItems = 'center';
    label.style.justifyContent = 'center';
    label.style.overflow = 'hidden';
    label.style.boxShadow = '0 0 4px rgba(0,0,0,0.8)';

    if (track.thumbnail) {
      const img = document.createElement('img');
      img.src = track.thumbnail;
      img.style.width = '100%';
      img.style.height = '100%';
      img.style.objectFit = 'cover';
      label.appendChild(img);
    } else {
      label.style.color = '#d4af37';
      label.style.fontSize = '8px';
      label.style.fontWeight = '900';
      label.style.fontFamily = 'monospace';
      label.innerText = '●';
    }
    ghost.appendChild(label);

    document.body.appendChild(ghost);
    e.dataTransfer.setDragImage(ghost, 32, 32);

    setTimeout(() => {
      if (document.body.contains(ghost)) {
        document.body.removeChild(ghost);
      }
    }, 0);
  };

  const handleDragEnd = () => {
    setDraggingTrackId(null);
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minHeight: 0,
        background: '#0d0e11',
        border: '1px solid #22252c',
        padding: '12px 14px',
        userSelect: 'none',
      }}
    >
      {/* Classified Section Tag */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '10px',
          borderBottom: '1px solid #1f2229',
          paddingBottom: '6px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '9px',
              fontWeight: 700,
              color: '#8b8e99',
              letterSpacing: '0.12em',
            }}
          >
            SIDE A / TRACKLIST
          </span>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '7.5px',
              color: '#d4af37',
              letterSpacing: '0.08em',
              background: 'rgba(212, 175, 55, 0.08)',
              padding: '1px 5px',
              border: '1px solid rgba(212, 175, 55, 0.25)',
            }}
          >
            PULL DISC TO PLATTER TO PLAY
          </span>
        </div>
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '8px',
            color: '#555861',
            letterSpacing: '0.08em',
          }}
        >
          {tracks.length} RECORDED ENTRIES
        </span>
      </div>

      {/* Scrollable Track Entries */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
          paddingRight: '4px',
        }}
      >
        {tracks.length === 0 ? (
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '24px',
              textAlign: 'center',
              color: '#6b6f7c',
              fontFamily: 'var(--font-mono)',
              fontSize: '9px',
              letterSpacing: '0.08em',
              gap: '8px',
            }}
          >
            <div style={{ color: '#d4af37', fontWeight: 600 }}>// NO DOSSIER TRACKS RECORDED</div>
            <div style={{ maxWidth: '220px', lineHeight: 1.5 }}>
              SWITCH TO ARCHIVE MODE (TOP RIGHT) TO INGEST YOUR FIRST YOUTUBE PLAYLIST.
            </div>
          </div>
        ) : (
          tracks.map((track, idx) => {
            const isActive = currentTrack?.id === track.id;
            const isBeingDragged = draggingTrackId === track.id;
            const displayIndex = (idx + 1).toString().padStart(2, '0');

            return (
              <div
                key={track.id}
                draggable={true}
                onDragStart={(e) => handleDragStart(e, track)}
                onDragEnd={handleDragEnd}
                onClick={() => onSelectTrack(track)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '6px 8px',
                  background: isActive
                    ? 'rgba(212, 175, 55, 0.08)'
                    : isBeingDragged
                    ? 'rgba(212, 175, 55, 0.15)'
                    : 'transparent',
                  border: isActive
                    ? '1px solid rgba(212, 175, 55, 0.35)'
                    : isBeingDragged
                    ? '1px dashed #d4af37'
                    : '1px solid transparent',
                  cursor: 'grab',
                  transition: 'all 0.12s ease',
                  opacity: isBeingDragged ? 0.6 : 1,
                }}
                onMouseEnter={(e) => {
                  if (!isActive && !isBeingDragged) {
                    e.currentTarget.style.background = '#14161b';
                    e.currentTarget.style.borderColor = '#292d37';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive && !isBeingDragged) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.borderColor = 'transparent';
                  }
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flex: 1 }}>
                  {/* Pullable Mini Vinyl Disc Handle with Real Song Cover */}
                  <div
                    title="Pull this vinyl disc onto the player to spin & play"
                    style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      background: '#0d0e11',
                      border: isActive ? '1.5px solid #d4af37' : '1px solid #363a46',
                      boxShadow: isActive ? '0 0 6px rgba(212,175,55,0.5)' : 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      cursor: 'grab',
                      overflow: 'hidden',
                      position: 'relative',
                      transition: 'transform 0.15s ease, border-color 0.15s ease',
                    }}
                  >
                    {track.thumbnail ? (
                      <img
                        src={track.thumbnail}
                        alt={track.title}
                        className={`square-artwork-img ${isYouTubeArtwork(track.thumbnail) ? 'is-yt-fallback' : ''}`}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          display: 'block',
                        }}
                      />
                    ) : (
                      <Disc size={12} color={isActive ? '#d4af37' : '#737785'} />
                    )}
                  </div>

                  {/* Index Pill */}
                  <div
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '9px',
                      fontWeight: 700,
                      width: '20px',
                      height: '18px',
                      background: isActive ? '#d4af37' : '#1a1c22',
                      color: isActive ? '#0d0e11' : '#6b6f7c',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '1px',
                      flexShrink: 0,
                    }}
                  >
                    {displayIndex}
                  </div>

                  {/* Track Title & Artist */}
                  <div
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '10px',
                      fontWeight: isActive ? 600 : 400,
                      color: isActive ? '#d4af37' : '#c2c5ce',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      letterSpacing: '0.03em',
                    }}
                  >
                    {track.artist} — {track.title}
                  </div>
                </div>

                {/* Duration Readout */}
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '9px',
                    color: isActive ? '#d4af37' : '#555861',
                    letterSpacing: '0.05em',
                    marginLeft: '8px',
                    flexShrink: 0,
                  }}
                >
                  {track.durationFormatted || '03:45'}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
