import { unstable_cache } from 'next/cache';
import Link from 'next/link';

import { Clinic, ClinicImage } from '@/types/clinic';

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
        images:clinic_images(image_url, imagekit_file_id),
        open_on_public_holidays,
        hours:clinic_hours(*),
        special_hours:clinic_special_hours(*),
        area:areas!inner(name),
        state:states!inner(name)
      `,
      )
      .eq('is_active', true)
      .order('modified_at', { ascending: false })
      .limit(8);

    if (error) {
      console.error('Error fetching recent clinics:', error);
      return [];
    }

    return (data as unknown as Partial<Clinic>[]) || [];
  },
  ['recent-clinics'],
  {
    revalidate: 600, // Cache for 10 minutes
    tags: ['recent-clinics'],
  },
);

export async function RecentClinics() {
  const clinics = await getRecentClinics();

  return (
    <Wrapper>
      <Container>
        <div className="mb-10 flex flex-col gap-2 text-center md:mb-12">
          <h2 className="text-balance text-3xl font-black">
            Discover best dental clinics near you
          </h2>
          <p className="text-lg font-medium text-gray-500 dark:text-gray-300">
            Browse verified reviews, clinic hours, and contact details to book your visit.
          </p>
        </div>

        {clinics.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-gray-500">No recent clinics found.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 md:gap-8 lg:grid-cols-4">
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
                    image={
                      clinic.images?.[0]
                        ? (clinic.images[0] as unknown as ClinicImage).image_url
                        : undefined
                    }
                    rating={clinic.rating}
                    hours={clinic.hours || []}
                    specialHours={clinic.special_hours || []}
                    openOnPublicHolidays={clinic.open_on_public_holidays || false}
                  />
                );
              })}
            </div>
            <div className="mt-10 flex justify-center sm:mt-14">
              <Button variant="primary" size="large" asChild rounded>
                <Link href="/browse" className="no-underline">
                  Discover clinics near me
                </Link>
              </Button>
            </div>
          </>
        )}
      </Container>
    </Wrapper>
  );
}
