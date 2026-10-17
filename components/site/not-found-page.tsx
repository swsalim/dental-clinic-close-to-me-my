import type { Metadata } from 'next';
import Link from 'next/link';

import { siteConfig } from '@/config/site';

import Container from '@/components/ui/container';
import { Wrapper } from '@/components/ui/wrapper';

export const notFoundMetadata: Metadata = {
  title: {
    absolute: `Page not found | ${siteConfig.siteName}`,
  },
  description: `This page is not on ${siteConfig.siteName}.`,
  robots: {
    index: false,
    follow: true,
  },
};

export function NotFoundPage() {
  return (
    <Wrapper>
      <Container className="max-w-3xl">
        <h1 className="text-balance font-display text-4xl font-black">Page not found</h1>
        <p className="mt-4 text-lg font-medium text-gray-600 dark:text-gray-400">
          That page is not on {siteConfig.siteName}.
        </p>
        <p className="mt-6">
          <Link
            href="/"
            className="font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            prefetch={false}
          >
            Back to the homepage
          </Link>
        </p>
      </Container>
    </Wrapper>
  );
}
