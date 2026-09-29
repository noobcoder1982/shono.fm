const net = require('net');
const path = require('path');
const fs = require('fs');

/**
 * Lightweight, zero-dependency Discord Rich Presence IPC client
 * Communicates directly with local Discord desktop client via named pipes (Windows) / Unix sockets (macOS/Linux).
 */
class DiscordRpc {
  constructor() {
    this.clientId = '1348057284918284348'; // Default SHONO.FM Client ID
    this.enabled = true;
    this.socket = null;
    this.isConnected = false;
    this.isReady = false;
    this.retryTimeout = null;
    this.currentActivity = null;
    this.buffer = Buffer.alloc(0);
  }

  getAvailablePipes() {
    const pipes = [];
    if (process.platform === 'win32') {
      for (let i = 0; i < 10; i++) {
        pipes.push(`\\\\.\\pipe\\discord-ipc-${i}`);
        pipes.push(`\\\\?\\pipe\\discord-ipc-${i}`);
      }
    } else {
      const dirs = [
        process.env.XDG_RUNTIME_DIR,
        process.env.TMPDIR,
        process.env.TMP,
        process.env.TEMP,
        '/tmp'
      ].filter(Boolean);

      for (const dir of dirs) {
        for (let i = 0; i < 10; i++) {
          pipes.push(path.join(dir, `discord-ipc-${i}`));
        }
      }
    }
    return pipes;
  }

  init(config = {}) {
    if (config.clientId) this.clientId = config.clientId;
    if (typeof config.enabled === 'boolean') this.enabled = config.enabled;

    if (!this.enabled) {
      this.disconnect();
      return;
    }

    if (!this.isConnected && !this.socket) {
      this.connect();
    }
  }

  updateConfig(config = {}) {
    let shouldReconnect = false;
    if (config.clientId && config.clientId !== this.clientId) {
      this.clientId = config.clientId;
      shouldReconnect = true;
    }
    if (typeof config.enabled === 'boolean' && config.enabled !== this.enabled) {
      this.enabled = config.enabled;
      shouldReconnect = true;
    }

    if (shouldReconnect) {
      this.disconnect();
      if (this.enabled) {
        this.connect();
      }
    }
  }

  connect() {
    if (!this.enabled || this.socket) return;

    const pipes = this.getAvailablePipes();
    let pipeIndex = 0;

    const tryNextPipe = () => {
      if (pipeIndex >= pipes.length) {
        // All pipes attempted; Discord client is likely closed. Schedule retry.
        this.scheduleRetry(20000);
        return;
      }

      const pipePath = pipes[pipeIndex++];
      const sock = net.createConnection(pipePath);

      sock.once('connect', () => {
        this.socket = sock;
        this.isConnected = true;
        this.buffer = Buffer.alloc(0);
        this.setupSocketEvents(sock);
        this.sendHandshake();
      });

      sock.once('error', () => {
        sock.destroy();
        tryNextPipe();
      });
    };

    tryNextPipe();
  }

  setupSocketEvents(sock) {
    sock.on('data', (chunk) => {
      this.buffer = Buffer.concat([this.buffer, chunk]);
      this.processBuffer();
    });

    sock.on('close', () => {
      this.handleDisconnect();
    });

    sock.on('error', (err) => {
      // Quietly log error to prevent console spam
      sock.destroy();
      this.handleDisconnect();
    });
  }

  handleDisconnect() {
    this.isConnected = false;
    this.isReady = false;
    this.socket = null;
    this.buffer = Buffer.alloc(0);
    if (this.enabled) {
      this.scheduleRetry(15000);
    }
  }

  scheduleRetry(delayMs) {
    if (this.retryTimeout) clearTimeout(this.retryTimeout);
    this.retryTimeout = setTimeout(() => {
      this.retryTimeout = null;
      if (this.enabled && !this.socket) {
        this.connect();
      }
    }, delayMs);
  }

  sendHandshake() {
    if (!this.socket || !this.isConnected) return;
    try {
      const payload = JSON.stringify({ v: 1, client_id: this.clientId });
      const data = Buffer.from(payload, 'utf8');
      const packet = Buffer.alloc(8 + data.length);
      packet.writeInt32LE(0, 0); // Opcode 0 = HANDSHAKE
      packet.writeInt32LE(data.length, 4);
      data.copy(packet, 8);
      this.socket.write(packet);
    } catch (e) {
      console.warn('[DiscordRPC] Handshake error:', e.message);
    }
  }

