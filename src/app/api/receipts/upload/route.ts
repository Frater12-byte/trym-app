/**
 * /api/receipts/upload — POST
 *
 * Receives a receipt image, uploads to Supabase Storage,
 * runs OCR via gpt-4o-mini vision, parses items, attempts to
 * match each to the ingredients catalog, and creates user_reported_deals
 * for high-confidence matches.
 *
 * Request: multipart/form-data
 *   - file: image file (jpeg/png/webp/heic, ≤10MB)
 *   - area?: string (optional, user's area like "Dubai Marina")
 *   - supermarket_hint?: string (if user knows the store)
 *
 * Response: 200 with { receipt_id, parsed_items_count, matched_items_count }
 *           4xx with { error }
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import OpenAI from "openai";
import { parseReceipt } from "@/lib/receipt-parser";
import { matchReceiptItems } from "@/lib/ingredient-matcher";

// Force this route to run on Node.js runtime (vision API needs it)
export const runtime = "nodejs";
export const maxDuration = 30; // up to 30s for OCR + matching

const FREE_TIER_MONTHLY_LIMIT = 10;
const PRO_TIER_MONTHLY_LIMIT = 999; // effectively unlimited

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // ============================================================
    // 1. AUTH
    // ============================================================
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // ============================================================
    // 2. RATE LIMIT (free tier: 10/month, pro: unlimited)
    // ============================================================
    const { data: profile } = await supabase
      .from("profiles")
      .select("subscription_status")
      .eq("id", user.id)
      .single();

    const limit =
      profile?.subscription_status === "paid"
        ? PRO_TIER_MONTHLY_LIMIT
        : FREE_TIER_MONTHLY_LIMIT;

    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const { count } = await supabase
      .from("receipts")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .gte("created_at", monthStart.toISOString());

    if ((count ?? 0) >= limit) {
      return NextResponse.json(
        {
          error: `You've used all ${limit} free receipt scans this month. Upgrade to Pro for unlimited.`,
          code: "RATE_LIMIT",
        },
        { status: 429 }
      );
    }

    // ============================================================
    // 3. PARSE FORM DATA
    // ============================================================
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const area = (formData.get("area") as string) || null;
    const supermarketHint =
      (formData.get("supermarket_hint") as string) || null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Image too large (max 10MB)" },
        { status: 400 }
      );
    }

    const validTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/heic",
      "image/heif",
    ];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Use JPEG, PNG, WEBP, or HEIC." },
        { status: 400 }
      );
    }

    // ============================================================
    // 4. UPLOAD TO STORAGE
    // ============================================================
    const fileBuffer = await file.arrayBuffer();
    const ext = file.type.split("/")[1].replace("jpeg", "jpg");
    const fileName = `${user.id}/${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("receipts")
      .upload(fileName, fileBuffer, {
        contentType: file.type,
        cacheControl: "3600",
      });

    if (uploadError) {
      console.error("Storage upload failed:", uploadError);
      return NextResponse.json(
        { error: "Failed to save image" },
        { status: 500 }
      );
    }

    // ============================================================
    // 5. CREATE RECEIPT ROW
    // ============================================================
    const { data: receipt, error: insertError } = await supabase
      .from("receipts")
      .insert({
        user_id: user.id,
        image_path: fileName,
        image_size_bytes: file.size,
        supermarket: supermarketHint,
        status: "processing",
      })
      .select("id")
      .single();

    if (insertError || !receipt) {
      console.error("Receipt insert failed:", insertError);
      return NextResponse.json(
        { error: "Failed to create receipt record" },
        { status: 500 }
      );
    }

    // ============================================================
    // 6. RUN OCR (gpt-4o-mini vision) — convert image to base64
    // ============================================================
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const base64Image = Buffer.from(fileBuffer).toString("base64");
    const dataUrl = `data:${file.type};base64,${base64Image}`;

    let parsedReceipt;
    try {
      parsedReceipt = await parseReceipt(openai, dataUrl, supermarketHint);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown OCR error";
      await supabase
        .from("receipts")
        .update({ status: "failed", parse_error: msg })
        .eq("id", receipt.id);

      return NextResponse.json(
        { error: "Could not read receipt", details: msg },
        { status: 422 }
      );
    }

    // ============================================================
    // 7. MATCH ITEMS TO INGREDIENT CATALOG
    // ============================================================
    const { data: catalog } = await supabase
      .from("ingredients")
      .select("id, name, default_unit, default_price_aed, category");

    const matched = matchReceiptItems(parsedReceipt.items, catalog || []);

    // ============================================================
    // 8. INSERT RECEIPT_ITEMS
    // ============================================================
    const itemRows = matched.map((m) => ({
      receipt_id: receipt.id,
      raw_text: m.raw_text,
      raw_price_aed: m.raw_price_aed,
      raw_quantity: m.raw_quantity,
      raw_unit: m.raw_unit,
      ingredient_id: m.ingredient_id,
      match_confidence: m.match_confidence,
      match_status: m.match_status,
      normalised_price_aed: m.normalised_price_aed,
    }));

    if (itemRows.length > 0) {
      const { error: itemsError } = await supabase
        .from("receipt_items")
        .insert(itemRows);
      if (itemsError) {
        console.error("Receipt items insert failed:", itemsError);
      }
    }

    // ============================================================
    // 9. AUTO-CREATE DEALS FOR HIGH-CONFIDENCE MATCHES
    // ============================================================
    const autoMatched = matched.filter(
      (m) => m.match_status === "auto_matched" && m.normalised_price_aed
    );

    if (autoMatched.length > 0) {
      const dealRows = autoMatched.map((m) => ({
        user_id: user.id,
        ingredient_id: m.ingredient_id!,
        supermarket: parsedReceipt.supermarket || supermarketHint || "unknown",
        price_aed: m.normalised_price_aed!,
        area: area,
        store_location: parsedReceipt.store_location,
        source: "receipt" as const,
        valid_until: addDays(new Date(), 14).toISOString().slice(0, 10),
      }));

      const { error: dealsError } = await supabase
        .from("user_reported_deals")
        .insert(dealRows);
      if (dealsError) {
        console.error("Deals insert failed:", dealsError);
      }
    }

    // ============================================================
    // 10. UPDATE RECEIPT STATUS
    // ============================================================
    await supabase
      .from("receipts")
      .update({
        status: "parsed",
        supermarket: parsedReceipt.supermarket || supermarketHint,
        total_aed: parsedReceipt.total_aed,
        receipt_date: parsedReceipt.receipt_date,
        store_location: parsedReceipt.store_location,
        parsed_items_count: matched.length,
        matched_items_count: autoMatched.length,
        raw_ocr_response: parsedReceipt as unknown as Record<string, unknown>,
      })
      .eq("id", receipt.id);

    // ============================================================
    // RESPONSE
    // ============================================================
    return NextResponse.json({
      receipt_id: receipt.id,
      parsed_items_count: matched.length,
      matched_items_count: autoMatched.length,
      pending_review_count: matched.filter(
        (m) => m.match_status === "pending"
      ).length,
      total_aed: parsedReceipt.total_aed,
      supermarket: parsedReceipt.supermarket,
    });
  } catch (err) {
    console.error("Unexpected error in /api/receipts/upload:", err);
    return NextResponse.json(
      {
        error: "Something went wrong",
        details: err instanceof Error ? err.message : String(err),
      },
      { status: 500 }
    );
  }
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}
