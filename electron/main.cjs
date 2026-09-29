const { app, BrowserWindow, shell, ipcMain, session, Menu, MenuItem, Tray, globalShortcut } = require('electron');
const path = require('path');
const http = require('http');
const fs = require('fs');
const discordRpc = require('./discordRpc.cjs');

let localServer = null;

function startLocalServer(distPath) {
  const mimeTypes = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.woff2': 'font/woff2',
    '.woff': 'font/woff',
    '.ttf': 'font/ttf',
  };

  return new Promise((resolve) => {
    localServer = http.createServer((req, res) => {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

      let reqPath = req.url.split('?')[0];
      if (reqPath.startsWith('/')) {
        reqPath = reqPath.slice(1);
      }
      let filePath = path.join(distPath, reqPath === '' ? 'index.html' : reqPath);

      if (!fs.existsSync(filePath)) {
        const ext = path.extname(reqPath).toLowerCase();
        // SPA Fallback: ONLY routes without an extension (or .html) serve index.html
        if (!ext || ext === '.html') {
          filePath = path.join(distPath, 'index.html');
        } else {
          // Missing static assets (js, css, png, ico, etc.) must return 404, never index.html!
          res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
          res.end(`Asset not found: ${reqPath}`);
          return;
        }
      }

      const ext = path.extname(filePath).toLowerCase();
      const contentType = mimeTypes[ext] || 'application/octet-stream';

      fs.readFile(filePath, (err, content) => {
        if (err) {
          res.writeHead(404);
          res.end('Not found');
          return;
        }
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content);
      });
    });

    localServer.once('error', (err) => {
      console.warn(`[localServer] Port 41789 busy (${err.code}), falling back to dynamic port`);
      localServer.listen(0, '127.0.0.1', () => {
        resolve(localServer.address().port);
      });
    });

    localServer.listen(41789, '127.0.0.1', () => {
      const port = localServer.address().port;
      console.log(`[localServer] Fixed audio archive origin: http://127.0.0.1:${port}`);
      resolve(port);
    });
  });
}

// Allow unrestricted audio playback and media autoplay
app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');
app.commandLine.appendSwitch('disable-features', 'PreloadMediaEngagementData,MediaEngagementBypassAutoplayPolicies');
app.userAgentFallback = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

let mainWindow = null;
let tray = null;
let isQuitting = false;
let minimizeToTray = true;
let isMiniDeck = false;
let prevBounds = null;
let lastNowPlayingText = 'SHONO.FM — Precision Audio Archive';

function createTray() {
  if (tray) return;
  const iconPath = fs.existsSync(path.join(__dirname, 'icon.png'))
    ? path.join(__dirname, 'icon.png')
    : path.join(__dirname, '../build/icon.png');

  try {
    tray = new Tray(iconPath);
    tray.setToolTip('SHONO.FM — Precision Audio Archive');
    updateTrayMenu();

    const showMain = () => {
      if (mainWindow) {
        if (mainWindow.isMinimized()) mainWindow.restore();
        mainWindow.show();
        mainWindow.focus();
      }
    };

    tray.on('click', showMain);
    tray.on('double-click', showMain);
  } catch (err) {
    console.warn('[main] Tray creation notice:', err);
  }
}

function updateTrayMenu() {
  if (!tray) return;
  const contextMenu = Menu.buildFromTemplate([
    { label: lastNowPlayingText, enabled: false },
    { type: 'separator' },
    {
      label: 'Play / Pause',
      click: () => mainWindow?.webContents.send('media-command', 'play-pause'),
    },
    {
      label: 'Next Track',
      click: () => mainWindow?.webContents.send('media-command', 'next'),
    },
    {
      label: 'Previous Track',
      click: () => mainWindow?.webContents.send('media-command', 'prev'),
    },
    { type: 'separator' },
    {
      label: 'Open SHONO.FM',
      click: () => {
        if (mainWindow) {
          if (mainWindow.isMinimized()) mainWindow.restore();
          mainWindow.show();
          mainWindow.focus();
        }
      },
    },
    {
      label: 'Quit SHONO.FM',
      click: () => {
        isQuitting = true;
        app.quit();
      },
    },
  ]);
  tray.setContextMenu(contextMenu);
}

