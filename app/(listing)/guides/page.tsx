import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

import { siteConfig } from '@/config/site';

import { formatGuideDate, getAllGuides, getGuidesIndexLastmod } from '@/lib/guides';
import { absoluteUrl } from '@/lib/utils';

import ServerJsonLd from '@/components/structured-data/server-json-ld';
import Breadcrumb from '@/components/ui/breadcrumb';
import Container from '@/components/ui/container';

const title = 'Guides to finding a dental clinic in Malaysia';
const description =
  'Practical guides for comparing dental clinics in Malaysia, choosing a nearby clinic, and handling an urgent visit.';

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: '/guides',
  },
  openGraph: {
    title,
    description,
    url: '/guides',
    type: 'website',
    locale: 'en_US',
    siteName: siteConfig.siteName,
    images: [
      {
        url: `/api/og?title=${encodeURIComponent(title)}`,
        width: 1200,
        height: 630,
        alt: title,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
    creator: siteConfig.creator,
    images: [`/api/og?title=${encodeURIComponent(title)}`],
  },
};

export default function GuidesIndexPage() {
  const guides = getAllGuides();
  const [featured, ...rest] = guides;
  const pageUrl = absoluteUrl('/guides');

  const breadcrumbItems = [{ name: 'Guides' }];

  return (
    <>
      <ServerJsonLd
        id="guides-collection-jsonld"
        data={{
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: title,
          description,
          url: pageUrl,
          inLanguage: 'en',
          dateModified: getGuidesIndexLastmod(),
          isPartOf: {
            '@type': 'WebSite',
            name: siteConfig.siteName,
            url: absoluteUrl('/'),
          },
          mainEntity: {
            '@type': 'ItemList',
            itemListElement: guides.map((guide, index) => ({
              '@type': 'ListItem',
              position: index + 1,
              url: absoluteUrl(`/guides/${guide.slug}`),
              name: guide.title,
            })),
          },
        }}
      />
      <ServerJsonLd
        id="guides-breadcrumb-jsonld"
        data={{
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            {
              '@type': 'ListItem',
              position: 1,
              name: 'Home',
              item: absoluteUrl('/'),
            },
            {
              '@type': 'ListItem',
              position: 2,
              name: 'Guides',
              item: pageUrl,
            },
          ],
        }}
      />

      <section className="border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <Container className="py-10 md:py-14">
          <Breadcrumb items={breadcrumbItems} />
          <h1 className="mt-4 max-w-3xl text-balance font-display text-[clamp(2rem,5vw,3.25rem)] font-black leading-[1.05] tracking-tight text-gray-900 dark:text-gray-50">
            Guides
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-gray-600 md:text-lg dark:text-gray-300">
            Practical notes on comparing a dental clinic, choosing one nearby, and what to do on an
            urgent visit in Malaysia.
          </p>
        </Container>
      </section>

      <Container className="py-10 md:py-14">
        {featured ? (
          <article className="overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
            <div className="grid min-w-0 items-stretch md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
              <Link
                href={`/guides/${featured.slug}`}
                prefetch={false}
                className="relative block min-h-56 border-b-0 hover:border-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900">
                <Image
                  src={featured.image}
                  alt={featured.imageAlt}
                  width={1200}
                  height={630}
                  priority
                  unoptimized
                  className="h-full w-full object-cover"
                />
              </Link>
              <div className="flex min-w-0 flex-col justify-center p-6 md:p-8">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-700 dark:text-blue-300">
                  Featured
                </p>
                <h2 className="mt-3 font-display text-2xl font-black text-gray-900 md:text-3xl dark:text-gray-50">
                  <Link
                    href={`/guides/${featured.slug}`}
                    prefetch={false}
                    className="!font-black hover:border-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900">
                    {featured.title}
                  </Link>
                </h2>
                <p className="mt-3 text-base leading-relaxed text-gray-600 dark:text-gray-300">
                  {featured.description}
                </p>
                <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                  {featured.readingTimeMinutes} min read
                  <span aria-hidden="true"> · </span>
                  <time dateTime={featured.updatedAt}>{formatGuideDate(featured.updatedAt)}</time>
                </p>
              </div>
            </div>
          </article>
        ) : null}

        {rest.length > 0 ? (
          <ul className="mt-10 divide-y divide-gray-200 border-y border-gray-200 dark:divide-gray-800 dark:border-gray-800">
            {rest.map((guide) => (
              <li key={guide.slug}>
                <Link
                  href={`/guides/${guide.slug}`}
                  prefetch={false}
                  className="block py-6 hover:border-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900">
                  <h2 className="font-display text-xl font-black text-gray-900 dark:text-gray-50">
                    {guide.title}
                  </h2>
                  <p className="mt-2 max-w-3xl text-base leading-relaxed text-gray-600 dark:text-gray-300">
                    {guide.description}
                  </p>
                  <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                    {guide.readingTimeMinutes} min read
                    <span aria-hidden="true"> · </span>
                    <time dateTime={guide.updatedAt}>{formatGuideDate(guide.updatedAt)}</time>
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        ) : null}
      </Container>
    </>
  );
}
