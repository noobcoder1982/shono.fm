export interface EqualizerPreset {
  id: string;
  name: string;
  description: string;
  bands: number[]; // 10 bands (-12 to +12 dB)
  bass: number;
  mid: number;
  treble: number;
}

export const EQ_FREQUENCIES = [32, 64, 125, 250, 500, 1000, 2000, 4000, 8000, 16000] as const;

export const EQ_FREQ_LABELS = ['32', '64', '125', '250', '500', '1K', '2K', '4K', '8K', '16K'];

export const EQ_PRESETS: EqualizerPreset[] = [
  {
    id: 'flat',
    name: 'FLAT',
    description: 'Pure neutral reference studio response.',
    bands: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    bass: 0,
    mid: 0,
    treble: 0,
  },
  {
    id: 'bass_boost',
    name: 'BASS BOOST',
    description: 'Sub-bass punch and analog low-end warmth.',
    bands: [6, 5.5, 4.5, 2, 0, 0, 0, 1, 2, 2.5],
    bass: 6,
    mid: 0,
    treble: 2,
  },
  {
    id: 'club',
    name: 'CLUB / EDM',
    description: 'Heavy kick transients and crystalline high-frequency air.',
    bands: [5, 6, 3.5, 0, -1, 1, 2.5, 4, 5, 4],
    bass: 5.5,
    mid: 0.5,
    treble: 4.5,
  },
  {
    id: 'vocal',
    name: 'VOCAL',
    description: 'Mid-range presence elevation for lyrical clarity.',
    bands: [-2, -2.5, -1, 1, 3.5, 4.5, 3.5, 1.5, 0, -1],
    bass: -2,
    mid: 4.5,
    treble: 0.5,
  },
  {
    id: 'rock',
    name: 'ROCK',
    description: 'Classic V-curve with aggressive rhythm edge.',
    bands: [4.5, 3.5, 2, -1, -2, 0.5, 2.5, 4, 4.5, 5],
    bass: 4,
    mid: -1,
    treble: 4.5,
  },
  {
    id: 'lofi',
    name: 'LO-FI / TAPE',
    description: 'Filtered vintage warmth with softened highs and focused mids.',
    bands: [-1, 2, 3.5, 3, 2, 0.5, -1.5, -3.5, -5.5, -7],
    bass: 2.5,
    mid: 1.5,
    treble: -5,
  },
  {
    id: 'acoustic',
    name: 'ACOUSTIC',
    description: 'Natural timbre preservation for strings and organic instruments.',
    bands: [3, 2.5, 1, 0.5, 1.5, 2, 2.5, 3.5, 4, 3.5],
    bass: 2.5,
    mid: 1.5,
    treble: 3.5,
  },
  {
    id: 'jazz',
    name: 'JAZZ',
    description: 'Smooth harmonic body with relaxed percussive transients.',
    bands: [3, 2, 0.5, 1.5, 2, 2, 1, 2, 2.5, 2.5],
    bass: 2,
    mid: 2,
    treble: 2,
  },
  {
    id: 'electronic',
    name: 'ELECTRONIC',
    description: 'Extended sub-bass depth paired with sharp synthetic top-end.',
    bands: [6, 5, 2, -0.5, -1.5, 1.5, 2, 3.5, 5.5, 6],
    bass: 5.5,
    mid: 0,
    treble: 5,
  },
];

export interface EqualizerState {
  enabled: boolean;
  mode: 'easy' | 'advanced';
  selectedPreset: string;
  bass: number; // -12 to +12 dB
  mid: number; // -12 to +12 dB
  treble: number; // -12 to +12 dB
  bands: number[]; // 10 numbers (-12 to +12 dB)
  preamp: number; // -6 to +6 dB
  bassDrive: number; // 0 to 100
  spatialWidth: number; // 0 to 100
}

const STORAGE_KEY = 'muszix_equalizer_v1';

export const DEFAULT_EQUALIZER_STATE: EqualizerState = {
  enabled: true,
  mode: 'easy',
  selectedPreset: 'flat',
  bass: 0,
  mid: 0,
  treble: 0,
  bands: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  preamp: 0,
  bassDrive: 0,
  spatialWidth: 0,
};

/**
 * Calculates 10-band array based on easy 3-macro faders: Bass, Mid, Treble.
 */
export function calculate10BandsFromMacro(bass: number, mid: number, treble: number): number[] {
  // Weights for each of the 10 bands
  const bassWeights = [1.0, 1.0, 0.85, 0.5, 0.15, 0, 0, 0, 0, 0];
  const midWeights = [0, 0, 0.15, 0.5, 0.9, 1.0, 0.9, 0.5, 0.15, 0];
  const trebWeights = [0, 0, 0, 0, 0, 0.1, 0.3, 0.7, 1.0, 1.0];

  return EQ_FREQUENCIES.map((_, i) => {
    const total = bass * bassWeights[i] + mid * midWeights[i] + treble * trebWeights[i];
    return Math.max(-12, Math.min(12, Math.round(total * 10) / 10));
  });
}

/**
 * Load saved equalizer state from localStorage.
 */
export function loadEqualizerState(): EqualizerState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_EQUALIZER_STATE;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_EQUALIZER_STATE,
      ...parsed,
      bands: Array.isArray(parsed.bands) && parsed.bands.length === 10
        ? parsed.bands
        : DEFAULT_EQUALIZER_STATE.bands,
    };
  } catch {
    return DEFAULT_EQUALIZER_STATE;
  }
}

/**
 * Persist equalizer state to localStorage.
 */
export function saveEqualizerState(state: EqualizerState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}
