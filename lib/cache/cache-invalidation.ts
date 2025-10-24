import { revalidateTag } from 'next/cache';

import { CACHE_TAGS } from './supabase-cache';

/**
 * Cache invalidation strategies for different data update scenarios
 */
export class CacheInvalidationStrategies {
  /**
   * Invalidate caches when a clinic is created, updated, or deleted
   */
  static async onClinicChange(clinicSlug?: string) {
    // Invalidate general clinic caches
    await revalidateTag(CACHE_TAGS.CLINICS);
    await revalidateTag(CACHE_TAGS.CLINIC_DETAILS);

    // Invalidate specific clinic cache if slug provided
    if (clinicSlug) {
      await revalidateTag(`clinic-${clinicSlug}`);
    }

    // Invalidate related caches that might be affected
    await revalidateTag(CACHE_TAGS.STATES);
    await revalidateTag(CACHE_TAGS.AREAS);
    await revalidateTag(CACHE_TAGS.SERVICES);
  }

  /**
   * Invalidate caches when a doctor is created, updated, or deleted
   */
  static async onDoctorChange(doctorSlug?: string) {
    // Invalidate general doctor caches
    await revalidateTag(CACHE_TAGS.DOCTORS);
    await revalidateTag(CACHE_TAGS.DOCTOR_DETAILS);

    // Invalidate specific doctor cache if slug provided
    if (doctorSlug) {
      await revalidateTag(`doctor-${doctorSlug}`);
    }

    // Invalidate related caches that might be affected
    await revalidateTag(CACHE_TAGS.CLINICS);
  }

  /**
   * Invalidate caches when a review is created, updated, or deleted
   */
  static async onReviewChange(clinicId: string) {
    // Invalidate clinic-specific caches
    await revalidateTag(CACHE_TAGS.CLINICS);
    await revalidateTag(CACHE_TAGS.CLINIC_DETAILS);
    await revalidateTag(`clinic-reviews-${clinicId}`);
  }

  /**
   * Invalidate caches when clinic hours are updated
   */
  static async onClinicHoursChange(clinicId: string) {
    await revalidateTag(CACHE_TAGS.CLINICS);
    await revalidateTag(CACHE_TAGS.CLINIC_DETAILS);
    await revalidateTag(`clinic-hours-${clinicId}`);
  }

  /**
   * Invalidate caches when clinic special hours are updated
   */
  static async onClinicSpecialHoursChange(clinicId: string) {
    await revalidateTag(CACHE_TAGS.CLINICS);
    await revalidateTag(CACHE_TAGS.CLINIC_DETAILS);
    await revalidateTag(`clinic-special-hours-${clinicId}`);
  }

  /**
   * Invalidate caches when clinic images are updated
   */
  static async onClinicImagesChange(clinicId: string) {
    await revalidateTag(CACHE_TAGS.CLINICS);
    await revalidateTag(CACHE_TAGS.CLINIC_DETAILS);
    await revalidateTag(`clinic-images-${clinicId}`);
  }

  /**
   * Invalidate caches when doctor images are updated
   */
  static async onDoctorImagesChange(doctorId: string) {
    await revalidateTag(CACHE_TAGS.DOCTORS);
    await revalidateTag(CACHE_TAGS.DOCTOR_DETAILS);
    await revalidateTag(`doctor-images-${doctorId}`);
  }

  /**
   * Invalidate caches when clinic services are updated
   */
  static async onClinicServicesChange(clinicId: string) {
    await revalidateTag(CACHE_TAGS.CLINICS);
    await revalidateTag(CACHE_TAGS.CLINIC_DETAILS);
    await revalidateTag(CACHE_TAGS.SERVICES);
    await revalidateTag(`clinic-services-${clinicId}`);
  }

  /**
   * Invalidate caches when clinic categories are updated
   */
  static async onClinicCategoriesChange(clinicId: string) {
    await revalidateTag(CACHE_TAGS.CLINICS);
    await revalidateTag(CACHE_TAGS.CLINIC_DETAILS);
    await revalidateTag(`clinic-categories-${clinicId}`);
  }

