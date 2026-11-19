/** Soft limit for <title> length; Google typically truncates around here. */
export const TITLE_MAX_LENGTH = 60;

/** Soft limit for meta descriptions; Google typically truncates around here. */
export const DESCRIPTION_MAX_LENGTH = 160;

type ClinicTitleInput = {
  name: string;
  areaName?: string | null;
  /** Street city, used only when the clinic has no area name. */
  cityName?: string | null;
  /** The page renders an Opening Hours section. */
  hasHours: boolean;
  /** Stored aggregate. Omitted from the title unless it is a real 0–5 score. */
  rating?: number | string | null;
  /** Stored review count. Omitted unless it is a positive integer. */
  reviewCount?: number | string | null;
};

type ClinicDescriptionInput = ClinicTitleInput & {
  stateName?: string | null;
  /** The page renders a map with real coordinates. */
  hasMap: boolean;
  /** The page renders at least one review card. */
  hasReviews: boolean;
  /** The page renders at least one service. */
  hasServices: boolean;
};

function positiveRating(value: number | string | null | undefined): number | null {
  if (value == null || value === '') {
    return null;
  }
  const parsed = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0 || parsed > 5) {
    return null;
  }
  return parsed;
}

function positiveReviewCount(value: number | string | null | undefined): number | null {
  if (value == null || value === '') {
    return null;
  }
  const parsed = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0 || !Number.isInteger(parsed)) {
    return null;
  }
  return parsed;
}

function formatRating(rating: number): string {
  return (Math.round(rating * 10) / 10).toFixed(1);
}

function formatCount(count: number): string {
  return new Intl.NumberFormat('en-MY').format(count);
}

/** Proof snippets, longest first. Empty when the clinic has neither a rating nor a count. */
function ratingFragments(rating: number | null, reviewCount: number | null): string[] {
  const ratingText = rating != null ? `${formatRating(rating)}/5` : null;
  const countText = reviewCount != null ? `${formatCount(reviewCount)} reviews` : null;
  const countShort = reviewCount != null ? formatCount(reviewCount) : null;

  if (ratingText && countText && countShort) {
    return [`${ratingText} (${countText})`, `${ratingText} (${countShort})`, ratingText];
  }
  if (ratingText) {
    return [ratingText];
  }
  if (countText) {
    return [countText];
  }
  return [];
}

function localityLabel(areaName?: string | null, cityName?: string | null): string {
  const area = areaName?.trim();
  if (area) {
    return area;
  }
  return cityName?.trim() ?? '';
}

function placeLabel(name: string, locality: string): string {
  if (!locality) {
    return name;
  }
  if (name.toLowerCase().includes(locality.toLowerCase())) {
    return name;
  }
  return `${name}, ${locality}`;
}

function firstWithinLimit(candidates: string[], limit: number): string | undefined {
  return candidates.find((candidate) => candidate.length > 0 && candidate.length <= limit);
}

/**
 * Clinic page title, e.g. "Lay Dental Clinic, Mont Kiara · 5.0/5 (170 reviews)".
 * Rating, review count, and "Hours" are added only when that data exists.
 * Drops the review wording, then Hours, then the area, to stay within
 * TITLE_MAX_LENGTH. Falls back to the bare clinic name.
 */
export function buildClinicTitle({
  name,
  areaName,
  cityName,
  hasHours,
  rating,
  reviewCount,
}: ClinicTitleInput): string {
  const cleanName = name.trim();
  const locality = localityLabel(areaName, cityName);
  const place = placeLabel(cleanName, locality);
  const fragments = ratingFragments(positiveRating(rating), positiveReviewCount(reviewCount));

  const withPlace = suffixes(place, fragments, hasHours);
  const withName = place === cleanName ? [] : suffixes(cleanName, fragments, hasHours);
  const candidates = [...withPlace, ...withName, cleanName];

  return firstWithinLimit(candidates, TITLE_MAX_LENGTH) ?? cleanName;
}

function suffixes(label: string, fragments: string[], hasHours: boolean): string[] {
  const titles: string[] = [];
  for (const fragment of fragments) {
    if (hasHours) {
      titles.push(`${label} · ${fragment} · Hours`);
    }
    titles.push(`${label} · ${fragment}`);
  }
  if (hasHours) {
    titles.push(`${label} · Hours`);
  }
  titles.push(label);
  return titles;
}

/**
 * Meta description built only from fields the clinic actually has.
 * Opening hours are named only when the page renders that section.
 */
