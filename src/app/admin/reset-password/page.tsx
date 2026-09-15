"use client";

import { isAuthorizedAdmin } from "@/lib/admin-auth";
import { createClient } from "@/lib/supabase/client";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AdminResetPasswordPage() {
  const router = useRouter();

  const [email, setEmail] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();

    const verifyUser = (user: { email?: string | null } | null) => {
      if (!user || !user.email) {
        setError("Your password reset link is invalid or has expired. Please request a new link.");
        setLoading(false);
        return;
      }

      if (!isAuthorizedAdmin(user.email)) {
        supabase.auth.signOut();
        setError("Access Denied: This account is not authorized for administrator access.");
        setLoading(false);
        return;
      }

      setEmail(user.email);
      setError(null);
      setLoading(false);
    };

    const checkAuthSession = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          verifyUser(user);
        } else {
          const {
            data: { session },
          } = await supabase.auth.getSession();
          if (session?.user) {
            verifyUser(session.user);
          } else {
            setError("Your password reset link is invalid or has expired. Please request a new link.");
            setLoading(false);
          }
        }
      } catch (err: any) {
        setError(err.message || "Failed to verify session.");
        setLoading(false);
      }
    };

    checkAuthSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") {
        if (session?.user) {
          verifyUser(session.user);
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match. Please re-enter.");
      return;
    }

    setUpdating(true);
    const supabase = createClient();

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        throw updateError;
      }

      setSuccess("✓ Password updated successfully! Redirecting to Admin Dashboard...");
      setTimeout(() => {
        router.push("/admin");
        router.refresh();
      }, 1500);
    } catch (err: any) {
      console.error("Password update error:", err);
      setError(err.message || "Failed to update password. Please try again.");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
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
            Set New Admin Password
          </h2>
          <p className="mt-2 text-xs text-body-color">
            Create a secure password for your administrator account.
          </p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-8 space-y-3">
            <div className="h-7 w-7 animate-spin rounded-full border-3 border-primary border-t-transparent" />
            <p className="text-xs text-body-color">Verifying reset authorization...</p>
          </div>
        ) : error && !email ? (
          <div className="space-y-4">
            <div className="rounded-lg bg-red-50 p-4 text-xs text-red-700 border border-red-200">
              {error}
            </div>
            <Link
              href="/admin/login"
              className="block w-full text-center rounded-lg bg-primary py-2.5 text-xs font-bold text-white transition hover:bg-primary/90"
            >
              ← Back to Admin Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleUpdatePassword} className="space-y-4">
            {email && (
              <div className="rounded-lg bg-gray-50 p-3 border border-gray-200 text-xs">
                <span className="text-gray-500">Verified Administrator:</span>
                <p className="font-bold text-dark text-sm mt-0.5">{email}</p>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                New Password (min. 8 characters)
              </label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-dark focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-dark focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 p-3 text-xs text-red-700 border border-red-200">
                {error}
              </div>
            )}

            {success && (
              <div className="rounded-lg bg-green-50 p-3 text-xs text-green-700 border border-green-200 font-semibold">
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={updating}
              className="w-full rounded-lg bg-green py-3 text-sm font-semibold text-white shadow-xs transition hover:bg-primary disabled:opacity-50 cursor-pointer"
            >
              {updating ? "Updating Password..." : "Save New Password & Enter"}
            </button>
          </form>
        )}

        <div className="text-center pt-2">
          <Link
            href="/admin/login"
            className="text-xs text-gray-500 hover:text-primary transition"
          >
            &larr; Return to login
          </Link>
        </div>
      </div>
    </div>
  );
}
