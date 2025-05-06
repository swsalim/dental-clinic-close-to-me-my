import { getServerSideSitemap } from 'next-sitemap';

import { absoluteUrl } from '@/lib/utils';

import { getAreaListings } from '@/helpers/areas';
import { getClinicListings } from '@/helpers/clinics';
import { getStateListings } from '@/helpers/states';

interface SitemapEntry {
  loc: string;
  lastmod: string;
}

export async function GET() {
  const states = await getStateListings();
  const areas = await getAreaListings();
  const clinics = await getClinicListings();

  const fields: SitemapEntry[] = [];

  clinics.forEach((clinic) => {
    fields.push({
      loc: absoluteUrl(`/place/${clinic.slug}`),
      lastmod: new Date().toISOString(),
    });
  });

  states.forEach((state) => {
    fields.push({
      loc: absoluteUrl(`/${state.slug}`),
      lastmod: new Date().toISOString(),
    });
  });

  areas.forEach((area) => {
    fields.push({
      loc: absoluteUrl(`/${area.state.slug}/${area.slug}`),
      lastmod: new Date().toISOString(),
    });
  });

  return getServerSideSitemap([...fields]);
}
