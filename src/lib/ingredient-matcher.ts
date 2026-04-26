/**
 * lib/ingredient-matcher.ts
 *
 * Matches receipt items to entries in the ingredients catalog
 * using token-based similarity. Returns confidence score so
 * we can auto-match high-confidence and ask the user for the rest.
 *
 * Strategy:
 *   1. Normalise both strings (lowercase, strip brand prefixes/suffixes)
 *   2. Tokenise into words
 *   3. Score = (matched tokens / max tokens) with boosts for category words
 *   4. Threshold: ≥0.85 = auto_matched, 0.55-0.84 = pending review, <0.55 = no_match
 */

import type { ParsedReceiptItem } from "./receipt-parser";

interface CatalogIngredient {
  id: string;
  name: string;
  default_unit: string;
  default_price_aed: number | null;
  category: string;
}

export interface MatchedItem extends ParsedReceiptItem {
  ingredient_id: string | null;
  match_confidence: number;
  match_status:
    | "auto_matched"
    | "pending"
    | "no_match";
  normalised_price_aed: number | null;
}

const AUTO_MATCH_THRESHOLD = 0.85;
const PENDING_THRESHOLD = 0.55;

// Common brand/filler words to strip
const FILLER_WORDS = new Set([
  "fresh",
  "the",
  "of",
  "in",
  "and",
  "with",
  "premium",
  "organic",
  "natural",
  "pack",
  "packet",
  "bottle",
  "can",
  "tin",
  "jar",
  "box",
  "bag",
  "carrefour",
  "lulu",
  "spinneys",
  "almarai",
  "alain",
  "kfm",
  "carrefour-uae",
  "uae",
]);

function normalise(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenise(s: string): string[] {
  return normalise(s)
    .split(" ")
    .filter((t) => t.length > 1 && !FILLER_WORDS.has(t));
}

function similarity(a: string, b: string): number {
  const tokensA = tokenise(a);
  const tokensB = tokenise(b);
  if (tokensA.length === 0 || tokensB.length === 0) return 0;

  const setA = new Set(tokensA);
  const setB = new Set(tokensB);

  let matched = 0;
  for (const token of setA) {
    if (setB.has(token)) {
      matched++;
      continue;
    }
    // Partial match for short tokens (handles "tomato" vs "tomatoes")
    for (const tb of setB) {
      if (token.length >= 4 && tb.length >= 4) {
        if (token.startsWith(tb) || tb.startsWith(token)) {
          matched += 0.8;
          break;
        }
      }
    }
  }

  const denom = Math.max(setA.size, setB.size);
  return matched / denom;
}

/**
 * Convert a receipt's price to a "price per default catalog unit"
 * for fair comparison.
 *
 * Example:
 *   Catalog: chicken breast, default_unit "g", default_price 0.028 (per g)
 *   Receipt: "CHICKEN BREAST 0.456 kg @ 14.50 AED"
 *   Normalised: 14.50 / 456 = 0.0318 AED/g
 */
function normalisePrice(
  receiptPrice: number,
  receiptQty: number | null,
  receiptUnit: string | null,
  catalogDefaultUnit: string
): number | null {
  if (!receiptQty || !receiptUnit) {
    // Can't normalise without quantity info
    return null;
  }

  // Convert receipt qty to catalog default unit
  let qtyInCatalogUnit = receiptQty;

  const recU = receiptUnit.toLowerCase();
  const catU = catalogDefaultUnit.toLowerCase();

  // Mass conversions
  if (recU === "kg" && catU === "g") qtyInCatalogUnit = receiptQty * 1000;
  else if (recU === "g" && catU === "kg") qtyInCatalogUnit = receiptQty / 1000;
  // Volume conversions
  else if (recU === "l" && catU === "ml") qtyInCatalogUnit = receiptQty * 1000;
  else if (recU === "ml" && catU === "l") qtyInCatalogUnit = receiptQty / 1000;
  // Same unit
  else if (recU === catU) qtyInCatalogUnit = receiptQty;
  // Unknown conversion (e.g., "pack" → "g") — bail
  else return null;

  if (qtyInCatalogUnit <= 0) return null;

  return Math.round((receiptPrice / qtyInCatalogUnit) * 10000) / 10000;
}

export function matchReceiptItems(
  receiptItems: ParsedReceiptItem[],
  catalog: CatalogIngredient[]
): MatchedItem[] {
  return receiptItems.map((item) => {
    let bestMatch: CatalogIngredient | null = null;
    let bestScore = 0;

    for (const ing of catalog) {
      const score = similarity(item.raw_text, ing.name);
      if (score > bestScore) {
        bestScore = score;
        bestMatch = ing;
      }
    }

    let status: MatchedItem["match_status"];
    let ingId: string | null = null;
    let normalised: number | null = null;

    if (bestMatch && bestScore >= AUTO_MATCH_THRESHOLD) {
      status = "auto_matched";
      ingId = bestMatch.id;
      normalised = normalisePrice(
        item.raw_price_aed,
        item.raw_quantity,
        item.raw_unit,
        bestMatch.default_unit
      );
    } else if (bestMatch && bestScore >= PENDING_THRESHOLD) {
      status = "pending";
      ingId = bestMatch.id; // tentative — user will confirm
    } else {
      status = "no_match";
    }

    return {
      ...item,
      ingredient_id: ingId,
      match_confidence: Math.round(bestScore * 100) / 100,
      match_status: status,
      normalised_price_aed: normalised,
    };
  });
}
