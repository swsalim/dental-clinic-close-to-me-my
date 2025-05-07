import { createAdminClient, createServerClient } from '@/lib/supabase';

export async function getStateMetadataBySlug(stateSlug: string) {
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
}

export async function getStateListings() {
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
}

/**
 * Fetches a clinic by its state with all related data
 */
export async function getStateBySlug(stateSlug: string) {
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
      areas:areas(name, slug, state:states(name, slug)),
      clinics:clinics(name, slug, description, status,images, postal_code, address, phone, rating, area:areas(name), state:states(name))
    `,
    )
    .eq('clinics.status', 'approved')
    .match({ slug: stateSlug })
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
      clinics: {
        name: string;
        slug: string;
        description: string;
        images: string[];
        postal_code: string;
        address: string;
        phone: string;
        rating: number;
        status: string;
        area: {
          name: string;
        };
        state: {
          name: string;
        };
      }[];
    };
  };

  return state;
}
