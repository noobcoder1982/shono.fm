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
    activeTab,
    setActiveTab,
  } = usePlayer();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
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
          if (searchInputRef && searchInputRef.current) {
            searchInputRef.current.focus();
            searchInputRef.current.select();
          }
          break;
        case 'q':
        case 'Q':
          e.preventDefault();
          setIsQueueDrawerOpen((prev) => !prev);
          break;
        case '?':
          e.preventDefault();
          setIsShortcutsOpen(!isShortcutsOpen);
          break;
        case 'Escape':
          e.preventDefault();
          if (isShortcutsOpen) setIsShortcutsOpen(false);
          if (isSettingsOpen) setIsSettingsOpen(false);
          if (selectedTrackForDetail) openTrackDetail(null);
          if (activeTab === 'SETTINGS') setActiveTab('ARCHIVE');
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
    openTrackDetail,
    selectedTrackForDetail,
    isShortcutsOpen,
    isSettingsOpen,
    activeTab,
    setActiveTab,
    searchInputRef,
  ]);
};
