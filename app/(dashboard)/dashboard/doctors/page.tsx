import { Metadata } from 'next';

import { Clinic, ClinicDoctor } from '@/types/clinic';

import { siteConfig } from '@/config/site';

import { createServerClient } from '@/lib/supabase';

import { columns } from './columns';
import { DataTable } from './components/data-table';

export const dynamic = 'force-dynamic';

interface DoctorWithRelations extends Partial<ClinicDoctor> {
  clinic_doctor_relations?: { clinics: Clinic }[];
}

const config = {
  title: 'Doctors',
  description: 'List all doctors',
  url: '/dashboard/doctors',
};

export const metadata: Metadata = {
  title: config.title,
  description: config.description,
  alternates: {
    canonical: config.url,
  },
  openGraph: {
    title: config.title,
    description: config.description,
    url: config.url,
    images: [
      {
        url: new URL(`${process.env.NEXT_PUBLIC_BASE_URL}/api/og?title=${config.title}`),
        width: siteConfig.openGraph.width,
        height: siteConfig.openGraph.height,
        alt: config.title,
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    title: config.title,
    description: config.description,
    card: 'summary_large_image',
    creator: siteConfig.creator,
    images: [
      {
        url: new URL(`${process.env.NEXT_PUBLIC_BASE_URL}/api/og?title=${config.title}`),
        width: siteConfig.openGraph.width,
        height: siteConfig.openGraph.height,
        alt: config.title,
      },
    ],
  },
};

export default async function DashboardDoctorsPage() {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from('clinic_doctors')
    .select(
      `id,
      name,
      bio,
      specialty,
      status,
      image,
      featured_video,
      is_active,
      is_featured,
      clinic_doctor_relations (
          clinic_id,
          clinics (id, name, slug)
      )`,
    )
    .order('created_at', { ascending: false });

  // Transform nested clinic_doctor_relations to flat clinics array
  const doctors =
    (data as DoctorWithRelations[] | null)?.map((doctor) => {
      const relations = doctor.clinic_doctor_relations || [];
      return {
        ...doctor,
        clinics: relations.map((rel) => rel.clinics).filter(Boolean),
      };
    }) || [];

  if (error) {
    console.error('Error fetching doctors:', error);
  }

  return <DataTable columns={columns} data={doctors} type="doctor" />;
}
