import type { Archive, Track } from '../types';
import { storage } from './storage';

// Production configuration: No pre-given demo playlists. Users upload their own playlists.
export const INITIAL_ARCHIVES: Archive[] = [];

function parseIsoDuration(durationStr?: string): { seconds: number; formatted: string } {
  if (!durationStr) return { seconds: 215, formatted: '03:35' };
  const match = durationStr.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return { seconds: 215, formatted: '03:35' };
  const hours = parseInt(match[1] || '0', 10);
  const minutes = parseInt(match[2] || '0', 10);
  const seconds = parseInt(match[3] || '0', 10);
  const total = hours * 3600 + minutes * 60 + seconds;
  const formatted =
    hours > 0
      ? `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      : `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  return { seconds: total || 215, formatted };
}

export const playlistService = {
  getInitialArchives(): Archive[] {
    const saved = storage.getArchives();
    if (saved && saved.length > 0) return saved;
    return [];
  },

  parsePlaylistUrl(url: string): { type: 'PLAYLIST' | 'VIDEO' | 'INVALID'; id: string } {
    if (!url || typeof url !== 'string') return { type: 'INVALID', id: '' };
    const cleanUrl = url.trim();

    // YouTube playlist ID regex: list=([a-zA-Z0-9_-]+)
    const playlistMatch = cleanUrl.match(/[?&]list=([a-zA-Z0-9_-]+)/i);
    if (playlistMatch && playlistMatch[1]) {
      return { type: 'PLAYLIST', id: playlistMatch[1] };
    }

    // YouTube Video ID regex: v=([a-zA-Z0-9_-]+) or youtu.be/([a-zA-Z0-9_-]+)
    const videoMatch = cleanUrl.match(/(?:youtu\.be\/|watch\?v=|\/embed\/)([a-zA-Z0-9_-]{11})/i);
    if (videoMatch && videoMatch[1]) {
      return { type: 'VIDEO', id: videoMatch[1] };
    }

    return { type: 'INVALID', id: '' };
  },

  async importFromUrl(
    url: string,
    onProgress: (stepText: string, percentage: number) => void
  ): Promise<Archive> {
    const parsed = this.parsePlaylistUrl(url);
    if (parsed.type === 'INVALID') {
      throw new Error('INVALID_URL: Could not parse a valid YouTube playlist or video ID.');
    }

    onProgress('CONNECTING TO SOURCE STREAM', 15);
    await new Promise((r) => setTimeout(r, 350));

    onProgress('READING PLAYLIST METADATA & MANIFEST', 35);
    await new Promise((r) => setTimeout(r, 450));

    const settings = storage.getSettings();
    let importedTracks: Track[] = [];
    let archiveTitle = 'IMPORTED ARCHIVE';

    if (settings.youtubeApiKey && parsed.type === 'PLAYLIST') {
      // 1. Attempt to fetch Playlist Title & Metadata
      try {
        const plRes = await fetch(
          `https://www.googleapis.com/youtube/v3/playlists?part=snippet&id=${parsed.id}&key=${settings.youtubeApiKey}`
        );
        if (plRes.ok) {
          const plData = await plRes.json();
          if (plData.items && plData.items[0]?.snippet?.title) {
            archiveTitle = plData.items[0].snippet.title.toUpperCase();
          }
        }
      } catch (e) {
        console.warn('Failed to fetch playlist title', e);
      }

      // 2. Fetch Playlist Items
      try {
        onProgress('CONTACTING YOUTUBE DATA API V3', 55);
        const res = await fetch(
          `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&maxResults=50&playlistId=${parsed.id}&key=${settings.youtubeApiKey}`
        );
        if (res.ok) {
          const data = await res.json();
          if (data.items && data.items.length > 0) {
            importedTracks = data.items
              .filter(
                (item: any) =>
                  item.snippet &&
                  item.snippet.resourceId?.videoId &&
                  item.snippet.title !== 'Private video' &&
                  item.snippet.title !== 'Deleted video'
              )
              .map((item: any, idx: number) => {
                const videoId = item.snippet.resourceId.videoId;
                return {
                  id: `track_yt_${videoId}_${idx}`,
                  youtubeId: videoId,
                  index: idx + 1,
                  title: item.snippet.title || `Track ${idx + 1}`,
                  artist: item.snippet.videoOwnerChannelTitle?.replace(/ - Topic$/i, '') || 'YouTube Creator',
                  album: archiveTitle,
                  year: item.snippet.publishedAt ? new Date(item.snippet.publishedAt).getFullYear() : 2026,
                  duration: 215,
                  durationFormatted: '03:35',
                  thumbnail:
                    item.snippet.thumbnails?.high?.url ||
                    item.snippet.thumbnails?.medium?.url ||
                    item.snippet.thumbnails?.default?.url ||
                    `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
                  genre: 'Stream Audio',
                  source: 'YOUTUBE_API',
                };
              });
          }
        }
      } catch (e) {
        console.warn('YouTube API playlist items fetch failed', e);
      }
    } else if (settings.youtubeApiKey && parsed.type === 'VIDEO') {
      // Direct Single Video Link Ingestion
      try {
        onProgress('FETCHING VIDEO STREAM METADATA', 55);
        const vidRes = await fetch(
          `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${parsed.id}&key=${settings.youtubeApiKey}`
        );
        if (vidRes.ok) {
          const vidData = await vidRes.json();
          if (vidData.items && vidData.items.length > 0) {
            const item = vidData.items[0];
            const { seconds, formatted } = parseIsoDuration(item.contentDetails?.duration);
            const title = item.snippet?.title || `Track ${parsed.id}`;
            importedTracks = [
              {
                id: `track_custom_${parsed.id}`,
                youtubeId: parsed.id,
                index: 1,
                title,
                artist: item.snippet?.channelTitle?.replace(/ - Topic$/i, '') || 'YouTube Artist',
                album: 'Single Ingestion',
                year: item.snippet?.publishedAt ? new Date(item.snippet.publishedAt).getFullYear() : 2026,
                duration: seconds,
                durationFormatted: formatted,
                thumbnail:
                  item.snippet?.thumbnails?.high?.url ||
                  item.snippet?.thumbnails?.medium?.url ||
                  `https://img.youtube.com/vi/${parsed.id}/hqdefault.jpg`,
                genre: 'Digital Stream',
                source: 'YOUTUBE_API',
              },
            ];
            archiveTitle = title.toUpperCase();
          }
        }
      } catch (e) {
        console.warn('Failed to fetch single video details', e);
      }
    }

    // Direct fallback if YouTube API returned 0 items but it is a valid single video ID
    if (importedTracks.length === 0 && parsed.type === 'VIDEO') {
      const idPrefix = parsed.id.slice(0, 6).toUpperCase();
      archiveTitle = `BROADCAST / ${idPrefix}`;
      importedTracks = [
        {
          id: `track_custom_${parsed.id}`,
          youtubeId: parsed.id,
          index: 1,
          title: `Direct Stream: ${idPrefix}`,
          artist: 'Direct Feed Ingestion',
          album: 'Custom Archive',
          year: 2026,
          duration: 245,
          durationFormatted: '04:05',
          thumbnail: `https://img.youtube.com/vi/${parsed.id}/hqdefault.jpg`,
          genre: 'Digital Stream',
          source: 'YOUTUBE_DIRECT',
        },
      ];
    }

    // If still 0 tracks for playlist, throw clean user error
    if (importedTracks.length === 0) {
      throw new Error(
        'NO TRACKS FOUND: Could not retrieve tracks. Verify that the YouTube playlist exists and is set to Public or Unlisted.'
      );
    }

    onProgress('BUILDING SHONO ARCHIVE INDEX', 85);
    await new Promise((r) => setTimeout(r, 350));

    const totalSeconds = importedTracks.reduce((acc, t) => acc + t.duration, 0);
    const hrs = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
    const mins = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
    const secs = (totalSeconds % 60).toString().padStart(2, '0');
    const totalDurationFormatted = `${hrs}:${mins}:${secs}`;

    const currentArchives = storage.getArchives() || [];
    const nextIndex = (currentArchives.length + 1).toString().padStart(3, '0');

    const newArchive: Archive = {
      id: `archive_${Date.now()}`,
      indexNumber: nextIndex,
      title: archiveTitle,
      curator: 'USER CURATED ARCHIVE',
      importedDate: new Date().toISOString().split('T')[0],
      totalDurationFormatted,
      sourceUrl: url,
      coverImage: importedTracks[0]?.thumbnail || '/assets/sidebar_arch.jpg',
      tracks: importedTracks,
    };

    onProgress('READY', 100);
    await new Promise((r) => setTimeout(r, 200));

    const updated = [newArchive, ...currentArchives];
    storage.saveArchives(updated);
    storage.setActiveArchiveId(newArchive.id);

    return newArchive;
  },
};
