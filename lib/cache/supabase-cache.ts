import { unstable_cache } from 'next/cache';
import { revalidateTag } from 'next/cache';

/**
 * Cache configuration for different types of data
 */
export const CACHE_CONFIG = {
  // Static data that rarely changes
  STATIC: {
    revalidate: 3600, // 1 hour
    tags: ['static-data'],
  },
  // Semi-static data that changes occasionally
  SEMI_STATIC: {
    revalidate: 1800, // 30 minutes
    tags: ['semi-static-data'],
  },
  // Dynamic data that changes frequently
  DYNAMIC: {
    revalidate: 300, // 5 minutes
    tags: ['dynamic-data'],
  },
  // Real-time data that should be cached briefly
  REALTIME: {
    revalidate: 60, // 1 minute
    tags: ['realtime-data'],
  },
} as const;

/**
 * Cache tags for different data types
 */
export const CACHE_TAGS = {
  CLINICS: 'clinics',
  CLINIC_DETAILS: 'clinic-details',
  DOCTORS: 'doctors',
  DOCTOR_DETAILS: 'doctor-details',
  STATES: 'states',
  AREAS: 'areas',
  SERVICES: 'services',
  REVIEWS: 'reviews',
  STATIC_DATA: 'static-data',
  SEMI_STATIC_DATA: 'semi-static-data',
  DYNAMIC_DATA: 'dynamic-data',
  REALTIME_DATA: 'realtime-data',
} as const;

/**
 * Generic cache wrapper for Supabase queries
 */
export function createSupabaseCache<T extends unknown[], R>(
  fn: (...args: T) => Promise<R>,
  cacheKey: string,
  config: (typeof CACHE_CONFIG)[keyof typeof CACHE_CONFIG],
  tags: string[] = [],
) {
  return unstable_cache(fn, [cacheKey], {
    ...config,
    tags: [...config.tags, ...tags],
  });
}

/**
 * Cache wrapper specifically for clinic queries
 */
export function createClinicCache<T extends unknown[], R>(
  fn: (...args: T) => Promise<R>,
  cacheKey: string,
  config: (typeof CACHE_CONFIG)[keyof typeof CACHE_CONFIG] = CACHE_CONFIG.SEMI_STATIC,
) {
  return createSupabaseCache(fn, cacheKey, config, [CACHE_TAGS.CLINICS]);
}

/**
 * Cache wrapper specifically for doctor queries
 */
export function createDoctorCache<T extends unknown[], R>(
  fn: (...args: T) => Promise<R>,
  cacheKey: string,
  config: (typeof CACHE_CONFIG)[keyof typeof CACHE_CONFIG] = CACHE_CONFIG.SEMI_STATIC,
) {
  return createSupabaseCache(fn, cacheKey, config, [CACHE_TAGS.DOCTORS]);
}

/**
 * Cache wrapper specifically for static data queries
 */
export function createStaticCache<T extends unknown[], R>(
  fn: (...args: T) => Promise<R>,
  cacheKey: string,
) {
  return createSupabaseCache(fn, cacheKey, CACHE_CONFIG.STATIC, [CACHE_TAGS.STATIC_DATA]);
}

/**
 * Cache invalidation utilities
 */
export class CacheInvalidator {
  /**
   * Invalidate all clinic-related caches
   */
  static async invalidateClinics() {
    await revalidateTag(CACHE_TAGS.CLINICS);
    await revalidateTag(CACHE_TAGS.CLINIC_DETAILS);
  }

  /**
   * Invalidate all doctor-related caches
   */
  static async invalidateDoctors() {
    await revalidateTag(CACHE_TAGS.DOCTORS);
    await revalidateTag(CACHE_TAGS.DOCTOR_DETAILS);
  }

  /**
   * Invalidate all static data caches
   */
  static async invalidateStaticData() {
    await revalidateTag(CACHE_TAGS.STATIC_DATA);
    await revalidateTag(CACHE_TAGS.STATES);
    await revalidateTag(CACHE_TAGS.AREAS);
    await revalidateTag(CACHE_TAGS.SERVICES);
  }

  /**
   * Invalidate all caches
   */
  static async invalidateAll() {
    await revalidateTag(CACHE_TAGS.STATIC_DATA);
    await revalidateTag(CACHE_TAGS.SEMI_STATIC_DATA);
    await revalidateTag(CACHE_TAGS.DYNAMIC_DATA);
    await revalidateTag(CACHE_TAGS.REALTIME_DATA);
  }

  /**
   * Invalidate specific clinic cache
   */
  static async invalidateClinic(slug: string) {
    await revalidateTag(`clinic-${slug}`);
  }

  /**
   * Invalidate specific doctor cache
   */
  static async invalidateDoctor(slug: string) {
    await revalidateTag(`doctor-${slug}`);
  }
}

/**
 * Helper function to create cache keys with consistent formatting
 */
export function createCacheKey(prefix: string, ...parts: (string | number | undefined)[]): string {
  const filteredParts = parts.filter((part) => part !== undefined && part !== null);
  return [prefix, ...filteredParts].join('-');
}

/**
 * Cache key generators for common patterns
 */
export const CacheKeys = {
  clinicBySlug: (slug: string, status?: string) => createCacheKey('clinic', slug, status),

  clinicListings: (status?: string) => createCacheKey('clinic-listings', status),

  clinicsByState: (stateSlug: string, status?: string) =>
    createCacheKey('clinics-by-state', stateSlug, status),

  clinicsByArea: (areaSlug: string, status?: string) =>
    createCacheKey('clinics-by-area', areaSlug, status),

  clinicsByService: (serviceId: string, from: number, to: number, status?: string) =>
    createCacheKey('clinics-by-service', serviceId, from, to, status),

  doctorBySlug: (slug: string, status?: string) => createCacheKey('doctor', slug, status),

  doctorListings: (status?: string) => createCacheKey('doctor-listings', status),

  doctorsByState: (stateSlug: string, limit: number, offset: number, status?: string) =>
    createCacheKey('doctors-by-state', stateSlug, limit, offset, status),

  doctorsByClinic: (clinicSlug: string, status?: string) =>
    createCacheKey('doctors-by-clinic', clinicSlug, status),

  stateListings: () => createCacheKey('state-listings'),

  areaListings: (stateSlug?: string) => createCacheKey('area-listings', stateSlug),

  serviceListings: () => createCacheKey('service-listings'),

  clinicReviews: (clinicId: string, page: number, pageSize: number) =>
    createCacheKey('clinic-reviews', clinicId, page, pageSize),

  clinicHours: (clinicId: string) => createCacheKey('clinic-hours', clinicId),

  clinicSpecialHours: (clinicId: string) => createCacheKey('clinic-special-hours', clinicId),
} as const;
