import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { siteConfig } from '@/config/site';

import {
  formatGuideDate,
  getAllGuides,
  getGuide,
  getRelatedGuides,
  type Guide,
} from '@/lib/guides';
import { absoluteUrl } from '@/lib/utils';

import { GuideBody } from '@/components/guides/guide-body';
import { MarkdownText } from '@/components/guides/markdown-text';
import ServerJsonLd from '@/components/structured-data/server-json-ld';
import Breadcrumb from '@/components/ui/breadcrumb';
import Container from '@/components/ui/container';

type GuidePageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamic = 'force-static';
export const dynamicParams = false;

export function generateStaticParams() {
  return getAllGuides().map((guide) => ({ slug: guide.slug }));
}

export async function generateMetadata({ params }: GuidePageProps): Promise<Metadata> {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) {
    return {};
  }

  const canonical = `/guides/${guide.slug}`;
  const ogImage = `/api/og?title=${encodeURIComponent(guide.title)}`;

  return {
    title: guide.title,
    description: guide.description,
    alternates: {
      canonical,
    },
    openGraph: {
      title: guide.title,
      description: guide.description,
      url: canonical,
      type: 'article',
      locale: 'en_US',
      siteName: siteConfig.siteName,
      publishedTime: guide.publishedAt,
      modifiedTime: guide.updatedAt,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: guide.imageAlt,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: guide.title,
      description: guide.description,
      creator: siteConfig.creator,
      images: [ogImage],
    },
  };
}

function organization() {
  return {
    '@type': 'Organization' as const,
    name: siteConfig.siteName,
    url: absoluteUrl('/'),
    logo: {
      '@type': 'ImageObject' as const,
      url: absoluteUrl('/images/logo.png'),
    },
  };
}

