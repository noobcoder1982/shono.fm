import type { Track } from '../types';

const MUSICAL_KEYS = [
  { key: 'C Major', camelot: '8B' },
  { key: 'A Minor', camelot: '8A' },
  { key: 'G Major', camelot: '9B' },
  { key: 'E Minor', camelot: '9A' },
  { key: 'D Major', camelot: '10B' },
  { key: 'B Minor', camelot: '10A' },
  { key: 'A Major', camelot: '11B' },
  { key: 'F# Minor', camelot: '11A' },
  { key: 'E Major', camelot: '12B' },
  { key: 'C# Minor', camelot: '12A' },
  { key: 'B Major', camelot: '1B' },
  { key: 'G# Minor', camelot: '1A' },
  { key: 'F# Major', camelot: '2B' },
  { key: 'D# Minor', camelot: '2A' },
  { key: 'Db Major', camelot: '3B' },
  { key: 'Bb Minor', camelot: '3A' },
  { key: 'Ab Major', camelot: '4B' },
  { key: 'F Minor', camelot: '4A' },
  { key: 'Eb Major', camelot: '5B' },
  { key: 'C Minor', camelot: '5A' },
  { key: 'Bb Major', camelot: '6B' },
  { key: 'G Minor', camelot: '6A' },
  { key: 'F Major', camelot: '7B' },
  { key: 'D Minor', camelot: '7A' },
];

// Simple hash utility to get deterministic numbers from string
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

export interface AudioTagData {
  bpm: number;
  key: string;
  camelot: string;
}

const analysisCache = new Map<string, AudioTagData>();

export function getTrackBpmAndKey(track: Track | null | undefined): AudioTagData {
  if (!track) {
    return { bpm: 120, key: 'C Major', camelot: '8B' };
  }

  const cacheKey = track.id || track.youtubeId || `${track.title}-${track.artist}`;
  if (analysisCache.has(cacheKey)) {
    return analysisCache.get(cacheKey)!;
  }

  // If already present on track
  if (track.bpm && track.key) {
    const matched = MUSICAL_KEYS.find((k) => k.key.toLowerCase() === track.key?.toLowerCase());
    const data: AudioTagData = {
      bpm: track.bpm,
      key: track.key,
      camelot: matched ? matched.camelot : '8A',
    };
    analysisCache.set(cacheKey, data);
    return data;
  }

  // Derive realistic musical parameters deterministically based on seed
  const seedString = `${track.title}|${track.artist}|${track.duration || 180}`;
  const seed = hashString(seedString);

  // Common BPM distribution centered around 100-130 BPM, occasional 70-95 or 140-160
  const bpmBands = [
    { min: 72, max: 96, weight: 2 },
    { min: 98, max: 128, weight: 6 },
    { min: 128, max: 155, weight: 3 },
  ];
  const bandIndex = seed % 3;
  const band = bpmBands[bandIndex];
  const bpm = band.min + ((seed >> 3) % (band.max - band.min + 1));

  // Determine Key from seed
  const keyIndex = (seed >> 5) % MUSICAL_KEYS.length;
  const { key, camelot } = MUSICAL_KEYS[keyIndex];

  const data: AudioTagData = {
    bpm,
    key,
    camelot,
  };

  analysisCache.set(cacheKey, data);
  return data;
}
