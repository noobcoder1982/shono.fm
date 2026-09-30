import React, { useState, useEffect } from 'react';
import type { Track } from '../types';
import { useArtwork } from '../services/artworkService';
import { Disc } from 'lucide-react';

interface SquareArtworkProps {
  track: Track | null | undefined;
  alt?: string;
  className?: string;
  style?: React.CSSProperties;
  imgStyle?: React.CSSProperties;
  borderRadius?: string;
  onClick?: () => void;
  title?: string;
}

export const SquareArtwork: React.FC<SquareArtworkProps> = ({
  track,
  alt: _alt = 'Album Artwork',
  className = '',
  style = {},
  imgStyle = {},
  borderRadius = '8px',
  onClick,
  title,
}) => {
  const { artworkUrl, isYouTube } = useArtwork(track);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [track?.id, artworkUrl]);

  return (
    <div
      className={`square-artwork-container ${className}`}
      onClick={onClick}
      title={title || track?.title}
      style={{
        borderRadius,
        position: 'relative',
        overflow: 'hidden',
        background: '#09090c',
        ...style,
      }}
    >
      {imgError ? (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'radial-gradient(circle, #1a1a24 0%, #08080a 100%)',
            color: 'var(--text-muted)',
          }}
        >
          <Disc size={24} style={{ opacity: 0.5 }} />
        </div>
      ) : (
        <img
          src={artworkUrl || (track?.youtubeId ? `https://img.youtube.com/vi/${track.youtubeId}/hqdefault.jpg` : '/assets/now_playing_art.jpg')}
          alt=""
          onError={(e) => {
            const target = e.currentTarget;
            if (track?.youtubeId && !target.src.includes('mqdefault')) {
              target.src = `https://img.youtube.com/vi/${track.youtubeId}/mqdefault.jpg`;
            } else {
              setImgError(true);
            }
          }}
          className={`square-artwork-img ${isYouTube ? 'is-yt-fallback' : ''}`}
          style={imgStyle}
          loading="lazy"
        />
      )}
    </div>
  );
};
