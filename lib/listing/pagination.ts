/** Two weeks. Page `export const revalidate` must be this numeric literal, not this import. */
export const LISTING_REVALIDATE_SECONDS = 1_209_600;
export const MAX_INDEXED_LISTING_PAGE = 3;

export function parsePageParam(page: string | string[] | undefined): number {
  const raw = Array.isArray(page) ? page[0] : page;
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed < 1) {
    return 1;
  }
  return Math.floor(parsed);
}

/** Pathname without a trailing `/page/N` segment. */
export function listingBasePath(pathname: string): string {
  const base = pathname.replace(/\/page\/\d+$/, '');
  return base.length > 0 ? base : '/';
}

export function listingPageHref(pathname: string, page: number): string {
  const base = listingBasePath(pathname);
  if (page <= 1) {
    return base;
  }
  return `${base}/page/${page}`;
}

export function listingCanonicalPath(basePath: string, page: number): string {
  if (page <= 1) {
    return basePath;
  }
  return `${basePath}/page/${page}`;
}
