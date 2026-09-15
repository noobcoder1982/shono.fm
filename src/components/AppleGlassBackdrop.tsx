import React, { useEffect, useState } from 'react';
import { usePlayer } from '../context/PlayerContext';
import { extractColorsFromImage, type ArtworkColors } from '../services/artworkColorService';

export const AppleGlassBackdrop: React.FC = () => {
  const { currentTrack, theme } = usePlayer();
  const isAppleGlass = theme === 'apple-glass' || theme === 'apple-glass-light';
  const isLight = theme === 'apple-glass-light';

  const [colors, setColors] = useState<ArtworkColors>({
    ambient1: isLight ? 'rgba(180, 195, 220, 0.40)' : 'rgba(147, 51, 234, 0.36)',
    ambient2: isLight ? 'rgba(235, 185, 205, 0.35)' : 'rgba(59, 130, 246, 0.32)',
    accent: isLight ? '#0071e3' : '#fa2d48',
    isExtracted: false,
  });

  useEffect(() => {
    if (!isAppleGlass) return;

    let active = true;
    const identifier = `${currentTrack?.artist || ''}_${currentTrack?.title || ''}`;
    extractColorsFromImage(currentTrack?.thumbnail || '', identifier).then((res) => {
      if (!active) return;
      setColors(res);

      // Dynamically update document tokens
      document.documentElement.style.setProperty('--ambient-color-1', res.ambient1);
      document.documentElement.style.setProperty('--ambient-color-2', res.ambient2);
      document.documentElement.style.setProperty('--apple-accent', res.accent);
    });

    return () => {
      active = false;
    };
  }, [currentTrack?.thumbnail, currentTrack?.id, isAppleGlass]);

  if (!isAppleGlass) return null;

  return (
    <div className="apple-glass-ambient-backdrop" aria-hidden="true">
      {/* Orb 1: Upper-left / center ambient aura */}
      <div
        className="apple-glass-orb apple-glass-orb-1"
        style={{
          background: `radial-gradient(circle at 45% 45%, ${colors.ambient1} 0%, transparent 72%)`,
        }}
      />

      {/* Orb 2: Lower-right / player ambient aura */}
      <div
        className="apple-glass-orb apple-glass-orb-2"
        style={{
          background: `radial-gradient(circle at 55% 55%, ${colors.ambient2} 0%, transparent 70%)`,
        }}
      />

      {/* Orb 3: Lower-center / dock atmospheric aura */}
      <div
        className="apple-glass-orb apple-glass-orb-3"
        style={{
          background: `radial-gradient(circle at 50% 50%, ${colors.ambient1} 0%, transparent 68%)`,
        }}
      />

      {/* Soft Apple glass vignette & micro-texture */}
      <div className="apple-glass-vignette" />
    </div>
  );
};
