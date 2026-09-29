const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const rootDir = path.resolve(__dirname, '..');
const stageDir = path.join(rootDir, 'dist-electron', 'stage');
const asarOutput = path.join(rootDir, 'dist-electron', 'app', 'win-unpacked', 'resources', 'app.asar');

console.log('[pack_asar] Preparing stage directory at:', stageDir);
if (fs.existsSync(stageDir)) {
  fs.rmSync(stageDir, { recursive: true, force: true });
}
fs.mkdirSync(stageDir, { recursive: true });

// Copy dist/
fs.cpSync(path.join(rootDir, 'dist'), path.join(stageDir, 'dist'), { recursive: true });

// Copy electron/ (excluding installer)
const electronStage = path.join(stageDir, 'electron');
fs.mkdirSync(electronStage, { recursive: true });
['main.cjs', 'preload.cjs', 'discordRpc.cjs', 'icon.png'].forEach(file => {
  const src = path.join(rootDir, 'electron', file);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, path.join(electronStage, file));
  }
});

// Copy package.json
fs.copyFileSync(path.join(rootDir, 'package.json'), path.join(stageDir, 'package.json'));

console.log('[pack_asar] Packing app.asar...');
execSync(`npx @electron/asar pack "${stageDir}" "${asarOutput}"`, { stdio: 'inherit', cwd: rootDir });

console.log('[pack_asar] Cleaning up temporary stage directory...');
fs.rmSync(stageDir, { recursive: true, force: true });

console.log('[pack_asar] Successfully built app.asar at:', asarOutput);

// Also sync with installer payload if present
const installerPayloadAsar = path.join(rootDir, 'release', 'win-unpacked', 'resources', 'app-payload', 'resources', 'app.asar');
if (fs.existsSync(path.dirname(installerPayloadAsar))) {
  console.log('[pack_asar] Syncing app.asar into installer payload:', installerPayloadAsar);
  fs.copyFileSync(asarOutput, installerPayloadAsar);
}

// Build the installer's own app.asar in release/win-unpacked/resources/app.asar
const installerAsarOutput = path.join(rootDir, 'release', 'win-unpacked', 'resources', 'app.asar');
if (fs.existsSync(path.dirname(installerAsarOutput))) {
  const installerStageDir = path.join(rootDir, 'dist-electron', 'installer-stage');
  console.log('[pack_asar] Preparing installer stage directory at:', installerStageDir);
  if (fs.existsSync(installerStageDir)) {
    fs.rmSync(installerStageDir, { recursive: true, force: true });
  }
  fs.mkdirSync(installerStageDir, { recursive: true });

  // Minimal package.json for the installer
  const installerPkg = {
    name: 'shono-fm-setup',
    version: '1.3.0',
    main: 'electron/installer.cjs',
  };
  fs.writeFileSync(path.join(installerStageDir, 'package.json'), JSON.stringify(installerPkg, null, 2));

  // Copy installer files into installer-stage/electron
  const installerElectronDir = path.join(installerStageDir, 'electron');
  fs.mkdirSync(installerElectronDir, { recursive: true });
  fs.cpSync(path.join(rootDir, 'electron', 'installer'), path.join(installerElectronDir, 'installer'), { recursive: true });
  fs.copyFileSync(path.join(rootDir, 'electron', 'installer.cjs'), path.join(installerElectronDir, 'installer.cjs'));
  fs.copyFileSync(path.join(rootDir, 'electron', 'installer-preload.cjs'), path.join(installerElectronDir, 'installer-preload.cjs'));
  if (fs.existsSync(path.join(rootDir, 'electron', 'icon.png'))) {
    fs.copyFileSync(path.join(rootDir, 'electron', 'icon.png'), path.join(installerElectronDir, 'icon.png'));
  }

  // Copy build icon if present
  const buildDir = path.join(installerStageDir, 'build');
  fs.mkdirSync(buildDir, { recursive: true });
  if (fs.existsSync(path.join(rootDir, 'build', 'icon.png'))) {
    fs.copyFileSync(path.join(rootDir, 'build', 'icon.png'), path.join(buildDir, 'icon.png'));
  }

  console.log('[pack_asar] Packing installer app.asar at:', installerAsarOutput);
  execSync(`npx @electron/asar pack "${installerStageDir}" "${installerAsarOutput}"`, { stdio: 'inherit', cwd: rootDir });
  fs.rmSync(installerStageDir, { recursive: true, force: true });
  console.log('[pack_asar] Successfully built installer app.asar!');
}

