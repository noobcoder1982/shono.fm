import React, { useState, useEffect, useCallback } from 'react';
import { Search, FolderPlus, Sliders, Zap, X, ChevronRight, ChevronLeft, Check } from 'lucide-react';

interface TutorialStep {
  targetSelector: string;
  title: string;
  description: string;
  iconName: 'search' | 'archives' | 'equalizer' | 'player';
  position: 'bottom' | 'right' | 'top';
}

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    targetSelector: '[data-tutorial="search"], .ingestion-console',
    title: 'SEARCH & PLAYLIST IMPORTER',
    description: 'Search any track or artist, or paste a YouTube / YouTube Music playlist URL to immediately import music into your local library.',
    iconName: 'search',
    position: 'bottom',
  },
  {
    targetSelector: '[data-tutorial="archives"], .sidebar-nav',
    title: 'HOME & ADDED PLAYLISTS',
    description: 'Browse your music collection and playlists with a single click. Manage your favorites and custom archives stored locally on your device.',
    iconName: 'archives',
    position: 'right',
  },
  {
    targetSelector: '[data-tutorial="equalizer"], #tutorial-step-eq, .bma-sidebar',
    title: 'ACTIVE HARDWARE EQUALIZER',
    description: 'Hardware-accelerated Web Audio DSP. Switch between 6 studio presets: Flat, Bass, Bass+, Jazz, Vocal, and Rock with real-time frequency curve visualizer.',
    iconName: 'equalizer',
    position: 'right',
  },
  {
    targetSelector: '[data-tutorial="player"], .persistent-player-bottom',
    title: 'IMMERSIVE AUDIO & FULLSCREEN',
    description: 'Zero ads, dynamic coverart ambiance, and animated fullscreen player with synchronized lyrics. Access keyboard shortcuts anytime with ⌘ / ?.',
    iconName: 'player',
    position: 'top',
  },
];

export const startTutorial = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('shono:start-tutorial'));
  }
};

export const TutorialOverlay: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [spotlightRect, setSpotlightRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    const hasSeen = localStorage.getItem('shono_tutorial_completed');
    if (!hasSeen) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 1200);
      return () => clearTimeout(timer);
    }

    const handleManualStart = () => {
      setCurrentStep(0);
      setIsOpen(true);
    };

    window.addEventListener('shono:start-tutorial', handleManualStart);
    return () => window.removeEventListener('shono:start-tutorial', handleManualStart);
  }, []);

  const updateRect = useCallback(() => {
    if (!isOpen) return;
    const step = TUTORIAL_STEPS[currentStep];
    if (!step) return;

    const el = document.querySelector(step.targetSelector);
    if (el) {
      const rect = el.getBoundingClientRect();
      setSpotlightRect(rect);
    } else {
      setSpotlightRect(null);
    }
  }, [isOpen, currentStep]);

  useEffect(() => {
    updateRect();
    window.addEventListener('resize', updateRect);
    window.addEventListener('scroll', updateRect, true);
    return () => {
      window.removeEventListener('resize', updateRect);
      window.removeEventListener('scroll', updateRect, true);
    };
  }, [updateRect]);

  if (!isOpen) return null;

  const handleNext = () => {
    if (currentStep < TUTORIAL_STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleComplete = () => {
    localStorage.setItem('shono_tutorial_completed', 'true');
    setIsOpen(false);
  };

  const step = TUTORIAL_STEPS[currentStep];

  let tooltipStyle: React.CSSProperties = {
    position: 'fixed',
    zIndex: 10001,
    width: '360px',
    maxWidth: '92vw',
  };

  if (spotlightRect) {
    if (step.position === 'bottom') {
      tooltipStyle.top = `${Math.min(window.innerHeight - 260, spotlightRect.bottom + 16)}px`;
      tooltipStyle.left = `${Math.max(20, Math.min(window.innerWidth - 380, spotlightRect.left + 20))}px`;
    } else if (step.position === 'right') {
      tooltipStyle.top = `${Math.max(20, Math.min(window.innerHeight - 260, spotlightRect.top))}px`;
      tooltipStyle.left = `${Math.min(window.innerWidth - 380, spotlightRect.right + 20)}px`;
    } else if (step.position === 'top') {
      tooltipStyle.bottom = `${Math.max(20, window.innerHeight - spotlightRect.top + 16)}px`;
      tooltipStyle.left = `${Math.max(20, Math.min(window.innerWidth - 380, spotlightRect.left + 40))}px`;
    }
  } else {
    tooltipStyle.top = '50%';
    tooltipStyle.left = '50%';
    tooltipStyle.transform = 'translate(-50%, -50%)';
  }

  const pad = 8;

  // Compute curved arrow geometry pointing from tooltip card to target element
  let arrowPath = '';
  let targetPoint = { x: 0, y: 0 };
  let showArrow = false;

  if (spotlightRect) {
    showArrow = true;
    const cardH = 220;

    let cardX = 0;
    let cardY = 0;
    if (step.position === 'bottom') {
      cardY = Math.min(window.innerHeight - 260, spotlightRect.bottom + 16);
      cardX = Math.max(20, Math.min(window.innerWidth - 380, spotlightRect.left + 20));
      // Arrow starts from top of card, arches up to bottom edge of spotlight
      const startX = cardX + 70;
      const startY = cardY;
      const endX = spotlightRect.left + Math.min(100, Math.max(20, spotlightRect.width / 2));
      const endY = spotlightRect.bottom + pad + 2;
      const ctrlX = (startX + endX) / 2 - 35;
      const ctrlY = (startY + endY) / 2;
      arrowPath = `M ${startX} ${startY} Q ${ctrlX} ${ctrlY} ${endX} ${endY}`;
      targetPoint = { x: endX, y: endY };
    } else if (step.position === 'right') {
      cardY = Math.max(20, Math.min(window.innerHeight - 260, spotlightRect.top));
      cardX = Math.min(window.innerWidth - 380, spotlightRect.right + 20);
      // Arrow starts from left edge of card, arches to right edge of spotlight
      const startX = cardX;
      const startY = cardY + 50;
      const endX = spotlightRect.right + pad + 2;
      const endY = spotlightRect.top + Math.min(60, Math.max(20, spotlightRect.height / 2));
      const ctrlX = (startX + endX) / 2;
      const ctrlY = (startY + endY) / 2 - 25;
      arrowPath = `M ${startX} ${startY} Q ${ctrlX} ${ctrlY} ${endX} ${endY}`;
      targetPoint = { x: endX, y: endY };
    } else if (step.position === 'top') {
      const btm = Math.max(20, window.innerHeight - spotlightRect.top + 16);
      cardY = window.innerHeight - btm - cardH;
      cardX = Math.max(20, Math.min(window.innerWidth - 380, spotlightRect.left + 40));
      // Arrow starts from bottom edge of card, arches down to top edge of spotlight
      const startX = cardX + 80;
      const startY = cardY + cardH;
      const endX = spotlightRect.left + Math.min(120, Math.max(20, spotlightRect.width / 2));
      const endY = spotlightRect.top - pad - 2;
      const ctrlX = (startX + endX) / 2 + 30;
      const ctrlY = (startY + endY) / 2;
      arrowPath = `M ${startX} ${startY} Q ${ctrlX} ${ctrlY} ${endX} ${endY}`;
      targetPoint = { x: endX, y: endY };
    }
  }

  const renderIcon = () => {
    switch (step.iconName) {
      case 'search':
        return <Search size={18} color="var(--accent-color)" />;
      case 'archives':
        return <FolderPlus size={18} color="var(--accent-color)" />;
      case 'equalizer':
        return <Sliders size={18} color="var(--accent-color)" />;
      case 'player':
        return <Zap size={18} color="var(--accent-color)" />;
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10000,
        pointerEvents: 'auto',
      }}
    >
      {/* SVG Mask Spotlight & Animated Curved Arrow */}
      <svg
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
        }}
      >
        <defs>
          <mask id="tutorial-spotlight-mask">
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            {spotlightRect && (
              <rect
                x={spotlightRect.left - pad}
                y={spotlightRect.top - pad}
                width={spotlightRect.width + pad * 2}
                height={spotlightRect.height + pad * 2}
                rx="8"
                ry="8"
                fill="black"
              />
            )}
          </mask>
          <marker
            id="tutorial-arrowhead"
            markerWidth="8"
            markerHeight="8"
            refX="6"
            refY="4"
            orient="auto"
          >
            <polygon points="0 1, 8 4, 0 7" fill="var(--accent-color, #eab308)" />
          </marker>
        </defs>
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="rgba(5, 5, 8, 0.78)"
          mask="url(#tutorial-spotlight-mask)"
        />

        {/* Animated Curved Arrow with Glowing Tip */}
        {showArrow && arrowPath && (
          <g key={`arrow-${currentStep}`}>
            <path
              d={arrowPath}
              fill="none"
              stroke="var(--accent-color, #eab308)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeDasharray="400"
              style={{
                filter: 'drop-shadow(0 0 8px rgba(234, 179, 8, 0.7))',
                animation: 'drawArrowPath 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
              }}
              markerEnd="url(#tutorial-arrowhead)"
            />
            {/* Target Pulse Dot */}
            <circle
              cx={targetPoint.x}
              cy={targetPoint.y}
              r="4.5"
              fill="var(--accent-color, #eab308)"
              style={{
                filter: 'drop-shadow(0 0 10px var(--accent-color, #eab308))',
                animation: 'pulseGlowDot 1.5s ease-in-out infinite',
              }}
            />
          </g>
        )}
      </svg>

      {/* Spotlight Border Glow */}
      {spotlightRect && (
        <div
          style={{
            position: 'fixed',
            left: `${spotlightRect.left - pad}px`,
            top: `${spotlightRect.top - pad}px`,
            width: `${spotlightRect.width + pad * 2}px`,
            height: `${spotlightRect.height + pad * 2}px`,
            borderRadius: '8px',
            border: '2px solid var(--accent-color)',
            boxShadow: '0 0 20px rgba(255, 199, 44, 0.35), inset 0 0 12px rgba(255, 199, 44, 0.15)',
            pointerEvents: 'none',
            transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        />
      )}

      {/* Tooltip Card */}
      <div
        style={{
          ...tooltipStyle,
          background: 'var(--bg-secondary)',
          border: '1px solid var(--accent-color)',
          borderRadius: '8px',
          padding: '20px',
          boxShadow: '0 16px 40px rgba(0, 0, 0, 0.8), 0 0 24px rgba(255, 199, 44, 0.12)',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
          transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Card Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '9.5px',
                fontWeight: 700,
                color: 'var(--accent-color)',
                letterSpacing: '0.1em',
                background: 'rgba(255, 199, 44, 0.12)',
                padding: '2px 8px',
                borderRadius: '4px',
                border: '1px solid rgba(255, 199, 44, 0.3)',
              }}
            >
              STEP {currentStep + 1} OF {TUTORIAL_STEPS.length}
            </span>
          </div>

          <button
            onClick={handleComplete}
            title="Skip tour"
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontFamily: 'var(--font-mono)',
              fontSize: '10px',
              padding: '2px 6px',
            }}
          >
            <span>Skip</span>
            <X size={12} />
          </button>
        </div>

        {/* Content */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            {renderIcon()}
            <h3
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '15px',
                fontWeight: 700,
                letterSpacing: '0.02em',
                color: 'var(--text-primary)',
                margin: 0,
              }}
            >
              {step.title}
            </h3>
          </div>
          <p
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '12.5px',
              color: 'var(--text-secondary)',
              lineHeight: 1.5,
              margin: 0,
            }}
          >
            {step.description}
          </p>
        </div>

        {/* Navigation & Progress Dots */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: '6px',
            borderTop: '1px solid var(--border-color)',
          }}
        >
          {/* Progress dots */}
          <div style={{ display: 'flex', gap: '6px' }}>
            {TUTORIAL_STEPS.map((_, idx) => (
              <span
                key={idx}
                style={{
                  width: idx === currentStep ? '16px' : '6px',
                  height: '6px',
                  borderRadius: '3px',
                  background: idx === currentStep ? 'var(--accent-color)' : 'var(--border-bright)',
                  transition: 'all 0.2s ease',
                  display: 'inline-block',
                }}
              />
            ))}
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: '8px' }}>
            {currentStep > 0 && (
              <button
                onClick={handlePrev}
                className="bma-btn"
                style={{
                  padding: '6px 12px',
                  fontSize: '10.5px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <ChevronLeft size={12} />
                <span>Back</span>
              </button>
            )}

            <button
              onClick={handleNext}
              className="bma-btn bma-btn-primary"
              style={{
                padding: '6px 14px',
                fontSize: '10.5px',
                fontWeight: 700,
                background: 'var(--accent-color)',
                color: 'var(--bg-primary)',
                borderColor: 'var(--accent-color)',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              {currentStep < TUTORIAL_STEPS.length - 1 ? (
                <>
                  <span>Next</span>
                  <ChevronRight size={12} />
                </>
              ) : (
                <>
                  <span>Get Started</span>
                  <Check size={12} />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