// Enforce single instance of SHONO.FM
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.show();
      mainWindow.focus();
    }
  });

  function createWindow() {
    const isDev = !app.isPackaged && process.env.NODE_ENV !== 'production';

    const iconPath = fs.existsSync(path.join(__dirname, 'icon.png'))
      ? path.join(__dirname, 'icon.png')
      : path.join(__dirname, '../build/icon.png');

    mainWindow = new BrowserWindow({
      width: 1360,
      height: 860,
      minWidth: 980,
      minHeight: 640,
      title: 'SHONO.FM — PRECISION AUDIO ARCHIVE',
      icon: iconPath,
      backgroundColor: '#080808',
      frame: false, // Pure custom window controls to eliminate native overlapping
      titleBarStyle: 'hidden',
      autoHideMenuBar: true,
      show: true, // Visible immediately to prevent hidden zombie state
      webPreferences: {
        preload: path.join(__dirname, 'preload.cjs'),
        contextIsolation: true,
        nodeIntegration: false,
        sandbox: false,
        webSecurity: false, // Essential for loading external YouTube streams and audio from file://
      },
    });

    // Native context menu on editable fields (Right-click paste / copy support)
    mainWindow.webContents.on('context-menu', (_event, params) => {
      if (params.isEditable) {
        const menu = new Menu();
        menu.append(new MenuItem({ label: 'Cut', role: 'cut' }));
        menu.append(new MenuItem({ label: 'Copy', role: 'copy' }));
        menu.append(new MenuItem({ label: 'Paste', role: 'paste' }));
        menu.append(new MenuItem({ type: 'separator' }));
        menu.append(new MenuItem({ label: 'Select All', role: 'selectAll' }));
        menu.popup();
      }
    });

    // Ensure window is shown and brought to front
    mainWindow.show();
    mainWindow.focus();

    mainWindow.once('ready-to-show', () => {
      if (mainWindow) {
        mainWindow.show();
        mainWindow.focus();
      }
    });

    // Fallback timer to guarantee visibility regardless of resource load state
    setTimeout(() => {
      if (mainWindow && !mainWindow.isDestroyed() && !mainWindow.isVisible()) {
        mainWindow.show();
        mainWindow.focus();
      }
    }, 250);

    // Handle external links safely in user's default browser without intercepting YouTube internals
    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
      if (url.includes('youtube.com') || url.includes('googlevideo.com') || url.includes('ytimg.com')) {
        return { action: 'allow' };
      }
      if (url.startsWith('http:') || url.startsWith('https:')) {
        shell.openExternal(url);
      }
      return { action: 'deny' };
    });

    mainWindow.webContents.on('will-navigate', (event, url) => {
      // Only intercept top-level main frame navigation; do NOT block iframe / media stream navigations
      if (event.isMainFrame && !url.startsWith('http://localhost') && !url.startsWith('http://127.0.0.1') && !url.startsWith('file://')) {
        event.preventDefault();
        shell.openExternal(url);
      }
    });

    mainWindow.webContents.setAudioMuted(false);

    // Toggle DevTools for debugging with F12 or Ctrl+Shift+I
    mainWindow.webContents.on('before-input-event', (event, input) => {
      if (input.key === 'F12' || (input.control && input.shift && input.key.toLowerCase() === 'i')) {
        mainWindow.webContents.toggleDevTools();
        event.preventDefault();
      }
    });

    if (isDev) {
      // Connect to Vite development server
      const devUrl = process.env.VITE_DEV_SERVER_URL || 'http://localhost:5173';
      mainWindow.loadURL(devUrl);
    } else {
      // Production mode: Serve bundled files via local HTTP server to guarantee full YouTube Iframe API handshake & audio streaming
      const distPath = path.join(__dirname, '../dist');
      startLocalServer(distPath).then((port) => {
        if (mainWindow) {
          mainWindow.loadURL(`http://127.0.0.1:${port}`);
        }
      });
    }

    mainWindow.on('close', (e) => {
      if (!isQuitting && minimizeToTray) {
        e.preventDefault();
        mainWindow.hide();
        return false;
      }
    });

    mainWindow.on('closed', () => {
      mainWindow = null;
      if (localServer) {
        try { localServer.close(); } catch (e) {}
        localServer = null;
      }
    });
  }

  // Window control IPC
  ipcMain.on('window-minimize', () => {
    if (mainWindow) mainWindow.minimize();
  });

  ipcMain.on('window-maximize', () => {
    if (mainWindow) {
      if (mainWindow.isMaximized()) {
        mainWindow.unmaximize();
      } else {
        mainWindow.maximize();
      }
    }
  });

  ipcMain.on('window-close', () => {
    if (mainWindow) {
      if (minimizeToTray) {
        mainWindow.hide();
      } else {
        mainWindow.close();
      }
    }
  });

  // Mini-Deck Always-on-top Widget Toggle
  ipcMain.handle('window-toggle-mini-deck', () => {
    if (!mainWindow) return { isMiniDeck: false };
    if (!isMiniDeck) {
      prevBounds = mainWindow.getBounds();
      isMiniDeck = true;
      mainWindow.setMinimumSize(380, 180);
      mainWindow.setSize(440, 220);
      mainWindow.setAlwaysOnTop(true, 'screen-saver');
      mainWindow.webContents.send('mini-deck-state', true);
      return { isMiniDeck: true };
    } else {
      isMiniDeck = false;
      mainWindow.setAlwaysOnTop(false);
      mainWindow.setMinimumSize(980, 640);
      if (prevBounds) {
        mainWindow.setBounds(prevBounds);
      } else {
        mainWindow.setSize(1360, 860);
      }
      mainWindow.webContents.send('mini-deck-state', false);
      return { isMiniDeck: false };
    }
  });

  ipcMain.on('tray:update-track', (_event, { title, artist }) => {
    if (title) {
      lastNowPlayingText = `🎵 ${title.slice(0, 32)}${artist ? ` - ${artist.slice(0, 22)}` : ''}`;
    } else {
      lastNowPlayingText = 'SHONO.FM — Precision Audio Archive';
    }
    updateTrayMenu();
  });

  ipcMain.on('tray:set-minimize-to-tray', (_event, enabled) => {
    minimizeToTray = Boolean(enabled);
  });

  ipcMain.handle('get-app-version', () => {
    return app.getVersion();
  });

  ipcMain.on('restart-app', () => {
    app.relaunch();
    app.quit();
  });

  // Discord Rich Presence IPC Handlers
  ipcMain.handle('discord:set-activity', (_event, data) => {
    try {
      discordRpc.setActivity(data);
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    }
  });

  ipcMain.handle('discord:clear-activity', () => {
    try {
      discordRpc.clearActivity();
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    }
  });

  ipcMain.handle('discord:update-config', (_event, config) => {
    try {
      discordRpc.updateConfig(config);
      return { success: true, connected: discordRpc.isConnected };
    } catch (e) {
      return { success: false, error: e.message };
    }
  });

  ipcMain.handle('discord:get-status', () => {
    return {
      enabled: discordRpc.enabled,
      isConnected: discordRpc.isConnected,
      isReady: discordRpc.isReady,
      clientId: discordRpc.clientId,
    };
  });

  // Persistent Vault Storage (survives app updates, port changes, cache wipes)
  ipcMain.handle('vault:load', async () => {
    try {
      const vaultPath = path.join(app.getPath('userData'), 'shono-vault.json');
      if (fs.existsSync(vaultPath)) {
        const raw = fs.readFileSync(vaultPath, 'utf8');
        return { success: true, data: JSON.parse(raw) };
      }
      return { success: true, data: null };
    } catch (err) {
      console.warn('[main] Failed to load vault:', err.message);
      return { success: false, error: err.message };
    }
  });

  ipcMain.handle('vault:save', async (_event, vaultData) => {
    try {
      const vaultDir = app.getPath('userData');
      if (!fs.existsSync(vaultDir)) fs.mkdirSync(vaultDir, { recursive: true });
      const vaultPath = path.join(vaultDir, 'shono-vault.json');
      fs.writeFileSync(vaultPath, JSON.stringify(vaultData, null, 2), 'utf8');
      return { success: true };
    } catch (err) {
      console.warn('[main] Failed to save vault:', err.message);
      return { success: false, error: err.message };
    }
  });

  // Alternative YouTube stream resolver for Error 150/101 auto-healing
  ipcMain.handle('search-alternative-youtube', async (_event, { query, excludeId, apiKey }) => {
    if (!query) return { success: false, error: 'NO_QUERY' };

    // 1. If apiKey is provided, query YouTube Data API v3 with videoEmbeddable=true
    if (apiKey) {
      try {
        const apiUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&videoEmbeddable=true&maxResults=5&q=${encodeURIComponent(query)}&key=${apiKey}`;
        const res = await fetch(apiUrl);
        if (res.ok) {
          const data = await res.json();
          if (data.items && data.items.length > 0) {
            for (const item of data.items) {
              const vidId = item.id?.videoId;
              if (vidId && vidId !== excludeId) {
                return { success: true, videoId: vidId, title: item.snippet?.title };
              }
            }
          }
        }
      } catch (e) {
        console.warn('[main] YouTube API search failed:', e);
      }
    }

    // 2. Direct fast scrape of youtube.com/results in Node.js
    try {
      const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
      const res = await fetch(searchUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
          'Accept-Language': 'en-US,en;q=0.9',
        },
      });
      if (res.ok) {
        const html = await res.text();
        const matches = [...html.matchAll(/\/watch\?v=([a-zA-Z0-9_-]{11})/g)].map((m) => m[1]);
        const unique = Array.from(new Set(matches));
        for (const id of unique) {
          if (id !== excludeId) {
            return { success: true, videoId: id };
          }
        }
      }
    } catch (err) {
      console.warn('[main] Direct YouTube search failed:', err);
    }

    return { success: false, error: 'NO_ALTERNATIVE_FOUND' };
  });

  // Discord-style Download & Install GitHub Release Installer (.exe)
  ipcMain.handle('download-and-install-update', async (_event, { downloadUrl }) => {
    if (!downloadUrl) return { success: false, error: 'NO_URL' };

    const tempDir = app.getPath('temp');
    const installerPath = path.join(tempDir, 'shono-fm-update-setup.exe');

    try {
      const res = await fetch(downloadUrl);
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);

      const totalBytes = parseInt(res.headers.get('content-length') || '0', 10);
      let receivedBytes = 0;

      const fileStream = fs.createWriteStream(installerPath);
      const reader = res.body.getReader();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        receivedBytes += value.length;
        fileStream.write(Buffer.from(value));

        const percent = totalBytes > 0 ? Math.round((receivedBytes / totalBytes) * 100) : 0;
        if (mainWindow && !mainWindow.isDestroyed()) {
          mainWindow.webContents.send('update-download-progress', { percent, receivedBytes, totalBytes });
        }
      }

      fileStream.end();

      await new Promise((resolve, reject) => {
        fileStream.on('finish', resolve);
        fileStream.on('error', reject);
      });

      // Launch installer and cleanly exit current process
      const { spawn } = require('child_process');
      if (process.platform === 'win32') {
        spawn('cmd.exe', ['/c', 'start', '""', installerPath], {
          detached: true,
          stdio: 'ignore',
        }).unref();
      } else {
        spawn(installerPath, [], {
          detached: true,
          stdio: 'ignore',
        }).unref();
      }

      isQuitting = true;
      setTimeout(() => {
        try {
          if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.destroy();
          }
        } catch (e) {}
        app.exit(0);
      }, 400);

      return { success: true };
    } catch (err) {
      console.error('[main] Update download error:', err);
      return { success: false, error: err.message };
    }
  });

  app.whenReady().then(() => {
    // Ensure YouTube accepts iframe embeds and audio streams
    session.defaultSession.webRequest.onBeforeSendHeaders((details, callback) => {
      const url = details.url;
      if (url.includes('googlevideo.com')) {
        // Media streams from Googlevideo CDN require youtube.com referer
        details.requestHeaders['Referer'] = 'https://www.youtube.com/';
        details.requestHeaders['Origin'] = 'https://www.youtube.com';
      } else if (url.includes('youtube.com') || url.includes('ytimg.com')) {
        // Provide verified HTTPS identity to satisfy YouTube embed policy
        details.requestHeaders['Referer'] = 'https://shono.fm/';
      }
      callback({ cancel: false, requestHeaders: details.requestHeaders });
    });

    session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
      const responseHeaders = { ...details.responseHeaders };

      // Strip frame restrictions case-insensitively to allow YouTube iframe embedding
      for (const key of Object.keys(responseHeaders)) {
        const lower = key.toLowerCase();
        if (lower === 'x-frame-options' || lower === 'content-security-policy') {
          delete responseHeaders[key];
        }
      }

      // DO NOT inject wildcard CORS on googlevideo.com or youtube.com!
      // Google Video already sends 'access-control-allow-origin: https://www.youtube.com'.
      // Injecting '*' causes multiple origins ('https://www.youtube.com, *'), which Chromium blocks with net::ERR_FAILED.
      const isGoogleMedia = details.url.includes('googlevideo.com') || details.url.includes('youtube.com') || details.url.includes('ytimg.com');
      if (!isGoogleMedia) {
        let hasAcao = false;
        for (const key of Object.keys(responseHeaders)) {
          if (key.toLowerCase() === 'access-control-allow-origin') {
            hasAcao = true;
            break;
          }
        }
        if (!hasAcao) {
          responseHeaders['Access-Control-Allow-Origin'] = ['*'];
        }
      }

      callback({ cancel: false, responseHeaders });
    });

    createWindow();
    createTray();

    try {
      globalShortcut.register('MediaPlayPause', () => mainWindow?.webContents.send('media-command', 'play-pause'));
      globalShortcut.register('MediaNextTrack', () => mainWindow?.webContents.send('media-command', 'next'));
      globalShortcut.register('MediaPreviousTrack', () => mainWindow?.webContents.send('media-command', 'prev'));
      globalShortcut.register('MediaStop', () => mainWindow?.webContents.send('media-command', 'pause'));
    } catch (err) {
      console.warn('[main] Global media shortcut notice:', err);
    }

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
      }
    });
  });

  app.on('will-quit', () => {
    try { globalShortcut.unregisterAll(); } catch (e) {}
    try { discordRpc.disconnect(); } catch (e) {}
    if (tray) {
      try { tray.destroy(); } catch (e) {}
      tray = null;
    }
  });

  app.on('window-all-closed', () => {
    try { discordRpc.disconnect(); } catch (e) {}
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });
}
