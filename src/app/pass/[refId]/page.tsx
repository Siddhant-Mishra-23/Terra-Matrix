"use client";

import HolographicTicket from "@/components/Ticket/HolographicTicket";
import { createClient } from "@/lib/supabase/client";
import { Registration } from "@/types/registration";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function DigitalPassPage() {
  const params = useParams();
  const refId = params?.refId as string;

  const [registration, setRegistration] = useState<Registration | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchPass = async () => {
      if (!refId) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`/api/pass/${encodeURIComponent(refId)}`);
        const json = await res.json();

        if (res.ok && json.found && json.pass) {
          setRegistration(json.pass as Registration);
        } else {
          setNotFound(true);
        }
      } catch (err) {
        console.error("Error fetching digital pass:", err);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    fetchPass();
  }, [refId]);

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#070C1E] p-6 text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-3 border-emerald-400 border-t-transparent" />
          <p className="text-xs tracking-widest text-emerald-400 font-mono">
            AUTHENTICATING DIGITAL PASS...
          </p>
        </div>
      </div>
    );
  }

  // 404 / Invalid Pass Card
  if (notFound || !registration) {
    return (
      <div className="min-h-screen bg-[#070C1E] text-white flex flex-col justify-between py-12 px-4 relative overflow-hidden">
        <div className="absolute top-0 left-1/4 h-96 w-96 rounded-full bg-red-500/10 blur-[120px] pointer-events-none" />

        <div className="max-w-md mx-auto w-full flex items-center justify-between z-10 pb-6">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="text-lg font-black tracking-widest text-white group-hover:text-emerald-400 transition">
              TERRA<span className="text-emerald-400">MATRIX</span>
            </span>
          </Link>
        </div>

        <div className="max-w-md mx-auto w-full z-10 my-auto rounded-3xl border border-red-500/30 bg-[#0B132B]/90 p-8 text-center backdrop-blur-xl shadow-2xl shadow-red-500/10">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/15 border border-red-500/30 text-red-400 text-2xl font-bold mb-4">
            ✕
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Digital Pass Not Found</h2>
          <p className="text-xs text-gray-400 mb-6 leading-relaxed">
            The reference ID <code className="text-red-300 font-mono bg-red-950/50 px-2 py-0.5 rounded">{refId || "UNKNOWN"}</code> does not match any verified registration record in our database.
          </p>
          <div className="space-y-3">
            <Link
              href="/trainings"
              className="block w-full rounded-xl bg-emerald-500 py-3 text-xs font-bold text-white hover:bg-emerald-600 transition shadow-lg shadow-emerald-500/20"
            >
              Browse Active Trainings
            </Link>
            <Link
              href="/contact"
              className="block w-full rounded-xl border border-white/10 bg-white/5 py-2.5 text-xs font-semibold text-gray-300 hover:bg-white/10 transition"
            >
              Contact Support Desk
            </Link>
          </div>
        </div>

        <div className="max-w-md mx-auto w-full text-center z-10 pt-6">
          <p className="text-[11px] text-gray-600">
            Terra-Matrix Security Verification Gateway
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070C1E] text-white flex flex-col justify-between py-8 sm:py-12 px-4 sm:px-6 relative overflow-hidden">
      {/* Background Cyberpunk Ambient Glows */}
      <div className="absolute top-0 left-1/4 h-96 w-96 rounded-full bg-emerald-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-cyan-500/10 blur-[120px] pointer-events-none" />

      {/* Top Floating Bar */}
      <div className="max-w-2xl mx-auto w-full flex items-center justify-between z-10 pb-6">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="text-lg font-black tracking-widest text-white group-hover:text-emerald-400 transition">
            TERRA<span className="text-emerald-400">MATRIX</span>
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyLink}
            className="rounded-xl border border-white/20 bg-white/10 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-white/20 transition flex items-center gap-1.5 cursor-pointer backdrop-blur-md"
          >
            {copied ? "✓ Copied Pass URL!" : "🔗 Share Pass"}
          </button>
        </div>
      </div>

      {/* Cyberpunk Holographic Ticket Card */}
      <div className="max-w-2xl mx-auto w-full z-10 my-auto">
        <HolographicTicket pass={registration} showActions={true} />
      </div>

      {/* Footer Security Stamp */}
      <div className="max-w-2xl mx-auto w-full text-center z-10 pt-6">
        <p className="text-[11px] text-gray-500">
          Official Digital Ticket Cryptographically Verified • Present upon joining live session room
        </p>
      </div>
    </div>
  );
}
