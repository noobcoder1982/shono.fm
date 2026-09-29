import { CURRENT_APP_VERSION, storage } from './storage';

export interface GitHubReleaseAsset {
  name: string;
  browser_download_url: string;
  size: number;
}

export interface GitHubRelease {
  tag_name: string;
  name: string;
  body: string;
  html_url: string;
  published_at: string;
  assets: GitHubReleaseAsset[];
}

export interface UpdateState {
  isChecking: boolean;
  hasUpdate: boolean;
  currentVersion: string;
  latestVersion: string;
  releaseTitle: string;
  releaseNotes: string;
  releaseUrl: string;
  downloadUrl: string | null;
  isDownloading: boolean;
  downloadPercent: number;
  isReadyToRestart: boolean;
  error: string | null;
  lastChecked: number | null;
}

type UpdateListener = (state: UpdateState) => void;

function cleanVersion(v: string): number[] {
  const cleaned = v.replace(/^v/i, '').trim();
  const parts = cleaned.split('.').map((p) => parseInt(p, 10) || 0);
  while (parts.length < 3) parts.push(0);
  return parts;
}

export function isNewerVersion(latest: string, current: string): boolean {
  const [latMaj, latMin, latPatch] = cleanVersion(latest);
  const [curMaj, curMin, curPatch] = cleanVersion(current);

  if (latMaj > curMaj) return true;
  if (latMaj < curMaj) return false;
  if (latMin > curMin) return true;
  if (latMin < curMin) return false;
  return latPatch > curPatch;
}

class UpdateService {
  private state: UpdateState = {
    isChecking: false,
    hasUpdate: false,
    currentVersion: CURRENT_APP_VERSION,
    latestVersion: CURRENT_APP_VERSION,
    releaseTitle: '',
    releaseNotes: '',
    releaseUrl: '',
    downloadUrl: null,
    isDownloading: false,
    downloadPercent: 0,
    isReadyToRestart: false,
    error: null,
    lastChecked: null,
  };

  private listeners = new Set<UpdateListener>();
  private checkInterval: any = null;
  private progressUnsubscribe: (() => void) | null = null;

  constructor() {
    this.init();
  }

  private async init() {
    // Read exact version from Electron if running in desktop environment
    if (typeof window !== 'undefined' && (window as any).electronAPI?.getAppVersion) {
      try {
        const electronVer = await (window as any).electronAPI.getAppVersion();
        if (electronVer) {
          this.state.currentVersion = electronVer;
        }
      } catch {}
    }

    // Listen to download progress from Electron IPC
    if (typeof window !== 'undefined' && (window as any).electronAPI?.onUpdateProgress) {
      this.progressUnsubscribe = (window as any).electronAPI.onUpdateProgress((progress: any) => {
        this.updateState({
          downloadPercent: progress.percent || 0,
          isDownloading: progress.percent < 100,
          isReadyToRestart: progress.percent >= 100,
        });
      });
    }

    // Initial check after 4 seconds to not block startup
    setTimeout(() => {
      this.checkForUpdates();
    }, 4000);

    // Periodic check every 30 minutes
    this.checkInterval = setInterval(() => {
      this.checkForUpdates();
    }, 30 * 60 * 1000);
  }

  public getState(): UpdateState {
    return { ...this.state };
  }

  public subscribe(listener: UpdateListener): () => void {
    this.listeners.add(listener);
    listener(this.getState());
    return () => this.listeners.delete(listener);
  }

  private updateState(partial: Partial<UpdateState>) {
    this.state = { ...this.state, ...partial };
    this.listeners.forEach((listener) => {
      try {
        listener(this.getState());
      } catch (e) {
        console.warn('Update listener error', e);
      }
    });
  }

  public async checkForUpdates(): Promise<boolean> {
    const settings = storage.getSettings();
    const repo = settings.githubRepo || 'noobcoder1982/shono.fm';

    this.updateState({ isChecking: true, error: null });

    try {
      const apiUrl = `https://api.github.com/repos/${repo}/releases/latest`;
      const res = await fetch(apiUrl, {
        headers: {
          Accept: 'application/vnd.github.v3+json',
        },
      });

      if (!res.ok) {
        if (res.status === 404) {
          console.log(`[UpdateService] No published releases yet on https://github.com/${repo}`);
          this.updateState({ isChecking: false, hasUpdate: false, lastChecked: Date.now() });
          return false;
        }
        throw new Error(`GitHub API error (${res.status})`);
      }

      const release: GitHubRelease = await res.json();
      const latestTag = release.tag_name || '';
      const hasNew = isNewerVersion(latestTag, this.state.currentVersion);

      // Look for a Windows installer (.exe) in release assets
      const exeAsset = release.assets?.find(
        (a) => a.name.toLowerCase().endsWith('.exe') && !a.name.toLowerCase().includes('blockmap')
      );

      this.updateState({
        isChecking: false,
        hasUpdate: hasNew,
        latestVersion: latestTag.replace(/^v/i, ''),
        releaseTitle: release.name || `Release ${latestTag}`,
        releaseNotes: release.body || 'New features, precision sound engineering, and performance enhancements.',
        releaseUrl: release.html_url,
        downloadUrl: exeAsset ? exeAsset.browser_download_url : release.html_url,
        lastChecked: Date.now(),
      });

      return hasNew;
    } catch (err: any) {
      console.warn('[UpdateService] Check update error:', err);
      this.updateState({
        isChecking: false,
        error: err.message || 'Unable to check for updates',
        lastChecked: Date.now(),
      });
      return false;
    }
  }

  public async downloadAndRestart(): Promise<void> {
    if (!this.state.downloadUrl) {
      if (this.state.releaseUrl) {
        window.open(this.state.releaseUrl, '_blank');
      }
      return;
    }

    // If already downloaded and ready to restart
    if (this.state.isReadyToRestart) {
      if (typeof window !== 'undefined' && (window as any).electronAPI?.restartApp) {
        (window as any).electronAPI.restartApp();
      }
      return;
    }

    // In Electron with an .exe asset: download and run installer
    if (
      typeof window !== 'undefined' &&
      (window as any).electronAPI?.downloadAndInstallUpdate &&
      this.state.downloadUrl.toLowerCase().endsWith('.exe')
    ) {
      this.updateState({ isDownloading: true, downloadPercent: 0, error: null });
      try {
        const res = await (window as any).electronAPI.downloadAndInstallUpdate({
          downloadUrl: this.state.downloadUrl,
        });
        if (res && !res.success) {
          throw new Error(res.error || 'Failed to download installer');
        }
      } catch (err: any) {
        this.updateState({ isDownloading: false, error: err.message });
      }
    } else {
      // Fallback: Open GitHub release download in default browser
      window.open(this.state.downloadUrl || this.state.releaseUrl, '_blank');
    }
  }

  public dismissUpdate() {
    this.updateState({ hasUpdate: false });
  }

  public destroy() {
    if (this.checkInterval) clearInterval(this.checkInterval);
    if (this.progressUnsubscribe) this.progressUnsubscribe();
  }
}

export const updateService = new UpdateService();
