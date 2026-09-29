import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Analytics } from '@vercel/analytics/react';
import gsap from 'gsap';
import { PlayerProvider, usePlayer } from './context/PlayerContext';
import { Sidebar } from './components/Sidebar';
import { PlaylistImporter } from './components/PlaylistImporter';
import { ArchiveHeader } from './components/ArchiveHeader';
import { TrackList } from './components/TrackList';
import { SidePlayer } from './components/SidePlayer';
import { MyArchives } from './components/MyArchives';
import { PersistentPlayer } from './components/PersistentPlayer';
import { TrackDetailModal } from './components/TrackDetailModal';
import { KeyboardShortcutsModal } from './components/KeyboardShortcutsModal';
import { SettingsModal } from './components/SettingsModal';
import { SettingsPage } from './components/SettingsPage';
import { CollectionsView } from './components/CollectionsView';
import { GlassyFloatingSearch } from './components/GlassyFloatingSearch';
import { ChangelogModal } from './components/ChangelogModal';
import { FullscreenPlayer } from './components/FullscreenPlayer';
import { PlaylistDownloadModal } from './components/PlaylistDownloadModal';
import { TutorialOverlay } from './components/TutorialOverlay';
import { MiniDeckWidget } from './components/MiniDeckWidget';
import { MixtapeModal } from './components/MixtapeModal';
import { ShonoLoader } from './components/ShonoLoader';
import { ShonoLoaderPrototypeModal } from './components/ShonoLoaderPrototypeModal';
import { UniversalSearchResultsView } from './components/UniversalSearchResultsView';
import { CustomCursor } from './components/CustomCursor';
import { storage } from './services/storage';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { Check, X } from 'lucide-react';

