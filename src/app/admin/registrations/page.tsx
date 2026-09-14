"use client";

import UpiCheckerModal from "@/components/Admin/UpiCheckerModal";
import HolographicTicket from "@/components/Ticket/HolographicTicket";
import {
  generateGmailDraftUrl,
  generateGoogleCalendarUrl,
  generateWhatsAppChatUrl,
} from "@/lib/google-calendar";
import { createClient } from "@/lib/supabase/client";
import { Registration, RegistrationStatus } from "@/types/registration";
import { useEffect, useMemo, useState } from "react";

export default function AdminRegistrationsPage() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "registrations" | "corporate" | "tickets" | "module_requests" | "newsletter">("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Fraud / Duplicate UTR Detection memo
  const txnCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    registrations.forEach((r) => {
      if (r.transaction_id && r.transaction_id.trim()) {
        const clean = r.transaction_id.trim();
        counts[clean] = (counts[clean] || 0) + 1;
      }
    });
    return counts;
  }, [registrations]);

  // Notes Modal State
  const [activeNoteModal, setActiveNoteModal] = useState<Registration | null>(null);
  const [noteText, setNoteText] = useState("");
  const [savingNote, setSavingNote] = useState(false);

  // Digital Ticket Dispatch Modal & Auto-Dispatch
  const [dispatchModalItem, setDispatchModalItem] = useState<Registration | null>(null);
  const [customMeetLink, setCustomMeetLink] = useState("https://meet.google.com/xyz-tm-live");
  const [sessionTiming, setSessionTiming] = useState("10:00 AM - 1:00 PM IST");
  const [autoDispatchTicket, setAutoDispatchTicket] = useState(true);
  const [showUpiModal, setShowUpiModal] = useState(false);

  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [sheetWebhookUrl, setSheetWebhookUrl] = useState<string>("");
  const [spreadsheetUrl, setSpreadsheetUrl] = useState<string>("");
  const [syncingSheet, setSyncingSheet] = useState(false);
  const [showWebhookModal, setShowWebhookModal] = useState(false);
  const [copiedEmails, setCopiedEmails] = useState(false);
  const [copiedScript, setCopiedScript] = useState(false);
  const [webhookError, setWebhookError] = useState<string | null>(null);

  const notifySuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3500);
  };

  const fetchRegistrations = async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("registrations")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching registrations:", error);
      } else if (data) {
        setRegistrations(data as Registration[]);
      }
    } catch (err) {
      console.error("Catch fetch registrations:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();

    // Supabase Realtime WebSocket subscription
    const supabase = createClient();
    const channel = supabase
      .channel("realtime-registrations-channel")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "registrations" },
        (payload) => {
          if (payload.eventType === "INSERT") {
            const newItem = payload.new as Registration;
            setRegistrations((prev) => {
              // Avoid duplicate if already fetched
              if (prev.some((r) => r.id === newItem.id)) return prev;
              return [newItem, ...prev];
            });
            notifySuccess(`New Registration Received: ${newItem.full_name} (${newItem.reference_id})`);
          } else if (payload.eventType === "UPDATE") {
            const updated = payload.new as Registration;
            setRegistrations((prev) =>
              prev.map((r) => (r.id === updated.id ? updated : r))
            );
          } else if (payload.eventType === "DELETE") {
            const deletedId = (payload.old as any).id;
            setRegistrations((prev) => prev.filter((r) => r.id !== deletedId));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedWebhook = localStorage.getItem("tm_sheet_webhook_url");
      if (savedWebhook) setSheetWebhookUrl(savedWebhook);
      const savedSheet = localStorage.getItem("tm_spreadsheet_url");
      if (savedSheet) setSpreadsheetUrl(savedSheet);
    }
  }, []);

  const handleManualRefresh = async () => {
    setRefreshing(true);
    await fetchRegistrations();
    notifySuccess("Registrations refreshed from database!");
  };

  // 1-Click Approve / Verify (Tick Mark) for Registrations
  const handleApproveRegistration = async (item: Registration) => {
    const supabase = createClient();
    try {
      const { error } = await supabase
        .from("registrations")
        .update({
          status: "enrolled",
          is_verified: true,
          payment_status: item.transaction_id ? "verified" : "free",
          updated_at: new Date().toISOString(),
        })
        .eq("id", item.id);

      if (error) throw error;

      const updatedItem: Registration = {
        ...item,
        status: "enrolled",
        is_verified: true,
        payment_status: item.transaction_id ? "verified" : "free",
      };

      setRegistrations((prev) =>
        prev.map((r) => (r.id === item.id ? updatedItem : r))
      );

      // Automated direct email dispatch via Resend if enabled
      if (autoDispatchTicket && item.email) {
        try {
          const hostOrigin =
            typeof window !== "undefined"
              ? window.location.origin
              : "https://terramatrix.in";
          const res = await fetch("/api/send-ticket", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              pass: updatedItem,
              meetUrl: customMeetLink,
              sessionTiming: sessionTiming,
              hostOrigin: hostOrigin,
            }),
          });
          const data = await res.json();
          if (res.ok && data.success) {
            notifySuccess(`✓ Verified & Cyberpunk Ticket emailed directly to ${item.email}!`);
          } else if (data.not_configured) {
            notifySuccess(`✓ Verified ${item.full_name}! (Add RESEND_API_KEY in .env.local to automate email delivery)`);
            setDispatchModalItem(updatedItem);
          } else {
            notifySuccess(`✓ Verified ${item.full_name}!`);
            setDispatchModalItem(updatedItem);
          }
        } catch (mailErr) {
          console.error("Auto ticket dispatch error:", mailErr);
          notifySuccess(`✓ Verified ${item.full_name}!`);
          setDispatchModalItem(updatedItem);
        }
      } else {
        // Open digital ticket dispatch modal
        setDispatchModalItem(updatedItem);
        notifySuccess(`Verified & Enrolled ${item.full_name}!`);
      }
    } catch (err: any) {
      alert("Failed to approve: " + err.message);
    }
  };

  // 1-Click Reject / Cancel (Cross Mark) for Registrations
  const handleRejectRegistration = async (item: Registration) => {
    if (!confirm(`Are you sure you want to reject / cancel registration for ${item.full_name}?`)) return;
    const supabase = createClient();
    try {
      const { error } = await supabase
        .from("registrations")
        .update({
          status: "closed",
          is_verified: false,
          payment_status: "rejected",
          updated_at: new Date().toISOString(),
        })
        .eq("id", item.id);

      if (error) throw error;

      setRegistrations((prev) =>
        prev.map((r) =>
          r.id === item.id
            ? { ...r, status: "closed", is_verified: false, payment_status: "rejected" }
            : r
        )
      );
      notifySuccess(`Registration marked as Closed.`);
    } catch (err: any) {
      alert("Failed to reject: " + err.message);
    }
  };

  // Status Dropdown Change
  const handleStatusChange = async (id: string, newStatus: RegistrationStatus) => {
    const supabase = createClient();
    try {
      const { error } = await supabase
        .from("registrations")
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq("id", id);

      if (error) throw error;

      setRegistrations((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
      );
      notifySuccess(`Status updated to "${newStatus.replace("_", " ")}"!`);
    } catch (err: any) {
      alert("Failed to update status: " + (err.message || "Error"));
    }
  };

  // Internal Notes
  const openNoteModal = (item: Registration) => {
    setActiveNoteModal(item);
    setNoteText(item.internal_notes || "");
  };

  const handleSaveNotes = async () => {
    if (!activeNoteModal) return;
    setSavingNote(true);
    const supabase = createClient();
    try {
      const { error } = await supabase
        .from("registrations")
        .update({ internal_notes: noteText, updated_at: new Date().toISOString() })
        .eq("id", activeNoteModal.id);

      if (error) throw error;

      setRegistrations((prev) =>
        prev.map((r) =>
          r.id === activeNoteModal.id ? { ...r, internal_notes: noteText } : r
        )
      );
      setActiveNoteModal(null);
      notifySuccess("Internal notes saved!");
    } catch (err: any) {
      alert("Error saving notes: " + err.message);
    } finally {
      setSavingNote(false);
    }
  };

  // Delete
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this record?")) return;
    const supabase = createClient();
    try {
      const { error } = await supabase.from("registrations").delete().eq("id", id);
      if (error) throw error;
      setRegistrations((prev) => prev.filter((r) => r.id !== id));
      notifySuccess("Record deleted successfully!");
    } catch (err: any) {
      alert("Error deleting: " + err.message);
    }
  };

  // 1-Click Copy All Newsletter Subscriber Emails
  const handleCopyNewsletterEmails = () => {
    const subscribers = registrations
      .filter((r) => r.type === "newsletter")
      .map((r) => r.email)
      .filter(Boolean);

    if (subscribers.length === 0) {
      alert("No newsletter subscribers available to copy.");
      return;
    }

    navigator.clipboard.writeText(subscribers.join(", "));
    setCopiedEmails(true);
    notifySuccess(`Copied ${subscribers.length} subscriber emails to clipboard!`);
    setTimeout(() => setCopiedEmails(false), 3000);
  };

  // 1-Click CSV Export for Google Sheets / Excel
  const handleExportCSV = () => {
    if (filteredRegistrations.length === 0) {
      alert("No records available to export.");
      return;
    }

    const headers = [
      "Reference ID",
      "Section / Type",
      "Target Title",
      "Full Name",
      "Email",
      "Phone",
      "Organization / City",
      "Designation / Profession",
      "Transaction ID / UTR",
      "Payment Status",
      "Verification Status",
      "Status",
      "Message / Ticket Description",
      "Internal Staff Notes",
      "Submission Date",
    ];

    const rows = filteredRegistrations.map((r) => [
      `"${r.reference_id}"`,
      `"${r.type}"`,
      `"${(r.target_item_title || "").replace(/"/g, '""')}"`,
      `"${r.full_name.replace(/"/g, '""')}"`,
      `"${r.email}"`,
      `"${r.phone}"`,
      `"${(r.organization || "").replace(/"/g, '""')}"`,
      `"${(r.designation || "").replace(/"/g, '""')}"`,
      `"${r.transaction_id || "N/A"}"`,
      `"${r.payment_status || "free"}"`,
      `"${r.is_verified ? "Verified" : "Pending"}"`,
      `"${r.status}"`,
      `"${(r.message || "").replace(/"/g, '""')}"`,
      `"${(r.internal_notes || "").replace(/"/g, '""')}"`,
      `"${new Date(r.created_at).toLocaleString()}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `terra_matrix_${activeTab}_leads_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    notifySuccess(`CSV spreadsheet for "${activeTab}" downloaded!`);
  };

  // Google Apps Script Deployable Code for User
  const googleAppsScriptCode = `function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: "active",
    message: "Terra-Matrix Google Sheets Webhook is online and ready to receive POST payloads!"
  })).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    var payload;
    if (e && e.postData && e.postData.contents) {
      payload = JSON.parse(e.postData.contents);
    } else {
      payload = e ? (e.parameter || {}) : {};
    }

    var items = payload.registrations || (payload.full_name ? [payload] : []);
    
    // Open target spreadsheet by URL (preferred) or active spreadsheet
    var ss = null;
    if (payload.spreadsheetUrl && payload.spreadsheetUrl.indexOf("docs.google.com/spreadsheets") !== -1) {
      try {
        ss = SpreadsheetApp.openByUrl(payload.spreadsheetUrl);
      } catch (openErr) {
        // Fallback to active spreadsheet if URL permissions fail
      }
    }
    
    if (!ss) {
      try {
        ss = SpreadsheetApp.getActiveSpreadsheet();
      } catch (actErr) {}
    }
    
    if (!ss) {
      throw new Error("Could not open spreadsheet. Please ensure the Apps Script has access to your Google Spreadsheet.");
    }
    
    var sheet = ss.getActiveSheet();
    
    // Create styled header row if sheet is brand new
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "Sync Timestamp",
        "Reference ID",
        "Category / Type",
        "Program / Event Title",
        "Full Name",
        "Email",
        "Phone",
        "Organization / College",
        "Designation",
        "Delivery Mode",
        "Payment Status",
        "Transaction ID / UTR",
        "Lead Status",
        "Candidate Notes"
      ]);
      sheet.getRange(1, 1, 1, 14).setFontWeight("bold").setBackground("#059669").setFontColor("#FFFFFF");
      sheet.setFrozenRows(1);
    }
    
    for (var i = 0; i < items.length; i++) {
      var r = items[i];
      sheet.appendRow([
        new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
        r.reference_id || "",
        r.type || "",
        r.target_item_title || "",
        r.full_name || "",
        r.email || "",
        r.phone || "",
        r.organization || "",
        r.designation || "",
        r.preferred_mode || "",
        r.payment_status || "",
        r.transaction_id || "N/A",
        r.status || "",
        r.message || ""
      ]);
    }
    
    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      syncedCount: items.length,
      timestamp: new Date().toISOString()
    })).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}`;

  const handleCopyScript = () => {
    navigator.clipboard.writeText(googleAppsScriptCode);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2500);
  };

  // Google Sheets Webhook Trigger (via Next.js API route proxy with full error handling)
  const handleSyncToGoogleSheetWebhook = async () => {
    setWebhookError(null);
    const cleanUrl = sheetWebhookUrl.trim();

    if (!cleanUrl) {
      setWebhookError("Please enter your Google Apps Script Webhook URL.");
      setShowWebhookModal(true);
      return;
    }

    if (cleanUrl.includes("docs.google.com/spreadsheets")) {
      setWebhookError(
        "You entered a Google Spreadsheet link (docs.google.com). Google Sheets requires a Google Apps Script Web App URL (ending in /exec) to accept incoming data. Please copy the Apps Script below, deploy it in your sheet in 1 minute, and paste the generated Web App URL."
      );
      return;
    }

    setSyncingSheet(true);
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem("tm_sheet_webhook_url", cleanUrl);
        localStorage.setItem("tm_spreadsheet_url", spreadsheetUrl);
      }

      const res = await fetch("/api/admin/sync-sheet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          webhookUrl: cleanUrl,
          registrations: filteredRegistrations,
          spreadsheetUrl: spreadsheetUrl,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to sync to Google Sheets.");
      }

      notifySuccess(data.message || `✓ Synchronized ${filteredRegistrations.length} registrations to Google Sheet!`);
      setShowWebhookModal(false);
    } catch (err: any) {
      setWebhookError(err.message || "Failed to communicate with Google Sheets Webhook.");
    } finally {
      setSyncingSheet(false);
    }
  };

  // =========================================================================
  // GENERAL INQUIRY / TICKET / CORPORATE EMAIL DRAFTS
  // =========================================================================
  const getInquiryGmailLink = (item: Registration) => {
    const isTicket = item.type === "support_ticket";
    const isCorp = item.type === "corporate_training";
    const isModule = item.type === "module_request";

    let subject = `Terra-Matrix | In response to your inquiry (Ref: ${item.reference_id})`;
    if (isTicket) {
      subject = `Terra-Matrix Support Desk | Response to Ticket ${item.reference_id}`;
    } else if (isCorp) {
      subject = `Terra-Matrix | Institutional Training Proposal for ${item.organization || item.full_name}`;
    } else if (isModule) {
      subject = `Terra-Matrix | Training Module Details: ${item.target_item_title || "Course"}`;
    }

    const body = `Dear ${item.full_name},

Thank you for reaching out to Terra-Matrix.

We have received your query regarding "${item.target_item_title || "our programs"}" (Tracking ID: ${item.reference_id}).

${
  isTicket
    ? `Regarding your ticket message:\n"${item.message || "Support Request"}"\n\nOur engineering support team has reviewed your query and we are pleased to assist you with the following...`
    : isCorp
    ? `We would be delighted to organize a tailored capacity-building cohort for ${item.organization || "your institution"}.\n\nPreferred Mode: ${item.preferred_mode || "Hybrid"}\nBatch Size: ${item.batch_size || "Custom"}\n\nPlease let us know your availability for a 15-minute technical discovery call with our academic team.`
    : `Regarding your request for the "${item.target_item_title}" training module:\n\nWe have scheduled the next batch rollout and would like to share the comprehensive syllabus and timetable.`
}

Best regards,

Academic & Technical Operations Desk
Terra-Matrix | Geospatial Intelligence & Infrastructure Solutions
Bhubaneswar, India
Website: https://terramatrix.in
Email: contact@terramatrix.in`;

    return generateGmailDraftUrl({ to: item.email, subject, body });
  };

  // General Clean WhatsApp Chat for Inquiries
  const getInquiryWhatsAppLink = (item: Registration) => {
    const text = `*TERRA-MATRIX | INQUIRY RESPONSE*

Hello *${item.full_name}*,

Thank you for reaching out regarding *"${item.target_item_title || "our programs"}"* (Ref ID: \`${item.reference_id}\`).

Our academic & technical team has received your query and we are pleased to assist you.

Please let us know your specific requirements, batch preferences, or any questions you may have!

Best regards,
*Terra-Matrix Operations*
https://terramatrix.in`;
    return generateWhatsAppChatUrl({ phone: item.phone, text });
  };

  // Corporate Staff Discovery Meeting Call
  const getDiscoveryCallCalLink = (item: Registration) => {
    return generateGoogleCalendarUrl({
      title: `Discovery Call: Terra-Matrix <> ${item.full_name} (${item.organization || "Inquiry"})`,
      description: `Reference ID: ${item.reference_id}\nEmail: ${item.email}\nPhone: ${item.phone}\nNotes: ${item.message || "No notes"}`,
      location: "Google Meet",
    });
  };

  // Helper to get authentic live pass URL (always authentic & accessible to recipients)
  const getPassUrl = (refId: string) => {
    if (typeof window !== "undefined") {
      const hostname = window.location.hostname;
      if (hostname !== "localhost" && hostname !== "127.0.0.1") {
        return `${window.location.origin}/pass/${refId}`;
      }
    }
    const prodDomain = process.env.NEXT_PUBLIC_SITE_URL || "https://terramatrix.in";
    return `${prodDomain}/pass/${refId}`;
  };

  // =========================================================================
  // OFFICIAL VERIFIED DIGITAL PASS EMAIL & WHATSAPP DRAFTS (FOR REGISTRATIONS)
  // =========================================================================
  const getVerifiedDigitalPassEmailUrl = (item: Registration) => {
    const passUrl = getPassUrl(item.reference_id);

    const subject = `Official Verified Digital Pass | ${item.target_item_title || "Terra-Matrix Session"} (${item.reference_id})`;

    const body = `Dear ${item.full_name},

Your registration for "${item.target_item_title || "Terra-Matrix Session"}" has been VERIFIED & APPROVED.

Official Pass ID : ${item.reference_id}
Session Timings   : ${sessionTiming}
Google Meet Link  : ${customMeetLink}
Live Digital Pass : ${passUrl}
${item.transaction_id ? `Payment Reference: ${item.transaction_id} (Verified)\n` : ""}
Attached to this email is your official Digital Admission Pass document (HTML). Open it in any browser to launch Google Meet or sync your Google Calendar in 1-click.

Looking forward to seeing you at the session!

Warm regards,

Academic Operations Desk
Terra-Matrix | https://terramatrix.in`;

    return generateGmailDraftUrl({ to: item.email, subject, body });
  };

  // Clean, Professional & Bulletproof WhatsApp Verified Ticket Message (100% Glyph-Safe)
  const getVerifiedWhatsAppUrl = (item: Registration) => {
    const passUrl = getPassUrl(item.reference_id);

    const text = `*TERRA-MATRIX | OFFICIAL DIGITAL PASS*

Hello *${item.full_name}*,

Your seat booking for *"${item.target_item_title}"* has been *VERIFIED & APPROVED*.

*SESSION ACCESS DETAILS:*
• Pass ID: \`${item.reference_id}\`
• Timings: ${sessionTiming}
• Live Meeting: ${customMeetLink}
${item.transaction_id ? `• Payment UTR: \`${item.transaction_id}\` (Verified)\n` : ""}
*ACCESS YOUR DIGITAL PASS:*
>> ${passUrl}

