import JSZip from 'jszip';
import type { Archive } from '../types';
import { getBestArtworkUrl } from './artworkService';
import { fetchLyrics, type LyricLine } from './lyricsService';

export interface ZipProgress {
  step: 'INIT' | 'COVERS' | 'LYRICS' | 'METADATA' | 'SCRIPTS' | 'COMPRESSING' | 'DONE' | 'ERROR';
  current: number;
  total: number;
  percent: number;
  message: string;
  bytesFormatted?: string;
}

export interface ZipOptions {
  includeCovers: boolean;
  includeLyrics: boolean;
  includeM3U8: boolean;
  includeJsonDossier: boolean;
  includeDownloaderScripts: boolean;
}

export const DEFAULT_ZIP_OPTIONS: ZipOptions = {
  includeCovers: true,
  includeLyrics: true,
  includeM3U8: true,
  includeJsonDossier: true,
  includeDownloaderScripts: true,
};

/**
 * Sanitizes filenames to be safe across Windows, macOS, and Linux filesystems.
 */
function sanitizeFilename(name: string): string {
  return name
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, '_')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 80);
}

/**
 * Converts seconds into standard [mm:ss.xx] timestamp for LRC files.
 */
function formatLrcTimestamp(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const hundredths = Math.floor((seconds % 1) * 100);
  return `[${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${hundredths.toString().padStart(2, '0')}]`;
}

/**
 * Converts LyricLine array into standard LRC format.
 */
function convertToLrcString(lines: LyricLine[], title: string, artist: string): string {
  const header = [
    `[ti:${title}]`,
    `[ar:${artist}]`,
    `[re:SHONO.FM Precision Music Vault]`,
    `[ve:1.9.0]`,
    '',
  ].join('\n');

  const lrcLines = lines.map((l) => `${formatLrcTimestamp(l.time)} ${l.text}`);
  return `${header}${lrcLines.join('\n')}\n`;
}

/**
 * Fetches an image URL and returns a Uint8Array / Blob, with canvas fallback if CORS allows.
 */
async function fetchImageBinary(url: string): Promise<Uint8Array | null> {
  if (!url) return null;

  try {
    const res = await fetch(url, { mode: 'cors' });
    if (res.ok) {
      const buffer = await res.arrayBuffer();
      return new Uint8Array(buffer);
    }
  } catch {
    // Direct fetch failed (likely CORS on remote CDN)
  }

  // Fallback: Attempt HTMLImageElement + Canvas extraction
  return new Promise<Uint8Array | null>((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || 600;
        canvas.height = img.naturalHeight || 600;
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve(null);
        ctx.drawImage(img, 0, 0);
        canvas.toBlob((blob) => {
          if (blob) {
            blob.arrayBuffer().then((buf) => resolve(new Uint8Array(buf))).catch(() => resolve(null));
          } else {
            resolve(null);
          }
        }, 'image/jpeg', 0.92);
      } catch {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = url;
  });
}

/**
 * Formats bytes into human-readable string.
 */
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}

/**
 * Generates and downloads a complete ZIP archive for a playlist.
 */
