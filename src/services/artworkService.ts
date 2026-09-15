import { useState, useEffect } from 'react';
import type { Track } from '../types';

// In-memory cache for ultra-fast instant lookups
const artworkMemoryCache = new Map<string, string>();

/**
 * Normalizes query string for reliable cache keys and search queries.
 * Strips out noisy video metadata tags like (Official Video), [HD], etc.
 */
export function cleanSearchQuery(title: string, artist?: string): string {
  let clean = title
    .replace(/\s*\([^)]*(?:official|video|audio|lyrics|visualizer|hd|4k|remastered|version|hq)[^)]*\)/gi, '')
    .replace(/\s*\[[^\]]*(?:official|video|audio|lyrics|visualizer|hd|4k|remastered|version|hq)[^\]]*\]/gi, '')
    .replace(/\s*\|\s*.*$/g, '')
    .replace(/\s*-\s*(?:official|video|audio|lyrics|visualizer).*$/gi, '')
    .replace(/\s*ft\.?.*$/gi, '')
    .replace(/\s*feat\.?.*$/gi, '')
    .trim();

  // If artist is already provided, format clean query
  if (artist && !clean.toLowerCase().includes(artist.toLowerCase())) {
    return `${artist} ${clean}`.trim();
  }
  return clean || title;
}

/**
 * Checks if a URL is a YouTube thumbnail (which often has letterbox/pillarbox bars).
 */
export function isYouTubeThumbnail(url?: string): boolean {
  if (!url) return false;
  return url.includes('img.youtube.com') || url.includes('i.ytimg.com');
}
export const isYouTubeArtwork = isYouTubeThumbnail;

/**
 * Normalizes Genius image URLs (e.g. extracts high-res source from unsafe/proxy URLs).
 */
export function normalizeGeniusUrl(url: string): string {
  if (!url) return url;
  // If it's a proxy url like https://t2.genius.com/unsafe/430x430/https%3A%2F%2Fimages.genius.com%2F...
  const match = url.match(/https%3A%2F%2Fimages\.genius\.com%2F[^&]+/i);
  if (match) {
    try {
      return decodeURIComponent(match[0]);
    } catch {
      return url;
    }
  }
  return url;
}

/**
 * Fetches high-definition square album art (1000x1000) from Apple Music / iTunes API.
 * Completely free, no API key required, open CORS (*).
 */
export async function fetchHighResArtwork(artist: string, title: string): Promise<string | null> {
  const query = cleanSearchQuery(title, artist);
  if (!query) return null;

  const cacheKey = `muszix_art_cache_${query.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;

  // Check memory cache first
  if (artworkMemoryCache.has(cacheKey)) {
    return artworkMemoryCache.get(cacheKey)!;
  }

  // Check localStorage cache
  try {
    const saved = localStorage.getItem(cacheKey);
    if (saved) {
      artworkMemoryCache.set(cacheKey, saved);
      return saved;
    }
  } catch {}

  try {
    const itunesUrl = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=song&limit=3`;
    const res = await fetch(itunesUrl);
    if (!res.ok) return null;

    const data = await res.json();
    if (data.results && data.results.length > 0) {
      const match = data.results[0];
      if (match.artworkUrl100) {
        // Upgrade from 100x100 thumbnail to 1000x1000 crystal clear studio square cover
        const highResUrl = match.artworkUrl100.replace('100x100bb', '1000x1000bb');
        artworkMemoryCache.set(cacheKey, highResUrl);
        try {
          localStorage.setItem(cacheKey, highResUrl);
        } catch {}
        return highResUrl;
      }
    }
  } catch (err) {
    console.warn('Artwork search fetch error:', err);
  }

  return null;
}

/**
 * Sets custom artwork override for a specific track ID (e.g. when pasting Genius URL).
 */
export function setCustomTrackArtwork(trackId: string, artworkUrl: string): void {
  const normalized = normalizeGeniusUrl(artworkUrl.trim());
  try {
    localStorage.setItem(`muszix_custom_art_${trackId}`, normalized);
    artworkMemoryCache.set(`custom_${trackId}`, normalized);
  } catch {}
}

/**
 * Gets custom artwork override if set by user.
 */
export function getCustomTrackArtwork(trackId: string): string | null {
  if (artworkMemoryCache.has(`custom_${trackId}`)) {
    return artworkMemoryCache.get(`custom_${trackId}`)!;
  }
  try {
    const saved = localStorage.getItem(`muszix_custom_art_${trackId}`);
    if (saved) {
      artworkMemoryCache.set(`custom_${trackId}`, saved);
      return saved;
    }
  } catch {}
  return null;
}

/**
 * React hook that returns the best available high-definition square artwork for a track.
 * Automatically initiates background iTunes resolution if only a YouTube thumbnail is present.
 */
export function useArtwork(track: Track | null | undefined): {
  artworkUrl: string;
  isHighRes: boolean;
  isYouTube: boolean;
} {
  const custom = track ? getCustomTrackArtwork(track.id) : null;
  const initialThumb = custom || track?.thumbnail || '/assets/now_playing_art.jpg';

  const [artworkUrl, setArtworkUrl] = useState<string>(initialThumb);
  const [isHighRes, setIsHighRes] = useState<boolean>(!isYouTubeThumbnail(initialThumb));

  useEffect(() => {
    if (!track) {
      setArtworkUrl('/assets/now_playing_art.jpg');
      setIsHighRes(true);
      return;
    }

    // Check custom override first
    const customArt = getCustomTrackArtwork(track.id);
    if (customArt) {
      setArtworkUrl(customArt);
      setIsHighRes(true);
      return;
    }

    // Check memory cache for this track
    const query = cleanSearchQuery(track.title, track.artist);
    const cacheKey = `muszix_art_cache_${query.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;

    if (artworkMemoryCache.has(cacheKey)) {
      setArtworkUrl(artworkMemoryCache.get(cacheKey)!);
      setIsHighRes(true);
      return;
    }

    // Default to existing thumbnail while resolving high-res
    const currentThumb = track.thumbnail || '/assets/now_playing_art.jpg';
    setArtworkUrl(currentThumb);
    setIsHighRes(!isYouTubeThumbnail(currentThumb));

    let active = true;
    fetchHighResArtwork(track.artist, track.title).then((resolved) => {
      if (active && resolved) {
        setArtworkUrl(resolved);
        setIsHighRes(true);
      }
    });

    return () => {
      active = false;
    };
  }, [track?.id, track?.title, track?.artist, track?.thumbnail]);

  return {
    artworkUrl,
    isHighRes,
    isYouTube: isYouTubeThumbnail(artworkUrl),
  };
}

/**
 * Resolves the best artwork URL for a track asynchronously.
 */
export async function getBestArtworkUrl(track: Track): Promise<string> {
  const custom = getCustomTrackArtwork(track.id);
  if (custom) return custom;

  const resolved = await fetchHighResArtwork(track.artist, track.title);
  if (resolved) return resolved;

  return track.thumbnail || '/assets/now_playing_art.jpg';
}
