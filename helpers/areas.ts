import { unstable_cache } from 'next/cache';

import { Clinic, ClinicState } from '@/types/clinic';

import { createAdminClient, createServerClient } from '@/lib/supabase';

interface AreaData {
  id: string;
  name: string;
  slug: string;
  image: string;
  state: Partial<ClinicState>;
  clinics: Partial<Clinic>[];
}

export const getAreaMetadataBySlugCached = unstable_cache(
  async (areaSlug: string) => {
    const supabase = createAdminClient();

    const { data: area } = await supabase.rpc('get_area_metadata_by_slug', {
      area_slug: areaSlug,
    });

    return area as AreaData | null;
  },
  ['area-metadata'],
  {
    revalidate: 1800, // Cache for 30 minutes
    tags: ['area-metadata', 'areas'],
  },
);

export async function getAreaMetadataBySlug(areaSlug: string) {
  return getAreaMetadataBySlugCached(areaSlug);
}

export const getAreaListingsCached = unstable_cache(
  async () => {
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
  },
  ['area-listings'],
  {
    revalidate: 1800, // Cache for 30 minutes
    tags: ['area-listings', 'areas'],
  },
);

export async function getAreaListings() {
  return getAreaListingsCached();
}

/**
 * Fetches a clinic by its state with all related data
 */
export async function getAreaBySlug(areaSlug: string, from: number, to: number) {
  const supabase = await createServerClient();

  const { data: area } = await supabase.rpc('get_ranged_area_metadata_by_slug', {
    area_slug: areaSlug,
    from_index: from,
    to_index: to,
  });

  return area as AreaData | null;
}

/**
 * Fetches an area by its slug with all related data using admin client for static generation
 */
export const getAreaBySlugStaticCached = unstable_cache(
  async (areaSlug: string, from: number, to: number) => {
    const supabase = createAdminClient();

    const { data: area } = await supabase.rpc('get_ranged_area_metadata_by_slug', {
      area_slug: areaSlug,
      from_index: from,
      to_index: to,
    });

    return area as AreaData | null;
  },
  ['area-by-slug-static'],
  {
    revalidate: 1800, // Cache for 30 minutes
    tags: ['area-by-slug-static', 'areas'],
  },
);

export async function getAreaBySlugStatic(areaSlug: string, from: number, to: number) {
  return getAreaBySlugStaticCached(areaSlug, from, to);
}
