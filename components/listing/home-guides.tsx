import Link from 'next/link';

import { ArrowRight as ArrowRightIcon } from '@phosphor-icons/react/dist/ssr';

import { guideCategoryHref } from '@/lib/guide-categories';
import { getGuideCategories } from '@/lib/guides';

import { GuideCoverCard } from '@/components/guides/guide-cover-card';
import Container from '@/components/ui/container';

export function HomeGuides() {
  const categories = getGuideCategories();

  if (categories.length === 0) {
    return null;
  }

  return (
    <section className="border-t border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
      <Container className="py-12 md:py-14">
        <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0 max-w-xl">
            <h2 className="font-display text-2xl font-bold text-gray-900 md:text-3xl dark:text-gray-50">
              Guides
            </h2>
            <p className="mt-2 text-base text-gray-600 dark:text-gray-300">
              Jump to a topic: finding a clinic, braces, everyday tooth care, or treatment.
            </p>
          </div>
          <Link
            href="/guides"
            prefetch={false}
            className="inline-flex min-h-11 items-center text-sm font-semibold">
            All guides
            <ArrowRightIcon weight="duotone" className="ms-1 size-4" aria-hidden="true" />
          </Link>
        </div>
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map(({ category, guides }) => {
            const cover = guides[0];
            if (!cover) return null;

            return (
              <li key={category.id} className="min-w-0">
                <GuideCoverCard
                  href={guideCategoryHref(category.id)}
                  image={cover.image}
                  title={category.title}
                  description={category.description}
                  meta={`${guides.length} guides`}
                />
              </li>
            );
          })}
        </ul>
      </Container>
    </section>
  );
}
