import { revalidatePath, revalidateTag } from 'next/cache';

/**
 * Drop the cached homepage and one clinic page after a review becomes public
 * or stops being public.
 *
 * There is no Redis layer. Public review data lives in Next.js caches:
 * - Data Cache (`unstable_cache`): homepage testimonials use tags `reviews`
 *   and `testimonials` for 30 days. The clinic page uses tag `clinic-{slug}`
 *   (rating, review_count, and the approved review list from get_clinic_by_slug).
 *   `getClinicReviews` also uses `reviews`. `recent-clinics` is the homepage
 *   block that embeds clinic ratings.
 * - Full Route Cache: `/` and `/place/{slug}` are statically cached. Tag
 *   invalidation does not purge that HTML, so the paths are revalidated too.
 *
 * Listing directories keep their own caches. This does not touch the shared
 * `clinics`, `states`, or `areas` tags.
 */
export function revalidateReviewSurfaces(input: {
  clinicId: string;
  clinicSlug?: string | null;
  /** True when clinics.rating / review_count (and modified_at) were written. */
  homepageRatingChanged?: boolean;
}) {
  revalidateTag('reviews');
  revalidateTag('testimonials');
  revalidateTag(`clinic-reviews-${input.clinicId}`);
  revalidatePath('/', 'page');

  if (input.homepageRatingChanged) {
    revalidateTag('recent-clinics');
  }

  if (input.clinicSlug) {
    revalidateTag(`clinic-${input.clinicSlug}`);
    revalidatePath(`/place/${input.clinicSlug}`, 'page');
  }
}
