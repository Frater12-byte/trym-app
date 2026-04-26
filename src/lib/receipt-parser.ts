/**
 * lib/receipt-parser.ts
 *
 * Sends a receipt image to gpt-4o-mini vision and returns structured JSON.
 * Uses OpenAI's strict json_schema output for reliability.
 */

import OpenAI from "openai";

export interface ParsedReceiptItem {
  raw_text: string;
  raw_price_aed: number;
  raw_quantity: number | null;
  raw_unit: string | null;
}

export interface ParsedReceipt {
  supermarket: string | null;
  store_location: string | null;
  receipt_date: string | null; // YYYY-MM-DD
  total_aed: number | null;
  items: ParsedReceiptItem[];
}

const RECEIPT_SCHEMA = {
  type: "object",
  properties: {
    supermarket: {
      type: ["string", "null"],
      description:
        "Detected supermarket: 'carrefour', 'lulu', 'spinneys', 'kibsons', 'choithrams', 'union_coop', or 'other'. Null if unclear.",
    },
    store_location: {
      type: ["string", "null"],
      description:
        "Specific store branch or mall if visible (e.g., 'Mall of Emirates', 'Dubai Marina Mall'). Null otherwise.",
    },
    receipt_date: {
      type: ["string", "null"],
      description: "Receipt date in YYYY-MM-DD format. Null if unreadable.",
    },
    total_aed: {
      type: ["number", "null"],
      description: "The grand total in AED. Null if unclear.",
    },
    items: {
      type: "array",
      items: {
        type: "object",
        properties: {
          raw_text: {
            type: "string",
            description: "Item name exactly as it appears on the receipt.",
          },
          raw_price_aed: {
            type: "number",
            description: "Final price paid for this line item in AED.",
          },
          raw_quantity: {
            type: ["number", "null"],
            description:
              "Numeric quantity if shown (e.g., 0.5, 1, 2). Null if not visible.",
          },
          raw_unit: {
            type: ["string", "null"],
            description:
              "Unit if shown: 'g', 'kg', 'ml', 'l', 'piece', 'pack'. Null otherwise.",
          },
        },
        required: ["raw_text", "raw_price_aed", "raw_quantity", "raw_unit"],
        additionalProperties: false,
      },
    },
  },
  required: ["supermarket", "store_location", "receipt_date", "total_aed", "items"],
  additionalProperties: false,
} as const;

const SYSTEM_PROMPT = `You are a precise receipt parser for a Dubai meal-planning app.

You receive a single receipt image. Your job:

1. Identify the supermarket if possible (Carrefour, Lulu, Spinneys, Kibsons, Choithrams, Union Coop, etc.)
2. Find the date and grand total if visible.
3. Extract every food item line. Skip non-food items (cleaning supplies, toiletries, plastic bags).
4. For each item:
   - raw_text = the item name EXACTLY as printed (don't translate or normalise)
   - raw_price_aed = the final paid price for that line in AED (after discounts if shown)
   - raw_quantity / raw_unit = if a weight or count is visible (e.g. "0.456 kg" or "x2"), capture it; otherwise null

5. Be conservative — only include lines you're confident are food items with clear prices.
6. Always return all required fields. Use null when truly unknown rather than guessing.
7. If the image is not a receipt or unreadable, return an empty items array.

Return ONLY JSON matching the schema. No commentary.`;

export async function parseReceipt(
  openai: OpenAI,
  imageDataUrl: string,
  supermarketHint?: string | null
): Promise<ParsedReceipt> {
  const userPrompt = supermarketHint
    ? `Parse this receipt. Hint: the user says this is from ${supermarketHint}.`
    : `Parse this receipt.`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.1, // low temp for accuracy
    max_tokens: 4000,
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "parsed_receipt",
        strict: true,
        schema: RECEIPT_SCHEMA,
      },
    },
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: [
          { type: "text", text: userPrompt },
          {
            type: "image_url",
            image_url: { url: imageDataUrl, detail: "high" },
          },
        ],
      },
    ],
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) {
    throw new Error("Empty response from OCR");
  }

  const parsed = JSON.parse(content) as ParsedReceipt;

  // Sanity check
  if (!Array.isArray(parsed.items)) {
    throw new Error("Invalid receipt parse: items missing");
  }

  return parsed;
}
