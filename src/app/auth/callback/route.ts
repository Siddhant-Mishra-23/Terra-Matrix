import { isAuthorizedAdmin } from "@/lib/admin-auth";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin: urlOrigin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/admin";

  // Safeguard: Determine canonical origin (never bounce users to localhost in production)
  const forwardedHost = request.headers.get("x-forwarded-host");
  const forwardedProto = request.headers.get("x-forwarded-proto") || "https";
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.terramatrix.in";

  let origin = urlOrigin;
  if (forwardedHost && !forwardedHost.includes("localhost")) {
    origin = `${forwardedProto}://${forwardedHost}`;
  } else if (origin.includes("localhost") && process.env.NODE_ENV === "production") {
    origin = siteUrl;
  }

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Security Guard: Check if authenticated user is on the admin whitelist
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const isRoleAdmin = user?.app_metadata?.role === "admin";
      if (!user || (!isAuthorizedAdmin(user.email) && !isRoleAdmin)) {
        await supabase.auth.signOut();
        return NextResponse.redirect(
          `${origin}/admin/login?error=Access+denied.+This+email+is+not+authorized+for+administrator+access.`
        );
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
    console.error("Auth exchange error:", error);
  }

  // If there's an error or no code, redirect back to login with error param
  return NextResponse.redirect(`${origin}/admin/login?error=Invalid+or+expired+magic+link`);
}
