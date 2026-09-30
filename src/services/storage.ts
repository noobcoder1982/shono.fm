import type { Archive, Track, PlayerMode, TurntableSpeed } from '../types';

const STORAGE_KEYS = {
  ARCHIVES: 'bma_archives_v1',
  ACTIVE_ARCHIVE_ID: 'bma_active_archive_id_v1',
  QUEUE: 'bma_queue_v1',
  LIKED_TRACKS: 'bma_liked_tracks_v1',
  SETTINGS: 'bma_settings_v1',
  PLAYER_MODE: 'bma_player_mode_v1',
  VINYL_CRACKLE: 'bma_vinyl_crackle_v1',
  TURNTABLE_SPEED: 'bma_turntable_speed_v1',
  LAST_SEEN_CHANGELOG: 'bma_last_seen_changelog_v1',
  YT_ALTERNATIVE_CACHE: 'bma_yt_alternative_cache_v1',
};

export const CURRENT_APP_VERSION = '1.4.1';

export type BrutalistTheme =
  | 'noir'
  | 'concrete'
  | 'braun'
  | 'tapedeck'
  | 'phosphor'
  | 'swiss'
  | 'stealth'
  | 'dark'
  | 'dark_plus'
  | 'blue'
  | 'beige'
  | 'green';
export type DynamicColorSource = 'album' | 'fixed';
export type LyricsFontSize = 'small' | 'medium' | 'large';
export type CustomCursorStyle = 'none' | 'dot' | 'ring' | 'crosshair';

export interface AppSettings {
  youtubeApiKey: string;
  autoPlayNext: boolean;
  synthFallbackEnabled: boolean;
  reducedMotion: boolean;
  theme: BrutalistTheme;
  playerMode: PlayerMode;
  vinylCrackle: boolean;
  turntableSpeed: TurntableSpeed;
  githubRepo: string;
  dynamicColorsEnabled: boolean;
  colorSource: DynamicColorSource;
  dynamicColorIntensity: number;
  lyricsEnabled: boolean;
  lyricsFontSize: LyricsFontSize;
  autoScrollLyrics: boolean;
  equalizerEnabled: boolean;
  discordRpcEnabled: boolean;
  discordClientId: string;
  // v1.2.0 New Settings
  minimizeToTrayOnClose: boolean;
  crossfadeDuration: number; // 0 to 8 seconds
  betaInfiniteArchive: boolean; // Radio mode
  betaWordKaraoke: boolean; // Word-by-word karaoke text glow
  showBpmKeyBadges: boolean; // Track row hardware tags
  // v1.3.0 UI & Experience Settings
  roundedCorners: boolean;
  customCursor: CustomCursorStyle;
}

// Securely loaded from environment variables (Vite / Vercel: VITE_YOUTUBE_API_KEY)
export const DEFAULT_YOUTUBE_API_KEY =
  (import.meta.env.VITE_YOUTUBE_API_KEY as string) || '';

const DEFAULT_SETTINGS: AppSettings = {
  youtubeApiKey: DEFAULT_YOUTUBE_API_KEY,
  autoPlayNext: true,
  synthFallbackEnabled: false,
  reducedMotion: false,
  theme: 'noir',
  playerMode: 'ARCHIVE',
  vinylCrackle: false,
  turntableSpeed: 33,
  githubRepo: 'noobcoder1982/shono.fm',
  dynamicColorsEnabled: true,
  colorSource: 'album',
  dynamicColorIntensity: 0.65,
  lyricsEnabled: true,
  lyricsFontSize: 'medium',
  autoScrollLyrics: true,
  equalizerEnabled: true,
  discordRpcEnabled: true,
  discordClientId: '1348057284918284348',
  minimizeToTrayOnClose: true,
  crossfadeDuration: 3,
  betaInfiniteArchive: true,
  betaWordKaraoke: true,
  showBpmKeyBadges: true,
  roundedCorners: true,
  customCursor: 'none',
};

// Helper to mirror updates to Electron persistent filesystem vault
function syncToVault() {
  if (typeof window !== 'undefined' && (window as any).electronAPI?.saveVault) {
    try {
      const archives = storage.getArchives() || [];
      const activeArchiveId = storage.getActiveArchiveId();
      const queue = storage.getQueue();
      const likedTracks = storage.getLikedTracks();
      const settings = storage.getSettings();

      (window as any).electronAPI.saveVault({
        archives,
        activeArchiveId,
        queue,
        likedTracks,
        settings,
        lastSaved: Date.now(),
      });
    } catch (e) {
      console.warn('[storage] Failed to sync to vault:', e);
    }
  }
}

