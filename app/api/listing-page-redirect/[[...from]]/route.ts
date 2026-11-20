import { NextRequest, NextResponse } from 'next/server';

import { listingPageRedirectPath } from '@/lib/listing/page-query-redirect';

export const dynamic = 'force-dynamic';

/**
 * Legacy `?page=` URLs are rewritten here only when that query is present.
 * Next 15 keeps the original query on a next.config redirect, which loops
 * (`/path/page/2?page=2`). This response drops the query and returns 301.
 */
function redirectLegacyPage(request: NextRequest, from: string[] | undefined) {
  const target = listingPageRedirectPath(
    (from ?? []).join('/'),
    request.nextUrl.searchParams.get('page'),
  );
  if (!target) {
    return NextResponse.json({ error: 'Invalid path' }, { status: 400 });
  }

  const url = request.nextUrl.clone();
  url.pathname = target;
  url.search = '';
  return NextResponse.redirect(url, 301);
}

type RouteContext = { params: Promise<{ from?: string[] }> };

export async function GET(request: NextRequest, context: RouteContext) {
  const { from } = await context.params;
  return redirectLegacyPage(request, from);
}

export async function HEAD(request: NextRequest, context: RouteContext) {
  const { from } = await context.params;
  return redirectLegacyPage(request, from);
}
