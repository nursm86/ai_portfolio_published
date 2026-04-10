import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    unoptimized: true,
    remotePatterns: [
      { hostname: 'images.unsplash.com' },
      { hostname: 'assets.aceternity.com' },
    ],
  },
  typescript: { ignoreBuildErrors: true },
};

export default nextConfig;
