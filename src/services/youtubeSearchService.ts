import type { Track } from '../types';
import { storage } from './storage';

export type SearchFilter = 'ALL' | 'COLLECTIONS' | 'TRACKS' | 'CHANNELS';

export interface YoutubeSearchResultCollection {
  type: 'COLLECTION';
  id: string; // playlistId
  title: string;
  channelTitle: string;
  channelId?: string;
  thumbnail: string;
  trackCount?: number;
  publishedAt?: string;
}

export interface YoutubeSearchResultTrack {
  type: 'TRACK';
  id: string; // videoId
  title: string;
  channelTitle: string;
  channelId?: string;
  thumbnail: string;
  duration?: number;
  durationFormatted?: string;
  publishedAt?: string;
  track: Track; // Pre-formed SHONO Track
}

export interface YoutubeSearchResultChannel {
  type: 'CHANNEL';
  id: string; // channelId
  title: string;
  description: string;
  thumbnail: string;
}

export interface UniversalSearchResults {
  collections: YoutubeSearchResultCollection[];
  tracks: YoutubeSearchResultTrack[];
  channels: YoutubeSearchResultChannel[];
  query: string;
}

// Memory cache for recent searches (TTL 5 minutes)
const searchCache = new Map<string, { data: UniversalSearchResults; timestamp: number }>();
const CACHE_TTL_MS = 5 * 60 * 1000;

// Helper to decode HTML entities returned by YouTube API (e.g., &amp;, &#39;, &quot;)
function decodeHtmlEntities(str: string): string {
  if (!str) return '';
  return str
    .replace(/&amp;/g, '&')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(dec));
}

// Parse ISO 8601 duration (e.g., PT3M45S -> { seconds: 225, formatted: '03:45' })
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

// Immediate Detection for YouTube URLs
export function isYouTubeUrl(input: string): boolean {
  if (!input || typeof input !== 'string') return false;
  const clean = input.trim();
  // Standard YouTube domains or shortlinks
  const domainPattern = /^(https?:\/\/)?(www\.|music\.)?(youtube\.com|youtu\.be)\/.+/i;
  // Specific query params or path indicators
  const queryPattern = /[?&](list|v)=[a-zA-Z0-9_-]+/i;
  const shortlinkPattern = /youtu\.be\/[a-zA-Z0-9_-]{11}/i;

  return domainPattern.test(clean) || queryPattern.test(clean) || shortlinkPattern.test(clean);
}

