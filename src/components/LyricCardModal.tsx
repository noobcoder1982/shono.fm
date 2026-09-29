import React, { useState, useRef, useEffect } from 'react';
import { usePlayer } from '../context/PlayerContext';
import { useArtwork } from '../services/artworkService';
import { X, Download, Copy, Check, Sparkles } from 'lucide-react';
import type { LyricLine } from '../services/lyricsService';

interface LyricCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableLines: LyricLine[];
  initialSelectedLines?: LyricLine[];
}

export type AspectRatio = '1:1' | '9:16' | '16:9';
export type CardStyle = 'grunge' | 'acrylic' | 'editorial' | 'cinematic' | 'turntable' | 'moody';

export const LyricCardModal: React.FC<LyricCardModalProps> = ({
  isOpen,
  onClose,
  availableLines,
  initialSelectedLines,
}) => {
  const { currentTrack } = usePlayer();
  const { artworkUrl } = useArtwork(currentTrack);

  const [selectedLineIds, setSelectedLineIds] = useState<number[]>([]);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');
  const [cardStyle, setCardStyle] = useState<CardStyle>('grunge');
  const [copied, setCopied] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Initialize selected lines
  useEffect(() => {
    if (!isOpen) return;

    if (initialSelectedLines && initialSelectedLines.length > 0) {
      setSelectedLineIds(initialSelectedLines.slice(0, 4).map((l) => l.id));
    } else if (availableLines.length > 0) {
      // Pick first 2-3 non-empty lines
      const nonIntro = availableLines.filter((l) => !l.text.startsWith('(') && l.text.trim().length > 0);
      setSelectedLineIds(nonIntro.slice(0, 3).map((l) => l.id));
    }
  }, [isOpen, initialSelectedLines, availableLines]);

  const toggleLine = (lineId: number) => {
    setSelectedLineIds((prev) => {
      if (prev.includes(lineId)) {
        return prev.filter((id) => id !== lineId);
      }
      if (prev.length >= 4) {
        // limit to 4 lines
        return [...prev.slice(1), lineId];
      }
      return [...prev, lineId];
    });
  };

  const selectedLines = availableLines
    .filter((l) => selectedLineIds.includes(l.id))
    .sort((a, b) => a.time - b.time);

  // Helper to draw waveform bars on canvas
  const drawWaveform = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    color: string
  ) => {
    const bars = 28;
    const barWidth = Math.max(2, Math.floor(width / (bars * 1.6)));
    const gap = Math.floor(barWidth * 0.6);
    ctx.fillStyle = color;

    for (let i = 0; i < bars; i++) {
      const norm = Math.sin((i / bars) * Math.PI);
      const randomVar = 0.35 + 0.65 * Math.abs(Math.sin(i * 1.3));
      const h = Math.max(4, Math.floor(height * norm * randomVar));
      const bx = x + i * (barWidth + gap);
      const by = y + (height - h) / 2;
      ctx.beginPath();
      ctx.roundRect(bx, by, barWidth, h, 2);
      ctx.fill();
    }
  };

  // Render high-res canvas for all 6 styles
  const drawCanvas = async (): Promise<HTMLCanvasElement | null> => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    let width = 1200;
    let height = 1200;
    if (aspectRatio === '9:16') {
      width = 1080;
      height = 1920;
    } else if (aspectRatio === '16:9') {
      width = 1920;
      height = 1080;
    }

    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Load Artwork if available
    let coverImg: HTMLImageElement | null = null;
    if (artworkUrl) {
      coverImg = await new Promise<HTMLImageElement | null>((resolve) => {
        const img = new window.Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.onerror = () => resolve(null);
        img.src = artworkUrl;
      });
    }

    const title = currentTrack?.title || 'Unknown Title';
    const artist = currentTrack?.artist || 'Unknown Artist';
    const album = currentTrack?.album || 'Precision Audio';
    const year = currentTrack?.year || '2026';
    const quoteLines = selectedLines.length > 0 ? selectedLines : [{ text: 'No lyric lines selected' }];

    // ==========================================
    // STYLE 1: DARK GRUNGE DJ POSTER
    // ==========================================
    if (cardStyle === 'grunge') {
      // Dark textured charcoal gradient
      const bgGrad = ctx.createLinearGradient(0, 0, width, height);
      bgGrad.addColorStop(0, '#0c0d10');
      bgGrad.addColorStop(0.5, '#12141a');
      bgGrad.addColorStop(1, '#08080a');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Subtle Distressed Scratches / Noise Grid
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.035)';
      ctx.lineWidth = 1;
      for (let x = 0; x < width; x += 36) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      // Background High-Contrast / Filtered Artwork (Upper Right / Center)
      if (coverImg) {
        ctx.save();
        ctx.globalAlpha = 0.35;
        ctx.filter = 'contrast(160%) grayscale(100%)';
        const imgSize = Math.min(width, height) * 0.75;
        ctx.drawImage(coverImg, width - imgSize + 40, -40, imgSize, imgSize);
        ctx.restore();
      }

      // Header
      const pad = 60;
      ctx.font = 'bold 16px monospace';
      ctx.fillStyle = '#e4e4e7';
      ctx.fillText('SHONO.FM  /  LYRIC ARCHIVE', pad, pad + 20);

      ctx.textAlign = 'right';
      ctx.font = 'bold 16px monospace';
      ctx.fillStyle = '#a1a1aa';
      ctx.fillText(String(year), width - pad, pad + 20);
      ctx.textAlign = 'left';

      // Orange Quote Mark
      const quoteY = height * 0.42;
      ctx.font = 'italic 76px Georgia, serif';
      ctx.fillStyle = '#f59e0b';
      ctx.fillText('“', pad, quoteY);

      // Bold Impactful Lyrics
      const fontSize = aspectRatio === '9:16' ? 52 : 46;
      ctx.font = `bold ${fontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
      ctx.fillStyle = '#ffffff';
      let ly = quoteY + 30;
      const spacing = fontSize * 1.45;
      for (const l of quoteLines) {
        ctx.fillText(l.text, pad, ly, width - pad * 2);
        ly += spacing;
      }

      // Bottom Row: Album Squircle + Title + Waveform
      const btmY = height - pad - 120;
      if (coverImg) {
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(pad, btmY, 96, 96, 16);
        ctx.clip();
        ctx.drawImage(coverImg, pad, btmY, 96, 96);
        ctx.restore();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(pad, btmY, 96, 96, 16);
        ctx.stroke();
      }

      // Track Info
      const infoX = pad + (coverImg ? 116 : 0);
      ctx.font = 'bold 30px sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(title, infoX, btmY + 42, width - infoX - 260);

      ctx.font = '600 20px sans-serif';
      ctx.fillStyle = '#a1a1aa';
      ctx.fillText(artist, infoX, btmY + 76, width - infoX - 260);

      // Bottom Right Waveform Telemetry
      drawWaveform(ctx, width - pad - 220, btmY + 28, 220, 48, '#e4e4e7');

      // Outer border
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
      ctx.lineWidth = 2;
      ctx.strokeRect(30, 30, width - 60, height - 60);
    }

    // ==========================================
    // STYLE 2: FROSTED ACRYLIC GLASS
    // ==========================================
    else if (cardStyle === 'acrylic') {
      // Smoky dark gradient
      const bgGrad = ctx.createLinearGradient(0, 0, width, height);
      bgGrad.addColorStop(0, '#090a0d');
      bgGrad.addColorStop(1, '#15171e');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Glowing ambient orb
      const orbGrad = ctx.createRadialGradient(width * 0.3, height * 0.35, 20, width * 0.3, height * 0.35, 500);
      orbGrad.addColorStop(0, 'rgba(234, 179, 8, 0.18)');
      orbGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = orbGrad;
      ctx.fillRect(0, 0, width, height);

      // Main Glass Card Box
      const cardMargin = width * 0.08;
      const cardW = width - cardMargin * 2;
      const cardH = height - cardMargin * 2;

      ctx.save();
      ctx.fillStyle = 'rgba(26, 29, 38, 0.72)';
      ctx.beginPath();
      ctx.roundRect(cardMargin, cardMargin, cardW, cardH, 28);
      ctx.fill();

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();

      // Top Bar inside Card
      const innerPad = cardMargin + 48;
      ctx.font = 'bold 15px monospace';
      ctx.fillStyle = '#ffffff';
      ctx.fillText('SHONO.FM', innerPad, cardMargin + 50);

      ctx.textAlign = 'right';
      ctx.font = 'bold 14px monospace';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.fillText('LYRIC CARD', cardMargin + cardW - 48, cardMargin + 50);
      ctx.textAlign = 'left';

      // Upper Block: Artwork squircle, Title, Artist, Waveform
      const artSize = 130;
      const artY = cardMargin + 95;
      if (coverImg) {
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(innerPad, artY, artSize, artSize, 20);
        ctx.clip();
        ctx.drawImage(coverImg, innerPad, artY, artSize, artSize);
        ctx.restore();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(innerPad, artY, artSize, artSize, 20);
        ctx.stroke();
      }

      const metaX = innerPad + artSize + 28;
      ctx.font = 'bold 36px -apple-system, sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(title, metaX, artY + 48, cardW - artSize - 120);

      ctx.font = '500 22px -apple-system, sans-serif';
      ctx.fillStyle = '#cbd5e1';
      ctx.fillText(artist, metaX, artY + 84, cardW - artSize - 120);

      drawWaveform(ctx, metaX, artY + 98, 180, 28, 'rgba(255, 255, 255, 0.65)');

      // Quote Mark
      const quoteY = artY + artSize + 70;
      ctx.font = 'italic 64px Georgia, serif';
      ctx.fillStyle = '#fbbf24';
      ctx.fillText('“', innerPad, quoteY);

      // Clean Modern Typography Lyrics
      const fSize = 42;
      ctx.font = `600 ${fSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
      ctx.fillStyle = '#ffffff';
      let lY = quoteY + 24;
      for (const l of quoteLines) {
        ctx.fillText(l.text, innerPad, lY, cardW - 96);
        lY += fSize * 1.45;
      }

      // Bottom Bar inside Card
      const footerY = cardMargin + cardH - 45;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.beginPath();
      ctx.moveTo(innerPad, footerY - 24);
      ctx.lineTo(cardMargin + cardW - 48, footerY - 24);
      ctx.stroke();

      ctx.font = 'bold 15px monospace';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
      ctx.fillText(`${album.toUpperCase()}  /  ${year}`, innerPad, footerY);

      // Explicit Badge [E]
      ctx.textAlign = 'right';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.fillRect(cardMargin + cardW - 74, footerY - 18, 26, 24);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.strokeRect(cardMargin + cardW - 74, footerY - 18, 26, 24);
      ctx.font = 'bold 14px sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.fillText('E', cardMargin + cardW - 57, footerY);
      ctx.textAlign = 'left';
    }

    // ==========================================
    // STYLE 3: BOLD RED EDITORIAL POSTER
    // ==========================================
    else if (cardStyle === 'editorial') {
      // Crimson to black background
      const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
      bgGrad.addColorStop(0, '#160408');
      bgGrad.addColorStop(0.5, '#0b0204');
      bgGrad.addColorStop(1, '#020001');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Giant Red Distressed Title in Background
      ctx.save();
      ctx.font = '900 240px -apple-system, Impact, sans-serif';
      ctx.fillStyle = 'rgba(225, 29, 72, 0.38)';
      ctx.textAlign = 'center';
      const cleanUpper = title.toUpperCase().slice(0, 10);
      ctx.fillText(cleanUpper, width / 2, height * 0.38);
      ctx.restore();

      // Top Bar
      const pad = 60;
      ctx.font = 'bold 16px monospace';
      ctx.fillStyle = '#f43f5e';
      ctx.fillText('SHONO.FM', pad, pad + 20);

      ctx.textAlign = 'right';
      ctx.font = 'bold 16px monospace';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(artist.toUpperCase(), width - pad, pad + 20);
      ctx.textAlign = 'left';

      // Red Quote Mark
      const quoteY = height * 0.42;
      ctx.font = 'italic 76px Georgia, serif';
      ctx.fillStyle = '#ef4444';
      ctx.fillText('“', pad, quoteY);

      // High-contrast Bold White Lyrics
      const fSize = 46;
      ctx.font = `bold ${fSize}px -apple-system, sans-serif`;
      ctx.fillStyle = '#ffffff';
      let lY = quoteY + 28;
      for (const l of quoteLines) {
        ctx.fillText(l.text, pad, lY, width - pad * 2);
        lY += fSize * 1.45;
      }

      // Bottom Row: Squircle Album Art + Red Waveform
      const btmY = height - pad - 120;
      if (coverImg) {
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(pad, btmY, 96, 96, 14);
        ctx.clip();
        ctx.drawImage(coverImg, pad, btmY, 96, 96);
        ctx.restore();
        ctx.strokeStyle = '#f43f5e';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(pad, btmY, 96, 96, 14);
        ctx.stroke();
      }

      const infoX = pad + (coverImg ? 116 : 0);
      ctx.font = 'bold 30px sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(title, infoX, btmY + 42, width - infoX - 240);

      ctx.font = '600 18px sans-serif';
      ctx.fillStyle = '#fda4af';
      ctx.fillText(`${artist} · ${year}`, infoX, btmY + 76, width - infoX - 240);

      // Red Waveform
      drawWaveform(ctx, width - pad - 220, btmY + 30, 220, 48, '#f43f5e');

      // Outer Crimson Border
      ctx.strokeStyle = 'rgba(244, 63, 94, 0.4)';
      ctx.lineWidth = 2;
      ctx.strokeRect(30, 30, width - 60, height - 60);
    }

    // ==========================================
    // STYLE 4: GOLDEN CINEMATIC LANDSCAPE
    // ==========================================
    else if (cardStyle === 'cinematic') {
      const bgGrad = ctx.createLinearGradient(0, 0, width, height);
      bgGrad.addColorStop(0, '#22150a');
      bgGrad.addColorStop(0.5, '#120b05');
      bgGrad.addColorStop(1, '#080503');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Ambient Bokeh Circles
      ctx.save();
      const b1 = ctx.createRadialGradient(width * 0.25, height * 0.3, 10, width * 0.25, height * 0.3, 300);
      b1.addColorStop(0, 'rgba(245, 158, 11, 0.25)');
      b1.addColorStop(1, 'transparent');
      ctx.fillStyle = b1;
      ctx.fillRect(0, 0, width, height);
      ctx.restore();

      const pad = 70;
      // Top Left Large Stylized Title & Artist
      ctx.font = '900 48px -apple-system, sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(title.toUpperCase(), pad, pad + 40);

      ctx.font = '600 22px -apple-system, sans-serif';
      ctx.fillStyle = '#f59e0b';
      ctx.fillText(artist, pad, pad + 75);

      ctx.textAlign = 'right';
      ctx.font = 'bold 16px monospace';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.fillText('SHONO.FM', width - pad, pad + 40);
      ctx.textAlign = 'left';

      // Amber Quote Mark
      const quoteY = height * 0.38;
      ctx.font = 'italic 76px Georgia, serif';
      ctx.fillStyle = '#f59e0b';
      ctx.fillText('“', pad, quoteY);

      // Elegant Typography Lyrics
      const fSize = 44;
      ctx.font = `600 ${fSize}px -apple-system, Georgia, serif`;
      ctx.fillStyle = '#ffffff';
      let lY = quoteY + 26;
      for (const l of quoteLines) {
        ctx.fillText(l.text, pad, lY, width - pad * 2);
        lY += fSize * 1.5;
      }

      // Bottom Scrubber Bar: 0:42 ─────────●───────── 3:26
      const btmY = height - pad - 20;
      ctx.font = 'bold 16px monospace';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.fillText('0:42', pad, btmY);

      ctx.textAlign = 'right';
      ctx.fillText('3:26', width - pad, btmY);
      ctx.textAlign = 'left';

      const barX = pad + 60;
      const barW = width - pad * 2 - 120;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.fillRect(barX, btmY - 6, barW, 4);

      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(barX, btmY - 6, barW * 0.35, 4);

      // Scrubber Knob
      ctx.beginPath();
      ctx.arc(barX + barW * 0.35, btmY - 4, 7, 0, Math.PI * 2);
      ctx.fill();
    }

    // ==========================================
    // STYLE 5: VINYL TURNTABLE DECK
    // ==========================================
    else if (cardStyle === 'turntable') {
      ctx.fillStyle = '#0a0b0e';
      ctx.fillRect(0, 0, width, height);

      const pad = 60;
      // Left side: Vinyl Record & Tonearm
      const recordX = width * 0.28;
      const recordY = height * 0.5;
      const recordR = Math.min(width, height) * 0.38;

      // Outer Vinyl Disc
      ctx.save();
      ctx.beginPath();
      ctx.arc(recordX, recordY, recordR, 0, Math.PI * 2);
      ctx.fillStyle = '#0e0f14';
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Concentric Microgroove Rings
      for (let r = recordR * 0.42; r < recordR * 0.96; r += 6) {
        ctx.beginPath();
        ctx.arc(recordX, recordY, r, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.025)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Center Circular Album Label
      const labelR = recordR * 0.38;
      if (coverImg) {
        ctx.beginPath();
        ctx.arc(recordX, recordY, labelR, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(coverImg, recordX - labelR, recordY - labelR, labelR * 2, labelR * 2);
      } else {
        ctx.beginPath();
        ctx.arc(recordX, recordY, labelR, 0, Math.PI * 2);
        ctx.fillStyle = '#27272a';
        ctx.fill();
      }
      ctx.restore();

      // Spindle hole
      ctx.beginPath();
      ctx.arc(recordX, recordY, 12, 0, Math.PI * 2);
      ctx.fillStyle = '#000000';
      ctx.fill();

      // Tonearm
      ctx.save();
      ctx.strokeStyle = '#d4d4d8';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(recordX + recordR + 30, recordY - recordR + 30);
      ctx.lineTo(recordX + recordR * 0.55, recordY - 10);
      ctx.stroke();

      // Needle Cartridge
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(recordX + recordR * 0.55 - 10, recordY - 18, 16, 22);
      ctx.restore();

      // Right side: Lyrics & Controls
      const rightX = width * 0.58;
      ctx.font = 'bold 15px monospace';
      ctx.fillStyle = '#e4e4e7';
      ctx.fillText('SHONO.FM', rightX, pad + 30);

      ctx.textAlign = 'right';
      ctx.font = 'bold 15px monospace';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.fillText('LYRIC CARD', width - pad, pad + 30);
      ctx.textAlign = 'left';

      // Title & Artist
      ctx.font = 'bold 36px -apple-system, sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(title, rightX, pad + 100, width - rightX - pad);

      ctx.font = '500 22px -apple-system, sans-serif';
      ctx.fillStyle = '#a1a1aa';
      ctx.fillText(artist, rightX, pad + 135, width - rightX - pad);

      // Quote Mark
      const quoteY = pad + 200;
      ctx.font = 'italic 64px Georgia, serif';
      ctx.fillStyle = '#f59e0b';
      ctx.fillText('“', rightX, quoteY);

      // Lyrics
      const fSize = 38;
      ctx.font = `600 ${fSize}px -apple-system, sans-serif`;
      ctx.fillStyle = '#ffffff';
      let lY = quoteY + 24;
      for (const l of quoteLines) {
        ctx.fillText(l.text, rightX, lY, width - rightX - pad);
        lY += fSize * 1.45;
      }

      // Bottom Player Transport Controls (⏮  ⏸  ⏭)
      const ctrlY = height - pad - 30;
      ctx.font = '28px sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.fillText('⏮', rightX + 60, ctrlY);
      ctx.fillText('⏸', rightX + 140, ctrlY);
      ctx.fillText('⏭', rightX + 220, ctrlY);
      ctx.textAlign = 'left';
    }

    // ==========================================
    // STYLE 6: MOODY GLASS PILL
    // ==========================================
    else {
      // Cool cyan / deep slate backdrop
      const bgGrad = ctx.createLinearGradient(0, 0, width, height);
      bgGrad.addColorStop(0, '#0a101d');
      bgGrad.addColorStop(0.5, '#0e1828');
      bgGrad.addColorStop(1, '#05080f');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      const pad = 60;
      ctx.font = 'bold 16px monospace';
      ctx.fillStyle = '#38bdf8';
      ctx.fillText('SHONO.FM', pad, pad + 20);

      ctx.textAlign = 'right';
      ctx.font = 'bold 16px monospace';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText(String(year), width - pad, pad + 20);
      ctx.textAlign = 'left';

      // Top Floating Frosted Glass Pill
      const pillY = pad + 60;
      const pillW = width - pad * 2;
      const pillH = 140;

      ctx.save();
      ctx.fillStyle = 'rgba(30, 41, 59, 0.65)';
      ctx.beginPath();
      ctx.roundRect(pad, pillY, pillW, pillH, 24);
      ctx.fill();
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.3)';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.restore();

      // Pill Content: Squircle art, Title, Artist, Waveform
      const artSize = 96;
      if (coverImg) {
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(pad + 22, pillY + 22, artSize, artSize, 16);
        ctx.clip();
        ctx.drawImage(coverImg, pad + 22, pillY + 22, artSize, artSize);
        ctx.restore();
      }

      const metaX = pad + artSize + 44;
      ctx.font = 'bold 32px -apple-system, sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(title, metaX, pillY + 58, pillW - artSize - 320);

      ctx.font = '500 20px -apple-system, sans-serif';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText(artist, metaX, pillY + 92, pillW - artSize - 320);

      drawWaveform(ctx, pad + pillW - 250, pillY + 46, 220, 48, '#38bdf8');

      // Bottom Floating Frosted Lyric Container
      const lyricCardY = pillY + pillH + 36;
      const lyricCardH = height - lyricCardY - pad;

      ctx.save();
      ctx.fillStyle = 'rgba(15, 23, 42, 0.72)';
      ctx.beginPath();
      ctx.roundRect(pad, lyricCardY, pillW, lyricCardH, 24);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.restore();

      // Quote Mark
      const quoteY = lyricCardY + 60;
      ctx.font = 'italic 64px Georgia, serif';
      ctx.fillStyle = '#38bdf8';
      ctx.fillText('“', pad + 40, quoteY);

      // Lyrics inside Pill
      const fSize = 42;
      ctx.font = `600 ${fSize}px -apple-system, sans-serif`;
      ctx.fillStyle = '#ffffff';
      let lY = quoteY + 24;
      for (const l of quoteLines) {
        ctx.fillText(l.text, pad + 40, lY, pillW - 80);
        lY += fSize * 1.5;
      }
    }

    return canvas;
  };

  useEffect(() => {
    if (isOpen) {
      drawCanvas();
    }
  }, [isOpen, selectedLineIds, aspectRatio, cardStyle, currentTrack, artworkUrl]);

  const handleDownload = async () => {
    setIsExporting(true);
    const canvas = await drawCanvas();
    if (!canvas) {
      setIsExporting(false);
      return;
    }

    const dataUrl = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataUrl;
    const cleanTitle = (currentTrack?.title || 'track').replace(/[^a-zA-Z0-9]/g, '_');
    a.download = `SHONO_${cardStyle}_${cleanTitle}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setIsExporting(false);
  };

  const handleCopyClipboard = async () => {
    setIsExporting(true);
    const canvas = await drawCanvas();
    if (!canvas) {
      setIsExporting(false);
      return;
    }

    canvas.toBlob(async (blob) => {
      if (blob) {
        try {
          await navigator.clipboard.write([
            new ClipboardItem({
              'image/png': blob,
            }),
          ]);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch (err) {
          console.error('Clipboard copy error:', err);
        }
      }
      setIsExporting(false);
    });
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(0, 0, 0, 0.82)',
        backdropFilter: 'blur(20px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '940px',
          maxWidth: '96vw',
          maxHeight: '94vh',
          background: '#0d0f14',
          border: '1px solid rgba(255, 255, 255, 0.16)',
          borderRadius: '20px',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 32px 80px rgba(0,0,0,0.9)',
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
            <Sparkles size={16} color="var(--accent-color, #eab308)" />
            <h2 style={{ fontSize: '15px', fontWeight: 800, letterSpacing: '0.06em', margin: 0, color: '#fff' }}>
              LYRIC CARD / POSTER GENERATOR
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '6px',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body: Left Preview, Right Controls */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', flex: 1, minHeight: 0, overflow: 'hidden' }}>
          {/* Canvas Preview Area */}
          <div
            style={{
              padding: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#07080a',
              borderRight: '1px solid rgba(255, 255, 255, 0.08)',
              overflow: 'hidden',
            }}
          >
            <canvas
              ref={canvasRef}
              style={{
                maxWidth: '100%',
                maxHeight: '520px',
                borderRadius: '12px',
                boxShadow: '0 16px 40px rgba(0,0,0,0.7)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                objectFit: 'contain',
              }}
            />
          </div>

          {/* Right Controls Area */}
          <div
            style={{
              padding: '20px 24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              overflowY: 'auto',
            }}
          >
            {/* Format & Aspect Ratio */}
            <div>
              <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '0.08em', marginBottom: '8px' }}>
                ASPECT RATIO
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                {(['1:1', '9:16', '16:9'] as AspectRatio[]).map((ratio) => (
                  <button
                    key={ratio}
                    onClick={() => setAspectRatio(ratio)}
                    style={{
                      flex: 1,
                      padding: '8px 10px',
                      borderRadius: '8px',
                      fontSize: '11.5px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      border: aspectRatio === ratio ? '1px solid var(--accent-color, #eab308)' : '1px solid rgba(255, 255, 255, 0.1)',
                      background: aspectRatio === ratio ? 'rgba(234, 179, 8, 0.18)' : 'rgba(255, 255, 255, 0.04)',
                      color: aspectRatio === ratio ? '#fff' : 'var(--text-secondary)',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {ratio === '1:1' ? '1:1 Square' : ratio === '9:16' ? '9:16 Story' : '16:9 Banner'}
                  </button>
                ))}
              </div>
            </div>

            {/* Poster Template (6 Designs from Image 1) */}
            <div>
              <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '0.08em', marginBottom: '8px' }}>
                POSTER TEMPLATE (6 DESIGNS)
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                {[
                  { id: 'grunge', label: 'Dark Grunge DJ' },
                  { id: 'acrylic', label: 'Frosted Acrylic' },
                  { id: 'editorial', label: 'Bold Red Editorial' },
                  { id: 'cinematic', label: 'Golden Cinematic' },
                  { id: 'turntable', label: 'Vinyl Turntable' },
                  { id: 'moody', label: 'Moody Glass Pill' },
                ].map((th) => (
                  <button
                    key={th.id}
                    onClick={() => setCardStyle(th.id as CardStyle)}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '8px',
                      fontSize: '11px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      border: cardStyle === th.id ? '1px solid var(--accent-color, #eab308)' : '1px solid rgba(255, 255, 255, 0.1)',
                      background: cardStyle === th.id ? 'rgba(234, 179, 8, 0.18)' : 'rgba(255, 255, 255, 0.04)',
                      color: cardStyle === th.id ? '#fff' : 'var(--text-secondary)',
                      textAlign: 'left',
                    }}
                  >
                    {th.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Select Lines to Include (Max 4) */}
            <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '0.08em', marginBottom: '8px' }}>
                SELECT LYRICS (UP TO 4 LINES)
              </div>
              <div
                style={{
                  flex: 1,
                  maxHeight: '140px',
                  overflowY: 'auto',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '8px',
                  background: 'rgba(0, 0, 0, 0.25)',
                  padding: '4px',
                }}
              >
                {availableLines.length === 0 ? (
                  <div style={{ padding: '12px', fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center' }}>
                    No lyrics available to select.
                  </div>
                ) : (
                  availableLines.map((line) => {
                    const isSelected = selectedLineIds.includes(line.id);
                    return (
                      <div
                        key={line.id}
                        onClick={() => toggleLine(line.id)}
                        style={{
                          padding: '6px 10px',
                          borderRadius: '6px',
                          fontSize: '11.5px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '8px',
                          background: isSelected ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                          color: isSelected ? '#fff' : 'var(--text-secondary)',
                          marginBottom: '2px',
                        }}
                      >
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {line.text}
                        </span>
                        {isSelected && <Check size={13} color="var(--accent-color, #eab308)" />}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Export Action Buttons */}
            <div style={{ display: 'flex', gap: '10px', marginTop: 'auto', paddingTop: '8px' }}>
              <button
                type="button"
                onClick={handleCopyClipboard}
                disabled={isExporting}
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
                  transition: 'all 0.15s ease',
                }}
              >
                {copied ? <Check size={14} color="#22c55e" /> : <Copy size={14} />}
                <span>{copied ? 'Copied PNG!' : 'Copy Image'}</span>
              </button>

              <button
                type="button"
                onClick={handleDownload}
                disabled={isExporting}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  background: 'var(--accent-color, #eab308)',
                  border: 'none',
                  color: '#000',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <Download size={14} />
                <span>Download PNG</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
