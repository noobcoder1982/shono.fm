import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import type { Archive, Track, PlaybackStatus, RepeatMode, SystemStatusInfo, PlayerMode, TurntableSpeed } from '../types';
import { audioEngine } from '../services/audioEngine';
import { playlistService } from '../services/playlistService';
import { storage, type BrutalistTheme } from '../services/storage';

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
  const [selectedTrackForDetail, setSelectedTrackForDetail] = useState<Track | null>(null);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isQueueDrawerOpen, setIsQueueDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('ARCHIVE');

  const [theme, setThemeState] = useState<BrutalistTheme>(() => storage.getSettings().theme || 'noir');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const setTheme = useCallback((newTheme: BrutalistTheme) => {
    setThemeState(newTheme);
    storage.saveSettings({ theme: newTheme });
    document.documentElement.setAttribute('data-theme', newTheme);
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

    // Otherwise advance within active archive
    if (activeArchiveRef.current && currentTrackRef.current) {
      const list = activeArchiveRef.current.tracks;
      const curIdx = list.findIndex((t) => t.id === currentTrackRef.current?.id);
      if (curIdx !== -1 && curIdx < list.length - 1) {
        playTrack(list[curIdx + 1]);
      } else if (repeatModeRef.current === 'ALL' && list.length > 0) {
        playTrack(list[0]);
      } else {
        setPlaybackStatus('IDLE');
      }
    }
  }, [playTrack]);

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

    if (activeArchive && currentTrack) {
      const tracks = activeArchive.tracks;
      if (isShuffle) {
        const remaining = tracks.filter((t) => t.id !== currentTrack.id);
        if (remaining.length > 0) {
          const rand = remaining[Math.floor(Math.random() * remaining.length)];
          playTrack(rand);
          return;
        }
      }
      const idx = tracks.findIndex((t) => t.id === currentTrack.id);
      if (idx !== -1 && idx < tracks.length - 1) {
        playTrack(tracks[idx + 1]);
      } else if (tracks.length > 0) {
        playTrack(tracks[0]);
      }
    }
  }, [queue, activeArchive, currentTrack, isShuffle, playTrack]);

  const playPrev = useCallback(() => {
    if (currentTime > 3) {
      seek(0);
      return;
    }
    if (activeArchive && currentTrack) {
      const tracks = activeArchive.tracks;
      const idx = tracks.findIndex((t) => t.id === currentTrack.id);
      if (idx > 0) {
        playTrack(tracks[idx - 1]);
      } else if (tracks.length > 0) {
        playTrack(tracks[tracks.length - 1]);
      }
    }
  }, [currentTime, activeArchive, currentTrack, playTrack]);

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

        if (newArchive.tracks.length > 0) {
          playTrack(newArchive.tracks[0]);
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
