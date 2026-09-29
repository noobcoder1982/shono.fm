import React, { useState } from 'react';
import { usePlayer } from '../context/PlayerContext';
import type { Track } from '../types';
import { storage } from '../services/storage';
import {
  X,
  Play,
  RotateCw,
  Plus,
  Trash2,
  Disc,
  Save,
  Check,
} from 'lucide-react';

interface MixtapeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TapeFormat = 'C60' | 'C90';
type TapeColor = 'black' | 'clear' | 'smoke' | 'yellow' | 'white';

const TAPE_LENGTHS: Record<TapeFormat, { label: string; sideMinutes: number; totalMinutes: number }> = {
  C60: { label: 'C-60 (30 min / Side)', sideMinutes: 30, totalMinutes: 60 },
  C90: { label: 'C-90 (45 min / Side)', sideMinutes: 45, totalMinutes: 90 },
};

const SHELL_STYLES: Record<TapeColor, { bg: string; border: string; labelBg: string; text: string }> = {
  black: { bg: '#101114', border: '#2a2d35', labelBg: '#ede8d0', text: '#18181b' },
  smoke: { bg: 'rgba(28, 30, 36, 0.92)', border: '#3f4452', labelBg: '#fef3c7', text: '#292524' },
  clear: { bg: 'rgba(40, 44, 52, 0.65)', border: '#64748b', labelBg: '#f8fafc', text: '#0f172a' },
  yellow: { bg: '#ca8a04', border: '#eab308', labelBg: '#fef08a', text: '#713f12' },
  white: { bg: '#e2e8f0', border: '#cbd5e1', labelBg: '#ffffff', text: '#0f172a' },
};

