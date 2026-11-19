'use server';

import { z } from 'zod';

import { isAdminUser } from '@/lib/auth/is-admin';
import { revalidateReviewSurfaces } from '@/lib/listing/revalidate-review';
import { nextClinicAggregate, reviewVisibilityChange } from '@/lib/reviews/aggregate';
import { createAdminClient, createServerClient } from '@/lib/supabase';

const moderateReviewsSchema = z.object({
  reviewIds: z.array(z.string().uuid()).min(1).max(100),
  status: z.enum(['approved', 'rejected']),
});

type ModerateReviewsResult = { ok: true; updated: number } | { ok: false; error: string };

type ReviewRow = {
  id: string;
  status: string | null;
  rating: number | null;
  clinic_id: string;
  clinic: {
    id: string;
    slug: string | null;
    rating: number | null;
    review_count: number | null;
  } | null;
};

function asNumber(value: number | string | null | undefined): number | null {
  if (value == null || value === '') {
    return null;
  }

  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function oneClinic(
  clinic: ReviewRow['clinic'] | NonNullable<ReviewRow['clinic']>[] | null | undefined,
): ReviewRow['clinic'] {
  if (!clinic) {
    return null;
  }

  return Array.isArray(clinic) ? (clinic[0] ?? null) : clinic;
}

export async function moderateClinicReviews(
  reviewIds: string[],
  status: 'approved' | 'rejected',
): Promise<ModerateReviewsResult> {
  const parsed = moderateReviewsSchema.safeParse({ reviewIds, status });
  if (!parsed.success) {
    return { ok: false, error: 'Choose at least one review to update.' };
  }

  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: 'You need to be signed in to moderate reviews.' };
  }

  if (!isAdminUser(user.email)) {
    return { ok: false, error: 'You do not have permission to moderate reviews.' };
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from('clinic_reviews')
    .select('id, status, rating, clinic_id, clinic:clinics(id, slug, rating, review_count)')
    .in('id', parsed.data.reviewIds);

  if (error) {
    console.error('Error loading reviews for moderation:', error);
    return { ok: false, error: 'Could not load those reviews.' };
  }

  const reviews = (
    (data ?? []) as unknown as Array<
      Omit<ReviewRow, 'clinic'> & {
        clinic: ReviewRow['clinic'] | NonNullable<ReviewRow['clinic']>[] | null;
      }
    >
  ).map((review) => ({
    ...review,
    rating: asNumber(review.rating),
    clinic: oneClinic(review.clinic),
  }));

  const changes = reviews.filter((review) => review.status !== parsed.data.status);
  if (changes.length === 0) {
    return { ok: true, updated: 0 };
  }

  const previousStatuses = changes.map((review) => ({
    id: review.id,
    status: review.status,
  }));

  const { error: updateError } = await admin
    .from('clinic_reviews')
    .update({ status: parsed.data.status })
    .in(
      'id',
      changes.map((review) => review.id),
    );

  if (updateError) {
    console.error('Error updating review status:', updateError);
    return { ok: false, error: 'Could not update the review status.' };
  }

  const clinics = new Map<
    string,
    {
      slug: string | null;
      rating: number | null;
      reviewCount: number | null;
      hasClinicRow: boolean;
      changes: Array<'add' | 'remove'>;
      ratings: Array<number | null>;
    }
  >();

  for (const review of changes) {
    const visibility = reviewVisibilityChange(review.status, parsed.data.status);
    if (visibility === 'none') {
      continue;
    }

    const clinicId = review.clinic?.id ?? review.clinic_id;
    const existing = clinics.get(clinicId) ?? {
      slug: review.clinic?.slug ?? null,
      rating: asNumber(review.clinic?.rating),
      reviewCount: asNumber(review.clinic?.review_count),
      hasClinicRow: Boolean(review.clinic),
      changes: [],
      ratings: [],
    };
    existing.hasClinicRow = existing.hasClinicRow || Boolean(review.clinic);
    existing.changes.push(visibility);
    existing.ratings.push(review.rating);
    clinics.set(clinicId, existing);
  }

  const aggregateWrites: Array<{
    clinicId: string;
    slug: string | null;
    rating: number | null;
    reviewCount: number;
    previousRating: number | null;
    previousReviewCount: number | null;
    hasClinicRow: boolean;
  }> = [];

  for (const [clinicId, clinic] of clinics) {
    let aggregate = { rating: clinic.rating, reviewCount: clinic.reviewCount };

    if (clinic.hasClinicRow) {
      clinic.changes.forEach((direction, index) => {
        aggregate = nextClinicAggregate(aggregate, clinic.ratings[index] ?? null, direction);
      });
    }

    aggregateWrites.push({
      clinicId,
      slug: clinic.slug,
      rating: aggregate.rating,
      reviewCount: aggregate.reviewCount ?? 0,
      previousRating: clinic.rating,
      previousReviewCount: clinic.reviewCount,
      hasClinicRow: clinic.hasClinicRow,
    });
  }

  const appliedAggregates: Array<(typeof aggregateWrites)[number]> = [];

  for (const write of aggregateWrites) {
    if (!write.hasClinicRow) {
      continue;
    }

    const { error: clinicError } = await admin
      .from('clinics')
      .update({
        rating: write.rating,
        review_count: write.reviewCount,
      })
      .eq('id', write.clinicId);

    if (clinicError) {
      console.error('Error updating clinic review aggregate:', clinicError);
      await restoreReviewStatuses(previousStatuses);
      await restoreClinicAggregates(appliedAggregates);
      return {
        ok: false,
        error: 'Could not update the clinic rating. The review status was left unchanged.',
      };
    }

    appliedAggregates.push(write);
  }

  for (const write of aggregateWrites) {
    revalidateReviewSurfaces({
      clinicId: write.clinicId,
      clinicSlug: write.slug,
      homepageRatingChanged: write.hasClinicRow,
    });
  }

  return { ok: true, updated: changes.length };
}

async function restoreClinicAggregates(
  writes: Array<{
    clinicId: string;
    previousRating: number | null;
    previousReviewCount: number | null;
  }>,
) {
  const admin = createAdminClient();

  await Promise.all(
    writes.map(async (write) => {
      const { error } = await admin
        .from('clinics')
        .update({
          rating: write.previousRating,
          review_count: write.previousReviewCount,
        })
        .eq('id', write.clinicId);

      if (error) {
        console.error(`Error restoring clinic ${write.clinicId} rating:`, error);
      }
    }),
  );
}

async function restoreReviewStatuses(
  previousStatuses: Array<{ id: string; status: string | null }>,
) {
  const admin = createAdminClient();

  await Promise.all(
    previousStatuses.map(async (review) => {
      const { error } = await admin
        .from('clinic_reviews')
        .update({ status: review.status })
        .eq('id', review.id);

      if (error) {
        console.error(`Error restoring review ${review.id} status:`, error);
      }
    }),
  );
}
