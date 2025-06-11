'use client';

import { useEffect, useState } from 'react';

import Link from 'next/link';

import { Database } from '@/types/database.types';

import { createClient } from '@/lib/supabase/client';

import { ClinicCard } from '@/components/cards/clinic-card';
import { ClinicCardSkeleton } from '@/components/cards/clinic-card-skeleton';
import { Button } from '@/components/ui/button';

type Clinic = Database['public']['Tables']['clinics']['Row'] & {
  hours: Database['public']['Tables']['clinic_hours']['Row'][];
  special_hours: Database['public']['Tables']['clinic_special_hours']['Row'][];
  area: { name: string } | null;
  state: { name: string } | null;
};

export function RecentClinicsList() {
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchRecentClinics() {
      try {
        const { data, error } = await supabase
          .from('clinics')
          .select(
            `
            *,
            hours:clinic_hours(*),
            special_hours:clinic_special_hours(*),
            area:areas(name),
            state:states(name)
          `,
          )
          .eq('is_active', true)
          .order('modified_at', { ascending: false })
          .limit(12);

        if (error) throw error;
        setClinics(data || []);
      } catch (error) {
        console.error('Error fetching recent clinics:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchRecentClinics();
  }, [supabase]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 md:gap-8 lg:grid-cols-4">
        {Array.from({ length: 6 }).map((_, index) => (
          <ClinicCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 md:gap-8 lg:grid-cols-4">
        {clinics.map((clinic) => (
          <ClinicCard
            key={clinic.id}
            slug={clinic.slug}
            name={clinic.name}
            address={clinic.address || ''}
            phone={clinic.phone || ''}
            postalCode={clinic.postal_code || ''}
            state={clinic.state?.name || ''}
            area={clinic.area?.name || ''}
            image={clinic.images?.[0]}
            rating={clinic.rating}
            hours={clinic.hours}
            specialHours={clinic.special_hours}
            openOnPublicHolidays={clinic.open_on_public_holidays || false}
          />
        ))}
      </div>
      <div className="mt-10 flex justify-center sm:mt-14">
        <Button variant="primary" size="large" asChild>
          <Link href="/browse" className="no-underline">
            View More
          </Link>
        </Button>
      </div>
    </>
  );
}
