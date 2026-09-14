import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    // 1. Verify authenticated admin
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in as an administrator." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { webhookUrl, registrations, spreadsheetUrl } = body;

    if (!webhookUrl || typeof webhookUrl !== "string") {
      return NextResponse.json(
        { error: "A valid Google Apps Script Webhook URL is required." },
        { status: 400 }
      );
    }

    // Check if user accidentally passed spreadsheet link instead of webhook URL
    if (webhookUrl.includes("docs.google.com/spreadsheets")) {
      return NextResponse.json(
        {
          error:
            "You entered a Google Spreadsheet link instead of an Apps Script Webhook URL. Google Sheets requires an Apps Script Web App to accept automated sync payloads.",
          isSpreadsheetUrl: true,
        },
        { status: 400 }
      );
    }

    if (!webhookUrl.includes("script.google.com/macros/s/")) {
      return NextResponse.json(
        {
          error:
            "Invalid Webhook URL format. A Google Apps Script Web App URL looks like: https://script.google.com/macros/s/.../exec",
        },
        { status: 400 }
      );
    }

    // Forward payload to Google Apps Script with redirect follow
    const googleResponse = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        source: "Terra-Matrix Management Portal",
        timestamp: new Date().toISOString(),
        count: registrations?.length || 0,
        spreadsheetUrl: spreadsheetUrl || "",
        registrations: registrations || [],
      }),
      redirect: "follow",
    });

    const responseText = await googleResponse.text();
    let responseJson: any = null;
    try {
      responseJson = JSON.parse(responseText);
    } catch {
      // response might be raw text or HTML
    }

    // 1. Google 404 / Script Not Found Error
    if (
      googleResponse.status === 404 ||
      responseText.includes("Sorry, the file you have requested does not exist") ||
      responseText.includes("Page not found")
    ) {
      return NextResponse.json(
        {
          error:
            "Google returned 'Page not found (404)'. Google cannot find this Web App deployment. In Google Apps Script, click Deploy ➔ New deployment (NOT 'Manage deployments'), choose 'Web app', set 'Who has access' to 'Anyone', click Deploy, and copy the new Web app URL.",
          is404Error: true,
        },
        { status: 404 }
      );
    }

    // 2. Google Authentication / Login redirect (Deployed with 'Only myself' or domain restricted)
    if (
      responseText.includes("accounts.google.com") ||
      responseText.includes("ServiceLogin")
    ) {
      return NextResponse.json(
        {
          error:
            "Google permission error: Your Apps Script Web App requires Google Login. In Apps Script, click Deploy ➔ New deployment ➔ choose Web app, and ensure 'Who has access' is set to 'Anyone' (not 'Only myself').",
          isPermissionError: true,
        },
        { status: 403 }
      );
    }

    // 3. Other HTML responses that are not valid JSON
    if (responseText.includes("<!DOCTYPE html>") && !responseJson) {
      return NextResponse.json(
        {
          error:
            "Google returned an unexpected HTML response instead of JSON. Please verify that your Web App was deployed as a 'New deployment' with 'Who has access' set to 'Anyone'.",
        },
        { status: 400 }
      );
    }

    if (!googleResponse.ok) {
      return NextResponse.json(
        {
          error: `Google Apps Script returned status ${googleResponse.status}: ${responseText.slice(0, 200)}`,
        },
        { status: 500 }
      );
    }

    // Check if Google Apps Script returned an error payload
    if (responseJson && (responseJson.status === "error" || responseJson.result === "error")) {
      return NextResponse.json(
        {
          error: `Google Apps Script error: ${responseJson.message || responseJson.error || "Script execution failed."}`,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Successfully synchronized ${registrations?.length || 0} records to your Google Sheet!`,
      details: responseJson || responseText,
    });
  } catch (err: any) {
    console.error("Error in sync-sheet proxy:", err);
    return NextResponse.json(
      { error: err.message || "Failed to communicate with Google Sheets Webhook." },
      { status: 500 }
    );
  }
}
