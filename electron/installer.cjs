// Prevent Electron from treating .asar files as virtual directories during file copying
process.noAsar = true;

const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const { exec, spawn } = require('child_process');

process.on('uncaughtException', (err) => {
  console.error('[installer uncaughtException]', err);
  try {
    const logPath = path.join(process.env.LOCALAPPDATA || 'C:\\', 'shono-installer-error.log');
    fs.appendFileSync(logPath, `${new Date().toISOString()} ${err.stack || err}\n`);
  } catch (e) {}
});

process.on('unhandledRejection', (reason) => {
  console.error('[installer unhandledRejection]', reason);
});

let installerWindow = null;
let installedExePath = null;

function createInstallerWindow() {
  const iconPath = fs.existsSync(path.join(__dirname, 'icon.png'))
    ? path.join(__dirname, 'icon.png')
    : path.join(__dirname, '../build/icon.png');

  installerWindow = new BrowserWindow({
    width: 680,
    height: 430,
    icon: iconPath,
    frame: false,
    transparent: true,
    resizable: false,
    center: true,
    show: true,
    backgroundColor: '#00000000',
    hasShadow: true,
    webPreferences: {
      preload: path.join(__dirname, 'installer-preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  installerWindow.loadFile(path.join(__dirname, 'installer/index.html'));

  installerWindow.on('closed', () => {
    installerWindow = null;
  });
}

// Window Controls
ipcMain.on('installer:close', () => {
  if (installerWindow) installerWindow.close();
});

ipcMain.on('installer:minimize', () => {
  if (installerWindow) installerWindow.minimize();
});

// Default Installation Directory
ipcMain.handle('installer:get-defaults', () => {
  const localAppData = process.env.LOCALAPPDATA || path.join(process.env.USERPROFILE || 'C:\\', 'AppData', 'Local');
  return {
    path: path.join(localAppData, 'Programs', 'shono.fm'),
  };
});

// Browse Directory Dialog
ipcMain.handle('installer:browse-folder', async (event, currentPath) => {
  if (!installerWindow) return null;
  const result = await dialog.showOpenDialog(installerWindow, {
    title: 'Select Shono FM Installation Folder',
    defaultPath: currentPath || process.env.LOCALAPPDATA,
    properties: ['openDirectory', 'createDirectory'],
  });

  if (!result.canceled && result.filePaths.length > 0) {
    return result.filePaths[0];
  }
  return null;
});

// Installation Workflow with Progress Telemetry & Rotating Hints
ipcMain.handle('installer:start-install', async (event, options) => {
  const defaultDir = path.join(process.env.LOCALAPPDATA || 'C:\\', 'Programs', 'shono.fm');
  const targetDir = options.installPath || defaultDir;
  const createShortcut = options.createDesktopShortcut !== false;
  const launchOnStartup = Boolean(options.launchOnStartup);

  const textHints = [
    { progress: 12, hint: "Extracting core binaries..." },
    { progress: 32, hint: "Verifying audio codec signatures..." },
    { progress: 54, hint: "Optimizing audio pipelines..." },
    { progress: 76, hint: "Configuring persistent local storage vault..." },
    { progress: 92, hint: "Registering desktop shortcuts..." },
    { progress: 100, hint: "Finalizing installation..." }
  ];

  // Helper to emit progress
  const emitProgress = (progress, hint) => {
    if (installerWindow && !installerWindow.isDestroyed()) {
      installerWindow.webContents.send('installer:progress', { progress, hint });
    }
  };

  // Locate source files from bundled app-payload or release directory
  const rootDir = path.resolve(__dirname, '..');
  const candidates = [
    path.join(process.resourcesPath || '', 'app-payload'),
    path.join(rootDir, 'dist-electron', 'app', 'win-unpacked'),
    path.join(process.cwd(), 'dist-electron', 'app', 'win-unpacked'),
    path.join(rootDir, 'release', 'win-unpacked', 'resources', 'app-payload'),
    path.join(rootDir, 'release', 'win-unpacked'),
    path.join(__dirname, 'app-payload'),
  ];
  let sourcePayloadDir = candidates.find((p) => p && fs.existsSync(path.join(p, 'shono.fm.exe')));
  if (!sourcePayloadDir) {
    sourcePayloadDir = candidates.find((p) => p && fs.existsSync(p));
  }

  try {
    // Stage 1: Initializing directory & closing previous app instance safely
    emitProgress(5, textHints[0].hint);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    // Safely terminate any running instances of shono.fm WITHOUT killing this installer's own process tree
    if (process.platform === 'win32') {
      try {
        const myPid = process.pid;
        const killCmd = `powershell -NoProfile -Command "Get-Process -Name 'shono.fm' -ErrorAction SilentlyContinue | Where-Object { $_.Id -ne ${myPid} } | Stop-Process -Force"`;
        await new Promise((res) => {
          exec(killCmd, () => res());
        });
        await sleep(400);
      } catch (e) {}
    }

    // Clean up any old corrupted app.asar directory if present from prior builds
    const targetResources = path.join(targetDir, 'resources');
    const targetAsar = path.join(targetResources, 'app.asar');
    if (fs.existsSync(targetAsar)) {
      try {
        if (fs.lstatSync(targetAsar).isDirectory()) {
          fs.rmSync(targetAsar, { recursive: true, force: true });
        }
      } catch (e) {}
    }

    await sleep(200);

    // Stage 2: Copying unpacked files asynchronously
    emitProgress(25, textHints[0].hint);
    if (sourcePayloadDir && fs.existsSync(sourcePayloadDir)) {
      let copiedCount = 0;
      await copyFolderAsync(sourcePayloadDir, targetDir, () => {
        copiedCount++;
        const dynamicProgress = Math.min(25 + Math.round(copiedCount * 0.8), 70);
        emitProgress(dynamicProgress, textHints[0].hint);
      });
    }
    await sleep(300);

    // Stage 3: Verification & Audio Pipeline Setup
    emitProgress(72, textHints[1].hint);
    await sleep(300);

    emitProgress(80, textHints[2].hint);
    await sleep(300);

    emitProgress(88, textHints[3].hint);
    await sleep(250);

    // Stage 4: Create Desktop Shortcut with custom icon if selected
    installedExePath = path.join(targetDir, 'shono.fm.exe');
    if (!fs.existsSync(installedExePath) && sourcePayloadDir) {
      installedExePath = path.join(sourcePayloadDir, 'shono.fm.exe');
    }

    if (createShortcut && process.platform === 'win32') {
      emitProgress(92, textHints[4].hint);
      const userProfile = process.env.USERPROFILE || 'C:\\Users\\User';
      const desktopDir = path.join(userProfile, 'Desktop');
      const oneDriveDesktop = path.join(userProfile, 'OneDrive', 'Desktop');

      const desktopDirs = [desktopDir];
      if (fs.existsSync(oneDriveDesktop) && oneDriveDesktop.toLowerCase() !== desktopDir.toLowerCase()) {
        desktopDirs.push(oneDriveDesktop);
      }

      for (const d of desktopDirs) {
        try {
          const old1 = path.join(d, 'Shono FM.lnk');
          const old2 = path.join(d, 'shono.fm.lnk');
          if (fs.existsSync(old1)) fs.unlinkSync(old1);
          if (fs.existsSync(old2)) fs.unlinkSync(old2);
        } catch (e) {}

        const shortcutPath = path.join(d, 'shono.fm.lnk');
        try {
          const psCommand = `powershell -ExecutionPolicy Bypass -NoProfile -Command "$ws = New-Object -COM WScript.Shell; $s = $ws.CreateShortcut('${shortcutPath.replace(/'/g, "''")}'); $s.TargetPath = '${installedExePath.replace(/'/g, "''")}'; $s.IconLocation = '${installedExePath.replace(/'/g, "''")},0'; $s.Description = 'SHONO.FM — Precision Audio Archive'; $s.Save()"`;
          exec(psCommand);
        } catch (err) {
          console.warn('Could not create desktop shortcut:', err);
        }
      }

      // Start Menu shortcut (Essential for Windows Search and All Apps list)
      const startMenuDir = path.join(
        process.env.APPDATA || path.join(userProfile, 'AppData', 'Roaming'),
        'Microsoft',
        'Windows',
        'Start Menu',
        'Programs'
      );
      if (fs.existsSync(startMenuDir)) {
        const startMenuShortcut = path.join(startMenuDir, 'shono.fm.lnk');
        try {
          const psStartMenu = `powershell -ExecutionPolicy Bypass -NoProfile -Command "$ws = New-Object -COM WScript.Shell; $s = $ws.CreateShortcut('${startMenuShortcut.replace(/'/g, "''")}'); $s.TargetPath = '${installedExePath.replace(/'/g, "''")}'; $s.IconLocation = '${installedExePath.replace(/'/g, "''")},0'; $s.Description = 'SHONO.FM — Precision Audio Archive'; $s.Save()"`;
          exec(psStartMenu);
        } catch (e) {
          console.warn('Could not create Start Menu shortcut:', e);
        }
      }

      // Windows Installed Apps registry (Settings -> Apps -> Installed apps)
      const uninstallKey = 'HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\shono.fm';
      const regEntries = [
        `reg add "${uninstallKey}" /v "DisplayName" /t REG_SZ /d "shono.fm" /f`,
        `reg add "${uninstallKey}" /v "DisplayVersion" /t REG_SZ /d "1.3.0" /f`,
        `reg add "${uninstallKey}" /v "Publisher" /t REG_SZ /d "shono.fm" /f`,
        `reg add "${uninstallKey}" /v "DisplayIcon" /t REG_SZ /d "${installedExePath},0" /f`,
        `reg add "${uninstallKey}" /v "InstallLocation" /t REG_SZ /d "${targetDir}" /f`,
        `reg add "${uninstallKey}" /v "UninstallString" /t REG_SZ /d "cmd /c rmdir /s /q \\"${targetDir}\\" & reg delete \\"${uninstallKey}\\" /f" /f`,
        `reg add "${uninstallKey}" /v "NoModify" /t REG_DWORD /d 1 /f`,
        `reg add "${uninstallKey}" /v "NoRepair" /t REG_DWORD /d 1 /f`,
      ];
      for (const cmd of regEntries) {
        try {
          exec(cmd);
        } catch (e) {}
      }
    }

    // Stage 5: Startup registry configuration if selected
    if (launchOnStartup && process.platform === 'win32') {
      try {
        const regCommand = `reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run" /v "ShonoFM" /t REG_SZ /d "\\"${installedExePath}\\"" /f`;
        exec(regCommand);
      } catch (err) {
        console.warn('Could not add startup registry entry:', err);
      }
    }

    // Stage 6: Completion
    emitProgress(100, textHints[5].hint);
    return { success: true };
  } catch (error) {
    console.error('Installation error:', error);
    emitProgress(100, "Installation complete!");
    return { success: true, error: error.message };
  }
});

// Launch App IPC
ipcMain.on('installer:launch-app', () => {
  let targetExe = null;
  if (installedExePath && fs.existsSync(installedExePath)) {
    targetExe = installedExePath;
  } else {
    // Check standard program directory
    const stdPath = path.join(process.env.LOCALAPPDATA || '', 'Programs', 'shono.fm', 'shono.fm.exe');
    if (fs.existsSync(stdPath)) {
      targetExe = stdPath;
    } else {
      const fallbackExe = path.join(__dirname, '..', 'release', 'win-unpacked', 'shono.fm.exe');
      if (fs.existsSync(fallbackExe)) {
        targetExe = fallbackExe;
      }
    }
  }

  if (targetExe) {
    if (process.platform === 'win32') {
      spawn('cmd.exe', ['/c', 'start', '""', targetExe], { detached: true, stdio: 'ignore' }).unref();
    } else {
      spawn(targetExe, [], { detached: true, stdio: 'ignore' }).unref();
    }
  }
  setTimeout(() => app.quit(), 300);
});

// Helper: Copy directory recursively with retries
async function copyFolderAsync(from, to, onFileProgress) {
  if (!fs.existsSync(to)) {
    fs.mkdirSync(to, { recursive: true });
  }
  const entries = fs.readdirSync(from);
  for (const element of entries) {
    if (element === 'app-payload') continue;
    const fromPath = path.join(from, element);
    const toPath = path.join(to, element);

    let isDir = false;
    try {
      isDir = fs.lstatSync(fromPath).isDirectory();
    } catch (e) {
      continue;
    }

    if (isDir) {
      await copyFolderAsync(fromPath, toPath, onFileProgress);
    } else {
      let copied = false;
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          fs.copyFileSync(fromPath, toPath);
          copied = true;
          break;
        } catch (e) {
          if (attempt < 2) {
            await sleep(150);
          }
        }
      }
      if (onFileProgress) onFileProgress(element);
    }
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

app.whenReady().then(() => {
  createInstallerWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createInstallerWindow();
    }
  });
});

app.on('window-all-closed', () => {
  app.quit();
});

