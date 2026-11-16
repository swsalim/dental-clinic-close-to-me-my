import { NextRequest, NextResponse } from 'next/server';

import { revalidateClinicPage } from '@/lib/listing/revalidate-clinic';
import { createAdminClient } from '@/lib/supabase';

import { DatabaseService } from '@/services/database.service';

export async function POST(req: NextRequest) {
  try {
    const { clinicId, status } = await req.json();

    if (!clinicId || !status) {
      return NextResponse.json(
        { success: false, error: 'Missing clinicId or status' },
        { status: 400 },
      );
    }

    const db = new DatabaseService();
    const updatedClinic = await db.updateClinicStatus(clinicId, status);

    const row = updatedClinic as {
      slug?: string | null;
      state_id?: string | null;
      area_id?: string | null;
    };
    if (row.slug) {
      const supabase = createAdminClient();
      const [{ data: state }, { data: area }] = await Promise.all([
        row.state_id
          ? supabase.from('states').select('slug').eq('id', row.state_id).maybeSingle()
          : Promise.resolve({ data: null }),
        row.area_id
          ? supabase.from('areas').select('slug').eq('id', row.area_id).maybeSingle()
          : Promise.resolve({ data: null }),
      ]);

      await revalidateClinicPage({
        slug: row.slug,
        stateSlug: state?.slug,
        areaSlug: area?.slug,
      });
    }

    return NextResponse.json({ success: true, clinic: updatedClinic });
  } catch (error: unknown) {
    console.error('Error updating clinic status:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      {
        error: 'Failed to update clinic status',
        details: errorMessage,
      },
      { status: 400 },
    );
  }
}
