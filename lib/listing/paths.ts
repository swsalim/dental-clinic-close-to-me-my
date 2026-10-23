/** Public listing URLs — keep in sync with `app/(listing)/[state]` routes. */

export function stateListingPath(stateSlug: string): string {
  return `/${stateSlug}`;
}

export function areaListingPath(stateSlug: string, areaSlug: string): string {
  return `/${stateSlug}/${areaSlug}`;
}

export function serviceListingPath(serviceSlug: string): string {
  return `/services/${serviceSlug}`;
}
