/**
 * SHONO.FM — DYNAMIC ALBUM ART COLOR ENGINE
 * Extracts a harmonious, restrained color palette from the currently playing album artwork
 * and smoothly applies subtle tints, glows, and accents without breaking the dark theme.
 */

import { storage, type BrutalistTheme } from './storage';

export interface DynamicColorPalette {
  accent: string;       // #hex or rgb for primary buttons, active tabs, sliders
  accentRgb: [number, number, number];
  accentSubtle: string; // Translucent tint for badges, subtle fills
  bgTint: string;       // Very dark, ambient atmospheric tint (6-8% lightness)
  playerGlow: string;   // Soft radial glow underneath player
  isDefault: boolean;
}

// Default accent colors for built-in themes
const THEME_ACCENTS: Record<BrutalistTheme, [number, number, number]> = {
  noir: [212, 175, 55],       // #d4af37 Warm Brass
  concrete: [14, 165, 233],   // #0ea5e9 Electric Cyan
  braun: [255, 87, 34],       // #ff5722 Safety Orange
  tapedeck: [225, 29, 72],    // #e11d48 Ruby LED
  phosphor: [34, 197, 94],    // #22c55e Emerald Telemetry
  swiss: [217, 4, 41],        // #d90429 Swiss Vermilion
  stealth: [129, 140, 248],   // #818cf8 Laser Violet
  dark: [245, 245, 245],      // #f5f5f5 Clean Silver
  dark_plus: [56, 189, 248],  // #38bdf8 Electric Sky Cyan
  blue: [59, 130, 246],       // #3b82f6 Cobalt Blue
  beige: [212, 163, 115],     // #d4a373 Roasted Walnut / Cream
  green: [16, 185, 129],      // #10b981 Emerald Sage
};

class DynamicColorService {
  private currentPalette: DynamicColorPalette;
  private targetRgb: [number, number, number] = [212, 175, 55];
  private animatedRgb: [number, number, number] = [212, 175, 55];
  private currentTheme: BrutalistTheme = 'noir';
  private animationFrameId: number | null = null;
  private lastArtworkUrl: string | null = null;
  private listeners: Set<(palette: DynamicColorPalette) => void> = new Set();

  constructor() {
    const settings = storage.getSettings();
    this.currentTheme = settings.theme || 'noir';
    const initialRgb = THEME_ACCENTS[this.currentTheme] || [212, 175, 55];
    this.targetRgb = [...initialRgb];
    this.animatedRgb = [...initialRgb];
    this.currentPalette = this.createPaletteFromRgb(initialRgb, true);
  }

  public init() {
    if (typeof window === 'undefined') return;
    const settings = storage.getSettings();
    this.currentTheme = settings.theme || 'noir';
    this.applyToDOM(this.currentPalette);
  }

  public subscribe(fn: (palette: DynamicColorPalette) => void) {
    this.listeners.add(fn);
    fn(this.currentPalette);
    return () => this.listeners.delete(fn);
  }

  public setTheme(theme: BrutalistTheme) {
    this.currentTheme = theme;
    const settings = storage.getSettings();
    if (!settings.dynamicColorsEnabled || settings.colorSource === 'fixed') {
      const defaultRgb = THEME_ACCENTS[theme] || [212, 175, 55];
      this.crossfadeToRgb(defaultRgb, true);
    }
  }

  public updateSettings() {
    const settings = storage.getSettings();
    if (!settings.dynamicColorsEnabled || settings.colorSource === 'fixed') {
      const defaultRgb = THEME_ACCENTS[this.currentTheme] || [212, 175, 55];
      this.crossfadeToRgb(defaultRgb, true);
    } else if (this.lastArtworkUrl) {
      this.extractAndApply(this.lastArtworkUrl);
    }
  }

  public updateArtwork(artworkUrl: string | null | undefined) {
    const settings = storage.getSettings();
    if (!settings.dynamicColorsEnabled || settings.colorSource === 'fixed') {
      const defaultRgb = THEME_ACCENTS[this.currentTheme] || [212, 175, 55];
      this.crossfadeToRgb(defaultRgb, true);
      return;
    }

    if (!artworkUrl) {
      const defaultRgb = THEME_ACCENTS[this.currentTheme] || [212, 175, 55];
      this.crossfadeToRgb(defaultRgb, true);
      return;
    }

    if (artworkUrl === this.lastArtworkUrl) return;
    this.lastArtworkUrl = artworkUrl;
    this.extractAndApply(artworkUrl);
  }