const MainLayout: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const {
    activeArchive,
    activeTab,
    isMiniDeck,
    toggleMiniDeck,
    isMixtapeModalOpen,
    setIsMixtapeModalOpen,
    isUniversalSearchActive,
    sessionToast,
    dismissSessionToast,
  } = usePlayer();
  const [isPrototypeOpen, setIsPrototypeOpen] = useState(false);

  useEffect(() => {
    const applyRoundedCorners = () => {
      const isRounded = Boolean(storage.getSettings().roundedCorners);
      if (isRounded) {
        document.documentElement.classList.add('rounded-ui');
      } else {
        document.documentElement.classList.remove('rounded-ui');
      }
    };
    applyRoundedCorners();
    window.addEventListener('shono:settings-updated', applyRoundedCorners);
    window.addEventListener('storage', applyRoundedCorners);
    return () => {
      window.removeEventListener('shono:settings-updated', applyRoundedCorners);
      window.removeEventListener('storage', applyRoundedCorners);
    };
  }, []);

  // Register keyboard shortcuts (Unconditional hook call)
  useKeyboardShortcuts();

  // Choreographed Interior Entrance: Left sidebar slides left-to-right, right components blur-wave downwards
  const playAppEntranceAnimation = useCallback(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || isMiniDeck) return;

    const tl = gsap.timeline();

    // 1. Left sidebar snaps in
    tl.fromTo(
      '.col-sidebar',
      { x: -50, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.6, ease: 'back.out(1.2)', clearProps: 'transform,opacity' }
    );

    // 2. Animate Sidebar text items for premium feel
    const sidebarText = document.querySelectorAll('.col-sidebar .brand-title, .col-sidebar .nav-item, .col-sidebar .stat-box');
    if (sidebarText.length > 0) {
      tl.fromTo(
        sidebarText,
        { x: -15, opacity: 0, filter: 'blur(10px)' },
        { x: 0, opacity: 1, filter: 'blur(0px)', duration: 0.5, stagger: 0.05, ease: 'power2.out', clearProps: 'all' },
        '-=0.4'
      );
    }

    // 3. Right UI containers appear quickly (prevent harsh pop)
    const uiContainers = document.querySelectorAll('.col-main, .col-player, .settings-page-container, .collections-vault-view');
    if (uiContainers.length > 0) {
      tl.fromTo(
        uiContainers,
        { opacity: 0 },
        { opacity: 1, duration: 0.3, ease: 'power2.out', clearProps: 'opacity' },
        '-=0.5'
      );
    }

    // 4. Blur reveal applied to text elements line by line
    const textSelectors = [
      '.playlist-importer-container h2',
      '.playlist-importer-container p',
      '.playlist-importer-container .bma-btn',
      '.archive-header h2',
      '.archive-header div',
      '.track-table th',
      '.track-row td',
      '.my-archives-wrap h3',
      '.archive-card',
      '.col-player h2',
      '.col-player p',
      '.col-player .square-artwork-container',
      '.settings-page-container h2',
      '.settings-page-container .setting-row',
      '.collections-vault-view h1',
      '.collections-vault-view .collection-card'
    ];

    const textElements = document.querySelectorAll(textSelectors.join(', '));
    const elementsArray = Array.from(textElements).slice(0, 100); // Increased cap to allow more track rows to animate

    if (elementsArray.length > 0) {
      tl.fromTo(
        elementsArray,
        { y: 15, opacity: 0, filter: 'blur(12px)' },
        {
          y: 0,
          opacity: 1,
          filter: 'blur(0px)',
          duration: 0.6,
          stagger: 0.035, // Fast line-by-line stagger
          ease: 'power3.out',
          clearProps: 'all',
        },
        '-=0.5' // Overlap
      );
    }
  }, [isMiniDeck]);

  useEffect(() => {
    const handleReveal = () => {
      requestAnimationFrame(() => {
        playAppEntranceAnimation();
      });
    };

    window.addEventListener('shono:reveal-app', handleReveal);
    return () => window.removeEventListener('shono:reveal-app', handleReveal);
  }, [playAppEntranceAnimation]);

  // Subtle archive switch animation
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || !activeArchive || isMiniDeck) return;

    gsap.fromTo(
      '.archive-content-area',
      { opacity: 0.8 },
      { opacity: 1, duration: 0.25, ease: 'power1.out' }
    );
  }, [activeArchive?.id, isMiniDeck]);

  // If Mini Deck Mode is active, render the compact floating cassette widget (After all hooks)
  if (isMiniDeck) {
    return <MiniDeckWidget onRestore={toggleMiniDeck} />;
  }

  return (
    <div ref={containerRef} className="app-container">
      {activeTab === 'SETTINGS' ? (
        /* Full-Screen Settings Page with Left Sidebar */
        <main className="settings-layout-grid">
          <Sidebar />
          <SettingsPage />
        </main>
      ) : activeTab === 'COLLECTIONS' ? (
        /* 03 / COLLECTIONS Dedicated Repository Vault View */
        <main className="archive-layout-grid">
          <Sidebar />
          <CollectionsView />
          <aside className="col-player">
            <SidePlayer />
          </aside>
        </main>
      ) : (
        /* 3-Column Brutalist Layout Grid */
        <main className="archive-layout-grid">
          {/* Col 1: Left Sidebar (01 Brand, 02 Nav, Photo Quote) */}
          <Sidebar />

          {/* Col 2: Center Main Panel (03 Importer, 04 Archive Header, 05 Track Index, 08 My Archives, 09 Search) */}
          <section className="col-main">
            {/* 03 Playlist Importer */}
            <PlaylistImporter />

            <div className="archive-content-area" style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflow: 'hidden' }}>
              {isUniversalSearchActive ? (
                <UniversalSearchResultsView />
              ) : (
                <>
                  {/* 04 Archive Header */}
                  <ArchiveHeader />

                  {/* 05 Track List / Index */}
                  <TrackList />
                </>
              )}
            </div>

            {/* 08 My Archives Vault Drawer (Full-Width & Collapsible) */}
            <MyArchives />
          </section>

          {/* Col 3: Right Player Column (SidePlayer with Apple Music Lyrics, Live Visualizer & Queue) */}
          <aside className="col-player">
            <SidePlayer />
          </aside>
        </main>
      )}

      {/* 11 Persistent Bottom Player */}
      <PersistentPlayer />

      {/* Fullscreen Now Playing Mode with Live Lyrics */}
      <FullscreenPlayer />

      {/* Session Toast Notification Pill */}
      {sessionToast && (
        <div
          style={{
            position: 'fixed',
            bottom: '84px',
            right: '24px',
            zIndex: 9999,
            background: 'rgba(10, 10, 14, 0.96)',
            border: '1px solid var(--accent-color)',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.7), 0 0 15px rgba(255, 30, 0, 0.25)',
            padding: '12px 18px',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            animation: 'modalCardFadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              background: 'rgba(34, 197, 94, 0.15)',
              border: '1px solid var(--status-active)',
              color: 'var(--status-active)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Check size={16} />
          </div>
          <div>
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                fontWeight: 800,
                color: 'var(--text-primary)',
                letterSpacing: '0.06em',
              }}
            >
              {sessionToast.title}
            </div>
            {sessionToast.subtitle && (
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '10px',
                  color: 'var(--text-secondary)',
                  marginTop: '2px',
                  letterSpacing: '0.03em',
                }}
              >
                {sessionToast.subtitle}
              </div>
            )}
          </div>
          <button
            onClick={dismissSessionToast}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '4px',
              marginLeft: '8px',
            }}
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Modals & Overlays */}
      <TrackDetailModal />
      <KeyboardShortcutsModal />
      <SettingsModal />
      <GlassyFloatingSearch />
      <ChangelogModal />
      <PlaylistDownloadModal />
      <TutorialOverlay />
      <MixtapeModal isOpen={isMixtapeModalOpen} onClose={() => setIsMixtapeModalOpen(false)} />
      <ShonoLoaderPrototypeModal isOpen={isPrototypeOpen} onClose={() => setIsPrototypeOpen(false)} />
      <CustomCursor />
    </div>
  );
};

