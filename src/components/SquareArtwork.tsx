import React, { useState } from 'react';
import type { Track } from '../types';
import { useArtwork } from '../services/artworkService';

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
  alt = 'Album Artwork',
  className = '',
  style = {},
  imgStyle = {},
  borderRadius = '8px',
  onClick,
  title,
}) => {
  const { artworkUrl, isYouTube } = useArtwork(track);
  const [imgError, setImgError] = useState(false);

  const fallbackSrc = '/assets/now_playing_art.jpg';
  const effectiveSrc = imgError ? fallbackSrc : artworkUrl;

  return (
    <div
      className={`square-artwork-container ${className}`}
      onClick={onClick}
      title={title || track?.title}
      style={{
        borderRadius,
        ...style,
      }}
    >
      <img
        src={effectiveSrc}
        alt={alt || track?.title || 'Album Cover'}
        onError={() => setImgError(true)}
        className={`square-artwork-img ${isYouTube && !imgError ? 'is-yt-fallback' : ''}`}
        style={imgStyle}
        loading="lazy"
      />
    </div>
  );
};
