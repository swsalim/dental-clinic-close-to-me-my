import { createAdminClient } from '@/lib/supabase';

export const DASHBOARD_REVIEW_PAGE_SIZE = 50;

export const REVIEW_FILTERS = ['pending', 'approved', 'rejected', 'all'] as const;

export type ReviewFilter = (typeof REVIEW_FILTERS)[number];

export type ReviewStatusCounts = Record<ReviewFilter, number>;

export type DashboardReview = {
  id: string;
  authorName: string;
  email: string | null;
  rating: number | null;
  text: string | null;
  submittedAt: string | null;
  source: string | null;
  status: string | null;
  clinic: {
    name: string;
    slug: string;
  } | null;
};

type ClinicEmbed = {
  name: string;
  slug: string;
};

function parseFilter(value: string | undefined): ReviewFilter {
  if (value === 'approved' || value === 'rejected' || value === 'all') {
    return value;
  }

  return 'pending';
}

function parsePage(value: string | undefined): number {
  const page = Number(value);
  if (!Number.isInteger(page) || page < 1) {
    return 1;
  }

  return page;
}

function oneClinic(clinic: ClinicEmbed | ClinicEmbed[] | null): ClinicEmbed | null {
  if (!clinic) {
    return null;
  }

  return Array.isArray(clinic) ? (clinic[0] ?? null) : clinic;
}

export async function getDashboardReviews(input: { status?: string; page?: string }): Promise<{
  filter: ReviewFilter;
  page: number;
  pageSize: number;
  reviews: DashboardReview[];
  counts: ReviewStatusCounts;
}> {
  const filter = parseFilter(input.status);
  const page = parsePage(input.page);
  const supabase = createAdminClient();

  const countFor = (status?: Exclude<ReviewFilter, 'all'>) => {
    let query = supabase.from('clinic_reviews').select('id', { count: 'exact', head: true });
    if (status) {
      query = query.eq('status', status);
    }
    return query;
  };

  const from = (page - 1) * DASHBOARD_REVIEW_PAGE_SIZE;
  const to = from + DASHBOARD_REVIEW_PAGE_SIZE - 1;

  let listQuery = supabase
    .from('clinic_reviews')
    .select(
      `
        id,
        author_name,
        email,
        rating,
        text,
        review_time,
        created_at,
        source,
        status,
        clinic:clinics (
          name,
          slug
        )
      `,
    )
    .order('created_at', { ascending: false })
    .range(from, to);

  if (filter !== 'all') {
    listQuery = listQuery.eq('status', filter);
  }

  const [pending, approved, rejected, all, list] = await Promise.all([
    countFor('pending'),
    countFor('approved'),
    countFor('rejected'),
    countFor(),
    listQuery,
  ]);

  const countError = pending.error || approved.error || rejected.error || all.error;
  if (countError) {
    console.error('Error counting dashboard reviews:', countError);
    throw new Error('Failed to count reviews');
  }

  if (list.error) {
    console.error('Error fetching dashboard reviews:', list.error);
    throw new Error('Failed to load reviews');
  }

  const reviews = (list.data ?? []).map((review) => {
    const clinic = oneClinic(review.clinic as ClinicEmbed | ClinicEmbed[] | null);

    return {
      id: review.id,
      authorName: review.author_name,
      email: review.email,
      rating: review.rating,
      text: review.text,
      submittedAt: review.created_at ?? review.review_time,
      source: review.source,
      status: review.status,
      clinic: clinic ? { name: clinic.name, slug: clinic.slug } : null,
    } satisfies DashboardReview;
  });

  return {
    filter,
    page,
    pageSize: DASHBOARD_REVIEW_PAGE_SIZE,
    reviews,
    counts: {
      pending: pending.count ?? 0,
      approved: approved.count ?? 0,
      rejected: rejected.count ?? 0,
      all: all.count ?? 0,
    },
  };
}
