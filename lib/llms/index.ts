import { unstable_cache } from 'next/cache';

import { siteConfig } from '@/config/site';

import { getAllGuides } from '@/lib/guides';
import { LISTING_FEE_LABEL } from '@/lib/listing/submission-fee';
import {
  htmlToText,
  joinSections,
  listItem,
  LLMS_REVALIDATE_SECONDS,
  mdUrl,
} from '@/lib/llms/format';
import {
  markdownAbout,
  markdownAdvertise,
  markdownArea,
  markdownBrowse,
  markdownClinic,
  markdownClinicReviews,
  markdownDentist,
  markdownDentists,
  markdownGuide,
  markdownGuidesIndex,
  markdownHome,
  markdownService,
  markdownServicesIndex,
  markdownState,
  markdownStateDentists,
  markdownSubmit,
} from '@/lib/llms/pages';
import { absoluteUrl } from '@/lib/utils';

import { getAllServices } from '@/helpers/services';
import { getStateListings } from '@/helpers/states';

export { LLMS_REVALIDATE_SECONDS, llmsTextResponse, mdUrl } from '@/lib/llms/format';

const STATIC_PAGES = new Set([
  'about',
  'browse',
  'dentists',
  'submit',
  'advertise-with-us',
  'services',
  'place',
  'dentist',
  'index',
  'guides',
]);

async function buildLlmsIndex() {
  const [states, services] = await Promise.all([getStateListings(), getAllServices()]);
  const guides = getAllGuides();

  const sortedStates = states.slice().sort((a, b) => a.name.localeCompare(b.name));

  return joinSections([
    `# ${siteConfig.siteName}`,
    `> ${siteConfig.description}`,
    'This file is a menu of Markdown pages for AI agents. Append `.md` to any public listing URL for a token-efficient version of that page (homepage: `/index.md`). Clinic pages live at `/place/{slug}.md`; dentist pages at `/dentist/{slug}.md`.',
    '## Pages',
    [
      listItem('Home', mdUrl('/'), 'Directory of dental clinics in Malaysia'),
      listItem(
        'About',
        mdUrl('/about'),
        'What this dental clinic directory is, and how to contact or submit a listing',
      ),
      listItem(
        'Browse by location',
        mdUrl('/browse'),
        'States and cities with dental clinic listings',
      ),
      listItem('Dentists', mdUrl('/dentists'), 'Dentists practising in Malaysia'),
      listItem(
        'Guides',
        mdUrl('/guides'),
        'How to compare a dental clinic, read ratings, compare braces, find one nearby, and handle an urgent visit',
      ),
      listItem(
        'Full content',
        absoluteUrl('/llms-full.txt'),
        'Concatenated Markdown of hub pages (home, browse, dentists, services, about, guides, submit, advertise)',
      ),
    ].join('\n'),
    '## States',
    sortedStates
      .map((state) =>
        listItem(
          `Dental clinics in ${state.name}`,
          mdUrl(`/${state.slug}`),
          `Clinics, cities, and dentists in ${state.name}`,
        ),
      )
      .join('\n'),
    '## Guides',
    guides
      .map((guide) => listItem(guide.title, mdUrl(`/guides/${guide.slug}`), guide.description))
      .join('\n'),
    '## Dental services',
    services
      .map((service) =>
        listItem(
          service.name,
          mdUrl(`/services/${service.slug}`),
          htmlToText(service.description) || `Clinics offering ${service.name.toLowerCase()}`,
        ),
      )
      .join('\n'),
    '## Optional',
    [
      listItem(
        'List your clinic',
        mdUrl('/submit'),
        `Paid clinic listing form (${LISTING_FEE_LABEL} one-time)`,
      ),
      listItem(
        'Advertise with us',
        mdUrl('/advertise-with-us'),
        'Featured placement and pricing for clinic owners',
      ),
    ].join('\n'),
  ]);
}

async function buildLlmsFull() {
  const [home, browse, dentists, services] = await Promise.all([
    markdownHome(),
    markdownBrowse(),
    markdownDentists(),
    markdownServicesIndex(),
  ]);

  return [
    home,
    browse,
    dentists,
    services,
    markdownAbout(),
    markdownGuidesIndex(),
    markdownSubmit(),
    markdownAdvertise(),
  ].join('\n\n---\n\n');
}

export const getLlmsIndex = unstable_cache(buildLlmsIndex, ['llms-index-v3'], {
  revalidate: LLMS_REVALIDATE_SECONDS,
  tags: ['clinics', 'states', 'areas', 'doctors'],
});

export const getLlmsFull = unstable_cache(buildLlmsFull, ['llms-full-v2'], {
  revalidate: LLMS_REVALIDATE_SECONDS,
  tags: ['clinics', 'states', 'areas', 'doctors'],
});

export async function getPageMarkdown(slug: string[]): Promise<string | null> {
  const segments = slug.filter(Boolean);

  if (segments.length === 0 || (segments.length === 1 && segments[0] === 'index')) {
    return markdownHome();
  }

  const [first, second, third] = segments;

  if (segments.length === 1) {
    switch (first) {
      case 'browse':
        return markdownBrowse();
      case 'dentists':
        return markdownDentists();
      case 'submit':
        return markdownSubmit();
      case 'advertise-with-us':
        return markdownAdvertise();
      case 'about':
        return markdownAbout();
      case 'services':
        return markdownServicesIndex();
      case 'guides':
        return markdownGuidesIndex();
      default:
        if (STATIC_PAGES.has(first)) {
          return null;
        }
        return markdownState(first);
    }
  }

  if (first === 'services' && second && segments.length === 2) {
    return markdownService(second);
  }

  if (first === 'guides' && second && segments.length === 2) {
    return markdownGuide(second);
  }

  if (first === 'place' && second && segments.length === 2) {
    return markdownClinic(second);
  }

  if (first === 'place' && second && third === 'reviews' && segments.length === 3) {
    return markdownClinicReviews(second);
  }

  if (first === 'dentist' && second && segments.length === 2) {
    return markdownDentist(second);
  }

  if (second === 'dentists' && segments.length === 2 && !STATIC_PAGES.has(first)) {
    return markdownStateDentists(first);
  }

  if (segments.length === 2 && !STATIC_PAGES.has(first)) {
    return markdownArea(first, second);
  }

  return null;
}