export const youtubeSearchService = {
  isYouTubeUrl,

  async search(
    query: string,
    filter: SearchFilter = 'ALL',
    signal?: AbortSignal
  ): Promise<UniversalSearchResults> {
    const trimmed = query.trim();
    if (!trimmed) {
      return { collections: [], tracks: [], channels: [], query: '' };
    }

    const cacheKey = `${trimmed.toLowerCase()}__${filter}`;
    const cached = searchCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return cached.data;
    }

    const settings = storage.getSettings();
    const apiKey = settings.youtubeApiKey;

    if (!apiKey) {
      throw new Error('API_KEY_MISSING: Configure your YouTube API key in Settings.');
    }

    try {
      let collections: YoutubeSearchResultCollection[] = [];
      let tracks: YoutubeSearchResultTrack[] = [];
      let channels: YoutubeSearchResultChannel[] = [];

      // Determine what endpoints to fetch based on filter
      if (filter === 'COLLECTIONS') {
        // Fetch playlists only
        const plRes = await fetch(
          `https://www.googleapis.com/youtube/v3/search?part=snippet&type=playlist&maxResults=20&q=${encodeURIComponent(trimmed)}&key=${apiKey}`,
          { signal }
        );
        if (!plRes.ok) throw plRes;
        const plData = await plRes.json();
        collections = (plData.items || [])
          .filter((it: any) => it.id?.playlistId || (typeof it.id === 'string' && it.id))
          .map((it: any, idx: number) => ({
            type: 'COLLECTION' as const,
            id: it.id?.playlistId || it.id || `pl_${idx}`,
            title: decodeHtmlEntities(it.snippet?.title || 'Untitled Collection'),
            channelTitle: decodeHtmlEntities(it.snippet?.channelTitle || 'YouTube Creator'),
            channelId: it.snippet?.channelId,
            thumbnail:
              it.snippet?.thumbnails?.high?.url ||
              it.snippet?.thumbnails?.medium?.url ||
              it.snippet?.thumbnails?.default?.url ||
              '',
            publishedAt: it.snippet?.publishedAt,
          }));
      } else if (filter === 'TRACKS') {
        // Fetch videos only
        const vidRes = await fetch(
          `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&videoEmbeddable=true&maxResults=25&q=${encodeURIComponent(trimmed)}&key=${apiKey}`,
          { signal }
        );
        if (!vidRes.ok) throw vidRes;
        const vidData = await vidRes.json();
        tracks = (vidData.items || [])
          .filter((it: any) => it.id?.videoId || (typeof it.id === 'string' && it.id))
          .map((it: any, idx: number) => {
            const videoId = it.id?.videoId || it.id || `vid_${idx}`;
            const title = decodeHtmlEntities(it.snippet?.title || `Track ${idx + 1}`);
            const channelTitle = decodeHtmlEntities(it.snippet?.channelTitle?.replace(/ - Topic$/i, '') || 'YouTube Creator');
            const thumbnail =
              it.snippet?.thumbnails?.high?.url ||
              it.snippet?.thumbnails?.medium?.url ||
              `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

            return {
              type: 'TRACK' as const,
              id: videoId,
              title,
              channelTitle,
              channelId: it.snippet?.channelId,
              thumbnail,
              duration: 215,
              durationFormatted: '03:35',
              publishedAt: it.snippet?.publishedAt,
              track: {
                id: `track_yt_${videoId}_${idx}`,
                youtubeId: videoId,
                index: idx + 1,
                title,
                artist: channelTitle,
                album: 'YouTube Search',
                year: it.snippet?.publishedAt ? new Date(it.snippet.publishedAt).getFullYear() : 2026,
                duration: 215,
                durationFormatted: '03:35',
                thumbnail,
                genre: 'Search Stream',
                source: 'YOUTUBE_API',
              },
            };
          });
      } else if (filter === 'CHANNELS') {
        // Fetch channels only
        const chRes = await fetch(
          `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&maxResults=15&q=${encodeURIComponent(trimmed)}&key=${apiKey}`,
          { signal }
        );
        if (!chRes.ok) throw chRes;
        const chData = await chRes.json();
        channels = (chData.items || [])
          .filter((it: any) => it.id?.channelId || (typeof it.id === 'string' && it.id))
          .map((it: any, idx: number) => ({
            type: 'CHANNEL' as const,
            id: it.id?.channelId || it.id || `ch_${idx}`,
            title: decodeHtmlEntities(it.snippet?.title || 'YouTube Channel'),
            description: decodeHtmlEntities(it.snippet?.description || ''),
            thumbnail:
              it.snippet?.thumbnails?.high?.url ||
              it.snippet?.thumbnails?.medium?.url ||
              it.snippet?.thumbnails?.default?.url ||
              '',
          }));
      } else {
        // ALL: Prioritize Playlists (Collections) + Tracks + Channels
        const [plRes, vidRes, chRes] = await Promise.all([
          fetch(
            `https://www.googleapis.com/youtube/v3/search?part=snippet&type=playlist&maxResults=8&q=${encodeURIComponent(trimmed)}&key=${apiKey}`,
            { signal }
          ),
          fetch(
            `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&videoEmbeddable=true&maxResults=15&q=${encodeURIComponent(trimmed)}&key=${apiKey}`,
            { signal }
          ),
          fetch(
            `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&maxResults=3&q=${encodeURIComponent(trimmed)}&key=${apiKey}`,
            { signal }
          ),
        ]);

        if (plRes.ok) {
          const plData = await plRes.json();
          collections = (plData.items || [])
            .filter((it: any) => it.id?.playlistId || (typeof it.id === 'string' && it.id))
            .map((it: any, idx: number) => ({
              type: 'COLLECTION' as const,
              id: it.id?.playlistId || it.id || `pl_${idx}`,
              title: decodeHtmlEntities(it.snippet?.title || 'Untitled Collection'),
              channelTitle: decodeHtmlEntities(it.snippet?.channelTitle || 'YouTube Creator'),
              channelId: it.snippet?.channelId,
              thumbnail:
                it.snippet?.thumbnails?.high?.url ||
                it.snippet?.thumbnails?.medium?.url ||
                it.snippet?.thumbnails?.default?.url ||
                '',
              publishedAt: it.snippet?.publishedAt,
            }));
        }

        if (vidRes.ok) {
          const vidData = await vidRes.json();
          tracks = (vidData.items || [])
            .filter((it: any) => it.id?.videoId || (typeof it.id === 'string' && it.id))
            .map((it: any, idx: number) => {
              const videoId = it.id?.videoId || it.id || `vid_${idx}`;
              const title = decodeHtmlEntities(it.snippet?.title || `Track ${idx + 1}`);
              const channelTitle = decodeHtmlEntities(it.snippet?.channelTitle?.replace(/ - Topic$/i, '') || 'YouTube Creator');
              const thumbnail =
                it.snippet?.thumbnails?.high?.url ||
                it.snippet?.thumbnails?.medium?.url ||
                `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

              return {
                type: 'TRACK' as const,
                id: videoId,
                title,
                channelTitle,
                channelId: it.snippet?.channelId,
                thumbnail,
                duration: 215,
                durationFormatted: '03:35',
                publishedAt: it.snippet?.publishedAt,
                track: {
                  id: `track_yt_${videoId}_${idx}`,
                  youtubeId: videoId,
                  index: idx + 1,
                  title,
                  artist: channelTitle,
                  album: 'YouTube Search',
                  year: it.snippet?.publishedAt ? new Date(it.snippet.publishedAt).getFullYear() : 2026,
                  duration: 215,
                  durationFormatted: '03:35',
                  thumbnail,
                  genre: 'Search Stream',
                  source: 'YOUTUBE_API',
                },
              };
            });
        }

        if (chRes.ok) {
          const chData = await chRes.json();
          channels = (chData.items || [])
            .filter((it: any) => it.id?.channelId || (typeof it.id === 'string' && it.id))
            .map((it: any, idx: number) => ({
              type: 'CHANNEL' as const,
              id: it.id?.channelId || it.id || `ch_${idx}`,
              title: decodeHtmlEntities(it.snippet?.title || 'YouTube Channel'),
              description: decodeHtmlEntities(it.snippet?.description || ''),
              thumbnail:
                it.snippet?.thumbnails?.high?.url ||
                it.snippet?.thumbnails?.medium?.url ||
                it.snippet?.thumbnails?.default?.url ||
                '',
            }));
        }
      }

      // Batch enrich collections with trackCount
      if (collections.length > 0) {
        try {
          const playlistIds = collections.map((c) => c.id).filter(Boolean).slice(0, 50).join(',');
          if (playlistIds) {
            const detailRes = await fetch(
              `https://www.googleapis.com/youtube/v3/playlists?part=contentDetails&id=${playlistIds}&key=${apiKey}`,
              { signal }
            );
            if (detailRes.ok) {
              const detailData = await detailRes.json();
              const countMap = new Map<string, number>();
              (detailData.items || []).forEach((item: any) => {
                if (item.id && item.contentDetails?.itemCount != null) {
                  countMap.set(item.id, item.contentDetails.itemCount);
                }
              });
              collections = collections.map((c) => ({
                ...c,
                trackCount: countMap.get(c.id),
              }));
            }
          }
        } catch {
          // Non-critical enrichment failure; continue
        }
      }

      // Batch enrich tracks with real video durations
      if (tracks.length > 0) {
        try {
          const videoIds = tracks.map((t) => t.id).filter(Boolean).slice(0, 50).join(',');
          if (videoIds) {
            const detailRes = await fetch(
              `https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${videoIds}&key=${apiKey}`,
              { signal }
            );
            if (detailRes.ok) {
              const detailData = await detailRes.json();
              const durationMap = new Map<string, { seconds: number; formatted: string }>();
              (detailData.items || []).forEach((item: any) => {
                if (item.id && item.contentDetails?.duration) {
                  durationMap.set(item.id, parseIsoDuration(item.contentDetails.duration));
                }
              });

              tracks = tracks.map((t) => {
                const dur = durationMap.get(t.id);
                if (dur) {
                  return {
                    ...t,
                    duration: dur.seconds,
                    durationFormatted: dur.formatted,
                    track: {
                      ...t.track,
                      duration: dur.seconds,
                      durationFormatted: dur.formatted,
                    },
                  };
                }
                return t;
              });
            }
          }
        } catch {
          // Non-critical duration enrichment failure; continue
        }
      }

      const results: UniversalSearchResults = {
        collections,
        tracks,
        channels,
        query: trimmed,
      };

      searchCache.set(cacheKey, { data: results, timestamp: Date.now() });
      return results;
    } catch (err: any) {
      if (err.name === 'AbortError') {
        throw err;
      }
      // Check if YouTube quota error response
      if (err instanceof Response) {
        if (err.status === 403) {
          throw new Error('QUOTA_EXCEEDED: YouTube search limit reached. Try again later or update your API key.');
        }
      }
      throw new Error("Couldn't search YouTube. Try again.");
    }
  },

  // Resolve playlist items into SHONO Track model for immediate session playback / queueing
  async fetchCollectionTracks(
    playlistId: string,
    collectionTitle: string,
    signal?: AbortSignal
  ): Promise<Track[]> {
    const settings = storage.getSettings();
    const apiKey = settings.youtubeApiKey;
    if (!apiKey) {
      throw new Error('API_KEY_MISSING: Configure your YouTube API key in Settings.');
    }

    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&maxResults=50&playlistId=${playlistId}&key=${apiKey}`,
      { signal }
    );

    if (!res.ok) {
      if (res.status === 403) {
        throw new Error('QUOTA_EXCEEDED: YouTube API quota limit reached. Try again later.');
      }
      throw new Error("Couldn't fetch playlist tracks. Verify the playlist is public.");
    }

    const data = await res.json();
    if (!data.items || data.items.length === 0) {
      return [];
    }

    const validItems = data.items.filter(
      (item: any) =>
        item.snippet &&
        item.snippet.resourceId?.videoId &&
        item.snippet.title !== 'Private video' &&
        item.snippet.title !== 'Deleted video'
    );

    const videoIds = validItems.map((it: any) => it.snippet.resourceId.videoId).join(',');
    const durationMap = new Map<string, { seconds: number; formatted: string }>();

    if (videoIds) {
      try {
        const vidRes = await fetch(
          `https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${videoIds}&key=${apiKey}`,
          { signal }
        );
        if (vidRes.ok) {
          const vidData = await vidRes.json();
          (vidData.items || []).forEach((item: any) => {
            if (item.id && item.contentDetails?.duration) {
              durationMap.set(item.id, parseIsoDuration(item.contentDetails.duration));
            }
          });
        }
      } catch {
        // Durations fallback to default
      }
    }

    return validItems.map((item: any, idx: number) => {
      const videoId = item.snippet.resourceId.videoId;
      const dur = durationMap.get(videoId) || { seconds: 215, formatted: '03:35' };
      const title = decodeHtmlEntities(item.snippet.title || `Track ${idx + 1}`);
      const artist = decodeHtmlEntities(
        item.snippet.videoOwnerChannelTitle?.replace(/ - Topic$/i, '') || 'YouTube Creator'
      );

      return {
        id: `track_yt_${videoId}_${idx}_${Date.now()}`,
        youtubeId: videoId,
        index: idx + 1,
        title,
        artist,
        album: decodeHtmlEntities(collectionTitle),
        year: item.snippet.publishedAt ? new Date(item.snippet.publishedAt).getFullYear() : 2026,
        duration: dur.seconds,
        durationFormatted: dur.formatted,
        thumbnail:
          item.snippet.thumbnails?.high?.url ||
          item.snippet.thumbnails?.medium?.url ||
          item.snippet.thumbnails?.default?.url ||
          `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
        genre: 'Session Collection',
        source: 'YOUTUBE_API',
      };
    });
  },
};
