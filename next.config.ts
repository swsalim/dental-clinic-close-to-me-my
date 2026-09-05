import type { NextConfig } from 'next';

import { MEDIA_DEVICE_SIZES, MEDIA_IMAGE_SIZES } from './lib/media-sizes';

const nextConfig: NextConfig = {
  images: {
    // Keep in sync with lib/media-sizes.ts presets used by MediaImage call sites.
    deviceSizes: [...MEDIA_DEVICE_SIZES],
    imageSizes: [...MEDIA_IMAGE_SIZES],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 2678400,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'media.dentalclinicclosetome.my',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'ik.imagekit.io',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.dentalclinicclosetome.my',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
    ],
  },
  compress: true,
  poweredByHeader: false,
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },
  async headers() {
    return [
      {
        source: '/:path*.md',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=1209600, stale-while-revalidate=86400',
          },
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: '/place/our-dental-clinic-masai',
        destination: '/place/our-dental-clinic-johor-bahru',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
