import React, { useState, useEffect } from 'react';
import { ambienceService, type AmbienceChannel, type AmbienceLevels } from '../services/ambienceService';
import { CloudRain, Disc, Coffee, CassetteTape, X, VolumeX } from 'lucide-react';

interface AmbienceDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AmbienceDrawer: React.FC<AmbienceDrawerProps> = ({ isOpen, onClose }) => {
  const [levels, setLevels] = useState<AmbienceLevels>(() => ambienceService.getLevels());

  useEffect(() => {
    const handleUpdate = (e: any) => {
      if (e.detail) setLevels(e.detail);
    };
    window.addEventListener('shono-ambience-updated', handleUpdate);
    return () => window.removeEventListener('shono-ambience-updated', handleUpdate);
  }, []);

  if (!isOpen) return null;

  const handleSliderChange = (channel: AmbienceChannel, val: number) => {
    ambienceService.setChannelVolume(channel, val);
    setLevels((prev) => ({ ...prev, [channel]: val }));
  };

  const handleMuteAll = () => {
    (['rain', 'crackle', 'cafe', 'tape'] as AmbienceChannel[]).forEach((ch) => {
      ambienceService.setChannelVolume(ch, 0);
    });
    setLevels({ rain: 0, crackle: 0, cafe: 0, tape: 0 });
  };

  const channels: {
    id: AmbienceChannel;
    name: string;
    icon: React.ReactNode;
    desc: string;
  }[] = [
    {
      id: 'rain',
      name: 'Rainfall',
      icon: <CloudRain size={16} color="#38bdf8" />,
      desc: 'Procedural soothing rainstorm',
    },
    {
      id: 'crackle',
      name: 'Vinyl Crackle',
      icon: <Disc size={16} color="#f59e0b" />,
      desc: 'Vintage analog dust & needle pops',
    },
    {
      id: 'cafe',
      name: 'Cozy Cafe',
      icon: <Coffee size={16} color="#fb923c" />,
      desc: 'Warm acoustic room atmosphere',
    },
    {
      id: 'tape',
      name: 'Tape Hiss',
      icon: <CassetteTape size={16} color="#a78bfa" />,
      desc: 'Authentic 4-track cassette saturation',
    },
  ];

  const totalActive = Object.values(levels).filter((v) => v > 0).length;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '84px',
        right: '24px',
        width: '320px',
        background: 'rgba(14, 16, 24, 0.94)',
        backdropFilter: 'blur(36px) saturate(200%)',
        WebkitBackdropFilter: 'blur(36px) saturate(200%)',
        border: '1px solid rgba(255, 255, 255, 0.16)',
        borderRadius: '18px',
        boxShadow:
          '0 24px 60px rgba(0, 0, 0, 0.85), inset 0 1px 0 rgba(255, 255, 255, 0.25)',
        zIndex: 1000,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        animation: 'appleFadeInUp 0.22s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '14px 16px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(255, 255, 255, 0.02)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: totalActive > 0 ? '#22c55e' : '#71717a',
              boxShadow: totalActive > 0 ? '0 0 8px #22c55e' : 'none',
            }}
          />
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              fontWeight: 800,
              letterSpacing: '0.08em',
              color: '#ffffff',
            }}
          >
            SOUNDTRACK AMBIENCE
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {totalActive > 0 && (
            <button
              type="button"
              onClick={handleMuteAll}
              title="Mute All Ambience"
              style={{
                background: 'rgba(255, 255, 255, 0.06)',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: '4px 6px',
                borderRadius: '6px',
                fontSize: '10px',
                fontFamily: 'var(--font-mono)',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <VolumeX size={11} />
              <span>MUTE</span>
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '3px',
              borderRadius: '6px',
            }}
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Channel Sliders */}
      <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {channels.map((ch) => {
          const val = levels[ch.id];
          const isActive = val > 0;

          return (
            <div key={ch.id} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    cursor: 'pointer',
                  }}
                  onClick={() => handleSliderChange(ch.id, isActive ? 0 : 50)}
                >
                  {ch.icon}
                  <span
                    style={{
                      fontSize: '12px',
                      fontWeight: 600,
                      color: isActive ? '#ffffff' : 'rgba(255, 255, 255, 0.6)',
                    }}
                  >
                    {ch.name}
                  </span>
                </div>

                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '10px',
                    fontWeight: 700,
                    color: isActive ? 'var(--accent-color, #eab308)' : 'rgba(255, 255, 255, 0.4)',
                  }}
                >
                  {val}%
                </span>
              </div>

              {/* Slider */}
              <input
                type="range"
                min="0"
                max="100"
                value={val}
                onChange={(e) => handleSliderChange(ch.id, Number(e.target.value))}
                style={{
                  width: '100%',
                  height: '4px',
                  borderRadius: '2px',
                  accentColor: 'var(--accent-color, #eab308)',
                  cursor: 'pointer',
                  background: 'rgba(255, 255, 255, 0.12)',
                  outline: 'none',
                }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};
