import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const PAGE_SIZE = 1000;

type PageResult<T> = {
  data: T[] | null;
  error: { message?: string } | null;
};

async function fetchPages<T>(run: (from: number, to: number) => PromiseLike<PageResult<T>>) {
  const rows: T[] = [];
  let from = 0;

  while (true) {
    const { data, error } = await run(from, from + PAGE_SIZE - 1);
    if (error) {
      throw new Error(error.message || 'Supabase query failed');
    }

    const batch = data ?? [];
    rows.push(...batch);

    if (batch.length < PAGE_SIZE) {
      break;
    }

    from += PAGE_SIZE;
  }

  return rows;
}

function laterIso(current: string | undefined, candidate: string | null | undefined) {
  if (!candidate) {
    return current;
  }

  const next = new Date(candidate);
  if (Number.isNaN(next.getTime())) {
    return current;
  }

  if (!current || next.getTime() > new Date(current).getTime()) {
    return next.toISOString();
  }

  return current;
}

type ClinicRow = {
  id: string;
  area_id: string | null;
  state_id: string | null;
  modified_at: string | null;
};

type RelationRow = {
  id: string;
  service_id: string;
  clinic_id: string;
};

type StateRow = {
  id: string;
  slug: string;
};

type AreaRow = {
  id: string;
  slug: string;
  state: { slug: string } | { slug: string }[] | null;
};

export type LocationSignals = {
  stateCount: Record<string, number>;
  areaCount: Record<string, number>;
  stateLastmod: Record<string, string>;
  areaLastmod: Record<string, string>;
  serviceLastmod: Record<string, string>;
};

function stateSlugOf(area: AreaRow) {
  const state = area.state;
  if (Array.isArray(state)) {
    return state[0]?.slug ?? null;
  }
  return state?.slug ?? null;
}

/**
 * Approved-clinic counts and the newest clinic modified_at per location and service.
 * Returns null when the queries fail so sitemap generation can keep the previous entries.
 */
export async function getLocationSignals(
  supabase: SupabaseClient,
): Promise<LocationSignals | null> {
  try {
    const clinics = await fetchPages<ClinicRow>((from, to) =>
      supabase
        .from('clinics')
        .select('id, area_id, state_id, modified_at')
        .eq('status', 'approved')
        .order('id')
        .range(from, to),
    );

    const clinicModifiedAt: Record<string, string | null> = {};
    const stateCount: Record<string, number> = {};
    const areaCount: Record<string, number> = {};
    const stateLastmod: Record<string, string> = {};
    const areaLastmod: Record<string, string> = {};

    for (const clinic of clinics) {
      clinicModifiedAt[clinic.id] = clinic.modified_at;

      if (clinic.state_id) {
        stateCount[clinic.state_id] = (stateCount[clinic.state_id] || 0) + 1;
        const next = laterIso(stateLastmod[clinic.state_id], clinic.modified_at);
        if (next) {
          stateLastmod[clinic.state_id] = next;
        }
      }

      if (clinic.area_id) {
        areaCount[clinic.area_id] = (areaCount[clinic.area_id] || 0) + 1;
        const next = laterIso(areaLastmod[clinic.area_id], clinic.modified_at);
        if (next) {
          areaLastmod[clinic.area_id] = next;
        }
      }
    }

    const relations = await fetchPages<RelationRow>((from, to) =>
      supabase
        .from('clinic_service_relations')
        .select('id, service_id, clinic_id')
        .order('id')
        .range(from, to),
    );

    const serviceLastmod: Record<string, string> = {};
    for (const relation of relations) {
      const modifiedAt = clinicModifiedAt[relation.clinic_id];
      if (!modifiedAt) {
        continue;
      }
      const next = laterIso(serviceLastmod[relation.service_id], modifiedAt);
      if (next) {
        serviceLastmod[relation.service_id] = next;
      }
    }

    return { stateCount, areaCount, stateLastmod, areaLastmod, serviceLastmod };
  } catch (error) {
    console.error('Failed to load sitemap location signals:', error);
    return null;
  }
}

type DoctorCountResult = {
  count?: number | null;
};

/**
 * Approved dentist counts keyed by state slug.
 * Uses get_ranged_doctor_by_state_slug, the same RPC as getDoctorsByState.
 * Returns null when the queries fail so sitemap generation can keep the previous entries.
 */
export async function getStateDentistCounts(
  supabase: SupabaseClient,
): Promise<Record<string, number> | null> {
  try {
    const states = await fetchPages<StateRow>((from, to) =>
      supabase.from('states').select('id, slug').order('id').range(from, to),
    );

    const counts: Record<string, number> = {};

    for (const state of states) {
      const { data, error } = await supabase.rpc('get_ranged_doctor_by_state_slug', {
        state_slug_param: state.slug,
        from_index_param: 0,
        to_index_param: 0,
        status_param: 'approved',
      });

      if (error) {
        throw new Error(error.message || `Dentist count failed for ${state.slug}`);
      }

      const count = (data as DoctorCountResult | null)?.count ?? 0;
      counts[state.slug] = Number(count) || 0;
    }

    return counts;
  } catch (error) {
    console.error('Failed to load sitemap dentist counts:', error);
    return null;
  }
}

export async function getEmptyLocationPaths(): Promise<string[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    return [];
  }

  try {
    const supabase = createClient(url, key);
    const signals = await getLocationSignals(supabase);

    if (!signals) {
      return [];
    }

    const states = await fetchPages<StateRow>((from, to) =>
      supabase.from('states').select('id, slug').order('id').range(from, to),
    );
    const areas = await fetchPages<AreaRow>((from, to) =>
      supabase.from('areas').select('id, slug, state:states(slug)').order('id').range(from, to),
    );

    const paths: string[] = [];

    for (const state of states) {
      if (!signals.stateCount[state.id]) {
        paths.push(`/${state.slug}`);
      }
    }

    for (const area of areas) {
      const stateSlug = stateSlugOf(area);
      if (!stateSlug || signals.areaCount[area.id]) {
        continue;
      }
      paths.push(`/${stateSlug}/${area.slug}`);
    }

    return paths;
  } catch (error) {
    console.error('Failed to load empty location paths for sitemap:', error);
    return [];
  }
}

/** State dentist pages whose approved dentist count is 0. */
export async function getEmptyDentistPaths(): Promise<string[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    return [];
  }

  try {
    const supabase = createClient(url, key);
    const counts = await getStateDentistCounts(supabase);

    if (!counts) {
      return [];
    }

    return Object.entries(counts)
      .filter(([, count]) => count === 0)
      .map(([slug]) => `/${slug}/dentists`);
  } catch (error) {
    console.error('Failed to load empty dentist paths for sitemap:', error);
    return [];
  }
}