Tap the link above to view your verified digital ticket pass, launch Google Meet, or sync your Google Calendar.

If you have any questions before the session, feel free to reply directly to this chat!

Best regards,
*Terra-Matrix Operations*
https://terramatrix.in`;

    return generateWhatsAppChatUrl({ phone: item.phone, text });
  };

  const [sendingDirectEmail, setSendingDirectEmail] = useState(false);

  // Direct Server-side HTML Ticket Email Dispatch
  const handleDirectEmailDispatch = async (item: Registration) => {
    setSendingDirectEmail(true);
    try {
      const hostOrigin = typeof window !== "undefined" ? window.location.origin : "https://terramatrix.in";
      const res = await fetch("/api/send-ticket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pass: item,
          meetUrl: customMeetLink,
          sessionTiming: sessionTiming,
          hostOrigin: hostOrigin,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        notifySuccess(`✓ ${data.message || `HTML Ticket Pass delivered directly to ${item.email}!`}`);
      } else if (data.not_configured) {
        alert(
          `Direct Email Push Configuration Required:\n\n` +
          `To push emails directly to inboxes with zero downloads, add your email service credentials to .env.local:\n\n` +
          `Option 1 (Gmail / Workspace):\n` +
          `SMTP_USER=${item.email}\n` +
          `SMTP_PASS=your-16-character-google-app-password\n\n` +
          `Option 2 (Resend Cloud):\n` +
          `RESEND_API_KEY=re_xxxxxxxxx`
        );
      } else {
        alert("Notice: " + (data.error || "Failed to dispatch email"));
      }
    } catch (err: any) {
      alert("Error sending email: " + err.message);
    } finally {
      setSendingDirectEmail(false);
    }
  };

  // 1-Click Auto Copy Visual Ticket, Download HTML Pass File & Open Gmail
  const handleCopyAndOpenGmail = (item: Registration) => {
    const passUrl = getPassUrl(item.reference_id);
    const calendarLink = generateGoogleCalendarUrl({
      title: `Terra-Matrix Live Session: ${item.target_item_title}`,
      description: `Official Verified Pass ID: ${item.reference_id}\nInteractive Pass: ${passUrl}\nMeeting Access: ${customMeetLink}\nTimings: ${sessionTiming}`,
      location: customMeetLink,
    });

    // 1. Generate & Download Standalone HTML Pass File
    const standaloneHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Terra-Matrix Digital Pass - ${item.reference_id}</title>
  <style>
    body {
      margin: 0; padding: 30px 15px; background: #070C1E;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #ffffff; display: flex; justify-content: center; align-items: center; min-height: 100vh; box-sizing: border-box;
    }
    .ticket-card {
      width: 100%; max-width: 620px; background: #0B132B; border: 2px solid #10B981; border-radius: 28px; overflow: hidden; box-shadow: 0 0 50px rgba(16,185,129,0.3);
    }
    .ticket-header {
      background: linear-gradient(135deg, #059669 0%, #0D9488 50%, #0284C7 100%); padding: 22px 28px; display: flex; justify-content: space-between; align-items: center;
    }
    .logo-text { font-size: 20px; font-weight: 900; letter-spacing: 2px; color: #ffffff; }
    .badge { background: #070C1E; color: #34D399; font-size: 11px; font-weight: 800; padding: 6px 14px; border-radius: 50px; border: 1px solid #10B981; }
    .ticket-body { padding: 30px 28px; }
    .candidate-name { font-size: 28px; font-weight: 900; margin: 4px 0; }
    .org-text { color: #7DD3FC; font-size: 13px; margin-bottom: 24px; }
    .program-box { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); border-radius: 18px; padding: 20px; margin-bottom: 24px; }
    .program-title { font-size: 18px; font-weight: 800; margin: 6px 0 16px 0; }
    .grid-info { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 14px; font-size: 12px; }
    .btn { display: block; width: 100%; box-sizing: border-box; padding: 14px 20px; border-radius: 14px; font-weight: 800; font-size: 14px; text-align: center; text-decoration: none; margin-bottom: 12px; color: #ffffff; }
    .btn-meet { background: linear-gradient(135deg, #10B981 0%, #0D9488 100%); box-shadow: 0 4px 20px rgba(16,185,129,0.4); }
    .btn-cal { background: linear-gradient(135deg, #2563EB 0%, #4F46E5 100%); box-shadow: 0 4px 20px rgba(37,99,235,0.4); }
    .ticket-footer { border-top: 2px dashed rgba(16,185,129,0.4); background: #070C1E; padding: 18px 28px; display: flex; justify-content: space-between; align-items: center; font-size: 11px; color: #94A3B8; }
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
      <div class="candidate-name">${item.full_name}</div>
      <div class="org-text">${item.organization || "Academic / Industry Cohort"} • ${item.designation || "Participant"}</div>

      <div class="program-box">
        <div style="font-size:10px; color:#94A3B8; text-transform:uppercase; font-weight:700;">ENROLLED TECHNICAL PROGRAM</div>
        <div class="program-title">${item.target_item_title}</div>
        <div class="grid-info">
          <div><span style="color:#94A3B8;">SCHEDULE:</span><br><strong>${sessionTiming}</strong></div>
          <div><span style="color:#94A3B8;">MODE:</span><br><strong style="color:#34D399;">${item.preferred_mode || "Online Live"}</strong></div>
          <div><span style="color:#94A3B8;">PAYMENT REF:</span><br><strong style="color:#FBBF24; font-family:monospace;">${item.transaction_id || "Verified (Free)"}</strong></div>
          <div><span style="color:#94A3B8;">REF ID:</span><br><strong style="color:#38BDF8; font-family:monospace;">${item.reference_id}</strong></div>
        </div>
      </div>

      <a href="${customMeetLink}" target="_blank" class="btn btn-meet">🚀 Launch Live Google Meet Room</a>
      <a href="${calendarLink}" target="_blank" class="btn btn-cal">📅 + Add to Google Calendar</a>
    </div>
    <div class="ticket-footer">
      <div>Pass ID: <strong style="color:#ffffff; font-family:monospace;">${item.reference_id}</strong></div>
      <a href="${passUrl}" target="_blank" style="color:#38BDF8; text-decoration:underline;">Online Verification ↗</a>
    </div>
  </div>
</body>
</html>`;

    const blob = new Blob([standaloneHtml], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.download = `TerraMatrix_Pass_${item.reference_id}.html`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);

    // 2. Copy Rich HTML Card to clipboard
    const htmlSnippet = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0b132b; border: 2px solid #10b981; border-radius: 20px; overflow: hidden; color: #ffffff; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
        <div style="background: linear-gradient(135deg, #10b981 0%, #06b6d4 100%); padding: 18px 24px; display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 18px; font-weight: 900; letter-spacing: 2px; color: #ffffff;">TERRA<span style="color: #0b132b;">MATRIX</span></span>
          <span style="background: #0b132b; color: #10b981; font-size: 11px; font-weight: 800; padding: 4px 12px; border-radius: 50px; text-transform: uppercase;">VERIFIED ADMISSION PASS</span>
        </div>
        <div style="padding: 24px;">
          <div style="font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; font-weight: 700;">Participant Name</div>
          <div style="font-size: 22px; font-weight: 800; color: #ffffff; margin-top: 2px;">${item.full_name}</div>
          <div style="font-size: 12px; color: #38bdf8; margin-top: 2px;">${item.organization || "Academic / Industry Delegate"}</div>
          
          <div style="margin-top: 20px; padding: 16px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px;">
            <div style="font-size: 10px; color: #94a3b8; text-transform: uppercase; font-weight: 700;">Program Title</div>
            <div style="font-size: 16px; font-weight: 700; color: #f8fafc; margin-top: 2px;">${item.target_item_title}</div>
            <div style="font-size: 12px; color: #10b981; margin-top: 6px;">📅 Timing: <strong>${sessionTiming}</strong> • Mode: <strong>${item.preferred_mode || "Online Live"}</strong></div>
            ${item.transaction_id ? `<div style="font-size: 11px; color: #fbbf24; margin-top: 4px;">💳 Payment UTR: <strong>${item.transaction_id}</strong> (Verified)</div>` : ""}
          </div>

          <div style="margin-top: 20px; text-align: center;">
            <a href="${customMeetLink}" target="_blank" style="display: inline-block; background: #10b981; color: #ffffff; padding: 12px 24px; border-radius: 10px; font-weight: 800; font-size: 13px; text-decoration: none; margin-right: 10px; box-shadow: 0 4px 15px rgba(16,185,129,0.4);">🚀 Launch Google Meet Room</a>
            <a href="${calendarLink}" target="_blank" style="display: inline-block; background: #2563eb; color: #ffffff; padding: 12px 24px; border-radius: 10px; font-weight: 800; font-size: 13px; text-decoration: none; box-shadow: 0 4px 15px rgba(37,99,235,0.4);">📅 + Add to Google Calendar</a>
          </div>
        </div>
        <div style="border-top: 1px dashed rgba(255,255,255,0.2); padding: 14px 24px; background: rgba(0,0,0,0.3); font-size: 11px; color: #94a3b8; display: flex; justify-content: space-between;">
          <span>Pass ID: <strong style="color: #ffffff; font-family: monospace;">${item.reference_id}</strong></span>
          <a href="${passUrl}" target="_blank" style="color: #38bdf8; text-decoration: underline;">Open Live Interactive Ticket ↗</a>
        </div>
      </div>
    `;

    try {
      const htmlBlob = new Blob([htmlSnippet], { type: "text/html" });
      const textBlob = new Blob([passUrl], { type: "text/plain" });
      const clipItem = new ClipboardItem({ "text/html": htmlBlob, "text/plain": textBlob });
      navigator.clipboard.write([clipItem]);
    } catch (e) {
      navigator.clipboard.writeText(passUrl);
    }

    notifySuccess("Pass HTML File downloaded & copied to clipboard! Opening Gmail...");

    const gmailUrl = getVerifiedDigitalPassEmailUrl(item);
    window.open(gmailUrl, "_blank", "noopener,noreferrer");
  };

  // 1-Click Auto Copy Visual Ticket & Open WhatsApp
  const handleCopyAndOpenWhatsApp = (item: Registration) => {
    const passUrl = getPassUrl(item.reference_id);
    navigator.clipboard.writeText(passUrl);
    notifySuccess("Ticket link copied! Opening WhatsApp...");
    const waUrl = getVerifiedWhatsAppUrl(item);
    window.open(waUrl, "_blank", "noopener,noreferrer");
  };

  // =========================================================================
  // SUB-TAB FILTERING
  // =========================================================================
  const filteredRegistrations = registrations.filter((item) => {
    let matchesTab = true;
    if (activeTab === "registrations") {
      // ONLY ACTUAL SEAT REGISTRATIONS (Trainings & Conferences)
      matchesTab = item.type === "public_training" || item.type === "conference";
    } else if (activeTab === "corporate") {
      // Corporate & Institutional Inquiries
      matchesTab = item.type === "corporate_training";
    } else if (activeTab === "tickets") {
      // Support Tickets & General Inquiries from Contact Page
      matchesTab = item.type === "support_ticket" || item.type === "consultation";
    } else if (activeTab === "module_requests") {
      // On-Demand Module Requests
      matchesTab = item.type === "module_request";
    } else if (activeTab === "newsletter") {
      // Newsletter Subscribers
      matchesTab = item.type === "newsletter";
    }

    const matchesStatus = statusFilter === "all" ? true : item.status === statusFilter;
    const matchesSearch =
      item.full_name.toLowerCase().includes(search.toLowerCase()) ||
      item.email.toLowerCase().includes(search.toLowerCase()) ||
      item.phone.includes(search) ||
      (item.organization && item.organization.toLowerCase().includes(search.toLowerCase())) ||
      item.reference_id.toLowerCase().includes(search.toLowerCase()) ||
      (item.transaction_id && item.transaction_id.toLowerCase().includes(search.toLowerCase())) ||
      (item.target_item_title && item.target_item_title.toLowerCase().includes(search.toLowerCase()));

    return matchesTab && matchesStatus && matchesSearch;
  });

  // KPI Counters
  const totalCount = registrations.length;
  const registrationCount = registrations.filter((r) => r.type === "public_training" || r.type === "conference").length;
  const corporateCount = registrations.filter((r) => r.type === "corporate_training").length;
  const ticketCount = registrations.filter((r) => r.type === "support_ticket" || r.type === "consultation").length;
  const moduleRequestCount = registrations.filter((r) => r.type === "module_request").length;
  const newsletterCount = registrations.filter((r) => r.type === "newsletter").length;

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {successMsg && (
        <div className="flex items-center gap-2 rounded-xl bg-green-50 border border-green-200 px-4 py-3 text-xs font-semibold text-green-800 shadow-sm transition animate-in fade-in">
          <svg className="h-4 w-4 text-green-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span>{successMsg}</span>
        </div>
      )}

      {/* KPI Cards across Sub-Sections */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <div
          onClick={() => setActiveTab("all")}
          className={`cursor-pointer rounded-2xl border p-3.5 shadow-one transition ${
            activeTab === "all" ? "border-primary bg-primary/5" : "border-gray-200 bg-white hover:border-gray-300"
          }`}
        >
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">All Leads</p>
          <h3 className="mt-1 text-2xl font-extrabold text-dark">{totalCount}</h3>
          <p className="text-[10px] text-body-color">Total Submissions</p>
        </div>

        <div
          onClick={() => setActiveTab("registrations")}
          className={`cursor-pointer rounded-2xl border p-3.5 shadow-one transition ${
            activeTab === "registrations" ? "border-green bg-green/5 ring-1 ring-green/20" : "border-gray-200 bg-white hover:border-gray-300"
          }`}
        >
          <p className="text-[10px] font-bold text-green uppercase tracking-wider">🎫 Registrations</p>
          <h3 className="mt-1 text-2xl font-extrabold text-green">{registrationCount}</h3>
          <p className="text-[10px] text-body-color">Verify & Tickets (✓ / ✗)</p>
        </div>

        <div
          onClick={() => setActiveTab("corporate")}
          className={`cursor-pointer rounded-2xl border p-3.5 shadow-one transition ${
            activeTab === "corporate" ? "border-purple-500 bg-purple-50" : "border-gray-200 bg-white hover:border-gray-300"
          }`}
        >
          <p className="text-[10px] font-bold text-purple-700 uppercase tracking-wider">🏢 Corporate</p>
          <h3 className="mt-1 text-2xl font-extrabold text-purple-800">{corporateCount}</h3>
          <p className="text-[10px] text-body-color">College & Enterprise</p>
        </div>

        <div
          onClick={() => setActiveTab("tickets")}
          className={`cursor-pointer rounded-2xl border p-3.5 shadow-one transition ${
            activeTab === "tickets" ? "border-yellow bg-yellow/5" : "border-gray-200 bg-white hover:border-gray-300"
          }`}
        >
          <p className="text-[10px] font-bold text-yellow uppercase tracking-wider">📩 Support Tickets</p>
          <h3 className="mt-1 text-2xl font-extrabold text-yellow">{ticketCount}</h3>
          <p className="text-[10px] text-body-color">Contact Page Queries</p>
        </div>

        <div
          onClick={() => setActiveTab("module_requests")}
          className={`cursor-pointer rounded-2xl border p-3.5 shadow-one transition ${
            activeTab === "module_requests" ? "border-emerald-500 bg-emerald-50" : "border-gray-200 bg-white hover:border-gray-300"
          }`}
        >
          <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">📦 Module Requests</p>
          <h3 className="mt-1 text-2xl font-extrabold text-emerald-800">{moduleRequestCount}</h3>
          <p className="text-[10px] text-body-color">Course Reruns</p>
        </div>

        <div
          onClick={() => setActiveTab("newsletter")}
          className={`cursor-pointer rounded-2xl border p-3.5 shadow-one transition ${
            activeTab === "newsletter" ? "border-blue-500 bg-blue-50" : "border-gray-200 bg-white hover:border-gray-300"
          }`}
        >
          <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">📬 Newsletter</p>
          <h3 className="mt-1 text-2xl font-extrabold text-blue-600">{newsletterCount}</h3>
          <p className="text-[10px] text-body-color">Subscribers</p>
        </div>
      </div>

      {/* Header & Global Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-dark sm:text-2xl">
            {activeTab === "registrations"
              ? "Course & Conference Registrations (Seat Verification)"
              : activeTab === "corporate"
              ? "Institutional & Corporate Training Proposals"
              : activeTab === "tickets"
              ? "Support Tickets & Help Inquiries"
              : activeTab === "module_requests"
              ? "On-Demand Training Module Requests"
              : activeTab === "newsletter"
              ? "Newsletter Subscribers"
              : "Registrations & Inquiries Hub"}
          </h2>
          <p className="text-xs text-body-color">
            {activeTab === "registrations"
              ? "Verify payment transaction IDs with ✓ to dispatch the Official Digital Pass & Google Meet link."
              : "Reply directly with pre-drafted Gmail proposals, WhatsApp intros, or Google Meet discovery invites."}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* UPI & UTR Verification Desk */}
          <button
            onClick={() => setShowUpiModal(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-700 cursor-pointer"
          >
            <span>₹ UPI Verification Desk</span>
            {registrations.filter((r) => Boolean(r.transaction_id || r.payment_status === "pending_verification") && !r.is_verified && r.payment_status !== "rejected").length > 0 && (
              <span className="rounded-full bg-white text-emerald-800 text-[10px] font-extrabold px-1.5 py-0.2">
                {registrations.filter((r) => Boolean(r.transaction_id || r.payment_status === "pending_verification") && !r.is_verified && r.payment_status !== "rejected").length}
              </span>
            )}
          </button>

          {/* Auto-Dispatch Ticket Toggle */}
          <label className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs text-gray-700 shadow-sm cursor-pointer select-none">
            <input
              type="checkbox"
              checked={autoDispatchTicket}
              onChange={(e) => setAutoDispatchTicket(e.target.checked)}
              className="rounded text-emerald-600 focus:ring-emerald-500 h-3.5 w-3.5"
            />
            <span className="font-semibold text-[11px] text-gray-800">Auto-Email Pass on Verify</span>
          </label>

          {/* Refresh */}
          <button
            onClick={handleManualRefresh}
            disabled={refreshing || loading}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 cursor-pointer disabled:opacity-50"
            title="Refresh from database"
          >
            <svg
              className={`h-3.5 w-3.5 ${refreshing ? "animate-spin text-primary" : "text-gray-500"}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>

          {/* Copy Subscriber Emails if on newsletter tab */}
          {activeTab === "newsletter" && (
            <button
              onClick={handleCopyNewsletterEmails}
              className="inline-flex items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/10 px-3.5 py-2 text-xs font-bold text-primary shadow-sm transition hover:bg-primary hover:text-white cursor-pointer"
            >
              📋 {copiedEmails ? "Copied All!" : "Copy All Subscriber Emails"}
            </button>
          )}

          {/* Export to CSV */}
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 rounded-lg border border-green-600/30 bg-green-50 px-3.5 py-2 text-xs font-bold text-green-700 shadow-sm transition hover:bg-green hover:text-white cursor-pointer"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export to Google Sheets (CSV)
          </button>

          {/* Direct link to User's Google Sheet */}
          <button
            onClick={() => {
              if (spreadsheetUrl && spreadsheetUrl.trim()) {
                window.open(spreadsheetUrl, "_blank");
              } else {
                window.open("https://sheets.google.com", "_blank");
              }
            }}
            className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-600/30 bg-emerald-50 px-3.5 py-2 text-xs font-bold text-emerald-700 shadow-sm transition hover:bg-emerald-600 hover:text-white cursor-pointer"
            title="Open live Google Spreadsheet in new tab"
          >
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-2h2v2zm0-4H7v-2h2v2zm0-4H7V7h2v2zm4 8h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V7h2v2zm4 8h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V7h2v2z" />
            </svg>
            <span>Open Google Sheet ↗</span>
          </button>

          {/* Webhook Sync */}
          <button
            onClick={() => setShowWebhookModal(true)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#4285F4] px-3.5 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-[#3367D6] cursor-pointer"
          >
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-2h2v2zm0-4H7v-2h2v2zm0-4H7V7h2v2zm4 8h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V7h2v2zm4 8h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V7h2v2z" />
            </svg>
            Google Sheets Webhook Sync
          </button>
        </div>
      </div>

      {/* Sub-Section Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 pb-3">
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setActiveTab("all")}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              activeTab === "all" ? "bg-primary text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            All Leads ({totalCount})
          </button>
          <button
            onClick={() => setActiveTab("registrations")}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === "registrations" ? "bg-green text-white shadow" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <span>🎫 Course Registrations</span>
            <span className="rounded-full bg-white/20 px-1.5 py-0.2 text-[10px]">{registrationCount}</span>
          </button>
          <button
            onClick={() => setActiveTab("corporate")}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              activeTab === "corporate" ? "bg-purple-700 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            🏢 Corporate Proposals ({corporateCount})
          </button>
          <button
            onClick={() => setActiveTab("tickets")}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              activeTab === "tickets" ? "bg-yellow text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            📩 Support Tickets ({ticketCount})
          </button>
          <button
            onClick={() => setActiveTab("module_requests")}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              activeTab === "module_requests" ? "bg-emerald-700 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            📦 Module Requests ({moduleRequestCount})
          </button>
          <button
            onClick={() => setActiveTab("newsletter")}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              activeTab === "newsletter" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            📬 Newsletter ({newsletterCount})
          </button>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs text-dark focus:border-primary focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="proposal_sent">Proposal Sent</option>
            <option value="enrolled">Verified / Enrolled</option>
            <option value="closed">Closed / Rejected</option>
          </select>

          <input
            type="text"
            placeholder="Search name, txn ID, ref..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full max-w-xs rounded-lg border border-gray-300 px-3 py-1.5 text-xs text-dark focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      {/* Registrations Data Grid */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-one">
        {loading ? (
          <div className="p-12 text-center text-sm text-body-color">
            <div className="mx-auto mb-3 h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            Loading registrations & inquiries data...
          </div>
        ) : filteredRegistrations.length === 0 ? (
          <div className="p-12 text-center text-sm text-body-color space-y-2">
            <p className="font-semibold text-dark">No records found in &quot;{activeTab}&quot; section.</p>
            <p className="text-xs">Incoming user inquiries and registrations will appear here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-600">
              <thead className="border-b border-gray-200 bg-gray-50 text-[11px] font-bold uppercase tracking-wider text-gray-500">
                <tr>
                  <th className="px-5 py-3.5">Ref & Applicant</th>
                  <th className="px-5 py-3.5">Category & Program</th>
                  <th className="px-5 py-3.5">Details & Transaction</th>
                  <th className="px-5 py-3.5">Pipeline Status</th>
                  <th className="px-5 py-3.5">Actions / Dispatch</th>
                  <th className="px-5 py-3.5 text-right">Manage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredRegistrations.map((item) => {
                  const isRegistrationType =
                    item.type === "public_training" || item.type === "conference";

                  return (
                    <tr key={item.id} className="hover:bg-gray-50/80 transition">
                      {/* Column 1: Ref & Applicant */}
                      <td className="px-5 py-4">
                        <div>
                          <span className="font-mono text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
                            {item.reference_id}
                          </span>
                          <p className="mt-1 font-bold text-dark text-sm">{item.full_name}</p>
                          <p className="text-[11px] text-body-color">{item.email}</p>
                          {item.phone && item.phone !== "N/A" && (
                            <p className="text-[11px] text-dark font-medium">{item.phone}</p>
                          )}
                        </div>
                      </td>

                      {/* Column 2: Category & Program */}
                      <td className="px-5 py-4">
                        <span
                          className={`inline-block rounded px-2 py-0.5 text-[10px] font-semibold mb-1 ${
                            item.type === "support_ticket"
                              ? "bg-yellow/15 text-yellow"
                              : item.type === "newsletter"
                              ? "bg-blue-100 text-blue-800"
                              : item.type === "corporate_training"
                              ? "bg-purple-100 text-purple-800"
                              : item.type === "conference"
                              ? "bg-indigo-100 text-indigo-800"
                              : item.type === "module_request"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-green/15 text-green font-bold"
                          }`}
                        >
                          {item.type.replace("_", " ").toUpperCase()}
                        </span>
                        <p className="font-semibold text-dark text-xs max-w-xs">{item.target_item_title}</p>
                        {item.organization && (
                          <p className="text-[11px] text-body-color mt-0.5">{item.organization}</p>
                        )}
                      </td>

                      {/* Column 3: Details / Transaction No. */}
                      <td className="px-5 py-4">
                        {item.transaction_id ? (
                          <div className="space-y-1">
                            <span className="inline-flex items-center gap-1 rounded bg-purple-100 px-2 py-0.5 text-[10px] font-bold text-purple-900">
                              💳 Paid ({item.price_paid || "₹499"})
                            </span>
                            <div className="rounded border border-primary/20 bg-primary/5 p-1.5 text-[11px]">
                              <p className="text-[10px] text-gray-500 font-bold">UTR / TXN ID:</p>
                              <p className="font-mono font-bold text-primary select-all">{item.transaction_id}</p>
                            </div>
                            {item.transaction_id.trim() && txnCounts[item.transaction_id.trim()] > 1 && (
                              <span className="inline-flex items-center gap-1 rounded bg-red-100 px-2 py-0.5 text-[10px] font-extrabold text-red-700 border border-red-200 animate-pulse">
                                ⚠️ DUPLICATE UTR ({txnCounts[item.transaction_id.trim()]}x)
                              </span>
                            )}
                          </div>
                        ) : item.message ? (
                          <p className="line-clamp-2 text-[11px] text-body-color italic bg-gray-50 p-1.5 rounded border border-gray-100 max-w-xs">
                            &quot;{item.message}&quot;
                          </p>
                        ) : (
                          <span className="text-[11px] text-gray-400">Standard Lead</span>
                        )}
                      </td>

                      {/* Column 4: Status Selector */}
                      <td className="px-5 py-4">
                        <select
                          value={item.status}
                          onChange={(e) =>
                            handleStatusChange(item.id, e.target.value as RegistrationStatus)
                          }
                          className={`rounded-lg border px-2.5 py-1 text-[11px] font-semibold transition focus:outline-none ${
                            item.status === "new"
                              ? "bg-blue-50 border-blue-200 text-blue-800"
                              : item.status === "contacted"
                              ? "bg-yellow-50 border-yellow-200 text-yellow-800"
                              : item.status === "proposal_sent"
                              ? "bg-purple-50 border-purple-200 text-purple-800"
                              : item.status === "enrolled"
                              ? "bg-green-50 border-green-200 text-green-800"
                              : "bg-gray-100 border-gray-300 text-gray-600"
                          }`}
                        >
                          <option value="new">New</option>
                          <option value="contacted">Contacted</option>
                          <option value="proposal_sent">Proposal Sent</option>
                          <option value="enrolled">Verified / Enrolled</option>
                          <option value="closed">Closed / Rejected</option>
                        </select>
                        <p className="mt-1 text-[10px] text-gray-400">
                          {new Date(item.created_at).toLocaleDateString()}
                        </p>
                      </td>

                      {/* Column 5: Actions / Dispatch */}
                      <td className="px-5 py-4">
                        {isRegistrationType ? (
                          /* ONLY COURSE REGISTRATIONS HAVE THE TICK (✓) AND CROSS (✗) VERIFICATION WORKFLOW */
                          <div className="flex items-center gap-2">
                            {/* TICK MARK: APPROVE & VERIFY */}
                            <button
                              onClick={() => handleApproveRegistration(item)}
                              className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 font-bold text-xs text-white shadow-sm transition hover:scale-105 cursor-pointer ${
                                item.is_verified || item.status === "enrolled"
                                  ? "bg-green ring-2 ring-green/30"
                                  : "bg-green-600 hover:bg-green-700"
                              }`}
                              title="Approve / Verify Seat and Open Digital Pass Dispatch"
                            >
                              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                              <span>{item.is_verified ? "Verified" : "Approve (✓)"}</span>
                            </button>

                            {/* CROSS MARK: REJECT */}
                            <button
                              onClick={() => handleRejectRegistration(item)}
                              className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-100 text-red-700 hover:bg-red-600 hover:text-white font-bold transition hover:scale-105 cursor-pointer"
                              title="Reject / Cancel Registration"
                            >
                              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        ) : (
                          /* ALL INQUIRIES, TICKETS, CORPORATE & MODULE REQUESTS HAVE THE DIRECT TEMPLATES */
                          <div className="flex flex-col gap-1.5">
                            {/* Gmail Reply */}
                            <a
                              href={getInquiryGmailLink(item)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50/50 px-2 py-1 text-[10px] font-bold text-red-700 hover:bg-red-100 transition"
                              title="Draft response in Gmail"
                            >
                              <svg className="h-3.5 w-3.5 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                              </svg>
                              Draft in Gmail
                            </a>

                            {/* WhatsApp Quick Chat */}
                            {item.phone && item.phone !== "N/A" && (
                              <a
                                href={getInquiryWhatsAppLink(item)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 rounded-lg border border-green-200 bg-green-50/50 px-2 py-1 text-[10px] font-bold text-green-700 hover:bg-green-100 transition"
                              >
                                <svg className="h-3.5 w-3.5 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.694.062-2.148-.541-1.745-.724-2.875-2.493-2.96-2.607-.087-.113-.708-.941-.708-1.796 0-.854.448-1.277.607-1.45.16-.174.348-.217.464-.217.116 0 .232.002.333.007.107.006.251-.04.39.296.144.35.492 1.203.535 1.29.043.087.072.188.014.303-.058.116-.087.188-.173.289l-.261.303c-.087.088-.178.183-.076.357.101.174.45 0.743.966 1.203.664.593 1.224.777 1.398.864.174.087.275.072.376-.044.101-.116.434-.506.55-.679.116-.174.232-.145.39-.087s1.008.476 1.182.563c.174.087.29.13.333.203.044.072.044.419-.1 0.824z" />
                                </svg>
                                WhatsApp Reply
                              </a>
                            )}

                            {/* Discovery Call for Corporate */}
                            {item.type === "corporate_training" && (
                              <a
                                href={getDiscoveryCallCalLink(item)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50/50 px-2 py-1 text-[10px] font-bold text-blue-700 hover:bg-blue-100 transition"
                              >
                                G-Cal Meet Invite
                              </a>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Column 6: Notes & Delete */}
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {isRegistrationType && item.status === "enrolled" && (
                            <button
                              onClick={() => setDispatchModalItem(item)}
                              className="rounded bg-green/10 px-2 py-1 text-[10px] font-bold text-green hover:bg-green hover:text-white transition cursor-pointer"
                              title="View & Dispatch Digital Ticket Pass"
                            >
                              🎫 Ticket Pass
                            </button>
                          )}

                          <button
                            onClick={() => openNoteModal(item)}
                            className={`rounded p-1.5 transition ${
                              item.internal_notes
                                ? "bg-yellow/10 text-yellow hover:bg-yellow/20"
                                : "text-gray-400 hover:bg-gray-100 hover:text-dark"
                            }`}
                            title="Internal Staff Notes"
                          >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="rounded p-1.5 text-red-500 hover:bg-red-50 transition"
                            title="Delete Record"
                          >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* =========================================================================
          VERIFIED DIGITAL TICKET PASS & MEETING DISPATCH MODAL
         ========================================================================= */}
      {dispatchModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative my-auto max-h-[90vh] overflow-y-auto w-full max-w-2xl rounded-2xl bg-white p-6 sm:p-8 shadow-2xl space-y-5 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-green text-white text-xs font-bold">
                  ✓
                </span>
                <div>
                  <h3 className="text-lg font-bold text-dark">
                    Verified Digital Ticket & Meeting Dispatch
                  </h3>
                  <p className="text-xs text-body-color">
                    Recipient: <strong className="text-dark">{dispatchModalItem.full_name}</strong> ({dispatchModalItem.email})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setDispatchModalItem(null)}
                className="text-gray-400 hover:text-dark text-xl leading-none"
              >
                &times;
              </button>
            </div>

            {/* Configurable Session & Google Meet details */}
            <div className="rounded-xl border border-gray-200 bg-gray-50/70 p-4 space-y-3 text-xs">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block font-semibold text-dark">Google Meet / Session Join URL</label>
                  <input
                    type="text"
                    value={customMeetLink}
                    onChange={(e) => setCustomMeetLink(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 bg-white p-2 text-dark font-mono focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block font-semibold text-dark">Session Schedule / Timing</label>
                  <input
                    type="text"
                    value={sessionTiming}
                    onChange={(e) => setSessionTiming(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 bg-white p-2 text-dark focus:border-primary focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Interactive Live Digital Pass Link Banner */}
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white text-[11px] font-bold">
                  🔗
                </span>
                <div>
                  <p className="font-bold text-dark">Live Interactive Pass Page:</p>
                  <p className="font-mono text-[11px] text-primary truncate max-w-xs sm:max-w-sm">
                    {getPassUrl(dispatchModalItem.reference_id)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(getPassUrl(dispatchModalItem.reference_id));
                    notifySuccess("Copied interactive pass link to clipboard!");
                  }}
                  className="rounded-lg border border-primary/30 bg-white px-2.5 py-1 text-[11px] font-bold text-primary hover:bg-primary hover:text-white transition cursor-pointer"
                >
                  Copy Link
                </button>
                <a
                  href={getPassUrl(dispatchModalItem.reference_id)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg bg-dark px-2.5 py-1 text-[11px] font-bold text-white hover:bg-primary transition"
                >
                  Open Pass ↗
                </a>
              </div>
            </div>

            {/* Cyberpunk Holographic Ticket Preview Card with Image Download & Rich HTML Copy */}
            <HolographicTicket
              pass={dispatchModalItem}
              meetUrl={customMeetLink}
              sessionTiming={sessionTiming}
              showActions={true}
            />

            {/* 1-Click Send Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setDispatchModalItem(null)}
                className="w-full sm:w-auto rounded-lg border border-gray-300 px-4 py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer"
              >
                Close
              </button>

              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                {/* 1-Click WhatsApp with Auto-Copy */}
                {dispatchModalItem.phone && dispatchModalItem.phone !== "N/A" && (
                  <button
                    type="button"
                    onClick={() => handleCopyAndOpenWhatsApp(dispatchModalItem)}
                    className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-green-600 bg-green-50 px-3.5 py-2.5 text-xs font-bold text-green-700 hover:bg-green hover:text-white transition cursor-pointer"
                  >
                    Send on WhatsApp
                  </button>
                )}

                {/* Direct Server HTML Email Dispatch */}
                <button
                  type="button"
                  disabled={sendingDirectEmail}
                  onClick={() => handleDirectEmailDispatch(dispatchModalItem)}
                  className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-emerald-600 bg-emerald-50 px-3.5 py-2.5 text-xs font-bold text-emerald-800 hover:bg-emerald-600 hover:text-white transition cursor-pointer disabled:opacity-50"
                  title="Deliver styled HTML ticket directly to inbox"
                >
                  {sendingDirectEmail ? "Sending HTML Pass..." : "🚀 Direct Send to Email"}
                </button>

                {/* 1-Click Auto Copy Visual Ticket & Open Gmail */}
                <button
                  type="button"
                  onClick={() => handleCopyAndOpenGmail(dispatchModalItem)}
                  className="inline-flex flex-1 sm:flex-none items-center justify-center gap-1.5 rounded-lg bg-green px-4 py-2.5 text-xs font-bold text-white hover:bg-primary shadow-sm transition cursor-pointer"
                  title="Copy visual UI card to clipboard and open Gmail"
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                  </svg>
                  Auto-Copy & Open Gmail
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Internal Staff Notes Modal */}
      {activeNoteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-two">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
              <div>
                <h3 className="font-bold text-dark">
                  Staff Notes for {activeNoteModal.full_name}
                </h3>
                <p className="text-[11px] text-body-color font-mono">
                  Ref: {activeNoteModal.reference_id}
                </p>
              </div>
              <button
                onClick={() => setActiveNoteModal(null)}
                className="text-gray-400 hover:text-dark text-xl leading-none"
              >
                &times;
              </button>
            </div>

            <textarea
              rows={5}
              placeholder="e.g. Spoke with client. Provided custom syllabus details..."
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              className="w-full rounded-xl border border-gray-300 p-3 text-xs text-dark focus:border-primary focus:outline-none"
            />

            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setActiveNoteModal(null)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={savingNote}
                onClick={handleSaveNotes}
                className="rounded-lg bg-green px-5 py-2 text-xs font-semibold text-white hover:bg-primary disabled:opacity-50"
              >
                {savingNote ? "Saving..." : "Save Internal Notes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Google Sheets Webhook Configuration Modal */}
      {showWebhookModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-2h2v2zm0-4H7v-2h2v2zm0-4H7V7h2v2zm4 8h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V7h2v2zm4 8h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V7h2v2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-dark text-base">Google Sheets Webhook Sync</h3>
                  <p className="text-xs text-body-color">Automate instant lead streaming to Google Sheets</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowWebhookModal(false);
                  setWebhookError(null);
                }}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-dark text-xl leading-none"
              >
                &times;
              </button>
            </div>

            {/* Configurable Google Spreadsheet URL Input */}
            <div className="rounded-xl border border-gray-200 bg-gray-50/80 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-dark">
                  Google Spreadsheet Link
                </label>
                {spreadsheetUrl && spreadsheetUrl.trim() && (
                  <a
                    href={spreadsheetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition"
                  >
                    <span>Open Sheet ↗</span>
                  </a>
                )}
              </div>
              <div className="relative">
                <input
                  type="url"
                  placeholder="Paste your Google Spreadsheet link (optional)..."
                  value={spreadsheetUrl}
                  onChange={(e) => {
                    setSpreadsheetUrl(e.target.value);
                    if (typeof window !== "undefined") {
                      localStorage.setItem("tm_spreadsheet_url", e.target.value);
                    }
                  }}
                  className="w-full rounded-lg border border-gray-300 bg-white p-2.5 pr-8 text-xs text-dark focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary font-mono"
                />
                {spreadsheetUrl && (
                  <button
                    type="button"
                    onClick={() => {
                      setSpreadsheetUrl("");
                      if (typeof window !== "undefined") {
                        localStorage.removeItem("tm_spreadsheet_url");
                      }
                    }}
                    className="absolute right-2.5 top-2.5 text-xs text-gray-400 hover:text-gray-600"
                    title="Clear spreadsheet link"
                  >
                    ✕
                  </button>
                )}
              </div>
              <p className="text-[11px] text-body-color">
                Leave blank or paste your Google Sheet link. When blank, clicking &ldquo;Open Google Sheet&rdquo; opens sheets.google.com.
              </p>
            </div>

            {/* Error / Alert Banner */}
            {webhookError && (
              <div className="rounded-xl border border-amber-300 bg-amber-50 p-3.5 text-xs text-amber-900 space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-amber-950">
                  <svg className="h-4 w-4 text-amber-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span>Action Required</span>
                </div>
                <p className="leading-relaxed">{webhookError}</p>
                <div className="pt-1 border-t border-amber-200/60 flex items-center justify-between">
                  <span className="text-[11px] text-amber-800">
                    💡 <strong>Instant Alternative:</strong> Download your data right now without script setup.
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      handleExportCSV();
                      setShowWebhookModal(false);
                    }}
                    className="inline-flex items-center gap-1 rounded-md bg-emerald-600 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-emerald-700 transition cursor-pointer"
                  >
                    <span>Download CSV ↗</span>
                  </button>
                </div>
              </div>
            )}

            {/* Step-by-Step Setup Guide */}
            <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-blue-900 uppercase tracking-wider flex items-center gap-1.5">
                  <span>⚡ 1-Minute Webhook Setup (How to connect your sheet)</span>
                </h4>
                <button
                  type="button"
                  onClick={handleCopyScript}
                  className="rounded-lg bg-blue-600 px-3 py-1.5 text-[11px] font-bold text-white shadow-sm hover:bg-blue-700 transition cursor-pointer"
                >
                  {copiedScript ? "✓ Copied Script!" : "📋 Copy Apps Script Code"}
                </button>
              </div>

              <ol className="text-xs text-gray-700 space-y-2 list-decimal list-inside leading-relaxed">
                <li>
                  In your Google Sheet, click <strong className="text-dark">Extensions</strong> &rarr; <strong className="text-dark">Apps Script</strong>.
                </li>
                <li>
                  Delete any sample code in the editor, click the <strong className="text-blue-700">"Copy Apps Script Code"</strong> button above, and paste it.
                </li>
                <li>
                  Click the blue <strong className="text-dark">Deploy</strong> button &rarr; <strong className="text-dark">New deployment</strong>.
                </li>
                <li>
                  Click the gear icon ⚙️, choose <strong className="text-dark">Web app</strong>, set:
                  <div className="ml-5 my-1 text-[11px] bg-white border border-blue-200 rounded-lg p-2 font-mono text-gray-800">
                    Execute as: <strong>Me</strong><br />
                    Who has access: <strong>Anyone</strong>
                  </div>
                </li>
                <li>
                  Click <strong className="text-dark">Deploy</strong> and copy the generated <strong className="text-emerald-700 font-mono">Web app URL</strong> (ending in <code className="bg-white px-1 py-0.5 rounded border border-gray-300">/exec</code>).
                </li>
              </ol>
            </div>

            {/* Input for Webhook URL */}
            <div>
              <label className="mb-1.5 block font-bold text-dark text-xs">
                Google Apps Script Webhook URL <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="url"
                  placeholder="https://script.google.com/macros/s/.../exec"
                  value={sheetWebhookUrl}
                  onChange={(e) => {
                    setSheetWebhookUrl(e.target.value);
                    setWebhookError(null);
                  }}
                  className={`w-full rounded-xl border p-3 pr-8 text-xs text-dark focus:outline-none focus:ring-1 ${
                    sheetWebhookUrl.includes("docs.google.com/spreadsheets")
                      ? "border-amber-400 bg-amber-50/30 focus:border-amber-500 focus:ring-amber-500"
                      : "border-gray-300 focus:border-primary focus:ring-primary"
                  }`}
                />
                {sheetWebhookUrl && (
                  <button
                    type="button"
                    onClick={() => {
                      setSheetWebhookUrl("");
                      setWebhookError(null);
                      if (typeof window !== "undefined") {
                        localStorage.removeItem("tm_sheet_webhook_url");
                      }
                    }}
                    className="absolute right-3 top-3 text-xs text-gray-400 hover:text-gray-600"
                    title="Clear webhook URL"
                  >
                    ✕
                  </button>
                )}
              </div>
              {sheetWebhookUrl.includes("docs.google.com/spreadsheets") && (
                <p className="mt-1 text-[11px] text-amber-700 font-medium">
                  ⚠️ This is your spreadsheet document link. Please paste your deployed Apps Script Web App URL (<code className="bg-amber-100 px-1 rounded">https://script.google.com/macros/s/.../exec</code>) to connect.
                </p>
              )}
            </div>

            <div className="flex items-center justify-between border-t border-gray-100 pt-3">
              <span className="text-[11px] text-gray-500">
                Syncs <strong>{filteredRegistrations.length}</strong> active registrations
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowWebhookModal(false);
                    setWebhookError(null);
                  }}
                  className="rounded-xl border border-gray-300 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={syncingSheet || !sheetWebhookUrl.trim()}
                  onClick={handleSyncToGoogleSheetWebhook}
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-50 transition cursor-pointer shadow-sm"
                >
                  {syncingSheet ? (
                    <>
                      <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      <span>Syncing to Sheet...</span>
                    </>
                  ) : (
                    <>
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-2h2v2zm0-4H7v-2h2v2zm0-4H7V7h2v2zm4 8h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V7h2v2zm4 8h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V7h2v2z" />
                      </svg>
                      <span>Sync All Data to Sheet</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* UPI / UTR Payment Verification Desk Modal */}
      <UpiCheckerModal
        isOpen={showUpiModal}
        onClose={() => setShowUpiModal(false)}
        registrations={registrations}
        onVerifyAndDispatch={handleApproveRegistration}
        onReject={handleRejectRegistration}
        autoDispatchEnabled={autoDispatchTicket}
      />
    </div>
  );
}