export const storage = {
  async syncFromVault(): Promise<Archive[] | null> {
    if (typeof window === 'undefined' || !(window as any).electronAPI?.loadVault) {
      return null;
    }
    try {
      const res = await (window as any).electronAPI.loadVault();
      if (res?.success && res.data) {
        const vaultArchives: Archive[] = res.data.archives || [];
        const localArchives = this.getArchives() || [];

        // If local is empty and vault has archives, restore everything from vault!
        if (localArchives.length === 0 && vaultArchives.length > 0) {
          localStorage.setItem(STORAGE_KEYS.ARCHIVES, JSON.stringify(vaultArchives));
          if (res.data.activeArchiveId) {
            localStorage.setItem(STORAGE_KEYS.ACTIVE_ARCHIVE_ID, res.data.activeArchiveId);
          }
          if (res.data.likedTracks) {
            localStorage.setItem(STORAGE_KEYS.LIKED_TRACKS, JSON.stringify(res.data.likedTracks));
          }
          if (res.data.queue) {
            localStorage.setItem(STORAGE_KEYS.QUEUE, JSON.stringify(res.data.queue));
          }
          return vaultArchives;
        }

        // Merge any vault archives that are missing locally
        const existingIds = new Set(localArchives.map((a) => a.id));
        const missing = vaultArchives.filter((a) => !existingIds.has(a.id));
        if (missing.length > 0) {
          const merged = [...localArchives, ...missing];
          localStorage.setItem(STORAGE_KEYS.ARCHIVES, JSON.stringify(merged));
          syncToVault();
          return merged;
        }

        // Keep vault synchronized with local
        syncToVault();
      }
    } catch (e) {
      console.warn('[storage] Error syncing from vault:', e);
    }
    return null;
  },

  getArchives(): Archive[] | null {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ARCHIVES);
      if (!data) return null;
      const parsed: Archive[] = JSON.parse(data);
      // Clean out any legacy demo archives if user had them saved previously
      const cleaned = parsed.filter(
        (a) =>
          !a.id.startsWith('archive_001_') &&
          !a.id.startsWith('archive_002_') &&
          !a.id.startsWith('archive_003_') &&
          !a.id.startsWith('archive_007_') &&
          !a.id.startsWith('archive_004_')
      );
      if (cleaned.length !== parsed.length) {
        localStorage.setItem(STORAGE_KEYS.ARCHIVES, JSON.stringify(cleaned));
      }
      return cleaned;
    } catch (e) {
      console.error('Failed to load archives from storage', e);
      return null;
    }
  },

  saveArchives(archives: Archive[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.ARCHIVES, JSON.stringify(archives));
      syncToVault();
    } catch (e) {
      console.error('Failed to save archives to storage', e);
    }
  },

  addArchive(archive: Archive) {
    const existing = this.getArchives() || [];
    const updated = [archive, ...existing.filter((a) => a.id !== archive.id)];
    this.saveArchives(updated);
  },

  getActiveArchiveId(): string | null {
    try {
      const id = localStorage.getItem(STORAGE_KEYS.ACTIVE_ARCHIVE_ID);
      if (
        id &&
        (id.startsWith('archive_001_') ||
          id.startsWith('archive_002_') ||
          id.startsWith('archive_003_') ||
          id.startsWith('archive_007_') ||
          id.startsWith('archive_004_'))
      ) {
        localStorage.removeItem(STORAGE_KEYS.ACTIVE_ARCHIVE_ID);
        return null;
      }
      return id;
    } catch {
      return null;
    }
  },

  setActiveArchiveId(id: string) {
    try {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_ARCHIVE_ID, id);
      syncToVault();
    } catch (e) {
      console.error(e);
    }
  },

  getQueue(): Track[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.QUEUE);
      if (!data) return [];
      const parsed: Track[] = JSON.parse(data);
      const cleaned = parsed.filter(
        (t) =>
          !t.id.startsWith('track_nd_') &&
          !t.id.startsWith('track_dune_') &&
          !t.id.startsWith('track_tc_') &&
          !t.id.startsWith('track_mi6_') &&
          !t.id.startsWith('track_gs_')
      );
      if (cleaned.length !== parsed.length) {
        localStorage.setItem(STORAGE_KEYS.QUEUE, JSON.stringify(cleaned));
      }
      return cleaned;
    } catch {
      return [];
    }
  },

  saveQueue(queue: Track[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.QUEUE, JSON.stringify(queue));
      syncToVault();
    } catch (e) {
      console.error(e);
    }
  },

  getLikedTracks(): string[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.LIKED_TRACKS);
      if (!data) return [];
      const parsed: string[] = JSON.parse(data);
      const cleaned = parsed.filter(
        (id) =>
          !id.startsWith('track_nd_') &&
          !id.startsWith('track_dune_') &&
          !id.startsWith('track_tc_') &&
          !id.startsWith('track_mi6_') &&
          !id.startsWith('track_gs_')
      );
      if (cleaned.length !== parsed.length) {
        localStorage.setItem(STORAGE_KEYS.LIKED_TRACKS, JSON.stringify(cleaned));
      }
      return cleaned;
    } catch {
      return [];
    }
  },

  toggleLikedTrack(trackId: string): boolean {
    try {
      const current = this.getLikedTracks();
      const exists = current.includes(trackId);
      const updated = exists ? current.filter((id) => id !== trackId) : [...current, trackId];
      localStorage.setItem(STORAGE_KEYS.LIKED_TRACKS, JSON.stringify(updated));
      syncToVault();
      return !exists;
    } catch {
      return false;
    }
  },

  getSettings(): AppSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      const parsed = data ? JSON.parse(data) : {};

      // Sanitize legacy or deprecated themes
      const validThemes: BrutalistTheme[] = [
        'noir',
        'concrete',
        'braun',
        'tapedeck',
        'phosphor',
        'swiss',
        'stealth',
        'dark',
        'dark_plus',
        'blue',
        'beige',
        'green',
      ];
      let theme: BrutalistTheme = parsed.theme;
      if (!validThemes.includes(theme)) {
        if (theme === ('amber' as any)) theme = 'braun';
        else if (theme === ('acid' as any)) theme = 'phosphor';
        else if (theme === ('paper' as any)) theme = 'swiss';
        else theme = 'noir';
      }

      return {
        ...DEFAULT_SETTINGS,
        ...parsed,
        theme,
        youtubeApiKey: DEFAULT_YOUTUBE_API_KEY, // Permanently enforce default API key
      };
    } catch {
      return DEFAULT_SETTINGS;
    }
  },

  saveSettings(settings: Partial<AppSettings>) {
    try {
      const current = this.getSettings();
      const updated = {
        ...current,
        ...settings,
        youtubeApiKey: DEFAULT_YOUTUBE_API_KEY, // Changes to API key not permitted
      };
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
      syncToVault();

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('shono-settings-updated', { detail: updated }));
      }

      return updated;
    } catch (e) {
      console.error(e);
      return DEFAULT_SETTINGS;
    }
  },

  getPlayerMode(): PlayerMode {
    return 'ARCHIVE';
  },

  savePlayerMode(_mode: PlayerMode) {
    try {
      localStorage.setItem(STORAGE_KEYS.PLAYER_MODE, 'ARCHIVE');
    } catch (e) {
      console.error(e);
    }
  },

  getVinylCrackle(): boolean {
    try {
      const val = localStorage.getItem(STORAGE_KEYS.VINYL_CRACKLE);
      return val !== null ? val === 'true' : true;
    } catch {
      return true;
    }
  },

  saveVinylCrackle(enabled: boolean) {
    try {
      localStorage.setItem(STORAGE_KEYS.VINYL_CRACKLE, String(enabled));
    } catch (e) {
      console.error(e);
    }
  },

  getTurntableSpeed(): TurntableSpeed {
    try {
      const spd = localStorage.getItem(STORAGE_KEYS.TURNTABLE_SPEED);
      if (spd === '45') return 45;
      if (spd === '78') return 78;
      return 33;
    } catch {
      return 33;
    }
  },

  saveTurntableSpeed(speed: TurntableSpeed) {
    try {
      localStorage.setItem(STORAGE_KEYS.TURNTABLE_SPEED, String(speed));
    } catch (e) {
      console.error(e);
    }
  },

  getLastSeenChangelogVersion(): string | null {
    try {
      return localStorage.getItem(STORAGE_KEYS.LAST_SEEN_CHANGELOG);
    } catch {
      return null;
    }
  },

  saveLastSeenChangelogVersion(version: string = CURRENT_APP_VERSION) {
    try {
      localStorage.setItem(STORAGE_KEYS.LAST_SEEN_CHANGELOG, version);
    } catch (e) {
      console.error(e);
    }
  },

  shouldShowChangelog(): boolean {
    try {
      const seen = localStorage.getItem(STORAGE_KEYS.LAST_SEEN_CHANGELOG);
      return seen !== CURRENT_APP_VERSION;
    } catch {
      return true;
    }
  },

  getCachedAlternativeId(originalId: string): string | null {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.YT_ALTERNATIVE_CACHE);
      if (!data) return null;
      const map = JSON.parse(data);
      return map[originalId] || null;
    } catch {
      return null;
    }
  },

  setCachedAlternativeId(originalId: string, altId: string) {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.YT_ALTERNATIVE_CACHE);
      const map = data ? JSON.parse(data) : {};
      map[originalId] = altId;
      localStorage.setItem(STORAGE_KEYS.YT_ALTERNATIVE_CACHE, JSON.stringify(map));
    } catch (e) {
      console.error(e);
    }
  },

  updateTrackYoutubeId(trackId: string, newYtId: string) {
    try {
      const archives = this.getArchives();
      if (!archives) return;
      let changed = false;
      archives.forEach((arch) => {
        arch.tracks?.forEach((tr) => {
          if (tr.id === trackId || tr.youtubeId === trackId) {
            tr.youtubeId = newYtId;
            changed = true;
          }
        });
      });
      if (changed) {
        this.saveArchives(archives);
      }
    } catch (e) {
      console.error(e);
    }
  },
};

