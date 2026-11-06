/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "firebasestorage.googleapis.com" },
      { protocol: "https", hostname: "storage.googleapis.com" },
    ],
    // Rural-First Experience (Phase 1 Rev 3 §4): smaller default sizes
    // favor low-bandwidth delivery; components requesting larger images
    // do so explicitly rather than everything defaulting to full-res.
    deviceSizes: [360, 640, 828, 1080, 1440],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(self), geolocation=(self)" },
        ],
      },
    ];
  },
  experimental: {
    typedRoutes: true,
  },
};

module.exports = nextConfig;
