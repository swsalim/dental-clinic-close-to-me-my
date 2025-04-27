import { NextRequest, NextResponse } from 'next/server';

import { Database } from '@/types/database.types';
import { createServerClient } from '@supabase/ssr';

import { CookieOptions, MiddlewareClientResult, SupabaseCredentialsError } from './types';

/**
 * Creates a Supabase client for middleware environments
 * @param request - The Next.js request object
 * @returns An object containing the Supabase client and the response
 * @throws {SupabaseCredentialsError} If Supabase credentials are missing
 */
export const createClient = (request: NextRequest): MiddlewareClientResult => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new SupabaseCredentialsError('middleware');
  }

  // Create an unmodified response
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        // If the cookie is updated, update the cookies for the request and response
        request.cookies.set({
          name,
          value,
          ...options,
        });
        response = NextResponse.next({
          request: {
            headers: request.headers,
          },
        });
        response.cookies.set({
          name,
          value,
          ...options,
        });
      },
      remove(name: string, options: Pick<CookieOptions, 'path' | 'domain'>) {
        // If the cookie is removed, update the cookies for the request and response
        request.cookies.set({
          name,
          value: '',
          ...options,
        });
        response = NextResponse.next({
          request: {
            headers: request.headers,
          },
        });
        response.cookies.set({
          name,
          value: '',
          ...options,
        });
      },
    },
  });

  return { supabase, response };
};
