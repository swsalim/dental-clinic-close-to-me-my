import pluralize from 'pluralize';

/** Areas with fewer active approved clinics than this are noindex,follow. */
export const MIN_INDEXABLE_AREA_CLINICS = 3;

export type HubGlanceStats = {
  /** Active approved clinics (`is_active` and `status = 'approved'`). */
  clinicCount: number;
  /** Distinct clinics with a non-blank Sunday `clinic_hours.open_time` (day_of_week 6). */
  sundayOpenCount: number;
  /** Clinics with a non-blank `whatsapp` value. */
  whatsappCount: number;
};

export type HubLink = {
  href: string;
  label: string;
};

export type HubQuestion = {
  heading: string;
  answer: string;
};

const FALLBACK_LINKS: HubLink[] = [
  { href: '/browse', label: 'Browse clinics by location' },
  { href: '/dentists', label: 'Dentists in Malaysia' },
  { href: '/guides', label: 'Dental guides' },
  { href: '/about', label: 'About this directory' },
  { href: '/services/general-dentistry', label: 'General dentistry' },
  { href: '/services/braces', label: 'Braces' },
  { href: '/services/dental-implants', label: 'Dental implants' },
  { href: '/services/emergency-dentistry', label: 'Emergency dentistry' },
];

export function areaIsIndexable(clinicCount: number): boolean {
  return clinicCount >= MIN_INDEXABLE_AREA_CLINICS;
}

function formatCount(value: number): string {
  return value.toLocaleString('en-MY');
}

function listedSentence(stats: HubGlanceStats, placeLabel: string): string {
  const verb = stats.clinicCount === 1 ? 'is' : 'are';
  return `${formatCount(stats.clinicCount)} active approved dental ${pluralize('clinic', stats.clinicCount)} ${verb} listed in ${placeLabel}.`;
}

function sundaySentence(stats: HubGlanceStats): string {
  const verb = stats.sundayOpenCount === 1 ? 'has' : 'have';
  return `${formatCount(stats.sundayOpenCount)} ${verb} a Sunday opening time stored.`;
}

function whatsappSentence(stats: HubGlanceStats): string {
  const verb = stats.whatsappCount === 1 ? 'has' : 'have';
  return `${formatCount(stats.whatsappCount)} ${verb} a WhatsApp number stored.`;
}

export function buildHubCopy(placeName: string, placeLabel: string, stats: HubGlanceStats) {
  const questions: HubQuestion[] = [
    {
      heading: `How many dental clinics are in ${placeName}?`,
      answer: listedSentence(stats, placeLabel),
    },
    {
      heading: `Which dental clinics in ${placeName} open on Sunday?`,
      answer: `${sundaySentence(stats)} Opening hours for a clinic are on its own page.`,
    },
  ];

  const faq: HubQuestion[] = [
    questions[0],
    {
      heading: `How many dental clinics in ${placeName} are open on Sunday?`,
      answer: sundaySentence(stats),
    },
  ];

  const rows = [
    { label: 'Active clinics', value: formatCount(stats.clinicCount) },
    { label: 'Open on Sunday', value: formatCount(stats.sundayOpenCount) },
  ];

  // A WhatsApp count of 0 is missing contact data (most clinics have a null or
  // blank number), so the hub does not print that zero. A stored number stays.
  if (stats.whatsappCount > 0) {
    questions.push({
      heading: `Which dental clinics in ${placeName} have WhatsApp?`,
      answer: whatsappSentence(stats),
    });
    faq.push({
      heading: `How many dental clinics in ${placeName} have a WhatsApp number?`,
      answer: whatsappSentence(stats),
    });
    rows.push({ label: 'With WhatsApp', value: formatCount(stats.whatsappCount) });
  }

  faq.push(
    {
      heading: `Where is the clinic list for ${placeName}?`,
      answer: `The clinics for ${placeLabel} are listed on this page. The counts above include every active approved clinic, including clinics on later pages.`,
    },
    {
      heading: `Which other pages list dental clinics near ${placeName}?`,
      answer:
        'The related pages below link to the state, nearby areas, services, or other directory pages.',
    },
  );

  return {
    atAGlanceLabel: 'At a glance',
    rows,
    questions,
    faqHeading: `Questions about dental clinics in ${placeName}`,
    faq,
    relatedHeading: 'Related pages',
  };
}

/** Keeps every provided link, then fills from directory pages until `minimum`. */
export function withMinimumHubLinks(links: HubLink[], minimum = 8): HubLink[] {
  const seen = new Set<string>();
  const result: HubLink[] = [];

  const push = (link: HubLink) => {
    if (seen.has(link.href)) {
      return;
    }
    seen.add(link.href);
    result.push(link);
  };

  for (const link of links) {
    push(link);
  }
  for (const link of FALLBACK_LINKS) {
    if (result.length >= minimum) {
      break;
    }
    push(link);
  }

  return result;
}
