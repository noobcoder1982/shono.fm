import React, { useState, useEffect, useRef, useMemo } from 'react';
import { usePlayer } from '../context/PlayerContext';
import { fetchLyrics, saveCustomLyrics, type ParsedLyrics } from '../services/lyricsService';
import { Loader2, Music2, Sparkles, Search, RefreshCw, X, Check } from 'lucide-react';

const AppleLogoIcon: React.FC<{ size?: number; className?: string }> = ({ size = 15, className }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    style={{ display: 'block', flexShrink: 0 }}
  >
    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.86c.64-.78 1.08-1.86.96-2.95-1 .04-2.15.67-2.81 1.45-.58.66-1.1 1.76-.96 2.83 1.12.09 2.17-.55 2.81-1.33z" />
  </svg>
);

interface AppleLyricsProps {
  onSeek?: (time: number) => void;
  compact?: boolean;
}

interface TimedWord {
  text: string;
  startTime: number;
  endTime: number;
  duration: number;
  isHeld: boolean;
  intensity: number;
}

function computeWordTimings(lineText: string, lineStart: number, lineEnd: number): TimedWord[] {
  const rawWords = lineText.trim().split(/\s+/);
  if (rawWords.length === 0) return [];

  const rawGap = Math.max(0.6, lineEnd - lineStart);
  
  // Natural musical phrasing duration:
  // For standard phrases (gap <= 5.5s), words span almost the entire gap with a natural 0.2s breath.
  // For long gaps (> 5.5s, e.g. instrumental bridge), estimate realistic vocal duration without cutting off lyrics early.
  const duration = rawGap <= 5.5
    ? Math.max(0.6, rawGap - 0.2)
    : Math.min(rawGap - 0.5, Math.max(3.2, rawWords.length * 0.75 + 1.0));

  // Word weights based on phonetic length, punctuation, and subtle musical cadence
  const weights = rawWords.map((w, idx) => {
    const clean = w.replace(/[^a-zA-Z0-9]/g, '');
    let weight = Math.max(2, clean.length);
    if (w.includes('...') || w.includes('~')) weight *= 1.35;
    // Slight musical cadence weight for the phrase ending note
    if (idx === rawWords.length - 1 && rawWords.length > 1) weight *= 1.15;
    return weight;
  });
  const totalWeight = weights.reduce((a, b) => a + b, 0);

  let accumulated = 0;
  const avgDuration = duration / rawWords.length;

  return rawWords.map((w, idx) => {
    const startFrac = accumulated / totalWeight;
    const endFrac = (accumulated + weights[idx]) / totalWeight;
    accumulated += weights[idx];

    const wordDuration = (endFrac - startFrac) * duration;
    // Pressure metrics:
    const ratio = wordDuration / Math.max(0.2, avgDuration);
    // A word is held with pressure if duration >= 0.52s, ratio >= 1.22, or has sustained punctuation
    const isHeld = wordDuration >= 0.52 || ratio >= 1.22 || w.includes('...') || w.includes('~');
    // Intensity from 0.2 to 1.0 based on sustained duration
    const intensity = isHeld
      ? Math.min(1, Math.max(0.2, (wordDuration - 0.4) / 0.8))
      : 0;

    return {
      text: w,
      startTime: lineStart + startFrac * duration,
      endTime: lineStart + endFrac * duration,
      duration: wordDuration,
      isHeld,
      intensity,
    };
  });
}

function useSmoothTime(reportedTime: number, isPlaying: boolean): number {
  const [smoothTime, setSmoothTime] = useState(reportedTime);
  const currentTimeRef = useRef(reportedTime);
  const isPlayingRef = useRef(isPlaying);
  const rafRef = useRef<number | null>(null);
  const lastRafTimeRef = useRef<number>(performance.now());

  isPlayingRef.current = isPlaying;

  // Real-time phase-locked tracking when audio clock updates (every 100ms from audioEngine)
  useEffect(() => {
    if (!isPlaying) {
      currentTimeRef.current = reportedTime;
      setSmoothTime(reportedTime);
      return;
    }

    const diff = reportedTime - currentTimeRef.current;
    const absDiff = Math.abs(diff);

    // If seek or jump occurred (> 0.45s), snap immediately
    if (absDiff > 0.45) {
      currentTimeRef.current = reportedTime;
      setSmoothTime(reportedTime);
    } else if (absDiff > 0.03) {
      // Proportional correction to eliminate any clock drift smoothly without jumping
      currentTimeRef.current += diff * 0.45;
      setSmoothTime(currentTimeRef.current);
    }
  }, [reportedTime, isPlaying]);

  useEffect(() => {
    if (!isPlaying) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      return;
    }

    lastRafTimeRef.current = performance.now();

    const loop = (now: number) => {
      if (!isPlayingRef.current) return;
      const delta = Math.min(0.08, Math.max(0, (now - lastRafTimeRef.current) / 1000));
      lastRafTimeRef.current = now;

      // Monotonically advance time forward
      currentTimeRef.current += delta;
      setSmoothTime(currentTimeRef.current);

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isPlaying]);

  return isPlaying ? smoothTime : reportedTime;
}

