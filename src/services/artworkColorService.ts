export interface ArtworkColors {
  ambient1: string;
  ambient2: string;
  accent: string;
  isExtracted: boolean;
}

const colorCache = new Map<string, ArtworkColors>();

const HARMONIC_PRESETS = [
  // Purple / Pink (Synthwave, Darkwave, Pop)
  {
    ambient1: 'rgba(168, 85, 247, 0.52)',
    ambient2: 'rgba(244, 114, 182, 0.44)',
    accent: '#ec4899',
  },
  // Blue / Cyan (Electronic, Ambient, Deep)
  {
    ambient1: 'rgba(14, 165, 233, 0.52)',
    ambient2: 'rgba(99, 102, 241, 0.44)',
    accent: '#0ea5e9',
  },
  // Sunset / Rose (R&B, Soul, Indie)
  {
    ambient1: 'rgba(244, 63, 94, 0.52)',
    ambient2: 'rgba(251, 146, 60, 0.44)',
    accent: '#f43f5e',
  },
  // Emerald / Teal (Acoustic, Lo-Fi, Chill)
  {
    ambient1: 'rgba(16, 185, 129, 0.50)',
    ambient2: 'rgba(6, 182, 212, 0.42)',
    accent: '#10b981',
  },
  // Violet / Indigo (Nocturne, Jazz, Classical)
  {
    ambient1: 'rgba(139, 92, 246, 0.54)',
    ambient2: 'rgba(59, 130, 246, 0.44)',
    accent: '#8b5cf6',
  },
  // Crimson / Amber (Rock, Heavy, High-Energy)
  {
    ambient1: 'rgba(239, 68, 68, 0.52)',
    ambient2: 'rgba(245, 158, 11, 0.44)',
    accent: '#ef4444',
  },
];

function getPresetFromString(str: string): ArtworkColors {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  const idx = Math.abs(hash) % HARMONIC_PRESETS.length;
  return {
    ...HARMONIC_PRESETS[idx],
    isExtracted: false,
  };
}

/**
 * Dynamically extract ambient glow and accent colors from an album artwork image.
 * Uses an offscreen canvas with pixel analysis and a deterministic fallback.
 */
export function extractColorsFromImage(imgUrl: string, identifier = ''): Promise<ArtworkColors> {
  const cacheKey = imgUrl || identifier || 'default';
  if (colorCache.has(cacheKey)) {
    return Promise.resolve(colorCache.get(cacheKey)!);
  }

  const fallback = getPresetFromString(identifier || imgUrl || 'shono_fm');

  if (!imgUrl || typeof window === 'undefined') {
    return Promise.resolve(fallback);
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    // Timeout safety in case image hangs or CDN is slow
    const timeout = setTimeout(() => {
      colorCache.set(cacheKey, fallback);
      resolve(fallback);
    }, 1200);

    img.onload = () => {
      clearTimeout(timeout);
      try {
        const canvas = document.createElement('canvas');
        canvas.width = 36;
        canvas.height = 36;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          colorCache.set(cacheKey, fallback);
          resolve(fallback);
          return;
        }

        ctx.drawImage(img, 0, 0, 36, 36);
        const imgData = ctx.getImageData(0, 0, 36, 36).data;

        // Sample pixels, filtering out extreme luminance and desaturated gray tones
        const samples: { r: number; g: number; b: number; score: number }[] = [];
        for (let i = 0; i < imgData.length; i += 16) {
          const r = imgData[i];
          const g = imgData[i + 1];
          const b = imgData[i + 2];
          const a = imgData[i + 3];

          if (a < 128) continue;

          const max = Math.max(r, g, b);
          const min = Math.min(r, g, b);
          const delta = max - min;
          const sat = max === 0 ? 0 : delta / max;
          const lum = 0.299 * r + 0.587 * g + 0.114 * b;

          // Target rich, saturated colors that give gorgeous ambient glow
          if (lum > 30 && lum < 225 && sat > 0.2) {
            const score = sat * 2 + (lum > 70 && lum < 185 ? 1 : 0);
            samples.push({ r, g, b, score });
          }
        }

        if (samples.length === 0) {
          colorCache.set(cacheKey, fallback);
          resolve(fallback);
          return;
        }

        // Sort by saturation score
        samples.sort((a, b) => b.score - a.score);
        const top1 = samples[0];

        // Find second complementary/distinct hue with spatial distance
        let top2 = samples.find(
          (c) => Math.hypot(c.r - top1.r, c.g - top1.g, c.b - top1.b) > 75
        );
        if (!top2) {
          top2 = samples[Math.min(samples.length - 1, 5)];
        }

        const ambient1 = `rgba(${top1.r}, ${top1.g}, ${top1.b}, 0.52)`;
        const ambient2 = `rgba(${top2.r}, ${top2.g}, ${top2.b}, 0.44)`;
        const accent = `rgb(${Math.min(255, Math.floor(top1.r * 1.15))}, ${Math.min(
          255,
          Math.floor(top1.g * 1.15)
        )}, ${Math.min(255, Math.floor(top1.b * 1.15))})`;

        const result: ArtworkColors = {
          ambient1,
          ambient2,
          accent,
          isExtracted: true,
        };

        colorCache.set(cacheKey, result);
        resolve(result);
      } catch {
        colorCache.set(cacheKey, fallback);
        resolve(fallback);
      }
    };

    img.onerror = () => {
      clearTimeout(timeout);
      colorCache.set(cacheKey, fallback);
      resolve(fallback);
    };

    img.src = imgUrl;
  });
}
