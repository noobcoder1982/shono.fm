import type { Track, PlaybackStatus } from '../types';
import { storage } from './storage';

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

type StatusCallback = (status: PlaybackStatus) => void;
type TimeCallback = (currentTime: number, duration: number) => void;
type EndCallback = () => void;
type ErrorCallback = (errorMsg: string) => void;

class AudioEngine {
  private ytPlayer: any = null;
  private ytReady = false;
  private isYtActive = false;
  private currentTrack: Track | null = null;
  private pendingTrack: Track | null = null;
  private volume = 80;
  private isMuted = false;
  private playbackStatus: PlaybackStatus = 'IDLE';

  // Web Audio Fallback / Synth Engine
  private audioCtx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private synthInterval: number | null = null;
  private synthTime = 0;
  private synthDuration = 240;
  private isSynthPlaying = false;
  private gainNode: GainNode | null = null;

  // Procedural Vinyl Crackle Generator
  private crackleGainNode: GainNode | null = null;
  private crackleSourceNode: AudioBufferSourceNode | null = null;
  private isCrackleEnabled = false;

  // Web Audio Equalizer (10 ISO Bands)
  private eqFilters: BiquadFilterNode[] = [];
  private preampNode: GainNode | null = null;
  private eqBands: number[] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  private isEqEnabled = true;
  private preampDb = 0;

  // HTMLAudioElement & MediaElementAudioSourceNode (Single Instance)
  private audio: HTMLAudioElement | null = null;
  private sourceNode: MediaElementAudioSourceNode | null = null;
  private isAudioElementPlaying = false;

  // Listeners
  private onStatusChange: StatusCallback | null = null;
  private onTimeUpdate: TimeCallback | null = null;
  private onTrackEnded: EndCallback | null = null;
  private onError: ErrorCallback | null = null;
  private timeTicker: number | null = null;
  private healingAttempts = new Map<string, number>();
  private isCrossfadingTriggered = false;

  constructor() {
    this.initYouTube();
    if (typeof window !== 'undefined') {
      this.initWebAudio();
      window.addEventListener('shono-settings-updated', (e: any) => {
        const s = e.detail;
        if (s && typeof s.equalizerEnabled === 'boolean') {
          this.setEqEnabled(s.equalizerEnabled);
        }
      });
    }
  }