const ActiveLyricLine: React.FC<{
  line: { time: number; endTime?: number; text: string };
  effectiveTime: number;
  karaokeMode: boolean;
}> = ({ line, effectiveTime, karaokeMode }) => {
  const lineEnd = line.endTime || line.time + 3.5;
  const words = useMemo(() => {
    return computeWordTimings(line.text, line.time, lineEnd);
  }, [line.text, line.time, lineEnd]);

  // Keep track of maximum progress so words NEVER flash or revert to grey
  const progressMapRef = useRef<number[]>([]);

  // If user seeked backwards before this line, reset word memory
  if (effectiveTime < line.time - 0.8) {
    progressMapRef.current = [];
  }

  if (!karaokeMode) {
    return <span className="apple-lyric-text active">{line.text}</span>;
  }

  return (
    <span className="apple-lyric-text active">
      {words.map((w, idx) => {
        let currentWordPct = 0;
        let isSinging = false;
        let breath = 0;

        if (effectiveTime >= w.endTime) {
          currentWordPct = 100;
        } else if (effectiveTime >= w.startTime) {
          isSinging = true;
          const dur = Math.max(0.06, w.duration);
          const p = Math.min(1, Math.max(0, (effectiveTime - w.startTime) / dur));
          currentWordPct = Math.min(100, Math.max(0, Math.round(p * 100)));
          // Sine breathing swell curve: peaks at middle of note, settles smoothly as note ends
          breath = Math.sin(p * Math.PI);
        }

        // Monotonic lock: progress only increases, words stay 100% white once finished!
        const prevPct = progressMapRef.current[idx] || 0;
        const sweepPct = Math.max(prevPct, currentWordPct);
        progressMapRef.current[idx] = sweepPct;

        // Dynamic Growth & Glow for words with more time and pressure
        let scale = 1;
        let dropGlow: string | undefined = undefined;

        if (isSinging && sweepPct < 100) {
          if (w.isHeld) {
            // Significant vocal pressure: grows 8% to 16% and casts radiant white bloom
            scale = 1 + breath * (0.08 + 0.08 * w.intensity);
            const b1 = (5 + 10 * breath * w.intensity).toFixed(1);
            const b2 = (14 + 18 * breath * w.intensity).toFixed(1);
            const a1 = (0.5 + 0.45 * breath * w.intensity).toFixed(2);
            const a2 = (0.22 + 0.35 * breath * w.intensity).toFixed(2);
            dropGlow = `drop-shadow(0 0 ${b1}px rgba(255, 255, 255, ${a1})) drop-shadow(0 0 ${b2}px rgba(255, 255, 255, ${a2}))`;
          } else {
            // Passing words have a subtle lift
            scale = 1 + breath * 0.025;
            dropGlow = `drop-shadow(0 0 6px rgba(255, 255, 255, ${(0.4 * breath).toFixed(2)}))`;
          }
        }

        const wordStyle: React.CSSProperties = {
          '--word-sweep': `${sweepPct}%`,
          transform: scale !== 1 ? `scale(${scale.toFixed(3)})` : undefined,
          filter: dropGlow,
          position: 'relative',
          zIndex: isSinging && w.isHeld ? 3 : 1,
        } as React.CSSProperties;

        return (
          <React.Fragment key={idx}>
            <span className="apple-word" style={wordStyle}>
              {w.text}
            </span>
            {idx < words.length - 1 ? ' ' : ''}
          </React.Fragment>
        );
      })}
    </span>
  );
};

