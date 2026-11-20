import Link from 'next/link';

import { buildHubCopy, type HubGlanceStats, type HubLink } from '@/lib/listing/hub-copy';

export function HubGlance({
  placeName,
  placeLabel,
  stats,
  links,
}: {
  placeName: string;
  placeLabel: string;
  stats: HubGlanceStats;
  links: HubLink[];
}) {
  const copy = buildHubCopy(placeName, placeLabel, stats);

  return (
    <section
      className="mb-10 rounded-xl border border-gray-200 bg-white p-4 md:p-6 dark:border-gray-700 dark:bg-gray-900"
      aria-labelledby="hub-at-a-glance"
    >
      <h2
        id="hub-at-a-glance"
        className="text-balance font-display text-xl font-bold text-gray-900 md:text-2xl dark:text-gray-50"
      >
        {copy.atAGlanceLabel}
      </h2>
      <dl className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        {copy.rows.map((row) => (
          <div key={row.label} className="rounded-lg bg-gray-50 px-3 py-3 dark:bg-gray-800">
            <dt className="text-sm text-gray-600 dark:text-gray-300">{row.label}</dt>
            <dd className="font-display text-2xl font-bold tabular-nums text-gray-900 dark:text-gray-50">
              {row.value}
            </dd>
          </div>
        ))}
      </dl>

      <div className="mt-8 flex flex-col gap-6">
        {copy.questions.map((question) => (
          <div key={question.heading}>
            <h2 className="text-balance font-display text-xl font-bold text-gray-900 md:text-2xl dark:text-gray-50">
              {question.heading}
            </h2>
            <p className="mt-2 text-base text-gray-700 dark:text-gray-300">{question.answer}</p>
          </div>
        ))}
      </div>

      <section className="mt-8" aria-labelledby="hub-faq">
        <h2
          id="hub-faq"
          className="text-balance font-display text-xl font-bold text-gray-900 md:text-2xl dark:text-gray-50"
        >
          {copy.faqHeading}
        </h2>
        <dl className="mt-4 divide-y divide-gray-200 dark:divide-gray-800">
          {copy.faq.map((item) => (
            <div key={item.heading} className="py-3">
              <dt className="font-semibold text-gray-900 dark:text-gray-50">{item.heading}</dt>
              <dd className="mt-1 text-sm leading-6 text-gray-700 dark:text-gray-300">
                {item.answer}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <nav className="mt-8" aria-label="Related pages">
        <h2 className="text-balance font-display text-xl font-bold text-gray-900 md:text-2xl dark:text-gray-50">
          {copy.relatedHeading}
        </h2>
        <ul className="mt-3 flex flex-col gap-2">
          {links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                prefetch={false}
                className="text-sm font-semibold text-blue-600 no-underline hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </section>
  );
}