export function buildClinicDescription({
  name,
  areaName,
  cityName,
  stateName,
  hasHours,
  hasMap,
  hasReviews,
  hasServices,
  rating,
  reviewCount,
}: ClinicDescriptionInput): string {
  const cleanName = name.trim() || 'This dental clinic';
  const area = localityLabel(areaName, cityName);
  const state = stateName?.trim() ?? '';
  const places = [area && state ? `${area}, ${state}` : area || state].filter(
    (place): place is string => !!place,
  );
  if (area && state) {
    places.push(area);
  }

  const score = positiveRating(rating);
  const count = positiveReviewCount(reviewCount);
  let proof = '';
  if (score != null && count != null) {
    proof = ` Rated ${formatRating(score)}/5 from ${formatCount(count)} reviews.`;
  } else if (score != null) {
    proof = ` Rated ${formatRating(score)}/5.`;
  } else if (count != null) {
    proof = ` ${formatCount(count)} patient reviews.`;
  }

  const sections = [
    hasServices && 'services',
    hasHours && 'opening hours',
    hasMap && 'a map',
    hasReviews && 'patient reviews',
    'contact details',
  ].filter(Boolean) as string[];
  const fullTail = ` See ${joinWords(sections)}.`;
  const shortTail = ` See ${joinWords(
    [hasHours && 'opening hours', 'contact details'].filter(Boolean) as string[],
  )}.`;

  const placeList = places.length > 0 ? places : [''];
  const leads = placeList.map((place) =>
    place
      ? `${cleanName} is a dental clinic in ${place}.`
      : `${cleanName} is a dental clinic in Malaysia.`,
  );
  // Try every location with the hours sentence (when hours exist) before
  // falling back to a location-only sentence that drops it.
  const candidates = [
    ...leads.map((lead) => `${lead}${proof}${fullTail}`),
    ...leads.map((lead) => `${lead}${proof}${shortTail}`),
    ...leads.map((lead) => `${lead}${proof}`.trim()),
  ];

  return (
    firstWithinLimit(candidates, DESCRIPTION_MAX_LENGTH) ??
    `${candidates[candidates.length - 1].slice(0, DESCRIPTION_MAX_LENGTH - 1).trimEnd()}…`
  );
}

/** Number of pages for a paginated listing (never less than 1). */
export function listingTotalPages(totalItems: number, perPage: number): number {
  return Math.max(1, Math.ceil(totalItems / perPage));
}

/**
 * Page 1 keeps its title. Page 2+ leads with "Page 3 of 6:" so the page
 * number survives Google's truncation (a trailing marker was being cut,
 * and the result looked like the page-1 title). Drops "of N", then a
 * leading "Top {count} ", before trimming, to stay within TITLE_MAX_LENGTH.
 */
export function paginatedTitle(title: string, currentPage: number, totalPages?: number): string {
  if (currentPage <= 1) {
    return title;
  }

  const of = totalPages && totalPages >= currentPage ? ` of ${totalPages}` : '';
  const prefixes = [`Page ${currentPage}${of}: `, `Page ${currentPage}: `];
  const bases = [title];
  const withoutCount = title.replace(/^Top \d+ /, '');
  if (withoutCount !== title) {
    bases.push(withoutCount);
  }

  for (const prefix of prefixes) {
    for (const base of bases) {
      const candidate = `${prefix}${base}`;
      if (candidate.length <= TITLE_MAX_LENGTH) {
        return candidate;
      }
    }
  }

  const prefix = `Page ${currentPage}: `;
  const room = TITLE_MAX_LENGTH - prefix.length;
  const base = bases[bases.length - 1] ?? title;
  if (room <= 1) {
    return prefix.trim();
  }
  return `${prefix}${base.slice(0, room - 1).trimEnd()}…`;
}

/** Page 1 keeps its description; page 2+ notes which slice of the list it shows. */
export function paginatedDescription(
  description: string,
  currentPage: number,
  options: { perPage: number; totalItems?: number; noun: string },
): string {
  if (currentPage <= 1) {
    return description;
  }
  const { perPage, totalItems, noun } = options;
  const start = (currentPage - 1) * perPage + 1;
  if (totalItems === undefined) {
    return `Page ${currentPage}: ${noun} from ${start}. ${description}`;
  }
  const end = Math.min(currentPage * perPage, totalItems);
  const totalPages = listingTotalPages(totalItems, perPage);
  if (start > totalItems) {
    return `Page ${currentPage}. ${description}`;
  }
  return `Page ${currentPage} of ${totalPages}: ${noun} ${start}–${end} of ${totalItems}. ${description}`;
}

/** Joins words as "a", "a and b", "a, b and c". */
export function joinWords(words: string[]): string {
  if (words.length <= 1) {
    return words[0] ?? '';
  }
  return `${words.slice(0, -1).join(', ')} and ${words[words.length - 1]}`;
}

/**
 * Metadata title for a listing page. Page 1 uses the site-wide
 * "%s · Dental Clinics Malaysia" template; page 2+ is absolute so the
 * "(Page N of M)" marker isn't pushed past Google's cut-off by the brand.
 */
export function listingMetaTitle(title: string, currentPage: number): string | { absolute: string } {
  return currentPage > 1 ? { absolute: title } : title;
}

/** Only the first MAX_INDEXED_LISTING_PAGE pages of a non-empty list are indexable. */
export function listingRobots(
  currentPage: number,
  hasItems: boolean,
  maxIndexedPage: number,
): { index: boolean; follow: boolean } {
  return { index: hasItems && currentPage <= maxIndexedPage, follow: true };
}

/** True when the requested page is past the last page of a non-empty list. */
export function isPastLastPage(currentPage: number, totalItems: number, perPage: number): boolean {
  return currentPage > 1 && currentPage > Math.ceil(totalItems / perPage);
}

/**
 * Service list description, e.g. "Find qualified dental clinics near you offering
 * Orthodontics: braces, aligners, and bite correction. Compare reviews, …".
 * Service blurbs are stored as sentence fragments ending in a period.
 */
export function serviceListingDescription(serviceName: string, blurb?: string | null): string {
  const tail = 'Compare reviews, locations, and book appointments online.';
  const cleaned = blurb?.trim().replace(/[.\s]+$/, '');
  if (!cleaned || cleaned.toLowerCase() === serviceName.trim().toLowerCase()) {
    return `Find qualified dental clinics near you offering ${serviceName}. ${tail}`;
  }
  const fragment = cleaned.charAt(0).toLowerCase() + cleaned.slice(1);
  return `Find qualified dental clinics near you offering ${serviceName}: ${fragment}. ${tail}`;
}
