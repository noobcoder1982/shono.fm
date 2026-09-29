import React, { useState } from 'react';
import { X, Play, RotateCcw, Layers, Sliders, CheckCircle2, Volume2 } from 'lucide-react';
import { ShonoLoader, type ShonoLoaderMode } from './ShonoLoader';
import { sfx } from '../services/sfxService';
import './ShonoLoaderPrototypeModal.css';

interface ShonoLoaderPrototypeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShonoLoaderPrototypeModal: React.FC<ShonoLoaderPrototypeModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [mode, setMode] = useState<ShonoLoaderMode>('typographic');
  const [buttonLoading, setButtonLoading] = useState<boolean>(true);
  const [buttonSuccess, setButtonSuccess] = useState<boolean>(false);
  const [customProgress, setCustomProgress] = useState<number>(68);
  const [duration, setDuration] = useState<number>(2.1);
  const [compactStatus, setCompactStatus] = useState<string>('Syncing playlist...');
  const [simulatingRun, setSimulatingRun] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSimulateButtonAction = () => {
    setButtonLoading(true);
    setButtonSuccess(false);
    setTimeout(() => {
      setButtonLoading(false);
      setButtonSuccess(true);
      setTimeout(() => {
        setButtonSuccess(false);
        setButtonLoading(true);
      }, 2000);
    }, 2400);
  };

  const handleReplayStartup = () => {
    onClose();
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('shono:replay-loader'));
    }, 120);
  };

  const handleRunProgressSimulation = () => {
    if (simulatingRun) return;
    setSimulatingRun(true);
    setCustomProgress(0);

    const startTime = performance.now();
    const simDur = 2000;

    const simTick = (now: number) => {
      const elapsed = now - startTime;
      const ratio = Math.min(1, elapsed / simDur);
      const pct = Math.round((1 - Math.pow(1 - ratio, 2.4)) * 100);
      setCustomProgress(pct);

      if (ratio < 1) {
        requestAnimationFrame(simTick);
      } else {
        setSimulatingRun(false);
      }
    };

    requestAnimationFrame(simTick);
  };

  return (
    <div className="shono-prototype-backdrop" onClick={onClose}>
      <div
        className="shono-prototype-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="shono-prototype-title"
      >
        {/* Modal Header */}
        <div className="shono-prototype-header">
          <div className="shono-prototype-header-brand">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="shono-prototype-pill">PROTOTYPE SHOWCASE</span>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '9.5px',
                  background: 'rgba(255,255,255,0.06)',
                  color: '#d4d4dc',
                  padding: '2px 7px',
                  borderRadius: '3px',
                }}
              >
                FONT: SCHOLAR
              </span>
            </div>
            <h2 id="shono-prototype-title">SHONO.FM Typographic Loading Animation</h2>
            <p>
              Typographic logo crafted with the <strong>Scholar</strong> editorial font and metallic studio-light sheen sweep,
              longer smooth progress bar, tactile 100% completion click, and fly-up exit transition.
            </p>
          </div>

          <div className="shono-prototype-header-actions">
            {/* Mode Switcher */}
            <div style={{ display: 'flex', background: '#16171d', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', padding: '2px' }}>
              <button
                className={`shono-proto-sub-btn ${mode === 'typographic' ? 'active' : ''}`}
                style={{
                  background: mode === 'typographic' ? '#ff9500' : 'transparent',
                  color: mode === 'typographic' ? '#000000' : '#888892',
                  fontWeight: mode === 'typographic' ? 700 : 500,
                  border: 'none',
                }}
                onClick={() => setMode('typographic')}
              >
                Typographic (Scholar)
              </button>
              <button
                className={`shono-proto-sub-btn ${mode === 'monogram' ? 'active' : ''}`}
                style={{
                  background: mode === 'monogram' ? '#ff9500' : 'transparent',
                  color: mode === 'monogram' ? '#000000' : '#888892',
                  fontWeight: mode === 'monogram' ? 700 : 500,
                  border: 'none',
                }}
                onClick={() => setMode('monogram')}
              >
                Monogram (sh)
              </button>
            </div>

            <button
              className="shono-prototype-replay-btn"
              onClick={handleReplayStartup}
              title="Test the full-screen startup sequence live in the app"
            >
              <RotateCcw size={14} />
              <span>REPLAY APP STARTUP</span>
            </button>
            <button
              className="shono-prototype-close-btn"
              onClick={onClose}
              aria-label="Close prototype modal"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="shono-prototype-body">
          {/* Section 1: The 4 Core States Grid */}
          <div className="shono-proto-section-title">
            <Layers size={14} />
            <span>01 / CORE LOADER VARIANTS</span>
          </div>

          <div className="shono-proto-grid-4">
            {/* 1. Full Screen Preview */}
            <div className="shono-proto-card">
              <div className="shono-proto-stage dark-bg">
                <ShonoLoader
                  mode={mode}
                  variant="fullscreen"
                  size={mode === 'typographic' ? '44px' : 84}
                  duration={duration}
                  style={{ position: 'relative', width: '100%', height: '100%', minHeight: '180px' }}
                  showSuffix={true}
                  subtitle="DIGITAL SOUND ARCHIVE"
                />
              </div>
              <div className="shono-proto-card-meta">
                <h4>Full Screen Startup Curtain</h4>
                <p>App launch &amp; primary transitions with fly-up exit</p>
              </div>
            </div>

            {/* 2. Default Loader */}
            <div className="shono-proto-card">
              <div className="shono-proto-stage">
                <ShonoLoader
                  mode={mode}
                  variant="default"
                  size={mode === 'typographic' ? '36px' : 64}
                  duration={duration}
                  subtitle="Mounting sound vault..."
                  progress={customProgress}
                  showProgressBar={true}
                />
              </div>
              <div className="shono-proto-card-meta">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h4>Longer Progress Bar</h4>
                  <button
                    className="shono-proto-sub-btn"
                    onClick={handleRunProgressSimulation}
                    disabled={simulatingRun}
                  >
                    {simulatingRun ? 'Simulating...' : 'Simulate 0-100%'}
                  </button>
                </div>
                <p>Continuous progression with tactile 100% click sound</p>
              </div>
            </div>

            {/* 3. Compact Loader */}
            <div className="shono-proto-card">
              <div className="shono-proto-stage">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
                  <ShonoLoader
                    mode={mode}
                    variant="compact"
                    size={mode === 'typographic' ? '18px' : 24}
                    duration={duration}
                    subtitle={compactStatus}
                  />
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      className="shono-proto-sub-btn"
                      onClick={() => setCompactStatus('Syncing...')}
                    >
                      Sync
                    </button>
                    <button
                      className="shono-proto-sub-btn"
                      onClick={() => setCompactStatus('Buffering...')}
                    >
                      Buffer
                    </button>
                    <button
                      className="shono-proto-sub-btn"
                      onClick={() => setCompactStatus('Fetching lyrics...')}
                    >
                      Lyrics
                    </button>
                  </div>
                </div>
              </div>
              <div className="shono-proto-card-meta">
                <h4>Compact Loader</h4>
                <p>Inline status &amp; tight widget loading</p>
              </div>
            </div>

            {/* 4. Button Loading State */}
            <div className="shono-proto-card">
              <div className="shono-proto-stage">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center', width: '100%' }}>
                  <button
                    className={`shono-proto-test-btn ${buttonLoading ? 'is-loading' : ''} ${buttonSuccess ? 'is-success' : ''}`}
                    onClick={handleSimulateButtonAction}
                    disabled={buttonLoading}
                  >
                    {buttonLoading ? (
                      <ShonoLoader
                        mode={mode}
                        variant="button"
                        size={mode === 'typographic' ? '13px' : 18}
                        duration={duration}
                        subtitle="Saving to Vault..."
                      />
                    ) : buttonSuccess ? (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <CheckCircle2 size={15} color="#22c55e" /> Saved
                      </span>
                    ) : (
                      <span>Save Playlist</span>
                    )}
                  </button>

                  <button
                    className="shono-proto-sub-btn"
                    onClick={() => setButtonLoading(!buttonLoading)}
                  >
                    {buttonLoading ? 'Stop Button Loader' : 'Start Button Loader'}
                  </button>
                </div>
              </div>
              <div className="shono-proto-card-meta">
                <h4>Button Loading State</h4>
                <p>Embedded sheen inside interactive buttons</p>
              </div>
            </div>
          </div>

          {/* Section 2: Audio & Tactile SFX */}
          <div className="shono-proto-section-title" style={{ marginTop: '32px' }}>
            <Volume2 size={14} />
            <span>02 / TACTILE SFX SUITE (SFX DIRECTORY)</span>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '24px' }}>
            <button
              className="shono-proto-sub-btn"
              style={{ padding: '8px 14px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '6px' }}
              onClick={() => sfx.play('hitech-click', 0.8)}
            >
              <Volume2 size={12} /> Play Hi-Tech Click (100% Completion)
            </button>
            <button
              className="shono-proto-sub-btn"
              style={{ padding: '8px 14px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '6px' }}
              onClick={() => sfx.play('camera-click', 0.8)}
            >
              <Volume2 size={12} /> Play Camera Click
            </button>
            <button
              className="shono-proto-sub-btn"
              style={{ padding: '8px 14px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '6px' }}
              onClick={() => sfx.play('mouse-click', 0.8)}
            >
              <Volume2 size={12} /> Play Mouse Click
            </button>
            <button
              className="shono-proto-sub-btn"
              style={{ padding: '8px 14px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '6px' }}
              onClick={() => sfx.play('flick', 0.8)}
            >
              <Volume2 size={12} /> Play Flick
            </button>
            <button
              className="shono-proto-sub-btn"
              style={{ padding: '8px 14px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '6px' }}
              onClick={() => sfx.play('woosh', 0.5)}
            >
              <Volume2 size={12} /> Play Woosh (Fly-Up Exit)
            </button>
          </div>

          {/* Section 3: Fine-Tuning Controls */}
          <div className="shono-proto-section-title" style={{ marginTop: '24px' }}>
            <Sliders size={14} />
            <span>03 / LIVE TUNING &amp; PROGRESSION</span>
          </div>

          <div className="shono-proto-controls-row">
            <div className="shono-proto-ctrl-group">
              <label>Sheen Cycle Duration: {duration}s</label>
              <input
                type="range"
                min="1.2"
                max="3.0"
                step="0.1"
                value={duration}
                onChange={(e) => setDuration(parseFloat(e.target.value))}
              />
              <span className="shono-proto-ctrl-hint">Recommended: 1.8s - 2.4s for luxury pacing</span>
            </div>

            <div className="shono-proto-ctrl-group">
              <label>Progress Bar: {customProgress}%</label>
              <input
                type="range"
                min="0"
                max="100"
                value={customProgress}
                onChange={(e) => setCustomProgress(parseInt(e.target.value, 10))}
              />
              <span className="shono-proto-ctrl-hint">Drag to 100% to hear the completion click</span>
            </div>

            <div className="shono-proto-ctrl-group shono-proto-ctrl-action">
              <button
                className="shono-prototype-replay-full-btn"
                onClick={handleReplayStartup}
              >
                <Play size={14} />
                <span>LAUNCH FULL STARTUP &amp; ENTRANCE WAVE</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShonoLoaderPrototypeModal;
