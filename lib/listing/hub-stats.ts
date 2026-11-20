import { cache } from 'react';

import type { HubGlanceStats } from '@/lib/listing/hub-copy';
import { createAdminClient } from '@/lib/supabase';

/**
 * Counts for an area or state hub. Read-only. Runs when the page is built or
 * revalidated (the route `revalidate` is unchanged). Not wrapped in
 * `unstable_cache`.
 *
 * Active approved clinics:
 *   select count(*) from clinics
 *   where status = 'approved' and is_active = true
 *     and area_id = :id; -- state hubs use state_id
 *
 * Sunday opening time. clinic_hours.day_of_week uses Monday = 0, so Sunday = 6.
 * A clinic counts once when any Sunday row has a non-blank open_time:
 *   select count(distinct c.id)
 *   from clinics c
 *   join clinic_hours h on h.clinic_id = c.id
 *   where c.status = 'approved' and c.is_active = true
 *     and c.area_id = :id
 *     and h.day_of_week = 6
 *     and h.open_time is not null
 *     and btrim(h.open_time) <> '';
 *
 * Public holidays:
 *   select count(*) from clinics
 *   where status = 'approved' and is_active = true
 *     and area_id = :id
 *     and open_on_public_holidays is true;
 *
 * WhatsApp:
 *   select count(*) from clinics
 *   where status = 'approved' and is_active = true
 *     and area_id = :id
 *     and whatsapp is not null
 *     and btrim(whatsapp) <> '';
 */
const PAGE_SIZE = 1000;

type Scope = { kind: 'area' | 'state'; id: string };

type CountResult = { count: number | null; error: { message: string } | null };
type RowsResult = { data: unknown[] | null; error: { message: string } | null };

function locationColumn(scope: Scope): 'area_id' | 'state_id' {
  return scope.kind === 'area' ? 'area_id' : 'state_id';
}

async function countActiveApproved(scope: Scope, publicHolidayOnly: boolean): Promise<number> {
  const supabase = createAdminClient();
  let query = supabase
    .from('clinics')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'approved')
    .eq('is_active', true)
    .eq(locationColumn(scope), scope.id);

  if (publicHolidayOnly) {
    query = query.eq('open_on_public_holidays', true);
  }

  const { count, error } = (await query) as CountResult;
  if (error) {
    throw new Error(`Hub clinic count failed: ${error.message}`);
  }
  return count ?? 0;
}

async function countSundayOpen(scope: Scope): Promise<number> {
  const supabase = createAdminClient();
  const ids = new Set<string>();

  for (let from = 0; from < 20_000; from += PAGE_SIZE) {
    const { data, error } = (await supabase
      .from('clinics')
      .select('id, hours:clinic_hours!inner(open_time)')
      .eq('status', 'approved')
      .eq('is_active', true)
      .eq(locationColumn(scope), scope.id)
      .eq('hours.day_of_week', 6)
      .not('hours.open_time', 'is', null)
      .range(from, from + PAGE_SIZE - 1)) as RowsResult;

    if (error) {
      throw new Error(`Sunday-open count failed: ${error.message}`);
    }

    const rows = (data ?? []) as { id: string; hours: { open_time: string | null }[] | null }[];
    for (const row of rows) {
      const times = row.hours ?? [];
      if (times.some((hour) => (hour.open_time ?? '').trim() !== '')) {
        ids.add(row.id);
      }
    }

    if (!data || data.length < PAGE_SIZE) {
      break;
    }
  }

  return ids.size;
}

async function countWhatsApp(scope: Scope): Promise<number> {
  const supabase = createAdminClient();
  let total = 0;

  for (let from = 0; from < 20_000; from += PAGE_SIZE) {
    const { data, error } = (await supabase
      .from('clinics')
      .select('whatsapp')
      .eq('status', 'approved')
      .eq('is_active', true)
      .eq(locationColumn(scope), scope.id)
      .not('whatsapp', 'is', null)
      .range(from, from + PAGE_SIZE - 1)) as RowsResult;

    if (error) {
      throw new Error(`WhatsApp count failed: ${error.message}`);
    }

    const rows = (data ?? []) as { whatsapp: string | null }[];
    total += rows.filter((row) => (row.whatsapp ?? '').trim() !== '').length;

    if (!data || data.length < PAGE_SIZE) {
      break;
    }
  }

  return total;
}

export const getHubGlance = cache(
  async (kind: 'area' | 'state', id: string): Promise<HubGlanceStats> => {
    if (!id) {
      throw new Error('getHubGlance requires a location id');
    }

    const scope: Scope = { kind, id };
    const [clinicCount, publicHolidayOpenCount, sundayOpenCount, whatsappCount] = await Promise.all(
      [
        countActiveApproved(scope, false),
        countActiveApproved(scope, true),
        countSundayOpen(scope),
        countWhatsApp(scope),
      ],
    );

    return {
      clinicCount,
      sundayOpenCount,
      publicHolidayOpenCount,
      whatsappCount,
    };
  },
);
