import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable caching to prevent crashes
  experimental: {
    // Disable turbopack caching
  },
  
  // Disable static optimization for dynamic content
  output: 'standalone',
  
  // Disable image optimization caching
  images: {
    unoptimized: true,
  },
  
  // Disable webpack caching
  webpack: (config, { dev }) => {
    if (dev) {
      config.cache = false;
    }
    return config;
  },
  
  // Disable build caching
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
};

export default nextConfig;