export default async function GuidePage({ params }: GuidePageProps) {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) {
    notFound();
  }

  const related = getRelatedGuides(guide);
  const pageUrl = absoluteUrl(`/guides/${guide.slug}`);
  const publisher = organization();

  return (
    <>
      <ServerJsonLd
        id="guide-article-jsonld"
        data={{
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: guide.title,
          description: guide.description,
          datePublished: guide.publishedAt,
          dateModified: guide.updatedAt,
          image: absoluteUrl(guide.image),
          mainEntityOfPage: pageUrl,
          author: publisher,
          publisher,
          keywords: guide.primaryKeyword,
        }}
      />
      <ServerJsonLd
        id="guide-breadcrumb-jsonld"
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
              item: absoluteUrl('/guides'),
            },
            {
              '@type': 'ListItem',
              position: 3,
              name: guide.title,
              item: pageUrl,
            },
          ],
        }}
      />
      <ServerJsonLd
        id="guide-faq-jsonld"
        data={{
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: guide.faq.map((item) => ({
            '@type': 'Question',
            name: item.question,
            acceptedAnswer: {
              '@type': 'Answer',
              text: item.answer,
            },
          })),
        }}
      />

      <article>
        <header className="border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
          <Container className="py-10 md:py-14">
            <Breadcrumb items={[{ name: 'Guides', url: '/guides' }, { name: guide.title }]} />
            <div className="mt-6 grid min-w-0 items-center gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(16rem,22rem)]">
              <div className="min-w-0">
                <h1 className="text-balance font-display text-[clamp(2rem,4.5vw,3rem)] font-bold leading-[1.1] tracking-tight text-gray-900 dark:text-gray-50">
                  {guide.title}
                </h1>
                <p className="mt-4 max-w-2xl text-base leading-relaxed text-gray-600 md:text-lg dark:text-gray-300">
                  {guide.description}
                </p>
                <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                  Published{' '}
                  <time dateTime={guide.publishedAt}>{formatGuideDate(guide.publishedAt)}</time>
                  <span aria-hidden="true"> · </span>
                  Updated <time dateTime={guide.updatedAt}>{formatGuideDate(guide.updatedAt)}</time>
                  <span aria-hidden="true"> · </span>
                  {guide.readingTimeMinutes} min read
                </p>
              </div>
              <Image
                src={guide.image}
                alt={guide.imageAlt}
                width={1200}
                height={630}
                priority
                unoptimized
                className="h-auto w-full rounded-lg border border-gray-200 dark:border-gray-800"
              />
            </div>
          </Container>
        </header>

        <Container className="grid min-w-0 gap-10 py-10 lg:grid-cols-[minmax(0,1fr)_16rem] lg:py-14">
          <div className="min-w-0">
            <section
              aria-labelledby="short-version"
              className="dark:bg-blue-950/40 rounded-lg border border-blue-200 bg-blue-50 p-5 dark:border-blue-900"
            >
              <h2
                id="short-version"
                className="font-display text-xl font-bold text-gray-900 dark:text-gray-50"
              >
                The short version
              </h2>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-base leading-relaxed text-gray-700 dark:text-gray-200">
                {guide.summary.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>

            <p className="mt-6 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
              This page is general information, not medical advice — consult a registered
              practitioner.
            </p>

            <nav aria-label="On this page" className="mt-8">
              <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-gray-500">
                On this page
              </h2>
              <ol className="mt-3 list-decimal space-y-2 pl-5 text-base">
                {guide.headings.map((heading) => (
                  <li key={heading.id}>
                    <a href={`#${heading.id}`}>{heading.text}</a>
                  </li>
                ))}
              </ol>
            </nav>

            <div className="mt-10">
              <GuideBody blocks={guide.blocks} />
            </div>

            <section aria-labelledby="guide-faq" className="mt-12">
              <h2
                id="guide-faq"
                className="font-display text-2xl font-bold text-gray-900 dark:text-gray-50"
              >
                Common questions
              </h2>
              <div className="mt-4 divide-y divide-gray-200 border-y border-gray-200 dark:divide-gray-800 dark:border-gray-800">
                {guide.faq.map((item) => (
                  <details key={item.question} className="group py-4" open>
                    <summary className="cursor-pointer text-base font-semibold text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:text-gray-50">
                      {item.question}
                    </summary>
                    <p className="mt-2 text-base leading-relaxed text-gray-600 dark:text-gray-300">
                      <MarkdownText text={item.answer} />
                    </p>
                  </details>
                ))}
              </div>
            </section>

            <FindAClinic guide={guide} />
          </div>

          <aside className="min-w-0 lg:pt-2">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-gray-500">
              Directory
            </p>
            <ul className="mt-3 space-y-2">
              {guide.relatedLinks.slice(0, 6).map((link) => (
                <li key={link.href}>
                  <Link href={link.href} prefetch={false} className="text-sm">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </aside>
        </Container>

        {related.length > 0 ? (
          <section className="border-t border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-950/40">
            <Container className="py-10 md:py-14">
              <h2 className="font-display text-2xl font-bold text-gray-900 dark:text-gray-50">
                Related guides
              </h2>
              <ul className="mt-6 grid gap-6 md:grid-cols-2">
                {related.map((item) => (
                  <li key={item.slug} className="min-w-0">
                    <Link
                      href={`/guides/${item.slug}`}
                      prefetch={false}
                      className="block hover:border-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900"
                    >
                      <h3 className="font-display text-lg font-bold text-gray-900 dark:text-gray-50">
                        {item.title}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                        {item.description}
                      </p>
                      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                        {item.readingTimeMinutes} min read
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            </Container>
          </section>
        ) : null}
      </article>
    </>
  );
}

function FindAClinic({ guide }: { guide: Guide }) {
  return (
    <section
      aria-labelledby="find-a-clinic"
      className="mt-12 rounded-lg border border-gray-200 p-5 dark:border-gray-800"
    >
      <h2
        id="find-a-clinic"
        className="font-display text-2xl font-bold text-gray-900 dark:text-gray-50"
      >
        Find a clinic
      </h2>
      <p className="mt-2 text-base leading-relaxed text-gray-600 dark:text-gray-300">
        Open a state or city page, read the profiles, and call the clinic to confirm hours and fees.
      </p>
      <ul className="mt-4 space-y-3">
        {guide.relatedLinks.map((link) => (
          <li key={link.href}>
            <Link href={link.href} prefetch={false} className="font-semibold">
              {link.label}
            </Link>
            {link.description ? (
              <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                {link.description}
              </p>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
}
