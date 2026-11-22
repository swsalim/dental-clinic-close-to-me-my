import { NextResponse } from 'next/server';

import { getLocationCatalog, isLocationScope } from '@/lib/listing/location-clinic-index';
import {
  countClinicAvailability,
  filterLocationClinics,
  paginateClinics,
  parseLocationFilters,
  toListingClinic,
  type LocationScope,
} from '@/lib/listing/location-filters';

export const dynamic = 'force-dynamic';

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function scopeFrom(params: URLSearchParams): LocationScope | null {
  const kind = params.get('kind');
  const stateSlug = params.get('state') ?? '';
  const areaSlug = params.get('area') ?? '';

  if (!SLUG.test(stateSlug)) return null;
  if (kind === 'state') return { kind: 'state', stateSlug };
  if (kind === 'area' && SLUG.test(areaSlug)) return { kind: 'area', stateSlug, areaSlug };
  return null;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const scope = scopeFrom(url.searchParams);

  if (!scope || !isLocationScope(scope)) {
    return NextResponse.json({ error: 'Unknown location' }, { status: 400 });
  }

  const limit = Math.min(Math.max(Number(url.searchParams.get('limit')) || 20, 1), 24);
  const filters = parseLocationFilters(url.searchParams);
  const countsOnly = url.searchParams.get('counts') === '1';

  try {
    const catalog = await getLocationCatalog(scope);
    const availability = countClinicAvailability(catalog.clinics);

    if (countsOnly) {
      return NextResponse.json(availability, {
        headers: { 'Cache-Control': 'private, no-store' },
      });
    }

    const matched = filterLocationClinics(catalog.clinics, filters);
    const page = paginateClinics(matched, filters.page, limit);

    return NextResponse.json(
      {
        clinics: page.clinics.map(toListingClinic),
        total: page.total,
        page: page.page,
        totalPages: page.totalPages,
        availability,
      },
      {
        headers: {
          'Cache-Control': filters.hours
            ? 'private, no-store'
            : 'public, s-maxage=3600, stale-while-revalidate=86400',
        },
      },
    );
  } catch (error) {
    console.error('Location listing filter failed', error);
    return NextResponse.json({ error: 'Could not filter clinics' }, { status: 500 });
  }
}