  private initYouTube() {
    if (typeof window === 'undefined') return;

    const setupPlayer = () => {
      if (!window.YT || !window.YT.Player) return;
      if (this.ytReady && this.ytPlayer) return;

      if (!document.body) {
        window.addEventListener('DOMContentLoaded', setupPlayer);
        return;
      }

      // Check if previous container or iframe exists (e.g. across HMR or re-mount)
      let container = document.getElementById('youtube-engine-mount');
      if (container && container.tagName === 'IFRAME') {
        const div = document.createElement('div');
        div.id = 'youtube-engine-mount';
        container.parentNode?.replaceChild(div, container);
        container = div;
      } else if (!container) {
        container = document.createElement('div');
        container.id = 'youtube-engine-mount';
        document.body.appendChild(container);
      }

      // Position off-screen with full opacity and standard dimensions (240x240 >= 200x200 min)
      // Chromium mutes or halts audio decoding if opacity < 0.1 or if completely occluded in-viewport.
      container.style.position = 'fixed';
      container.style.left = '-9999px';
      container.style.top = '-9999px';
      container.style.width = '240px';
      container.style.height = '240px';
      container.style.zIndex = '-9999';
      container.style.opacity = '1';
      container.style.pointerEvents = 'none';

      // Dynamically guarantee YouTube IFrame API script is in document head
      if (
        typeof document !== 'undefined' &&
        !(window as any).YT &&
        !document.getElementById('yt-iframe-api-script') &&
        !document.querySelector('script[src*="iframe_api"]')
      ) {
        const tag = document.createElement('script');
        tag.id = 'yt-iframe-api-script';
        tag.src = 'https://www.youtube.com/iframe_api';
        document.head.appendChild(tag);
      }

      const safeOrigin = (typeof window !== 'undefined' && window.location.origin && window.location.origin !== 'null' && !window.location.origin.startsWith('file:'))
        ? window.location.origin
        : 'https://shono.fm';

      console.log('[DEBUG AudioEngine] initYouTube safeOrigin:', safeOrigin);

      try {
        this.ytPlayer = new window.YT.Player('youtube-engine-mount', {
          height: '240',
          width: '240',
          playerVars: {
            autoplay: 0,
            controls: 0,
            disablekb: 1,
            fs: 0,
            modestbranding: 1,
            playsinline: 1,
            rel: 0,
            enablejsapi: 1,
            origin: safeOrigin,
            widget_referrer: safeOrigin,
          },
          events: {
            onReady: (event: any) => {
              this.ytReady = true;
              this.ytPlayer = event.target || this.ytPlayer;
              console.log('[DEBUG AudioEngine] onReady! isMuted:', this.ytPlayer?.isMuted?.(), 'volume:', this.ytPlayer?.getVolume?.());
              if (this.ytPlayer) {
                try {
                  if (typeof this.ytPlayer.unMute === 'function' && !this.isMuted) {
                    this.ytPlayer.unMute();
                  }
                  if (typeof this.ytPlayer.setVolume === 'function') {
                    this.ytPlayer.setVolume(this.volume);
                  }
                } catch (e) {}
              }
              // If a track was queued before YouTube finished initialization, play it now
              if (this.pendingTrack) {
                const queued = this.pendingTrack;
                this.pendingTrack = null;
                this.playTrack(queued);
              }
            },
            onStateChange: (event: any) => {
              this.handleYtStateChange(event.data);
            },
            onError: (err: any) => {
              const errCode = typeof err === 'object' ? err?.data : Number(err);

              switch (errCode) {
                case 150:
                case 101:
                  console.warn('[YouTube] Embedding disabled by video owner (Error 150/101). Triggering embeddable alternative stream resolver...');
                  break;
                case 153:
                  console.warn('[YouTube] Missing HTTP Referer / client identification (Error 153).');
                  break;
                case 100:
                  console.warn('[YouTube] Video unavailable or marked private (Error 100).');
                  break;
                case 2:
                  console.warn('[YouTube] Invalid video ID parameter (Error 2).');
                  break;
                case 5:
                  console.warn('[YouTube] HTML5 player error (Error 5).');
                  break;
                default:
                  console.warn('[YouTube] Playback error code:', errCode, err);
              }

              // Only trigger fallback if an actual user track was playing
              if (this.isYtActive && this.currentTrack) {
                if (errCode === 150 || errCode === 101 || errCode === 100 || errCode === 2) {
                  this.autoHealRestrictedTrack(this.currentTrack, errCode);
                  return;
                }
                const errorDetail = errCode === 153
                  ? 'YouTube client identification error (Error 153)'
                  : `Unable to stream audio for this track (Error ${errCode || 'Unknown'})`;
                if (this.onError) this.onError(errorDetail);
                this.fallbackToSynth();
              }
            },
          },
        });
      } catch (e) {
        console.error('[DEBUG AudioEngine] YouTube init error:', e);
      }
    };

    // Poller to guarantee setupPlayer runs even if onYouTubeIframeAPIReady fired earlier
    let attempts = 0;
    const poller = setInterval(() => {
      attempts++;
      if (window.YT && window.YT.Player && document.body) {
        clearInterval(poller);
        setupPlayer();
      } else if (attempts > 60) {
        clearInterval(poller);
      }
    }, 100);

    const prevCallback = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      if (prevCallback) prevCallback();
      clearInterval(poller);
      setupPlayer();
    };
  }

  private initWebAudio() {
    if (this.audioCtx) return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      this.audioCtx = new AudioContextClass();
      this.analyser = this.audioCtx.createAnalyser();
      this.analyser.fftSize = 64;
      this.gainNode = this.audioCtx.createGain();
      this.gainNode.gain.value = (this.volume / 100) * 0.45; // Clear, audible master level

      // Preamp Gain Node (-6dB to +6dB)
      this.preampNode = this.audioCtx.createGain();
      this.preampNode.gain.value = Math.pow(10, this.preampDb / 20);

      // 10 ISO Equalizer Biquad Filters (32Hz to 16kHz)
      const FREQUENCIES = [32, 64, 125, 250, 500, 1000, 2000, 4000, 8000, 16000];
      this.eqFilters = FREQUENCIES.map((freq, idx) => {
        const filter = this.audioCtx!.createBiquadFilter();
        if (idx === 0) {
          filter.type = 'lowshelf';
        } else if (idx === FREQUENCIES.length - 1) {
          filter.type = 'highshelf';
        } else {
          filter.type = 'peaking';
          filter.Q.value = 1.4;
        }
        filter.frequency.value = freq;
        filter.gain.value = this.isEqEnabled ? (this.eqBands[idx] || 0) : 0;
        return filter;
      });

      // Pipeline Audio Path:
      // Audio Element / Current Playback (MediaElementAudioSourceNode / Synth Notes)
      //        ↓
      // preampNode (GainNode)
      //        ↓
      // eqFilters (10 BiquadFilterNodes in series: lowshelf -> 8 peaking -> highshelf)
      //        ↓
      // gainNode (Master Gain / volume control)
      //        ↓
      // analyser (AnalyserNode)
      //        ↓
      // destination (AudioContext.destination)
      this.preampNode.connect(this.eqFilters[0]);
      for (let i = 0; i < this.eqFilters.length - 1; i++) {
        this.eqFilters[i].connect(this.eqFilters[i + 1]);
      }
      this.eqFilters[this.eqFilters.length - 1].connect(this.gainNode);
      this.gainNode.connect(this.analyser);
      this.analyser.connect(this.audioCtx.destination);

      // Initialize single HTMLAudioElement & MediaElementAudioSourceNode
      if (!this.audio && typeof Audio !== 'undefined') {
        this.audio = new Audio();
        this.audio.crossOrigin = 'anonymous';
        this.audio.preload = 'auto';

        this.audio.addEventListener('play', () => {
          this.setStatus('PLAYING');
        });
        this.audio.addEventListener('pause', () => {
          if (this.isAudioElementPlaying) {
            this.setStatus('PAUSED');
          }
        });
        this.audio.addEventListener('ended', () => {
          this.setStatus('IDLE');
          this.isAudioElementPlaying = false;
          if (this.onTrackEnded) this.onTrackEnded();
        });
        this.audio.addEventListener('timeupdate', () => {
          if (this.isAudioElementPlaying && this.onTimeUpdate && this.audio) {
            const dur = this.audio.duration && !isNaN(this.audio.duration) && this.audio.duration > 0
              ? this.audio.duration
              : (this.currentTrack?.duration || 240);
            this.onTimeUpdate(this.audio.currentTime, dur);
          }
        });
        this.audio.addEventListener('error', (e) => {
          console.warn('[AudioEngine] HTMLAudioElement error, falling back to synth', e);
          this.isAudioElementPlaying = false;
          this.fallbackToSynth();
        });
      }

      if (!this.sourceNode && this.audio && this.audioCtx && this.preampNode) {
        try {
          this.sourceNode = this.audioCtx.createMediaElementSource(this.audio);
          this.sourceNode.connect(this.preampNode);
        } catch (err) {
          console.warn('[AudioEngine] createMediaElementSource error:', err);
        }
      }
    } catch (e) {
      console.warn('[AudioEngine] Web Audio init error:', e);
    }
  }

  public tryConnectYouTubeAudio() {
    // Note: YouTube iframe audio streams are served cross-origin from googlevideo.com without CORS headers.
    // Intercepting the <video> element with AudioContext.createMediaElementSource() forces Chromium
    // to output silence (zeros). YouTube audio is played directly and loudly through the native player.
  }

  public setEqualizerBands(bands: number[]) {
    this.initWebAudio();
    this.eqBands = [...bands];
    if (!this.audioCtx || this.eqFilters.length === 0) return;
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {});
    }
    const now = this.audioCtx.currentTime;
    this.eqFilters.forEach((filter, idx) => {
      const gainVal = this.isEqEnabled ? (this.eqBands[idx] ?? 0) : 0;
      try {
        filter.gain.cancelScheduledValues(now);
        filter.gain.setValueAtTime(filter.gain.value, now);
        filter.gain.linearRampToValueAtTime(gainVal, now + 0.01);
      } catch {
        filter.gain.value = gainVal;
      }
    });
  }

  public setEqEnabled(enabled: boolean) {
    this.initWebAudio();
    this.isEqEnabled = enabled;
    if (!this.audioCtx || this.eqFilters.length === 0) return;
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {});
    }
    const now = this.audioCtx.currentTime;
    this.eqFilters.forEach((filter, idx) => {
      const gainVal = enabled ? (this.eqBands[idx] ?? 0) : 0;
      try {
        filter.gain.cancelScheduledValues(now);
        filter.gain.setValueAtTime(filter.gain.value, now);
        filter.gain.linearRampToValueAtTime(gainVal, now + 0.01);
      } catch {
        filter.gain.value = gainVal;
      }
    });
  }

  public setPreamp(gainDb: number) {
    this.initWebAudio();
    this.preampDb = gainDb;
    if (!this.audioCtx || !this.preampNode) return;
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {});
    }
    const linearGain = Math.pow(10, gainDb / 20);
    const now = this.audioCtx.currentTime;
    try {
      this.preampNode.gain.cancelScheduledValues(now);
      this.preampNode.gain.setValueAtTime(this.preampNode.gain.value, now);
      this.preampNode.gain.linearRampToValueAtTime(linearGain, now + 0.01);
    } catch {
      this.preampNode.gain.value = linearGain;
    }
  }

  public getEqualizerBands(): number[] {
    return [...this.eqBands];
  }

  public isEqualizerEnabled(): boolean {
    return this.isEqEnabled;
  }

  public setCallbacks(callbacks: {
    onStatusChange?: StatusCallback;
    onTimeUpdate?: TimeCallback;
    onTrackEnded?: EndCallback;
    onError?: ErrorCallback;
  }) {
    this.onStatusChange = callbacks.onStatusChange || null;
    this.onTimeUpdate = callbacks.onTimeUpdate || null;
    this.onTrackEnded = callbacks.onTrackEnded || null;
    this.onError = callbacks.onError || null;
  }

  public async playTrack(track: Track) {
    // Populate track.url with YouTube watch link if not already set (ensures url is never undefined)
    if (track.youtubeId && !track.url) {
      track.url = `https://www.youtube.com/watch?v=${track.youtubeId}`;
    }

    // If this track was previously healed or has a cached embeddable alternative, use it immediately
    if (track.youtubeId) {
      const cachedAlt = storage.getCachedAlternativeId(track.youtubeId);
      if (cachedAlt && cachedAlt !== track.youtubeId) {
        console.log('[DEBUG AudioEngine] Using previously cached embeddable ID:', cachedAlt, 'for', track.title);
        track.youtubeId = cachedAlt;
        track.url = `https://www.youtube.com/watch?v=${cachedAlt}`;
      }
    }

    console.log('[DEBUG AudioEngine] playTrack called:', track.title, '| YT ID:', track.youtubeId, '| url:', track.url, '| ytReady:', this.ytReady);
    this.currentTrack = track;
    this.stopSynth();
    this.startTimeTicker();
    this.setStatus('BUFFERING');

    this.initWebAudio();
    this.isCrossfadingTriggered = false;

    // Restore full master playback volume on track start (clearing any crossfade dip)
    if (this.ytPlayer && typeof this.ytPlayer.setVolume === 'function') {
      try {
        if (!this.isMuted) {
          this.ytPlayer.unMute();
          this.ytPlayer.setVolume(this.volume);
        }
      } catch {}
    }
    if (this.gainNode && this.audioCtx) {
      try {
        this.gainNode.gain.setValueAtTime((this.volume / 100) * 0.45, this.audioCtx.currentTime);
      } catch {}
    }

    // Make sure Web Audio context is resumed on user gesture
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      try {
        this.audioCtx.resume();
      } catch (e) {
        // ignore
      }
    }

    // 1. Direct audio stream/file playback via HTMLAudioElement through Web Audio pipeline
    // Only invoke if track.audioUrl exists, or track.url is a direct audio file (NOT a YouTube link)
    const isDirectAudio = Boolean(
      track.audioUrl || (track.url && !track.youtubeId && !track.url.includes('youtube.com') && !track.url.includes('youtu.be'))
    );
    if (isDirectAudio) {
      if (this.isYtActive && this.ytPlayer && typeof this.ytPlayer.pauseVideo === 'function') {
        try {
          this.ytPlayer.pauseVideo();
        } catch {}
      }
      this.isYtActive = false;
      this.isAudioElementPlaying = true;
      if (this.audio) {
        this.audio.src = track.audioUrl || track.url || '';
        this.audio.currentTime = 0;
        this.audio.play().catch((e) => {
          console.warn('[AudioEngine] HTMLAudioElement play error, falling back to synth:', e);
          this.fallbackToSynth();
        });
      }
      return;
    }

    // Stop audio element if switching to YouTube
    if (this.audio) {
      this.audio.pause();
      this.isAudioElementPlaying = false;
    }

    // 2. YouTube playback
    if (track.youtubeId) {
      if (this.ytReady && this.ytPlayer && typeof this.ytPlayer.loadVideoById === 'function') {
        try {
          this.isYtActive = true;
          this.ytPlayer.loadVideoById({
            videoId: track.youtubeId,
            startSeconds: 0,
          });
          if (this.isMuted) {
            this.ytPlayer.mute();
          } else {
            this.ytPlayer.unMute();
            this.ytPlayer.setVolume(this.volume);
          }
          if (typeof this.ytPlayer.playVideo === 'function') {
            this.ytPlayer.playVideo();
          }
          // Secondary unmute checkpoint after video handshake completes asynchronously
          setTimeout(() => {
            if (this.ytPlayer && !this.isMuted) {
              try {
                if (typeof this.ytPlayer.unMute === 'function') this.ytPlayer.unMute();
                if (typeof this.ytPlayer.setVolume === 'function') this.ytPlayer.setVolume(this.volume);
              } catch (e) {}
            }
          }, 350);
          return;
        } catch (e) {
          console.warn('[AudioEngine] Error loading YT video, falling back to synth', e);
          this.fallbackToSynth();
        }
      } else {
        // YouTube API is still initializing: queue this track to play upon onReady
        this.pendingTrack = track;
        // Fallback after 12 seconds if YouTube fails to load
        setTimeout(() => {
          if (this.pendingTrack === track && !this.ytReady) {
            console.warn('[AudioEngine] YouTube initialization timed out, falling back to synth');
            this.fallbackToSynth();
          }
        }, 12000);
      }
    } else {
      // 3. Synthesized audio playback
      this.startSynth(track);
    }
  }

  public pause() {
    if (this.isAudioElementPlaying && this.audio) {
      try {
        this.audio.pause();
      } catch (e) {
        console.warn(e);
      }
    }
    if (this.isYtActive && this.ytPlayer && typeof this.ytPlayer.pauseVideo === 'function') {
      try {
        this.ytPlayer.pauseVideo();
      } catch (e) {
        console.warn(e);
      }
    }
    if (this.isSynthPlaying) {
      this.pauseSynth();
    }
    this.setStatus('PAUSED');
  }

  public getYtPlayer(): any {
    return this.ytPlayer;
  }

  public resume() {
    this.initWebAudio();
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      try {
        this.audioCtx.resume();
      } catch (e) {
        // ignore
      }
    }

    if (this.isAudioElementPlaying && this.audio) {
      try {
        this.audio.play();
        this.setStatus('PLAYING');
        return;
      } catch (e) {
        console.warn(e);
      }
    }

    if (this.isYtActive && this.ytPlayer && typeof this.ytPlayer.playVideo === 'function') {
      try {
        this.ytPlayer.playVideo();
        this.setStatus('PLAYING');
        return;
      } catch (e) {
        console.warn(e);
      }
    }

    if (this.currentTrack) {
      if (this.currentTrack.audioUrl || this.currentTrack.url) {
        this.playTrack(this.currentTrack);
      } else if (this.currentTrack.youtubeId && this.ytReady && this.ytPlayer) {
        this.playTrack(this.currentTrack);
      } else {
        this.resumeSynth();
        this.setStatus('PLAYING');
      }
    }
  }

  public seekTo(seconds: number) {
    if (this.isAudioElementPlaying && this.audio) {
      try {
        this.audio.currentTime = seconds;
      } catch (e) {
        console.warn(e);
      }
    }
    if (this.isYtActive && this.ytPlayer && typeof this.ytPlayer.seekTo === 'function') {
      try {
        this.ytPlayer.seekTo(seconds, true);
      } catch (e) {
        console.warn(e);
      }
    }
    this.synthTime = Math.max(0, Math.min(seconds, this.currentTrack?.duration || this.synthDuration));
    if (this.onTimeUpdate && this.currentTrack) {
      this.onTimeUpdate(this.synthTime, this.currentTrack.duration);
    }
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(100, vol));
    if (this.ytPlayer && typeof this.ytPlayer.setVolume === 'function') {
      this.ytPlayer.setVolume(this.volume);
    }
    if (this.gainNode && this.audioCtx) {
      const targetGain = this.isMuted ? 0 : (this.volume / 100) * 0.45;
      const now = this.audioCtx.currentTime;
      try {
        this.gainNode.gain.cancelScheduledValues(now);
        this.gainNode.gain.setValueAtTime(this.gainNode.gain.value, now);
        this.gainNode.gain.linearRampToValueAtTime(targetGain, now + 0.02);
      } catch {
        this.gainNode.gain.value = targetGain;
      }
    }
    if (this.crackleGainNode && this.audioCtx) {
      const targetCrackle = this.isMuted ? 0 : (this.volume / 100) * 0.08;
      this.crackleGainNode.gain.setValueAtTime(targetCrackle, this.audioCtx.currentTime);
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.ytPlayer) {
      if (muted && typeof this.ytPlayer.mute === 'function') {
        this.ytPlayer.mute();
      } else if (!muted && typeof this.ytPlayer.unMute === 'function') {
        this.ytPlayer.unMute();
        this.ytPlayer.setVolume(this.volume);
      }
    }
    if (this.gainNode && this.audioCtx) {
      const targetGain = muted ? 0 : (this.volume / 100) * 0.45;
      const now = this.audioCtx.currentTime;
      try {
        this.gainNode.gain.cancelScheduledValues(now);
        this.gainNode.gain.setValueAtTime(this.gainNode.gain.value, now);
        this.gainNode.gain.linearRampToValueAtTime(targetGain, now + 0.02);
      } catch {
        this.gainNode.gain.value = targetGain;
      }
    }
    if (this.crackleGainNode && this.audioCtx) {
      const targetCrackle = muted ? 0 : (this.volume / 100) * 0.08;
      this.crackleGainNode.gain.setValueAtTime(targetCrackle, this.audioCtx.currentTime);
    }
  }

  public getFrequencyData(): Uint8Array {
    const defaultData = new Uint8Array(32);
    if (!this.analyser) {
      // Simulate realistic pulsating frequency values if no analyzer active
      if (this.playbackStatus === 'PLAYING') {
        const time = Date.now() / 200;
        for (let i = 0; i < 32; i++) {
          defaultData[i] = Math.floor(60 + Math.sin(time + i * 0.4) * 50 + Math.cos(time * 0.8 + i * 0.2) * 40);
        }
      }
      return defaultData;
    }

    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(dataArray);

    // If analyser gives 0s (e.g. YouTube audio isn't piped to WebAudio due to CORS), add subtle animation when PLAYING
    let total = 0;
    for (let i = 0; i < dataArray.length; i++) total += dataArray[i];
    if (total === 0 && this.playbackStatus === 'PLAYING') {
      const time = Date.now() / 200;
      for (let i = 0; i < dataArray.length; i++) {
        dataArray[i] = Math.floor(70 + Math.sin(time + i * 0.3) * 60 + Math.random() * 20);
      }
    }
    return dataArray;
  }

  public getWaveformData(): Uint8Array {
    const defaultData = new Uint8Array(64);
    if (!this.analyser) {
      if (this.playbackStatus === 'PLAYING') {
        const time = Date.now() / 120;
        for (let i = 0; i < 64; i++) {
          defaultData[i] = Math.floor(128 + Math.sin(time + i * 0.28) * 48 + Math.sin(time * 2.2 + i * 0.12) * 22);
        }
      } else {
        defaultData.fill(128);
      }
      return defaultData;
    }

    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteTimeDomainData(dataArray);

    let isSilent = true;
    for (let i = 0; i < Math.min(64, dataArray.length); i++) {
      if (Math.abs(dataArray[i] - 128) > 2) {
        isSilent = false;
        break;
      }
    }
    if (isSilent && this.playbackStatus === 'PLAYING') {
      const time = Date.now() / 120;
      for (let i = 0; i < dataArray.length; i++) {
        dataArray[i] = Math.floor(128 + Math.sin(time + i * 0.28) * 48 + Math.sin(time * 2.2 + i * 0.12) * 22);
      }
    }
    return dataArray;
  }

  // --- YouTube Event Handling ---

  private handleYtStateChange(state: number) {
    const names: Record<number, string> = { [-1]: 'UNSTARTED', 0: 'ENDED', 1: 'PLAYING', 2: 'PAUSED', 3: 'BUFFERING', 5: 'CUED' };
    console.log(`[DEBUG AudioEngine] State change -> ${names[state] || state} (${state}) | isMuted: ${this.ytPlayer?.isMuted?.()} | vol: ${this.ytPlayer?.getVolume?.()}`);
    // YT.PlayerState: UNSTARTED (-1), ENDED (0), PLAYING (1), PAUSED (2), BUFFERING (3), CUED (5)
    switch (state) {
      case 1: // PLAYING
        this.setStatus('PLAYING');
        if (this.ytPlayer) {
          try {
            if (typeof this.ytPlayer.unMute === 'function' && !this.isMuted) {
              this.ytPlayer.unMute();
            }
            if (typeof this.ytPlayer.setVolume === 'function') {
              this.ytPlayer.setVolume(this.volume);
            }
          } catch (e) {}
        }
        break;
      case 2: // PAUSED
        this.setStatus('PAUSED');
        break;
      case 3: // BUFFERING
        this.setStatus('BUFFERING');
        break;
      case 0: // ENDED
        this.setStatus('IDLE');
        if (this.onTrackEnded) this.onTrackEnded();
        break;
      case 5: // CUED
        if (this.playbackStatus === 'BUFFERING' || this.playbackStatus === 'PLAYING') {
          if (this.ytPlayer && typeof this.ytPlayer.playVideo === 'function') {
            try {
              this.ytPlayer.playVideo();
            } catch (e) {
              console.warn(e);
            }
          }
        }
        break;
    }
  }

  // --- Auto-Healing Alternative Stream Engine for Error 150/101 ---

  private async autoHealRestrictedTrack(track: Track, errorCode: number) {
    const trackKey = track.id || track.youtubeId || `${track.artist}-${track.title}`;
    const attempts = this.healingAttempts.get(trackKey) || 0;
    if (attempts >= 2) {
      console.warn(`[AudioEngine] Track "${track.title}" failed healing after ${attempts} attempts`);
      if (this.onError) this.onError(`Playback restricted by YouTube (Error ${errorCode})`);
      this.fallbackToSynth();
      return;
    }

    this.healingAttempts.set(trackKey, attempts + 1);
    console.log(`[AudioEngine] Auto-healing restricted track "${track.artist} - ${track.title}" (Blocked ID: ${track.youtubeId}, Error: ${errorCode})`);
    this.setStatus('BUFFERING');

    // 1. Check if we already have a cached alternative ID in storage
    const cachedId = track.youtubeId ? storage.getCachedAlternativeId(track.youtubeId) : null;
    if (cachedId && cachedId !== track.youtubeId) {
      console.log(`[AudioEngine] Found cached embeddable alternative: ${cachedId}`);
      this.applyAlternativeYtId(track, cachedId);
      return;
    }

    // 2. Query alternative ID via Electron IPC or YouTube Search API
    const searchQuery = `${track.artist} ${track.title} audio`;
    const settings = storage.getSettings();
    let altId: string | null = null;

    try {
      if (typeof window !== 'undefined' && (window as any).electronAPI?.searchAlternativeYoutube) {
        const res = await (window as any).electronAPI.searchAlternativeYoutube({
          query: searchQuery,
          excludeId: track.youtubeId,
          apiKey: settings.youtubeApiKey || undefined,
        });
        if (res && res.success && res.videoId) {
          altId = res.videoId;
        }
      } else if (settings.youtubeApiKey) {
        const apiUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&videoEmbeddable=true&maxResults=5&q=${encodeURIComponent(searchQuery)}&key=${settings.youtubeApiKey}`;
        const res = await fetch(apiUrl);
        if (res.ok) {
          const data = await res.json();
          if (data.items && data.items.length > 0) {
            for (const item of data.items) {
              const vid = item.id?.videoId;
              if (vid && vid !== track.youtubeId) {
                altId = vid;
                break;
              }
            }
          }
        }
      }
    } catch (e) {
      console.warn('[AudioEngine] Alternative search error:', e);
    }

    if (altId) {
      console.log(`[AudioEngine] Successfully resolved embeddable alternative: ${altId} for "${track.title}"`);
      if (track.youtubeId) {
        storage.setCachedAlternativeId(track.youtubeId, altId);
      }
      this.applyAlternativeYtId(track, altId);
    } else {
      console.warn(`[AudioEngine] Could not resolve embeddable alternative for "${track.title}", falling back to synth`);
      if (this.onError) {
        this.onError(`Embedding disabled by video owner for "${track.title}" (Error ${errorCode}).`);
      }
      this.fallbackToSynth();
    }
  }

  private applyAlternativeYtId(track: Track, newYtId: string) {
    const oldId = track.youtubeId;
    track.youtubeId = newYtId;
    if (track.id) {
      storage.updateTrackYoutubeId(track.id, newYtId);
    }
    if (oldId) {
      storage.updateTrackYoutubeId(oldId, newYtId);
    }

    if (this.ytReady && this.ytPlayer && typeof this.ytPlayer.loadVideoById === 'function') {
      try {
        this.isYtActive = true;
        this.ytPlayer.loadVideoById({
          videoId: newYtId,
          startSeconds: 0,
        });
        if (this.isMuted) {
          this.ytPlayer.mute();
        } else {
          this.ytPlayer.unMute();
          this.ytPlayer.setVolume(this.volume);
        }
        if (typeof this.ytPlayer.playVideo === 'function') {
          this.ytPlayer.playVideo();
        }
        setTimeout(() => {
          if (this.ytPlayer && !this.isMuted) {
            try {
              if (typeof this.ytPlayer.unMute === 'function') this.ytPlayer.unMute();
              if (typeof this.ytPlayer.setVolume === 'function') this.ytPlayer.setVolume(this.volume);
            } catch (e) {}
          }
        }, 350);
      } catch (e) {
        console.warn('[AudioEngine] Error playing alternative video:', e);
        this.fallbackToSynth();
      }
    }
  }

  private fallbackToSynth() {
    this.isYtActive = false;
    const settings = storage.getSettings();
    if (!settings.synthFallbackEnabled) {
      this.setStatus('ERROR');
      if (this.onError) {
        this.onError('Unable to stream audio for this track');
      }
      return;
    }
    if (this.currentTrack) {
      this.startSynth(this.currentTrack);
    }
  }

  // --- Web Audio Synth Ambient Generator ---

  private startSynth(track: Track) {
    this.initWebAudio();
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      try {
        this.audioCtx.resume();
      } catch (e) {
        // ignore
      }
    }
    this.isSynthPlaying = true;
    this.synthDuration = track.duration || 240;
    this.synthTime = 0;
    this.setStatus('PLAYING');

    // Trigger audible brutalist synth notes
    this.triggerChordProgression();
  }

  private pauseSynth() {
    this.isSynthPlaying = false;
  }

  private resumeSynth() {
    this.initWebAudio();
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      try {
        this.audioCtx.resume();
      } catch (e) {
        // ignore
      }
    }
    this.isSynthPlaying = true;
  }

  private stopSynth() {
    this.isSynthPlaying = false;
    if (this.synthInterval) {
      window.clearInterval(this.synthInterval);
      this.synthInterval = null;
    }
  }

  private triggerChordProgression() {
    if (!this.audioCtx || !this.gainNode) return;

    if (this.synthInterval) {
      window.clearInterval(this.synthInterval);
    }

    const chords = [
      [130.81, 155.56, 196.00], // C minor (brutalist, moody)
      [116.54, 146.83, 174.61], // Bb major
      [103.83, 130.81, 155.56], // Ab major
      [98.00, 123.47, 146.83],  // G minor
    ];
    let chordIdx = 0;

    const playStep = () => {
      if (!this.isSynthPlaying || !this.audioCtx || !this.gainNode) return;

      const currentChord = chords[chordIdx % chords.length];
      chordIdx++;

      // 1. Warm sub-bass note
      try {
        const bassOsc = this.audioCtx.createOscillator();
        const bassGain = this.audioCtx.createGain();
        bassOsc.type = 'triangle';
        bassOsc.frequency.setValueAtTime(currentChord[0] / 2, this.audioCtx.currentTime);
        bassGain.gain.setValueAtTime(0.001, this.audioCtx.currentTime);
        bassGain.gain.linearRampToValueAtTime(0.2, this.audioCtx.currentTime + 0.15);
        bassGain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 2.7);
        bassOsc.connect(bassGain);
        bassGain.connect(this.preampNode || this.gainNode);
        bassOsc.start();
        bassOsc.stop(this.audioCtx.currentTime + 2.9);
      } catch (e) {
        // ignore
      }

      // 2. Lead chord voices
      currentChord.forEach((freq) => {
        try {
          const osc = this.audioCtx!.createOscillator();
          const noteGain = this.audioCtx!.createGain();
          
          osc.type = 'sawtooth'; // retro synthwave / darkwave texture
          osc.frequency.setValueAtTime(freq, this.audioCtx!.currentTime);

          // Soft low-pass filter
          const filter = this.audioCtx!.createBiquadFilter();
          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(800, this.audioCtx!.currentTime);

          noteGain.gain.setValueAtTime(0.001, this.audioCtx!.currentTime);
          noteGain.gain.linearRampToValueAtTime(0.18, this.audioCtx!.currentTime + 0.25);
          noteGain.gain.exponentialRampToValueAtTime(0.0001, this.audioCtx!.currentTime + 2.8);

          osc.connect(filter);
          filter.connect(noteGain);
          noteGain.connect(this.preampNode || this.gainNode!);

          osc.start();
          osc.stop(this.audioCtx!.currentTime + 3.0);
        } catch (e) {
          // ignore
        }
      });
    };

    playStep();
    this.synthInterval = window.setInterval(playStep, 3000);
  }

  // --- Clock / Ticker ---

  private startTimeTicker() {
    if (this.timeTicker) window.clearInterval(this.timeTicker);

    // High-precision 100ms ticker for tight audio-to-lyrics synchronization
    this.timeTicker = window.setInterval(() => {
      if (this.playbackStatus !== 'PLAYING') return;

      let currentSec = 0;
      let totalSec = this.currentTrack?.duration || 240;

      if (this.isYtActive && this.ytPlayer && typeof this.ytPlayer.getCurrentTime === 'function') {
        try {
          if (typeof this.ytPlayer.isMuted === 'function' && this.ytPlayer.isMuted() && !this.isMuted) {
            this.ytPlayer.unMute();
            this.ytPlayer.setVolume(this.volume);
          }
          currentSec = this.ytPlayer.getCurrentTime() || 0;
          const ytDur = this.ytPlayer.getDuration();
          if (ytDur && ytDur > 0) totalSec = ytDur;
        } catch (e) {
          // fallback
          this.synthTime += 0.1;
          currentSec = this.synthTime;
        }
      } else if (this.isSynthPlaying) {
        this.synthTime += 0.1;
        currentSec = this.synthTime;
        if (this.synthTime >= totalSec) {
          this.synthTime = 0;
          if (this.onTrackEnded) this.onTrackEnded();
          return;
        }
      }

      // DJ Crossfade: detect approaching track ending
      const crossfadeSec = storage.getSettings().crossfadeDuration || 0;
      if (crossfadeSec > 0 && totalSec > crossfadeSec * 2) {
        const remaining = totalSec - currentSec;
        if (remaining <= crossfadeSec && remaining > 0) {
          const fadeRatio = Math.max(0.05, remaining / crossfadeSec);
          const targetVol = Math.round(this.volume * fadeRatio);
          if (this.ytPlayer && typeof this.ytPlayer.setVolume === 'function') {
            try { this.ytPlayer.setVolume(targetVol); } catch {}
          }
          if (this.gainNode && this.audioCtx) {
            try {
              this.gainNode.gain.setValueAtTime((targetVol / 100) * 0.5, this.audioCtx.currentTime);
            } catch {}
          }
          if (remaining <= Math.max(0.4, Math.min(1.2, crossfadeSec * 0.35)) && !this.isCrossfadingTriggered) {
            this.isCrossfadingTriggered = true;
            if (this.onTrackEnded) this.onTrackEnded();
          }
        }
      }

      if (this.onTimeUpdate) {
        this.onTimeUpdate(currentSec, totalSec);
      }
    }, 100);
  }

  private setStatus(status: PlaybackStatus) {
    this.playbackStatus = status;
    if (status === 'PLAYING' && this.isCrackleEnabled) {
      this.startVinylCrackle();
    } else if (status !== 'PLAYING') {
      this.stopVinylCrackle();
    }
    if (this.onStatusChange) {
      this.onStatusChange(status);
    }
  }

  public getStatus(): PlaybackStatus {
    return this.playbackStatus;
  }

  public getSource(): string {
    if (this.isAudioElementPlaying) return 'AUDIO STREAM';
    return this.isYtActive ? 'YOUTUBE' : 'SYNTH ENGINE';
  }

  // --- Procedural Vinyl Crackle Engine ---

  public setVinylCrackle(enabled: boolean) {
    this.isCrackleEnabled = enabled;
    if (enabled && this.playbackStatus === 'PLAYING') {
      this.startVinylCrackle();
    } else if (!enabled) {
      this.stopVinylCrackle();
    }
  }

  public isVinylCrackleActive(): boolean {
    return this.isCrackleEnabled;
  }

  private createVinylCrackleBuffer(): AudioBuffer | null {
    if (!this.audioCtx) return null;
    try {
      const sampleRate = this.audioCtx.sampleRate;
      const bufferDuration = 6.0; // 6-second seamlessly looping authentic ambient vinyl texture
      const buffer = this.audioCtx.createBuffer(2, Math.floor(sampleRate * bufferDuration), sampleRate);

      for (let ch = 0; ch < 2; ch++) {
        const data = buffer.getChannelData(ch);
        let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

        for (let i = 0; i < data.length; i++) {
          // 1. Analog tape & vinyl groove hiss (pink noise)
          const white = Math.random() * 2 - 1;
          b0 = 0.99886 * b0 + white * 0.0555179;
          b1 = 0.99332 * b1 + white * 0.0750759;
          b2 = 0.96900 * b2 + white * 0.1538520;
          b3 = 0.86650 * b3 + white * 0.3104856;
          b4 = 0.55000 * b4 + white * 0.5329522;
          b5 = -0.7616 * b5 - white * 0.0168980;
          const pink = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.015;
          b6 = white * 0.115926;

          // 2. Realistic micro-pops and surface friction
          let pop = 0;
          const r = Math.random();
          if (r < 0.00015) {
            // Sporadic subtle record click
            pop = (Math.random() * 2 - 1) * (0.08 + Math.random() * 0.08);
          } else if (r < 0.0012) {
            // Gentle vinyl friction crackle
            pop = (Math.random() * 2 - 1) * 0.025;
          }

          data[i] = (pink * 0.35 + pop) * 0.2;
        }
      }
      return buffer;
    } catch (e) {
      console.warn('[AudioEngine] Error creating vinyl crackle buffer:', e);
      return null;
    }
  }

  private startVinylCrackle() {
    if (!this.isCrackleEnabled) return;
    this.initWebAudio();
    if (!this.audioCtx) return;

    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }

    if (this.crackleSourceNode) {
      try {
        this.crackleSourceNode.stop();
        this.crackleSourceNode.disconnect();
      } catch (e) {
        // ignore
      }
      this.crackleSourceNode = null;
    }

    const buffer = this.createVinylCrackleBuffer();
    if (!buffer) return;

    try {
      if (!this.crackleGainNode) {
        this.crackleGainNode = this.audioCtx.createGain();
        this.crackleGainNode.connect(this.audioCtx.destination);
      }

      const targetGain = this.isMuted ? 0 : (this.volume / 100) * 0.08; // Subtle whisper-quiet ambient crackle
      this.crackleGainNode.gain.setValueAtTime(targetGain, this.audioCtx.currentTime);

      this.crackleSourceNode = this.audioCtx.createBufferSource();
      this.crackleSourceNode.buffer = buffer;
      this.crackleSourceNode.loop = true;
      this.crackleSourceNode.connect(this.crackleGainNode);
      this.crackleSourceNode.start(0);
    } catch (e) {
      console.warn('[AudioEngine] Could not start vinyl crackle:', e);
    }
  }

  private stopVinylCrackle() {
    if (this.crackleSourceNode) {
      try {
        this.crackleSourceNode.stop();
        this.crackleSourceNode.disconnect();
      } catch (e) {
        // ignore
      }
      this.crackleSourceNode = null;
    }
  }

  /**
   * Synthesize a realistic mechanical turntable needle drop:
   * 1. Low 55Hz mechanical thud (cartridge settling on vinyl)
   * 2. High-frequency micro-click (stylus contacting the groove)
   */
  public triggerNeedleDrop() {
    this.initWebAudio();
    if (!this.audioCtx) return;
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {});
    }

    try {
      const now = this.audioCtx.currentTime;

      // 1. Stylus contact click (bandpass noise pop)
      const bufferSize = Math.floor(this.audioCtx.sampleRate * 0.05); // 50ms
      const noiseBuffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.audioCtx.sampleRate * 0.008));
      }
      const noiseSource = this.audioCtx.createBufferSource();
      noiseSource.buffer = noiseBuffer;

      const clickFilter = this.audioCtx.createBiquadFilter();
      clickFilter.type = 'bandpass';
      clickFilter.frequency.setValueAtTime(2400, now);
      clickFilter.Q.setValueAtTime(3, now);

      const clickGain = this.audioCtx.createGain();
      clickGain.gain.setValueAtTime(0.25, now);
      clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

      noiseSource.connect(clickFilter);
      clickFilter.connect(clickGain);
      clickGain.connect(this.audioCtx.destination);
      noiseSource.start(now);

      // 2. Heavy low-end mechanical cartridge thud (60Hz -> 25Hz)
      const osc = this.audioCtx.createOscillator();
      const oscGain = this.audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(65, now);
      osc.frequency.exponentialRampToValueAtTime(25, now + 0.12);

      oscGain.gain.setValueAtTime(0.35, now);
      oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

      osc.connect(oscGain);
      oscGain.connect(this.audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.15);
    } catch (e) {
      console.warn('[AudioEngine] Needle drop synthesis error:', e);
    }
  }

  /**
   * Synthesize a tactile vinyl scratch friction audio burst during disc rotation scrubbing
   */
  private lastScratchTime = 0;
  public triggerScratch(intensity = 1) {
    this.initWebAudio();
    if (!this.audioCtx) return;
    const now = this.audioCtx.currentTime;
    if (now - this.lastScratchTime < 0.04) return;
    this.lastScratchTime = now;

    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {});
    }

    try {
      const duration = 0.06;
      const bufferSize = Math.floor(this.audioCtx.sampleRate * duration);
      const buffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
      const data = buffer.getChannelData(0);

      const clampedIntensity = Math.min(3, Math.max(0.3, Math.abs(intensity)));
      for (let i = 0; i < bufferSize; i++) {
        const t = i / bufferSize;
        const envelope = Math.sin(t * Math.PI);
        data[i] = (Math.random() * 2 - 1) * envelope * 0.15 * clampedIntensity;
      }

      const source = this.audioCtx.createBufferSource();
      source.buffer = buffer;

      const filter = this.audioCtx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(800 + clampedIntensity * 400, now);
      filter.Q.setValueAtTime(2.5, now);

      const gain = this.audioCtx.createGain();
      const targetGain = Math.min(0.2, 0.08 * clampedIntensity);
      gain.gain.setValueAtTime(targetGain, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      source.connect(filter);
      filter.connect(gain);
      gain.connect(this.audioCtx.destination);
      source.start(now);
    } catch (e) {
      // ignore
    }
  }
}

export const audioEngine = new AudioEngine();
