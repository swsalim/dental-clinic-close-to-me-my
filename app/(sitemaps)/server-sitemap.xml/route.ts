import { getServerSideSitemap } from 'next-sitemap';

import { getLocationSignals } from '@/lib/sitemap/location-signals';
import { createAdminClient } from '@/lib/supabase';
import { absoluteUrl } from '@/lib/utils';

import { getAreaListings } from '@/helpers/areas';
import { getClinicListings } from '@/helpers/clinics';
import { getDoctorListings } from '@/helpers/doctors';
import { getAllServices } from '@/helpers/services';
import { getStateListings } from '@/helpers/states';

interface SitemapEntry {
  loc: string;
  lastmod: string;
}

export const revalidate = 86_400;

function sitemapLastmod(...values: Array<string | null | undefined>): string {
  let latest = 0;

  for (const value of values) {
    if (!value) {
      continue;
    }
    const parsed = new Date(value).getTime();
    if (!Number.isNaN(parsed) && parsed > latest) {
      latest = parsed;
    }
  }

  if (!latest) {
    return '2026-01-01T00:00:00.000Z';
  }

  return new Date(latest).toISOString();
}

export async function GET() {
  const [states, areas, clinics, doctors, services, signals] = await Promise.all([
    getStateListings(),
    getAreaListings(),
    getClinicListings(),
    getDoctorListings(),
    getAllServices(),
    getLocationSignals(createAdminClient()),
  ]);

  const fields: SitemapEntry[] = [];

  clinics.forEach((clinic) => {
    fields.push({
      loc: absoluteUrl(`/place/${clinic.slug}`),
      lastmod: sitemapLastmod(clinic.modified_at),
    });
  });

  states.forEach((state) => {
    const clinicCount = signals ? (signals.stateCount[state.id] ?? 0) : null;
    const lastmod = sitemapLastmod(state.modified_at, signals?.stateLastmod[state.id]);

    if (clinicCount !== 0) {
      fields.push({
        loc: absoluteUrl(`/${state.slug}`),
        lastmod,
      });
    }

    fields.push({
      loc: absoluteUrl(`/${state.slug}/dentists`),
      lastmod,
    });
  });

  areas.forEach((area) => {
    const clinicCount = signals ? (signals.areaCount[area.id] ?? 0) : null;
    if (clinicCount === 0) {
      return;
    }

    fields.push({
      loc: absoluteUrl(`/${area.state.slug}/${area.slug}`),
      lastmod: sitemapLastmod(area.modified_at, signals?.areaLastmod[area.id]),
    });
  });

  doctors.forEach((doctor) => {
    fields.push({
      loc: absoluteUrl(`/dentist/${doctor.slug}`),
      lastmod: sitemapLastmod(doctor.modified_at),
    });
  });

  services.forEach((service) => {
    fields.push({
      loc: absoluteUrl(`/services/${service.slug}`),
      lastmod: sitemapLastmod(service.modified_at, signals?.serviceLastmod[service.id]),
    });
  });

  const staticPages = ['/', '/browse', '/dentists', '/submit', '/advertise-with-us'];

  staticPages.forEach((page) => {
    fields.push({
      loc: absoluteUrl(page),
      lastmod: '2026-01-01T00:00:00.000Z',
    });
  });

  const sitemap = await getServerSideSitemap([...fields]);
  sitemap.headers.set('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=86400');
  return sitemap;
}
