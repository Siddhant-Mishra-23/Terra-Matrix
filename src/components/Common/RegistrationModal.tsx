"use client";

import { createClient } from "@/lib/supabase/client";
import { RegistrationType } from "@/types/registration";
import Image from "next/image";
import { useState } from "react";

export interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultType?: RegistrationType;
  targetTitle?: string;
  targetDate?: string;
  targetCategory?: string;
  targetMode?: string;
  isPaid?: boolean;
  price?: string;
  upiId?: string;
  qrImage?: string;
}

export default function RegistrationModal({
  isOpen,
  onClose,
  defaultType = "public_training",
  targetTitle = "Advanced Geospatial & AI Training",
  targetDate,
  targetCategory = "Geospatial Intelligence",
  targetMode = "Online",
  isPaid = false,
  price = "Free",
  upiId = "terramatrix@upi",
  qrImage = "",
}: RegistrationModalProps) {
  // Common Fields
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [organization, setOrganization] = useState("");
  const [designation, setDesignation] = useState("");
  const [message, setMessage] = useState("");

  // Payment Specific
  const [transactionId, setTransactionId] = useState("");

  // Corporate Specific
  const [department, setDepartment] = useState("Civil & Geospatial Engineering");
  const [batchSize, setBatchSize] = useState("25-50 Attendees");
  const [preferredMode, setPreferredMode] = useState<"Online" | "In-Person" | "Hybrid">(
    (targetMode as any) || "Online"
  );
  const [targetTimeline, setTargetTimeline] = useState("");

  // Module Request Specific
  const [requestNature, setRequestNature] = useState("Individual Next Batch Alert");
  const [preferredTiming, setPreferredTiming] = useState("Weekend Batch");

  // Conference Specific
  const [conferenceRole, setConferenceRole] = useState("Attendee / Delegate");
  const [paperAbstract, setPaperAbstract] = useState("");
  const [publicationPref, setPublicationPref] = useState("Include ISBN / DOI Indexing");

  // State
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submittedRefId, setSubmittedRefId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [copiedPassUrl, setCopiedPassUrl] = useState(false);

  if (!isOpen) return null;

  const isCorporate = defaultType === "corporate_training";
  const isModuleRequest = defaultType === "module_request";
  const isConference = defaultType === "conference";
  const isPublicTraining = defaultType === "public_training";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg(null);

    if (isPaid) {
      const cleanTxn = transactionId.trim();
      if (!cleanTxn) {
        setErrorMsg("Please enter your Transaction No. / UTR / Reference ID to verify your payment.");
        setSubmitting(false);
        return;
      }
      if (cleanTxn.length < 6) {
        setErrorMsg("Invalid Transaction ID / UTR. Please enter a valid reference number (minimum 6 digits).");
        setSubmitting(false);
        return;
      }
    }

    // Generate unique reference ID
    const randomCode = Math.floor(1000 + Math.random() * 9000);
    const prefix = isCorporate
      ? "TM-CORP"
      : isModuleRequest
      ? "TM-MOD"
      : isConference
      ? "TM-CONF"
      : "TM-TR";
    const refId = `${prefix}-${new Date().getFullYear()}-${randomCode}`;

    let compiledNotes = message;
    if (isCorporate) {
      compiledNotes = `[Department: ${department}] [Timeline: ${targetTimeline}] ${message}`;
    } else if (isModuleRequest) {
      compiledNotes = `[Request Nature: ${requestNature}] [Preferred Timing: ${preferredTiming}] ${message}`;
    } else if (isConference) {
      compiledNotes = `[Role: ${conferenceRole}] [Publication: ${publicationPref}] [Abstract: ${paperAbstract}] ${message}`;
    }

    const payload = {
      reference_id: refId,
      type: defaultType,
      target_item_title: targetTitle,
      full_name: fullName,
      email: email,
      phone: phone,
      organization: organization || (isCorporate ? "Institution / Enterprise" : "Individual"),
      designation: isCorporate ? `Dept: ${department}` : designation || conferenceRole || "Participant",
      batch_size: isCorporate ? batchSize : isModuleRequest ? requestNature : "1 Participant",
      preferred_mode: preferredMode,
      preferred_date: targetTimeline || targetDate || "Upcoming Batch",
      message: compiledNotes,
      transaction_id: isPaid ? transactionId.trim() : null,
      is_verified: false,
      payment_status: isPaid ? "pending_verification" : "free",
      price_paid: isPaid ? price : "Free",
      status: "new",
      calendar_synced: false,
      google_sheet_synced: false,
      updated_at: new Date().toISOString(),
    };

    try {
      const supabase = createClient();
      const { error } = await supabase.from("registrations").insert([payload]);

      if (error) {
        console.error("Supabase insert error:", error);
        throw new Error(error.message || "Unable to save registration to database.");
      }

      setSubmittedRefId(refId);
    } catch (err: any) {
      console.error("Submission error:", err);
      setErrorMsg(err.message || "Failed to submit registration. Please verify your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyRef = () => {
    if (!submittedRefId) return;
    navigator.clipboard.writeText(submittedRefId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative my-8 w-full max-w-2xl overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 sm:p-8 shadow-2xl transition-all">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-dark transition"
        >
          &times;
        </button>

        {submittedRefId ? (
          /* =========================================================================
             THANKFUL CONFIRMATION & VERIFICATION NOTICE SCREEN
             ========================================================================= */
          <div className="text-center py-4 space-y-6 animate-in fade-in zoom-in duration-300">
            {/* Animated Celebration Icon */}
            <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green/10 text-green">
              <span className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-yellow text-white text-xs font-bold animate-bounce shadow">
                ★
              </span>
              <svg className="h-10 w-10 text-green animate-in zoom-in duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <div className="space-y-2">
              <span className="inline-block rounded-full bg-green/15 px-3.5 py-1 text-xs font-bold text-green">
                ✓ Registration Received Successfully
              </span>
              <h3 className="text-2xl font-extrabold text-dark sm:text-3xl">
                Thank You, {fullName}!
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-body-color max-w-lg mx-auto leading-relaxed">
                Your registration for <strong className="text-dark">{targetTitle}</strong> has been logged in our verification pipeline.
              </p>
            </div>

            {/* Verification Notice Banner */}
            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5 text-left space-y-3 shadow-xs">
              <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider border-b border-primary/10 pb-2">
                <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Team Verification & Digital Pass Dispatch</span>
              </div>

              <p className="text-xs text-dark font-medium leading-relaxed">
                ✉ <strong>Your Official Digital Pass, Session Access Link & Calendar Details</strong> will be emailed to <span className="text-primary font-bold">{email}</span> shortly once verified by our team.
              </p>

              <div className="grid grid-cols-2 gap-3 pt-1 text-xs border-t border-primary/10">
                <div>
                  <p className="text-body-color text-[10px] uppercase font-bold">Reference Tracking ID</p>
                  <p className="font-mono font-extrabold text-dark text-sm">{submittedRefId}</p>
                </div>
                <div>
                  <p className="text-body-color text-[10px] uppercase font-bold">Payment / Session Type</p>
                  <p className="font-semibold text-dark">
                    {isPaid ? `Paid (${price}) • Txn: ${transactionId || "Logged"}` : "Free Session"}
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-primary/10 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-dark flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    Official Digital Pass:
                  </span>
                  <a
                    href={`/pass/${submittedRefId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-emerald-600 hover:text-emerald-700 underline text-xs flex items-center gap-1"
                  >
                    <span>View Digital Pass ↗</span>
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopyRef}
                    className="flex-1 flex items-center justify-center gap-1 rounded-lg border border-primary/30 bg-white py-2 text-xs font-bold text-primary hover:bg-primary hover:text-white transition cursor-pointer shadow-xs"
                  >
                    {copied ? "✓ Copied ID!" : "📋 Copy ID"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const origin = typeof window !== "undefined" ? window.location.origin : "https://terramatrix.in";
                      navigator.clipboard.writeText(`${origin}/pass/${submittedRefId}`);
                      setCopiedPassUrl(true);
                      setTimeout(() => setCopiedPassUrl(false), 2000);
                    }}
                    className="flex-1 flex items-center justify-center gap-1 rounded-lg bg-emerald-600 py-2 text-xs font-bold text-white hover:bg-emerald-700 transition cursor-pointer shadow-xs"
                  >
                    {copiedPassUrl ? "✓ Copied Pass Link!" : "🎫 Copy Pass Link"}
                  </button>
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="rounded-xl bg-dark px-8 py-2.5 text-xs font-bold text-white hover:bg-primary transition cursor-pointer shadow"
            >
              Done & Close
            </button>
          </div>
        ) : (
          /* =========================================================================
             DEDICATED FORMS ACCORDING TO SPECIFIC SECTION TYPE
             ========================================================================= */
          <>
            {/* -------------------------------------------------------------
                FORM 1: CORPORATE & INSTITUTIONAL TRAINING PROPOSAL FORM
               ------------------------------------------------------------- */}
            {isCorporate && (
              <>
                <div className="border-b border-gray-100 pb-4 mb-6">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="rounded bg-yellow/15 px-2.5 py-0.5 text-[11px] font-bold text-yellow">
                      🏢 Institutional & Corporate
                    </span>
                    <span className="rounded bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-primary">
                      Custom Syllabus
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-dark sm:text-2xl">
                    Request Custom Institutional / Corporate Training
                  </h3>
                  <p className="mt-1 text-xs text-body-color leading-relaxed">
                    We design tailored capacity-building modules for engineering colleges, government departments, and infrastructure teams.
                  </p>
                </div>

                {errorMsg && <div className="mb-4 rounded-lg bg-red-50 p-3 text-xs text-red-600">{errorMsg}</div>}

                <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block font-semibold text-dark">College / University / Enterprise Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. NIT Rourkela / Infra Development Corp"
                        value={organization}
                        onChange={(e) => setOrganization(e.target.value)}
                        className="w-full rounded-lg border border-gray-300 p-2.5 text-dark focus:border-primary focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block font-semibold text-dark">Target Department / Domain *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Civil Engineering / Geospatial Cell"
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        className="w-full rounded-lg border border-gray-300 p-2.5 text-dark focus:border-primary focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block font-semibold text-dark">Contact Person Name & Designation *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Dr. Ramesh Kumar (HOD / Training Head)"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full rounded-lg border border-gray-300 p-2.5 text-dark focus:border-primary focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block font-semibold text-dark">Official Institutional Email *</label>
                      <input
                        type="email"
                        required
                        placeholder="hod.civil@institute.edu.in"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full rounded-lg border border-gray-300 p-2.5 text-dark focus:border-primary focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div>
                      <label className="mb-1 block font-semibold text-dark">Phone / WhatsApp *</label>
                      <input
                        type="tel"
                        required
                        placeholder="+91-XXXXXXXXXX"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full rounded-lg border border-gray-300 p-2.5 text-dark focus:border-primary focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block font-semibold text-dark">Expected Batch Size</label>
                      <select
                        value={batchSize}
                        onChange={(e) => setBatchSize(e.target.value)}
                        className="w-full rounded-lg border border-gray-300 p-2.5 text-dark bg-white focus:border-primary focus:outline-none"
                      >
                        <option value="15-30 Students">15-30 Students / Engineers</option>
                        <option value="30-60 Attendees">30-60 Attendees</option>
                        <option value="60-120 Attendees">60-120 Attendees</option>
                        <option value="120+ Full Faculty & Student Body">120+ Institutional Cohort</option>
                      </select>
                    </div>
                    <div>
                      <label className="mb-1 block font-semibold text-dark">Delivery Mode</label>
                      <select
                        value={preferredMode}
                        onChange={(e) => setPreferredMode(e.target.value as any)}
                        className="w-full rounded-lg border border-gray-300 p-2.5 text-dark bg-white focus:border-primary focus:outline-none"
                      >
                        <option value="In-Person">Campus On-Premises Workshop</option>
                        <option value="Online">Live Interactive Virtual</option>
                        <option value="Hybrid">Hybrid Model</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="mb-1 block font-semibold text-dark">
                      Syllabus Customization & Tools (QGIS, ArcGIS, Drone LiDAR, Civil 3D, AI Modeling, etc.)
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Specify topics you want covered, hands-on software requirements, or target semester dates..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 p-2.5 text-dark focus:border-primary focus:outline-none"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={onClose}
                      className="rounded-lg border border-gray-300 px-4 py-2 font-semibold text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="rounded-lg bg-green px-6 py-2.5 font-bold text-white hover:bg-primary shadow-sm transition disabled:opacity-50 cursor-pointer"
                    >
                      {submitting ? "Submitting..." : "Submit Institutional Proposal Request"}
                    </button>
                  </div>
                </form>
              </>
            )}

            {/* -------------------------------------------------------------
                FORM 2: UPCOMING TRAINING BATCH REGISTRATION FORM (FREE OR PAID)
               ------------------------------------------------------------- */}
            {isPublicTraining && (
              <>
                <div className="border-b border-gray-100 pb-4 mb-6">
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <span className="rounded bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-primary">
                      {targetCategory}
                    </span>
                    <span className="rounded bg-yellow/15 px-2.5 py-0.5 text-[11px] font-semibold text-yellow">
                      📅 {targetDate || "Upcoming Batch"}
                    </span>
                    <span className="rounded bg-gray-100 px-2.5 py-0.5 text-[11px] font-semibold text-gray-700">
                      {targetMode}
                    </span>
                    {isPaid && price && (
                      <span className="rounded bg-dark px-2.5 py-0.5 text-[11px] font-bold text-white shadow">
                        Fee: {price}
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-dark sm:text-2xl">
                    Register for {targetTitle}
                  </h3>
                  <p className="mt-1 text-xs text-body-color">
                    Reserve your seat for the upcoming practical training cohort.
                  </p>
                </div>

                {errorMsg && <div className="mb-4 rounded-lg bg-red-50 p-3 text-xs text-red-600">{errorMsg}</div>}

                <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block font-semibold text-dark">Participant Full Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Er. Ananya Mishra"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full rounded-lg border border-gray-300 p-2.5 text-dark focus:border-primary focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block font-semibold text-dark">Official / Student Email *</label>
                      <input
                        type="email"
                        required
                        placeholder="ananya@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full rounded-lg border border-gray-300 p-2.5 text-dark focus:border-primary focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div>
                      <label className="mb-1 block font-semibold text-dark">Phone / WhatsApp *</label>
                      <input
                        type="tel"
                        required
                        placeholder="+91-XXXXXXXXXX"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full rounded-lg border border-gray-300 p-2.5 text-dark focus:border-primary focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block font-semibold text-dark">Designation / Role</label>
                      <input
                        type="text"
                        placeholder="e.g. Student / GIS Analyst"
                        value={designation}
                        onChange={(e) => setDesignation(e.target.value)}
                        className="w-full rounded-lg border border-gray-300 p-2.5 text-dark focus:border-primary focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block font-semibold text-dark">College / Organization</label>
                      <input
                        type="text"
                        placeholder="e.g. OUTR / IIT / Pvt Enterprise"
                        value={organization}
                        onChange={(e) => setOrganization(e.target.value)}
                        className="w-full rounded-lg border border-gray-300 p-2.5 text-dark focus:border-primary focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* =========================================================
                      PAID SESSION: DEDICATED PAYMENT & QR SECTION
                     ========================================================= */}
                  {isPaid && (
                    <div className="rounded-2xl border-2 border-primary/30 bg-primary/5 p-4 sm:p-5 space-y-4">
                      <div className="flex items-center justify-between border-b border-primary/15 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white text-xs font-bold">
                            ₹
                          </span>
                          <span className="font-bold text-dark text-xs uppercase tracking-wider">
                            Session Registration Fee: {price}
                          </span>
                        </div>
                        <span className="rounded bg-yellow/20 px-2 py-0.5 text-[10px] font-bold text-yellow">
                          Scan & Pay via Any UPI App
                        </span>
                      </div>

                      <div className="flex flex-col sm:flex-row items-center gap-4">
                        {/* QR Code Container */}
                        <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-xl border border-gray-300 bg-white p-2 flex flex-col items-center justify-center shadow-xs">
                          {qrImage ? (
                            <Image src={qrImage} alt="Payment QR" fill className="object-contain p-1" unoptimized />
                          ) : (
                            <div className="text-center p-1">
                              <svg className="h-10 w-10 text-primary mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                              </svg>
                              <span className="text-[9px] font-bold text-gray-500">UPI QR CODE</span>
                            </div>
                          )}
                        </div>

                        {/* UPI Details & Transaction ID input */}
                        <div className="w-full space-y-2.5">
                          <div className="rounded-lg bg-white p-2.5 border border-gray-200 text-xs">
                            <p className="text-[11px] text-body-color">Official UPI ID for Direct Payment:</p>
                            <p className="font-mono font-bold text-primary text-sm">{upiId || "terramatrix@upi"}</p>
                            <p className="text-[10px] text-gray-400 mt-0.5">Accepted via GPay, PhonePe, Paytm, BHIM</p>
                          </div>

                          <div>
                            <label className="mb-1 block font-bold text-dark text-xs">
                              Enter Transaction No. / UTR / Reference ID *
                            </label>
                            <input
                              type="text"
                              required
                              placeholder="e.g. 429188421092 or UPI Ref No."
                              value={transactionId}
                              onChange={(e) => setTransactionId(e.target.value)}
                              className="w-full rounded-lg border-2 border-primary/40 bg-white p-2.5 text-xs text-dark font-mono font-semibold focus:border-primary focus:outline-none"
                            />
                            <p className="mt-1 text-[10px] text-body-color">
                              Our team verifies this transaction reference to confirm and dispatch your Digital Pass.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="mb-1 block font-semibold text-dark">
                      Any specific topics, prior experience, or questions for the instructor? (Optional)
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Mention your learning goals, prior GIS/coding exposure..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 p-2.5 text-dark focus:border-primary focus:outline-none"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={onClose}
                      className="rounded-lg border border-gray-300 px-4 py-2 font-semibold text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="rounded-lg bg-green px-6 py-2.5 font-bold text-white hover:bg-primary shadow-sm transition disabled:opacity-50 cursor-pointer"
                    >
                      {submitting ? "Submitting Registration..." : "Submit Registration"}
                    </button>
                  </div>
                </form>
              </>
            )}

            {/* -------------------------------------------------------------
                FORM 3: REQUEST TRAINING MODULE / ON-DEMAND RERUN
               ------------------------------------------------------------- */}
            {isModuleRequest && (
              <>
                <div className="border-b border-gray-100 pb-4 mb-6">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="rounded bg-green/15 px-2.5 py-0.5 text-[11px] font-bold text-green">
                      📦 On-Demand Module Request
                    </span>
                    <span className="rounded bg-gray-100 px-2.5 py-0.5 text-[11px] font-semibold text-gray-700">
                      Rerun & Syllabus
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-dark sm:text-2xl">
                    Request Module: {targetTitle}
                  </h3>
                  <p className="mt-1 text-xs text-body-color">
                    Request the next batch rerun, curriculum delivery, or customized on-demand training for your group.
                  </p>
                </div>

                {errorMsg && <div className="mb-4 rounded-lg bg-red-50 p-3 text-xs text-red-600">{errorMsg}</div>}

                <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block font-semibold text-dark">Your Full Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Er. Subhashree Sen"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full rounded-lg border border-gray-300 p-2.5 text-dark focus:border-primary focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block font-semibold text-dark">Your Email *</label>
                      <input
                        type="email"
                        required
                        placeholder="subhashree@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full rounded-lg border border-gray-300 p-2.5 text-dark focus:border-primary focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div>
                      <label className="mb-1 block font-semibold text-dark">Phone / WhatsApp *</label>
                      <input
                        type="tel"
                        required
                        placeholder="+91-XXXXXXXXXX"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full rounded-lg border border-gray-300 p-2.5 text-dark focus:border-primary focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block font-semibold text-dark">Request Type</label>
                      <select
                        value={requestNature}
                        onChange={(e) => setRequestNature(e.target.value)}
                        className="w-full rounded-lg border border-gray-300 p-2.5 text-dark bg-white focus:border-primary focus:outline-none"
                      >
                        <option value="Individual Next Batch Alert">Individual Next Batch Alert</option>
                        <option value="Group / Team Request for My Institute">Group / Team Request</option>
                        <option value="Recorded Module / Course Material">Recorded Material Access</option>
                      </select>
                    </div>
                    <div>
                      <label className="mb-1 block font-semibold text-dark">Preferred Timing</label>
                      <select
                        value={preferredTiming}
                        onChange={(e) => setPreferredTiming(e.target.value)}
                        className="w-full rounded-lg border border-gray-300 p-2.5 text-dark bg-white focus:border-primary focus:outline-none"
                      >
                        <option value="Weekend Batch">Weekend Batch</option>
                        <option value="Evening Batch">Evening Batch</option>
                        <option value="Fast-Track Intensive">Fast-Track Intensive</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="mb-1 block font-semibold text-dark">College / Company Name</label>
                    <input
                      type="text"
                      placeholder="e.g. VSSUT Burla / Water Resources Department"
                      value={organization}
                      onChange={(e) => setOrganization(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 p-2.5 text-dark focus:border-primary focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block font-semibold text-dark">
                      Specific Modules, Datasets, or Case Studies You Need Covered
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Let us know what practical workflows or project case studies you're interested in..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 p-2.5 text-dark focus:border-primary focus:outline-none"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={onClose}
                      className="rounded-lg border border-gray-300 px-4 py-2 font-semibold text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="rounded-lg bg-green px-6 py-2.5 font-bold text-white hover:bg-primary shadow-sm transition disabled:opacity-50 cursor-pointer"
                    >
                      {submitting ? "Submitting..." : "Submit Module Request"}
                    </button>
                  </div>
                </form>
              </>
            )}

            {/* -------------------------------------------------------------
                FORM 4: CONFERENCE REGISTRATION & ABSTRACT SUBMISSION FORM
               ------------------------------------------------------------- */}
            {isConference && (
              <>
                <div className="border-b border-gray-100 pb-4 mb-6">
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <span className="rounded bg-blue-100 px-2.5 py-0.5 text-[11px] font-bold text-blue-800">
                      🏛️ Conference & Symposium
                    </span>
                    <span className="rounded bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-primary">
                      {targetCategory}
                    </span>
                    <span className="rounded bg-yellow/15 px-2.5 py-0.5 text-[11px] font-semibold text-yellow">
                      📅 {targetDate || "Event Date"}
                    </span>
                    {isPaid && price && (
                      <span className="rounded bg-dark px-2.5 py-0.5 text-[11px] font-bold text-white shadow">
                        Delegate Fee: {price}
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-dark sm:text-2xl">
                    Registration: {targetTitle}
                  </h3>
                  <p className="mt-1 text-xs text-body-color">
                    Register as a delegate, presenter, or submit your research paper abstract.
                  </p>
                </div>

                {errorMsg && <div className="mb-4 rounded-lg bg-red-50 p-3 text-xs text-red-600">{errorMsg}</div>}

                <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block font-semibold text-dark">Delegate / Author Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Prof. / Dr. Alok Mohapatra"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full rounded-lg border border-gray-300 p-2.5 text-dark focus:border-primary focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block font-semibold text-dark">Official Email *</label>
                      <input
                        type="email"
                        required
                        placeholder="alok.m@university.ac.in"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full rounded-lg border border-gray-300 p-2.5 text-dark focus:border-primary focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div>
                      <label className="mb-1 block font-semibold text-dark">Phone Number *</label>
                      <input
                        type="tel"
                        required
                        placeholder="+91-XXXXXXXXXX"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full rounded-lg border border-gray-300 p-2.5 text-dark focus:border-primary focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block font-semibold text-dark">Affiliation / Institution *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. KIIT University / Govt Agency"
                        value={organization}
                        onChange={(e) => setOrganization(e.target.value)}
                        className="w-full rounded-lg border border-gray-300 p-2.5 text-dark focus:border-primary focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block font-semibold text-dark">Participation Role *</label>
                      <select
                        value={conferenceRole}
                        onChange={(e) => setConferenceRole(e.target.value)}
                        className="w-full rounded-lg border border-gray-300 p-2.5 text-dark bg-white focus:border-primary focus:outline-none"
                      >
                        <option value="Attendee / Delegate">Attendee / Delegate</option>
                        <option value="Paper Presenter (Abstract Submission)">Paper Presenter</option>
                        <option value="Keynote Speaker / Panelist">Keynote Speaker</option>
                        <option value="Student Delegate">Student Delegate</option>
                      </select>
                    </div>
                  </div>

                  {/* Paid Conference Section */}
                  {isPaid && (
                    <div className="rounded-2xl border-2 border-primary/30 bg-primary/5 p-4 sm:p-5 space-y-4">
                      <div className="flex items-center justify-between border-b border-primary/15 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white text-xs font-bold">
                            ₹
                          </span>
                          <span className="font-bold text-dark text-xs uppercase tracking-wider">
                            Delegate Registration Fee: {price}
                          </span>
                        </div>
                        <span className="rounded bg-yellow/20 px-2 py-0.5 text-[10px] font-bold text-yellow">
                          UPI Payment
                        </span>
                      </div>

                      <div className="flex flex-col sm:flex-row items-center gap-4">
                        <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl border border-gray-300 bg-white p-2 flex flex-col items-center justify-center shadow-xs">
                          {qrImage ? (
                            <Image src={qrImage} alt="Payment QR" fill className="object-contain p-1" unoptimized />
                          ) : (
                            <div className="text-center p-1">
                              <svg className="h-8 w-8 text-primary mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                              </svg>
                              <span className="text-[8px] font-bold text-gray-500">QR CODE</span>
                            </div>
                          )}
                        </div>

                        <div className="w-full space-y-2">
                          <p className="text-xs text-dark">
                            UPI ID: <strong className="font-mono text-primary">{upiId || "terramatrix@upi"}</strong>
                          </p>
                          <div>
                            <label className="mb-1 block font-bold text-dark text-xs">
                              Transaction Reference / UTR Number *
                            </label>
                            <input
                              type="text"
                              required
                              placeholder="e.g. 429188421092 or UPI Ref ID"
                              value={transactionId}
                              onChange={(e) => setTransactionId(e.target.value)}
                              className="w-full rounded-lg border-2 border-primary/40 bg-white p-2 text-xs text-dark font-mono font-semibold focus:border-primary focus:outline-none"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {conferenceRole.includes("Paper Presenter") && (
                    <div className="rounded-xl border border-blue-200 bg-blue-50/40 p-3.5 space-y-3">
                      <div>
                        <label className="mb-1 block font-semibold text-dark">
                          Paper Title & Abstract Overview *
                        </label>
                        <textarea
                          rows={3}
                          required
                          placeholder="Enter proposed research paper title and 150-word abstract..."
                          value={paperAbstract}
                          onChange={(e) => setPaperAbstract(e.target.value)}
                          className="w-full rounded-lg border border-gray-300 p-2.5 text-dark bg-white focus:border-primary focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block font-semibold text-dark">Proceedings Interest</label>
                        <select
                          value={publicationPref}
                          onChange={(e) => setPublicationPref(e.target.value)}
                          className="w-full rounded-lg border border-gray-300 p-2 text-dark bg-white focus:border-primary focus:outline-none"
                        >
                          <option value="Include ISBN / DOI Indexing">Include in ISBN / DOI Indexed Proceedings</option>
                          <option value="Delegate Presentation Only">Presentation Certificate Only</option>
                        </select>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="mb-1 block font-semibold text-dark">Additional Notes or Queries (Optional)</label>
                    <textarea
                      rows={2}
                      placeholder="Any accommodation, travel assistance, or presentation queries..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 p-2.5 text-dark focus:border-primary focus:outline-none"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={onClose}
                      className="rounded-lg border border-gray-300 px-4 py-2 font-semibold text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="rounded-lg bg-green px-6 py-2.5 font-bold text-white hover:bg-primary shadow-sm transition disabled:opacity-50 cursor-pointer"
                    >
                      {submitting ? "Submitting..." : "Submit Registration"}
                    </button>
                  </div>
                </form>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
