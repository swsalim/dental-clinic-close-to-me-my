import {
  Clinic,
  ClinicArea,
  ClinicDoctor,
  ClinicHours,
  ClinicReview,
  ClinicService,
  ClinicSpecialHours,
  ClinicState,
} from '@/types/clinic';

import { createAdminClient, createServerClient } from '@/lib/supabase';

export async function getClinicMetadataBySlug(slug: string, status: string = 'approved') {
  const supabase = await createAdminClient();

  const { data: clinicData } = (await supabase
    .from('clinics')
    .select(
      `
      id,
      name,
      slug,
      description,
      area:areas(name),
      state:states(name)
    `,
    )
    .match({ slug, status })
    .single()) as {
    data: {
      id: string;
      name: string;
      slug: string;
      description: string;
      area: {
        name: string;
      };
      state: {
        name: string;
      };
    };
  };

  return clinicData ?? null;
}

export async function getClinicListings(status: string = 'approved') {
  const supabase = await createAdminClient();

  const { data: clinicData } = (await supabase
    .from('clinics')
    .select(
      `
      id,
      name,
      slug
    `,
    )
    .match({ status })) as {
    data: {
      id: string;
      name: string;
      slug: string;
    }[];
  };

  return clinicData ?? [];
}

/**
 * Fetches a clinic by its slug with all related data
 */
export async function getClinicBySlug(slug: string, status: string = 'approved') {
  const supabase = await createServerClient();

  const { data: clinic } = await supabase
    .from('clinics')
    .select(
      `
      id,
      name,
      slug,
      description,
      postal_code,
      address,
      phone,
      email,
      latitude,
      longitude,
      rating,
      review_count,
      images,
      featured_video,
      youtube_url,
      facebook_url,
      instagram_url,
      source,
      is_permanently_closed,
      open_on_public_holidays,
      is_active,
      is_featured,
      area:areas(id, name, slug),
      state:states(id, name, slug),
      doctors:clinic_doctor_relations(doctor:clinic_doctors(id, name, slug)),
      hours:clinic_hours(*),
      special_hours:clinic_special_hours(*),
      reviews:clinic_reviews(*),
      services:clinic_service_relations(service:clinic_services(id, name, slug))
    `,
    )
    .match({ slug, status })
    .single();

  return clinic;
}

/**
 * Fetches clinics with optional filters
 */
