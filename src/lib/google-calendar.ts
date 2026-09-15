/**
 * Utility to generate 1-click Google Calendar web event URLs and Google Meet / Gmail links
 */

export interface GoogleCalendarEventProps {
  title: string;
  description: string;
  location?: string;
  startDate?: string; // YYYYMMDDTHHmmssZ or simple ISO string
  endDate?: string;
}

export function generateGoogleCalendarUrl({
  title,
  description,
  location = "Terra-Matrix Online / Hybrid",
  startDate,
  endDate,
}: GoogleCalendarEventProps): string {
  // Format dates for Google Calendar (YYYYMMDDTHHmmssZ)
  let datesParam = "";
  if (startDate) {
    const startIso = new Date(startDate).toISOString().replace(/-|:|\.\d\d\d/g, "");
    // Default 1 hour duration if no end date
    const endObj = endDate ? new Date(endDate) : new Date(new Date(startDate).getTime() + 60 * 60 * 1000);
    const endIso = endObj.toISOString().replace(/-|:|\.\d\d\d/g, "");
    datesParam = `&dates=${startIso}/${endIso}`;
  } else {
    // If no exact start timestamp, create generic reminder for upcoming batch
    const now = new Date();
    const futureDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const startIso = futureDate.toISOString().replace(/-|:|\.\d\d\d/g, "");
    const endIso = new Date(futureDate.getTime() + 2 * 60 * 60 * 1000).toISOString().replace(/-|:|\.\d\d\d/g, "");
    datesParam = `&dates=${startIso}/${endIso}`;
  }

  const encodedTitle = encodeURIComponent(title);
  const encodedDesc = encodeURIComponent(description);
  const encodedLocation = encodeURIComponent(location);

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodedTitle}&details=${encodedDesc}&location=${encodedLocation}${datesParam}`;
}

export function generateGmailDraftUrl({
  to,
  subject,
  body,
}: {
  to: string;
  subject: string;
  body: string;
}): string {
  const encTo = encodeURIComponent(to);
  const encSub = encodeURIComponent(subject);
  const encBody = encodeURIComponent(body);

  return `https://mail.google.com/mail/?view=cm&fs=1&to=${encTo}&su=${encSub}&body=${encBody}`;
}

export function generateWhatsAppChatUrl({
  phone,
  text,
}: {
  phone: string;
  text: string;
}): string {
  let cleanPhone = phone.replace(/[^0-9]/g, "");
  // Default to 91 for 10-digit numbers if country code is missing
  if (cleanPhone.length === 10) {
    cleanPhone = `91${cleanPhone}`;
  }
  // Safely normalize to NFC Unicode to prevent emoji glyph corruption
  const normalizedText = text.normalize("NFC");
  const encText = encodeURIComponent(normalizedText);
  return `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encText}`;
}