  /**
   * Invalidate caches when clinic status changes (approved/rejected)
   */
  static async onClinicStatusChange(clinicId: string, newStatus: string) {
    // Invalidate all clinic-related caches since status affects visibility
    await revalidateTag(CACHE_TAGS.CLINICS);
    await revalidateTag(CACHE_TAGS.CLINIC_DETAILS);
    await revalidateTag(CACHE_TAGS.STATES);
    await revalidateTag(CACHE_TAGS.AREAS);
    await revalidateTag(CACHE_TAGS.SERVICES);
    await revalidateTag(`clinic-status-${clinicId}-${newStatus}`);
  }

  /**
   * Invalidate caches when doctor status changes (approved/rejected)
   */
  static async onDoctorStatusChange(doctorId: string, newStatus: string) {
    // Invalidate all doctor-related caches since status affects visibility
    await revalidateTag(CACHE_TAGS.DOCTORS);
    await revalidateTag(CACHE_TAGS.DOCTOR_DETAILS);
    await revalidateTag(CACHE_TAGS.CLINICS);
    await revalidateTag(`doctor-status-${doctorId}-${newStatus}`);
  }

  /**
   * Invalidate caches when static data changes (states, areas, services)
   */
  static async onStaticDataChange() {
    await revalidateTag(CACHE_TAGS.STATIC_DATA);
    await revalidateTag(CACHE_TAGS.STATES);
    await revalidateTag(CACHE_TAGS.AREAS);
    await revalidateTag(CACHE_TAGS.SERVICES);
  }

  /**
   * Invalidate all caches (use sparingly)
   */
  static async invalidateAll() {
    await revalidateTag(CACHE_TAGS.STATIC_DATA);
    await revalidateTag(CACHE_TAGS.SEMI_STATIC_DATA);
    await revalidateTag(CACHE_TAGS.DYNAMIC_DATA);
    await revalidateTag(CACHE_TAGS.REALTIME_DATA);
  }
}

/**
 * Utility functions for common cache invalidation patterns
 */
export class CacheInvalidationUtils {
  /**
   * Invalidate caches for a specific clinic and all related data
   */
  static async invalidateClinicAndRelated(clinicSlug: string) {
    await CacheInvalidationStrategies.onClinicChange(clinicSlug);
  }

  /**
   * Invalidate caches for a specific doctor and all related data
   */
  static async invalidateDoctorAndRelated(doctorSlug: string) {
    await CacheInvalidationStrategies.onDoctorChange(doctorSlug);
  }

  /**
   * Invalidate caches when bulk operations are performed
   */
  static async onBulkOperation(operationType: 'clinic' | 'doctor' | 'review' | 'static') {
    switch (operationType) {
      case 'clinic':
        await revalidateTag(CACHE_TAGS.CLINICS);
        await revalidateTag(CACHE_TAGS.CLINIC_DETAILS);
        await revalidateTag(CACHE_TAGS.STATES);
        await revalidateTag(CACHE_TAGS.AREAS);
        break;
      case 'doctor':
        await revalidateTag(CACHE_TAGS.DOCTORS);
        await revalidateTag(CACHE_TAGS.DOCTOR_DETAILS);
        await revalidateTag(CACHE_TAGS.CLINICS);
        break;
      case 'review':
        await revalidateTag(CACHE_TAGS.CLINICS);
        await revalidateTag(CACHE_TAGS.CLINIC_DETAILS);
        break;
      case 'static':
        await CacheInvalidationStrategies.onStaticDataChange();
        break;
    }
  }

  /**
   * Invalidate caches based on data type and operation
   */
  static async invalidateByDataType(
    dataType: 'clinic' | 'doctor' | 'review' | 'hours' | 'images' | 'services' | 'categories',
    entityId: string,
  ) {
    switch (dataType) {
      case 'clinic':
        await CacheInvalidationStrategies.onClinicChange(entityId);
        break;
      case 'doctor':
        await CacheInvalidationStrategies.onDoctorChange(entityId);
        break;
      case 'review':
        await CacheInvalidationStrategies.onReviewChange(entityId);
        break;
      case 'hours':
        await CacheInvalidationStrategies.onClinicHoursChange(entityId);
        break;
      case 'images':
        await CacheInvalidationStrategies.onClinicImagesChange(entityId);
        break;
      case 'services':
        await CacheInvalidationStrategies.onClinicServicesChange(entityId);
        break;
      case 'categories':
        await CacheInvalidationStrategies.onClinicCategoriesChange(entityId);
        break;
    }
  }
}
