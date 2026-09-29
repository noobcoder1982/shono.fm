import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import type { Archive, Track, PlaybackStatus, RepeatMode, SystemStatusInfo, PlayerMode, TurntableSpeed } from '../types';
import { audioEngine } from '../services/audioEngine';
import { playlistService } from '../services/playlistService';
import { storage, CURRENT_APP_VERSION, type BrutalistTheme } from '../services/storage';
import { dynamicColorService } from '../services/dynamicColorService';
import { getBestArtworkUrl } from '../services/artworkService';
import { discordRpcService } from '../services/discordRpcService';
import { mediaSessionService } from '../services/mediaSessionService';
import {
  youtubeSearchService,
  type UniversalSearchResults,
  type SearchFilter,
  type YoutubeSearchResultCollection,
  isYouTubeUrl
} from '../services/youtubeSearchService';

interface PlayerContextType {
  archives: Archive[];
  activeArchive: Archive | null;
  currentTrack: Track | null;
  playbackStatus: PlaybackStatus;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isShuffle: boolean;
  repeatMode: RepeatMode;
  queue: Track[];
  searchQuery: string;
  isSearchOpen: boolean;
  likedTrackIds: string[];
  selectedTrackForDetail: Track | null;
  isShortcutsOpen: boolean;
  isSettingsOpen: boolean;
  isQueueDrawerOpen: boolean;
  isChangelogOpen: boolean;
  activeTab: string;
  isImporting: boolean;
  importProgressText: string;
  importProgressPercent: number;
  systemStatus: SystemStatusInfo;
  theme: BrutalistTheme;
  genreFilter: string | null;
  showFavouritesOnly: boolean;
  playerMode: PlayerMode;
  isVinylCrackle: boolean;
  turntableSpeed: TurntableSpeed;
  turntablePitch: number;

  // Actions
  setActiveArchive: (archive: Archive) => void;
  playTrack: (track: Track) => void;
  togglePlayPause: () => void;
  playNext: () => void;
  playPrev: () => void;
  seek: (seconds: number) => void;
  setVolume: (vol: number) => void;
  toggleMute: () => void;
  toggleShuffle: () => void;
  cycleRepeat: () => void;
  addToQueue: (track: Track) => void;
  playNextInQueue: (track: Track) => void;
  removeFromQueue: (trackId: string) => void;
  clearQueue: () => void;
  reorderQueue: (newQueue: Track[]) => void;
  playEntireArchive: (archive: Archive, shuffle?: boolean) => void;
  toggleLike: (trackId: string) => void;
  setSearchQuery: (query: string) => void;
  setIsSearchOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
  openTrackDetail: (track: Track | null) => void;
  setIsShortcutsOpen: (open: boolean) => void;
  setIsSettingsOpen: (open: boolean) => void;
  setIsQueueDrawerOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
  sidePlayerTab: 'LYRICS' | 'QUEUE';
  setSidePlayerTab: React.Dispatch<React.SetStateAction<'LYRICS' | 'QUEUE'>>;
  toggleSidePlayerQueue: () => void;
  setIsChangelogOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
  closeChangelog: (markAsSeen?: boolean) => void;
  isFullscreenPlayerOpen: boolean;
  setIsFullscreenPlayerOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
  toggleFullscreenPlayer: () => void;
  isZipModalOpen: boolean;
  archiveToExport: Archive | null;
  openZipModal: (archive?: Archive | null) => void;
  closeZipModal: () => void;
  setActiveTab: (tab: string) => void;
  importPlaylist: (url: string) => Promise<Archive>;
  deleteArchive: (id: string) => void;
  setTheme: (theme: BrutalistTheme) => void;
  setGenreFilter: (genre: string | null) => void;
  setShowFavouritesOnly: (show: boolean | ((prev: boolean) => boolean)) => void;
  setPlayerMode: (mode: PlayerMode) => void;
  toggleVinylCrackle: () => void;
  setTurntableSpeed: (speed: TurntableSpeed) => void;
  setTurntablePitch: (pitch: number) => void;
  isMiniDeck: boolean;
  toggleMiniDeck: () => void;
  isMixtapeModalOpen: boolean;
  setIsMixtapeModalOpen: (open: boolean) => void;