export async function getClinics(filters: {
  stateId?: string;
  areaId?: string;
  categoryId?: string;
  isFeatured?: boolean;
  limit?: number;
  offset?: number;
}) {
  const supabase = await createServerClient();
  let query = supabase.from('clinics').select(
    `
      *,
      area:areas(*),
      state:states(*),
      categories:clinic_category_relations(
        category:clinic_categories(*)
      )
    `,
    { count: 'exact' },
  );

  if (filters.stateId) {
    query = query.eq('state_id', filters.stateId);
  }

  if (filters.areaId) {
    query = query.eq('area_id', filters.areaId);
  }

  if (filters.categoryId) {
    query = query.eq('clinic_category_relations.category_id', filters.categoryId);
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

  return { data, count };
}

/**
 * Fetches clinics within a radius of a given location
 */
export async function getClinicsNearLocation(
  latitude: number,
  longitude: number,
  radiusInKm: number,
  limit: number = 10,
) {
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from('clinics')
    .select(
      `
      *,
      area:areas(*),
      state:states(*)
    `,
    )
    .not('location', 'is', null)
    .order('location', {
      ascending: true,
      foreignTable: undefined,
      nullsFirst: false,
    })
    .limit(limit);

  if (error) throw error;

  // Filter clinics within radius
  const clinicsWithinRadius = data.filter((clinic) => {
    if (!clinic.latitude || !clinic.longitude) return false;

    const distance = calculateDistance(latitude, longitude, clinic.latitude, clinic.longitude);

    return distance <= radiusInKm;
  });

  return clinicsWithinRadius;
}

/**
 * Fetches clinic reviews with pagination
 */
export async function getClinicReviews(clinicId: string, page: number = 1, pageSize: number = 10) {
  const supabase = await createServerClient();

  const { data, error, count } = await supabase
    .from('clinic_reviews')
    .select('*', { count: 'exact' })
    .eq('clinic_id', clinicId)
    .order('review_time', { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1);

  if (error) throw error;

  return { data, count };
}

/**
 * Fetches clinic operating hours
 */
export async function getClinicHours(clinicId: string) {
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from('clinic_hours')
    .select('*')
    .eq('clinic_id', clinicId)
    .order('day_of_week');

  if (error) throw error;
  return data;
}

/**
 * Fetches clinic special hours (holidays, etc.)
 */
export async function getClinicSpecialHours(clinicId: string) {
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from('clinic_special_hours')
    .select('*')
    .eq('clinic_id', clinicId)
    .order('date');

  if (error) throw error;
  return data;
}

/**
 * Fetches clinic doctors
 */
export async function getClinicDoctors(clinicId: string) {
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from('clinic_doctors')
    .select('*')
    .eq('clinic_id', clinicId)
    .order('name');

  if (error) throw error;
  return data;
}

/**
 * Calculates distance between two points using the Haversine formula
 */
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Checks if a clinic is currently open
 */
export function isClinicOpen(
  regularHours: ClinicHours[],
  specialHours: ClinicSpecialHours[],
  date: Date = new Date(),
): boolean {
  const dayOfWeek = date.getDay();
  const currentTime = date.toTimeString().slice(0, 5); // HH:mm format

  // Check special hours first
  const specialHoursForDate = specialHours.find(
    (sh) => sh.date === date.toISOString().split('T')[0],
  );

  if (specialHoursForDate) {
    if (specialHoursForDate.is_closed) return false;
    if (!specialHoursForDate.open_time || !specialHoursForDate.close_time) return false;
    return (
      currentTime >= specialHoursForDate.open_time && currentTime <= specialHoursForDate.close_time
    );
  }

  // Check regular hours
  const regularHoursForDay = regularHours.find((h) => h.day_of_week === dayOfWeek);
  if (!regularHoursForDay) return false;
  if (!regularHoursForDay.open_time || !regularHoursForDay.close_time) return false;

  return (
    currentTime >= regularHoursForDay.open_time && currentTime <= regularHoursForDay.close_time
  );
}

/**
 * Gets the next opening time for a clinic
 */
export function getNextOpeningTime(
  regularHours: ClinicHours[],
  specialHours: ClinicSpecialHours[],
  date: Date = new Date(),
): Date | null {
  const currentDay = date.getDay();
  const currentTime = date.toTimeString().slice(0, 5);

  // Check if there are special hours for today
  const specialHoursForDate = specialHours.find(
    (sh) => sh.date === date.toISOString().split('T')[0],
  );

  if (specialHoursForDate && !specialHoursForDate.is_closed) {
    if (specialHoursForDate.open_time && specialHoursForDate.close_time) {
      if (currentTime < specialHoursForDate.open_time) {
        const [hours, minutes] = specialHoursForDate.open_time.split(':');
        const nextOpen = new Date(date);
        nextOpen.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        return nextOpen;
      }
    }
  }

  // Check regular hours for today
  const todayHours = regularHours.find((h) => h.day_of_week === currentDay);
  if (todayHours && todayHours.open_time && todayHours.close_time) {
    if (currentTime < todayHours.open_time) {
      const [hours, minutes] = todayHours.open_time.split(':');
      const nextOpen = new Date(date);
      nextOpen.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      return nextOpen;
    }
  }

  // Find next opening day
  for (let i = 1; i <= 7; i++) {
    const nextDay = (currentDay + i) % 7;
    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + i);

    // Check special hours for next day
    const nextDaySpecialHours = specialHours.find(
      (sh) => sh.date === nextDate.toISOString().split('T')[0],
    );

    if (nextDaySpecialHours && !nextDaySpecialHours.is_closed) {
      if (nextDaySpecialHours.open_time) {
        const [hours, minutes] = nextDaySpecialHours.open_time.split(':');
        const nextOpen = new Date(nextDate);
        nextOpen.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        return nextOpen;
      }
    }

    // Check regular hours for next day
    const nextDayHours = regularHours.find((h) => h.day_of_week === nextDay);
    if (nextDayHours && nextDayHours.open_time) {
      const [hours, minutes] = nextDayHours.open_time.split(':');
      const nextOpen = new Date(nextDate);
      nextOpen.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      return nextOpen;
    }
  }

  return null;
}

/**
 * Parses and formats raw clinic data from Supabase
 */
export function parseClinicData(
  clinic: Partial<Clinic> & {
    services?: { service: Partial<ClinicService> }[] | null;
    area?: Partial<ClinicArea> | null;
    state?: Partial<ClinicState> | null;
    doctors?: { doctor: Partial<ClinicDoctor> }[] | null;
    hours?: Partial<ClinicHours>[] | null;
    special_hours?: Partial<ClinicSpecialHours>[] | null;
    reviews?: Partial<ClinicReview>[] | null;
  },
) {
  return {
    ...clinic,
    services:
      clinic.services?.map((item) => ({
        name: item.service.name,
        slug: item.service.slug,
      })) ?? [],
    doctors:
      clinic.doctors?.map((item) => ({
        name: item.doctor.name,
        slug: item.doctor.slug,
      })) ?? [],
  };
}
