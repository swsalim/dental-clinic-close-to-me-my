import { getClinicAvailability, matchesHoursFilter } from '@/lib/listing/clinic-availability';

export const LOCATION_RATING_OPTIONS = [
  { value: '4.5', score: 4.5, label: '4.5+' },
  { value: '4', score: 4, label: '4.0+' },
  { value: '3.5', score: 3.5, label: '3.5+' },
  { value: '3', score: 3, label: '3.0+' },
] as const;

export type LocationRating = (typeof LOCATION_RATING_OPTIONS)[number]['value'];
export type LocationSort = 'featured' | 'rating' | 'rating-asc' | 'name' | 'name-desc';
export type LocationHours = '' | 'open' | 'closed';

export type LocationScope =
  | { kind: 'state'; stateSlug: string }
  | { kind: 'area'; stateSlug: string; areaSlug: string };

export type LocationFilters = {
  q: string;
  hours: LocationHours;
  weekends: boolean;
  rating: LocationRating | '';
  services: string[];
  sort: LocationSort;
  page: number;
};

export type LocationServiceFacet = {
  slug: string;
  name: string;
  count: number;
};

export type LocationFacets = {
  total: number;
  sunday: number;
  whatsapp: number;
  weekends: number;
  ratings: Record<LocationRating, number>;
  averageRating: number | null;
  services: LocationServiceFacet[];
};

export type LocationAvailabilityCounts = {
  open: number;
  closed: number;
};

export type ListingClinic = {
  slug: string;
  name: string;
  address: string;
  neighborhood: string;
  city: string;
  phone: string;
  postalCode: string;
  state: string;
  area: string;
  image: {
    image_url?: string | null;
    imagekit_file_id?: string | null;
    r2_url?: string | null;
    r2_key?: string | null;
  } | null;
  rating: number | null;
  isFeatured: boolean;
  hours: {
    day_of_week?: number;
    open_time?: string | null;
    close_time?: string | null;
  }[];
  specialHours: {
    date?: string;
    is_closed?: boolean | null;
    open_time?: string | null;
    close_time?: string | null;
  }[];
  openOnPublicHolidays: boolean;
};

export type IndexClinic = ListingClinic & {
  hasSundayHours: boolean;
  hasWeekendHours: boolean;
  hasWhatsapp: boolean;
  serviceSlugs: string[];
  modifiedAt: string;
};

export const DEFAULT_LOCATION_FILTERS: LocationFilters = {
  q: '',
  hours: '',
  weekends: false,
  rating: '',
  services: [],
  sort: 'featured',
  page: 1,
};

export const EMPTY_LOCATION_FACETS: LocationFacets = {
  total: 0,
  sunday: 0,
  whatsapp: 0,
  weekends: 0,
  ratings: { '4.5': 0, '4': 0, '3.5': 0, '3': 0 },
  averageRating: null,
  services: [],
};

const SERVICE_SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const RATING_VALUES = new Set<string>(LOCATION_RATING_OPTIONS.map((option) => option.value));

export function hasActiveLocationFilters(filters: LocationFilters): boolean {
  return Boolean(
    filters.q.trim() ||
      filters.hours ||
      filters.weekends ||
      filters.rating ||
      filters.services.length > 0 ||
      filters.sort !== 'featured',
  );
}

export function parseLocationFilters(params: URLSearchParams): LocationFilters {
  const rating = params.get('rating') ?? '';
  const sort = params.get('sort');
  const services = params
    .getAll('service')
    .map((slug) => slug.trim().toLowerCase())
    .filter((slug) => SERVICE_SLUG.test(slug))
    .slice(0, 12);

  const page = Number(params.get('page'));
  const hours = params.get('hours');

  return {
    q: (params.get('q') ?? '').trim().slice(0, 80),
    hours: hours === 'open' || hours === 'closed' ? hours : '',
    weekends: params.get('weekends') === '1',
    rating: RATING_VALUES.has(rating) ? (rating as LocationRating) : '',
    services: [...new Set(services)],
    sort:
      sort === 'rating' || sort === 'rating-asc' || sort === 'name' || sort === 'name-desc'
        ? sort
        : 'featured',
    page: Number.isFinite(page) && page > 1 ? Math.min(Math.floor(page), 100) : 1,
  };
}

