import withPWAInit from "@ducanh2912/next-pwa";

// Bump this when you ship a major UI/branding change so installed PWAs
// throw out their cached pages and pick up the new assets. The cacheId
// namespaces every Workbox cache, so a new value here invalidates the
// old service worker's caches in one shot.
const CACHE_VERSION = "lsb-v1";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  cacheStartUrl: true,
  reloadOnOnline: true,
  // Force the new service worker to take over immediately on reload,
  // instead of waiting for every tab to close.
  workboxOptions: {
    skipWaiting: true,
    clientsClaim: true,
    cacheId: CACHE_VERSION,
    // Old runtime caches from previous SW versions are wiped on activation.
    cleanupOutdatedCaches: true,
  },
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'picsum.photos' },
      { protocol: 'https', hostname: '*.supabase.co' },
      { protocol: 'https', hostname: '*.supabase.in' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'api.qrserver.com' },
    ],
  },
};

export default withPWA(nextConfig);
