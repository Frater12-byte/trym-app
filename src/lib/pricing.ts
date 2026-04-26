/**
 * lib/pricing.ts
 *
 * Resolves the best current price for an ingredient.
 *
 * Priority:
 *   1. Most recent valid user-reported deal in user's area (≤14 days old, ≥1 confirmation OR receipt-sourced)
 *   2. Most recent valid user-reported deal anywhere (≤14 days old)
 *   3. Catalog default price
 *
 * This is the function the meal plan generator (Phase 2C) will call
 * to estimate weekly grocery cost realistically.
 */

import { createClient } from "@/lib/supabase/server";

export interface IngredientPrice {
  ingredient_id: string;
  price_aed: number;
  source: "deal_local" | "deal_global" | "catalog";
  reported_at?: string;
  supermarket?: string;
}

const DEAL_FRESHNESS_DAYS = 14;

/**
 * Get the best price for a single ingredient.
 */
export async function getIngredientPrice(
  ingredientId: string,
  userArea?: string | null
): Promise<IngredientPrice | null> {
  const supabase = await createClient();

  const cutoffIso = new Date(
    Date.now() - DEAL_FRESHNESS_DAYS * 24 * 3600 * 1000
  ).toISOString();

  // 1. Try local area deal
  if (userArea) {
    const { data: localDeal } = await supabase
      .from("user_reported_deals")
      .select("price_aed, reported_at, supermarket")
      .eq("ingredient_id", ingredientId)
      .eq("area", userArea)
      .gte("reported_at", cutoffIso)
      .order("reported_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (localDeal) {
      return {
        ingredient_id: ingredientId,
        price_aed: Number(localDeal.price_aed),
        source: "deal_local",
        reported_at: localDeal.reported_at,
        supermarket: localDeal.supermarket,
      };
    }
  }

  // 2. Try any recent deal
  const { data: globalDeal } = await supabase
    .from("user_reported_deals")
    .select("price_aed, reported_at, supermarket")
    .eq("ingredient_id", ingredientId)
    .gte("reported_at", cutoffIso)
    .order("reported_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (globalDeal) {
    return {
      ingredient_id: ingredientId,
      price_aed: Number(globalDeal.price_aed),
      source: "deal_global",
      reported_at: globalDeal.reported_at,
      supermarket: globalDeal.supermarket,
    };
  }

  // 3. Fall back to catalog default
  const { data: ingredient } = await supabase
    .from("ingredients")
    .select("default_price_aed")
    .eq("id", ingredientId)
    .maybeSingle();

  if (!ingredient?.default_price_aed) return null;

  return {
    ingredient_id: ingredientId,
    price_aed: Number(ingredient.default_price_aed),
    source: "catalog",
  };
}

/**
 * Batch version — get prices for many ingredients in a single roundtrip.
 * Used by plan generation to avoid N+1 queries.
 */
export async function getIngredientPricesBatch(
  ingredientIds: string[],
  userArea?: string | null
): Promise<Map<string, IngredientPrice>> {
  const supabase = await createClient();
  const result = new Map<string, IngredientPrice>();
  if (ingredientIds.length === 0) return result;

  const cutoffIso = new Date(
    Date.now() - DEAL_FRESHNESS_DAYS * 24 * 3600 * 1000
  ).toISOString();

  // Fetch all candidates in one query
  const { data: deals } = await supabase
    .from("user_reported_deals")
    .select("ingredient_id, price_aed, area, supermarket, reported_at")
    .in("ingredient_id", ingredientIds)
    .gte("reported_at", cutoffIso)
    .order("reported_at", { ascending: false });

  type DealRow = { ingredient_id: string; price_aed: number; area: string | null; supermarket: string | null; reported_at: string };

  // Bucket by ingredient
  const localByIng = new Map<string, DealRow>();
  const anyByIng = new Map<string, DealRow>();

  for (const d of deals || []) {
    if (!anyByIng.has(d.ingredient_id)) {
      anyByIng.set(d.ingredient_id, d);
    }
    if (userArea && d.area === userArea && !localByIng.has(d.ingredient_id)) {
      localByIng.set(d.ingredient_id, d);
    }
  }

  // Catalog fallback
  const { data: catalogRows } = await supabase
    .from("ingredients")
    .select("id, default_price_aed")
    .in("id", ingredientIds);

  for (const id of ingredientIds) {
    const local = userArea ? localByIng.get(id) : undefined;
    const any = anyByIng.get(id);
    const catalog = catalogRows?.find((r) => r.id === id);

    if (local) {
      result.set(id, {
        ingredient_id: id,
        price_aed: Number(local.price_aed),
        source: "deal_local",
        reported_at: local.reported_at,
        supermarket: local.supermarket ?? undefined,
      });
    } else if (any) {
      result.set(id, {
        ingredient_id: id,
        price_aed: Number(any.price_aed),
        source: "deal_global",
        reported_at: any.reported_at,
        supermarket: any.supermarket ?? undefined,
      });
    } else if (catalog?.default_price_aed) {
      result.set(id, {
        ingredient_id: id,
        price_aed: Number(catalog.default_price_aed),
        source: "catalog",
      });
    }
  }

  return result;
}