export function locationFilterSearchParams(filters: LocationFilters): URLSearchParams {
  const params = new URLSearchParams();
  const query = filters.q.trim();

  if (query) params.set('q', query);
  if (filters.hours) params.set('hours', filters.hours);
  if (filters.weekends) params.set('weekends', '1');
  if (filters.rating) params.set('rating', filters.rating);
  filters.services.forEach((service) => params.append('service', service));
  if (filters.sort !== 'featured') params.set('sort', filters.sort);
  if (filters.page > 1 && hasActiveLocationFilters(filters)) params.set('page', String(filters.page));

  return params;
}

export function locationFilterHref(basePath: string, filters: LocationFilters): string {
  const search = locationFilterSearchParams(filters).toString();
  return search ? `${basePath}?${search}` : basePath;
}

export function locationListingRequest(
  scope: LocationScope,
  filters: LocationFilters,
  limit: number,
): string {
  const params = locationFilterSearchParams(filters);
  params.set('kind', scope.kind);
  params.set('state', scope.stateSlug);
  params.set('limit', String(limit));
  if (scope.kind === 'area') params.set('area', scope.areaSlug);
  return `/api/listings/location?${params.toString()}`;
}

export function clinicOpenOnWeekends(clinic: Pick<IndexClinic, 'hours' | 'hasWeekendHours'>): boolean {
  if (clinic.hasWeekendHours) return true;
  return clinic.hours.some(
    (hour) =>
      (hour.day_of_week === 5 || hour.day_of_week === 6) && (hour.open_time ?? '').trim() !== '',
  );
}

function ratingFloor(rating: LocationRating | ''): number | null {
  if (!rating) return null;
  return Number(rating);
}

export function filterLocationClinics(
  clinics: IndexClinic[],
  filters: LocationFilters,
  now: Date = new Date(),
): IndexClinic[] {
  const query = filters.q.trim().toLowerCase();
  const minimumRating = ratingFloor(filters.rating);
  const selectedServices = new Set(filters.services);

  const matched = clinics.filter((clinic) => {
    if (filters.hours) {
      const status = getClinicAvailability(clinic.hours, clinic.specialHours, now);
      if (!matchesHoursFilter(status, filters.hours)) return false;
    }
    if (filters.weekends && !clinicOpenOnWeekends(clinic)) return false;
    if (minimumRating != null && (clinic.rating == null || clinic.rating < minimumRating)) {
      return false;
    }
    if (selectedServices.size > 0) {
      const offersOne = clinic.serviceSlugs.some((slug) => selectedServices.has(slug));
      if (!offersOne) return false;
    }
    if (query) {
      const haystack = `${clinic.name} ${clinic.address} ${clinic.area} ${clinic.city}`.toLowerCase();
      if (!haystack.includes(query)) return false;
    }
    return true;
  });

  matched.sort((left, right) => compareClinics(left, right, filters.sort));
  return matched;
}

export function countClinicAvailability(
  clinics: IndexClinic[],
  now: Date = new Date(),
): LocationAvailabilityCounts {
  let open = 0;
  let closed = 0;

  for (const clinic of clinics) {
    const status = getClinicAvailability(clinic.hours, clinic.specialHours, now);
    if (matchesHoursFilter(status, 'open')) open += 1;
    if (matchesHoursFilter(status, 'closed')) closed += 1;
  }

  return { open, closed };
}

function compareName(left: IndexClinic, right: IndexClinic, direction: 1 | -1): number {
  return direction * left.name.localeCompare(right.name, 'en', { sensitivity: 'base' });
}

function compareRating(left: IndexClinic, right: IndexClinic, direction: 'asc' | 'desc'): number {
  if (left.rating == null && right.rating == null) return compareName(left, right, 1);
  if (left.rating == null) return 1;
  if (right.rating == null) return -1;

  const ratingDelta = direction === 'desc' ? right.rating - left.rating : left.rating - right.rating;
  if (ratingDelta !== 0) return ratingDelta;
  return compareName(left, right, 1);
}

function compareClinics(left: IndexClinic, right: IndexClinic, sort: LocationSort): number {
  if (sort === 'name') return compareName(left, right, 1);
  if (sort === 'name-desc') return compareName(left, right, -1);
  if (sort === 'rating') return compareRating(left, right, 'desc');
  if (sort === 'rating-asc') return compareRating(left, right, 'asc');

  const featuredDelta = Number(right.isFeatured) - Number(left.isFeatured);
  if (featuredDelta !== 0) return featuredDelta;
  const modifiedDelta = right.modifiedAt.localeCompare(left.modifiedAt);
  if (modifiedDelta !== 0) return modifiedDelta;
  return left.name.localeCompare(right.name, 'en', { sensitivity: 'base' });
}

