import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: req.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          req.cookies.set({
            name,
            value,
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: req.headers,
            },
          });
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: CookieOptions) {
          req.cookies.set({
            name,
            value: '',
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: req.headers,
            },
          });
          response.cookies.set({
            name,
            value: '',
            ...options,
          });
        },
      },
    }
  );

  // IMPORTANT: Use getUser() instead of getSession() for proper token refresh
  // getUser() validates the JWT with Supabase Auth server and refreshes if needed
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  // Protect /admin routes
  if (req.nextUrl.pathname.startsWith('/admin')) {
    if (!user || userError) {
      // Redirect to login if not authenticated
      const redirectUrl = req.nextUrl.clone();
      redirectUrl.pathname = '/auth/login';
      redirectUrl.searchParams.set('redirect', req.nextUrl.pathname);
      return NextResponse.redirect(redirectUrl);
    }

    // Check if user is admin
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (roleData?.role !== 'admin') {
      // Redirect to home if not admin
      const redirectUrl = req.nextUrl.clone();
      redirectUrl.pathname = '/';
      return NextResponse.redirect(redirectUrl);
    }
  }

  // Protect /profile route
  if (req.nextUrl.pathname.startsWith('/profile')) {
    if (!user || userError) {
      const redirectUrl = req.nextUrl.clone();
      redirectUrl.pathname = '/auth/login';
      redirectUrl.searchParams.set('redirect', req.nextUrl.pathname);
      return NextResponse.redirect(redirectUrl);
    }
  }

  // Redirect authenticated users away from auth pages
  if (req.nextUrl.pathname.startsWith('/auth') && user && !userError) {
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = '/';
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}

export const config = {
  matcher: ['/admin/:path*', '/profile/:path*', '/auth/:path*'],
};
