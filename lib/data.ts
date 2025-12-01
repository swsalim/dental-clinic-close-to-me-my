import { cache } from 'react';

import { getAreaBySlug } from '@/helpers/areas';
import { getClinicBySlug } from '@/helpers/clinics';
import { getDoctorBySlug } from '@/helpers/doctors';
import { getAllServices } from '@/helpers/services';
import { getStateBySlug } from '@/helpers/states';

export const getStateBySlugCached = cache(async (stateSlug: string, from: number, to: number) => {
  return await getStateBySlug(stateSlug, from, to);
});

export const getAreaBySlugCached = cache(async (areaSlug: string, from: number, to: number) => {
  return await getAreaBySlug(areaSlug, from, to);
});

export const getDoctorBySlugCached = cache(async (slug: string) => {
  return await getDoctorBySlug(slug);
});

export const getClinicBySlugCached = cache(async (clinicSlug: string) => {
  return await getClinicBySlug(clinicSlug);
});

export const getAllServicesCached = cache(async () => {
  return await getAllServices();
});
