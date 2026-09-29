export interface EqualizerPreset {
  id: string;
  name: string;
  description: string;
  bands: number[]; // 10 ISO bands (-12 to +12 dB)
}

export const EQ_FREQUENCIES = [32, 64, 125, 250, 500, 1000, 2000, 4000, 8000, 16000] as const;

export const EQ_FREQ_LABELS = ['32', '64', '125', '250', '500', '1K', '2K', '4K', '8K', '16K'];

// The 6 clean, core presets explicitly requested by user:
// flat, bass, bass+, jazz, vocal, rock
export const EQ_PRESETS: EqualizerPreset[] = [
  {
    id: 'flat',
    name: 'FLAT',
    description: 'Pure neutral reference studio response.',
    bands: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  },
  {
    id: 'bass',
    name: 'BASS',
    description: 'Punchy low-end analog thump with tight kick response and clean mids.',
    bands: [8.0, 8.5, 5.0, -1.5, -2.5, -1.0, 0, 1.0, 1.5, 1.0],
  },
  {
    id: 'bass_plus',
    name: 'BASS+',
    description: 'Deep 808 sub-bass chest slam with precision boxiness cut.',
    bands: [11.5, 11.0, 6.5, -2.5, -3.5, -1.5, 0.5, 2.0, 2.5, 2.0],
  },
  {
    id: 'jazz',
    name: 'JAZZ',
    description: 'Smooth harmonic body with relaxed percussive transients.',
    bands: [3.0, 2.5, 1.0, 1.5, 2.0, 2.0, 1.5, 2.0, 2.5, 2.5],
  },
  {
    id: 'vocal',
    name: 'VOCAL',
    description: 'Mid-range presence elevation for lyrical clarity and dialogue.',
    bands: [-2.0, -2.5, -1.0, 1.5, 4.0, 5.0, 4.0, 2.0, 0, -1.0],
  },
  {
    id: 'rock',
    name: 'ROCK',
    description: 'Classic aggressive V-curve with crisp guitar rhythm edge.',
    bands: [5.0, 4.0, 2.0, -1.0, -2.0, 0.5, 2.5, 4.5, 5.0, 5.5],
  },
];

export interface EqualizerState {
  enabled: boolean;
  selectedPreset: string;
  bands: number[]; // 10 numbers (-12 to +12 dB)
}

const STORAGE_KEY = 'muszix_equalizer_v2';

export const DEFAULT_EQUALIZER_STATE: EqualizerState = {
  enabled: true,
  selectedPreset: 'flat',
  bands: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
};

/**
 * Load saved equalizer state from localStorage.
 */
export function loadEqualizerState(): EqualizerState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_EQUALIZER_STATE;
    const parsed = JSON.parse(raw);
    return {
      enabled: typeof parsed.enabled === 'boolean' ? parsed.enabled : true,
      selectedPreset: parsed.selectedPreset || 'flat',
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