export function paginateClinics<T>(clinics: T[], page: number, limit: number): {
  page: number;
  clinics: T[];
  total: number;
  totalPages: number;
} {
  const total = clinics.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const currentPage = Math.min(Math.max(page, 1), totalPages);
  const start = (currentPage - 1) * limit;

  return {
    page: currentPage,
    clinics: clinics.slice(start, start + limit),
    total,
    totalPages: total === 0 ? 0 : totalPages,
  };
}

export function listingResultRange(page: number, limit: number, total: number): {
  from: number;
  to: number;
} {
  if (total <= 0) return { from: 0, to: 0 };
  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);
  return { from, to };
}

export function buildLocationFacets(
  clinics: IndexClinic[],
  serviceNames: Map<string, string>,
): LocationFacets {
  const ratings: Record<LocationRating, number> = { '4.5': 0, '4': 0, '3.5': 0, '3': 0 };
  const serviceCounts = new Map<string, number>();
  let sunday = 0;
  let whatsapp = 0;
  let weekends = 0;
  let ratingSum = 0;
  let ratingCount = 0;

  for (const clinic of clinics) {
    if (clinic.hasSundayHours) sunday += 1;
    if (clinicOpenOnWeekends(clinic)) weekends += 1;
    if (clinic.hasWhatsapp) whatsapp += 1;
    if (clinic.rating != null && clinic.rating > 0) {
      ratingSum += clinic.rating;
      ratingCount += 1;
      for (const option of LOCATION_RATING_OPTIONS) {
        if (clinic.rating >= option.score) ratings[option.value] += 1;
      }
    }
    for (const slug of new Set(clinic.serviceSlugs)) {
      serviceCounts.set(slug, (serviceCounts.get(slug) ?? 0) + 1);
    }
  }

  const services = [...serviceCounts.entries()]
    .map(([slug, count]) => ({
      slug,
      name: serviceNames.get(slug) ?? slug,
      count,
    }))
    .sort((left, right) => right.count - left.count || left.name.localeCompare(right.name));

  return {
    total: clinics.length,
    sunday,
    whatsapp,
    weekends,
    ratings,
    averageRating: ratingCount > 0 ? Math.round((ratingSum / ratingCount) * 10) / 10 : null,
    services,
  };
}

export function toListingClinic(clinic: IndexClinic): ListingClinic {
  return {
    slug: clinic.slug,
    name: clinic.name,
    address: clinic.address,
    neighborhood: clinic.neighborhood,
    city: clinic.city,
    phone: clinic.phone,
    postalCode: clinic.postalCode,
    state: clinic.state,
    area: clinic.area,
    image: clinic.image,
    rating: clinic.rating,
    isFeatured: clinic.isFeatured,
    hours: clinic.hours,
    specialHours: clinic.specialHours,
    openOnPublicHolidays: clinic.openOnPublicHolidays,
  };
}

type PageClinic = {
  slug?: string | null;
  name?: string | null;
  address?: string | null;
  neighborhood?: string | null;
  city?: string | null;
  phone?: string | null;
  postal_code?: string | null;
  rating?: number | null;
  is_featured?: boolean | null;
  open_on_public_holidays?: boolean | null;
  hours?: ListingClinic['hours'] | null;
  special_hours?: ListingClinic['specialHours'] | null;
  images?: ListingClinic['image'][] | null;
  area?: { name?: string | null } | null;
  state?: { name?: string | null } | null;
};

export function listingClinicFromPage(
  clinic: PageClinic,
  fallback: { state: string; area?: string },
): ListingClinic {
  return {
    slug: clinic.slug ?? '',
    name: clinic.name ?? '',
    address: clinic.address ?? '',
    neighborhood: clinic.neighborhood ?? '',
    city: clinic.city ?? '',
    phone: clinic.phone ?? '',
    postalCode: clinic.postal_code ?? '',
    state: clinic.state?.name || fallback.state,
    area: clinic.area?.name || fallback.area || '',
    image: clinic.images?.[0] ?? null,
    rating: clinic.rating ?? null,
    isFeatured: clinic.is_featured ?? false,
    hours: clinic.hours ?? [],
    specialHours: clinic.special_hours ?? [],
    openOnPublicHolidays: clinic.open_on_public_holidays ?? false,
  };
}
