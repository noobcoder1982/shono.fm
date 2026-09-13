export interface Track {
  id: string;
  youtubeId?: string;
  index: number;
  title: string;
  artist: string;
  album: string;
  year: string | number;
  duration: number; // in seconds
  durationFormatted: string; // "04:17"
  thumbnail: string;
  genre?: string;
  bpm?: number;
  key?: string;
  source?: string;
  isLiked?: boolean;
}

export interface Archive {
  id: string;
  indexNumber: string; // e.g. "001"
  title: string;
  curator: string;
  tracks: Track[];
  totalDurationFormatted: string;
  importedDate: string; // "2026-09-10"
  sourceUrl?: string;
  source?: string;
  coverImage?: string;
  description?: string;
}

export type PlaybackStatus = 'IDLE' | 'BUFFERING' | 'PLAYING' | 'PAUSED' | 'ERROR';

export type RepeatMode = 'OFF' | 'ALL' | 'ONE';

export interface SystemStatusInfo {
  source: string; // "YOUTUBE" | "SYNTH_ENGINE"
  connection: 'ACTIVE' | 'CONNECTING' | 'OFFLINE';
  playback: PlaybackStatus;
  archiveId: string;
  itemCount: number;
  statusText: string;
}

export interface ImportStep {
  text: string;
  completed: boolean;
  active: boolean;
}

export type PlayerMode = 'ARCHIVE' | 'MI6';

export type TurntableSpeed = 33 | 45 | 78;

