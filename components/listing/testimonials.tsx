import Link from 'next/link';

import { getTestimonials } from '@/helpers/clinics';

import { RelativeTime } from '@/components/listing/relative-time';
import { MAX_TEXT_LENGTH, truncateText } from '@/components/listing/testimonials-utils';
import Container from '@/components/ui/container';
import { Button } from '@/components/ui/moving-border';
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
    <Wrapper className="bg-white dark:bg-gray-950">
      <Container>
        <div className="mb-10 flex flex-col items-center text-center md:mb-12">
          <h2 className="mb-4 text-3xl font-black text-black md:text-4xl dark:text-gray-50">
            What users say?
          </h2>
          <p className="text-lg text-gray-500 dark:text-gray-300">
            Real reviews from patients who visited our dental clinics
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {testimonials.map((testimonial: Testimonial) => (
            <div key={testimonial.id}>
              <Button className="relative overflow-hidden rounded-xl p-[1px]">
                <Link
                  href={`/place/${testimonial.clinic_slug}`}
                  className="group relative flex cursor-pointer flex-col rounded-xl bg-white p-6 text-start shadow-md outline-none transition hover:shadow-lg focus:ring-2 focus:ring-red-400 dark:bg-gray-950 dark:text-gray-50"
                  style={{ borderRadius: 'calc(0.75rem * 0.96)' }}
                  role="button"
                  prefetch={false}>
                  <div className="mb-4 flex items-start justify-start gap-4">
                    <div className="flex-1">
                      <h3 className="mb-1 text-base font-semibold text-black dark:text-gray-50">
                        {testimonial.clinic_name}
                      </h3>
                      {testimonial.review_time && (
                        <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">
                          <RelativeTime date={testimonial.review_time} />
                        </p>
                      )}
                      {testimonial.rating && (
                        <StarRating
                          rating={testimonial.rating}
                          showValue={false}
                          className="mt-1"
                        />
                      )}
                    </div>
                  </div>
                  <p className="line-clamp-4 text-gray-700 dark:text-gray-300">
                    &ldquo;{truncateText(testimonial.text, MAX_TEXT_LENGTH)}&rdquo;
                  </p>
                  <p className="mt-4 text-right text-sm font-semibold text-gray-700 dark:text-gray-50">
                    {testimonial.author_name}
                  </p>
                </Link>
              </Button>
            </div>
          ))}
        </div>
      </Container>
    </Wrapper>
  );
}