export async function exportArchiveToZip(
  archive: Archive,
  options: ZipOptions = DEFAULT_ZIP_OPTIONS,
  onProgress?: (p: ZipProgress) => void
): Promise<Blob> {
  const zip = new JSZip();
  const safeArchiveTitle = sanitizeFilename(archive.title || 'Playlist');
  const rootFolder = zip.folder(safeArchiveTitle) || zip;
  const tracks = archive.tracks || [];
  const totalTracks = tracks.length;

  onProgress?.({
    step: 'INIT',
    current: 0,
    total: totalTracks,
    percent: 5,
    message: `Initializing archive package for ${archive.title}...`,
  });

  // 1. High-Resolution Artwork Packaging
  if (options.includeCovers) {
    const coversFolder = rootFolder.folder('covers');
    for (let i = 0; i < totalTracks; i++) {
      const track = tracks[i];
      const indexStr = (i + 1).toString().padStart(2, '0');
      const safeTitle = sanitizeFilename(`${indexStr} - ${track.artist} - ${track.title}`);

      onProgress?.({
        step: 'COVERS',
        current: i + 1,
        total: totalTracks,
        percent: Math.round(5 + ((i + 1) / totalTracks) * 35),
        message: `Resolving 1000x1000 studio cover [${i + 1}/${totalTracks}]: ${track.title}...`,
      });

      try {
        const artUrl = await getBestArtworkUrl(track);
        const imgData = await fetchImageBinary(artUrl);
        if (imgData && coversFolder) {
          coversFolder.file(`${safeTitle}.jpg`, imgData);
          if (i === 0) {
            // Also store master playlist sleeve
            rootFolder.file('cover.jpg', imgData);
          }
        }
      } catch (err) {
        console.warn(`Could not bundle cover for track ${track.title}:`, err);
      }
    }
  }

  // 2. Synced LRC Lyrics Packaging
  if (options.includeLyrics) {
    const lyricsFolder = rootFolder.folder('lyrics');
    for (let i = 0; i < totalTracks; i++) {
      const track = tracks[i];
      const indexStr = (i + 1).toString().padStart(2, '0');
      const safeTitle = sanitizeFilename(`${indexStr} - ${track.artist} - ${track.title}`);

      onProgress?.({
        step: 'LYRICS',
        current: i + 1,
        total: totalTracks,
        percent: Math.round(40 + ((i + 1) / totalTracks) * 30),
        message: `Fetching synced karaoke lyrics [${i + 1}/${totalTracks}]: ${track.title}...`,
      });

      try {
        const lyrics = await fetchLyrics(track.artist, track.title, track.duration);
        if (lyrics && lyrics.lines && lyrics.lines.length > 0 && lyricsFolder) {
          const lrcContent = convertToLrcString(lyrics.lines, track.title, track.artist);
          lyricsFolder.file(`${safeTitle}.lrc`, lrcContent);
        }
      } catch (err) {
        console.warn(`Could not bundle lyrics for track ${track.title}:`, err);
      }
    }
  }

  // 3. Metadata Dossier & Universal Playlists
  onProgress?.({
    step: 'METADATA',
    current: totalTracks,
    total: totalTracks,
    percent: 75,
    message: 'Compiling structured playlist.json and playlist.m3u8...',
  });

  if (options.includeJsonDossier) {
    const metadataDossier = {
      archiveId: archive.id,
      title: archive.title,
      indexNumber: archive.indexNumber,
      sourceUrl: archive.sourceUrl || '',
      exportedAt: new Date().toISOString(),
      generator: 'SHONO.FM Precision Music Vault v1.9.0',
      trackCount: totalTracks,
      tracks: tracks.map((t, idx) => ({
        index: idx + 1,
        id: t.id,
        title: t.title,
        artist: t.artist,
        album: t.album,
        year: t.year,
        duration: t.duration,
        genre: t.genre,
        youtubeId: t.youtubeId,
        youtubeUrl: `https://www.youtube.com/watch?v=${t.youtubeId}`,
        thumbnail: t.thumbnail,
      })),
    };
    rootFolder.file('playlist.json', JSON.stringify(metadataDossier, null, 2));
  }

  if (options.includeM3U8) {
    const m3u8Lines = ['#EXTM3U', `#PLAYLIST:${archive.title}`];
    tracks.forEach((t) => {
      const dur = Math.round(t.duration || 0);
      m3u8Lines.push(`#EXTINF:${dur},${t.artist} - ${t.title}`);
      m3u8Lines.push(`https://www.youtube.com/watch?v=${t.youtubeId}`);
    });
    rootFolder.file('playlist.m3u8', m3u8Lines.join('\n') + '\n');
  }

  // 4. Offline 1-Click Audio Downloader Scripts (yt-dlp)
  if (options.includeDownloaderScripts) {
    onProgress?.({
      step: 'SCRIPTS',
      current: totalTracks,
      total: totalTracks,
      percent: 82,
      message: 'Generating 1-click batch and shell audio downloaders...',
    });

    const ytUrls = tracks.map((t) => `https://www.youtube.com/watch?v=${t.youtubeId}`);

    // Windows Batch Script
    const batScript = [
      '@echo off',
      'title SHONO.FM // Audio Ingestion Agent',
      'echo ========================================================',
      'echo SHONO.FM // AUDIO INGESTION AGENT (WINDOWS)',
      `echo Archive: ${archive.title} (${totalTracks} Tracks)`,
      'echo ========================================================',
      'echo.',
      'where yt-dlp >nul 2>nul',
      'if %errorlevel% neq 0 (',
      '    echo [WARNING] yt-dlp was not found in your system PATH.',
      '    echo To download all audio tracks at high-speed, install yt-dlp:',
      '    echo    winget install yt-dlp    or    https://github.com/yt-dlp/yt-dlp',
      '    echo.',
      '    pause',
      '    exit /b',
      ')',
      'echo [INFO] yt-dlp detected. Beginning high-fidelity audio extraction...',
      'if not exist "audio" mkdir "audio"',
      `yt-dlp -x --audio-format mp3 --audio-quality 0 --embed-thumbnail --add-metadata -o "audio/%%(playlist_index)s - %%(artist)s - %%(title)s.%%(ext)s" ${ytUrls.join(' ')}`,
      'echo.',
      'echo [SUCCESS] Ingestion completed. All audio stored in the "audio" folder.',
      'pause',
    ].join('\r\n');

    // Mac / Linux Bash Script
    const shScript = [
      '#!/usr/bin/env bash',
      'set -e',
      'echo "========================================================"',
      'echo "SHONO.FM // AUDIO INGESTION AGENT (UNIX)"',
      `echo "Archive: ${archive.title} (${totalTracks} Tracks)"`,
      'echo "========================================================"',
      'echo ""',
      'if ! command -v yt-dlp &> /dev/null; then',
      '    echo "[WARNING] yt-dlp was not found in your PATH."',
      '    echo "To download all audio tracks at high-speed, install yt-dlp:"',
      '    echo "   brew install yt-dlp (macOS) or sudo apt install yt-dlp (Linux)"',
      '    echo ""',
      '    exit 1',
      'fi',
      'echo "[INFO] yt-dlp detected. Beginning high-fidelity audio extraction..."',
      'mkdir -p "audio"',
      `yt-dlp -x --audio-format mp3 --audio-quality 0 --embed-thumbnail --add-metadata -o "audio/%(playlist_index)s - %(artist)s - %(title)s.%(ext)s" ${ytUrls.map(u => `"${u}"`).join(' ')}`,
      'echo ""',
      'echo "[SUCCESS] Ingestion completed. All audio stored in the audio/ folder."',
    ].join('\n');

    rootFolder.file('download_audio_windows.bat', batScript);
    rootFolder.file('download_audio_mac_linux.sh', shScript);

    // Readme & Dossier
    const readmeContent = [
      '================================================================================',
      `SHONO.FM // PLAYLIST DOSSIER ARCHIVE`,
      `Title: ${archive.title}`,
      `Total Tracks: ${totalTracks}`,
      `Exported: ${new Date().toUTCString()}`,
      `Engine: SHONO.FM Brutalist Music Vault v1.9.0`,
      '================================================================================',
      '',
      'ARCHIVE CONTENTS:',
      '  • covers/                       Lossless 1000x1000 studio square album covers',
      '  • lyrics/                       Synced time-stamped karaoke lyrics (.lrc)',
      '  • playlist.m3u8                 Universal playlist file for VLC, AIMP, Apple Music',
      '  • playlist.json                 Full structured JSON metadata dossier with IDs & URLs',
      '  • download_audio_windows.bat    1-Click script to download all MP3s via yt-dlp (Windows)',
      '  • download_audio_mac_linux.sh   1-Click script to download all MP3s via yt-dlp (Mac/Linux)',
      '',
      'HOW TO DOWNLOAD AUDIO FILES (OPTIONAL):',
      '  1. Double-click "download_audio_windows.bat" (on Windows) or run "./download_audio_mac_linux.sh" (on Mac/Linux).',
      '  2. The script will automatically fetch studio-grade MP3s for all tracks in this archive directly into an "audio/" directory.',
      '',
      'TRACKLIST:',
      ...tracks.map((t, idx) => {
        const mins = Math.floor((t.duration || 0) / 60);
        const secs = Math.floor((t.duration || 0) % 60);
        const timeStr = `${mins}:${secs.toString().padStart(2, '0')}`;
        return `  [${(idx + 1).toString().padStart(2, '0')}] ${t.artist} — ${t.title} (${timeStr}) [ID: ${t.youtubeId}]`;
      }),
      '',
      '================================================================================',
      'Generated by SHONO.FM • Precision Audio Vault Architecture',
    ].join('\n');

    rootFolder.file('README_ARCHIVE.txt', readmeContent);
  }

  // 5. ZIP Compression & Final Output
  onProgress?.({
    step: 'COMPRESSING',
    current: totalTracks,
    total: totalTracks,
    percent: 88,
    message: 'Compressing archive using Deflate algorithm...',
  });

  const zipBlob = await zip.generateAsync(
    {
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 },
    },
    (metadata) => {
      const pct = Math.round(88 + (metadata.percent / 100) * 11);
      onProgress?.({
        step: 'COMPRESSING',
        current: totalTracks,
        total: totalTracks,
        percent: pct,
        message: `Compressing files (${Math.round(metadata.percent)}%)...`,
      });
    }
  );

  onProgress?.({
    step: 'DONE',
    current: totalTracks,
    total: totalTracks,
    percent: 100,
    message: 'Archive generated successfully!',
    bytesFormatted: formatBytes(zipBlob.size),
  });

  return zipBlob;
}

/**
 * Triggers a browser download for a Blob.
 */
export function triggerBlobDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 1000);
}
