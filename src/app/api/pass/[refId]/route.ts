import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ refId: string }> }
) {
  try {
    const { refId } = await params;

    if (!refId) {
      return NextResponse.json({ error: "Reference ID is required" }, { status: 400 });
    }

    const supabase = await createClient();

    // Query registration securely by reference_id
    const { data, error } = await supabase
      .from("registrations")
      .select(`
        reference_id,
        target_item_title,
        full_name,
        organization,
        designation,
        preferred_mode,
        preferred_date,
        is_verified,
        payment_status,
        price_paid,
        status,
        created_at
      `)
      .eq("reference_id", refId)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: "Pass not found or invalid Reference ID", found: false },
        { status: 404 }
      );
    }

    return NextResponse.json({
      found: true,
      pass: data,
    });
  } catch (err: any) {
    console.error("Pass lookup error:", err);
    return NextResponse.json({ error: "Failed to retrieve pass" }, { status: 500 });
  }
}
