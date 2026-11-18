const PUBLIC_REVIEW_STATUS = 'approved';

export type ReviewVisibilityChange = 'add' | 'remove' | 'none';

export function isPublicReviewStatus(status: string | null | undefined): boolean {
  return status === PUBLIC_REVIEW_STATUS;
}

/**
 * Public pages only render reviews with status `approved`.
 * pending, rejected, clinic_deleted, and clinic_rejected stay hidden.
 */
export function reviewVisibilityChange(
  fromStatus: string | null | undefined,
  toStatus: string,
): ReviewVisibilityChange {
  const wasPublic = isPublicReviewStatus(fromStatus);
  const willBePublic = isPublicReviewStatus(toStatus);

  if (wasPublic === willBePublic) {
    return 'none';
  }

  return willBePublic ? 'add' : 'remove';
}

export type ClinicAggregate = {
  rating: number | null;
  reviewCount: number;
};

function roundRating(value: number): number {
  return Math.round((value + Number.EPSILON) * 10000) / 10000;
}

/**
 * Adjust the stored clinic rating and review_count when one review enters or
 * leaves the public set. Google totals already live on the clinic row, so this
 * applies a one-review delta instead of recomputing from stored review rows.
 */
export function nextClinicAggregate(
  current: { rating: number | null; reviewCount: number | null },
  reviewRating: number | null,
  direction: Exclude<ReviewVisibilityChange, 'none'>,
): ClinicAggregate {
  const count = current.reviewCount ?? 0;
  const currentRating = current.rating ?? 0;

  if (direction === 'add') {
    const nextCount = count + 1;
    const addedRating = reviewRating ?? currentRating;
    return {
      rating: roundRating((currentRating * count + addedRating) / nextCount),
      reviewCount: nextCount,
    };
  }

  if (count <= 0) {
    return { rating: current.rating, reviewCount: 0 };
  }

  const nextCount = count - 1;
  if (nextCount === 0) {
    return { rating: null, reviewCount: 0 };
  }

  const removedRating = reviewRating ?? currentRating;
  const nextRating = (currentRating * count - removedRating) / nextCount;

  return {
    rating: roundRating(Math.max(0, nextRating)),
    reviewCount: nextCount,
  };
}
