import { useEffect } from 'react';
import { usePlayer } from '../context/PlayerContext';

export const useKeyboardShortcuts = (searchInputRef?: React.RefObject<HTMLInputElement | null>) => {
  const {
    togglePlayPause,
    playNext,
    playPrev,
    toggleShuffle,
    cycleRepeat,
    toggleMute,
    setIsQueueDrawerOpen,
    setIsShortcutsOpen,
    setIsSettingsOpen,
    openTrackDetail,
    selectedTrackForDetail,
    isShortcutsOpen,
    isSettingsOpen,
    isSearchOpen,
    setIsSearchOpen,
    isChangelogOpen,
    closeChangelog,
    isFullscreenPlayerOpen,
    setIsFullscreenPlayerOpen,
    toggleFullscreenPlayer,
    activeTab,
    setActiveTab,
  } = usePlayer();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Global Cmd/Ctrl+K shortcut
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
        return;
      }

      // Don't trigger when user is typing in an input, textarea or contenteditable element
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        if (e.key === 'Escape') {
          target.blur();
          setIsSearchOpen(false);
        }
        return;
      }

      switch (e.key) {
        case ' ':
          e.preventDefault();
          togglePlayPause();
          break;
        case 'n':
        case 'N':
          e.preventDefault();
          playNext();
          break;
        case 'p':
        case 'P':
          e.preventDefault();
          playPrev();
          break;
        case 's':
        case 'S':
          e.preventDefault();
          toggleShuffle();
          break;
        case 'r':
        case 'R':
          e.preventDefault();
          cycleRepeat();
          break;
        case 'm':
        case 'M':
          e.preventDefault();
          toggleMute();
          break;
        case '/':
          e.preventDefault();
          setIsSearchOpen(true);
          break;
        case 'q':
        case 'Q':
          e.preventDefault();
          setIsQueueDrawerOpen((prev) => !prev);
          break;
        case 'f':
        case 'F':
          e.preventDefault();
          toggleFullscreenPlayer();
          break;
        case '?':
          e.preventDefault();
          setIsShortcutsOpen(!isShortcutsOpen);
          break;
        case 'Escape':
          e.preventDefault();
          if (isFullscreenPlayerOpen) {
            setIsFullscreenPlayerOpen(false);
            break;
          }
          if (isChangelogOpen) {
            closeChangelog(true);
            break;
          }
          if (isSearchOpen) {
            setIsSearchOpen(false);
            break;
          }
          if (isShortcutsOpen) setIsShortcutsOpen(false);
          if (isSettingsOpen) setIsSettingsOpen(false);
          if (selectedTrackForDetail) openTrackDetail(null);
          if (activeTab === 'SETTINGS' || activeTab === 'COLLECTIONS') setActiveTab('ARCHIVE');
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    togglePlayPause,
    playNext,
    playPrev,
    toggleShuffle,
    cycleRepeat,
    toggleMute,
    setIsQueueDrawerOpen,
    setIsShortcutsOpen,
    setIsSettingsOpen,
    isChangelogOpen,
    closeChangelog,
    isFullscreenPlayerOpen,
    setIsFullscreenPlayerOpen,
    toggleFullscreenPlayer,
    openTrackDetail,
    selectedTrackForDetail,
    isShortcutsOpen,
    isSettingsOpen,
    isSearchOpen,
    setIsSearchOpen,
    activeTab,
    setActiveTab,
    searchInputRef,
  ]);
};
