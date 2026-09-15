"use client";

import { isAuthorizedAdmin } from "@/lib/admin-auth";
import { createClient } from "@/lib/supabase/client";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

function LoginFormContent() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [authMode, setAuthMode] = useState<"password" | "magicLink" | "forgotPassword">("password");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect") || "/admin";
  const urlError = searchParams.get("error");

  useEffect(() => {
    if (urlError) {
      setError(decodeURIComponent(urlError));
    }
  }, [urlError]);

  // =========================================================================
  // AUTOMATIC BACKGROUND SYNC FOR MAGIC LINK
  // =========================================================================
  useEffect(() => {
    const supabase = createClient();

    // 1. Listen for real-time Auth State Change (e.g. when magic link is clicked)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        // Double-check email before redirect
        if (isAuthorizedAdmin(session.user?.email)) {
          router.push(redirectPath);
          router.refresh();
        }
      }
    });

    // 2. Poll session in background every 2.5 seconds when magicLinkSent is active
    let interval: NodeJS.Timeout | null = null;
    if (magicLinkSent) {
      interval = setInterval(async () => {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session && isAuthorizedAdmin(session.user?.email)) {
          router.push(redirectPath);
          router.refresh();
        }
      }, 2500);
    }

    return () => {
      subscription.unsubscribe();
      if (interval) clearInterval(interval);
    };
  }, [magicLinkSent, redirectPath, router]);

  // Manual Check & Verify Button Handler
  const handleCheckSessionManually = async () => {
    setCheckingStatus(true);
    setError(null);
    const supabase = createClient();
    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) throw sessionError;

      if (session) {
        if (!isAuthorizedAdmin(session.user?.email)) {
          await supabase.auth.signOut();
          setError("Access Denied: This account is not in the authorized administrator whitelist.");
          return;
        }

        setMessage("✓ Verification confirmed! Redirecting to Admin Dashboard...");
        router.push(redirectPath);
        router.refresh();
      } else {
        setError("Email verification not detected yet. Please click the link in your email first, then click Verify.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to check login status.");
    } finally {
      setCheckingStatus(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    // Strict Front-Door Security Guard:
    // Only emails authorized in the codebase are permitted
    if (!isAuthorizedAdmin(email)) {
      setError("Access Denied: This email address is not authorized for administrator access. Please contact the system administrator.");
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://terramatrix.in";
    const origin =
      typeof window !== "undefined" && window.location.origin
        ? window.location.origin
        : siteUrl;

    try {
      if (authMode === "password") {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) {
          throw signInError;
        }

        router.push(redirectPath);
        router.refresh();
      } else if (authMode === "magicLink") {
        const { error: otpError } = await supabase.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(redirectPath)}`,
          },
        });

        if (otpError) {
          throw otpError;
        }

        setMagicLinkSent(true);
        setMessage("✓ Magic link sent! Please check your Gmail inbox and click the login link.");
      } else if (authMode === "forgotPassword") {
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${origin}/auth/callback?next=/admin/reset-password`,
        });

        if (resetError) {
          throw resetError;
        }

        setMessage("✓ Password reset email sent! Open the verification link in your inbox to set your new password.");
      }
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.message || "Failed to authenticate. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendLink = async () => {
    setLoading(true);
    setError(null);

    if (!isAuthorizedAdmin(email)) {
      setError("Access Denied: This email address is not authorized.");
      setLoading(false);
      return;
    }

    const supabase = createClient();
    try {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://terramatrix.in";
      const origin =
        typeof window !== "undefined" && window.location.origin
          ? window.location.origin
          : siteUrl;
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(redirectPath)}`,
        },
      });
      if (otpError) throw otpError;
      setMessage("✓ A fresh magic link has been sent to your email!");
    } catch (err: any) {
      setError(err.message || "Failed to resend magic link");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-8 rounded-2xl bg-white p-8 shadow-two border border-gray-100">
      {/* Header */}
      <div className="text-center">
        <div className="mx-auto mb-4 flex justify-center">
          <Image
            src="/images/logo/logo.svg"
            alt="Terra Matrix Logo"
            width={140}
            height={32}
            priority
          />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-dark">
          Terra Matrix Admin Panel
        </h2>
        <p className="mt-2 text-xs text-body-color">
          Strict authorized access for Trainings, Projects, Conferences & Passes
        </p>
      </div>

      {/* Tab switch */}
      {authMode !== "forgotPassword" ? (
        <div className="flex rounded-lg bg-gray-100 p-1 text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setAuthMode("password");
              setMagicLinkSent(false);
              setError(null);
              setMessage(null);
            }}
            className={`flex-1 rounded-md py-2 transition cursor-pointer ${
              authMode === "password"
                ? "bg-white text-dark shadow-xs"
                : "text-gray-500 hover:text-dark"
            }`}
          >
            Password Login
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthMode("magicLink");
              setError(null);
              setMessage(null);
            }}
            className={`flex-1 rounded-md py-2 transition cursor-pointer ${
              authMode === "magicLink"
                ? "bg-white text-dark shadow-xs"
                : "text-gray-500 hover:text-dark"
            }`}
          >
            Magic Link (Email)
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between border-b border-gray-100 pb-2">
          <span className="text-xs font-bold text-dark uppercase tracking-wider">
            Reset Password Verification
          </span>
          <button
            type="button"
            onClick={() => {
              setAuthMode("password");
              setError(null);
              setMessage(null);
            }}
            className="text-xs text-primary font-semibold hover:underline cursor-pointer"
          >
            ← Back to Login
          </button>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleLogin} className="mt-6 space-y-4">
        <div>
          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
            Authorized Admin Email
          </label>
          <input
            type="email"
            required
            disabled={magicLinkSent}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@terramatrix.in"
            className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-dark focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:bg-gray-50"
          />
        </div>

        {authMode === "password" && (
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Password
              </label>
              <button
                type="button"
                onClick={() => {
                  setAuthMode("forgotPassword");
                  setError(null);
                  setMessage(null);
                }}
                className="text-xs text-primary font-medium hover:underline cursor-pointer"
              >
                Forgot Password?
              </button>
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-dark focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        )}

        {authMode === "forgotPassword" && (
          <p className="text-xs text-body-color leading-relaxed">
            Enter your authorized admin email. We will send a secure one-click verification link to your inbox that directs you to create your new password.
          </p>
        )}

        {/* Real-time Background Sync Status Indicator */}
        {authMode === "magicLink" && magicLinkSent && (
          <div className="rounded-2xl border-2 border-dashed border-green/40 bg-green/5 p-4 text-center space-y-3">
            <div className="flex items-center justify-center gap-2">
              <span className="flex h-3 w-3 rounded-full bg-green animate-ping" />
              <span className="text-xs font-bold text-dark uppercase tracking-wider">
                Syncing Authentication...
              </span>
            </div>
            <p className="text-xs text-body-color">
              Waiting for email verification. Open the link sent to <strong className="text-dark">{email}</strong>.
            </p>
            <p className="text-[11px] text-green font-semibold">
              ✨ As soon as you click the link, you will be logged in automatically!
            </p>
          </div>
        )}

        {error && (
          <div className="rounded-lg bg-red-50 p-3 text-xs text-red-700 border border-red-200">
            {error}
          </div>
        )}

        {message && (
          <div className="rounded-lg bg-green-50 p-3 text-xs text-green-700 border border-green-200">
            {message}
          </div>
        )}

        {/* Primary Action Button */}
        {authMode === "magicLink" && magicLinkSent ? (
          <div className="space-y-2.5">
            <button
              type="button"
              disabled={checkingStatus}
              onClick={handleCheckSessionManually}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-green py-3 text-sm font-semibold text-white shadow-xs transition hover:bg-primary disabled:opacity-50 cursor-pointer"
            >
              {checkingStatus ? (
                <>
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Checking Login...
                </>
              ) : (
                "✓ Verify & Enter Admin Dashboard"
              )}
            </button>

            <div className="flex items-center justify-between text-xs pt-1">
              <button
                type="button"
                onClick={() => {
                  setMagicLinkSent(false);
                  setError(null);
                  setMessage(null);
                }}
                className="text-gray-500 hover:text-dark underline cursor-pointer"
              >
                Change Email
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={handleResendLink}
                className="text-primary font-semibold hover:underline cursor-pointer"
              >
                Resend Link
              </button>
            </div>
          </div>
        ) : (
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-green py-3 text-sm font-semibold text-white shadow-xs transition hover:bg-primary disabled:opacity-50 cursor-pointer"
          >
            {loading
              ? "Verifying..."
              : authMode === "password"
              ? "Sign In to Admin"
              : authMode === "magicLink"
              ? "Send Secure Magic Link"
              : "Send Password Reset Link"}
          </button>
        )}
      </form>

      <div className="text-center pt-2">
        <a
          href="/"
          className="text-xs text-gray-500 hover:text-primary transition"
        >
          &larr; Return to public website
        </a>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <Suspense fallback={<div className="text-sm text-gray-500">Loading login form...</div>}>
        <LoginFormContent />
      </Suspense>
    </div>
  );
}
