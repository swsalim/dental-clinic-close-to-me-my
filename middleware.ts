import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { parsePageParam } from '@/lib/listing/pagination';
import { createMiddlewareClient } from '@/lib/supabase';

export const config = {
  matcher: [
    // Auth for dashboard only
    '/dashboard',
    '/dashboard/:path*',
    // Markdown LLM rewrites
    '/:path*.md',
    // Legacy ?page= and /page/1 redirects (listing URLs)
    '/((?!api|_next/static|_next/image|favicon.ico|dashboard|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

function isDashboardPath(pathname: string) {
  return pathname === '/dashboard' || pathname.startsWith('/dashboard/');
}

function listingQueryRedirect(req: NextRequest): NextResponse | null {
  const { pathname, searchParams } = req.nextUrl;
  if (pathname.endsWith('.md') || isDashboardPath(pathname)) {
    return null;
  }

  const pageParam = searchParams.get('page');
  if (pageParam === null) {
    return null;
  }

  const currentPage = parsePageParam(pageParam);
  const url = req.nextUrl.clone();
  url.searchParams.delete('page');

  if (currentPage <= 1) {
    return NextResponse.redirect(url, 308);
  }

  if (/\/page\/\d+$/.test(pathname)) {
    return null;
  }

  url.pathname = `${pathname.replace(/\/$/, '')}/page/${currentPage}`;
  return NextResponse.redirect(url, 308);
}

function trailingPageOneRedirect(req: NextRequest): NextResponse | null {
  const match = req.nextUrl.pathname.match(/^(.*)\/page\/1\/?$/);
  if (!match) {
    return null;
  }

  const url = req.nextUrl.clone();
  url.pathname = match[1] || '/';
  return NextResponse.redirect(url, 308);
}

export async function middleware(req: NextRequest): Promise<NextResponse> {
  const { pathname } = req.nextUrl;

  if (pathname.endsWith('.md')) {
    const url = req.nextUrl.clone();
    const withoutExtension = pathname.slice(0, -3);
    url.pathname =
      withoutExtension === '' || withoutExtension === '/'
        ? '/api/markdown'
        : `/api/markdown${withoutExtension}`;
    return NextResponse.rewrite(url);
  }

  const queryRedirect = listingQueryRedirect(req);
  if (queryRedirect) {
    return queryRedirect;
  }

  const pageOneRedirect = trailingPageOneRedirect(req);
  if (pageOneRedirect) {
    return pageOneRedirect;
  }

  // Category rewrites live in next.config.ts (avoid middleware on every hit).

  if (!isDashboardPath(pathname)) {
    // Fast path for public listing URLs that only needed redirect checks above
    return NextResponse.next();
  }

  const { supabase, response } = createMiddlewareClient(req);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = '/login';
    redirectUrl.searchParams.set('redirectedFrom', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}
