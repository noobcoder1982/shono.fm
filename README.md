<div align="center">

  <img src="public/logo.png" alt="SHONO.FM Logo" width="128" height="128" />

  # SHONO.FM
  ### Precision Digital Sound Archive & Analog Turntable Console

  [![Version](https://img.shields.io/badge/version-1.2.0-orange.svg?style=flat-square)](package.json)
  [![Electron](https://img.shields.io/badge/Electron-44-47848F?style=flat-square&logo=electron&logoColor=white)](https://www.electronjs.org/)
  [![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
  [![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
  [![License](https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square)](LICENSE)

  <p align="center">
    <b>SHONO.FM</b> is an audiophile-grade desktop sound console and precision archive that bridges streaming digital audio with tactical analog hardware aesthetics. Featuring dual playback interfaces, real-time Apple Music-style synchronized lyrics, Web Audio 10-band equalization, vinyl turntable simulation, Discord Rich Presence, and standalone offline archive exporting.
  </p>

  <p align="center">
    <a href="#-key-features">Key Features</a> •
    <a href="#-dual-playback-consoles">Consoles</a> •
    <a href="#-audiophile-engine">Audio Engine</a> •
    <a href="#-keyboard-shortcuts">Shortcuts</a> •
    <a href="#-installation--usage">Installation</a> •
    <a href="#-tech-stack">Tech Stack</a>
  </p>

</div>

---

## ⚡ Overview

**SHONO.FM** strips away browser tab clutter, bloated streaming UIs, and generic flat designs in favor of an **industrial brutalist sound workstation**. Whether sourcing tracks from YouTube streams, local files, or imported playlists, SHONO.FM treats audio as a tangible archive with physical deck feedback, frequency telemetry, and zero-compromise playback controls.

---

## ✨ Key Features

### 🎛️ Dual Playback Consoles
* **01 // ARCHIVE Mode**: A high-density, three-column audio console featuring an index repository sidebar, central track ledger with archive dossiers, and a dedicated telemetry sideplayer with real-time spectrum analysis.
* **02 // MI6 Turntable Mode**: A skeuomorphic analog vinyl turntable simulation engineered with authentic platter inertia, multi-speed selection (**33 ⅓**, **45**, and **78 RPM**), physical tonearm cueing, and synthetic vinyl surface crackle.

### 🎤 Synchronized Kinetic Lyrics
* **Apple Music-Style Fluidity**: Real-time synchronized lyrics engine powered by multi-source API integration (LRCLIB, Lyrics.ovh, and local cache).
* **Word-by-Word Karaoke**: Syllable & word-level highlighting with smooth scroll choreography.
* **Lyric Card Generator**: Create and export high-resolution, beautifully styled lyric quote cards to share across social platforms.

### 🎚️ 10-Band Graphic Equalizer & Master Telemetry
* **Web Audio DSP Engine**: Studio-grade 10-band hardware equalizer spanning 32 Hz to 16 kHz with zero clipping.
* **Master Telemetry Waveform**: Real-time oscilloscope and frequency spectrum visualizer powered by Web Audio `AnalyserNode`.
* **Pro Audio Presets**: Includes *Flat*, *Bass Boost*, *Treble Boost*, *Vocal Focus*, *Electronic*, *Vinyl Warmth*, and *Rock*.
* **Gapless Crossfader**: Smooth configurable crossfade transitions (0 to 8 seconds) between queue tracks.

### 🎨 Industrial Design System & Dynamic Lighting
* **12+ Calibrated Hardware Themes**:
  * `noir` — Matte Obsidian & Monochrome Stealth
  * `concrete` — Architectural Raw Brutalism
  * `braun` — 1960s Dieter Rams Minimalist German Industrial
  * `tapedeck` — Vintage Hi-Fi Cassette Deck Amber
  * `phosphor` — 1980s CRT Terminal Monochromatic Green
  * `swiss` — International Typographic Style High Contrast
  * `stealth` — Deep OLED Pitch Black
  * `dark_plus`, `blue`, `beige`, `green`
* **Dynamic Artwork Color Extraction**: Extracts primary accents from album cover art in real-time, subtly tinting glow vectors and reactive visualizers.

### 📼 Mini Deck & Immersive Fullscreen
* **Mini Deck Cassette Widget**: Compact, floating, always-on-top retro cassette player with micro transport controls, time display, and instant restore.
* **Fullscreen Now Playing**: Immersive full-window display with animated ambient art blur, reactive audio backdrops, and synchronized karaoke lyrics.

### 📦 Standalone Archive Packaging & Mixtapes
* **ZIP Archive Vault**: Export entire playlists into self-contained zip files containing:
  * High-res album covers (`.jpg`/`.png`)
  * Synced LRC lyric files (`.lrc`)
  * Universal M3U8 playlists (`.m3u8`)
  * Structured JSON metadata dossier
  * Automated `yt-dlp` / `curl` scripts for permanent offline archiving
* **Mixtape Maker**: Create, curate, and reorder custom mixtapes with custom tags, curators, and artwork.

### 🖥️ Native Desktop Integration (Electron)
* **Borderless Console Frame**: Bespoke frameless window with tactile custom industrial titlebar controls.
* **Discord Rich Presence (RPC)**: Broadcasts current playing track, artist name, elapsed time, and dynamic cover art directly to your Discord profile.
* **System MediaSession & Tray**: Native Windows media key controls, lock screen metadata integration, and background minimization to the system tray with transport menu.

---

## 🎮 Dual Playback Consoles

```
┌────────────────────────────────────────────────────────────────────────┐
│                               SHONO.FM                                 │
├───────────────┬────────────────────────────────────────┬───────────────┤
│  01 // NAV    │  02 // ARCHIVE LEDGER                  │  03 // DECK   │
│               │                                        │               │
│ • Vault Index │  [🔍 Cmd+K Search / Playlist Importer] │ [Cover Art]   │
│ • Collections │                                        │ Track Title   │
│ • Mixtapes    │  TRK  TITLE            ARTIST    TIME  │ Artist Name   │
│ • Settings    │  001  Midnight City    M83       04:03 │ ───────────── │
│               │  002  Instant Crush    Daft Punk 05:37 │ 10-Band EQ    │
│ [Photo Quote] │  003  Nightcall        Kavinsky  04:18 │ Synced Lyrics │
│               │  004  After Hours      Weeknd    06:01 │ Queue / Live  │
├───────────────┴────────────────────────────────────────┴───────────────┤
│  ▶ 01:24 ━━━━━━━━━━━━━━━━━━━●──────────────────────── 04:03  🔊 92%    │
└────────────────────────────────────────────────────────────────────────┘
```

| Mode | Key Features |
|---|---|
| **Archive Console** | Structured tabular track ledger, playlist importing, quick-filter tagging, live frequency oscilloscope, persistent bottom playback strip. |
| **MI6 Vinyl Deck** | Photorealistic spinning vinyl platter, tonearm tracking, variable RPM switches (33 ⅓, 45, 78), analog pitch slider, authentic vinyl surface crackle synthesis. |

---

## ⌨️ Keyboard Shortcuts

SHONO.FM is built for rapid, keyboard-centric control:

| Key | Action |
|---|---|
| <kbd>Space</kbd> | Play / Pause |
| <kbd>N</kbd> | Next Track |
| <kbd>P</kbd> | Previous Track |
| <kbd>S</kbd> | Toggle Shuffle |
| <kbd>R</kbd> | Cycle Repeat Mode (`OFF` / `ALL` / `ONE`) |
| <kbd>M</kbd> | Toggle Mute |
| <kbd>Q</kbd> | Toggle Side Player Queue View |
| <kbd>F</kbd> | Toggle Immersive Fullscreen Mode |
| <kbd>I</kbd> | Toggle Minimalist Immersive Visualizer (in Fullscreen) |
| <kbd>Cmd</kbd> / <kbd>Ctrl</kbd> + <kbd>K</kbd> or <kbd>/</kbd> | Open Global Command Search & Importer |
| <kbd>?</kbd> | Open Keyboard Shortcuts Cheat Sheet |
| <kbd>Esc</kbd> | Dismiss Active Modals / Fullscreen / Search |

---

## 🛠️ Tech Stack

* **UI Framework**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
* **Build Tool**: [Vite 8](https://vitejs.dev/)
* **Desktop Runtime**: [Electron 44](https://www.electronjs.org/) + [electron-builder](https://www.electron.build/)
* **Animation & Physics**: [GSAP 3](https://greensock.com/gsap/)
* **Audio DSP**: Web Audio API (`AudioContext`, `BiquadFilterNode`, `AnalyserNode`)
* **Audio Streams**: YouTube IFrame API & Web Audio Synthesizer Fallback
* **Archive Compression**: [JSZip](https://stuk.github.io/jszip/)
* **Desktop Integrations**: Discord RPC (`@discordjs/rpc`), System MediaSession API
* **Icons**: [Lucide React](https://lucide.dev/)

---

## 🚀 Installation & Usage

### Prerequisites
* [Node.js](https://nodejs.org/) (v18 or higher recommended)
* `npm` or `pnpm` / `yarn`

### 1. Clone the Repository
```bash
git clone https://github.com/noobcoder1982/shono.fm.git
cd shono.fm
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Run in Web Development Mode
Starts the Vite development server with Hot Module Replacement (HMR):
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 4. Run in Desktop Electron Mode
Launches the standalone Electron desktop client alongside Vite:
```bash
npm run electron:dev
```

### 5. Packaging & Distribution

To build native Windows desktop installers and executables:

```bash
# Compile web assets and pack asar archive
npm run electron:pack

# Generate NSIS Windows installer and portable binary in /release
npm run electron:installer

# One-step build & package:
npm run electron:build
```

The output executables will be available in the `release/` directory:
* **NSIS Setup Installer**: `release/shono.fm Setup.exe`
* **Portable Executable**: `release/shono.fm Portable.exe`

---

## ⚙️ Configuration & Environment

Copy `.env.example` to `.env.local` to customize optional API integrations:

```env
# Optional: YouTube Data API v3 key (improves search and playlist extraction quotas)
VITE_YOUTUBE_API_KEY=your_youtube_api_key_here

# Optional: Discord Client ID for custom Discord Rich Presence
VITE_DISCORD_CLIENT_ID=your_discord_client_id_here
```

---

## 📂 Project Architecture

```
muszix/
├── electron/
│   ├── main.cjs                # Electron main process, window management, Tray, local server
│   ├── discordRpc.cjs          # Discord Rich Presence IPC bridge
│   ├── preload.cjs             # IPC context bridge
│   └── installer.cjs           # Custom NSIS post-install hooks
├── src/
│   ├── components/
│   │   ├── mi6/                # MI6 Vinyl Turntable console & tracklist
│   │   ├── AppleLyrics.tsx     # Apple Music-style dynamic kinetic lyrics view
│   │   ├── FullscreenPlayer.tsx# Fullscreen visualizer & ambient glow player
│   │   ├── MiniDeckWidget.tsx  # Floating retro cassette deck widget
│   │   ├── MasterWaveform.tsx  # Real-time audio spectrum & oscilloscope
│   │   ├── SidebarEqualizer.tsx# 10-band hardware equalizer sliders
│   │   ├── LyricCardModal.tsx  # Social lyric quote card generator
│   │   └── PlaylistImporter.tsx# Playlist URL parser & archive loader
│   ├── services/
│   │   ├── audioEngine.ts      # Web Audio API engine & YouTube stream driver
│   │   ├── lyricsService.ts    # Multi-source LRC parser & synchronizer
│   │   ├── archiveZipService.ts# Standalone ZIP dossier & metadata packaging
│   │   ├── equalizerService.ts # DSP biquad filter nodes & preset bank
│   │   ├── discordRpcService.ts# Electron Discord RPC dispatcher
│   │   └── storage.ts          # LocalStorage & IndexedDB persistent vault
│   ├── context/
│   │   └── PlayerContext.tsx   # Global audio state machine & telemetry store
│   └── App.tsx                 # Core console orchestrator
└── package.json
```

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

<div align="center">
  <sub>Engineered with precision for sound collectors and analog purists.</sub><br>
  <sub><b>SHONO.FM // SYSTEM AUDIO ARCHIVE</b></sub>
</div>
