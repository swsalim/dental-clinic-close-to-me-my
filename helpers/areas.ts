import { createAdminClient, createServerClient } from '@/lib/supabase';

export async function getAreaMetadataBySlug(slug: string) {
  const supabase = await createAdminClient();

  const { data: area } = (await supabase
    .from('areas')
    .select(
      `
      id,
      name,
      slug,
      state:states(name, slug),
      clinics:clinics(slug)
    `,
    )
    .eq('slug', slug)
    .single()) as {
    data: {
      id: string;
      name: string;
      slug: string;
      state: {
        name: string;
        slug: string;
      };
      clinics: {
        slug: string;
      }[];
    };
  };

  return area;
}

export async function getAreaListings() {
  const supabase = await createAdminClient();

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
}

/**
 * Fetches a clinic by its state with all related data
 */
export async function getAreaBySlug(areaSlug: string) {
  const supabase = await createServerClient();

  const { data: area } = (await supabase
    .from('areas')
    .select(
      `
      id,
      name,
      slug,
      short_description,
      thumbnail_image,
      banner_image,
      state:states(name, slug, thumbnail_image, banner_image),
      clinics:clinics(name, slug, description, images, postal_code, address, phone, rating, area:areas(name), state:states(name))
    `,
    )
    .match({ slug: areaSlug })
    .single()) as {
    data: {
      id: string;
      name: string;
      slug: string;
      short_description: string;
      thumbnail_image: string;
      banner_image: string;
      state: {
        name: string;
        slug: string;
        thumbnail_image: string;
        banner_image: string;
      };
      clinics: {
        name: string;
        slug: string;
        description: string;
        images: string[];
        postal_code: string;
        address: string;
        phone: string;
        rating: number;
        area: {
          name: string;
        };
        state: {
          name: string;
        };
      }[];
    };
  };

  return area;
}
