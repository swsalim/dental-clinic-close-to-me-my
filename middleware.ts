import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { categoryList as categories } from '@/config/routes';

import { createMiddlewareClient } from '@/lib/supabase';

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

export async function middleware(req: NextRequest): Promise<NextResponse> {
  const { supabase, response } = createMiddlewareClient(req);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && req.nextUrl.pathname.startsWith('/dashboard')) {
    // Auth condition not met, redirect to login page
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = '/login';
    redirectUrl.searchParams.set('redirectedFrom', req.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  for (const [key, value] of Object.entries(categories)) {
    // if category is active, rewrite the URL pathname
    if (value.is_active) {
      if (req.nextUrl.pathname === `/${key}`) {
        const url = req.nextUrl.clone();
        url.pathname = `/category/${key}`;

        return NextResponse.rewrite(url);
      }
    }
  }

  return response;
}
