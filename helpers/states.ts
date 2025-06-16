import { unstable_cache } from 'next/cache';

import { createAdminClient, createServerClient } from '@/lib/supabase';

export const getStateMetadataBySlug = unstable_cache(
  async (stateSlug: string) => {
    const supabase = await createAdminClient();

    const { data: state } = (await supabase
      .from('states')
      .select(
        `
      id,
      name,
      slug,
      areas:areas(name),
      clinics:clinics(slug)
    `,
      )
      .eq('clinics.status', 'approved')
      .match({ slug: stateSlug })
      .single()) as {
      data: {
        id: string;
        name: string;
        slug: string;
        areas: {
          name: string;
        }[];
        clinics: {
          slug: string;
        }[];
      };
    };

    return state;
  },
  ['state-metadata'],
  {
    revalidate: 3600, // Cache for 1 hour
    tags: ['state-metadata'],
  },
);

export const getStateListings = unstable_cache(
  async () => {
    const supabase = await createAdminClient();

    const { data: stateData } = (await supabase.from('states').select(
      `
      id,
      name,
      slug
    `,
    )) as {
      data: {
        id: string;
        name: string;
        slug: string;
      }[];
    };

    return stateData ?? [];
  },
  ['state-listings'],
  {
    revalidate: 3600, // Cache for 1 hour
    tags: ['state-listings'],
  },
);

/**
 * Fetches a clinic by its state with all related data
 */
export async function getStateBySlug(stateSlug: string, from: number, to: number) {
  const supabase = await createServerClient();

  const { data: state } = (await supabase
    .from('states')
    .select(
      `
    id,
    name,
    slug,
    short_description,
    thumbnail_image,
    banner_image,
    areas:areas(name, slug, state:states(name, slug))
    `,
    )
    .eq('slug', stateSlug)
    .single()) as {
    data: {
      id: string;
      name: string;
      slug: string;
      short_description: string;
      thumbnail_image: string;
      banner_image: string;
      areas: {
        name: string;
        slug: string;
        state: {
          name: string;
          slug: string;
        };
      }[];
    };
  };

  if (!state) {
    return null;
  }

  const { data: clinics } = await supabase
    .from('clinics')
    .select(
      `
      name,
      slug,
      description,
      status,
      images,
      postal_code,
      address,
      phone,
      rating,
      is_featured,
      open_on_public_holidays,
      modified_at,
      area:areas(name),
      state:states(name),
      hours:clinic_hours(day_of_week, open_time, close_time),
      special_hours:clinic_special_hours(date, is_closed, open_time, close_time)
  `,
    )
    .eq('state_id', state.id)
    .eq('status', 'approved')
    .order('modified_at', { ascending: false })
    .range(from, to);

  return {
    ...state,
    clinics: clinics ?? [],
  };
}
