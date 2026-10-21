import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { createMiddlewareClient } from '@/lib/supabase';

export const config = {
  matcher: ['/dashboard', '/dashboard/:path*', '/:path*.md'],
};

export async function middleware(req: NextRequest): Promise<NextResponse> {
  const { pathname } = req.nextUrl;

  // Static Open Knowledge Format files live in public/.well-known/okf/.
  // Other .md URLs are rewritten to the dynamic Markdown API.
  if (pathname === '/.well-known/okf' || pathname.startsWith('/.well-known/okf/')) {
    return NextResponse.next();
  }

  if (pathname.endsWith('.md')) {
    const url = req.nextUrl.clone();
    const withoutExtension = pathname.slice(0, -3);
    url.pathname =
      withoutExtension === '' || withoutExtension === '/'
        ? '/api/markdown'
        : `/api/markdown${withoutExtension}`;
    return NextResponse.rewrite(url);
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
