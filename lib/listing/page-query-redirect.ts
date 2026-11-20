/** Page numbers that already use /page/N. Page 1 and anything else drop the query. */
const LEGACY_PAGE = /^(?:[2-9]|[1-9]\d+)$/;

/**
 * Target path for a legacy `?page=` URL.
 * `from` is the pathname without a leading slash. Returns null when `from` is not a site path.
 */
export function listingPageRedirectPath(from: string, page: string | null): string | null {
  if (from.includes('..') || from.includes('\\') || from.includes('://') || from.startsWith('//')) {
    return null;
  }
  if (!/^[a-z0-9/_-]*$/i.test(from)) {
    return null;
  }

  const base = from
    .replace(/^\/+|\/+$/g, '')
    .replace(/(^|\/)page\/\d+$/, '')
    .replace(/^\/+|\/+$/g, '');
  const root = base ? `/${base}` : '/';

  if (page && LEGACY_PAGE.test(page)) {
    return root === '/' ? `/page/${page}` : `${root}/page/${page}`;
  }
  return root;
}