export const MixtapeModal: React.FC<MixtapeModalProps> = ({ isOpen, onClose }) => {
  const { queue, activeArchive, playTrack, reorderQueue } = usePlayer();

  const [title, setTitle] = useState('NIGHT CALL // MIXTAPE 01');
  const [curator, setCurator] = useState('SHONO ARCHIVIST');
  const [format, setFormat] = useState<TapeFormat>('C60');
  const [shellColor, setShellColor] = useState<TapeColor>('black');
  const [activeSide, setActiveSide] = useState<'A' | 'B'>('A');

  const [sideATracks, setSideATracks] = useState<Track[]>(() => {
    return activeArchive ? activeArchive.tracks.slice(0, 5) : queue.slice(0, 5);
  });
  const [sideBTracks, setSideBTracks] = useState<Track[]>(() => {
    return activeArchive ? activeArchive.tracks.slice(5, 10) : queue.slice(5, 10);
  });

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isFlipping, setIsFlipping] = useState(false);

  if (!isOpen) return null;

  const currentSideTracks = activeSide === 'A' ? sideATracks : sideBTracks;
  const currentSideDuration = currentSideTracks.reduce((sum, t) => sum + (t.duration || 180), 0);
  const maxSideDuration = TAPE_LENGTHS[format].sideMinutes * 60;
  const remainingSideSeconds = Math.max(0, maxSideDuration - currentSideDuration);
  const isOverfilled = currentSideDuration > maxSideDuration;

  const formatMinSec = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = Math.floor(totalSeconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleFlipTape = () => {
    setIsFlipping(true);
    setTimeout(() => {
      setActiveSide((prev) => (prev === 'A' ? 'B' : 'A'));
      setIsFlipping(false);
    }, 280);
  };

  const handleRemoveTrack = (index: number) => {
    if (activeSide === 'A') {
      setSideATracks((prev) => prev.filter((_, i) => i !== index));
    } else {
      setSideBTracks((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const handleAddFromQueue = () => {
    if (queue.length === 0) return;
    const trackToAdd = queue[0];
    if (activeSide === 'A') {
      setSideATracks((prev) => [...prev, trackToAdd]);
    } else {
      setSideBTracks((prev) => [...prev, trackToAdd]);
    }
  };

  const handlePlaySide = () => {
    const tracksToPlay = activeSide === 'A' ? sideATracks : sideBTracks;
    if (tracksToPlay.length > 0) {
      reorderQueue(tracksToPlay);
      playTrack(tracksToPlay[0]);
      onClose();
    }
  };

  const handleSaveToArchives = () => {
    const combinedTracks = [
      ...sideATracks.map((t, idx) => ({ ...t, index: idx + 1 })),
      ...sideBTracks.map((t, idx) => ({ ...t, index: sideATracks.length + idx + 1 })),
    ];

    if (combinedTracks.length === 0) return;

    const totalDurSec = combinedTracks.reduce((sum, t) => sum + (t.duration || 180), 0);

    const newArchive = {
      id: `mixtape-${Date.now()}`,
      indexNumber: 'TAP',
      title: `${title} (${format})`,
      curator: curator || 'Cassette Master',
      tracks: combinedTracks,
      totalDurationFormatted: formatMinSec(totalDurSec),
      importedDate: new Date().toISOString().split('T')[0],
      description: `Virtual Cassette ${format} Master Tape. Side A: ${sideATracks.length} tracks, Side B: ${sideBTracks.length} tracks.`,
    };

    storage.addArchive(newArchive);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2200);
  };

  const shell = SHELL_STYLES[shellColor];

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(16px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '920px',
          maxWidth: '96vw',
          maxHeight: '94vh',
          background: '#0d0f14',
          border: '1px solid rgba(255, 255, 255, 0.14)',
          borderRadius: '16px',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 24px 60px rgba(0,0,0,0.85)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px 24px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(255, 255, 255, 0.02)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Disc size={18} color="var(--accent-color)" />
            <h2 style={{ fontSize: '15px', fontWeight: 700, letterSpacing: '0.04em', margin: 0, color: '#fff' }}>
              VIRTUAL MIXTAPE / CASSETTE DECK
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '4px',
              borderRadius: '6px',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body: Left Cassette Chassis Preview, Right Side Management */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', flex: 1, minHeight: 0, overflow: 'hidden' }}>
          {/* Left Column: Visual Cassette Preview */}
          <div
            style={{
              padding: '28px',
              background: '#07080a',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              borderRight: '1px solid rgba(255, 255, 255, 0.08)',
              overflowY: 'auto',
            }}
          >
            {/* 3D Cassette Shell Wrapper */}
            <div
              style={{
                width: '380px',
                height: '240px',
                background: shell.bg,
                border: `3px solid ${shell.border}`,
                borderRadius: '14px',
                position: 'relative',
                boxShadow: '0 16px 40px rgba(0,0,0,0.8), inset 0 0 15px rgba(0,0,0,0.5)',
                display: 'flex',
                flexDirection: 'column',
                padding: '14px',
                boxSizing: 'border-box',
                transform: isFlipping ? 'rotateY(90deg)' : 'rotateY(0deg)',
                transition: 'transform 0.28s ease',
              }}
            >
              {/* Top Notch Screws */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#475569' }} />
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#475569' }} />
              </div>

              {/* J-Card Printed Spine / Label */}
              <div
                style={{
                  background: shell.labelBg,
                  color: shell.text,
                  borderRadius: '6px',
                  padding: '10px 14px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px', fontWeight: 900, fontFamily: 'monospace' }}>
                    SIDE {activeSide} // {format}
                  </span>
                  <span style={{ fontSize: '9px', fontWeight: 700, fontFamily: 'monospace', letterSpacing: '0.05em' }}>
                    CrO2 • TYPE II
                  </span>
                </div>
                <div style={{ fontSize: '13px', fontWeight: 800, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {title}
                </div>
                <div style={{ fontSize: '10px', opacity: 0.8, fontFamily: 'monospace' }}>
                  BY: {curator}
                </div>
              </div>

              {/* Central Dual Reel Window */}
              <div
                style={{
                  margin: 'auto 0',
                  height: '82px',
                  background: '#090a0d',
                  borderRadius: '8px',
                  border: '2px solid rgba(255, 255, 255, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0 24px',
                  position: 'relative',
                }}
              >
                {/* Spooled Magnetic Tape Ribbon */}
                <div
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '52px',
                    right: '52px',
                    height: '24px',
                    background: '#1a140f',
                    transform: 'translateY(-50%)',
                    zIndex: 1,
                  }}
                />

                {/* Left Reel Hub */}
                <div
                  style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '50%',
                    background: '#ffffff',
                    border: '4px solid #94a3b8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    zIndex: 2,
                    boxShadow: '0 0 10px rgba(0,0,0,0.6)',
                  }}
                >
                  <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: '#090a0d' }} />
                </div>

                {/* Tape Window Scale */}
                <div style={{ zIndex: 2, fontFamily: 'monospace', fontSize: '9px', color: '#94a3b8', letterSpacing: '0.1em' }}>
                  100 • 50 • 0
                </div>

                {/* Right Reel Hub */}
                <div
                  style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '50%',
                    background: '#ffffff',
                    border: '4px solid #94a3b8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    zIndex: 2,
                    boxShadow: '0 0 10px rgba(0,0,0,0.6)',
                  }}
                >
                  <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: '#090a0d' }} />
                </div>
              </div>

              {/* Bottom Trapezoid Guide Area */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '8px', fontFamily: 'monospace', color: '#64748b' }}>
                  NR [DOLBY B-C]
                </span>
                <span style={{ fontSize: '8px', fontFamily: 'monospace', color: '#64748b' }}>
                  MASTER AUDIO CASSETTE
                </span>
              </div>
            </div>

            {/* Flip Tape Control & Color Chooser */}
            <div style={{ display: 'flex', gap: '12px', marginTop: '20px', alignItems: 'center' }}>
              <button
                type="button"
                onClick={handleFlipTape}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '7px 14px',
                  borderRadius: '8px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#fff',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                <RotateCw size={13} />
                <span>FLIP TO SIDE {activeSide === 'A' ? 'B' : 'A'}</span>
              </button>

              {/* Shell Color Dots */}
              <div style={{ display: 'flex', gap: '6px' }}>
                {(['black', 'smoke', 'clear', 'yellow', 'white'] as TapeColor[]).map((c) => (
                  <div
                    key={c}
                    onClick={() => setShellColor(c)}
                    style={{
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      background: SHELL_STYLES[c].bg,
                      border: shellColor === c ? '2px solid var(--accent-color)' : '1px solid rgba(255,255,255,0.2)',
                      cursor: 'pointer',
                    }}
                    title={`Shell Color: ${c}`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Track Sequencing & Duration */}
          <div
            style={{
              padding: '20px 24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
              overflowY: 'auto',
            }}
          >
            {/* Title & Curator & Format Config */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 100px', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '10px', fontFamily: 'monospace', color: 'var(--text-muted)' }}>
                  TAPE TITLE
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '6px',
                    padding: '6px 10px',
                    color: '#fff',
                    fontSize: '12px',
                    marginTop: '4px',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '10px', fontFamily: 'monospace', color: 'var(--text-muted)' }}>
                  CURATOR
                </label>
                <input
                  type="text"
                  value={curator}
                  onChange={(e) => setCurator(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '6px',
                    padding: '6px 10px',
                    color: '#fff',
                    fontSize: '12px',
                    marginTop: '4px',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '10px', fontFamily: 'monospace', color: 'var(--text-muted)' }}>
                  FORMAT
                </label>
                <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                  {(['C60', 'C90'] as TapeFormat[]).map((fmt) => (
                    <button
                      key={fmt}
                      onClick={() => setFormat(fmt)}
                      style={{
                        flex: 1,
                        padding: '6px 8px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        border: format === fmt ? '1px solid var(--accent-color)' : '1px solid rgba(255, 255, 255, 0.1)',
                        background: format === fmt ? 'var(--accent-subtle)' : 'rgba(255, 255, 255, 0.04)',
                        color: format === fmt ? '#fff' : 'var(--text-secondary)',
                      }}
                    >
                      {fmt}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Side A / Side B Indicator Bar */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 12px',
                borderRadius: '8px',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <div>
                <div style={{ fontSize: '11px', fontWeight: 800, color: '#fff' }}>
                  SIDE {activeSide} // {currentSideTracks.length} TRACKS
                </div>
                <div style={{ fontSize: '10px', fontFamily: 'monospace', color: isOverfilled ? '#ef4444' : 'var(--text-muted)' }}>
                  {formatMinSec(currentSideDuration)} / {TAPE_LENGTHS[format].sideMinutes}:00 &bull;{' '}
                  {isOverfilled ? `EXCEEDED BY ${formatMinSec(currentSideDuration - maxSideDuration)}` : `${formatMinSec(remainingSideSeconds)} REMAINING`}
                </div>
              </div>

              <button
                type="button"
                onClick={handleAddFromQueue}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#fff',
                  fontSize: '10.5px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <Plus size={12} />
                <span>Add from Queue</span>
              </button>
            </div>

            {/* Side Tracks List */}
            <div
              style={{
                flex: 1,
                minHeight: '140px',
                maxHeight: '200px',
                overflowY: 'auto',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '8px',
                background: 'rgba(0, 0, 0, 0.3)',
                padding: '4px',
              }}
            >
              {currentSideTracks.length === 0 ? (
                <div style={{ padding: '20px', fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center' }}>
                  Side {activeSide} is empty. Add songs from your current queue or archive.
                </div>
              ) : (
                currentSideTracks.map((t, idx) => (
                  <div
                    key={`${t.id}-${idx}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '6px 10px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      background: 'rgba(255, 255, 255, 0.03)',
                      marginBottom: '3px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                      <span style={{ fontFamily: 'monospace', color: 'var(--text-muted)' }}>
                        {(idx + 1).toString().padStart(2, '0')}
                      </span>
                      <span style={{ fontWeight: 600, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {t.title}
                      </span>
                      <span style={{ color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        &bull; {t.artist}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontFamily: 'monospace', color: 'var(--text-muted)', fontSize: '10px' }}>
                        {t.durationFormatted || formatMinSec(t.duration || 180)}
                      </span>
                      <button
                        onClick={() => handleRemoveTrack(idx)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: '#ef4444',
                          cursor: 'pointer',
                          padding: '2px',
                        }}
                        title="Remove from tape"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Action Buttons: Play Side & Save to Vault */}
            <div style={{ display: 'flex', gap: '10px', marginTop: 'auto', paddingTop: '10px' }}>
              <button
                type="button"
                onClick={handlePlaySide}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#fff',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <Play size={14} fill="currentColor" />
                <span>Play Side {activeSide}</span>
              </button>

              <button
                type="button"
                onClick={handleSaveToArchives}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  background: savedSuccess ? '#22c55e' : 'var(--accent-color)',
                  border: 'none',
                  color: '#000',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'background 0.2s ease',
                }}
              >
                {savedSuccess ? <Check size={14} /> : <Save size={14} />}
                <span>{savedSuccess ? 'Tape Saved!' : 'Save Cassette to Vault'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
