import { unstable_cache } from 'next/cache';

import { Clinic, ClinicState } from '@/types/clinic';

import { createAdminClient } from '@/lib/supabase';

interface AreaData {
  id: string;
  name: string;
  slug: string;
  image: string;
  state: Partial<ClinicState>;
  clinics: Partial<Clinic>[];
  total_clinics: number;
}

export const getAreaListings = async () => {
  const supabase = createAdminClient();

  const { data: areaData } = (await supabase.from('areas').select(
    `
        id,
        name,
        slug,
        state:states(name, slug)
      `,
  )) as {
    data: {
      id: string;
      name: string;
      slug: string;
      state: {
        name: string;
        slug: string;
      };
    }[];
  };

  return areaData ?? [];
};

/**
 * Fetches an area by its slug with all related data using admin client for static generation
 */
export const getAreaBySlug = async (
  areaSlug: string,
  from: number,
  to: number,
): Promise<AreaData | null> => {
  const getCachedArea = unstable_cache(
    async () => {
      const supabase = createAdminClient();

      const { data: area, error } = await supabase.rpc('get_ranged_area_metadata_by_slug', {
        area_slug: areaSlug,
        from_index: from,
        to_index: to,
      });

      if (error) {
        console.error(`Error fetching area by slug "${areaSlug}":`, error);
        return null;
      }

      return area as AreaData | null;
    },
    [`area-${areaSlug}-${from}-${to}`],
    {
      revalidate: 3600,
      tags: ['areas', `area-${areaSlug}`],
    },
  );

  return getCachedArea();
};
