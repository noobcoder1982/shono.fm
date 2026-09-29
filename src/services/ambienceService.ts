// Ambience Atmospheric Audio Layer Service
// Generates procedural ambient layers: Rain, Vinyl Crackle, Cafe Chatter, and Warm Tape Hiss
// Blends seamlessly underneath any playing music in SHONO.FM

export type AmbienceChannel = 'rain' | 'crackle' | 'cafe' | 'tape';

export interface AmbienceLevels {
  rain: number;    // 0 to 100
  crackle: number; // 0 to 100
  cafe: number;    // 0 to 100
  tape: number;    // 0 to 100
}

class AmbienceService {
  private audioCtx: AudioContext | null = null;
  private masterGain: GainNode | null = null;

  private rainGain: GainNode | null = null;
  private crackleGain: GainNode | null = null;
  private cafeGain: GainNode | null = null;
  private tapeGain: GainNode | null = null;

  private levels: AmbienceLevels = {
    rain: 0,
    crackle: 0,
    cafe: 0,
    tape: 0,
  };

  constructor() {
    this.loadLevels();
  }

  private loadLevels() {
    try {
      const raw = localStorage.getItem('shono_ambience_levels');
      if (raw) {
        this.levels = { ...this.levels, ...JSON.parse(raw) };
      }
    } catch {}
  }

  private saveLevels() {
    try {
      localStorage.setItem('shono_ambience_levels', JSON.stringify(this.levels));
    } catch {}
  }

  public getLevels(): AmbienceLevels {
    return { ...this.levels };
  }

  private initAudio() {
    if (this.audioCtx) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      this.audioCtx = new AudioCtx();

      this.masterGain = this.audioCtx.createGain();
      this.masterGain.gain.value = 1.0;
      this.masterGain.connect(this.audioCtx.destination);

      // Rain node generator
      this.rainGain = this.audioCtx.createGain();
      this.rainGain.gain.value = (this.levels.rain / 100) * 0.35;
      this.setupRainNode(this.rainGain);
      this.rainGain.connect(this.masterGain);

      // Vinyl Crackle node generator
      this.crackleGain = this.audioCtx.createGain();
      this.crackleGain.gain.value = (this.levels.crackle / 100) * 0.28;
      this.setupCrackleNode(this.crackleGain);
      this.crackleGain.connect(this.masterGain);

      // Cafe Atmosphere generator
      this.cafeGain = this.audioCtx.createGain();
      this.cafeGain.gain.value = (this.levels.cafe / 100) * 0.3;
      this.setupCafeNode(this.cafeGain);
      this.cafeGain.connect(this.masterGain);

      // Tape Hiss generator
      this.tapeGain = this.audioCtx.createGain();
      this.tapeGain.gain.value = (this.levels.tape / 100) * 0.15;
      this.setupTapeNode(this.tapeGain);
      this.tapeGain.connect(this.masterGain);
    } catch (e) {
      console.warn('[AmbienceService] Audio init error:', e);
    }
  }

  // Generate continuous procedural rain sound
  private setupRainNode(destination: GainNode) {
    if (!this.audioCtx) return;
    const bufferSize = this.audioCtx.sampleRate * 2;
    const buffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
    const data = buffer.getChannelData(0);

    let b0 = 0, b1 = 0, b2 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      data[i] = (b0 + b1 + b2) * 0.2;
    }

    const noise = this.audioCtx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    // Filter to simulate raindrops hitting surfaces
    const filter = this.audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 1100;

    noise.connect(filter);
    filter.connect(destination);
    noise.start();
  }

  // Generate authentic vinyl needle pops & crackles
  private setupCrackleNode(destination: GainNode) {
    if (!this.audioCtx) return;
    const bufferSize = this.audioCtx.sampleRate * 2;
    const buffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      if (Math.random() < 0.0018) {
        // High impulse needle pop
        data[i] = (Math.random() * 2 - 1) * 0.9;
      } else if (Math.random() < 0.02) {
        // Micro surface friction
        data[i] = (Math.random() * 2 - 1) * 0.08;
      } else {
        data[i] = 0;
      }
    }

    const noise = this.audioCtx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    const filter = this.audioCtx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 2400;
    filter.Q.value = 2.0;

    noise.connect(filter);
    filter.connect(destination);
    noise.start();
  }

  // Warm muffled room atmosphere / cafe murmur
  private setupCafeNode(destination: GainNode) {
    if (!this.audioCtx) return;
    const bufferSize = this.audioCtx.sampleRate * 2;
    const buffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.15;
    }

    const noise = this.audioCtx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    const filter = this.audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 550;

    noise.connect(filter);
    filter.connect(destination);
    noise.start();
  }

  // Vintage cassette tape hiss
  private setupTapeNode(destination: GainNode) {
    if (!this.audioCtx) return;
    const bufferSize = this.audioCtx.sampleRate * 2;
    const buffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.1;
    }

    const noise = this.audioCtx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    const filter = this.audioCtx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 3500;

    noise.connect(filter);
    filter.connect(destination);
    noise.start();
  }

  public setChannelVolume(channel: AmbienceChannel, value: number) {
    const clamped = Math.max(0, Math.min(100, Math.round(value)));
    this.levels[channel] = clamped;
    this.saveLevels();

    if (!this.audioCtx && clamped > 0) {
      this.initAudio();
    }

    if (this.audioCtx && this.audioCtx.state === 'suspended' && clamped > 0) {
      this.audioCtx.resume().catch(() => {});
    }

    const targetGain = (clamped / 100);
    const now = this.audioCtx?.currentTime || 0;

    if (channel === 'rain' && this.rainGain && this.audioCtx) {
      this.rainGain.gain.setValueAtTime(this.rainGain.gain.value, now);
      this.rainGain.gain.linearRampToValueAtTime(targetGain * 0.35, now + 0.05);
    } else if (channel === 'crackle' && this.crackleGain && this.audioCtx) {
      this.crackleGain.gain.setValueAtTime(this.crackleGain.gain.value, now);
      this.crackleGain.gain.linearRampToValueAtTime(targetGain * 0.28, now + 0.05);
    } else if (channel === 'cafe' && this.cafeGain && this.audioCtx) {
      this.cafeGain.gain.setValueAtTime(this.cafeGain.gain.value, now);
      this.cafeGain.gain.linearRampToValueAtTime(targetGain * 0.3, now + 0.05);
    } else if (channel === 'tape' && this.tapeGain && this.audioCtx) {
      this.tapeGain.gain.setValueAtTime(this.tapeGain.gain.value, now);
      this.tapeGain.gain.linearRampToValueAtTime(targetGain * 0.15, now + 0.05);
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('shono-ambience-updated', { detail: this.levels }));
    }
  }

  public toggleChannel(channel: AmbienceChannel) {
    const current = this.levels[channel];
    this.setChannelVolume(channel, current > 0 ? 0 : 50);
  }
}

export const ambienceService = new AmbienceService();
