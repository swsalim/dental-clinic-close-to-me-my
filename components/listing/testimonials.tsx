import Link from 'next/link';

import { getTestimonials } from '@/helpers/clinics';

import { RelativeTime } from '@/components/listing/relative-time';
import { MAX_TEXT_LENGTH, truncateText } from '@/components/listing/testimonials-utils';
import Container from '@/components/ui/container';
import { StarRating } from '@/components/ui/star-rating';
import { Wrapper } from '@/components/ui/wrapper';

interface Testimonial {
  id: string;
  clinic_id: string;
  author_name: string;
  review_time: string | null;
  rating: number | null;
  text: string;
  clinic_name: string;
  clinic_slug: string;
}

export async function Testimonials() {
  const testimonials = await getTestimonials(8);

  if (testimonials.length === 0) {
    return null;
  }

  return (
    <Wrapper className="border-t border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-950/30">
      <Container className="min-w-0">
        <div className="mb-8 max-w-2xl md:mb-10">
          <h2 className="font-display text-balance text-2xl font-bold text-gray-900 md:text-3xl dark:text-gray-50">
            What patients say
          </h2>
          <p className="mt-2 text-base text-gray-600 dark:text-gray-300">
            Reviews from people who visited clinics in the directory.
          </p>
        </div>

        <ul className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {testimonials.map((testimonial: Testimonial) => (
            <li key={testimonial.id} className="min-w-0">
              <Link
                href={`/place/${testimonial.clinic_slug}`}
                prefetch={false}
                className="group flex h-full min-h-11 flex-col rounded-lg border border-gray-200 bg-white p-5 no-underline transition hover:border-blue-200 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:border-gray-700 dark:bg-gray-900 dark:hover:border-blue-800 dark:focus-visible:ring-offset-gray-950">
                <div className="min-w-0">
                  <h3 className="font-display truncate text-base font-semibold text-gray-900 dark:text-gray-50">
                    {testimonial.clinic_name}
                  </h3>
                  {testimonial.review_time ? (
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      <RelativeTime date={testimonial.review_time} />
                    </p>
                  ) : null}
                  {testimonial.rating ? (
                    <StarRating
                      rating={testimonial.rating}
                      showValue={false}
                      className="mt-2"
                    />
                  ) : null}
                </div>
                <blockquote className="mt-4 line-clamp-4 flex-1 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                  &ldquo;{truncateText(testimonial.text, MAX_TEXT_LENGTH)}&rdquo;
                </blockquote>
                <footer className="mt-4 text-sm font-medium text-gray-900 dark:text-gray-100">
                  {testimonial.author_name}
                </footer>
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </Wrapper>
  );
}
