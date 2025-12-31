import createMDX from '@next/mdx';
import type { NextConfig } from 'next';
import type { Configuration } from 'webpack';

const withMDX = createMDX({
  extension: /\.mdx?$/,
  // No options needed since MDX files are processed via next-mdx-remote
  // This avoids serialization issues with Turbopack
});

const nextConfig: NextConfig = {
  pageExtensions: ['js', 'jsx', 'mdx', 'ts', 'tsx'],
  // Ensure CommonJS modules work correctly in API routes
  serverExternalPackages: ['pdf-parse', 'mammoth'],
  // Optimize production builds to reduce webpack cache warnings
  productionBrowserSourceMaps: false,
  // Optimize images
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  // Compress responses
  compress: true,
  webpack: (config: Configuration) => {
    // Optimize webpack cache to reduce large string serialization warnings
    // Note: We cannot directly make webpack use Buffer instead of strings for cache
    // serialization - that's an internal webpack implementation detail.
    // The optimizations below help reduce the impact of large string serialization.
    if (config.cache && typeof config.cache === 'object') {
      // Only add compression for file-based cache (FileCacheOptions)
      if ('cacheDirectory' in config.cache || (config.cache as any).type === 'filesystem') {
        config.cache = {
          ...config.cache,
          compression: 'gzip',
        } as typeof config.cache;
      } else {
        // For memory cache, only set maxMemoryGenerations
        config.cache = {
          ...config.cache,
          maxMemoryGenerations: 1,
        } as typeof config.cache;
      }
    }
    return config;
  },
};

export default withMDX(nextConfig);
