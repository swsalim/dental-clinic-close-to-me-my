import { ClinicDoctor } from '@/types/clinic';

import { createAdminClient, createServerClient } from '@/lib/supabase';

export async function getDoctorMetadataBySlug(slug: string, status: string = 'approved') {
  const supabase = await createAdminClient();

  const { data: doctorData } = (await supabase
    .from('clinic_doctors')
    .select(
      `
      id,
      name,
      slug,
      bio,
      specialty,
      qualification,
      images,
      featured_video,
      is_active,
      is_featured,
      status
    `,
    )
    .match({ slug, is_active: true, status })
    .single()) as {
    data: {
      id: string;
      name: string;
      slug: string;
      bio: string | null;
      specialty: string | null;
      qualification: string | null;
      images: string[] | null;
      featured_video: string | null;
      is_active: boolean | null;
      is_featured: boolean | null;
      status: string | null;
    };
  };

  return doctorData ?? null;
}

export async function getDoctorListings(status: string = 'approved') {
  const supabase = await createAdminClient();

  const { data: doctorData } = (await supabase
    .from('clinic_doctors')
    .select(
      `
      id,
      name,
      slug,
      specialty,
      qualification,
      images,
      is_active,
      is_featured,
      status
    `,
    )
    .match({ is_active: true, status })) as {
    data: {
      id: string;
      name: string;
      slug: string;
      specialty: string | null;
      qualification: string | null;
      images: string[] | null;
      is_active: boolean | null;
      is_featured: boolean | null;
      status: string | null;
    }[];
  };

  return doctorData ?? [];
}

/**
 * Fetches a doctor by its slug with all related data
 */
export async function getDoctorBySlug(
  slug: string,
  status: string = 'approved',
): Promise<ClinicDoctor | null> {
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from('clinic_doctors')
    .select(
      `
      id,
      name,
      slug,
      bio,
      specialty,
      qualification,
      images,
      featured_video,
      is_active,
      is_featured,
      status,
      created_at,
      modified_at,
      clinic_doctor_relations(
        clinic_id,
        clinics(
          id,
          name,
          slug,
          address,
          neighborhood,
          postal_code,
          phone,
          latitude,
          longitude,
          rating,
          review_count,
          images,
          area:areas(name),
          state:states(name)
        )
      )
    `,
    )
    .match({ slug, is_active: true, status })
    .single();

  if (error) {
    console.error('Error fetching doctor:', error);
    return null;
  }

  if (!data) {
    return null;
  }

  // Transform the data to match ClinicDoctor type
  const doctor: ClinicDoctor = {
    ...data,
    clinics:
      data.clinic_doctor_relations
        ?.map(
          (relation: {
            clinics: {
              id: string;
              name: string;
              slug: string;
              address: string | null;
              neighborhood: string | null;
              postal_code: string | null;
              phone: string | null;
              latitude: number | null;
              longitude: number | null;
              rating: number | null;
              review_count: number | null;
              images: string[] | null;
              area?: { name: string } | null;
              state?: { name: string } | null;
            };
          }) => relation.clinics,
        )
        .filter(Boolean) || [],
  };

  return doctor;
}

/**
 * Fetches doctors with optional filters
 */
export async function getDoctors(filters: {
  specialty?: string;
  isFeatured?: boolean;
  limit?: number;
  offset?: number;
}) {
  const supabase = await createServerClient();
  let query = supabase.from('clinic_doctors').select(
    `
      *,
      clinic_doctor_relations(
        clinic_id,
        clinics(
          id,
          name,
          slug,
          address,
          neighborhood,
          postal_code,
          phone,
          latitude,
          longitude,
          rating,
          review_count,
          images,
          area:areas(name),
          state:states(name)
        )
      )
    `,
    { count: 'exact' },
  );

  if (filters.specialty) {
    query = query.eq('specialty', filters.specialty);
  }

  if (filters.isFeatured !== undefined) {
    query = query.eq('is_featured', filters.isFeatured);
  }

  if (filters.limit) {
    query = query.limit(filters.limit);
  }

  if (filters.offset) {
    query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
  }

  const { data, error, count } = await query;
  if (error) throw error;

  // Transform the data to include clinics
  const doctors = (data || []).map(
    (doctor: {
      id: string;
      name: string;
      slug: string;
      bio: string | null;
      specialty: string | null;
      qualification: string | null;
      images: string[] | null;
      featured_video: string | null;
      is_active: boolean | null;
      is_featured: boolean | null;
      status: string | null;
      created_at: string | null;
      modified_at: string | null;
      clinic_doctor_relations?: {
        clinics: {
          id: string;
          name: string;
          slug: string;
          address: string | null;
          neighborhood: string | null;
          postal_code: string | null;
          phone: string | null;
          latitude: number | null;
          longitude: number | null;
          rating: number | null;
          review_count: number | null;
          images: string[] | null;
          area?: { name: string } | null;
          state?: { name: string } | null;
        };
      }[];
    }) => ({
      ...doctor,
      clinics:
        doctor.clinic_doctor_relations?.map((relation) => relation.clinics).filter(Boolean) || [],
    }),
  );

  return { data: doctors, count };
}

/**
 * Fetches doctors by specialty
 */
export async function getDoctorsBySpecialty(
  specialty: string,
  limit: number = 10,
  offset: number = 0,
  status: string = 'approved',
) {
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from('clinic_doctors')
    .select(
      `
      id,
      name,
      slug,
      bio,
      specialty,
      qualification,
      images,
      featured_video,
      is_active,
      is_featured,
      status,
      clinic_doctor_relations(
        clinic_id,
        clinics(
          id,
          name,
          slug,
          address,
          neighborhood,
          postal_code,
          phone,
          latitude,
          longitude,
          rating,
          review_count,
          images,
          area:areas(name),
          state:states(name)
        )
      )
    `,
    )
    .eq('specialty', specialty)
    .match({ is_active: true, status })
    .range(offset, offset + limit - 1)
    .order('modified_at', { ascending: false });

  if (error) {
    console.error('Error fetching doctors by specialty:', error);
    return [];
  }

  // Transform the data to include clinics
  const doctors = (data || []).map(
    (doctor: {
      clinic_doctor_relations?: {
        clinics: {
          id: string;
          name: string;
          slug: string;
          address: string | null;
          neighborhood: string | null;
          postal_code: string | null;
          phone: string | null;
          latitude: number | null;
          longitude: number | null;
          rating: number | null;
          review_count: number | null;
          images: string[] | null;
          area?: { name: string } | null;
          state?: { name: string } | null;
        };
      }[];
    }) => ({
      ...doctor,
      clinics:
        doctor.clinic_doctor_relations?.map((relation) => relation.clinics).filter(Boolean) || [],
    }),
  );

  return doctors;
}

/**
 * Fetches all unique specialties
 */
export async function getDoctorSpecialties() {
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from('clinic_doctors')
    .select('specialty')
    .not('specialty', 'is', null)
    .eq('is_active', true)
    .eq('status', 'approved');

  if (error) {
    console.error('Error fetching doctor specialties:', error);
    return [];
  }

  // Get unique specialties
  const specialties = [...new Set(data?.map((item) => item.specialty).filter(Boolean))];
  return specialties;
}

/**
 * Parses and formats raw doctor data from Supabase
 */
export function parseDoctorData(
  doctor: Partial<ClinicDoctor> & {
    clinic_doctor_relations?: { clinics: Partial<ClinicDoctor> }[] | null;
  },
) {
  return {
    ...doctor,
    clinics: doctor.clinic_doctor_relations?.map((item) => item.clinics).filter(Boolean) ?? [],
  };
}
