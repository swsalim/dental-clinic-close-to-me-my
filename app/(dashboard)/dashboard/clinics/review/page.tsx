import { createBrowserClient } from '@/lib/supabase';

import { ClinicTableData, columns } from '../columns';
import { DataTable } from '../components/data-table';

export const dynamic = 'force-dynamic';

export default async function DashboardClinicsPage() {
  const supabase = createBrowserClient();
  const { data } = await supabase
    .from('clinics')
    .select(
      `id,
      name,
      slug,
      website,
      images,
      area:area_id(name, slug),
      state:state_id(name, slug),
      is_active`,
    )
    .eq('status', 'pending')
    .order('modified_at', { ascending: false });

  return (
    <DataTable
      columns={columns}
      data={(data as unknown as ClinicTableData[]) || []}
      type="clinic"
    />
  );
}
