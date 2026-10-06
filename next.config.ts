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
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons', 'date-fns'],
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
    // Query rules are first: a redirect destination does not keep the original query.
    const publicPath = '/:path((?!_next|api|dashboard).*)*';
    const legacyPageQuery = '(?<page>[2-9]|[1-9][0-9]+)';

    return [
      {
        source: '/place/our-dental-clinic-masai',
        destination: '/place/our-dental-clinic-johor-bahru',
        permanent: true,
      },
      {
        source: '/page/:pageNum(\\d+)',
        has: [{ type: 'query', key: 'page' }],
        destination: '/page/:pageNum',
        permanent: true,
      },
      {
        source: '/:path+/page/:pageNum(\\d+)',
        has: [{ type: 'query', key: 'page' }],
        destination: '/:path*/page/:pageNum',
        permanent: true,
      },
      {
        source: '/',
        has: [{ type: 'query', key: 'page', value: legacyPageQuery }],
        destination: '/page/:page',
        permanent: true,
      },
      {
        source: publicPath,
        has: [{ type: 'query', key: 'page', value: legacyPageQuery }],
        destination: '/:path*/page/:page',
        permanent: true,
      },
      {
        source: '/',
        has: [{ type: 'query', key: 'page' }],
        destination: '/',
        permanent: true,
      },
      {
        source: publicPath,
        has: [{ type: 'query', key: 'page' }],
        destination: '/:path*',
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
  async rewrites() {
    // Formerly middleware category rewrites — static config avoids Edge Middleware cost.
    const categories = [
      '24-hour-clinic',
      'general-practitioner',
      'accident-and-emergency',
      'hospital',
      'paediatric',
      'aesthetic',
      'dental',
      'womens-health-clinic',
      'chinese-physician',
      'chiropractic',
      'physiotherapy',
      'psychotherapy',
    ];
    return categories.map((slug) => ({
      source: `/${slug}`,
      destination: `/category/${slug}`,
    }));
  },
};

export default nextConfig;
