"use client";

import { Registration } from "@/types/registration";
import { useMemo, useState } from "react";

interface UpiCheckerModalProps {
  isOpen: boolean;
  onClose: () => void;
  registrations: Registration[];
  onVerifyAndDispatch: (item: Registration) => Promise<void>;
  onReject: (item: Registration) => Promise<void>;
  autoDispatchEnabled: boolean;
}

export default function UpiCheckerModal({
  isOpen,
  onClose,
  registrations,
  onVerifyAndDispatch,
  onReject,
  autoDispatchEnabled,
}: UpiCheckerModalProps) {
  const [filter, setFilter] = useState<"pending" | "all" | "flagged" | "verified">("pending");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Compute duplicate counts across all registrations
  const duplicateCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    registrations.forEach((r) => {
      const txn = r.transaction_id?.trim().toLowerCase();
      if (txn) {
        counts[txn] = (counts[txn] || 0) + 1;
      }
    });
    return counts;
  }, [registrations]);

  // Analyze UTR validity
  const analyzeUtr = (txn: string | null | undefined) => {
    if (!txn || !txn.trim()) {
      return { status: "missing", label: "No UTR Provided", color: "text-gray-400 bg-gray-100" };
    }
    const clean = txn.trim();
    const count = duplicateCounts[clean.toLowerCase()] || 0;

    if (count > 1) {
      return {
        status: "duplicate",
        label: `🚨 DUPLICATE (${count}x)`,
        desc: "Submitted multiple times! Check bank statement carefully.",
        badgeClass: "bg-red-100 text-red-700 border-red-300 font-bold animate-pulse",
      };
    }

    // Standard 12-digit Indian Bank UTR format
    if (/^\d{12}$/.test(clean)) {
      return {
        status: "valid_standard",
        label: "✓ Valid 12-Digit UTR",
        desc: "Matches standard Indian banking UTR reference pattern.",
        badgeClass: "bg-emerald-100 text-emerald-800 border-emerald-300 font-medium",
      };
    }

    // Alphanumeric transaction hash (e.g. UPI ref or gateway ID)
    if (clean.length >= 8 && /^[a-zA-Z0-9_-]+$/.test(clean)) {
      return {
        status: "valid_alphanumeric",
        label: "✓ Valid Ref Format",
        desc: "Standard alphanumeric transaction reference format.",
        badgeClass: "bg-blue-50 text-blue-700 border-blue-200 font-medium",
      };
    }

    return {
      status: "suspicious",
      label: "⚠️ Suspicious / Short UTR",
      desc: "Too short or invalid characters. Likely incomplete entry.",
      badgeClass: "bg-amber-100 text-amber-800 border-amber-300 font-bold",
    };
  };

  // Filter registrations that have transaction info or paid intent
  const upiList = useMemo(() => {
    return registrations.filter((r) => {
      // Must have transaction_id or be paid status
      const hasPayment = Boolean(r.transaction_id || r.payment_status !== "free" || (r.price_paid && r.price_paid !== "Free"));
      if (!hasPayment) return false;

      const analysis = analyzeUtr(r.transaction_id);

      if (filter === "pending" && (r.is_verified || r.payment_status === "verified" || r.payment_status === "rejected")) {
        return false;
      }
      if (filter === "flagged" && analysis.status !== "duplicate" && analysis.status !== "suspicious") {
        return false;
      }
      if (filter === "verified" && !r.is_verified && r.payment_status !== "verified") {
        return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = r.full_name?.toLowerCase().includes(q);
        const matchUtr = r.transaction_id?.toLowerCase().includes(q);
        const matchRef = r.reference_id?.toLowerCase().includes(q);
        const matchItem = r.target_item_title?.toLowerCase().includes(q);
        if (!matchName && !matchUtr && !matchRef && !matchItem) return false;
      }

      return true;
    });
  }, [registrations, filter, searchQuery, duplicateCounts]);

  const pendingCount = useMemo(() => {
    return registrations.filter((r) => Boolean(r.transaction_id || r.payment_status === "pending_verification") && !r.is_verified && r.payment_status !== "rejected").length;
  }, [registrations]);

  const flaggedCount = useMemo(() => {
    return registrations.filter((r) => {
      if (!r.transaction_id) return false;
      const count = duplicateCounts[r.transaction_id.trim().toLowerCase()] || 0;
      return count > 1 || r.transaction_id.trim().length < 6;
    }).length;
  }, [registrations, duplicateCounts]);

  if (!isOpen) return null;

  const handleCopyUtr = (utr: string) => {
    navigator.clipboard.writeText(utr);
    setCopiedId(utr);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleAction = async (item: Registration, action: "verify" | "reject") => {
    setProcessingId(item.id);
    try {
      if (action === "verify") {
        await onVerifyAndDispatch(item);
      } else {
        await onReject(item);
      }
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 sm:p-6 overflow-y-auto">
      <div className="relative w-full max-w-5xl max-h-[90vh] flex flex-col rounded-2xl bg-white shadow-2xl border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50/80 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white font-bold shadow-sm">
              ₹
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-gray-900">
                  UPI & UTR Payment Verification Desk
                </h3>
                {pendingCount > 0 && (
                  <span className="rounded-full bg-amber-100 text-amber-800 text-[11px] font-bold px-2.5 py-0.5 border border-amber-300">
                    {pendingCount} Pending
                  </span>
                )}
                {flaggedCount > 0 && (
                  <span className="rounded-full bg-red-100 text-red-800 text-[11px] font-bold px-2.5 py-0.5 border border-red-300">
                    {flaggedCount} Flagged
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Validate Indian banking reference numbers, detect duplicate UTRs, and auto-dispatch holographic passes.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-200 hover:text-gray-700 transition cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Toolbar & Filter Tabs */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-gray-100 bg-white px-6 py-3">
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
            <button
              onClick={() => setFilter("pending")}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition cursor-pointer ${
                filter === "pending"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Pending Verification ({pendingCount})
            </button>
            <button
              onClick={() => setFilter("flagged")}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition cursor-pointer ${
                filter === "flagged"
                  ? "bg-red-600 text-white shadow-xs"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Flagged / Duplicates ({flaggedCount})
            </button>
            <button
              onClick={() => setFilter("verified")}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition cursor-pointer ${
                filter === "verified"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Verified
            </button>
            <button
              onClick={() => setFilter("all")}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition cursor-pointer ${
                filter === "all"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              All Records
            </button>
          </div>

          <div className="w-full sm:w-64">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Name, UTR, or Ref ID..."
              className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-xs text-gray-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Content Table / List */}
        <div className="flex-1 overflow-y-auto p-6">
          {upiList.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-400 text-xl font-bold mb-3">
                ✓
              </div>
              <h4 className="text-sm font-bold text-gray-800">No matching payments in this view</h4>
              <p className="text-xs text-gray-500 mt-1">
                {filter === "pending"
                  ? "All received UPI transactions have been verified!"
                  : "No records found matching the active filter."}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {upiList.map((item) => {
                const analysis = analyzeUtr(item.transaction_id);
                const isProcessing = processingId === item.id;

                return (
                  <div
                    key={item.id}
                    className={`rounded-xl border p-4 transition-all ${
                      analysis.status === "duplicate"
                        ? "border-red-300 bg-red-50/40"
                        : item.is_verified
                        ? "border-gray-200 bg-gray-50/50"
                        : "border-gray-200 bg-white hover:border-emerald-300 hover:shadow-sm"
                    }`}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      {/* Left: Participant & Program */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                            {item.reference_id}
                          </span>
                          <span className="font-bold text-sm text-gray-900 truncate">
                            {item.full_name}
                          </span>
                          <span className="text-xs text-gray-500 truncate">
                            ({item.organization || "Individual"})
                          </span>
                        </div>

                        <div className="mt-1 text-xs text-gray-600 truncate">
                          <strong>Program:</strong> {item.target_item_title || "Training / Conference"}
                        </div>

                        <div className="mt-1 flex items-center gap-3 text-xs text-gray-500">
                          <span>📧 {item.email}</span>
                          <span>📞 {item.phone}</span>
                          <span>💰 Fee: <strong>{item.price_paid || "Standard"}</strong></span>
                        </div>
                      </div>

                      {/* Middle: UTR & Format Validation */}
                      <div className="lg:w-80 shrink-0 bg-white/90 rounded-lg p-3 border border-gray-200/80 shadow-xs">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-gray-500 font-semibold uppercase tracking-wider">
                            Transaction / UTR
                          </span>
                          <span
                            className={`rounded px-2 py-0.5 text-[10px] border ${analysis.badgeClass}`}
                          >
                            {analysis.label}
                          </span>
                        </div>

                        <div className="mt-1.5 flex items-center justify-between gap-2">
                          <span className="font-mono text-sm font-bold text-gray-900 select-all tracking-wide">
                            {item.transaction_id || "N/A"}
                          </span>
                          {item.transaction_id && (
                            <button
                              type="button"
                              onClick={() => handleCopyUtr(item.transaction_id!)}
                              className="shrink-0 rounded bg-gray-100 px-2 py-1 text-[10px] font-semibold text-gray-700 hover:bg-gray-200 transition cursor-pointer"
                              title="Copy UTR to verify in banking app"
                            >
                              {copiedId === item.transaction_id ? "✓ Copied!" : "📋 Copy UTR"}
                            </button>
                          )}
                        </div>

                        <p className="mt-1 text-[10px] text-gray-500 leading-tight">
                          {analysis.desc}
                        </p>
                      </div>

                      {/* Right: Actions */}
                      <div className="flex items-center gap-2 shrink-0">
                        {item.is_verified || item.payment_status === "verified" ? (
                          <span className="rounded-lg bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-2 border border-emerald-200 flex items-center gap-1.5">
                            ✓ Verified & Enrolled
                          </span>
                        ) : (
                          <>
                            <button
                              type="button"
                              disabled={isProcessing}
                              onClick={() => handleAction(item, "verify")}
                              className="rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 disabled:opacity-50 transition cursor-pointer flex items-center gap-1.5"
                            >
                              {isProcessing ? "Processing..." : autoDispatchEnabled ? "✓ Verify & Auto-Send Pass" : "✓ Verify Payment"}
                            </button>
                            <button
                              type="button"
                              disabled={isProcessing}
                              onClick={() => handleAction(item, "reject")}
                              className="rounded-lg border border-red-200 bg-red-50 px-2.5 py-2 text-xs font-semibold text-red-600 hover:bg-red-100 disabled:opacity-50 transition cursor-pointer"
                            >
                              ✕ Reject
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-gray-200 bg-gray-50 px-6 py-3 text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
            <span>
              {autoDispatchEnabled
                ? "Auto-Dispatch Active: Clicking 'Verify' automatically delivers the holographic digital pass to the participant's email."
                : "Manual Dispatch Active"}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-gray-200 px-4 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-300 transition cursor-pointer"
          >
            Close Desk
          </button>
        </div>
      </div>
    </div>
  );
}
