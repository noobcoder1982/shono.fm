export interface ChangelogFeature {
  title: string;
  description: string;
  badge?: string;
}

export interface ChangelogRelease {
  version: string;
  title: string;
  date: string;
  tagline: string;
  isLatest?: boolean;
  features: ChangelogFeature[];
}

export const CHANGELOG_RELEASES: ChangelogRelease[] = [
  {
    version: '1.4.1',
    title: 'Zero-Quota Search Engine & Tactical Polish',
    date: 'September 2026',
    tagline: 'Failover Zero-Quota Ingestion, Smart Update Recognition, Curved Contours & High-Res Artwork Engine',
    isLatest: true,
    features: [
      {
        title: '🔍 Zero-Quota Resilient Search Engine',
        description: 'Autonomous failover system that ensures uninterrupted search and album playlist extraction even when Google Cloud API quotas are fully exhausted.',
        badge: 'ENGINE',
      },
      {
        title: '🔄 Smart Update Detection & Native Installer',
        description: 'Enhanced version comparison engine that reliably detects installed releases, eliminates duplicate update alerts, and downloads installers directly in the background.',
        badge: 'SYSTEM',
      },
      {
        title: '🪟 Sleek Rounded UI & Window Contours',
        description: 'Hardware-calibrated rounded window frame with soft ambient drop-shadows and configurable corner smoothing across all cards and dialogs.',
      },
      {
        title: '💿 Resilient Vinyl Artwork & Thumbnail Degradation',
        description: 'Multi-resolution artwork fallback with spinning vinyl disc placeholders that prevent broken browser image icons and text spillover.',
      },
      {
        title: '🍏 Cross-Platform macOS (.dmg) & Windows Release Pipeline',
        description: 'Automated concurrent distribution generating official signed packages for Apple Silicon, Intel Macs, and Windows.',
        badge: 'CROSS-PLATFORM',
      },
    ],
  },
  {
    version: '1.3.0',
    title: 'Universal Ingestion & Multi-Platform Vault',
    date: 'September 2026',
    tagline: 'Universal Search & Ingestion, Kinetic Typographic Vault & Automated Cross-Platform Architecture',
    features: [
      {
        title: '🔍 Universal Multi-Entity Search & Instant Ingestion',
        description: 'Instant YouTube URL pasting directly into search with auto-detection for playlists, tracks, and channels. Integrated zero-quota resilient search engine with lightning response times.',
        badge: 'NEW',
      },
      {
        title: '🍎 Multi-Platform Architecture for macOS & Windows',
        description: 'Official native builds for Apple Silicon (M1/M2/M3/M4) and Intel Macs alongside the high-performance Windows standalone installer.',
        badge: 'CROSS-PLATFORM',
      },
      {
        title: '🪟 Sleek Rounded Window Contours & Visual Polish',
        description: 'Frameless desktop container with smooth rounded window geometry, subtle ambient borders, and maximized display edge snapping.',
      },
      {
        title: '⚡ Resilient High-Res Artwork Engine',
        description: 'Enhanced thumbnail resolution pipeline with multi-tiered fallback and smart aspect ratio framing to prevent broken covers.',
      },
      {
        title: '🎛️ Session Queueing & Standalone Ingestion',
        description: 'Add songs and albums directly to standalone vault archives or seamlessly append to active listening sessions.',
      },
    ],
  },
  {
    version: '1.2.0',
    title: 'Mini-Deck & Kinetic Lyric Typography',
    date: 'August 2026',
    tagline: 'Always-On-Top Floating Cassette, Lyric Cards & Native Desktop Integration',
    features: [
      {
        title: '🖥️ Compact Floating Mini-Deck & Desktop Integration',
        description: 'Always-on-top frosted-glass floating widget styled like a vintage cassette tape with spinning hubs, playback scrubber, and quick controls. Native Windows Media Transport Controls (SMTC) and system tray minimization.',
      },
      {
        title: '📝 Aesthetic Lyric Card & Poster Generator',
        description: 'Select 2–4 lines of lyrics in Fullscreen player to generate high-resolution, beautifully typeset graphic posters featuring album art and typography.',
      },
      {
        title: '🎤 Word-by-Word Karaoke Glow & Enhanced LRC Support',
        description: 'Smooth word-level highlight animation synced to vocals for tracks with enhanced timestamp data.',
      },
      {
        title: '📼 Virtual Mixtape & Cassette Deck (A-Side & B-Side)',
        description: 'Create custom virtual cassettes with fixed run times (C-60, C-90), customizable J-card spine labels, and animated spinning cassette reels.',
      },
      {
        title: '🏷️ BPM & Musical Key Badges',
        description: 'Real-time harmonic audio analysis badges displayed dynamically on track rows.',
      },
    ],
  },
];

export const LATEST_RELEASE = CHANGELOG_RELEASES[0];
