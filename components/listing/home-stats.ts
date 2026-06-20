import { unstable_cache } from 'next/cache';

import { createAdminClient } from '@/lib/supabase';

export type HomeDirectoryStats = {
  clinicCount: number;
  stateCount: number;
  serviceCount: number;
};

export const getHomeDirectoryStats = unstable_cache(
  async (): Promise<HomeDirectoryStats> => {
    const supabase = createAdminClient();

    const [{ count: clinicCount }, { data: statesData }, { count: serviceCount }] =
      await Promise.all([
        supabase
          .from('clinics')
          .select('*', { count: 'exact', head: true })
          .match({ is_active: true, status: 'approved' }),
        supabase
          .from('states')
          .select('id, clinics(count)')
          .eq('clinics.status', 'approved')
          .eq('clinics.is_active', true),
        supabase.from('services').select('*', { count: 'exact', head: true }),
      ]);

    const stateCount = (statesData || []).filter(
      (state) => (state.clinics?.[0]?.count ?? 0) > 0,
    ).length;

    return {
      clinicCount: clinicCount ?? 0,
      stateCount,
      serviceCount: serviceCount ?? 0,
    };
  },
  ['home-directory-stats'],
  {
    revalidate: 1_209_600,
    tags: ['clinics', 'states', 'services'],
  },
);
