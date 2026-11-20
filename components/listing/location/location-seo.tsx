import Link from 'next/link';

import { ArrowRight } from '@phosphor-icons/react/dist/ssr';

import { buildHubCopy, type HubGlanceStats, type HubLink } from '@/lib/listing/hub-copy';

type GuideLink = {
  slug: string;
  title: string;
  readingTimeMinutes: number;
};

export function LocationSeo({
  placeName,
  placeLabel,
  clinicCount,
  stats,
  links,
  guides,
}: {
  placeName: string;
  placeLabel: string;
  clinicCount: number;
  stats: HubGlanceStats;
  links: HubLink[];
  guides: GuideLink[];
}) {
  const copy = buildHubCopy(placeName, placeLabel, {
    ...stats,
    clinicCount,
  });

  return (
    <section className="mt-4 border-t border-gray-200 pt-10 dark:border-gray-800">
      <h2 className="text-balance font-display text-2xl font-bold text-gray-950 dark:text-white">
        About dental clinics in {placeName}
      </h2>
      <p className="mt-3 max-w-3xl text-base leading-7 text-gray-700 dark:text-gray-300">
        This page lists {clinicCount.toLocaleString('en-MY')} dental clinics in {placeLabel}. Compare
        them by rating, Sunday hours, WhatsApp, and services. A clinic with Sunday hours stored is
        not necessarily open this Sunday.
      </p>

      <section className="mt-10" aria-labelledby="location-faq">
        <h2
          id="location-faq"
          className="text-balance font-display text-2xl font-bold text-gray-950 dark:text-white"
        >
          {copy.faqHeading}
        </h2>
        <dl className="mt-4 max-w-3xl divide-y divide-gray-200 dark:divide-gray-800">
          {copy.faq.map((item) => (
            <div key={item.heading} className="py-4">
              <dt className="font-semibold text-gray-950 dark:text-white">{item.heading}</dt>
              <dd className="mt-1 text-sm leading-6 text-gray-700 dark:text-gray-300">{item.answer}</dd>
            </div>
          ))}
        </dl>
      </section>

      {links.length > 0 ? (
        <nav className="mt-10" aria-label="Related pages">
          <h2 className="font-display text-2xl font-bold text-gray-950 dark:text-white">
            {copy.relatedHeading}
          </h2>
          <ul className="mt-4 flex flex-wrap gap-2">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  prefetch={false}
                  className="inline-flex rounded-full border border-gray-200 px-3 py-1.5 text-sm font-semibold text-blue-700 no-underline hover:border-blue-300 hover:bg-blue-50 dark:border-gray-700 dark:text-blue-300 dark:hover:bg-blue-950"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}

      {guides.length > 0 ? (
        <section className="mt-10" aria-labelledby="location-guides">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2
              id="location-guides"
              className="font-display text-2xl font-bold text-gray-950 dark:text-white"
            >
              Guides
            </h2>
            <Link
              href="/guides"
              prefetch={false}
              className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600 no-underline hover:text-blue-700"
            >
              All guides
              <ArrowRight className="size-3.5" aria-hidden="true" />
            </Link>
          </div>
          <ul className="grid gap-3 sm:grid-cols-2">
            {guides.map((guide) => (
              <li key={guide.slug}>
                <Link
                  href={`/guides/${guide.slug}`}
                  prefetch={false}
                  className="block rounded-xl border border-gray-200 px-4 py-3 no-underline hover:border-blue-300 dark:border-gray-700"
                >
                  <span className="block text-sm font-semibold text-gray-950 dark:text-white">
                    {guide.title}
                  </span>
                  <span className="mt-1 block text-xs text-gray-500">{guide.readingTimeMinutes} min read</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </section>
  );
}
