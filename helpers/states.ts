import { unstable_cache } from 'next/cache';

import { Clinic, ClinicArea } from '@/types/clinic';

import { createAdminClient } from '@/lib/supabase';

// Type definitions for the state data

export interface StateData {
  id: string;
  name: string;
  slug: string;
  image: string | null;
  areas: Partial<ClinicArea>[];
  clinics: Partial<Clinic>[];
  total_clinics?: number;
}

export type StateMetadata = Pick<StateData, 'id' | 'name' | 'slug'>;

export type StateAreaWithClinics = Pick<ClinicArea, 'id' | 'name' | 'slug'> & {
  state?: { slug: string; name: string };
};

function hasApprovedClinics(area: { clinics?: { count: number }[] | null }): boolean {
  return (area.clinics?.[0]?.count ?? 0) > 0;
}

async function fetchStateMetadataBySlug(slug: string): Promise<StateData | null> {
  const supabase = createAdminClient();

  const { data: metadata, error } = await supabase.rpc('get_state_metadata_by_slug', {
    state_slug: slug,
  });

  if (error) {
    throw new Error(`Failed to fetch state metadata for "${slug}": ${error.message}`);
  }

  if (!metadata) {
    return null;
  }

  const clinics = (metadata as StateData).clinics ?? [];
  return {
    ...(metadata as StateData),
    total_clinics: clinics.length,
  };
}

function paginateStateClinics(state: StateData, fromIndex: number, toIndex: number): StateData {
  const clinics = state.clinics ?? [];
  return {
    ...state,
    total_clinics: state.total_clinics ?? clinics.length,
    clinics: clinics.slice(fromIndex, toIndex + 1),
  };
}

export const getStateListings = async () => {
  const supabase = createAdminClient();

  const { data: statesData } = await supabase
    .from('states')
    .select('id, name, slug', { count: 'exact' });

  return statesData || [];
};

/**
 * Returns areas in a state that have at least one approved, active clinic.
 */
export const getStateAreasWithClinics = async (
  stateSlug: string,
): Promise<StateAreaWithClinics[]> => {
  const slug = stateSlug;

  if (!slug || typeof slug !== 'string') {
    console.error('Invalid stateSlug provided to getStateAreasWithClinics:', stateSlug);
    return [];
  }

  return unstable_cache(
    async () => {
      const supabase = createAdminClient();

      const { data: areas, error } = await supabase
        .from('areas')
        .select('id, name, slug, state:states!inner(slug, name), clinics(count)')
        .eq('state.slug', slug)
        .eq('clinics.status', 'approved')
        .eq('clinics.is_active', true);

      if (error) {
        console.error(`Error fetching areas with clinics for "${slug}":`, error);
        return [];
      }

      return (areas || []).filter(hasApprovedClinics) as unknown as StateAreaWithClinics[];
    },
    [`state-areas-with-clinics-v1-${slug}`],
    {
      revalidate: 1_209_600,
      tags: ['areas', `state-${slug}`],
    },
  )();
};

/**
 * Lightweight state lookup for pages that only need id/name/slug (e.g. dentists listings).
 */
export const getStateMetadataBySlug = async (stateSlug: string): Promise<StateMetadata | null> => {
  const slug = stateSlug;

  if (!slug || typeof slug !== 'string') {
    console.error('Invalid stateSlug provided to getStateMetadataBySlug:', stateSlug);
    return null;
  }

  return unstable_cache(
    async () => {
      const state = await fetchStateMetadataBySlug(slug);
      if (!state) {
        return null;
      }

      return {
        id: state.id,
        name: state.name,
        slug: state.slug,
      };
    },
    [`state-metadata-v1-${slug}`],
    {
      revalidate: 1_209_600,
      tags: ['states', `state-${slug}`],
    },
  )();
};

/**
 * Fetches a state by its slug with all related data using admin client for static generation
 */
export const getStateBySlug = async (
  stateSlug: string,
  from: number,
  to: number,
): Promise<StateData | null> => {
  // Capture parameters immediately to avoid closure issues in concurrent requests
  const slug = stateSlug;
  const fromIndex = from;
  const toIndex = to;

  // Validate inputs
  if (!slug || typeof slug !== 'string') {
    console.error('Invalid stateSlug provided to getStateBySlug:', stateSlug);
    return null;
  }

  return unstable_cache(
    async () => {
      const supabase = createAdminClient();

      const { data: state, error } = await supabase.rpc('get_ranged_state_metadata_by_slug', {
        state_slug: slug,
        from_index: fromIndex,
        to_index: toIndex,
      });

      if (error) {
        console.error(
          `Error fetching state by slug "${slug}" (from: ${fromIndex}, to: ${toIndex}):`,
          error,
        );
        throw new Error(
          `Failed to fetch state by slug "${slug}" (from: ${fromIndex}, to: ${toIndex}): ${error.message}`,
        );
      }

      if (state) {
        return state as StateData;
      }

      const fallbackState = await fetchStateMetadataBySlug(slug);
      if (!fallbackState) {
        return null;
      }

      return paginateStateClinics(fallbackState, fromIndex, toIndex);
    },
    [`state-by-slug-v2-${slug}-${fromIndex}-${toIndex}`],
    {
      revalidate: 1_209_600, // Cache for 2 weeks
      tags: ['states', `state-${slug}`],
    },
  )();
};
