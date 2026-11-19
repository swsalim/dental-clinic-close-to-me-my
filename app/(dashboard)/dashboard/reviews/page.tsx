import { Metadata } from 'next';
import Link from 'next/link';

import { siteConfig } from '@/config/site';

import { isAdminUser } from '@/lib/auth/is-admin';
import { createServerClient } from '@/lib/supabase';

import {
  DASHBOARD_REVIEW_PAGE_SIZE,
  getDashboardReviews,
  type ReviewFilter,
} from '@/helpers/reviews';

import { Button } from '@/components/ui/button';

import { ReviewModerationTable } from './review-moderation-table';

export const dynamic = 'force-dynamic';

const config = {
  title: 'Reviews',
  description: 'Moderate patient reviews before they appear on clinic pages',
  url: '/dashboard/reviews',
};

const FILTERS: Array<{ value: ReviewFilter; label: string }> = [
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'all', label: 'All' },
];

export const metadata: Metadata = {
  title: config.title,
  description: config.description,
  alternates: {
    canonical: config.url,
  },
  openGraph: {
    title: config.title,
    description: config.description,
    url: config.url,
    images: [
      {
        url: siteConfig.openGraph.image,
        width: siteConfig.openGraph.width,
        height: siteConfig.openGraph.height,
        alt: config.title,
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    title: config.title,
    description: config.description,
    card: 'summary_large_image',
    creator: siteConfig.creator,
    images: [
      {
        url: siteConfig.openGraph.image,
        width: siteConfig.openGraph.width,
        height: siteConfig.openGraph.height,
        alt: config.title,
      },
    ],
  },
};

function filterHref(status: ReviewFilter, page?: number) {
  const params = new URLSearchParams();
  if (status !== 'pending') {
    params.set('status', status);
  }
  if (page && page > 1) {
    params.set('page', String(page));
  }
  const query = params.toString();
  return query ? `/dashboard/reviews?${query}` : '/dashboard/reviews';
}

export default async function DashboardReviewsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string }>;
}) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!isAdminUser(user?.email)) {
    return (
      <div className="space-y-2">
        <h1 className="font-display text-2xl font-bold text-gray-900 dark:text-gray-50">Reviews</h1>
        <p className="max-w-2xl text-sm text-gray-600 dark:text-gray-300">
          This page is limited to admin accounts. Review submissions stay hidden from other
          signed-in users.
        </p>
      </div>
    );
  }

  const params = await searchParams;
  const { filter, page, reviews, counts } = await getDashboardReviews({
    status: params.status,
    page: params.page,
  });
  const total = counts[filter];
  const pageCount = Math.max(1, Math.ceil(total / DASHBOARD_REVIEW_PAGE_SIZE));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-gray-900 dark:text-gray-50">Reviews</h1>
        <p className="mt-1 max-w-2xl text-sm text-gray-600 dark:text-gray-300">
          Patient submissions stay pending until you approve them. Approved reviews show on the
          clinic page and in the latest reviews on the homepage.
        </p>
      </div>

      <nav aria-label="Filter reviews by status" className="flex flex-wrap gap-2">
        {FILTERS.map((item) => {
          const isCurrent = item.value === filter;
          return (
            <Link
              key={item.value}
              href={filterHref(item.value)}
              aria-current={isCurrent ? 'page' : undefined}
              className={
                isCurrent
                  ? 'rounded-md border border-blue-600 bg-blue-500 px-3 py-2 text-sm font-medium text-white'
                  : 'rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:border-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200'
              }>
              {item.label}
              <span className="ml-2 tabular-nums">
                {counts[item.value].toLocaleString('en-MY')}
              </span>
            </Link>
          );
        })}
      </nav>

      <ReviewModerationTable reviews={reviews} />

      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Page {Math.min(page, pageCount)} of {pageCount}
        </p>
        <div className="flex gap-2">
          {page > 1 ? (
            <Button asChild variant="outline" className="px-3 py-2 text-sm">
              <Link href={filterHref(filter, page - 1)}>Previous</Link>
            </Button>
          ) : (
            <Button variant="outline" className="px-3 py-2 text-sm" disabled>
              Previous
            </Button>
          )}
          {page < pageCount ? (
            <Button asChild variant="outline" className="px-3 py-2 text-sm">
              <Link href={filterHref(filter, page + 1)}>Next</Link>
            </Button>
          ) : (
            <Button variant="outline" className="px-3 py-2 text-sm" disabled>
              Next
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
