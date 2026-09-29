import { storage } from './storage';
import { getBestArtworkUrl } from './artworkService';
import type { Track, PlaybackStatus } from '../types';

class DiscordRpcService {
  private lastTrackId: string | null = null;
  private lastStatus: PlaybackStatus | null = null;
  private lastSentTime = 0;
  private lastSeekTime = 0;

  public init() {
    this.syncConfig();
  }

  public syncConfig() {
    if (typeof window === 'undefined') return;
    const electron = (window as any).electronAPI;
    if (!electron?.updateDiscordConfig) return;

    const settings = storage.getSettings();
    electron.updateDiscordConfig({
      enabled: Boolean(settings.discordRpcEnabled),
      clientId: settings.discordClientId || '1348057284918284348',
    }).catch(() => {});
  }

  public async getStatus(): Promise<{ enabled: boolean; isConnected: boolean; isReady: boolean; clientId: string } | null> {
    if (typeof window === 'undefined') return null;
    const electron = (window as any).electronAPI;
    if (!electron?.getDiscordStatus) return null;
    try {
      return await electron.getDiscordStatus();
    } catch {
      return null;
    }
  }

  public async updateActivity(
    track: Track | null,
    status: PlaybackStatus,
    currentTime: number,
    duration: number,
    archiveName?: string
  ) {
    if (typeof window === 'undefined') return;
    const electron = (window as any).electronAPI;
    if (!electron?.setDiscordActivity) return;

    const settings = storage.getSettings();
    if (!settings.discordRpcEnabled) {
      this.clearActivity();
      return;
    }

    if (!track || status === 'IDLE' || status === 'ERROR') {
      this.clearActivity();
      return;
    }

    const now = Date.now();
    const isPlaying = status === 'PLAYING';
    const isNewTrack = track.id !== this.lastTrackId;
    const isStatusChanged = status !== this.lastStatus;
    const isMajorSeek = Math.abs(currentTime - this.lastSeekTime) > 3;

    // Throttle: Send on track change, status change, seek, or every 20s while playing
    if (!isNewTrack && !isStatusChanged && !isMajorSeek && (now - this.lastSentTime < 20000)) {
      return;
    }

    this.lastTrackId = track.id;
    this.lastStatus = status;
    this.lastSentTime = now;
    this.lastSeekTime = currentTime;

    let artwork = track.thumbnail || '';
    try {
      artwork = await getBestArtworkUrl(track);
    } catch {}

    const DISCORD_FALLBACK_ARTWORK = 'https://cdn.jsdelivr.net/gh/noobcoder1982/shono.fm/public/assets/now_playing_art.jpg';

    const safeArtwork = (artwork && artwork.startsWith('http'))
      ? artwork
      : (track.thumbnail && track.thumbnail.startsWith('http'))
        ? track.thumbnail
        : DISCORD_FALLBACK_ARTWORK;

    const safeUrl = track.youtubeId
      ? `https://www.youtube.com/watch?v=${track.youtubeId}`
      : (track.url && track.url.startsWith('http') ? track.url : 'https://shono.fm');

    electron.setDiscordActivity({
      title: (track.title || 'Audio Stream').trim().slice(0, 128),
      artist: (track.artist || 'Unknown Artist').trim().slice(0, 128),
      album: (track.album || archiveName || 'SHONO.FM Precision Archive').trim().slice(0, 128),
      artworkUrl: safeArtwork,
      isPlaying,
      currentTime: Math.floor(currentTime),
      duration: Math.floor(duration),
      trackUrl: safeUrl,
    }).catch(() => {});
  }

  public clearActivity() {
    this.lastTrackId = null;
    this.lastStatus = null;
    if (typeof window === 'undefined') return;
    const electron = (window as any).electronAPI;
    if (electron?.clearDiscordActivity) {
      electron.clearDiscordActivity().catch(() => {});
    }
  }
}

export const discordRpcService = new DiscordRpcService();
