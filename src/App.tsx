import React, { useEffect, useRef } from 'react';
import { Analytics } from '@vercel/analytics/react';
import gsap from 'gsap';
import { PlayerProvider, usePlayer } from './context/PlayerContext';
import { Sidebar } from './components/Sidebar';
import { PlaylistImporter } from './components/PlaylistImporter';
import { ArchiveHeader } from './components/ArchiveHeader';
import { TrackList } from './components/TrackList';
import { SidePlayer } from './components/SidePlayer';
import { MyArchives } from './components/MyArchives';
import { SearchModule } from './components/SearchModule';
import { PersistentPlayer } from './components/PersistentPlayer';
import { TrackDetailModal } from './components/TrackDetailModal';
import { KeyboardShortcutsModal } from './components/KeyboardShortcutsModal';
import { SettingsModal } from './components/SettingsModal';
import { QueueDrawer } from './components/QueueDrawer';
import { MI6PlayerView } from './components/mi6/MI6PlayerView';
import { SettingsPage } from './components/SettingsPage';
import { CollectionsView } from './components/CollectionsView';
import { GlassyFloatingSearch } from './components/GlassyFloatingSearch';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';

const MainLayout: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { activeArchive, playerMode, activeTab } = usePlayer();

  // Register keyboard shortcuts
  useKeyboardShortcuts();

  // GSAP Page Load Reveal Animation (Respecting reduced motion)
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    if (containerRef.current) {
      gsap.fromTo(
        containerRef.current,
        { opacity: 0, y: 8 },
        { opacity: 1, y: 0, duration: 0.65, ease: 'power2.out' }
      );
    }
  }, []);

  // Subtle archive switch animation
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || !activeArchive) return;

    gsap.fromTo(
      '.archive-content-area',
      { opacity: 0.8 },
      { opacity: 1, duration: 0.25, ease: 'power1.out' }
    );
  }, [activeArchive?.id]);

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
      ) : playerMode === 'MI6' ? (
        <MI6PlayerView />
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
              {/* 04 Archive Header */}
              <ArchiveHeader />

              {/* 05 Track List / Index */}
              <TrackList />
            </div>

            {/* Bottom section of Center Column: My Archives (08) & Search Module (09) */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1.2fr 1fr',
                borderTop: '1px solid var(--border-color)',
              }}
            >
              {/* 08 My Archives */}
              <MyArchives />

              {/* 09 Search Module */}
              <SearchModule />
            </div>
          </section>

          {/* Col 3: Right Player Column (SidePlayer with Apple Music Lyrics, Live Visualizer & Queue) */}
          <aside className="col-player">
            <SidePlayer />
          </aside>
        </main>
      )}

      {/* 11 Persistent Bottom Player */}
      <PersistentPlayer />

      {/* Modals & Overlays */}
      <TrackDetailModal />
      <KeyboardShortcutsModal />
      <SettingsModal />
      <QueueDrawer />
      <GlassyFloatingSearch />
    </div>
  );
};

export function App() {
  return (
    <PlayerProvider>
      <MainLayout />
      <Analytics />
    </PlayerProvider>
  );
}

export default App;
