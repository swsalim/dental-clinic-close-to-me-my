import { ClinicDoctor } from '@/types/clinic';

import { createAdminClient, createServerClient } from '@/lib/supabase';

// Reusable column selection for doctor queries with clinic relations
export const DOCTOR_WITH_CLINICS_SELECT = `
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
      email,
      latitude,
      longitude,
      rating,
      review_count,
      images,
      area:areas(name),
      state:states(name)
    )
  )
`;

// Type for raw doctor data from Supabase with clinic relations
type RawDoctorWithClinics = {
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
      email: string | null;
      latitude: number | null;
      longitude: number | null;
      rating: number | null;
      review_count: number | null;
      images: string[] | null;
      area?: { name: string } | null;
      state?: { name: string } | null;
    };
  }[];
};

// Helper function to transform raw doctor data to ClinicDoctor type
export function transformDoctorData(doctorData: RawDoctorWithClinics): ClinicDoctor {
  const { clinic_doctor_relations, ...doctorDataWithoutRelations } = doctorData;
  return {
    ...doctorDataWithoutRelations,
    clinics: clinic_doctor_relations?.map((relation) => relation.clinics).filter(Boolean) || [],
  };
}

// Helper function to transform array of raw doctor data
function transformDoctorsData(doctorsData: RawDoctorWithClinics[]): ClinicDoctor[] {
  return doctorsData.map(transformDoctorData);
}

export async function getDoctorMetadataBySlug(slug: string, status: string = 'approved') {
  const supabase = await createAdminClient();

  const { data: doctorData } = (await supabase
    .from('clinic_doctors')
    .select(DOCTOR_WITH_CLINICS_SELECT)
    .match({ slug, is_active: true, status })
    .single()) as {
    data: RawDoctorWithClinics;
  };

  if (!doctorData) {
    return null;
  }

  return transformDoctorData(doctorData);
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
      is_active,
      status
    `,
    )
    .match({ is_active: true, status })) as {
    data: {
      id: string;
      name: string;
      slug: string;
      is_active: boolean | null;
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
    .select(DOCTOR_WITH_CLINICS_SELECT)
    .match({ slug, is_active: true, status })
    .single();

  if (error) {
    console.error('Error fetching doctor:', error);
    return null;
  }

  if (!data) {
    return null;
  }

  return transformDoctorData(data);
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
  let query = supabase
    .from('clinic_doctors')
    .select(DOCTOR_WITH_CLINICS_SELECT, { count: 'exact' })
    .eq('is_active', true)
    .eq('status', 'approved');

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

  const doctors = transformDoctorsData(data || []);

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
    .select(DOCTOR_WITH_CLINICS_SELECT)
    .eq('specialty', specialty)
    .match({ is_active: true, status })
    .range(offset, offset + limit - 1)
    .order('modified_at', { ascending: false });

  if (error) {
    console.error('Error fetching doctors by specialty:', error);
    return [];
  }

  return transformDoctorsData(data || []);
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
  return transformDoctorData(doctor as RawDoctorWithClinics);
}

/**
 * Fetches all doctors in a specific clinic by clinic slug
 */
export async function getDoctorsByClinicSlug(
  clinicSlug: string,
  status: string = 'approved',
): Promise<ClinicDoctor[]> {
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
      clinic_doctor_relations!inner(
        clinic_id,
        clinics!inner(
          id,
          name,
          slug,
          address,
          neighborhood,
          postal_code,
          phone,
          email,
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
    .eq('is_active', true)
    .eq('status', status)
    .eq('clinic_doctor_relations.clinics.slug', clinicSlug)
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching doctors by clinic slug:', error);
    return [];
  }

  if (!data) {
    return [];
  }

  return transformDoctorsData(data);
}
