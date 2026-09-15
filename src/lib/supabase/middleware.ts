import { isAuthorizedAdmin } from "@/lib/admin-auth";
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

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

  const pathname = request.nextUrl.pathname;

  // Protect /admin routes (except /admin/login and /admin/reset-password)
  if (
    pathname.startsWith("/admin") &&
    pathname !== "/admin/login" &&
    pathname !== "/admin/reset-password"
  ) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }

    // Role or multi-admin email allowlist check
    const isRoleAdmin = user.app_metadata?.role === "admin";
    const isAllowed = isAuthorizedAdmin(user.email) || isRoleAdmin;

    if (!isAllowed) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      url.searchParams.set("error", "Access denied. Your account is not authorized as an administrator.");
      return NextResponse.redirect(url);
    }
  }

  // If user is already logged in and tries to access /admin/login, redirect to /admin
  if (pathname === "/admin/login" && user) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
