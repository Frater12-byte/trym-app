import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

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
          supabaseResponse = NextResponse.next({ request });
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

  const isProtectedRoute =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/onboarding") ||
    pathname.startsWith("/plan") ||
    pathname.startsWith("/groceries") ||
    pathname.startsWith("/shopping") || // legacy redirect handled below
    pathname.startsWith("/recipes") ||
    pathname.startsWith("/weight") ||
    pathname.startsWith("/activity") ||
    pathname.startsWith("/settings") ||
    pathname.startsWith("/api/receipts") ||
    pathname.startsWith("/api/weight") ||
    pathname.startsWith("/api/profile") ||
    pathname.startsWith("/api/plan") ||
    pathname.startsWith("/api/groceries") ||
    pathname.startsWith("/api/activity");

  // Redirect old /shopping → /groceries
  if (pathname.startsWith("/shopping")) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.replace("/shopping", "/groceries");
    return NextResponse.redirect(url);
  }

  if (!user && isProtectedRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (user && isAuthRoute && !pathname.startsWith("/auth")) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  if (isProtectedRoute) {
    supabaseResponse.headers.set(
      "Cache-Control",
      "no-store, max-age=0, must-revalidate"
    );
    supabaseResponse.headers.set("Pragma", "no-cache");
  }

  return supabaseResponse;
}
