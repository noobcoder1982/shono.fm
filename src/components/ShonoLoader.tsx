import React, { useEffect, useState, useRef } from 'react';
import './ShonoLoader.css';
import { sfx } from '../services/sfxService';
import { defaultQuotes } from '../data/quotes';
import monogramMaskUrl from '../assets/sh_monogram_solid.png';
import monogramPngUrl from '../assets/sh_monogram.png';

export type ShonoLoaderVariant = 'default' | 'compact' | 'fullscreen' | 'button';
export type ShonoLoaderMode = 'typographic' | 'monogram';

export interface ShonoLoaderProps {
  /** Mode: 'typographic' (Scholar font) or 'monogram' ('sh' graphic). Defaults to 'typographic' */
  mode?: ShonoLoaderMode;
  /** Custom logo text for typographic mode. Defaults to 'SHONO' */
  logoText?: string;
  /** Whether to show '.FM' tag alongside the typographic logo */
  showSuffix?: boolean;
  /** Variant of the loader: 'default' | 'compact' | 'fullscreen' | 'button' */
  variant?: ShonoLoaderVariant;
  /** Explicit font size (e.g. 64 or '54px') or monogram size */
  size?: number | string;
  /** Status subtitle displayed beneath the logo */
  subtitle?: string;
  /** Progress percentage (0 - 100). Smoothly animated bar */
  progress?: number;
  /** Whether to display the longer progress bar (automatically true if progress is set) */
  showProgressBar?: boolean;
  /** Trigger fly-up exit transition */
  isExiting?: boolean;
  /** Callback fired after the fly-up exit transition completes (650ms) */
  onExited?: () => void;
  /** Whether to play a click sound when progress reaches 100% (default: true) */
  playClickOnComplete?: boolean;
  /** Which click sound to use ('hitech-click' | 'camera-click' | 'mouse-click' | 'flick') */
  clickSoundType?: 'hitech-click' | 'camera-click' | 'mouse-click' | 'flick';
  /** Whether to play a subtle woosh sound as the loader flies up (default: true) */
  playWooshOnExit?: boolean;
  /** Sheen cycle duration in seconds (default: 2.1) */
  duration?: number;
  /** Additional CSS class names */
  className?: string;
  /** Inline CSS overrides */
  style?: React.CSSProperties;
  /** Custom background color (default: #0A0A0A) */
  backgroundColor?: string;
  /** Optional quote to display in fullscreen typographic mode */
  quote?: string;
}

