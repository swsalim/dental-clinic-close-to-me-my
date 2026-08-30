import { getServerSideSitemap } from 'next-sitemap';

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

function sitemapLastmod(value?: string | null): string {
  if (!value) {
    return '2026-01-01T00:00:00.000Z';
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return '2026-01-01T00:00:00.000Z';
  }
  return parsed.toISOString();
}

export async function GET() {
  const [states, areas, clinics, doctors, services] = await Promise.all([
    getStateListings(),
    getAreaListings(),
    getClinicListings(),
    getDoctorListings(),
    getAllServices(),
  ]);

  const fields: SitemapEntry[] = [];

  clinics.forEach((clinic) => {
    const lastmod = sitemapLastmod(clinic.modified_at);
    fields.push({
      loc: absoluteUrl(`/place/${clinic.slug}`),
      lastmod,
    });
    fields.push({
      loc: absoluteUrl(`/place/${clinic.slug}/reviews`),
      lastmod,
    });
  });

  states.forEach((state) => {
    fields.push({
      loc: absoluteUrl(`/${state.slug}`),
      lastmod: sitemapLastmod(state.modified_at),
    });
    fields.push({
      loc: absoluteUrl(`/${state.slug}/dentists`),
      lastmod: sitemapLastmod(state.modified_at),
    });
  });

  areas.forEach((area) => {
    fields.push({
      loc: absoluteUrl(`/${area.state.slug}/${area.slug}`),
      lastmod: sitemapLastmod(area.modified_at),
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
      lastmod: sitemapLastmod(service.modified_at),
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
