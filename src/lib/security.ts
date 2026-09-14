/**
 * Security & Sanitization Utilities
 * Prevents XSS, HTML injection, SSRF, and DOM text reinterpretation.
 */

/**
 * Escapes HTML meta-characters to prevent HTML injection and Cross-Site Scripting (XSS).
 */
export function escapeHtml(str?: string | null): string {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Validates and sanitizes URLs before rendering them in href attributes.
 * Prevents javascript: and dangerous URI scheme execution in the DOM.
 */
export function sanitizeUrl(url?: string | null): string {
  if (!url || typeof url !== "string") return "#";
  const trimmed = url.trim();

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === "http:" || parsed.protocol === "https:") {
      return parsed.href;
    }
  } catch {
    // Malformed URL
  }

  return "#";
}

/**
 * Strictly verifies that a Google Spreadsheet link is an authentic Google Docs domain.
 */
export function isSafeSpreadsheetUrl(url?: string | null): boolean {
  if (!url || typeof url !== "string") return false;
  try {
    const parsed = new URL(url.trim());
    return (
      parsed.protocol === "https:" &&
      (parsed.hostname === "docs.google.com" || parsed.hostname === "drive.google.com")
    );
  } catch {
    return false;
  }
}

/**
 * Strictly verifies that an Apps Script Webhook URL is legitimately bound to script.google.com
 * to prevent Server-Side Request Forgery (SSRF).
 */
export function isSafeGoogleScriptUrl(url?: string | null): boolean {
  if (!url || typeof url !== "string") return false;
  try {
    const parsed = new URL(url.trim());
    return (
      parsed.protocol === "https:" &&
      parsed.hostname === "script.google.com" &&
      parsed.pathname.startsWith("/macros/s/")
    );
  } catch {
    return false;
  }
}
