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
    optimizePackageImports: ['@phosphor-icons/react', '@radix-ui/react-icons', 'date-fns'],
  },
  async headers() {
    return [
      {
        source: '/:path*.md',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=2592000, stale-while-revalidate=86400',
          },
        ],
      },
    ];
  },
  async redirects() {
    // Listing redirects are static so public pages are not matched by middleware.
    // Do not redirect `?page=`. Next copies the original query onto the destination,
    // so `/services/invisalign?page=2` -> `/services/invisalign/page/2` comes back as
    // `/services/invisalign/page/2?page=2` and 308-loops. The query is ignored and the
    // static page renders. Its canonical is the clean path.
    return [
      {
        source: '/api/og',
        destination: '/images/hero-home.webp',
        permanent: true,
      },
      {
        source: '/api/og-list',
        destination: '/images/hero-home.webp',
        permanent: true,
      },
      {
        source: '/place/our-dental-clinic-masai',
        destination: '/place/our-dental-clinic-johor-bahru',
        permanent: true,
      },
      {
        source: '/place/:clinicSlug/reviews',
        destination: '/place/:clinicSlug#reviews',
        permanent: true,
      },
      {
        source: '/page/1',
        destination: '/',
        permanent: true,
      },
      {
        source: '/:path+/page/1',
        destination: '/:path*',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