  // Universal Search & Session Actions
  universalSearchQuery: string;
  setUniversalSearchQuery: (query: string) => void;
  universalSearchFilter: SearchFilter;
  setUniversalSearchFilter: (filter: SearchFilter) => void;
  universalSearchResults: UniversalSearchResults | null;
  isUniversalSearching: boolean;
  universalSearchError: string | null;
  isUniversalSearchActive: boolean;
  clearUniversalSearch: () => void;
  performUniversalSearch: (query: string, filter?: SearchFilter) => Promise<void>;
  addTracksToSession: (tracks: Track[], toast?: { title: string; subtitle?: string }) => void;
  addTrackToStandaloneArchive: (track: Track) => Promise<void>;
  addCollectionArchive: (collection: YoutubeSearchResultCollection) => Promise<Archive | null>;
  sessionToast: { title: string; subtitle?: string } | null;
  dismissSessionToast: () => void;
}

const PlayerContext = createContext<PlayerContextType | null>(null);

export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [archives, setArchives] = useState<Archive[]>(() => playlistService.getInitialArchives());
  const [activeArchiveId, setActiveArchiveId] = useState<string>(() => {
    return storage.getActiveArchiveId() || archives[0]?.id || '';
  });

  const activeArchive = archives.find((a) => a.id === activeArchiveId) || archives[0] || null;

  const [currentTrack, setCurrentTrack] = useState<Track | null>(() => {
    return activeArchive?.tracks[0] || null;
  });
  const [playbackStatus, setPlaybackStatus] = useState<PlaybackStatus>('IDLE');
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(257);
  const [volume, setVolumeState] = useState(80);
  const [isMuted, setIsMuted] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('OFF');

  // Queue initialized from storage
  const [queue, setQueue] = useState<Track[]>(() => {
    return storage.getQueue();
  });

  const [likedTrackIds, setLikedTrackIds] = useState<string[]>(() => storage.getLikedTracks());
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Universal YouTube Search & Session State
  const [universalSearchQuery, setUniversalSearchQuery] = useState('');
  const [universalSearchFilter, setUniversalSearchFilter] = useState<SearchFilter>('ALL');
  const [universalSearchResults, setUniversalSearchResults] = useState<UniversalSearchResults | null>(null);
  const [isUniversalSearching, setIsUniversalSearching] = useState(false);
  const [universalSearchError, setUniversalSearchError] = useState<string | null>(null);
  const [sessionToast, setSessionToast] = useState<{ title: string; subtitle?: string } | null>(null);
  const sessionToastTimerRef = useRef<any>(null);
  const searchAbortControllerRef = useRef<AbortController | null>(null);

  const isUniversalSearchActive = Boolean(
    universalSearchQuery.trim().length >= 2 &&
    !isYouTubeUrl(universalSearchQuery)
  );

  const dismissSessionToast = useCallback(() => {
    setSessionToast(null);
    if (sessionToastTimerRef.current) {
      clearTimeout(sessionToastTimerRef.current);
      sessionToastTimerRef.current = null;
    }
  }, []);

  const addTracksToSession = useCallback(
    (newTracks: Track[], toast?: { title: string; subtitle?: string }) => {
      if (!newTracks || newTracks.length === 0) return;
      setQueue((prev) => {
        const updated = [...prev, ...newTracks];
        storage.saveQueue(updated);
        return updated;
      });

      if (toast) {
        if (sessionToastTimerRef.current) clearTimeout(sessionToastTimerRef.current);
        setSessionToast(toast);
        sessionToastTimerRef.current = setTimeout(() => {
          setSessionToast(null);
        }, 4000);
      }
    },
    []
  );

  const addTrackToStandaloneArchive = useCallback(
    async (incomingTrack: Track) => {
      setArchives((prevArchives) => {
        let updated = [...prevArchives];
        let singles = updated.find((a) => a.id === 'archive_singles_001');

        if (singles) {
          const alreadyExists = singles.tracks.some(
            (t) => (t.youtubeId && t.youtubeId === incomingTrack.youtubeId) || t.id === incomingTrack.id
          );
          if (!alreadyExists) {
            const nextTrack: Track = {
              ...incomingTrack,
              index: singles.tracks.length + 1,
            };
            const newTracks = [...singles.tracks, nextTrack];
            const totalSeconds = newTracks.reduce((sum, t) => sum + (t.duration || 0), 0);
            const hrs = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
            const mins = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
            const secs = (totalSeconds % 60).toString().padStart(2, '0');
            const updatedSingles: Archive = {
              ...singles,
              tracks: newTracks,
              totalDurationFormatted: `${hrs}:${mins}:${secs}`,
            };
            updated = updated.map((a) => (a.id === 'archive_singles_001' ? updatedSingles : a));
          }
        } else {
          const nextIndex = (updated.length + 1).toString().padStart(3, '0');
          const firstTrack: Track = { ...incomingTrack, index: 1 };
          const totalSeconds = firstTrack.duration || 215;
          const hrs = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
          const mins = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
          const secs = (totalSeconds % 60).toString().padStart(2, '0');

          const newArchive: Archive = {
            id: 'archive_singles_001',
            indexNumber: nextIndex,
            title: 'SINGLES / STANDALONE',
            curator: 'USER CURATED',
            importedDate: new Date().toISOString().split('T')[0],
            totalDurationFormatted: `${hrs}:${mins}:${secs}`,
            sourceUrl: 'https://shono.fm/standalone',
            coverImage: firstTrack.thumbnail || '/assets/sidebar_arch.jpg',
            tracks: [firstTrack],
          };
          updated = [newArchive, ...updated];
        }

        storage.saveArchives(updated);
        return updated;
      });

      setSessionToast({
        title: '✓ ADDED TO STANDALONE',
        subtitle: `${incomingTrack.title} · SINGLES ARCHIVE`,
      });
      if (sessionToastTimerRef.current) clearTimeout(sessionToastTimerRef.current);
      sessionToastTimerRef.current = setTimeout(() => {
        setSessionToast(null);
      }, 3500);
    },
    []
  );

  const addCollectionArchive = useCallback(
    async (collection: YoutubeSearchResultCollection): Promise<Archive | null> => {
      const tracks = await youtubeSearchService.fetchCollectionTracks(collection.id, collection.title);
      if (!tracks || tracks.length === 0) {
        throw new Error('NO_TRACKS: No valid tracks found in collection');
      }

      let resultArchive: Archive | null = null;
      setArchives((prevArchives) => {
        const existingIdx = prevArchives.findIndex(
          (a) => a.id === `archive_${collection.id}` || (a.sourceUrl && a.sourceUrl.includes(collection.id))
        );

        const totalSeconds = tracks.reduce((sum, t) => sum + (t.duration || 0), 0);
        const hrs = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
        const mins = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
        const secs = (totalSeconds % 60).toString().padStart(2, '0');
        const totalDurationFormatted = `${hrs}:${mins}:${secs}`;
        const nextIndex = (prevArchives.length + 1).toString().padStart(3, '0');

        const newArchive: Archive = {
          id: `archive_${collection.id}`,
          indexNumber: nextIndex,
          title: collection.title.toUpperCase(),
          curator: (collection.channelTitle || 'CURATED SOUND ARCHIVE').toUpperCase(),
          importedDate: new Date().toISOString().split('T')[0],
          totalDurationFormatted,
          sourceUrl: `https://www.youtube.com/playlist?list=${collection.id}`,
          coverImage: collection.thumbnail || tracks[0]?.thumbnail || '/assets/sidebar_arch.jpg',
          tracks,
        };

        let updated: Archive[];
        if (existingIdx >= 0) {
          updated = [...prevArchives];
          updated[existingIdx] = {
            ...updated[existingIdx],
            tracks,
            totalDurationFormatted,
          };
          resultArchive = updated[existingIdx];
        } else {
          updated = [newArchive, ...prevArchives];
          resultArchive = newArchive;
        }

        storage.saveArchives(updated);
        return updated;
      });

      setSessionToast({
        title: '✓ COLLECTION ADDED',
        subtitle: `${collection.title} · ${tracks.length} TRACKS IN VAULT`,
      });
      if (sessionToastTimerRef.current) clearTimeout(sessionToastTimerRef.current);
      sessionToastTimerRef.current = setTimeout(() => {
        setSessionToast(null);
      }, 3500);

      return resultArchive;
    },
    []
  );

  const performUniversalSearch = useCallback(
    async (queryText: string, filter?: SearchFilter) => {
      const activeQuery = queryText.trim();
      const activeFilter = filter || universalSearchFilter;

      if (!activeQuery || isYouTubeUrl(activeQuery)) {
        setIsUniversalSearching(false);
        setUniversalSearchResults(null);
        setUniversalSearchError(null);
        return;
      }

      if (activeQuery.length < 2) {
        return;
      }

      if (searchAbortControllerRef.current) {
        searchAbortControllerRef.current.abort();
      }
      const controller = new AbortController();
      searchAbortControllerRef.current = controller;

      setIsUniversalSearching(true);
      setUniversalSearchError(null);

      try {
        const res = await youtubeSearchService.search(activeQuery, activeFilter, controller.signal);
        setUniversalSearchResults(res);
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.warn('Universal search error:', err);
          setUniversalSearchError(err.message || "Couldn't search YouTube. Try again.");
        }
      } finally {
        setIsUniversalSearching(false);
      }
    },
    [universalSearchFilter]
  );

  const clearUniversalSearch = useCallback(() => {
    if (searchAbortControllerRef.current) {
      searchAbortControllerRef.current.abort();
    }
    setUniversalSearchQuery('');
    setUniversalSearchResults(null);
    setUniversalSearchError(null);
    setIsUniversalSearching(false);
  }, []);
  const [selectedTrackForDetail, setSelectedTrackForDetail] = useState<Track | null>(null);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isQueueDrawerOpen, setIsQueueDrawerOpen] = useState(false);
  const [sidePlayerTab, setSidePlayerTab] = useState<'LYRICS' | 'QUEUE'>('LYRICS');

  const toggleSidePlayerQueue = useCallback(() => {
    setSidePlayerTab((prev) => (prev === 'QUEUE' ? 'LYRICS' : 'QUEUE'));
  }, []);

  const [isChangelogOpen, setIsChangelogOpen] = useState<boolean>(false);
  const [isFullscreenPlayerOpen, setIsFullscreenPlayerOpen] = useState(false);
  const [isZipModalOpen, setIsZipModalOpen] = useState(false);
  const [archiveToExport, setArchiveToExport] = useState<Archive | null>(null);
  const [activeTab, setActiveTab] = useState('ARCHIVE');

  const toggleFullscreenPlayer = useCallback(() => {
    setIsFullscreenPlayerOpen((prev) => !prev);
  }, []);

  const openZipModal = useCallback((archive?: Archive | null) => {
    setArchiveToExport(archive || activeArchive || null);
    setIsZipModalOpen(true);
  }, [activeArchive]);

  const closeZipModal = useCallback(() => {
    setIsZipModalOpen(false);
  }, []);

  const [theme, setThemeState] = useState<BrutalistTheme>(() => storage.getSettings().theme || 'noir');

  useEffect(() => {
    dynamicColorService.init();
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    dynamicColorService.setTheme(theme);
  }, [theme]);

  useEffect(() => {
    if (currentTrack) {
      getBestArtworkUrl(currentTrack).then((url) => {
        dynamicColorService.updateArtwork(url);
      });
    } else {
      dynamicColorService.updateArtwork(null);
    }
  }, [currentTrack?.id, currentTrack?.thumbnail, currentTrack?.title, currentTrack?.artist]);

  const setTheme = useCallback((newTheme: BrutalistTheme) => {
    setThemeState(newTheme);
    storage.saveSettings({ theme: newTheme });
    document.documentElement.setAttribute('data-theme', newTheme);
    dynamicColorService.setTheme(newTheme);
  }, []);

  const [genreFilter, setGenreFilter] = useState<string | null>(null);
  const [showFavouritesOnly, setShowFavouritesOnly] = useState<boolean>(false);

  // 007 / MI6 Mode State
  const [playerMode, setPlayerModeState] = useState<PlayerMode>(() => storage.getPlayerMode());
  const [isVinylCrackle, setIsVinylCrackle] = useState<boolean>(() => storage.getVinylCrackle());
  const [turntableSpeed, setTurntableSpeedState] = useState<TurntableSpeed>(() => storage.getTurntableSpeed());
  const [turntablePitch, setTurntablePitch] = useState<number>(0);

  // Synchronize vinyl crackle setting on mount
  useEffect(() => {
    audioEngine.setVinylCrackle(isVinylCrackle);
  }, []);

  // Synchronize with Electron persistent vault on startup (survives app updates & origin changes)
  useEffect(() => {
    storage.syncFromVault().then((synced) => {
      if (synced && synced.length > 0) {
        setArchives(synced);
        const activeId = storage.getActiveArchiveId() || synced[0].id;
        setActiveArchiveId(activeId);
        const targetArch = synced.find((a) => a.id === activeId) || synced[0];
        if (!currentTrack && targetArch?.tracks?.length > 0) {
          setCurrentTrack(targetArch.tracks[0]);
        }
      }
    });
  }, []);

  const setPlayerMode = useCallback((mode: PlayerMode) => {
    setPlayerModeState(mode);
    storage.savePlayerMode(mode);
  }, []);

  const toggleVinylCrackle = useCallback(() => {
    setIsVinylCrackle((prev) => {
      const next = !prev;
      storage.saveVinylCrackle(next);
      audioEngine.setVinylCrackle(next);
      return next;
    });
  }, []);

  const setTurntableSpeed = useCallback((speed: TurntableSpeed) => {
    setTurntableSpeedState(speed);
    storage.saveTurntableSpeed(speed);
  }, []);

  // Ingestion status
  const [isImporting, setIsImporting] = useState(false);
  const [importProgressText, setImportProgressText] = useState('');
  const [importProgressPercent, setImportProgressPercent] = useState(0);

  // Mini-Deck Floating Always-on-Top Widget State
  const [isMiniDeck, setIsMiniDeck] = useState(false);

  const toggleMiniDeck = useCallback(async () => {
    if (typeof window !== 'undefined' && (window as any).electronAPI?.toggleMiniDeck) {
      try {
        const res = await (window as any).electronAPI.toggleMiniDeck();
        if (res && typeof res.isMiniDeck === 'boolean') {
          setIsMiniDeck(res.isMiniDeck);
          return;
        }
      } catch (err) {
        console.warn('Mini-deck toggle error:', err);
      }
    }
    setIsMiniDeck((prev) => !prev);
  }, []);

  const [isMixtapeModalOpen, setIsMixtapeModalOpen] = useState(false);

  // References for event loops
  const queueRef = useRef(queue);
  queueRef.current = queue;
  const currentTrackRef = useRef(currentTrack);
  currentTrackRef.current = currentTrack;
  const activeArchiveRef = useRef(activeArchive);
  activeArchiveRef.current = activeArchive;
  const repeatModeRef = useRef(repeatMode);
  repeatModeRef.current = repeatMode;
  const isShuffleRef = useRef(isShuffle);
  isShuffleRef.current = isShuffle;

  // Initialize audio engine event callbacks
  useEffect(() => {
    audioEngine.setCallbacks({
      onStatusChange: (status) => {
        setPlaybackStatus(status);
      },
      onTimeUpdate: (cur, dur) => {
        setCurrentTime(cur);
        if (dur > 0) setDuration(dur);
      },
      onTrackEnded: () => {
        handleTrackEnded();
      },
      onError: (err) => {
        console.warn('Playback error caught:', err);
      },
    });
  }, []);

  // Synchronize live playback status with Discord Rich Presence
  useEffect(() => {
    discordRpcService.init();
  }, []);

  useEffect(() => {
    if (currentTrack) {
      discordRpcService.updateActivity(
        currentTrack,
        playbackStatus,
        currentTime,
        duration,
        activeArchive?.title
      );
    } else {
      discordRpcService.clearActivity();
    }
  }, [currentTrack, playbackStatus, Math.floor(currentTime / 5), duration, activeArchive?.title]);

  // Synchronize Windows Media Session (SMTC) & Electron Tray
  useEffect(() => {
    mediaSessionService.init({
      onPlay: () => {
        if (playbackStatus === 'PLAYING') {
          audioEngine.pause();
        } else {
          audioEngine.resume();
        }
      },
      onPause: () => {
        audioEngine.pause();
      },
      onNext: () => {
        handleTrackEnded();
      },
      onPrev: () => {
        if (currentTime > 4) {
          audioEngine.seekTo(0);
        } else if (activeArchiveRef.current && currentTrackRef.current) {
          const list = activeArchiveRef.current.tracks;
          const curIdx = list.findIndex((t) => t.id === currentTrackRef.current?.id);
          if (curIdx > 0) {
            playTrack(list[curIdx - 1]);
          } else {
            audioEngine.seekTo(0);
          }
        }
      },
      onSeek: (secs) => {
        audioEngine.seekTo(secs);
      },
    });
  }, [playbackStatus, currentTime]);

  useEffect(() => {
    mediaSessionService.updateTrack(currentTrack, playbackStatus, currentTime, duration, activeArchive?.title);
  }, [currentTrack, playbackStatus, Math.floor(currentTime), duration, activeArchive?.title]);

  const playTrack = useCallback((track: Track) => {
    setCurrentTrack(track);
    setDuration(track.duration || 240);
    setCurrentTime(0);
    audioEngine.playTrack(track);
  }, []);

  const handleTrackEnded = useCallback(() => {
    if (repeatModeRef.current === 'ONE' && currentTrackRef.current) {
      audioEngine.seekTo(0);
      audioEngine.playTrack(currentTrackRef.current);
      return;
    }

    if (queueRef.current.length > 0) {
      const next = queueRef.current[0];
      const remaining = queueRef.current.slice(1);
      setQueue(remaining);
      storage.saveQueue(remaining);
      playTrack(next);
      return;
    }

    // Check Beta Feature: Infinite Archive (Radio Mode)
    const settings = storage.getSettings();
    if (settings.betaInfiniteArchive && currentTrackRef.current) {
      const cur = currentTrackRef.current;
      const allVaultTracks = archives.flatMap((a) => a.tracks).filter((t) => t.id !== cur.id);
      let candidates = allVaultTracks.filter(
        (t) => (cur.genre && t.genre === cur.genre) || t.artist === cur.artist
      );
      if (candidates.length < 5) {
        candidates = allVaultTracks;
      }
      const shuffled = [...candidates].sort(() => 0.5 - Math.random()).slice(0, 5);
      if (shuffled.length > 0) {
        const next = shuffled[0];
        const rest = shuffled.slice(1);
        setQueue(rest);
        storage.saveQueue(rest);
        playTrack(next);
        return;
      }
    }

    // Otherwise advance within active archive or its true parent archive
    if (currentTrackRef.current) {
      let list: Track[] = [];
      let curIdx = -1;

      if (activeArchiveRef.current) {
        list = activeArchiveRef.current.tracks;
        curIdx = list.findIndex((t) => t.id === currentTrackRef.current?.id);
      }

      // If not in active archive, see if it's in ANY archive
      if (curIdx === -1) {
        const parentArchive = archives.find(a => a.tracks.some(t => t.id === currentTrackRef.current?.id));
        if (parentArchive) {
          list = parentArchive.tracks;
          curIdx = list.findIndex(t => t.id === currentTrackRef.current?.id);
        }
      }

      if (curIdx !== -1 && curIdx < list.length - 1) {
        playTrack(list[curIdx + 1]);
      } else if (curIdx !== -1 && repeatModeRef.current === 'ALL' && list.length > 0) {
        playTrack(list[0]);
      } else {
        setPlaybackStatus('IDLE');
      }
    } else {
      setPlaybackStatus('IDLE');
    }
  }, [playTrack, archives]);

  const togglePlayPause = useCallback(() => {
    if (playbackStatus === 'PLAYING') {
      audioEngine.pause();
    } else if (playbackStatus === 'PAUSED') {
      audioEngine.resume();
    } else if (currentTrack) {
      playTrack(currentTrack);
    } else if (activeArchive && activeArchive.tracks.length > 0) {
      playTrack(activeArchive.tracks[0]);
    }
  }, [playbackStatus, currentTrack, activeArchive, playTrack]);

  const playNext = useCallback(() => {
    if (queue.length > 0) {
      const next = queue[0];
      const rest = queue.slice(1);
      setQueue(rest);
      storage.saveQueue(rest);
      playTrack(next);
      return;
    }

    // Check Beta Feature: Infinite Archive (Radio Mode)
    const settings = storage.getSettings();
    if (settings.betaInfiniteArchive && currentTrack) {
      const allVaultTracks = archives.flatMap((a) => a.tracks).filter((t) => t.id !== currentTrack.id);
      let candidates = allVaultTracks.filter(
        (t) => (currentTrack.genre && t.genre === currentTrack.genre) || t.artist === currentTrack.artist
      );
      if (candidates.length < 5) {
        candidates = allVaultTracks;
      }
      const shuffled = [...candidates].sort(() => 0.5 - Math.random()).slice(0, 5);
      if (shuffled.length > 0) {
        const next = shuffled[0];
        const rest = shuffled.slice(1);
        setQueue(rest);
        storage.saveQueue(rest);
        playTrack(next);
        return;
      }
    }

    if (currentTrack) {
      let list: Track[] = [];
      let curIdx = -1;

      if (activeArchive) {
        list = activeArchive.tracks;
        curIdx = list.findIndex((t) => t.id === currentTrack.id);
      }

      if (curIdx === -1) {
        const parentArchive = archives.find(a => a.tracks.some(t => t.id === currentTrack.id));
        if (parentArchive) {
          list = parentArchive.tracks;
          curIdx = list.findIndex(t => t.id === currentTrack.id);
        }
      }

      if (isShuffle && list.length > 0) {
        const remaining = list.filter((t) => t.id !== currentTrack.id);
        if (remaining.length > 0) {
          const rand = remaining[Math.floor(Math.random() * remaining.length)];
          playTrack(rand);
          return;
        }
      }

      if (curIdx !== -1 && curIdx < list.length - 1) {
        playTrack(list[curIdx + 1]);
      } else if (curIdx !== -1 && list.length > 0) {
        playTrack(list[0]);
      }
    }
  }, [queue, activeArchive, currentTrack, isShuffle, playTrack, archives]);

  const playPrev = useCallback(() => {
    if (currentTime > 3) {
      seek(0);
      return;
    }
    if (currentTrack) {
      let list: Track[] = [];
      let curIdx = -1;

      if (activeArchive) {
        list = activeArchive.tracks;
        curIdx = list.findIndex((t) => t.id === currentTrack.id);
      }

      if (curIdx === -1) {
        const parentArchive = archives.find(a => a.tracks.some(t => t.id === currentTrack.id));
        if (parentArchive) {
          list = parentArchive.tracks;
          curIdx = list.findIndex(t => t.id === currentTrack.id);
        }
      }

      if (curIdx > 0) {
        playTrack(list[curIdx - 1]);
      } else if (curIdx !== -1 && list.length > 0) {
        playTrack(list[list.length - 1]);
      }
    }
  }, [currentTime, activeArchive, currentTrack, playTrack, archives]);

  const seek = useCallback((seconds: number) => {
    setCurrentTime(seconds);
    audioEngine.seekTo(seconds);
  }, []);

  const setVolume = useCallback((vol: number) => {
    setVolumeState(vol);
    audioEngine.setVolume(vol);
    if (vol > 0 && isMuted) {
      setIsMuted(false);
      audioEngine.setMuted(false);
    }
  }, [isMuted]);

  const toggleMute = useCallback(() => {
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    audioEngine.setMuted(nextMute);
  }, [isMuted]);

  const toggleShuffle = useCallback(() => {
    setIsShuffle((prev) => !prev);
  }, []);

  const cycleRepeat = useCallback(() => {
    setRepeatMode((prev) => {
      if (prev === 'OFF') return 'ALL';
      if (prev === 'ALL') return 'ONE';
      return 'OFF';
    });
  }, []);

  const addToQueue = useCallback((track: Track) => {
    setQueue((prev) => {
      const updated = [...prev, track];
      storage.saveQueue(updated);
      return updated;
    });
  }, []);

  const playNextInQueue = useCallback((track: Track) => {
    setQueue((prev) => {
      const updated = [track, ...prev.filter((t) => t.id !== track.id)];
      storage.saveQueue(updated);
      return updated;
    });
  }, []);

  const removeFromQueue = useCallback((trackId: string) => {
    setQueue((prev) => {
      const updated = prev.filter((t) => t.id !== trackId);
      storage.saveQueue(updated);
      return updated;
    });
  }, []);

  const clearQueue = useCallback(() => {
    setQueue([]);
    storage.saveQueue([]);
  }, []);

  const reorderQueue = useCallback((newQueue: Track[]) => {
    setQueue(newQueue);
    storage.saveQueue(newQueue);
  }, []);

  const playEntireArchive = useCallback(
    (archive: Archive, shuffle = false) => {
      setActiveArchiveId(archive.id);
      storage.setActiveArchiveId(archive.id);

      if (archive.tracks.length === 0) return;

      let ordered = [...archive.tracks];
      if (shuffle) {
        ordered.sort(() => Math.random() - 0.5);
      }

      const first = ordered[0];
      const rest = ordered.slice(1);
      setQueue(rest);
      storage.saveQueue(rest);
      playTrack(first);
    },
    [playTrack]
  );

  const toggleLike = useCallback((trackId: string) => {
    storage.toggleLikedTrack(trackId);
    setLikedTrackIds(storage.getLikedTracks());
  }, []);

  const setActiveArchive = useCallback((archive: Archive) => {
    setActiveArchiveId(archive.id);
    storage.setActiveArchiveId(archive.id);
  }, []);

  const deleteArchive = useCallback(
    (id: string) => {
      setArchives((prev) => {
        const filtered = prev.filter((a) => a.id !== id);
        storage.saveArchives(filtered);
        if (activeArchiveId === id && filtered.length > 0) {
          setActiveArchiveId(filtered[0].id);
          storage.setActiveArchiveId(filtered[0].id);
        }
        return filtered;
      });
    },
    [activeArchiveId]
  );

  const importPlaylist = useCallback(
    async (url: string): Promise<Archive> => {
      setIsImporting(true);
      setImportProgressPercent(5);
      setImportProgressText('INGESTION INITIALIZED');

      try {
        const newArchive = await playlistService.importFromUrl(url, (stepText, pct) => {
          setImportProgressText(stepText);
          setImportProgressPercent(pct);
        });

        const updatedArchives = playlistService.getInitialArchives();
        setArchives(updatedArchives);
        setActiveArchiveId(newArchive.id);
        storage.setActiveArchiveId(newArchive.id);

        const currentStatus = audioEngine.getStatus();
        
        // If nothing is playing, play the newly imported track
        if (currentStatus === 'IDLE' && newArchive.tracks.length > 0) {
          playTrack(newArchive.tracks[0]);
        } 
        // If something IS playing, and we imported a single song (e.g. appended to SINGLES archive),
        // add that single song to the queue instead of stopping playback.
        else if (currentStatus !== 'IDLE' && newArchive.tracks.length > 0) {
          // Check if this was a single track import (our new logic adds it to end of SINGLES)
          // We can just add the last track of this archive to the queue.
          // Wait, if it's a new playlist of 50 songs, we don't want to queue all 50 automatically.
          // But if it's the 'archive_singles_001', we can queue the latest track.
          if (newArchive.id === 'archive_singles_001') {
            addToQueue(newArchive.tracks[newArchive.tracks.length - 1]);
          }
        }
        
        return newArchive;
      } finally {
        setTimeout(() => {
          setIsImporting(false);
          setImportProgressPercent(0);
          setImportProgressText('');
        }, 600);
      }
    },
    [playTrack]
  );

  // System Status calculated data
  const systemStatus: SystemStatusInfo = {
    source: audioEngine.getSource(),
    connection: 'ACTIVE',
    playback: playbackStatus,
    archiveId: activeArchive?.indexNumber || '---',
    itemCount: activeArchive?.tracks.length || 0,
    statusText: playbackStatus === 'PLAYING' ? 'STREAMING' : playbackStatus === 'BUFFERING' ? 'BUFFERING' : 'READY',
  };

  const closeChangelog = useCallback((markAsSeen = true) => {
    setIsChangelogOpen(false);
    if (markAsSeen) {
      storage.saveLastSeenChangelogVersion(CURRENT_APP_VERSION);
    }
  }, []);

  return (
    <PlayerContext.Provider
      value={{
        archives,
        activeArchive,
        currentTrack,
        playbackStatus,
        currentTime,
        duration,
        volume,
        isMuted,
        isShuffle,
        repeatMode,
        queue,
        searchQuery,
        isSearchOpen,
        likedTrackIds,
        selectedTrackForDetail,
        isShortcutsOpen,
        isSettingsOpen,
        isQueueDrawerOpen,
        activeTab,
        isImporting,
        importProgressText,
        importProgressPercent,
        systemStatus,
        theme,
        genreFilter,
        showFavouritesOnly,
        playerMode,
        isVinylCrackle,
        turntableSpeed,
        turntablePitch,

        setActiveArchive,
        playTrack,
        togglePlayPause,
        playNext,
        playPrev,
        seek,
        setVolume,
        toggleMute,
        toggleShuffle,
        cycleRepeat,
        addToQueue,
        playNextInQueue,
        removeFromQueue,
        clearQueue,
        reorderQueue,
        playEntireArchive,
        toggleLike,
        setSearchQuery,
        setIsSearchOpen,
        openTrackDetail: setSelectedTrackForDetail,
        setIsShortcutsOpen,
        setIsSettingsOpen,
        setIsQueueDrawerOpen,
        sidePlayerTab,
        setSidePlayerTab,
        toggleSidePlayerQueue,
        isChangelogOpen,
        setIsChangelogOpen,
        closeChangelog,
        isFullscreenPlayerOpen,
        setIsFullscreenPlayerOpen,
        toggleFullscreenPlayer,
        isZipModalOpen,
        archiveToExport,
        openZipModal,
        closeZipModal,
        setActiveTab,
        importPlaylist,
        deleteArchive,
        setTheme,
        setGenreFilter,
        setShowFavouritesOnly,
        setPlayerMode,
        toggleVinylCrackle,
        setTurntableSpeed,
        setTurntablePitch,
        isMiniDeck,
        toggleMiniDeck,
        isMixtapeModalOpen,
        setIsMixtapeModalOpen,

        // Universal Search & Session Actions
        universalSearchQuery,
        setUniversalSearchQuery,
        universalSearchFilter,
        setUniversalSearchFilter,
        universalSearchResults,
        isUniversalSearching,
        universalSearchError,
        isUniversalSearchActive,
        clearUniversalSearch,
        performUniversalSearch,
        addTracksToSession,
        addTrackToStandaloneArchive,
        addCollectionArchive,
        sessionToast,
        dismissSessionToast,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
};
