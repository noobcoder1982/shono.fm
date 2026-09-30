const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  isElectron: true,
  platform: process.platform,
  version: '1.4.2',
  minimize: () => ipcRenderer.send('window-minimize'),
  maximize: () => ipcRenderer.send('window-maximize'),
  close: () => ipcRenderer.send('window-close'),
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  restartApp: () => ipcRenderer.send('restart-app'),
  loadVault: () => ipcRenderer.invoke('vault:load'),
  saveVault: (data) => ipcRenderer.invoke('vault:save', data),
  searchAlternativeYoutube: (params) => ipcRenderer.invoke('search-alternative-youtube', params),
  downloadAndInstallUpdate: (params) => ipcRenderer.invoke('download-and-install-update', params),
  onUpdateProgress: (callback) => {
    const listener = (_event, data) => callback(data);
    ipcRenderer.on('update-download-progress', listener);
    return () => ipcRenderer.removeListener('update-download-progress', listener);
  },
  setDiscordActivity: (data) => ipcRenderer.invoke('discord:set-activity', data),
  clearDiscordActivity: () => ipcRenderer.invoke('discord:clear-activity'),
  updateDiscordConfig: (config) => ipcRenderer.invoke('discord:update-config', config),
  getDiscordStatus: () => ipcRenderer.invoke('discord:get-status'),
  toggleMiniDeck: () => ipcRenderer.invoke('window-toggle-mini-deck'),
  updateTrayTrack: (data) => ipcRenderer.send('tray:update-track', data),
  setMinimizeToTray: (enabled) => ipcRenderer.send('tray:set-minimize-to-tray', enabled),
  onMediaCommand: (callback) => {
    const listener = (_event, cmd) => callback(cmd);
    ipcRenderer.on('media-command', listener);
    return () => ipcRenderer.removeListener('media-command', listener);
  },
});
