/**
 * Centralized Administrator Whitelist & Authorization Helper
 * Single source of truth for authorized admin emails permitted to access
 * the Terra-Matrix Admin Portal, request magic links, or reset passwords.
 */

export const AUTHORIZED_ADMIN_EMAILS: string[] = [
  "chiranjeeb.dev@gmail.com",
  "dr.arpanpradhan@gmail.com",
  "sankalpsovan9@gmail.com",
];

/**
 * Checks whether an email address belongs to an authorized administrator.
 * Validates against both the hardcoded fallback list and any additional
 * emails defined in the ADMIN_EMAILS environment variable.
 */
export function isAuthorizedAdmin(email?: string | null): boolean {
  if (!email || typeof email !== "string") return false;

  const clean = email.trim().toLowerCase();

  // Read from environment variable if present
  const envList = (process.env.ADMIN_EMAILS || process.env.ADMIN_EMAIL || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  // Combine hardcoded list and env list
  const combined = new Set([
    ...AUTHORIZED_ADMIN_EMAILS.map((e) => e.toLowerCase()),
    ...envList,
  ]);

  return combined.has(clean);
}
