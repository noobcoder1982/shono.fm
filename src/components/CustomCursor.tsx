import React, { useEffect, useState, useRef } from 'react';
import { storage, type CustomCursorStyle } from '../services/storage';

export const CustomCursor: React.FC = () => {
  const [cursorStyle, setCursorStyle] = useState<CustomCursorStyle>(
    () => storage.getSettings().customCursor || 'none'
  );
  const [isVisible, setIsVisible] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);

  // Position refs for smooth 60fps lerp
  const mousePos = useRef({ x: -100, y: -100 });
  const cursorDotPos = useRef({ x: -100, y: -100 });
  const cursorRingPos = useRef({ x: -100, y: -100 });
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const rafId = useRef<number | null>(null);

  // Listen to cursor settings changes across app
  useEffect(() => {
    const handleSettingsChange = () => {
      const current = storage.getSettings().customCursor || 'none';
      setCursorStyle(current);
    };

    window.addEventListener('shono:settings-updated', handleSettingsChange);
    window.addEventListener('storage', handleSettingsChange);
    return () => {
      window.removeEventListener('shono:settings-updated', handleSettingsChange);
      window.removeEventListener('storage', handleSettingsChange);
    };
  }, []);

  useEffect(() => {
    if (cursorStyle === 'none') {
      document.body.classList.remove('custom-cursor-active');
      if (rafId.current) cancelAnimationFrame(rafId.current);
      return;
    }

    document.body.classList.add('custom-cursor-active');

    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
      if (!isVisible) setIsVisible(true);

      // Check if hovering interactive target
      const target = e.target as HTMLElement | null;
      if (target) {
        const isInteractive = Boolean(
          target.closest('button, a, input, select, textarea, [role="button"], .bma-btn, .col-vault-add-btn, .track-row, .archive-card, .clickable')
        );
        setIsHovering(isInteractive);
      }
    };

    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);
    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    // Smooth animation loop
    const animate = () => {
      // Dot follows directly
      cursorDotPos.current.x = mousePos.current.x;
      cursorDotPos.current.y = mousePos.current.y;

      // Ring follows with smooth damping (lerp)
      const ringLerp = 0.22;
      cursorRingPos.current.x += (mousePos.current.x - cursorRingPos.current.x) * ringLerp;
      cursorRingPos.current.y += (mousePos.current.y - cursorRingPos.current.y) * ringLerp;

      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${cursorDotPos.current.x}px, ${cursorDotPos.current.y}px, 0)`;
      }
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${cursorRingPos.current.x}px, ${cursorRingPos.current.y}px, 0)`;
      }

      rafId.current = requestAnimationFrame(animate);
    };

    rafId.current = requestAnimationFrame(animate);

    return () => {
      document.body.classList.remove('custom-cursor-active');
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [cursorStyle, isVisible]);

  if (cursorStyle === 'none' || !isVisible) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 999999,
        overflow: 'hidden',
      }}
    >
      {/* Laser Center Point (All variants) */}
      <div
        ref={dotRef}
        style={{
          position: 'absolute',
          top: -3,
          left: -3,
          width: 6,
          height: 6,
          borderRadius: '50%',
          backgroundColor: 'var(--accent-color, #ff1e00)',
          boxShadow: '0 0 8px var(--accent-color, #ff1e00)',
          transition: 'transform 0.04s linear, scale 0.15s ease',
          transformOrigin: 'center center',
          scale: isClicking ? '0.7' : isHovering ? '1.4' : '1',
          zIndex: 2,
        }}
      />

      {/* Ring / Halo follower */}
      {cursorStyle === 'ring' && (
        <div
          ref={ringRef}
          style={{
            position: 'absolute',
            top: -16,
            left: -16,
            width: 32,
            height: 32,
            borderRadius: '50%',
            border: `1.5px solid var(--accent-color, #ff1e00)`,
            boxShadow: isHovering
              ? '0 0 16px var(--accent-subtle, rgba(255,30,0,0.3))'
              : 'none',
            background: isHovering
              ? 'var(--accent-subtle, rgba(255, 30, 0, 0.1))'
              : 'transparent',
            transition: 'width 0.15s ease, height 0.15s ease, border-color 0.15s ease, scale 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
            transformOrigin: 'center center',
            scale: isClicking ? '0.85' : isHovering ? '1.45' : '1',
            zIndex: 1,
          }}
        />
      )}

      {/* Precision Crosshair follower */}
      {cursorStyle === 'crosshair' && (
        <div
          ref={ringRef}
          style={{
            position: 'absolute',
            top: -14,
            left: -14,
            width: 28,
            height: 28,
            transition: 'scale 0.15s cubic-bezier(0.16, 1, 0.3, 1)',
            transformOrigin: 'center center',
            scale: isClicking ? '0.8' : isHovering ? '1.3' : '1',
            zIndex: 1,
          }}
        >
          {/* Top reticle tick */}
          <div style={{ position: 'absolute', top: 0, left: 13, width: 2, height: 7, background: 'var(--accent-color, #ff1e00)' }} />
          {/* Bottom reticle tick */}
          <div style={{ position: 'absolute', bottom: 0, left: 13, width: 2, height: 7, background: 'var(--accent-color, #ff1e00)' }} />
          {/* Left reticle tick */}
          <div style={{ position: 'absolute', top: 13, left: 0, width: 7, height: 2, background: 'var(--accent-color, #ff1e00)' }} />
          {/* Right reticle tick */}
          <div style={{ position: 'absolute', top: 13, right: 0, width: 7, height: 2, background: 'var(--accent-color, #ff1e00)' }} />
          {/* Outer subtle circle */}
          <div style={{ position: 'absolute', top: 2, left: 2, width: 24, height: 24, borderRadius: '50%', border: '1px solid rgba(255, 255, 255, 0.2)' }} />
        </div>
      )}

      {/* Cyber Dot halo follower */}
      {cursorStyle === 'dot' && (
        <div
          ref={ringRef}
          style={{
            position: 'absolute',
            top: -12,
            left: -12,
            width: 24,
            height: 24,
            borderRadius: '50%',
            background: 'radial-gradient(circle, var(--accent-subtle, rgba(255, 30, 0, 0.25)) 0%, transparent 70%)',
            transition: 'scale 0.2s ease',
            scale: isClicking ? '0.6' : isHovering ? '1.8' : '1',
            zIndex: 1,
          }}
        />
      )}
    </div>
  );
};