export const ShonoLoader: React.FC<ShonoLoaderProps> = ({
  mode = 'typographic',
  logoText: _logoText = 'SHONO',
  showSuffix: _showSuffix = true,
  variant = 'default',
  size,
  subtitle,
  progress,
  showProgressBar,
  isExiting = false,
  onExited,
  playClickOnComplete = true,
  clickSoundType = 'hitech-click',
  playWooshOnExit = true,
  duration = 2.1,
  className = '',
  style,
  backgroundColor,
  quote,
}) => {
  const [internalExiting, setInternalExiting] = useState(isExiting);
  const [isCompletedFlash, setIsCompletedFlash] = useState(false);
  const [randomQuote, setRandomQuote] = useState('');
  
  useEffect(() => {
    if (!quote && variant === 'fullscreen') {
      const q = defaultQuotes[Math.floor(Math.random() * defaultQuotes.length)];
      setRandomQuote(q);
    }
  }, [quote, variant]);
  const exitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasPlayedClickRef = useRef(false);

  // Sound feedback when reaching 100% progress
  useEffect(() => {
    if (progress !== undefined && progress >= 100 && !hasPlayedClickRef.current) {
      hasPlayedClickRef.current = true;
      setIsCompletedFlash(true);
      if (playClickOnComplete) {
        sfx.play(clickSoundType, 0.65);
      }
      setTimeout(() => setIsCompletedFlash(false), 200);
    } else if (progress !== undefined && progress < 100) {
      hasPlayedClickRef.current = false;
    }
  }, [progress, playClickOnComplete, clickSoundType]);

  // Synchronize fly-up exit animation & callback
  useEffect(() => {
    if (isExiting) {
      setInternalExiting(true);
      if (playWooshOnExit) {
        sfx.play('woosh', 0.35);
      }
      if (exitTimerRef.current) clearTimeout(exitTimerRef.current);
      exitTimerRef.current = setTimeout(() => {
        onExited?.();
      }, 650);
    } else {
      setInternalExiting(false);
    }

    return () => {
      if (exitTimerRef.current) clearTimeout(exitTimerRef.current);
    };
  }, [isExiting, onExited, playWooshOnExit]);

  // Resolve typographic font size
  const resolvedFontSize = typeof size === 'number'
    ? `${size}px`
    : typeof size === 'string'
      ? size
      : variant === 'fullscreen'
        ? '64px'
        : variant === 'compact'
          ? '20px'
          : variant === 'button'
            ? '14px'
            : '46px';

  const rootStyle: React.CSSProperties = {
    ...style,
    ...(backgroundColor ? { '--shono-loader-bg': backgroundColor } as React.CSSProperties : {}),
    '--shono-loader-sheen-duration': `${duration}s`,
    '--shono-mask-url': `url("${monogramMaskUrl}")`,
  } as React.CSSProperties;

  const shouldShowProgress = showProgressBar || progress !== undefined;
  const isFullscreen = variant === 'fullscreen';
  const defaultSubtitle = isFullscreen
    ? (subtitle || 'DIGITAL SOUND ARCHIVE')
    : subtitle;

  // Typographic Logo renderer (Smooth Text Progression)
  const renderTypographicLogo = () => {
    const textContent = (
      <>
        SHONO<span style={{ margin: '0 14px', position: 'relative', top: '-2px' }}>.</span>FM
      </>
    );

    return (
      <div className="shono-smooth-loader-wrap">
        <div 
          className="shono-smooth-text-container" 
          style={{ '--progress-pct': `${progress !== undefined ? Math.max(0, Math.min(100, progress)) : 50}%`, fontSize: resolvedFontSize } as React.CSSProperties}
        >
          <div className="shono-smooth-text-dim">{textContent}</div>
          <div className="shono-smooth-text-fill">{textContent}</div>
        </div>
      
      {variant === 'fullscreen' && (quote || randomQuote) && (
        <div className="shono-loader-quote-text">
          {quote || randomQuote}
        </div>
      )}
    </div>
  );
  };

  // Monogram renderer fallback
  const renderMonogram = () => {
    const monoWidth = typeof size === 'number' ? size : variant === 'compact' ? 30 : 80;
    const monoHeight = Math.round(monoWidth / (484 / 402));

    return (
      <div
        className="shono-loader-monogram-stage"
        style={{ width: `${monoWidth}px`, height: `${monoHeight}px` }}
      >
        <div
          className="shono-loader-ambient-shadow"
          style={{ backgroundImage: `url("${monogramPngUrl}")` }}
        />
        <div className="shono-loader-bloom-glow" />
        <div className="shono-loader-monogram-body">
          <div className="shono-loader-metal-base" />
          <div className="shono-loader-bevel-rim" />
          <div className="shono-loader-sheen-track" />
        </div>
      </div>
    );
  };

  // Button Variant
  if (variant === 'button') {
    return (
      <span
        className={`shono-loader-root variant-button ${internalExiting ? 'is-flying-up' : ''} ${className}`}
        style={rootStyle}
        role="status"
        aria-live="polite"
      >
        {mode === 'typographic' ? renderTypographicLogo() : renderMonogram()}
        {subtitle && <span className="shono-loader-btn-label">{subtitle}</span>}
      </span>
    );
  }

  // Compact Variant
  if (variant === 'compact') {
    return (
      <div
        className={`shono-loader-root variant-compact ${internalExiting ? 'is-flying-up' : ''} ${className}`}
        style={rootStyle}
        role="status"
        aria-live="polite"
      >
        {mode === 'typographic' ? renderTypographicLogo() : renderMonogram()}
        {subtitle && <span className="shono-loader-compact-label">{subtitle}</span>}
      </div>
    );
  }

  // Fullscreen and Default Variants
  return (
    <div
      className={`shono-loader-root variant-${variant} ${internalExiting ? 'is-flying-up' : ''} ${className}`}
      style={rootStyle}
      role="status"
      aria-live="polite"
    >
      {mode === 'typographic' ? renderTypographicLogo() : renderMonogram()}

      {/* Status & Longer Progress Bar (Only for Monogram mode or non-fullscreen) */}
      {(defaultSubtitle || shouldShowProgress) && mode === 'monogram' && (
        <div className="shono-loader-meta">
          {defaultSubtitle && (
            <p className="shono-loader-subtitle">{defaultSubtitle}</p>
          )}

          {shouldShowProgress && (
            <div className={`shono-loader-progress-track ${isCompletedFlash ? 'is-completed' : ''}`}>
              <div
                className="shono-loader-progress-fill"
                style={{
                  width: progress !== undefined ? `${Math.min(100, Math.max(0, progress))}%` : '50%',
                }}
              >
                <div className="shono-loader-progress-spark" />
              </div>
            </div>
          )}

          {progress !== undefined && (
            <span className="shono-loader-pct-badge">
              {Math.round(Math.min(100, Math.max(0, progress)))}%
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default ShonoLoader;
