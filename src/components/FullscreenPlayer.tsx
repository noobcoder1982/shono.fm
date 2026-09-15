import React, { useState, useEffect, useRef } from 'react';
import { usePlayer } from '../context/PlayerContext';
import { fetchLyrics, type ParsedLyrics, type LyricLine } from '../services/lyricsService';
import { MasterWaveform } from './MasterWaveform';
import { useSmoothTime, computeWordTimings } from './AppleLyrics';
import { useArtwork } from '../services/artworkService';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Heart,
  MoreHorizontal,
  Volume2,
  VolumeX,
  Minimize2,
  Layers,
  MessageSquareQuote,
  Sparkles,
  Music,
  X,
  Copy,
  Check,
} from 'lucide-react';

const FullscreenActiveLyricLine: React.FC<{
  line: LyricLine;
  effectiveTime: number;
}> = ({ line, effectiveTime }) => {
  const lineEnd = line.endTime || line.time + 3.5;
  const words = React.useMemo(() => {
    return computeWordTimings(line.text, line.time, lineEnd);
  }, [line.text, line.time, lineEnd]);

  const progressMapRef = useRef<number[]>([]);

  // If user seeked backwards before this line, reset word memory
  if (effectiveTime < line.time - 0.8) {
    progressMapRef.current = [];
  }

  return (
    <div className="fullscreen-lyric-active-inner" style={{ display: 'inline' }}>
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
          breath = Math.sin(p * Math.PI);
        }

        const prevPct = progressMapRef.current[idx] || 0;
        const sweepPct = Math.max(prevPct, currentWordPct);
        progressMapRef.current[idx] = sweepPct;

        let scale = 1;
        let dropGlow: string | undefined = undefined;

        if (isSinging && sweepPct < 100) {
          if (w.isHeld) {
            scale = 1 + breath * (0.08 + 0.08 * w.intensity);
            const b1 = (6 + 12 * breath * w.intensity).toFixed(1);
            const b2 = (18 + 22 * breath * w.intensity).toFixed(1);
            const a1 = (0.55 + 0.45 * breath * w.intensity).toFixed(2);
            const a2 = (0.28 + 0.35 * breath * w.intensity).toFixed(2);
            dropGlow = `drop-shadow(0 0 ${b1}px rgba(255, 255, 255, ${a1})) drop-shadow(0 0 ${b2}px rgba(234, 179, 8, ${a2}))`;
          } else {
            scale = 1 + breath * 0.035;
            dropGlow = `drop-shadow(0 0 8px rgba(255, 255, 255, ${(0.45 * breath).toFixed(2)}))`;
          }
        }

        const wordStyle: React.CSSProperties = {
          '--word-sweep': `${sweepPct}%`,
          transform: scale !== 1 ? `scale(${scale.toFixed(3)})` : undefined,
          filter: dropGlow,
          position: 'relative',
          display: 'inline-block',
          zIndex: isSinging && w.isHeld ? 4 : 1,
        } as React.CSSProperties;

        return (
          <React.Fragment key={idx}>
            <span className="fullscreen-apple-word" style={wordStyle}>
              {w.text}
            </span>
            {idx < words.length - 1 ? ' ' : ''}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export const FullscreenPlayer: React.FC = () => {
  const {
    currentTrack,
    playbackStatus,
    currentTime,
    duration,
    togglePlayPause,
    playNext,
    playPrev,
    seek,
    volume,
    setVolume,
    isMuted,
    toggleMute,
    isShuffle,
    toggleShuffle,
    repeatMode,
    cycleRepeat,
    toggleLike,
    likedTrackIds,
    isFullscreenPlayerOpen,
    setIsFullscreenPlayerOpen,
    openTrackDetail,
  } = usePlayer();

  const [activeTab, setActiveTab] = useState<'LYRICS' | 'VISUALS'>('LYRICS');
  const [lyricsData, setLyricsData] = useState<ParsedLyrics | null>(null);
  const [isLoadingLyrics, setIsLoadingLyrics] = useState(false);
  const [isFullLyricsModalOpen, setIsFullLyricsModalOpen] = useState(false);
  const [copiedFullLyrics, setCopiedFullLyrics] = useState(false);
  const [userScrolled, setUserScrolled] = useState(false);
  const [lyricsAlignment, setLyricsAlignment] = useState<'RIGHT' | 'LEFT' | 'CENTER'>(() => {
    try {
      return (localStorage.getItem('muszix_lyrics_alignment') as 'RIGHT' | 'LEFT' | 'CENTER') || 'RIGHT';
    } catch {
      return 'RIGHT';
    }
  });

  const lyricsContainerRef = useRef<HTMLDivElement>(null);
  const activeLineRef = useRef<HTMLDivElement>(null);
  const userScrollTimeoutRef = useRef<number | null>(null);

  const isPlaying = playbackStatus === 'PLAYING';
  const smoothTime = useSmoothTime(currentTime, isPlaying);
  const { artworkUrl, isYouTube } = useArtwork(currentTrack);
  const isLiked = currentTrack ? likedTrackIds.includes(currentTrack.id) : false;

  // Fetch live lyrics whenever track changes
  useEffect(() => {
    if (!currentTrack) {
      setLyricsData(null);
      return;
    }

    let active = true;
    setIsLoadingLyrics(true);

    fetchLyrics(currentTrack.artist, currentTrack.title, duration)
      .then((res) => {
        if (!active) return;
        setLyricsData(res);
        setIsLoadingLyrics(false);
        setUserScrolled(false);
      })
      .catch(() => {
        if (!active) return;
        setLyricsData(null);
        setIsLoadingLyrics(false);
      });

    return () => {
      active = false;
    };
  }, [currentTrack?.id, currentTrack?.title, currentTrack?.artist]);

  // Find active lyric line based on smoothTime with 150ms anticipation lead
  const activeIndex = React.useMemo(() => {
    if (!lyricsData || !lyricsData.lines || lyricsData.lines.length === 0) return -1;
    const lines = lyricsData.lines;

    let idx = -1;
    for (let i = 0; i < lines.length; i++) {
      if (smoothTime >= lines[i].time - 0.15) {
        idx = i;
      } else {
        break;
      }
    }
    if (idx === -1 && lines.length > 0) return 0;
    return idx;
  }, [lyricsData, smoothTime]);

  // Smoothly auto-scroll active lyric line into center
  useEffect(() => {
    if (!isFullscreenPlayerOpen || activeTab !== 'LYRICS' || activeIndex < 0 || userScrolled) return;

    if (activeLineRef.current && lyricsContainerRef.current) {
      const container = lyricsContainerRef.current;
      const element = activeLineRef.current;
      const targetScroll =
        element.offsetTop - container.clientHeight / 2 + element.clientHeight / 2;

      container.scrollTo({
        top: Math.max(0, targetScroll),
        behavior: 'smooth',
      });
    }
  }, [activeIndex, isFullscreenPlayerOpen, activeTab, userScrolled]);

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
    seek(time);
    setUserScrolled(false);
  };

  // Format seconds to m:ss
  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const remainingTime = Math.max(0, (duration || 0) - currentTime);
  const progressPercent = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;

  if (!isFullscreenPlayerOpen || !currentTrack) return null;

  const handleScrubberClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const pct = Math.max(0, Math.min(1, clickX / rect.width));
    const target = pct * (duration || 0);
    seek(target);
  };

  const handleCopyLyrics = () => {
    if (!lyricsData?.lines) return;
    const text = lyricsData.lines.map((l) => l.text).join('\n');
    navigator.clipboard.writeText(text).then(() => {
      setCopiedFullLyrics(true);
      setTimeout(() => setCopiedFullLyrics(false), 2000);
    });
  };

  return (
    <div
      className="fullscreen-player-viewport"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: '#07070a',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        userSelect: 'none',
        animation: 'modalCardFadeIn 0.28s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      }}
    >
      {/* 1. DYNAMIC BLURRED ALBUM ARTWORK BACKDROP */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: '-60px',
          backgroundImage: `url(${artworkUrl || '/assets/now_playing_art.jpg'})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(60px) saturate(1.45) brightness(0.42)',
          transform: 'scale(1.18)',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />

      {/* 2. CINEMATIC GRADIENT VIGNETTE & CONTRAST PROTECTION */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(ellipse at 40% 50%, rgba(8, 8, 12, 0.45) 0%, rgba(8, 8, 12, 0.85) 65%, rgba(6, 6, 9, 0.96) 100%)',
          pointerEvents: 'none',
          zIndex: 2,
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(180deg, rgba(5, 5, 8, 0.65) 0%, transparent 18%, transparent 82%, rgba(5, 5, 8, 0.88) 100%)',
          pointerEvents: 'none',
          zIndex: 3,
        }}
      />

      {/* 3. TOP NAVIGATION RAIL */}
      <header
        style={{
          height: '68px',
          padding: '0 40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'relative',
          zIndex: 10,
          flexShrink: 0,
        }}
      >
        {/* Top-Left: Brand & Now Playing Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '3.5px',
              height: '20px',
              background: '#eab308',
              borderRadius: '1px',
              boxShadow: '0 0 10px rgba(234, 179, 8, 0.55)',
            }}
          />
          <div>
            <div
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '15px',
                fontWeight: 800,
                letterSpacing: '0.12em',
                color: '#ffffff',
                lineHeight: 1.1,
              }}
            >
              SHONO.FM
            </div>
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '8.5px',
                fontWeight: 600,
                letterSpacing: '0.18em',
                color: '#71717a',
                marginTop: '1px',
              }}
            >
              NOW PLAYING :
            </div>
          </div>
        </div>

        {/* Top-Right: Tabs, More Options & Fullscreen Exit Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {/* Lyrics / Visuals Switcher Pills */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '999px',
              padding: '3px',
              gap: '2px',
            }}
          >
            <button
              type="button"
              onClick={() => setActiveTab('LYRICS')}
              style={{
                padding: '4px 14px',
                borderRadius: '999px',
                border: activeTab === 'LYRICS' ? '1px solid #eab308' : '1px solid transparent',
                background: activeTab === 'LYRICS' ? 'rgba(234, 179, 8, 0.12)' : 'transparent',
                color: activeTab === 'LYRICS' ? '#ffffff' : '#71717a',
                fontFamily: 'var(--font-mono)',
                fontSize: '10px',
                fontWeight: 700,
                letterSpacing: '0.08em',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              LYRICS
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('VISUALS')}
              style={{
                padding: '4px 14px',
                borderRadius: '999px',
                border: activeTab === 'VISUALS' ? '1px solid #eab308' : '1px solid transparent',
                background: activeTab === 'VISUALS' ? 'rgba(234, 179, 8, 0.12)' : 'transparent',
                color: activeTab === 'VISUALS' ? '#ffffff' : '#71717a',
                fontFamily: 'var(--font-mono)',
                fontSize: '10px',
                fontWeight: 700,
                letterSpacing: '0.08em',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              VISUALS
            </button>
          </div>

          {/* More Options Button */}
          <button
            type="button"
            onClick={() => openTrackDetail(currentTrack)}
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#a1a1aa',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s ease',
            }}
            title="Track Dossier & Specifications"
          >
            <MoreHorizontal size={17} />
          </button>

          {/* Fullscreen Exit Button */}
          <button
            type="button"
            onClick={() => setIsFullscreenPlayerOpen(false)}
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#f4f4f5',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s ease',
            }}
            title="Exit Fullscreen Player (ESC / F)"
          >
            <Minimize2 size={16} />
          </button>
        </div>
      </header>

      {/* 4. MAIN 2-COLUMN VIEWPORT */}
      <main
        style={{
          flex: 1,
          display: 'grid',
          gridTemplateColumns: 'minmax(380px, 42%) 1fr',
          gap: '64px',
          padding: '0 64px',
          position: 'relative',
          zIndex: 10,
          alignItems: 'center',
          minHeight: 0,
          overflow: 'hidden',
        }}
      >
        {/* LEFT COLUMN: Cover Artwork, Track Info & Playback Controls */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            maxWidth: '430px',
            width: '100%',
            margin: '0 auto',
          }}
        >
          {/* Large Square Artwork with Anti-Pillarbox & High-Res Resolution */}
          <div
            className="square-artwork-container"
            style={{
              position: 'relative',
              width: '100%',
              aspectRatio: '1 / 1',
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: '0 24px 70px rgba(0, 0, 0, 0.75), 0 4px 18px rgba(0, 0, 0, 0.45)',
              background: '#09090b',
              marginBottom: '28px',
            }}
          >
            <img
              src={artworkUrl || '/assets/now_playing_art.jpg'}
              alt={currentTrack.title}
              className={`square-artwork-img ${isYouTube ? 'is-yt-fallback' : ''}`}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block',
              }}
            />
          </div>

          {/* Track Metadata & Favorite / More Options */}
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              marginBottom: '20px',
            }}
          >
            <div style={{ flex: 1, paddingRight: '16px', overflow: 'hidden' }}>
              <div
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '28px',
                  fontWeight: 700,
                  color: '#ffffff',
                  letterSpacing: '-0.02em',
                  lineHeight: 1.15,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
                title={currentTrack.title}
              >
                {currentTrack.title}
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '15px',
                  fontWeight: 500,
                  color: '#a1a1aa',
                  marginTop: '5px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
                title={currentTrack.artist}
              >
                {currentTrack.artist}
              </div>
            </div>

            {/* Favorite & More Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
              <button
                type="button"
                onClick={() => toggleLike(currentTrack.id)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: isLiked ? '#eab308' : '#a1a1aa',
                  cursor: 'pointer',
                  padding: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.15s ease',
                }}
                title={isLiked ? 'Remove from Favourites' : 'Add to Favourites'}
              >
                <Heart size={20} fill={isLiked ? '#eab308' : 'none'} />
              </button>

              <button
                type="button"
                onClick={() => openTrackDetail(currentTrack)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#a1a1aa',
                  cursor: 'pointer',
                  padding: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.15s ease',
                }}
                title="More track options"
              >
                <MoreHorizontal size={20} />
              </button>
            </div>
          </div>

          {/* Progress Scrubber Bar */}
          <div style={{ marginBottom: '22px' }}>
            <div
              onClick={handleScrubberClick}
              style={{
                height: '14px',
                display: 'flex',
                alignItems: 'center',
                cursor: 'pointer',
                position: 'relative',
              }}
            >
              {/* Rail */}
              <div
                style={{
                  width: '100%',
                  height: '4px',
                  borderRadius: '2px',
                  background: 'rgba(255, 255, 255, 0.16)',
                  position: 'relative',
                  overflow: 'visible',
                }}
              >
                {/* Active Progress */}
                <div
                  style={{
                    width: `${progressPercent}%`,
                    height: '100%',
                    borderRadius: '2px',
                    background: '#eab308',
                    position: 'relative',
                  }}
                >
                  {/* Scrubber Knob */}
                  <div
                    style={{
                      position: 'absolute',
                      right: '-5px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      background: '#ffffff',
                      boxShadow: '0 0 6px rgba(0, 0, 0, 0.6)',
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Time Indicators */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                color: '#71717a',
                marginTop: '3px',
                letterSpacing: '0.04em',
              }}
            >
              <span>{formatTime(currentTime)}</span>
              <span>-{formatTime(remainingTime)}</span>
            </div>
          </div>

          {/* Transport Audio Controls */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 6px',
            }}
          >
            {/* Shuffle */}
            <button
              type="button"
              onClick={toggleShuffle}
              style={{
                background: 'transparent',
                border: 'none',
                color: isShuffle ? '#eab308' : '#71717a',
                cursor: 'pointer',
                padding: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'color 0.15s ease',
              }}
              title={isShuffle ? 'Shuffle Enabled' : 'Enable Shuffle'}
            >
              <Shuffle size={18} />
            </button>

            {/* Previous */}
            <button
              type="button"
              onClick={playPrev}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#f4f4f5',
                cursor: 'pointer',
                padding: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'transform 0.12s ease',
              }}
              title="Previous Track"
            >
              <SkipBack size={22} fill="currentColor" />
            </button>

            {/* Large Centered Play/Pause Button */}
            <button
              type="button"
              onClick={togglePlayPause}
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                border: '1.5px solid rgba(234, 179, 8, 0.45)',
                background: 'rgba(234, 179, 8, 0.08)',
                color: '#ffffff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.16s cubic-bezier(0.16, 1, 0.3, 1)',
                boxShadow: '0 0 20px rgba(0, 0, 0, 0.4)',
              }}
              title={isPlaying ? 'Pause' : 'Play'}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#eab308';
                e.currentTarget.style.background = 'rgba(234, 179, 8, 0.18)';
                e.currentTarget.style.transform = 'scale(1.04)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(234, 179, 8, 0.45)';
                e.currentTarget.style.background = 'rgba(234, 179, 8, 0.08)';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              {isPlaying ? (
                <Pause size={26} fill="currentColor" />
              ) : (
                <Play size={26} fill="currentColor" style={{ marginLeft: '3px' }} />
              )}
            </button>

            {/* Next */}
            <button
              type="button"
              onClick={playNext}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#f4f4f5',
                cursor: 'pointer',
                padding: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'transform 0.12s ease',
              }}
              title="Next Track"
            >
              <SkipForward size={22} fill="currentColor" />
            </button>

            {/* Repeat */}
            <button
              type="button"
              onClick={cycleRepeat}
              style={{
                background: 'transparent',
                border: 'none',
                color: repeatMode !== 'OFF' ? '#eab308' : '#71717a',
                cursor: 'pointer',
                padding: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'color 0.15s ease',
              }}
              title={`Repeat: ${repeatMode}`}
            >
              {repeatMode === 'ONE' ? <Repeat1 size={18} /> : <Repeat size={18} />}
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: Live Synced Lyrics or Visuals */}
        <div
          style={{
            height: '100%',
            maxHeight: 'calc(100vh - 150px)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            position: 'relative',
            minHeight: 0,
          }}
        >
          {activeTab === 'LYRICS' ? (
            /* Live Lyrics Viewport */
            <div
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                minHeight: 0,
                overflow: 'hidden',
              }}
            >
              {/* Apple Lyrics Ambient Header / Badges & Placement Controls */}
              {lyricsData && lyricsData.lines && lyricsData.lines.length > 0 && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '10px',
                    padding: '0 16px',
                    flexShrink: 0,
                    zIndex: 5,
                  }}
                >
                  {/* Alignment / Placement Selector: [RIGHT] [LEFT] [CENTER] */}
                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '999px',
                        padding: '2px',
                        gap: '2px',
                      }}
                      title="Lyrics Placement & Text Alignment"
                    >
                      {(['RIGHT', 'LEFT', 'CENTER'] as const).map((align) => (
                        <button
                          key={align}
                          type="button"
                          onClick={() => {
                            setLyricsAlignment(align);
                            try {
                              localStorage.setItem('muszix_lyrics_alignment', align);
                            } catch {}
                          }}
                          style={{
                            padding: '3px 9px',
                            borderRadius: '999px',
                            border: 'none',
                            background: lyricsAlignment === align ? 'rgba(234, 179, 8, 0.2)' : 'transparent',
                            color: lyricsAlignment === align ? '#eab308' : '#71717a',
                            fontFamily: 'var(--font-mono)',
                            fontSize: '8.5px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          {align}
                        </button>
                      ))}
                    </div>

                  <button
                    type="button"
                    onClick={() => setIsFullLyricsModalOpen(true)}
                    style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: '#a1a1aa',
                      fontSize: '9.5px',
                      fontFamily: 'var(--font-mono)',
                      letterSpacing: '0.08em',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      padding: '4px 10px',
                      borderRadius: '999px',
                      transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#ffffff';
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.25)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = '#a1a1aa';
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                    }}
                  >
                    <MessageSquareQuote size={12} />
                    <span>EXPAND LRC</span>
                  </button>
                </div>
              )}

              {/* Scrollable Container with progressive blur and word-level sweep */}
              <div
                ref={lyricsContainerRef}
                className={`fullscreen-lyrics-scroll align-${lyricsAlignment.toLowerCase()}`}
                onWheel={handleUserScroll}
                onTouchMove={handleUserScroll}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems:
                    lyricsAlignment === 'RIGHT'
                      ? 'flex-end'
                      : lyricsAlignment === 'CENTER'
                      ? 'center'
                      : 'flex-start',
                  width: '100%',
                }}
              >
                {isLoadingLyrics ? (
                  <div
                    style={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      justifyContent: 'center',
                      gap: '16px',
                      color: '#71717a',
                      fontFamily: 'var(--font-sans)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '16px' }}>
                      <Sparkles size={18} color="#eab308" className="animate-spin" />
                      <span>Synchronizing live lyrics...</span>
                    </div>
                  </div>
                ) : !lyricsData || !lyricsData.lines || lyricsData.lines.length === 0 ? (
                  /* Clean "Lyrics Unavailable" State (no fake lyrics!) */
                  <div
                    style={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      justifyContent: 'center',
                      padding: '0 10px',
                    }}
                  >
                    <div
                      style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '50%',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#71717a',
                        marginBottom: '16px',
                      }}
                    >
                      <Music size={20} />
                    </div>
                    <div
                      style={{
                        fontFamily: 'var(--font-sans)',
                        fontSize: '22px',
                        fontWeight: 700,
                        color: '#f4f4f5',
                        marginBottom: '6px',
                      }}
                    >
                      Lyrics unavailable
                    </div>
                    <div
                      style={{
                        fontFamily: 'var(--font-sans)',
                        fontSize: '13.5px',
                        color: '#71717a',
                        maxWidth: '320px',
                        lineHeight: 1.5,
                      }}
                    >
                      Synchronized lyrics could not be found for &ldquo;{currentTrack.title}&rdquo;.
                    </div>
                  </div>
                ) : (
                  /* Apple Music Depth-of-Field Blur Synced Lyrics Lines */
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      width: '100%',
                      alignItems:
                        lyricsAlignment === 'RIGHT'
                          ? 'flex-end'
                          : lyricsAlignment === 'CENTER'
                          ? 'center'
                          : 'flex-start',
                      paddingBottom: '160px',
                    }}
                  >
                    {lyricsData.lines.map((line: LyricLine, idx: number) => {
                      const isActive = idx === activeIndex;
                      const diff = Math.abs(idx - activeIndex);

                      let blur = 0;
                      let opacity = 1;
                      let scale = 1.035;

                      if (isActive) {
                        blur = 0;
                        opacity = 1;
                        scale = 1.035;
                      } else if (diff === 1) {
                        blur = 2.5;
                        opacity = 0.40;
                        scale = 0.98;
                      } else if (diff === 2) {
                        blur = 5.0;
                        opacity = 0.22;
                        scale = 0.95;
                      } else {
                        const extra = Math.min(diff - 3, 5);
                        blur = 8.0 + extra * 0.8;
                        opacity = Math.max(0.08, 0.13 - extra * 0.015);
                        scale = Math.max(0.88, 0.92 - extra * 0.01);
                      }

                      const isRight = lyricsAlignment === 'RIGHT';
                      const isCenter = lyricsAlignment === 'CENTER';
                      const translateX = isActive
                        ? isRight
                          ? '-8px'
                          : isCenter
                          ? '0px'
                          : '8px'
                        : '0px';

                      return (
                        <div
                          key={idx}
                          ref={isActive ? activeLineRef : null}
                          onClick={() => handleLineClick(line.time)}
                          className={`fullscreen-lyric-line ${isActive ? 'is-active' : ''}`}
                          style={{
                            filter: `blur(${blur}px)`,
                            opacity,
                            transform: `scale(${scale}) translateX(${translateX})`,
                            maxWidth: '740px',
                            width: '100%',
                            textAlign: isRight ? 'right' : isCenter ? 'center' : 'left',
                            alignSelf: isRight ? 'flex-end' : isCenter ? 'center' : 'flex-start',
                          }}
                          title={`Jump to ${formatTime(line.time)}`}
                        >
                          {isActive ? (
                            <FullscreenActiveLyricLine line={line} effectiveTime={smoothTime} />
                          ) : (
                            line.text
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Visuals Viewport */
            <div
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                padding: '24px',
              }}
            >
              <div
                style={{
                  width: '100%',
                  maxWidth: '560px',
                  background: 'rgba(0, 0, 0, 0.3)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '16px',
                  padding: '30px 24px',
                  boxShadow: '0 20px 60px rgba(0, 0, 0, 0.6)',
                }}
              >
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '11px',
                    color: '#eab308',
                    letterSpacing: '0.12em',
                    marginBottom: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <span>LIVE ACOUSTIC TELEMETRY</span>
                  <span>48.0 KHZ // STEREO</span>
                </div>
                <MasterWaveform
                  track={currentTrack}
                  currentTime={currentTime}
                  duration={duration}
                  isPlaying={isPlaying}
                  onSeek={seek}
                  height={140}
                  showTimeLabels={true}
                />
              </div>
            </div>
          )}
        </div>
      </main>

      {/* 5. BOTTOM BAR FOOTER */}
      <footer
        style={{
          height: '56px',
          padding: '0 40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'relative',
          zIndex: 10,
          flexShrink: 0,
        }}
      >
        {/* Bottom-Left: Playing on YouTube Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#71717a',
            }}
          >
            <Layers size={17} />
          </div>
          <div>
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '8px',
                color: '#52525b',
                letterSpacing: '0.14em',
                lineHeight: 1,
              }}
            >
              PLAYING ON
            </div>
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '9.5px',
                fontWeight: 700,
                color: '#a1a1aa',
                letterSpacing: '0.08em',
                marginTop: '1px',
              }}
            >
              YOUTUBE
            </div>
          </div>
        </div>

        {/* Bottom-Center: Volume Slider Control */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            type="button"
            onClick={toggleMute}
            style={{
              background: 'transparent',
              border: 'none',
              color: isMuted ? '#ef4444' : '#a1a1aa',
              cursor: 'pointer',
              padding: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
          <input
            type="range"
            min={0}
            max={100}
            value={isMuted ? 0 : volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            style={{
              width: '80px',
              accentColor: '#eab308',
              cursor: 'pointer',
              height: '3px',
            }}
          />
        </div>

        {/* Bottom-Right: Full Lyrics Toggle */}
        <button
          type="button"
          onClick={() => setIsFullLyricsModalOpen(true)}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#a1a1aa',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontFamily: 'var(--font-mono)',
            fontSize: '10.5px',
            fontWeight: 700,
            letterSpacing: '0.1em',
            padding: '6px 10px',
            borderRadius: '4px',
            transition: 'color 0.15s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#ffffff')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#a1a1aa')}
        >
          <MessageSquareQuote size={16} />
          <span>FULL LYRICS</span>
          <span style={{ fontSize: '11px', lineHeight: 1 }}>⌃</span>
        </button>
      </footer>

      {/* 6. FULL LYRICS SHEET MODAL */}
      {isFullLyricsModalOpen && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(5, 5, 8, 0.88)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            zIndex: 50,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            animation: 'modalCardFadeIn 0.22s cubic-bezier(0.16, 1, 0.3, 1) forwards',
          }}
          onClick={() => setIsFullLyricsModalOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '620px',
              maxHeight: '82vh',
              background: 'rgba(18, 18, 22, 0.95)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '14px',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              boxShadow: '0 24px 60px rgba(0, 0, 0, 0.8)',
            }}
          >
            <div
              style={{
                padding: '16px 20px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ fontFamily: 'var(--font-sans)', fontSize: '15px', fontWeight: 700, color: '#fff' }}>
                  {currentTrack.title} &mdash; Full Lyrics
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#a1a1aa' }}>
                  {currentTrack.artist}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  type="button"
                  onClick={handleCopyLyrics}
                  className="bma-btn"
                  style={{
                    padding: '5px 10px',
                    fontSize: '9.5px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                  }}
                >
                  {copiedFullLyrics ? <Check size={12} color="#22c55e" /> : <Copy size={12} />}
                  <span>{copiedFullLyrics ? 'COPIED' : 'COPY'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsFullLyricsModalOpen(false)}
                  className="bma-btn-icon"
                  style={{ padding: '6px' }}
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: '24px 28px',
                fontFamily: 'var(--font-sans)',
                fontSize: '15px',
                lineHeight: 1.8,
                color: '#e4e4e7',
                whiteSpace: 'pre-line',
              }}
            >
              {lyricsData && lyricsData.lines && lyricsData.lines.length > 0 ? (
                lyricsData.lines.map((l) => l.text).join('\n')
              ) : (
                <span style={{ color: '#71717a' }}>No lyrics available for this song.</span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
