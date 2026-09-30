<div align="center">

  <img src="public/logo.png" alt="SHONO.FM Monogram" width="120" height="120" style="border-radius: 20px; box-shadow: 0 8px 32px rgba(0,0,0,0.6);" />

  # S H O N O . F M
  ### PRECISION SOUND ARCHIVE & ANALOG CONSOLE
  **v1.4.0 // INDUSTRIAL WORKSTATION**

  [![Release](https://img.shields.io/badge/Release-v1.4.0-ff6b00.svg?style=for-the-badge&logo=github&logoColor=white)](https://github.com/noobcoder1982/shono.fm/releases)
  [![Platform](https://img.shields.io/badge/Platform-Windows%20%7C%20macOS-000000.svg?style=for-the-badge&logo=apple&logoColor=white)](https://shonofm-software.vercel.app/)
  [![License](https://img.shields.io/badge/License-MIT-333333.svg?style=for-the-badge)](LICENSE)
  [![Audio DSP](https://img.shields.io/badge/DSP-Web%20Audio%2010--Band-22c55e.svg?style=for-the-badge)](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)

  <br />

  <p align="center">
    <b>SHONO.FM</b> bridges high-resolution streaming audio with tactile, physical analog hardware aesthetics.<br />
    Featuring dual playback consoles, real-time Apple Music-grade kinetic lyrics, studio 10-band equalization,<br />
    physical vinyl turntable physics, Discord Rich Presence, and standalone offline archive exporting.
  </p>

  <br />

  <!-- OFFICIAL DOWNLOAD CALLOUT -->
  <table>
    <tr>
      <td align="center" style="background-color: #0c0d12; border: 1px solid #ff6b00; padding: 20px; border-radius: 12px;">
        <h2 style="color: #ff6b00; margin: 0 0 10px 0;">⚡ OFFICIAL DESKTOP DOWNLOAD</h2>
        <p style="font-size: 15px; margin: 0 0 14px 0; color: #ffffff;">
          <b>DO NOT download the GitHub source code ZIP.</b><br />
          The raw code zip does not contain executable files and will not launch without developer build tools.<br />
          Download the official pre-compiled desktop app for <b>Windows</b> and <b>macOS</b> from our website:
        </p>
        <a href="https://shonofm-software.vercel.app/">
          <img src="https://img.shields.io/badge/DOWNLOAD_FROM_OFFICIAL_WEBSITE-shonofm--software.vercel.app-ff6b00?style=for-the-badge&logo=vercel&logoColor=white" alt="Download on Official Website" height="42" />
        </a>
        <br /><br />
        <small style="color: #888888;">Direct portal: <a href="https://shonofm-software.vercel.app/" style="color: #ff6b00;">https://shonofm-software.vercel.app/</a></small>
      </td>
    </tr>
  </table>

  <br />

  <p align="center">
    <a href="#-key-capabilities">Capabilities</a> •
    <a href="#-dual-consoles">Consoles</a> •
    <a href="#-zero-quota-engine">Audio Engine</a> •
    <a href="#-tactile-shortcuts">Shortcuts</a> •
    <a href="#-developer-setup">Developer Setup</a> •
    <a href="#-architecture">Architecture</a>
  </p>

</div>

---

## ⚡ Overview

**SHONO.FM** strips away bloated streaming clutter and generic flat corporate interfaces in favor of an **industrial brutalist sound deck**. Sourcing tracks from YouTube, local archives, and custom playlists, SHONO.FM treats audio as a tangible archive with physical deck feedback, frequency telemetry, and zero-compromise playback controls.

```
┌────────────────────────────────────────────────────────────────────────┐
│                              SHONO.FM v1.4.0                           │
├───────────────┬────────────────────────────────────────┬───────────────┤
│  01 // NAV    │  02 // ARCHIVE LEDGER                  │  03 // DECK   │
│               │                                        │               │
│ • Vault Index │  [🔍 Cmd/Ctrl+K Universal Search]       │ [Cover Art]   │
│ • Collections │                                        │ Track Title   │
│ • Mixtapes    │  TRK  TITLE            ARTIST    TIME  │ Artist Name   │
│ • Settings    │  001  Midnight City    M83       04:03 │ ───────────── │
│               │  002  Instant Crush    Daft Punk 05:37 │ 10-Band EQ    │
│ [Photo Quote] │  003  Nightcall        Kavinsky  04:18 │ Synced Lyrics │
└───────────────┴────────────────────────────────────────┴───────────────┘
```

---

## 🎛️ Key Capabilities

### 1. Dual Playback Consoles
* **01 // ARCHIVE Mode**: High-density 3-column studio console with vault navigation, central track ledger, and telemetry sideplayer.
* **02 // MI6 Turntable Mode**: Skeuomorphic analog vinyl deck engineered with authentic platter inertia, multi-speed selection (**33 ⅓**, **45**, and **78 RPM**), physical tonearm cueing, and synthetic vinyl surface crackle.

### 2. Autonomous Zero-Quota Search Engine
* **Universal Search Bar**: Instantly search tracks, curated playlists, or entire YouTube creator channels.
* **Instant URL Ingestion**: Paste any YouTube video, playlist, or mix URL directly into the search bar for zero-delay playback and library curation.
* **Zero-Quota Protection**: Built-in autonomous fallback engine seamlessly recovers if Google Data API quotas are exhausted, guaranteeing 24/7 search availability.

### 3. Apple Music-Grade Kinetic Lyrics
* **Synced Typography**: Dynamic synchronized lyrics with word-level highlighting and choreography.
* **Aesthetic Lyric Cards**: Highlight your favorite 2–4 lines of lyrics in Fullscreen player to generate beautiful graphic quote cards and posters ready for export.

### 4. Studio 10-Band Graphic Equalizer & Master Telemetry
* **10-Band Web Audio DSP**: Calibrated frequencies from 32 Hz to 16 kHz with zero distortion.
* **Real-Time Oscilloscope**: Audio spectrum analyzer powered by Web Audio `AnalyserNode`.
* **Pro Audio Presets**: *Flat*, *Bass Boost*, *Treble Boost*, *Vocal Focus*, *Electronic*, *Vinyl Warmth*, and *Rock*.
* **Smooth Crossfader**: Configurable gapless track crossfading (0 to 8 seconds).

### 5. Desktop-Grade Integration (Windows & macOS)
* **Curved Hardware Frame**: Frameless desktop container with hardware-calibrated rounded corners and subtle drop shadows.
* **Always-On-Top Mini Deck**: Floating cassette widget with animated spinning hubs and micro-controls.
* **Smart Background Auto-Updater**: Native version engine that detects new releases, downloads installers in the background, and prevents duplicate alerts.
* **Discord Rich Presence (RPC)**: Broadcasts current playing track, artist name, elapsed time, and dynamic artwork directly to your Discord status.
* **System Tray Minimization**: Seamlessly minimize to the Windows/macOS tray with native media key support.

### 6. Calibrated Industrial Themes
Includes **12+ curated hardware themes**:
`noir` • `concrete` • `braun` • `tapedeck` • `phosphor` • `swiss` • `stealth` • `dark_plus` • `blue` • `beige` • `green`

---

## ⌨️ Tactile Shortcuts

| Key Binding | Function |
| :--- | :--- |
| <kbd>Space</kbd> | Play / Pause master transport |
| <kbd>→</kbd> / <kbd>L</kbd> | Skip forward 5 seconds |
| <kbd>←</kbd> / <kbd>J</kbd> | Skip backward 5 seconds |
| <kbd>Shift</kbd> + <kbd>→</kbd> / <kbd>N</kbd> | Next track in queue |
| <kbd>Shift</kbd> + <kbd>←</kbd> / <kbd>P</kbd> | Previous track |
| <kbd>↑</kbd> / <kbd>↓</kbd> | Master volume increment / decrement |
| <kbd>M</kbd> | Master audio mute toggle |
| <kbd>F</kbd> | Fullscreen immersive visualizer |
| <kbd>Ctrl</kbd> / <kbd>Cmd</kbd> + <kbd>K</kbd> | Universal search & playlist importer |
| <kbd>Ctrl</kbd> / <kbd>Cmd</kbd> + <kbd>,</kbd> | Preferences & audio hardware settings |
| <kbd>Esc</kbd> | Close active modal, search, or drawer |

---

## 💻 Developer Setup & Contributing

If you wish to build SHONO.FM from source or contribute to its development, follow the instructions below.  
*(End users should download pre-compiled releases from the [official website](https://shonofm-software.vercel.app/)).*

<details>
<summary><b>Click to expand Developer Instructions</b></summary>

### Prerequisites
* [Node.js](https://nodejs.org/) (v20 or higher recommended)
* `npm` or `pnpm`

### 1. Clone & Install
```bash
git clone https://github.com/noobcoder1982/shono.fm.git
cd shono.fm
npm install
```

### 2. Run in Web Development Mode
Starts the Vite development server with Hot Module Replacement (HMR):
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 3. Run in Desktop Electron Mode
Launches the Electron desktop environment:
```bash
npm run electron:dev
```

### 4. Compiling & Packaging

```bash
# Verify TypeScript & compile production web bundle
npm run build

# Package Windows NSIS installer
npm run electron:build:installer

# Package macOS DMG (on macOS runner)
npm run mac:build
```

</details>

---

## 📂 Architecture

```
muszix/
├── electron/
│   ├── main.cjs                # Electron window manager, IPC router, auto-updater
│   ├── discordRpc.cjs          # Discord Rich Presence IPC bridge
│   └── preload.cjs             # Secure IPC context bridge
├── src/
│   ├── components/
│   │   ├── mi6/                # MI6 Vinyl Turntable console & physics
│   │   ├── AppleLyrics.tsx     # Apple Music kinetic synced lyrics
│   │   ├── FullscreenPlayer.tsx# Ambient glow visualizer
│   │   ├── MiniDeckWidget.tsx  # Floating cassette widget
│   │   ├── MasterWaveform.tsx  # Oscilloscope & frequency spectrum
│   │   ├── SettingsPage.tsx    # Hardware settings & dynamic changelog
│   │   └── SidePlayer.tsx      # Dual-mode side telemetry player
│   ├── services/
│   │   ├── audioEngine.ts      # Web Audio DSP pipeline & YouTube stream driver
│   │   ├── youtubeSearchService.ts # Resilient zero-quota search engine
│   │   ├── updateService.ts    # Smart semver version engine & installer runner
│   │   ├── lyricsService.ts    # Multi-source LRC synchronizer
│   │   └── storage.ts          # Persistent vault & hardware settings
│   ├── context/
│   │   └── PlayerContext.tsx   # Global reactive state machine
│   └── App.tsx                 # Core console orchestrator
└── package.json
```

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

<div align="center">
  <sub>Engineered with precision for sound collectors and analog purists.</sub><br />
  <sub><b>SHONO.FM // SYSTEM AUDIO ARCHIVE</b></sub>
</div>
