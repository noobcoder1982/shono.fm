/* ==========================================================================
   SHONO.FM — Sound Effects (SFX) Service
   Tactile audio feedback for UI transitions, clicks, and loader completions.
   ========================================================================== */

class SfxService {
  private audioMap: Map<string, HTMLAudioElement> = new Map();

  constructor() {
    // Pre-create audio instances for zero-latency playback
    if (typeof window !== 'undefined') {
      const sounds = {
        'hitech-click': '/sfx/hi-tech-click-.wav',
        'camera-click': '/sfx/camera-click.mp3',
        'mouse-click': '/sfx/mouse-click.mp3',
        'flick': '/sfx/flick.mp3',
        'woosh': '/sfx/woosh.mp3',
        'charge': '/sfx/charge.mp3',
      };

      Object.entries(sounds).forEach(([key, src]) => {
        try {
          const audio = new Audio(src);
          audio.preload = 'auto';
          this.audioMap.set(key, audio);
        } catch {
          // ignore in SSR / unsupported environments
        }
      });
    }
  }

  /**
   * Plays a UI sound effect with optional volume override (0.0 to 1.0)
   */
  public play(name: 'hitech-click' | 'camera-click' | 'mouse-click' | 'flick' | 'woosh' | 'charge', volume = 0.55): void {
    try {
      const existing = this.audioMap.get(name);
      if (existing) {
        // Clone node or reset currentTime to allow overlapping rapid triggers
        const sound = existing.cloneNode() as HTMLAudioElement;
        sound.volume = Math.max(0, Math.min(1, volume));
        sound.play().catch(() => {
          // Browser autoplay policy might block audio before user interaction
        });
      } else {
        const audio = new Audio(`/sfx/${name}.mp3`);
        audio.volume = volume;
        audio.play().catch(() => {});
      }
    } catch {
      // Audio playback failed silently
    }
  }
}

export const sfx = new SfxService();
export default sfx;
