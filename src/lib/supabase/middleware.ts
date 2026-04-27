import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Middleware-only Supabase client.
 * Refreshes the session cookie on every request so that
 * Server Components always see a valid auth state.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  const isAuthRoute =
    pathname.startsWith("/login") ||
    pathname.startsWith("/signup") ||
    pathname.startsWith("/forgot-password") ||
    pathname.startsWith("/auth");

  // ALL protected routes — anything that requires authentication
  const isProtectedRoute =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/onboarding") ||
    pathname.startsWith("/plan") ||
    pathname.startsWith("/shopping") ||
    pathname.startsWith("/weight") ||
    pathname.startsWith("/settings") ||
    pathname.startsWith("/api/receipts") ||
    pathname.startsWith("/api/weight");

  // Logged-out user trying protected route → /login with return URL
  if (!user && isProtectedRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  // Logged-in user visiting auth pages → /dashboard
  // (the /auth callback routes are excluded so OAuth/email confirm still work)
  if (user && isAuthRoute && !pathname.startsWith("/auth")) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  // Add no-cache headers on protected routes so browser back-button can't
  // restore an authenticated view after logout
  if (isProtectedRoute) {
    supabaseResponse.headers.set(
      "Cache-Control",
      "no-store, max-age=0, must-revalidate"
    );
    supabaseResponse.headers.set("Pragma", "no-cache");
  }

  return supabaseResponse;
}
