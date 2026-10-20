import { unstable_cache } from 'next/cache';
import Link from 'next/link';

import { Clinic, ClinicImage } from '@/types/clinic';
import { ArrowRight as ArrowRightIcon } from '@phosphor-icons/react/dist/ssr';

import { createAdminClient } from '@/lib/supabase';

import { ClinicCard } from '@/components/cards/clinic-card';
import { Button } from '@/components/ui/button';

import Container from '../ui/container';
import { Wrapper } from '../ui/wrapper';

const getRecentClinics = unstable_cache(
  async () => {
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from('clinics')
      .select(
        `
        id,
        name,
        slug,
        address,
        phone,
        postal_code,
        rating,
        images:clinic_images(id, image_url, imagekit_file_id, r2_url, r2_key, display_order),
        is_permanently_closed,
        open_on_public_holidays,
        is_featured,
        hours:clinic_hours(*),
        special_hours:clinic_special_hours(*),
        area:areas!inner(name),
        state:states!inner(name)
      `,
      )
      .eq('is_active', true)
      .order('modified_at', { ascending: false })
      .limit(4);

    if (error) {
      console.error('Error fetching recent clinics:', error);
      return [];
    }

    return (data as unknown as Partial<Clinic>[]) || [];
  },
  ['recent-clinics'],
  {
    revalidate: 2_592_000, // Cache for 30 days
    tags: ['recent-clinics'],
  },
);

export async function RecentClinics() {
  const clinics = await getRecentClinics();

  return (
    <Wrapper className="border-t border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-950/30">
      <Container className="min-w-0">
        <div className="mb-8 flex min-w-0 flex-col gap-3 md:mb-10 md:flex-row md:items-center md:justify-between">
          <div className="min-w-0 max-w-2xl">
            <h2 className="text-balance font-display text-2xl font-bold text-gray-900 md:text-3xl dark:text-gray-50">
              Recently updated clinics
            </h2>
            <p className="mt-2 text-base text-gray-600 dark:text-gray-300">
              Fresh listings with hours, contact details, and patient reviews.
            </p>
          </div>
          <Link
            href="/browse"
            prefetch={false}
            className="inline-flex shrink-0 items-center gap-1.5 self-start text-sm font-semibold text-blue-600 no-underline transition hover:text-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 md:self-auto dark:text-blue-400 dark:hover:text-blue-300 dark:focus-visible:outline-blue-400">
            View all clinics
            <ArrowRightIcon weight="duotone" className="size-4" aria-hidden="true" />
          </Link>
        </div>
        {clinics.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-gray-500 dark:text-gray-400">No recent clinics found.</p>
          </div>
        ) : (
          <>
            <div className="grid min-w-0 grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 md:gap-8 lg:grid-cols-4">
              {clinics.map((clinic) => {
                return (
                  <ClinicCard
                    key={clinic.id}
                    slug={clinic.slug || ''}
                    name={clinic.name || ''}
                    address={clinic.address || ''}
                    phone={clinic.phone || ''}
                    postalCode={clinic.postal_code || ''}
                    state={clinic.state?.name || ''}
                    area={clinic.area?.name || ''}
                    image={clinic.images?.[0] as ClinicImage | undefined}
                    rating={clinic.rating}
                    hours={clinic.hours || []}
                    specialHours={clinic.special_hours || []}
                    openOnPublicHolidays={clinic.open_on_public_holidays || false}
                  />
                );
              })}
            </div>
          </>
        )}
      </Container>
    </Wrapper>
  );
}
