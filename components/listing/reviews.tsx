import { ClinicReview } from '@/types/clinic';

import { Card, CardContent, CardFooter, CardHeader } from '../ui/card';
import { StarRating } from '../ui/star-rating';
import { TruncatedText } from '../ui/truncated-text';
import { RelativeTime } from './relative-time';

interface ReviewsProps {
  reviews: Partial<ClinicReview>[];
  reviewCount?: number | null;
}

export default function Reviews({ reviews, reviewCount }: ReviewsProps) {
  if (!reviews || reviews.length === 0) {
    return null;
  }

  const totalReviews = reviewCount ?? reviews.length;
  const showingAll = reviews.length >= totalReviews;

  return (
    <article id="reviews">
      <h2 className="font-display dark:text-gray-50">Reviews</h2>
      {!showingAll && (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Showing the latest {reviews.length} of {totalReviews} reviews.
        </p>
      )}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {reviews.map(({ author_name, rating, text, review_time }) => (
          <Card key={`${author_name}-${review_time}`}>
            <CardHeader>
              <StarRating rating={rating ?? 0} showValue={false} />
            </CardHeader>
            {text && (
              <CardContent>
                <TruncatedText text={text} />
              </CardContent>
            )}
            <CardFooter className="flex flex-col items-start gap-1">
              <span className="text-base font-semibold text-gray-700 dark:text-gray-50">
                {author_name}
              </span>
              {review_time && (
                <RelativeTime
                  date={review_time}
                  className="text-sm text-gray-500 dark:text-gray-300"
                />
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
    </article>
  );
}
