"use client";

import { generateGoogleCalendarUrl } from "@/lib/google-calendar";
import { Registration } from "@/types/registration";
import { toPng } from "html-to-image";
import { useRef, useState } from "react";

interface HolographicTicketProps {
  pass: Registration;
  meetUrl?: string;
  sessionTiming?: string;
  showActions?: boolean;
}

export default function HolographicTicket({
  pass,
  meetUrl = "https://meet.google.com/xyz-tm-live",
  sessionTiming = "10:00 AM - 1:00 PM IST",
  showActions = true,
}: HolographicTicketProps) {
  const ticketRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const [copiedHtml, setCopiedHtml] = useState(false);

  const calendarUrl = generateGoogleCalendarUrl({
    title: `Terra-Matrix Live Session: ${pass.target_item_title}`,
    description: `Official Verified Pass ID: ${pass.reference_id}\nParticipant: ${pass.full_name}\nMeeting Access: ${meetUrl}\nTimings: ${sessionTiming}`,
    location: meetUrl,
  });

  // 1-Click Download Ticket as PNG Image
  const handleDownloadPng = async () => {
    if (!ticketRef.current) return;
    setDownloading(true);
    try {
      const dataUrl = await toPng(ticketRef.current, {
        cacheBust: true,
        quality: 0.95,
        pixelRatio: 2,
      });
      const link = document.createElement("a");
      link.download = `TerraMatrix_Pass_${pass.reference_id}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Error generating ticket image:", err);
      alert("Failed to export ticket image. You can take a screenshot or print to PDF.");
    } finally {
      setDownloading(false);
    }
  };

  // 1-Click Download Standalone HTML Ticket File (For Attaching to Email / WhatsApp)
  const handleDownloadHtml = () => {
    const origin = typeof window !== "undefined" ? window.location.origin : "https://terramatrix.in";
    const passUrl = `${origin}/pass/${pass.reference_id}`;

    const standaloneHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Terra-Matrix Digital Pass - ${pass.reference_id}</title>
  <style>
    body {
      margin: 0;
      padding: 30px 15px;
      background: #070C1E;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #ffffff;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      box-sizing: border-box;
    }
    .ticket-card {
      width: 100%;
      max-width: 620px;
      background: #0B132B;
      border: 2px solid #10B981;
      border-radius: 28px;
      overflow: hidden;
      box-shadow: 0 0 50px rgba(16,185,129,0.3);
    }
    .ticket-header {
      background: linear-gradient(135deg, #059669 0%, #0D9488 50%, #0284C7 100%);
      padding: 22px 28px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .logo-text {
      font-size: 20px;
      font-weight: 900;
      letter-spacing: 2px;
      color: #ffffff;
    }
    .badge {
      background: #070C1E;
      color: #34D399;
      font-size: 11px;
      font-weight: 800;
      padding: 6px 14px;
      border-radius: 50px;
      border: 1px solid #10B981;
    }
    .ticket-body {
      padding: 30px 28px;
    }
    .candidate-name {
      font-size: 28px;
      font-weight: 900;
      margin: 4px 0;
    }
    .org-text {
      color: #7DD3FC;
      font-size: 13px;
      margin-bottom: 24px;
    }
    .program-box {
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 18px;
      padding: 20px;
      margin-bottom: 24px;
    }
    .program-title {
      font-size: 18px;
      font-weight: 800;
      margin: 6px 0 16px 0;
    }
    .grid-info {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      border-top: 1px solid rgba(255,255,255,0.1);
      padding-top: 14px;
      font-size: 12px;
    }
    .btn {
      display: block;
      width: 100%;
      box-sizing: border-box;
      padding: 14px 20px;
      border-radius: 14px;
      font-weight: 800;
      font-size: 14px;
      text-align: center;
      text-decoration: none;
      margin-bottom: 12px;
      color: #ffffff;
    }
    .btn-meet {
      background: linear-gradient(135deg, #10B981 0%, #0D9488 100%);
      box-shadow: 0 4px 20px rgba(16,185,129,0.4);
    }
    .btn-cal {
      background: linear-gradient(135deg, #2563EB 0%, #4F46E5 100%);
      box-shadow: 0 4px 20px rgba(37,99,235,0.4);
    }
    .ticket-footer {
      border-top: 2px dashed rgba(16,185,129,0.4);
      background: #070C1E;
      padding: 18px 28px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 11px;
      color: #94A3B8;
    }
  </style>
</head>
<body>
  <div class="ticket-card">
    <div class="ticket-header">
      <div class="logo-text">TERRA<span style="color:#070C1E;">MATRIX</span></div>
      <div class="badge">✓ VERIFIED SEAT</div>
    </div>
    <div class="ticket-body">
      <div style="font-size:11px; color:#34D399; font-weight:800; text-transform:uppercase; letter-spacing:1.5px;">OFFICIAL CANDIDATE</div>
      <div class="candidate-name">${pass.full_name}</div>
      <div class="org-text">${pass.organization || "Academic / Industry Cohort"} • ${pass.designation || "Participant"}</div>

      <div class="program-box">
        <div style="font-size:10px; color:#94A3B8; text-transform:uppercase; font-weight:700;">ENROLLED TECHNICAL PROGRAM</div>
        <div class="program-title">${pass.target_item_title}</div>
        <div class="grid-info">
          <div><span style="color:#94A3B8;">SCHEDULE:</span><br><strong>${sessionTiming}</strong></div>
          <div><span style="color:#94A3B8;">MODE:</span><br><strong style="color:#34D399;">${pass.preferred_mode || "Online Live"}</strong></div>
          <div><span style="color:#94A3B8;">PAYMENT REF:</span><br><strong style="color:#FBBF24; font-family:monospace;">${pass.transaction_id || "Verified (Free)"}</strong></div>
          <div><span style="color:#94A3B8;">REF ID:</span><br><strong style="color:#38BDF8; font-family:monospace;">${pass.reference_id}</strong></div>
        </div>
      </div>

      <a href="${meetUrl}" target="_blank" class="btn btn-meet">🚀 Launch Live Google Meet Room</a>
      <a href="${calendarUrl}" target="_blank" class="btn btn-cal">📅 + Add to Google Calendar</a>
    </div>
    <div class="ticket-footer">
      <div>Pass ID: <strong style="color:#ffffff; font-family:monospace;">${pass.reference_id}</strong></div>
      <a href="${passUrl}" target="_blank" style="color:#38BDF8; text-decoration:underline;">Online Verification ↗</a>
    </div>
  </div>
</body>
</html>`;

    const blob = new Blob([standaloneHtml], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.download = `TerraMatrix_Pass_${pass.reference_id}.html`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  };

  // 1-Click Copy Rich HTML Visual Ticket Card
  const handleCopyRichHtml = () => {
    const origin = typeof window !== "undefined" ? window.location.origin : "https://terramatrix.in";
    const passUrl = `${origin}/pass/${pass.reference_id}`;

    const htmlSnippet = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0b132b; border: 2px solid #10b981; border-radius: 20px; overflow: hidden; color: #ffffff; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
        <div style="background: linear-gradient(135deg, #10b981 0%, #06b6d4 100%); padding: 18px 24px; display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 18px; font-weight: 900; letter-spacing: 2px; color: #ffffff;">TERRA<span style="color: #0b132b;">MATRIX</span></span>
          <span style="background: #0b132b; color: #10b981; font-size: 11px; font-weight: 800; padding: 4px 12px; border-radius: 50px; text-transform: uppercase;">VERIFIED ADMISSION PASS</span>
        </div>
        <div style="padding: 24px;">
          <div style="font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; font-weight: 700;">Participant Name</div>
          <div style="font-size: 22px; font-weight: 800; color: #ffffff; margin-top: 2px;">${pass.full_name}</div>
          <div style="font-size: 12px; color: #38bdf8; margin-top: 2px;">${pass.organization || "Academic / Industry Delegate"}</div>
          
          <div style="margin-top: 20px; padding: 16px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px;">
            <div style="font-size: 10px; color: #94a3b8; text-transform: uppercase; font-weight: 700;">Program Title</div>
            <div style="font-size: 16px; font-weight: 700; color: #f8fafc; margin-top: 2px;">${pass.target_item_title}</div>
            <div style="font-size: 12px; color: #10b981; margin-top: 6px;">📅 Timing: <strong>${sessionTiming}</strong> • Mode: <strong>${pass.preferred_mode || "Online Live"}</strong></div>
            ${pass.transaction_id ? `<div style="font-size: 11px; color: #fbbf24; margin-top: 4px;">💳 Payment UTR: <strong>${pass.transaction_id}</strong> (Verified)</div>` : ""}
          </div>

          <div style="margin-top: 20px; text-align: center;">
            <a href="${meetUrl}" target="_blank" style="display: inline-block; background: #10b981; color: #ffffff; padding: 12px 24px; border-radius: 10px; font-weight: 800; font-size: 13px; text-decoration: none; margin-right: 10px; box-shadow: 0 4px 15px rgba(16,185,129,0.4);">🚀 Launch Google Meet Room</a>
            <a href="${calendarUrl}" target="_blank" style="display: inline-block; background: #2563eb; color: #ffffff; padding: 12px 24px; border-radius: 10px; font-weight: 800; font-size: 13px; text-decoration: none; box-shadow: 0 4px 15px rgba(37,99,235,0.4);">📅 + Add to Google Calendar</a>
          </div>
        </div>
        <div style="border-top: 1px dashed rgba(255,255,255,0.2); padding: 14px 24px; background: rgba(0,0,0,0.3); font-size: 11px; color: #94a3b8; display: flex; justify-content: space-between;">
          <span>Pass ID: <strong style="color: #ffffff; font-family: monospace;">${pass.reference_id}</strong></span>
          <a href="${passUrl}" target="_blank" style="color: #38bdf8; text-decoration: underline;">Open Live Interactive Ticket ↗</a>
        </div>
      </div>
    `;

    try {
      const htmlBlob = new Blob([htmlSnippet], { type: "text/html" });
      const textBlob = new Blob([passUrl], { type: "text/plain" });
      const item = new ClipboardItem({ "text/html": htmlBlob, "text/plain": textBlob });
      navigator.clipboard.write([item]).then(() => {
        setCopiedHtml(true);
        setTimeout(() => setCopiedHtml(false), 2500);
      });
    } catch (e) {
      navigator.clipboard.writeText(passUrl);
      setCopiedHtml(true);
      setTimeout(() => setCopiedHtml(false), 2500);
    }
  };

  return (
    <div className="space-y-4">
      {/* =========================================================================
          CYBERPUNK NEON HOLOGRAPHIC TICKET CONTAINER
         ========================================================================= */}
      <div
        ref={ticketRef}
        className="relative overflow-hidden rounded-3xl border-2 border-emerald-500/60 bg-[#0B132B] shadow-[0_0_50px_rgba(16,185,129,0.25)] text-white select-none transition-all duration-300 hover:shadow-[0_0_70px_rgba(6,182,212,0.35)]"
      >
        {/* Holographic Sheen Animated Background Layer */}
        <div className="absolute inset-0 bg-gradient-to-tr from-emerald-950/40 via-cyan-950/20 to-blue-950/40 pointer-events-none" />
        
        {/* Neon Top Bar */}
        <div className="relative border-b border-emerald-500/30 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-3 w-3 rounded-full bg-white animate-ping" />
            <div>
              <span className="text-base sm:text-lg font-black tracking-widest text-white drop-shadow">
                TERRA<span className="text-dark">MATRIX</span>
              </span>
              <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-950">
                Geospatial & AI Intelligence
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="rounded-full bg-dark/90 px-3 py-1 text-[10px] font-extrabold tracking-wider text-emerald-400 border border-emerald-400/40 shadow-inner flex items-center gap-1.5">
              <svg className="h-3.5 w-3.5 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              VERIFIED ADMISSION
            </span>
          </div>
        </div>

        {/* Ticket Main Center Section */}
        <div className="relative p-6 sm:p-7 space-y-5">
          {/* Participant Info */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">
                Official Delegate / Candidate
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {pass.full_name}
              </h3>
              <p className="text-xs text-cyan-300 font-medium mt-0.5">
                {pass.organization || "Independent Engineer / Scholar"} • {pass.designation || "Participant"}
              </p>
            </div>

            {/* Reference Badge */}
            <div className="rounded-2xl border border-cyan-500/40 bg-cyan-950/40 p-3 sm:text-right shrink-0">
              <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400 block">
                Digital Pass Reference
              </span>
              <span className="font-mono text-sm sm:text-base font-black text-cyan-300 tracking-wider">
                {pass.reference_id}
              </span>
            </div>
          </div>

          {/* Program Enrolled Card */}
          <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-4 sm:p-5 space-y-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
              Enrolled Technical Program
            </span>
            <h4 className="text-base sm:text-lg font-bold text-white leading-snug">
              {pass.target_item_title}
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-white/10 text-xs">
              <div>
                <span className="text-[10px] font-semibold text-gray-400 block">SCHEDULE:</span>
                <span className="font-bold text-white">{sessionTiming}</span>
              </div>
              <div>
                <span className="text-[10px] font-semibold text-gray-400 block">DELIVERY MODE:</span>
                <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  {pass.preferred_mode || "Online Interactive"}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-semibold text-gray-400 block">PAYMENT UTR:</span>
                <span className="font-mono font-bold text-yellow">
                  {pass.transaction_id || "Verified Seat (Free)"}
                </span>
              </div>
            </div>
          </div>

          {/* Interactive Action Hub */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <a
              href={meetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-5 py-3 text-xs font-black text-white shadow-lg shadow-emerald-500/30 transition hover:scale-[1.02] hover:brightness-110"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.5v-9l6 4.5-6 4.5z" />
              </svg>
              🚀 Join Google Meet Room
            </a>

            <a
              href={calendarUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-3 text-xs font-black text-white shadow-lg shadow-blue-500/30 transition hover:scale-[1.02] hover:brightness-110"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11zM7 11h5v5H7z" />
              </svg>
              📅 + Add to Google Calendar
            </a>
          </div>
        </div>

        {/* Perforated Stub Footer with Barcode / QR */}
        <div className="relative border-t-2 border-dashed border-emerald-500/40 bg-black/40 p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Notches on edges */}
          <div className="absolute -top-3 -left-3 h-6 w-6 rounded-full bg-[#090E34] border border-emerald-500/40" />
          <div className="absolute -top-3 -right-3 h-6 w-6 rounded-full bg-[#090E34] border border-emerald-500/40" />

          <div className="flex items-center gap-3">
            {/* Live Security QR */}
            <div className="h-14 w-14 shrink-0 rounded-xl bg-white p-1 flex flex-col items-center justify-center shadow-md">
              <svg className="h-full w-full text-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
              </svg>
            </div>

            <div>
              <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-400 block">
                Official Check-In Security Barcode
              </span>
              <span className="font-mono text-xs font-black tracking-widest text-white">
                {pass.reference_id}
              </span>
              <p className="text-[10px] text-gray-400 mt-0.5">
                Authorized by Terra-Matrix Academic & Technical Operations Desk
              </p>
            </div>
          </div>

          <div className="text-center sm:text-right text-[10px] text-gray-400">
            <p>Issued To: <strong className="text-white">{pass.email}</strong></p>
            <p>Support: <span className="text-emerald-400">contact@terramatrix.in</span></p>
          </div>
        </div>
      </div>

      {/* Optional Dispatch Controls for Admin or Users */}
      {showActions && (
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleDownloadHtml}
              className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-400 bg-emerald-500 px-4 py-2 text-xs font-black text-white hover:bg-emerald-600 transition cursor-pointer shadow-md"
            >
              📥 Download HTML Pass File
            </button>

            <button
              onClick={handleDownloadPng}
              disabled={downloading}
              className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/50 bg-emerald-500/10 px-4 py-2 text-xs font-bold text-emerald-400 hover:bg-emerald-500 hover:text-white transition cursor-pointer shadow-sm disabled:opacity-50"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              {downloading ? "Exporting Image..." : "🖼️ Download Image PNG"}
            </button>

            <button
              onClick={handleCopyRichHtml}
              className="inline-flex items-center gap-1.5 rounded-xl border border-cyan-500/50 bg-cyan-500/10 px-4 py-2 text-xs font-bold text-cyan-300 hover:bg-cyan-500 hover:text-white transition cursor-pointer shadow-sm"
            >
              📋 {copiedHtml ? "Copied Visual HTML Ticket!" : "Copy Visual HTML Card"}
            </button>
          </div>

          <span className="text-[10px] text-gray-400 italic">
            Tip: Attach the downloaded HTML/PNG pass file with your email or message!
          </span>
        </div>
      )}
    </div>
  );
}
