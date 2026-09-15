import { generateGoogleCalendarUrl } from "@/lib/google-calendar";
import { escapeHtml, sanitizeUrl } from "@/lib/security";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(request: Request) {
  try {
    // 🛡️ Security Check: Ensure caller is an authenticated admin
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized. You must be logged into the admin dashboard to dispatch tickets." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { pass, meetUrl, sessionTiming, hostOrigin } = body;

    if (!pass || !pass.email) {
      return NextResponse.json({ error: "Participant pass and email are required." }, { status: 400 });
    }

    // Ensure canonical live URL for the recipient (never send broken localhost links)
    const requestHost = request.headers.get("x-forwarded-host") || request.headers.get("host");
    const requestProto = request.headers.get("x-forwarded-proto") || "https";
    let origin = process.env.NEXT_PUBLIC_SITE_URL || "https://terramatrix.in";

    if (hostOrigin && !hostOrigin.includes("localhost") && !hostOrigin.includes("127.0.0.1")) {
      origin = hostOrigin;
    } else if (requestHost && !requestHost.includes("localhost") && !requestHost.includes("127.0.0.1")) {
      origin = `${requestProto}://${requestHost}`;
    }

    const passUrl = `${origin}/pass/${pass.reference_id}`;

    const calendarUrl = generateGoogleCalendarUrl({
      title: `Terra-Matrix Live Session: ${pass.target_item_title}`,
      description: `Official Verified Pass ID: ${pass.reference_id}\nParticipant: ${pass.full_name}\nMeeting Access: ${meetUrl}\nTimings: ${sessionTiming}`,
      location: meetUrl,
    });

    // Sanitized variables for HTML template (prevents HTML injection / XSS)
    const safeName = escapeHtml(pass.full_name);
    const safeOrg = escapeHtml(pass.organization || "Academic / Industry Cohort");
    const safeDesignation = escapeHtml(pass.designation || "Participant");
    const safeRefId = escapeHtml(pass.reference_id);
    const safeTitle = escapeHtml(pass.target_item_title);
    const safeTiming = escapeHtml(sessionTiming);
    const safeMode = escapeHtml(pass.preferred_mode || "Online Live");
    const safeTxn = escapeHtml(pass.transaction_id || "Verified Seat (Free)");
    const safeMeetUrl = sanitizeUrl(meetUrl);
    const safeCalendarUrl = sanitizeUrl(calendarUrl);
    const safePassUrl = sanitizeUrl(passUrl);

    // Beautiful Responsive Cyberpunk Holographic Email Template
    const htmlEmail = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Official Digital Admission Pass</title>
</head>
<body style="margin: 0; padding: 20px 10px; background-color: #070C1E; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width: 620px; margin: 0 auto; background-color: #0B132B; border: 2px solid #10B981; border-radius: 24px; overflow: hidden; box-shadow: 0 0 40px rgba(16,185,129,0.35);">
    <!-- Top Glowing Header -->
    <tr>
      <td style="background: linear-gradient(135deg, #059669 0%, #0D9488 50%, #0284C7 100%); padding: 24px 28px; color: #ffffff;">
        <table role="presentation" width="100%">
          <tr>
            <td>
              <div style="font-size: 22px; font-weight: 900; letter-spacing: 2.5px; color: #ffffff;">
                TERRA<span style="color: #070C1E;">MATRIX</span>
              </div>
              <div style="font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #070C1E; margin-top: 2px;">
                Geospatial & AI Intelligence Desk
              </div>
            </td>
            <td align="right">
              <span style="background-color: #070C1E; color: #34D399; font-size: 11px; font-weight: 800; padding: 6px 14px; border-radius: 50px; border: 1px solid #10B981; letter-spacing: 1px; display: inline-block;">
                ✓ VERIFIED SEAT
              </span>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Main Ticket Card Body -->
    <tr>
      <td style="padding: 32px 28px 24px 28px; color: #ffffff;">
        <!-- Candidate Details -->
        <table role="presentation" width="100%">
          <tr>
            <td>
              <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; color: #34D399;">
                OFFICIAL DELEGATE / CANDIDATE
              </div>
              <div style="font-size: 26px; font-weight: 900; color: #ffffff; margin-top: 4px; letter-spacing: -0.5px;">
                ${safeName}
              </div>
              <div style="font-size: 13px; color: #7DD3FC; margin-top: 2px;">
                ${safeOrg} • ${safeDesignation}
              </div>
            </td>
            <td align="right" valign="top">
              <div style="background-color: rgba(6,182,212,0.12); border: 1px solid rgba(6,182,212,0.4); border-radius: 12px; padding: 8px 14px; text-align: right; display: inline-block;">
                <div style="font-size: 9px; color: #94A3B8; font-weight: 700; text-transform: uppercase;">Pass Reference</div>
                <div style="font-family: monospace; font-size: 15px; font-weight: 900; color: #38BDF8; letter-spacing: 1px;">
                  ${safeRefId}
                </div>
              </div>
            </td>
          </tr>
        </table>

        <!-- Program Box -->
        <table role="presentation" width="100%" style="margin-top: 24px; background-color: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 18px 20px;">
          <tr>
            <td>
              <div style="font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #94A3B8;">
                ENROLLED TECHNICAL PROGRAM
              </div>
              <div style="font-size: 18px; font-weight: 800; color: #F8FAFC; margin-top: 4px; line-height: 1.4;">
                ${safeTitle}
              </div>

              <!-- Meta info grid -->
              <table role="presentation" width="100%" style="margin-top: 16px; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 14px;">
                <tr>
                  <td width="33%" style="font-size: 11px; color: #94A3B8;">
                    <strong>SCHEDULE:</strong><br>
                    <span style="color: #ffffff; font-size: 12px; font-weight: 700;">${safeTiming}</span>
                  </td>
                  <td width="33%" style="font-size: 11px; color: #94A3B8;">
                    <strong>MODE:</strong><br>
                    <span style="color: #34D399; font-size: 12px; font-weight: 700;">● ${safeMode}</span>
                  </td>
                  <td width="33%" style="font-size: 11px; color: #94A3B8;">
                    <strong>PAYMENT REF:</strong><br>
                    <span style="color: #FBBF24; font-size: 12px; font-weight: 700; font-family: monospace;">${safeTxn}</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>

        <!-- Live Interactive Buttons -->
        <table role="presentation" width="100%" style="margin-top: 24px;">
          <tr>
            <td align="center" style="padding-bottom: 12px;">
              <a href="${safeMeetUrl}" target="_blank" style="display: block; width: 85%; background: linear-gradient(135deg, #10B981 0%, #0D9488 100%); color: #ffffff; font-size: 14px; font-weight: 900; text-align: center; text-decoration: none; padding: 14px 20px; border-radius: 12px; box-shadow: 0 4px 20px rgba(16,185,129,0.45); letter-spacing: 0.5px;">
                🚀 Launch Live Google Meet Room
              </a>
            </td>
          </tr>
          <tr>
            <td align="center">
              <a href="${safeCalendarUrl}" target="_blank" style="display: block; width: 85%; background: linear-gradient(135deg, #2563EB 0%, #4F46E5 100%); color: #ffffff; font-size: 14px; font-weight: 900; text-align: center; text-decoration: none; padding: 14px 20px; border-radius: 12px; box-shadow: 0 4px 20px rgba(37,99,235,0.45); letter-spacing: 0.5px;">
                📅 + Add to Google Calendar (1-Click)
              </a>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Tear-Off Stub & Security Barcode -->
    <tr>
      <td style="border-top: 2px dashed rgba(16,185,129,0.4); background-color: #070C1E; padding: 20px 28px;">
        <table role="presentation" width="100%">
          <tr>
            <td>
              <div style="font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: #34D399;">
                OFFICIAL DIGITAL PASS LINK:
              </div>
              <div style="margin-top: 4px;">
                <a href="${safePassUrl}" target="_blank" style="color: #38BDF8; font-size: 12px; text-decoration: underline; word-break: break-all;">
                  ${safePassUrl}
                </a>
              </div>
            </td>
            <td align="right" style="font-size: 11px; color: #64748B;">
              Pass ID: <strong style="color: #ffffff; font-family: monospace;">${safeRefId}</strong><br>
              Terra-Matrix Academic Ops
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>

  <div style="text-align: center; margin-top: 20px; font-size: 11px; color: #64748B;">
    © 2026 Terra-Matrix | Geospatial Intelligence & Infrastructure Solutions • Bhubaneswar, India
  </div>
</body>
</html>
    `;

    // 1. Check for Resend API Key
    if (process.env.RESEND_API_KEY) {
      const { Resend } = await import("resend");
      const resend = new Resend(process.env.RESEND_API_KEY);
      const resendFrom = process.env.RESEND_FROM || "Terra-Matrix Academy <admissions@terramatrix.in>";
      const { error } = await resend.emails.send({
        from: resendFrom,
        to: [pass.email],
        subject: `Official Verified Digital Pass | ${pass.target_item_title} (${pass.reference_id})`,
        html: htmlEmail,
      });
      if (error) {
        throw new Error(error.message);
      }
      return NextResponse.json({ success: true, message: `HTML Digital Pass pushed directly to ${pass.email} via Resend Cloud!` });
    }

    // 2. Check for SMTP config (Gmail / Google Workspace App Password / Custom SMTP)
    const smtpHost = process.env.SMTP_HOST || "smtp.gmail.com";
    const smtpUser = process.env.SMTP_USER || process.env.ADMIN_EMAIL;
    const smtpPass = process.env.SMTP_PASS;

    if (smtpUser && smtpPass) {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: 465,
        secure: true,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });

      await transporter.sendMail({
        from: `"Terra-Matrix Academy" <${smtpUser}>`,
        to: pass.email,
        subject: `Official Verified Digital Pass | ${pass.target_item_title} (${pass.reference_id})`,
        html: htmlEmail,
      });

      return NextResponse.json({ success: true, message: `HTML Digital Pass pushed directly to ${pass.email} via SMTP!` });
    }

    // 3. Fallback: If neither is configured yet, explain clearly what to add in .env.local
    return NextResponse.json({
      success: false,
      not_configured: true,
      message: "Direct email push requires either SMTP_USER & SMTP_PASS (e.g. Gmail App Password) or RESEND_API_KEY in .env.local.",
      html: htmlEmail,
    });
  } catch (error: any) {
    console.error("Error sending ticket email:", error);
    return NextResponse.json({ error: error.message || "Failed to dispatch email." }, { status: 500 });
  }
}
