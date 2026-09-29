const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('installerAPI', {
  isElectron: true,
  close: () => ipcRenderer.send('installer:close'),
  minimize: () => ipcRenderer.send('installer:minimize'),
  getDefaultsPath: () => ipcRenderer.invoke('installer:get-defaults'),
  browseFolder: (currentPath) => ipcRenderer.invoke('installer:browse-folder', currentPath),
  startInstall: (options) => ipcRenderer.invoke('installer:start-install', options),
  launchApp: () => ipcRenderer.send('installer:launch-app'),
  onProgress: (callback) => {
    const handler = (event, data) => callback(data);
    ipcRenderer.on('installer:progress', handler);
    return () => ipcRenderer.removeListener('installer:progress', handler);
  },
});
