// ============================================================
//  LUMA WALLPAPERS — Configuration
//  Replace API keys with your own from:
//  Pexels:   https://www.pexels.com/api/
//  Unsplash: https://unsplash.com/developers
// ============================================================

const CONFIG = {
  // --- API Keys ---
  PEXELS_API_KEY: 'kuQ582SYiFEszGCrMKgcfVQ3mHoDB1F3V4jjSOdC4qI9PTsr5VCBU01e',
  UNSPLASH_ACCESS_KEY: '06HljdVFWKY8sGsY0HRCqwEjorFWXQTEfYaG7IHyIkw',
  // NOTE: Unsplash Secret Key must NEVER be used client-side.
  // Use it only in a server-side proxy (Node/PHP/etc.) if needed.

  // --- Pagination ---
  PER_PAGE: 30,

  // --- AI Generation (Pollinations — free, no key needed) ---
  AI_BASE_URL: 'https://image.pollinations.ai/prompt/',
  AI_DEFAULT_WIDTH: 1920,
  AI_DEFAULT_HEIGHT: 1080,

  // --- Default resolution options ---
  RESOLUTIONS: [
    { label: '4K Ultra HD', w: 3840, h: 2160 },
    { label: '2K QHD',      w: 2560, h: 1440 },
    { label: '1080p FHD',   w: 1920, h: 1080 },
    { label: 'Mobile',      w: 1080, h: 1920 },
  ],

  // --- Categories ---
  CATEGORIES: [
    { id: 'nature',        label: 'Nature',        icon: '🌿', query: 'nature landscape' },
    { id: 'space',         label: 'Space',          icon: '🌌', query: 'space galaxy nebula' },
    { id: 'architecture',  label: 'Architecture',   icon: '🏛️', query: 'architecture minimal' },
    { id: 'abstract',      label: 'Abstract',       icon: '🎨', query: 'abstract art colorful' },
    { id: 'city',          label: 'Cityscape',      icon: '🌆', query: 'city night skyline' },
    { id: 'ocean',         label: 'Ocean',          icon: '🌊', query: 'ocean waves beach' },
    { id: 'mountains',     label: 'Mountains',      icon: '⛰️', query: 'mountains fog misty' },
    { id: 'dark',          label: 'Dark Aesthetic',  icon: '🖤', query: 'dark aesthetic moody' },
    { id: 'minimal',       label: 'Minimal',        icon: '◻️', query: 'minimal clean white' },
    { id: 'forest',        label: 'Forest',         icon: '🌲', query: 'forest trees sunlight' },
  ],

  // --- AI Style Presets ---
  AI_STYLES: [
    { id: 'cinematic',   label: 'Cinematic',     suffix: 'cinematic lighting, dramatic, 8k, ultra realistic' },
    { id: 'abstract',    label: 'Abstract',       suffix: 'abstract digital art, vibrant colors, fluid, smooth' },
    { id: 'fantasy',     label: 'Fantasy',        suffix: 'epic fantasy art, magical, detailed, concept art' },
    { id: 'space',       label: 'Space',          suffix: 'deep space, nebula, stars, photorealistic NASA' },
    { id: 'minimal',     label: 'Minimal',        suffix: 'minimalist, clean, soft gradient, elegant' },
    { id: 'nature',      label: 'Nature',         suffix: 'photorealistic nature, golden hour, stunning' },
    { id: 'cyberpunk',   label: 'Cyberpunk',      suffix: 'cyberpunk neon city, rain, blade runner aesthetic' },
    { id: 'painterly',   label: 'Painterly',      suffix: 'oil painting style, impressionist, textured brush strokes' },
  ],

  // --- Google AdSense Publisher ID (for web AdSense) ---
  ADSENSE_PUB_ID: 'ca-pub-6988898499933953',

  // --- Google AdMob Ad Unit IDs (Android native app only) ---
  // Do NOT use these in web JS — they are for the Android SDK only.
  ADMOB: {
    APP_ID:       'ca-app-pub-6988898499933953~6742917290',
    BANNER:       'ca-app-pub-6988898499933953/856008435',
    INTERSTITIAL: 'ca-app-pub-6988898499933953/9568987653',
    APP_OPEN:     'ca-app-pub-6988898499933953/8255905989',
  },
};
