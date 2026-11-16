import { revalidateTag } from 'next/cache';
import { NextResponse } from 'next/server';

import { revalidateClinicPage } from '@/lib/listing/revalidate-clinic';

export async function POST(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.SUPABASE_REVALIDATE_TOKEN}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = (await request.json()) as {
    table?: string;
    slug?: string;
    stateSlug?: string;
    areaSlug?: string;
  };

  if (!body.table) {
    return new Response('No table name provided', { status: 400 });
  }
  if (!['clinics', 'areas', 'states', 'doctors'].includes(body.table)) {
    return new Response('Invalid table name', { status: 400 });
  }

  if (body.table === 'clinics') {
    if (!body.slug) {
      return NextResponse.json({
        revalidated: false,
        reason: 'Clinic updates require slug, and optionally stateSlug and areaSlug.',
      });
    }

    await revalidateClinicPage({
      slug: body.slug,
      stateSlug: body.stateSlug,
      areaSlug: body.areaSlug,
    });
  } else if (body.table === 'areas') {
    revalidateTag('areas');
  } else if (body.table === 'states') {
    revalidateTag('states');
    revalidateTag('popular-states');
  } else if (body.table === 'doctors') {
    revalidateTag('doctors');
  }

  return NextResponse.json({ revalidated: true, now: Date.now() });
}
