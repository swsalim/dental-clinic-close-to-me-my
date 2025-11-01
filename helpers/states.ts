import { unstable_cache } from 'next/cache';

import { Clinic, ClinicArea } from '@/types/clinic';

import { createAdminClient } from '@/lib/supabase';

// Type definitions for the state data

interface StateData {
  id: string;
  name: string;
  slug: string;
  image: string | null;
  areas: Partial<ClinicArea>[];
  clinics: Partial<Clinic>[];
  total_clinics?: number;
}

export const getStateListings = async () => {
  const supabase = createAdminClient();

  const { data: statesData } = await supabase
    .from('states')
    .select('id, name, slug', { count: 'exact' });

  return statesData || [];
};

/**
 * Fetches a state by its slug with all related data using admin client for static generation
 */
export const getStateBySlug = async (
  stateSlug: string,
  from: number,
  to: number,
): Promise<StateData | null> => {
  return unstable_cache(
    async () => {
      const supabase = createAdminClient();

      const { data: state } = await supabase.rpc('get_ranged_state_metadata_by_slug', {
        state_slug: stateSlug,
        from_index: from,
        to_index: to,
      });

      return state as StateData | null;
    },
    [`state-by-slug-${stateSlug}-${from}-${to}`],
    {
      revalidate: 3600,
      tags: ['states', `state-${stateSlug}`],
    },
  )();
};
