import { createServerClient } from '@/lib/supabase';

import { ClinicTableData, columns } from './columns';
import { DataTable } from './components/data-table';

export const dynamic = 'force-dynamic';

export default async function DashboardClinicsPage() {
  const supabase = await createServerClient();
  const { data, error } = await supabase
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
    .eq('status', 'approved')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching clinics:', error);
  }

  // Convert Supabase data to our expected format
  return (
    <DataTable
      columns={columns}
      data={(data as unknown as ClinicTableData[]) || []}
      type="clinic"
    />
  );
}
