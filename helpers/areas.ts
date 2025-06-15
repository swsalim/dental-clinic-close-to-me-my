import { createAdminClient, createServerClient } from '@/lib/supabase';

export async function getAreaMetadataBySlug(areaSlug: string) {
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
    .eq('clinics.status', 'approved')
    .eq('slug', areaSlug)
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
export async function getAreaBySlug(areaSlug: string, from: number, to: number) {
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
      state:states(name, slug, thumbnail_image, banner_image)
    `,
    )
    .eq('slug', areaSlug)
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
    };
  };

  if (!area) {
    return null;
  }

  const { data: clinics } = await supabase
    .from('clinics')
    .select(
      `
      name, slug, description, status,images, postal_code, address, phone, postal_code, open_on_public_holidays, rating, is_featured, modified_at, area:areas(name), state:states(name), hours:clinic_hours(day_of_week, open_time, close_time), special_hours:clinic_special_hours(date, is_closed, open_time, close_time)
    `,
    )
    .eq('status', 'approved')
    .eq('area_id', area.id)
    .order('modified_at', { ascending: false })
    .range(from, to);

  return {
    ...area,
    clinics: clinics ?? [],
  };
}
