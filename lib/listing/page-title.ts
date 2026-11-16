/** Soft limit for <title> length; Google typically truncates around here. */
export const TITLE_MAX_LENGTH = 60;

type ClinicTitleInput = {
  name: string;
  areaName?: string | null;
  /** The page renders an "Opening Hours" section. */
  hasHours: boolean;
  /** The page renders a map with real coordinates. */
  hasMap: boolean;
  /** The page renders at least one review card. */
  hasReviews: boolean;
};

function joinFeatures(features: string[]): string {
  if (features.length <= 1) {
    return features[0] ?? '';
  }
  if (features.length === 2) {
    return `${features[0]} & ${features[1]}`;
  }
  return `${features.slice(0, -1).join(', ')} & ${features[features.length - 1]}`;
}

/**
 * Clinic page title, e.g. "Dgigi Dental, Klang: Hours, Map & Reviews".
 * Only names features the page actually renders, and drops parts
 * (Reviews, then the whole suffix, then the area) to stay within
 * TITLE_MAX_LENGTH. Falls back to the bare clinic name.
 */
export function buildClinicTitle({
  name,
  areaName,
  hasHours,
  hasMap,
  hasReviews,
}: ClinicTitleInput): string {
  const cleanName = name.trim();
  const area = areaName?.trim();
  const nameHasArea = !!area && cleanName.toLowerCase().includes(area.toLowerCase());
  const place = area && !nameHasArea ? `${cleanName}, ${area}` : cleanName;

  const baseFeatures = [hasHours && 'Hours', hasMap && 'Map'].filter(Boolean) as string[];
  const fullFeatures = hasReviews ? [...baseFeatures, 'Reviews'] : baseFeatures;

  const candidates: string[] = [];
  if (fullFeatures.length > 0) {
    candidates.push(`${place}: ${joinFeatures(fullFeatures)}`);
  }
  if (hasReviews && baseFeatures.length > 0) {
    candidates.push(`${place}: ${joinFeatures(baseFeatures)}`);
  }
  candidates.push(place, cleanName);

  return candidates.find((title) => title.length <= TITLE_MAX_LENGTH) ?? cleanName;
}

/** Number of pages for a paginated listing (never less than 1). */
export function listingTotalPages(totalItems: number, perPage: number): number {
  return Math.max(1, Math.ceil(totalItems / perPage));
}

/** Page 1 keeps its title; page 2+ gets " (Page 3 of 6)". */
export function paginatedTitle(title: string, currentPage: number, totalPages?: number): string {
  if (currentPage <= 1) {
    return title;
  }
  const of = totalPages && totalPages >= currentPage ? ` of ${totalPages}` : '';
  return `${title} (Page ${currentPage}${of})`;
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