export function App() {
  const [isAppLoading, setIsAppLoading] = useState(true);
  const [isExiting, setIsExiting] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(15);
  const [loadingStatus, setLoadingStatus] = useState('INITIALIZING AUDIO VAULT');

  const triggerStartupSequence = useCallback(() => {
    setIsAppLoading(true);
    setIsExiting(false);
    setLoadingProgress(0);
    setLoadingStatus('INITIALIZING AUDIO VAULT');

    const startTime = performance.now();
    const duration = 3800; // 3.8s smoother, slower continuous progression
    let animFrameId: number;

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const rawRatio = Math.min(1, elapsed / duration);
      // Easing curve: smooth fast start with gentle deceleration to 100%
      const easedRatio = 1 - Math.pow(1 - rawRatio, 2.4);
      const currentPct = Math.round(easedRatio * 100);

      setLoadingProgress(currentPct);

      if (currentPct < 28) {
        setLoadingStatus('INITIALIZING AUDIO VAULT');
      } else if (currentPct < 62) {
        setLoadingStatus('MOUNTING STEREO ENGINE');
      } else if (currentPct < 96) {
        setLoadingStatus('RESTORING SOUND ARCHIVES');
      } else {
        setLoadingStatus('READY');
      }

      if (rawRatio < 1) {
        animFrameId = requestAnimationFrame(tick);
      } else {
        // Reached 100%!
        // The click sound is triggered automatically by ShonoLoader when progress hits 100.
        // After 140ms for the click to land, the loader flies upwards!
        setTimeout(() => {
          setIsExiting(true);
          window.dispatchEvent(new CustomEvent('shono:reveal-app'));
        }, 140);
      }
    };

    animFrameId = requestAnimationFrame(tick);

    return () => {
      if (animFrameId) cancelAnimationFrame(animFrameId);
    };
  }, []);

  useEffect(() => {
    const cleanup = triggerStartupSequence();

    const handleReplay = () => {
      triggerStartupSequence();
    };

    window.addEventListener('shono:replay-loader', handleReplay);
    return () => {
      cleanup?.();
      window.removeEventListener('shono:replay-loader', handleReplay);
    };
  }, [triggerStartupSequence]);

  return (
    <PlayerProvider>
      {isAppLoading && (
        <ShonoLoader
          variant="fullscreen"
          progress={loadingProgress}
          subtitle={loadingStatus}
          isExiting={isExiting}
          duration={3.8}
          onExited={() => setIsAppLoading(false)}
        />
      )}
      <MainLayout />
      <Analytics />
    </PlayerProvider>
  );
}

export default App;
