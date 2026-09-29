import type { Track, PlaybackStatus } from '../types';
import { getBestArtworkUrl } from './artworkService';

interface MediaSessionCallbacks {
  onPlay: () => void;
  onPause: () => void;
  onNext: () => void;
  onPrev: () => void;
  onSeek: (seconds: number) => void;
}

class MediaSessionService {
  private callbacks: MediaSessionCallbacks | null = null;
  private isInitialized = false;

  public init(callbacks: MediaSessionCallbacks) {
    this.callbacks = callbacks;
    if (this.isInitialized) return;
    this.isInitialized = true;

    // 1. Browser & Windows SMTC Native Media Session API
    if (typeof window !== 'undefined' && 'mediaSession' in navigator) {
      try {
        navigator.mediaSession.setActionHandler('play', () => this.callbacks?.onPlay());
        navigator.mediaSession.setActionHandler('pause', () => this.callbacks?.onPause());
        navigator.mediaSession.setActionHandler('previoustrack', () => this.callbacks?.onPrev());
        navigator.mediaSession.setActionHandler('nexttrack', () => this.callbacks?.onNext());
        navigator.mediaSession.setActionHandler('seekto', (details) => {
          if (typeof details.seekTime === 'number') {
            this.callbacks?.onSeek(details.seekTime);
          }
        });
      } catch (err) {
        console.warn('[MediaSession] Native action registration warning:', err);
      }
    }

    // 2. Electron Global Media Keys & Tray IPC Commands
    if (typeof window !== 'undefined') {
      const electron = (window as any).electronAPI;
      if (electron?.onMediaCommand) {
        electron.onMediaCommand((cmd: string) => {
          if (!this.callbacks) return;
          switch (cmd) {
            case 'play-pause':
              this.callbacks.onPlay();
              break;
            case 'pause':
              this.callbacks.onPause();
              break;
            case 'next':
              this.callbacks.onNext();
              break;
            case 'prev':
              this.callbacks.onPrev();
              break;
          }
        });
      }
    }
  }

  public updateTrack(track: Track | null, status: PlaybackStatus, currentTime = 0, duration = 0, albumName?: string) {
    if (typeof window === 'undefined') return;

    // Electron Tray Update
    const electron = (window as any).electronAPI;
    if (electron?.updateTrayTrack) {
      if (track) {
        electron.updateTrayTrack({ title: track.title, artist: track.artist });
      } else {
        electron.updateTrayTrack({ title: '', artist: '' });
      }
    }

    // Windows 10/11 SMTC & Browser MediaSession
    if ('mediaSession' in navigator) {
      try {
        if (!track) {
          navigator.mediaSession.metadata = null;
          navigator.mediaSession.playbackState = 'none';
          return;
        }

        const isPlaying = status === 'PLAYING';
        navigator.mediaSession.playbackState = isPlaying ? 'playing' : (status === 'PAUSED' ? 'paused' : 'none');

        const initialArtwork =
          track.thumbnail ||
          'https://raw.githubusercontent.com/noobcoder1982/shono.fm/main/public/icon.png';

        const updateMetadata = (artUrl: string) => {
          if (!('mediaSession' in navigator) || !navigator.mediaSession) return;
          navigator.mediaSession.metadata = new MediaMetadata({
            title: track.title || 'Untitled Track',
            artist: track.artist || 'Unknown Artist',
            album: track.album || albumName || 'SHONO.FM Precision Archive',
            artwork: [
              { src: artUrl, sizes: '96x96', type: 'image/jpeg' },
              { src: artUrl, sizes: '128x128', type: 'image/jpeg' },
              { src: artUrl, sizes: '256x256', type: 'image/jpeg' },
              { src: artUrl, sizes: '512x512', type: 'image/jpeg' },
            ],
          });
        };

        updateMetadata(initialArtwork);

        getBestArtworkUrl(track)
          .then((resolved) => {
            if (resolved && resolved !== initialArtwork) {
              updateMetadata(resolved);
            }
          })
          .catch(() => {});

        if (duration > 0 && currentTime >= 0 && 'setPositionState' in navigator.mediaSession) {
          try {
            navigator.mediaSession.setPositionState({
              duration: Math.max(duration, 1),
              playbackRate: 1,
              position: Math.min(Math.max(currentTime, 0), duration),
            });
          } catch {}
        }
      } catch (err) {
        console.warn('[MediaSession] State update notice:', err);
      }
    }
  }
}

export const mediaSessionService = new MediaSessionService();