  sendPacket(opcode, jsonObject) {
    if (!this.socket || !this.isConnected) return;
    try {
      const payload = JSON.stringify(jsonObject);
      const data = Buffer.from(payload, 'utf8');
      const packet = Buffer.alloc(8 + data.length);
      packet.writeInt32LE(opcode, 0);
      packet.writeInt32LE(data.length, 4);
      data.copy(packet, 8);
      this.socket.write(packet);
    } catch (e) {
      console.warn('[DiscordRPC] Send packet error:', e.message);
    }
  }

  processBuffer() {
    while (this.buffer.length >= 8) {
      const opcode = this.buffer.readInt32LE(0);
      const length = this.buffer.readInt32LE(4);

      if (this.buffer.length < 8 + length) {
        // Incomplete packet; wait for more data
        break;
      }

      const payloadStr = this.buffer.slice(8, 8 + length).toString('utf8');
      this.buffer = this.buffer.slice(8 + length);

      try {
        const payload = JSON.parse(payloadStr);
        if (opcode === 1 && payload.cmd === 'DISPATCH' && payload.evt === 'READY') {
          this.isReady = true;
          // Resend current queued activity if available
          if (this.currentActivity) {
            this.sendActivity(this.currentActivity);
          }
        }
      } catch (e) {
        // Ignore parse error
      }
    }
  }

  setActivity(activityData) {
    this.currentActivity = activityData;
    if (!this.enabled) return;

    if (!this.isConnected || !this.isReady) {
      if (!this.socket) this.connect();
      return;
    }

    this.sendActivity(activityData);
  }

  sendActivity(data) {
    if (!data) {
      this.clearActivity();
      return;
    }

    const {
      title,
      artist,
      album,
      artworkUrl,
      isPlaying,
      currentTime,
      duration,
      trackUrl
    } = data;

    const DISCORD_FALLBACK_ARTWORK = 'https://cdn.jsdelivr.net/gh/noobcoder1982/shono.fm/public/assets/now_playing_art.jpg';

    const safeTitle = (title && typeof title === 'string' && title.trim().length > 0)
      ? title.trim().slice(0, 128)
      : 'Listening to Audio';
    const safeArtist = (artist && typeof artist === 'string' && artist.trim().length > 0)
      ? `by ${artist.trim()}`.slice(0, 128)
      : 'SHONO.FM Precision Archive';
    const safeAlbum = (album && typeof album === 'string' && album.trim().length > 0)
      ? album.trim().slice(0, 128)
      : 'SHONO.FM Audio Vault';

    const safeArtwork = (artworkUrl && typeof artworkUrl === 'string' && (artworkUrl.startsWith('http://') || artworkUrl.startsWith('https://')))
      ? artworkUrl
      : DISCORD_FALLBACK_ARTWORK;

    const activity = {
      type: 2, // 2 = LISTENING to audio
      details: safeTitle,
      state: safeArtist,
      assets: {
        large_image: safeArtwork,
        large_text: safeAlbum,
      }
    };

    if (isPlaying && typeof currentTime === 'number' && currentTime >= 0) {
      const now = Math.floor(Date.now() / 1000);
      const startTime = Math.max(0, now - Math.floor(currentTime));
      activity.timestamps = {
        start: startTime * 1000,
      };
      if (typeof duration === 'number' && duration > currentTime) {
        activity.timestamps.end = Math.floor(startTime + duration) * 1000;
      }
    }

    const validButtons = [];
    if (trackUrl && typeof trackUrl === 'string' && (trackUrl.startsWith('http://') || trackUrl.startsWith('https://'))) {
      validButtons.push({
        label: 'Play on YouTube',
        url: trackUrl
      });
    }
    validButtons.push({
      label: 'Listen on SHONO.FM',
      url: 'https://shono.fm'
    });

    if (validButtons.length > 0) {
      activity.buttons = validButtons.slice(0, 2);
    }

    this.sendPacket(1, {
      cmd: 'SET_ACTIVITY',
      args: {
        pid: process.pid,
        activity,
      },
      nonce: Math.random().toString(36).slice(2)
    });
  }

  clearActivity() {
    this.currentActivity = null;
    if (!this.isConnected || !this.isReady) return;

    this.sendPacket(1, {
      cmd: 'SET_ACTIVITY',
      args: {
        pid: process.pid,
        activity: null,
      },
      nonce: Math.random().toString(36).slice(2)
    });
  }

  disconnect() {
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
      this.retryTimeout = null;
    }
    if (this.socket) {
      try {
        this.clearActivity();
        this.socket.destroy();
      } catch (e) {}
      this.socket = null;
    }
    this.isConnected = false;
    this.isReady = false;
    this.buffer = Buffer.alloc(0);
  }
}

const discordRpc = new DiscordRpc();
module.exports = discordRpc;