  private async extractAndApply(url: string) {
    try {
      // 1. Try fetching via blob first (bypasses CORS restrictions in Electron and creates clean local object URL)
      const res = await fetch(url, { mode: 'cors' }).catch(() => null);
      if (res && res.ok) {
        const blob = await res.blob();
        const objectUrl = URL.createObjectURL(blob);
        const img = new Image();
        img.onload = () => {
          try {
            const rgb = this.extractHarmoniousColor(img);
            URL.revokeObjectURL(objectUrl);
            this.crossfadeToRgb(rgb, false);
          } catch (e) {
            URL.revokeObjectURL(objectUrl);
            this.fallbackExtract(url);
          }
        };
        img.onerror = () => {
          URL.revokeObjectURL(objectUrl);
          this.fallbackExtract(url);
        };
        img.src = objectUrl;
        return;
      }
    } catch (e) {
      // ignore and try direct Image load
    }

    this.fallbackExtract(url);
  }

  private fallbackExtract(url: string) {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const rgb = this.extractHarmoniousColor(img);
        this.crossfadeToRgb(rgb, false);
      } catch {
        const derivedRgb = this.generateFallbackColor(url);
        this.crossfadeToRgb(derivedRgb, false);
      }
    };
    img.onerror = () => {
      const derivedRgb = this.generateFallbackColor(url);
      this.crossfadeToRgb(derivedRgb, false);
    };
    img.src = url;
  }

  /**
   * Generates a stable, vibrant, aesthetic accent color from the URL string
   * if external CORS or canvas completely blocks pixel reading, avoiding stuck yellow.
   */
  private generateFallbackColor(str: string): [number, number, number] {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = Math.abs(hash % 360);
    // Vibrant 75% saturation, 58% lightness
    return this.hslToRgb(hue, 0.75, 0.58);
  }

  /**
   * Samples a 64x64 canvas, ignores pure black letterbox / pure white backgrounds,
   * converts to HSL to find the most vibrant, prominent hue bucket,
   * then locks lightness to 58-64% so text and UI elements remain crisp and readable on dark mode.
   */
  private extractHarmoniousColor(img: HTMLImageElement): [number, number, number] {
    const canvas = document.createElement('canvas');
    const size = 64;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return THEME_ACCENTS[this.currentTheme] || [212, 175, 55];

    ctx.drawImage(img, 0, 0, size, size);
    const imageData = ctx.getImageData(0, 0, size, size);
    const data = imageData.data;

    const buckets: { count: number; totalSat: number; totalLight: number; hue: number }[] = [];
    const NUM_BUCKETS = 16;
    for (let i = 0; i < NUM_BUCKETS; i++) {
      buckets.push({ count: 0, totalSat: 0, totalLight: 0, hue: (i * 360) / NUM_BUCKETS });
    }

    for (let i = 0; i < data.length; i += 16) { // Sample every 4th pixel for speed
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const a = data[i + 3];

      if (a < 128) continue; // Skip transparent

      // Calculate perceived brightness
      const brightness = 0.299 * r + 0.587 * g + 0.114 * b;
      // Skip deep black letterboxing or pure white borders
      if (brightness < 22 || brightness > 238) continue;

      const [h, s, l] = this.rgbToHsl(r, g, b);
      // Prefer colorful pixels over completely desaturated grays
      if (s < 0.18) continue;

      const bucketIndex = Math.min(
        NUM_BUCKETS - 1,
        Math.floor((h / 360) * NUM_BUCKETS)
      );

      buckets[bucketIndex].count++;
      buckets[bucketIndex].totalSat += s;
      buckets[bucketIndex].totalLight += l;
    }

    // Find bucket with highest vibrancy score: count * average saturation
    let bestBucket = buckets[0];
    let maxScore = -1;

    for (const b of buckets) {
      if (b.count === 0) continue;
      const avgSat = b.totalSat / b.count;
      const score = b.count * (avgSat * avgSat);
      if (score > maxScore) {
        maxScore = score;
        bestBucket = b;
      }
    }

    if (maxScore <= 0) {
      // Fallback to theme accent if artwork is entirely monochrome / dark
      return THEME_ACCENTS[this.currentTheme] || [212, 175, 55];
    }

    const selectedHue = bestBucket.hue;
    // Calibrate saturation to 75% and lightness to 60% for optimal readability on dark canvas
    const targetSat = 0.78;
    const targetLight = 0.60;

    return this.hslToRgb(selectedHue, targetSat, targetLight);
  }

  /**
   * Smoothly crossfades RGB values over ~600ms via requestAnimationFrame
   */
  private crossfadeToRgb(target: [number, number, number], isDefault: boolean) {
    this.targetRgb = target;

    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }

    const startTime = performance.now();
    const duration = 650; // ms smooth crossfade
    const startRgb = [...this.animatedRgb] as [number, number, number];

    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      // Smooth cubic ease-out
      const ease = 1 - Math.pow(1 - progress, 3);

      this.animatedRgb = [
        Math.round(startRgb[0] + (this.targetRgb[0] - startRgb[0]) * ease),
        Math.round(startRgb[1] + (this.targetRgb[1] - startRgb[1]) * ease),
        Math.round(startRgb[2] + (this.targetRgb[2] - startRgb[2]) * ease),
      ];

      const palette = this.createPaletteFromRgb(this.animatedRgb, isDefault && progress === 1);
      this.currentPalette = palette;
      this.applyToDOM(palette);

      if (progress < 1) {
        this.animationFrameId = requestAnimationFrame(step);
      } else {
        this.animationFrameId = null;
        this.notify();
      }
    };

    this.animationFrameId = requestAnimationFrame(step);
  }

  private createPaletteFromRgb(rgb: [number, number, number], isDefault: boolean): DynamicColorPalette {
    const [r, g, b] = rgb;
    const settings = storage.getSettings();
    const intensity = Math.max(0.1, Math.min(1.0, settings.dynamicColorIntensity ?? 0.65));

    // Convert to HSL to calculate a deep, restrained ambient background tint
    const [h, s] = this.rgbToHsl(r, g, b);
    const bgTintRgb = this.hslToRgb(h, Math.min(s, 0.45), 0.065); // 6.5% lightness

    return {
      accent: `rgb(${r}, ${g}, ${b})`,
      accentRgb: [r, g, b],
      accentSubtle: `rgba(${r}, ${g}, ${b}, ${(0.14 * intensity).toFixed(3)})`,
      bgTint: isDefault
        ? 'transparent'
        : `rgba(${bgTintRgb[0]}, ${bgTintRgb[1]}, ${bgTintRgb[2]}, ${(0.55 * intensity).toFixed(3)})`,
      playerGlow: `rgba(${r}, ${g}, ${b}, ${(0.22 * intensity).toFixed(3)})`,
      isDefault,
    };
  }

  private applyToDOM(palette: DynamicColorPalette) {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;

    root.style.setProperty('--accent-color', palette.accent);
    root.style.setProperty('--accent-subtle', palette.accentSubtle);
    root.style.setProperty('--accent-glow', `rgba(${palette.accentRgb[0]}, ${palette.accentRgb[1]}, ${palette.accentRgb[2]}, 0.28)`);
    root.style.setProperty('--dynamic-bg-tint', palette.bgTint);
    root.style.setProperty('--player-dynamic-glow', palette.playerGlow);
  }

  private notify() {
    this.listeners.forEach((fn) => fn(this.currentPalette));
  }

  // --- HSL / RGB Math Helpers ---
  private rgbToHsl(r: number, g: number, b: number): [number, number, number] {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    return [h * 360, s, l];
  }

  private hslToRgb(h: number, s: number, l: number): [number, number, number] {
    h = (h % 360) / 360;
    let r: number, g: number, b: number;

    if (s === 0) {
      r = g = b = l;
    } else {
      const hue2rgb = (p: number, q: number, t: number) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
      };
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1 / 3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1 / 3);
    }
    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
  }
}

export const dynamicColorService = new DynamicColorService();