export const AppleLyrics: React.FC<AppleLyricsProps> = ({ onSeek, compact: _compact = false }) => {
  const { currentTrack, currentTime, duration, seek, playbackStatus } = usePlayer();
  const isPlaying = playbackStatus === 'PLAYING';
  const smoothTime = useSmoothTime(currentTime, isPlaying);

  // Per-track fine-tuned lyrics sync offset (persisted in localStorage)
  const [syncOffset, setSyncOffset] = useState<number>(0);

  useEffect(() => {
    if (!currentTrack) {
      setSyncOffset(0);
      return;
    }
    const saved = localStorage.getItem(`muszix_lyrics_offset_${currentTrack.id}`);
    setSyncOffset(saved ? parseFloat(saved) : 0);
  }, [currentTrack?.id]);

  // Effective time adds offset and a subtle 150ms anticipation window matching Apple Music
  const effectiveTime = smoothTime + syncOffset;

  const [lyricsData, setLyricsData] = useState<ParsedLyrics | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [karaokeMode] = useState<boolean>(true);
  const [appleLyricsMode, setAppleLyricsMode] = useState<boolean>(true);
  const [userScrolled, setUserScrolled] = useState<boolean>(false);

  // Manual search / paste modal state
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [pastedLrc, setPastedLrc] = useState<string>('');
  const [searchTab, setSearchTab] = useState<'SEARCH' | 'PASTE'>('SEARCH');
  const [searchLoading, setSearchLoading] = useState<boolean>(false);
  const [statusMsg, setStatusMsg] = useState<string>('');

  const containerRef = useRef<HTMLDivElement>(null);
  const activeLineRef = useRef<HTMLDivElement>(null);
  const userScrollTimeoutRef = useRef<number | null>(null);

  // Load lyrics for the active track
  const loadLyrics = (artist: string, title: string) => {
    setLoading(true);
    setStatusMsg('');

    fetchLyrics(artist, title, duration)
      .then((data) => {
        setLyricsData(data);
        setLoading(false);
        setUserScrolled(false);
      })
      .catch((err) => {
        console.warn('Lyrics fetch failed:', err);
        setLyricsData(null);
        setLoading(false);
      });
  };

  useEffect(() => {
    if (!currentTrack) {
      setLyricsData(null);
      return;
    }
    loadLyrics(currentTrack.artist, currentTrack.title);
  }, [currentTrack?.id, currentTrack?.title, currentTrack?.artist]);

  // Find currently active lyric line based on playback time with 150ms anticipation lead
  const currentLineIndex = useMemo(() => {
    if (!lyricsData || lyricsData.lines.length === 0) return -1;
    const lines = lyricsData.lines;

    let idx = -1;
    for (let i = 0; i < lines.length; i++) {
      if (effectiveTime >= lines[i].time - 0.15) {
        idx = i;
      } else {
        break;
      }
    }
    // If playback is before the first timestamp, stage the first line
    if (idx === -1 && lines.length > 0) {
      return 0;
    }
    return idx;
  }, [lyricsData, effectiveTime]);

  // Smooth auto-scroll keeping active line centered
  useEffect(() => {
    if (userScrolled || !activeLineRef.current || !containerRef.current) return;

    activeLineRef.current.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    });
  }, [currentLineIndex, userScrolled]);

  // Handle user manual scroll: pause auto-scroll for 3.5s then resume
  const handleUserScroll = () => {
    setUserScrolled(true);
    if (userScrollTimeoutRef.current) {
      window.clearTimeout(userScrollTimeoutRef.current);
    }
    userScrollTimeoutRef.current = window.setTimeout(() => {
      setUserScrolled(false);
    }, 3500);
  };

  const handleLineClick = (time: number) => {
    const targetAudioTime = Math.max(0, time - syncOffset);
    if (onSeek) {
      onSeek(targetAudioTime);
    } else {
      seek(targetAudioTime);
    }
    setUserScrolled(false);
  };

  // Perform manual search on LRCLIB
  const handleManualSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim() || !currentTrack) return;

    setSearchLoading(true);
    setStatusMsg('Searching online archives...');
    try {
      const data = await fetchLyrics('', searchQuery.trim(), duration);
      if (data && data.lines.length > 0) {
        setLyricsData(data);
        setIsSearchOpen(false);
        setStatusMsg('');
      } else {
        setStatusMsg('No matching lyrics found. Try another title or paste LRC.');
      }
    } catch {
      setStatusMsg('Network search failed. Please try again.');
    } finally {
      setSearchLoading(false);
    }
  };

  // Save pasted LRC text
  const handleSavePastedLrc = () => {
    if (!pastedLrc.trim() || !currentTrack) return;
    try {
      const parsed = saveCustomLyrics(currentTrack.artist, currentTrack.title, pastedLrc);
      if (parsed.lines.length > 0) {
        setLyricsData(parsed);
        setIsSearchOpen(false);
        setPastedLrc('');
        setStatusMsg('');
      } else {
        setStatusMsg('Could not parse any timestamped lines [mm:ss.xx].');
      }
    } catch {
      setStatusMsg('Invalid LRC format.');
    }
  };

  if (!currentTrack) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          color: 'var(--text-muted)',
          fontFamily: 'var(--font-mono)',
          fontSize: '10px',
          gap: '8px',
          padding: '24px',
          textAlign: 'center',
        }}
      >
        <Music2 size={24} opacity={0.4} />
        <span>NO AUDIO STREAM LOADED</span>
      </div>
    );
  }

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          color: 'var(--text-muted)',
          fontFamily: 'var(--font-mono)',
          fontSize: '10px',
          gap: '12px',
          padding: '24px',
          textAlign: 'center',
        }}
      >
        <Loader2 size={22} className="animate-spin" color="var(--accent-color)" />
        <span style={{ letterSpacing: '0.14em', color: 'var(--text-secondary)' }}>
          SYNCING LYRICS TIMESTAMPS...
        </span>
      </div>
    );
  }

  // If no lyrics found online, display clean prompt with search & paste modal
  if (!lyricsData || lyricsData.lines.length === 0) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          color: 'var(--text-muted)',
          fontFamily: 'var(--font-mono)',
          fontSize: '10px',
          gap: '12px',
          padding: '24px',
          textAlign: 'center',
          position: 'relative',
        }}
      >
        <Sparkles size={22} opacity={0.35} color="var(--accent-color)" />
        <div style={{ color: 'var(--text-primary)', fontWeight: 700, letterSpacing: '0.08em', fontSize: '11px' }}>
          NO SYNCED LYRICS FOUND ONLINE
        </div>
        <div style={{ fontSize: '9px', maxWidth: '220px', lineHeight: 1.4, color: 'var(--text-secondary)' }}>
          {currentTrack.artist} — {currentTrack.title}
        </div>

        <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
          <button
            onClick={() => {
              setSearchQuery(`${currentTrack.artist} ${currentTrack.title}`);
              setIsSearchOpen(true);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--accent-color)',
              color: 'var(--accent-color)',
              padding: '6px 12px',
              borderRadius: '4px',
              fontSize: '9px',
              fontWeight: 700,
              fontFamily: 'var(--font-mono)',
              cursor: 'pointer',
              letterSpacing: '0.08em',
            }}
          >
            <Search size={12} />
            <span>SEARCH / PASTE LRC</span>
          </button>

          <button
            onClick={() => loadLyrics(currentTrack.artist, currentTrack.title)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'transparent',
              border: '1px solid var(--border-color)',
              color: 'var(--text-secondary)',
              padding: '6px 10px',
              borderRadius: '4px',
              fontSize: '9px',
              fontFamily: 'var(--font-mono)',
              cursor: 'pointer',
            }}
            title="Retry fetch"
          >
            <RefreshCw size={12} />
          </button>
        </div>

        {/* Modal Overlay for Search / Paste */}
        {isSearchOpen && (
          <LyricsSearchModal
            currentTrack={currentTrack}
            searchTab={searchTab}
            setSearchTab={setSearchTab}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            pastedLrc={pastedLrc}
            setPastedLrc={setPastedLrc}
            searchLoading={searchLoading}
            statusMsg={statusMsg}
            onSearch={handleManualSearch}
            onSaveLrc={handleSavePastedLrc}
            onClose={() => setIsSearchOpen(false)}
          />
        )}
      </div>
    );
  }

  return (
    <div className={`apple-lyrics-viewport ${appleLyricsMode ? 'apple-mode' : 'standard-mode'}`}>
      {/* Top Apple Music Frosted Gradient Blur Overlay */}
      <div className="apple-lyrics-blur-top" />

      {/* Scrollable Apple Music Synced Lyrics Container */}
      <div
        ref={containerRef}
        className="apple-lyrics-scroll"
        onWheel={handleUserScroll}
        onTouchMove={handleUserScroll}
      >
        {/* Track Title & Artist Header (Apple Music Style) */}
        {currentTrack && (
          <div
            style={{
              paddingBottom: '20px',
              marginBottom: '10px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              opacity: currentLineIndex > 1 ? 0.35 : 1,
              transition: 'opacity 0.4s ease',
            }}
          >
            <div
              style={{
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
                fontSize: '24px',
                fontWeight: 800,
                color: '#ffffff',
                lineHeight: 1.25,
                letterSpacing: '-0.02em',
              }}
            >
              {currentTrack.title}
            </div>
            <div
              style={{
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                fontSize: '14px',
                fontWeight: 500,
                color: 'rgba(255, 255, 255, 0.55)',
                marginTop: '4px',
                letterSpacing: '-0.01em',
              }}
            >
              {currentTrack.artist}
            </div>
          </div>
        )}

        {lyricsData.lines.map((line, index) => {
          const isActive = index === currentLineIndex;
          const isPast = index < currentLineIndex;

          return (
            <div
              key={line.id}
              ref={isActive ? activeLineRef : null}
              className={`apple-lyric-item ${isActive ? 'active-item' : ''}`}
              onClick={() => handleLineClick(line.time)}
              title={`Jump to ${formatSeconds(line.time)}`}
            >
              {isActive ? (
                <ActiveLyricLine
                  line={line}
                  effectiveTime={effectiveTime}
                  karaokeMode={karaokeMode && appleLyricsMode}
                />
              ) : (
                <span className={`apple-lyric-text ${isPast ? 'past' : 'upcoming'}`}>
                  {line.text}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom Apple Music Frosted Gradient Blur Overlay */}
      <div className="apple-lyrics-blur-bottom" />

      {/* Floating Apple Music Sing & Controls in bottom-right corner (Image 2 reference) */}
      <div
        style={{
          position: 'absolute',
          bottom: '14px',
          right: '14px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          zIndex: 20,
        }}
      >
        {/* Apple-style Lyrics Mode Button */}
        <button
          onClick={() => setAppleLyricsMode((prev) => !prev)}
          style={{
            background: appleLyricsMode
              ? 'rgba(255, 255, 255, 0.22)'
              : 'rgba(20, 20, 24, 0.7)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            color: appleLyricsMode ? '#ffffff' : 'rgba(255, 255, 255, 0.45)',
            border: appleLyricsMode
              ? '1px solid rgba(255, 255, 255, 0.35)'
              : '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '10px',
            width: '34px',
            height: '34px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: appleLyricsMode
              ? '0 0 12px rgba(255, 255, 255, 0.15), 0 4px 14px rgba(0, 0, 0, 0.5)'
              : '0 4px 14px rgba(0, 0, 0, 0.5)',
            transition: 'all 0.2s ease',
          }}
          title={appleLyricsMode ? 'Apple Lyrics Mode Active' : 'Enable Apple Lyrics Mode'}
          aria-label={appleLyricsMode ? 'Apple Lyrics Mode Active' : 'Enable Apple Lyrics Mode'}
          aria-pressed={appleLyricsMode}
        >
          <AppleLogoIcon size={15} />
        </button>
      </div>

      {/* Modal for Search / Paste */}
      {isSearchOpen && (
        <LyricsSearchModal
          currentTrack={currentTrack}
          searchTab={searchTab}
          setSearchTab={setSearchTab}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          pastedLrc={pastedLrc}
          setPastedLrc={setPastedLrc}
          searchLoading={searchLoading}
          statusMsg={statusMsg}
          onSearch={handleManualSearch}
          onSaveLrc={handleSavePastedLrc}
          onClose={() => setIsSearchOpen(false)}
        />
      )}
    </div>
  );
};

interface ModalProps {
  currentTrack: any;
  searchTab: 'SEARCH' | 'PASTE';
  setSearchTab: (t: 'SEARCH' | 'PASTE') => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  pastedLrc: string;
  setPastedLrc: (l: string) => void;
  searchLoading: boolean;
  statusMsg: string;
  onSearch: (e: React.FormEvent) => void;
  onSaveLrc: () => void;
  onClose: () => void;
}

const LyricsSearchModal: React.FC<ModalProps> = ({
  searchTab,
  setSearchTab,
  searchQuery,
  setSearchQuery,
  pastedLrc,
  setPastedLrc,
  searchLoading,
  statusMsg,
  onSearch,
  onSaveLrc,
  onClose,
}) => {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(6px)',
        zIndex: 50,
        display: 'flex',
        flexDirection: 'column',
        padding: '16px',
        animation: 'fadeIn 0.2s ease',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', fontWeight: 700, letterSpacing: '0.12em', color: 'var(--text-primary)' }}>
          LYRICS MANAGER
        </span>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
          <X size={16} />
        </button>
      </div>

      <div style={{ display: 'flex', gap: '4px', marginBottom: '12px', background: 'var(--bg-secondary)', padding: '3px', borderRadius: '4px' }}>
        <button
          onClick={() => setSearchTab('SEARCH')}
          style={{
            flex: 1,
            padding: '5px',
            fontSize: '9px',
            fontWeight: 700,
            fontFamily: 'var(--font-mono)',
            background: searchTab === 'SEARCH' ? 'var(--bg-primary)' : 'transparent',
            color: searchTab === 'SEARCH' ? 'var(--accent-color)' : 'var(--text-muted)',
            border: 'none',
            cursor: 'pointer',
            borderRadius: '2px',
          }}
        >
          SEARCH ONLINE
        </button>
        <button
          onClick={() => setSearchTab('PASTE')}
          style={{
            flex: 1,
            padding: '5px',
            fontSize: '9px',
            fontWeight: 700,
            fontFamily: 'var(--font-mono)',
            background: searchTab === 'PASTE' ? 'var(--bg-primary)' : 'transparent',
            color: searchTab === 'PASTE' ? 'var(--accent-color)' : 'var(--text-muted)',
            border: 'none',
            cursor: 'pointer',
            borderRadius: '2px',
          }}
        >
          PASTE LRC
        </button>
      </div>

      {searchTab === 'SEARCH' ? (
        <form onSubmit={onSearch} style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
          <input
            type="text"
            placeholder="Artist and Title (e.g. Rawal Jhooth)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              padding: '8px 10px',
              background: 'var(--bg-primary)',
              border: '1px solid var(--border-bright)',
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-sans)',
              fontSize: '11px',
              borderRadius: '4px',
              outline: 'none',
            }}
          />
          <button
            type="submit"
            disabled={searchLoading}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              background: 'var(--accent-color)',
              color: 'var(--bg-primary)',
              border: 'none',
              padding: '8px',
              borderRadius: '4px',
              fontFamily: 'var(--font-mono)',
              fontSize: '9.5px',
              fontWeight: 700,
              letterSpacing: '0.08em',
              cursor: 'pointer',
            }}
          >
            {searchLoading ? <Loader2 size={13} className="animate-spin" /> : <Search size={13} />}
            <span>SEARCH ARCHIVES</span>
          </button>
        </form>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
          <textarea
            placeholder="Paste standard LRC format:&#10;[00:15.50] Lyric line 1&#10;[00:24.00] Lyric line 2"
            value={pastedLrc}
            onChange={(e) => setPastedLrc(e.target.value)}
            style={{
              flex: 1,
              padding: '8px',
              background: 'var(--bg-primary)',
              border: '1px solid var(--border-bright)',
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-mono)',
              fontSize: '10px',
              borderRadius: '4px',
              outline: 'none',
              resize: 'none',
            }}
          />
          <button
            onClick={onSaveLrc}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              background: 'var(--accent-color)',
              color: 'var(--bg-primary)',
              border: 'none',
              padding: '8px',
              borderRadius: '4px',
              fontFamily: 'var(--font-mono)',
              fontSize: '9.5px',
              fontWeight: 700,
              letterSpacing: '0.08em',
              cursor: 'pointer',
            }}
          >
            <Check size={13} />
            <span>SAVE & SYNC</span>
          </button>
        </div>
      )}

      {statusMsg && (
        <div style={{ marginTop: '8px', fontSize: '9px', color: 'var(--accent-color)', fontFamily: 'var(--font-mono)', textAlign: 'center' }}>
          {statusMsg}
        </div>
      )}
    </div>
  );
};

function formatSeconds(secs: number): string {
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}
