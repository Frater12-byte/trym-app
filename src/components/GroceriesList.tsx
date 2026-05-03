"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PlusIcon, CloseIcon, CheckIcon } from "./icons";

interface PlanItem {
  ingredient_id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  default_price_aed: number | null;
  meal_count: number;
}

interface ManualItem {
  id: string;
  raw_text: string | null;
  quantity: number | null;
  unit: string | null;
  source: string;
  checked_off: boolean;
  ingredient_id: string | null;
  ingredient:
    | { name: string; category: string; default_price_aed: number | null; default_unit: string }
    | { name: string; category: string; default_price_aed: number | null; default_unit: string }[]
    | null;
}

interface Props {
  planItems: PlanItem[];
  manualItems: ManualItem[];
}

const PRICE_X = 2;

const CATEGORY_ORDER = ["produce", "meat", "fish", "dairy", "bakery", "pantry", "frozen", "spices", "other"];

const CATEGORY_META: Record<string, { emoji: string; color: string }> = {
  produce: { emoji: "🥦", color: "#D8EBE3" },
  meat:    { emoji: "🥩", color: "#FFD9D2" },
  fish:    { emoji: "🐟", color: "#D0E8F0" },
  dairy:   { emoji: "🧀", color: "#FFEFC0" },
  bakery:  { emoji: "🍞", color: "#FFE8DA" },
  pantry:  { emoji: "🫙", color: "#F0E8D8" },
  frozen:  { emoji: "🧊", color: "#D8EAF5" },
  spices:  { emoji: "🌶️", color: "#FFD9D2" },
  other:   { emoji: "🛒", color: "#F5F5F5" },
};

function getIngredientEmoji(name: string): string {
  const n = name.toLowerCase();
  const MAP: [RegExp, string][] = [
    [/chicken|poultry/i, "🍗"],
    [/beef|steak|mince|ground/i, "🥩"],
    [/lamb/i, "🐑"],
    [/salmon|fish|tuna|cod|sea/i, "🐟"],
    [/shrimp|prawn/i, "🦐"],
    [/egg/i, "🥚"],
    [/milk/i, "🥛"],
    [/butter/i, "🧈"],
    [/cheese|halloumi|feta/i, "🧀"],
    [/yogurt|yoghurt|labneh/i, "🥛"],
    [/tomato/i, "🍅"],
    [/onion/i, "🧅"],
    [/garlic/i, "🧄"],
    [/carrot/i, "🥕"],
    [/broccoli/i, "🥦"],
    [/spinach|greens|kale|lettuce/i, "🥬"],
    [/pepper|capsicum/i, "🫑"],
    [/cucumber/i, "🥒"],
    [/avocado/i, "🥑"],
    [/potato/i, "🥔"],
    [/corn|sweetcorn/i, "🌽"],
    [/mushroom/i, "🍄"],
    [/lemon|lime|citrus/i, "🍋"],
    [/apple/i, "🍎"],
    [/banana/i, "🍌"],
    [/olive oil/i, "🫒"],
    [/oil/i, "🫙"],
    [/rice/i, "🍚"],
    [/pasta|noodle|spaghetti|penne/i, "🍝"],
    [/bread|toast|loaf|pita|khubz/i, "🍞"],
    [/flour/i, "🌾"],
    [/sugar/i, "🍬"],
    [/salt/i, "🧂"],
    [/basil|mint|cilantro|parsley|herb/i, "🌿"],
    [/chili|chilli|harissa/i, "🌶️"],
    [/ginger/i, "🫚"],
    [/cream|heavy cream/i, "🥛"],
    [/coconut/i, "🥥"],
    [/chickpea|lentil|bean/i, "🫘"],
    [/quinoa/i, "🌾"],
    [/tofu/i, "🫙"],
    [/soy sauce|soya/i, "🫙"],
    [/honey/i, "🍯"],
    [/nut|almond|cashew/i, "🥜"],
    [/date/i, "🌴"],
  ];
  for (const [re, emoji] of MAP) {
    if (re.test(n)) return emoji;
  }
  return "🛒";
}

interface DisplayItem {
  key: string;
  type: "plan" | "manual";
  name: string;
  category: string;
  quantity: number | null;
  unit: string | null;
  cost: number | null;
  meal_count?: number;
  checked_off?: boolean;
  manual_id?: string;
  emoji: string;
}

interface ItemSheetProps {
  item: DisplayItem;
  onClose: () => void;
  onCheck: () => void;
  onRemove?: () => void;
  busy: boolean;
}

function ItemSheet({ item, onClose, onCheck, onRemove, busy }: ItemSheetProps) {
  const [qty, setQty] = useState(item.quantity?.toString() ?? "");
  const [price, setPrice] = useState(item.cost?.toString() ?? "");

  return (
    <div
      className="fixed inset-0 z-50 bg-ink/40 flex items-end justify-center"
      onClick={onClose}
    >
      <div
        className="bg-cream w-full max-w-lg rounded-t-3xl border-t-2 border-x-2 border-ink p-5 pb-8"
        style={{ boxShadow: "0 -6px 0 #1A1A1A" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-4 mb-5">
          <div
            className="w-16 h-16 rounded-2xl border-2 border-ink flex items-center justify-center text-4xl flex-none"
            style={{ background: CATEGORY_META[item.category]?.color ?? "#F5F5F5" }}
          >
            {item.emoji}
          </div>
          <div className="flex-1">
            <p className="font-display text-2xl capitalize leading-tight">{item.name}</p>
            {item.meal_count ? (
              <p className="text-xs text-ink-mute">For {item.meal_count} meal{item.meal_count > 1 ? "s" : ""}</p>
            ) : null}
          </div>
          <button type="button" onClick={onClose} className="w-9 h-9 rounded-full border-2 border-ink flex items-center justify-center">
            <CloseIcon size={16} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-ink-soft mb-2">
              Quantity
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setQty((v) => String(Math.max(0, (parseFloat(v) || 0) - 1)))}
                className="w-9 h-9 rounded-full border-2 border-ink bg-cream font-bold text-lg"
              >−</button>
              <input
                type="number"
                value={qty}
                onChange={(e) => setQty(e.target.value)}
                className="input flex-1 text-center tabular-nums"
                inputMode="decimal"
                placeholder={item.quantity?.toString() ?? "0"}
              />
              <button
                type="button"
                onClick={() => setQty((v) => String((parseFloat(v) || 0) + 1))}
                className="w-9 h-9 rounded-full border-2 border-ink bg-cream font-bold text-lg"
              >+</button>
            </div>
            {item.unit && <p className="text-xs text-ink-mute mt-1 text-center">{item.unit}</p>}
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-ink-soft mb-2">
              Price (AED)
            </label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="input tabular-nums w-full"
              inputMode="decimal"
              step="0.5"
              placeholder={item.cost?.toFixed(1) ?? "0.0"}
            />
          </div>
        </div>

        <button
          type="button"
          onClick={() => { onCheck(); onClose(); }}
          disabled={busy}
          className={`btn w-full mb-2 ${item.checked_off ? "btn-secondary" : "btn-primary"}`}
        >
          <CheckIcon size={18} />
          {item.checked_off ? "Uncheck" : "✓ Got it"}
        </button>

        {onRemove && (
          <button
            type="button"
            onClick={() => { onRemove(); onClose(); }}
            className="w-full text-sm text-ink-mute hover:text-red-600 transition py-2"
          >
            Remove from list
          </button>
        )}
      </div>
    </div>
  );
}

export function GroceriesList({ planItems, manualItems }: Props) {
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [addingCat, setAddingCat] = useState<string | null>(null); // per-category add
  const [newItemText, setNewItemText] = useState("");
  const [newItemQty, setNewItemQty] = useState("");
  const [newItemUnit, setNewItemUnit] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [checkedPlanIds, setCheckedPlanIds] = useState<Set<string>>(new Set());
  const [hiddenPlanIds, setHiddenPlanIds] = useState<Set<string>>(new Set()); // dismissed plan items
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set()); // bulk select
  const [activeItem, setActiveItem] = useState<DisplayItem | null>(null);
  const [showDoneShopping, setShowDoneShopping] = useState(false);

  // Persist check state and hidden items across navigation
  useEffect(() => {
    try {
      const saved = localStorage.getItem("trym-grocery-checked");
      if (saved) setCheckedPlanIds(new Set(JSON.parse(saved)));
      const hidden = localStorage.getItem("trym-grocery-hidden");
      if (hidden) setHiddenPlanIds(new Set(JSON.parse(hidden)));
    } catch {}
  }, []);

  const grouped: Record<string, DisplayItem[]> = {};

  for (const p of planItems) {
    if (hiddenPlanIds.has(p.ingredient_id)) continue; // dismissed items hidden
    const cat = p.category || "other";
    if (!grouped[cat]) grouped[cat] = [];
    const cost = p.default_price_aed && p.quantity
      ? Math.round(p.default_price_aed * p.quantity * PRICE_X * 100) / 100
      : null;
    grouped[cat].push({
      key: `plan-${p.ingredient_id}`,
      type: "plan",
      name: p.name,
      category: cat,
      quantity: p.quantity,
      unit: p.unit,
      cost,
      meal_count: p.meal_count,
      checked_off: checkedPlanIds.has(p.ingredient_id),
      manual_id: p.ingredient_id,
      emoji: getIngredientEmoji(p.name),
    });
  }

  for (const m of manualItems) {
    const ing = Array.isArray(m.ingredient) ? m.ingredient[0] : m.ingredient;
    const cat = ing?.category || "other";
    if (!grouped[cat]) grouped[cat] = [];
    const name = ing?.name || m.raw_text || "Item";
    const cost = ing?.default_price_aed && m.quantity
      ? Math.round(ing.default_price_aed * m.quantity * PRICE_X * 100) / 100
      : null;
    grouped[cat].push({
      key: `manual-${m.id}`,
      type: "manual",
      name,
      category: cat,
      quantity: m.quantity,
      unit: m.unit,
      cost,
      checked_off: m.checked_off,
      manual_id: m.id,
      emoji: getIngredientEmoji(name),
    });
  }

  const allItems = Object.values(grouped).flat();
  const totalCost = allItems.filter((i) => !i.checked_off).reduce((s, i) => s + (i.cost || 0), 0);
  const totalItems = allItems.length;
  const checkedItems = allItems.filter((i) => i.checked_off).length;

  function dismissPlanItem(id: string) {
    setHiddenPlanIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      try { localStorage.setItem("trym-grocery-hidden", JSON.stringify([...next])); } catch {}
      return next;
    });
  }

  function toggleBulkSelect(key: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  }

  async function bulkCheckOff() {
    const selected = allItems.filter((i) => selectedIds.has(i.key));
    for (const item of selected) {
      if (item.type === "plan" && item.manual_id) {
        setCheckedPlanIds((prev) => {
          const next = new Set(prev);
          next.add(item.manual_id!);
          try { localStorage.setItem("trym-grocery-checked", JSON.stringify([...next])); } catch {}
          return next;
        });
      } else if (item.type === "manual" && item.manual_id) {
        await fetch("/api/groceries/toggle-check", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ item_id: item.manual_id, checked_off: true }),
        });
      }
    }
    setSelectedIds(new Set());
    router.refresh();
  }

  async function bulkRemove() {
    const selected = allItems.filter((i) => selectedIds.has(i.key));
    for (const item of selected) {
      if (item.type === "plan" && item.manual_id) {
        dismissPlanItem(item.manual_id);
      } else if (item.type === "manual" && item.manual_id) {
        await fetch("/api/groceries/remove", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ item_id: item.manual_id }),
        });
      }
    }
    setSelectedIds(new Set());
    router.refresh();
  }

  async function addItemToCategory(category: string) {
    if (!newItemText.trim()) return;
    setError(null);
    try {
      const res = await fetch("/api/groceries/add-manual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ raw_text: newItemText.trim(), quantity: parseFloat(newItemQty) || null, unit: newItemUnit || null, category }),
      });
      if (!res.ok) { const d = await res.json(); setError(d.error || "Could not add"); return; }
      setNewItemText(""); setNewItemQty(""); setNewItemUnit(""); setAddingCat(null);
      router.refresh();
    } catch { setError("Network error"); }
  }

  async function toggleCheck(item: DisplayItem) {
    if (!item.manual_id) return;
    if (item.type === "plan") {
      setCheckedPlanIds((prev) => {
        const next = new Set(prev);
        next.has(item.manual_id!) ? next.delete(item.manual_id!) : next.add(item.manual_id!);
        try { localStorage.setItem("trym-grocery-checked", JSON.stringify([...next])); } catch {}
        return next;
      });
      return;
    }
    setBusyId(item.manual_id);
    try {
      await fetch("/api/groceries/toggle-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ item_id: item.manual_id, checked_off: !item.checked_off }),
      });
      router.refresh();
    } finally { setBusyId(null); }
  }

  async function removeItem(item: DisplayItem) {
    if (item.type !== "manual" || !item.manual_id) return;
    setBusyId(item.manual_id);
    try {
      await fetch("/api/groceries/remove", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ item_id: item.manual_id }),
      });
      router.refresh();
    } finally { setBusyId(null); }
  }

  async function addItem() {
    if (!newItemText.trim()) return;
    setError(null);
    try {
      const res = await fetch("/api/groceries/add-manual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ raw_text: newItemText.trim(), quantity: parseFloat(newItemQty) || null, unit: newItemUnit || null }),
      });
      if (!res.ok) { const d = await res.json(); setError(d.error || "Could not add"); return; }
      setNewItemText(""); setNewItemQty(""); setNewItemUnit(""); setAdding(false);
      router.refresh();
    } catch { setError("Network error"); }
  }

  if (totalItems === 0) {
    return (
      <AddItemSection adding={adding} setAdding={setAdding}
        newItemText={newItemText} setNewItemText={setNewItemText}
        newItemQty={newItemQty} setNewItemQty={setNewItemQty}
        newItemUnit={newItemUnit} setNewItemUnit={setNewItemUnit}
        onAdd={addItem} error={error} />
    );
  }

  return (
    <div>
      {/* Summary */}
      <div className="card mb-5 flex items-center justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-widest font-bold text-ink-mute mb-1">Est. total</p>
          <p className="font-display text-3xl tabular-nums">
            {totalCost.toFixed(1)}<span className="unit">AED</span>
          </p>
        </div>
        <div className="text-right">
          <p className="text-[11px] uppercase tracking-widest font-bold text-ink-mute mb-1">Done</p>
          <p className="font-display text-3xl tabular-nums">
            {checkedItems}<span className="text-base font-normal text-ink-soft">/{totalItems}</span>
          </p>
        </div>
      </div>

      {/* Bulk action bar */}
      {/* Bulk action bar — fixed at bottom so it's always visible while scrolling */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-cream/95 backdrop-blur border-t-2 border-ink px-4 py-3 flex gap-2">
          <button type="button" onClick={bulkCheckOff}
            className="flex-1 btn btn-primary py-3 text-sm">
            ✓ Got {selectedIds.size} item{selectedIds.size > 1 ? "s" : ""}
          </button>
          <button type="button" onClick={bulkRemove}
            className="flex-1 btn btn-secondary py-3 text-sm text-red-700">
            🗑️ Remove {selectedIds.size}
          </button>
          <button type="button" onClick={() => setSelectedIds(new Set())}
            className="px-3 text-ink-mute text-sm font-bold hover:text-ink transition">✕</button>
        </div>
      )}

      {/* Category tile grids */}
      <div className="space-y-6">
        {CATEGORY_ORDER.filter((c) => grouped[c]?.length).map((cat) => {
          const meta = CATEGORY_META[cat] ?? { emoji: "🛒", color: "#F5F5F5" };
          const items = grouped[cat];
          const doneCount = items.filter((i) => i.checked_off).length;

          return (
            <section key={cat}>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-7 h-7 rounded-full border-2 border-ink flex items-center justify-center text-sm flex-none"
                  style={{ background: meta.color, boxShadow: "2px 2px 0 #1A1A1A" }}>
                  {meta.emoji}
                </span>
                <h3 className="font-display text-lg capitalize font-bold">{cat}</h3>
                <span className="text-xs text-ink-mute ml-auto">{doneCount}/{items.length}</span>
              </div>

              {/* Emoji grid */}
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 mb-2">
                {items.map((item) => {
                  const isSelected = selectedIds.has(item.key);
                  return (
                    <div key={item.key} className="relative">
                      {/* Tile — in selection mode, tap anywhere to select */}
                      <button type="button"
                        onClick={() => selectedIds.size > 0 ? toggleBulkSelect(item.key) : setActiveItem(item)}
                        className={`w-full flex flex-col items-center gap-1.5 p-3 rounded-2xl border-2 border-ink transition hover:-translate-y-0.5 text-center ${
                          item.checked_off ? "opacity-40" : ""
                        }`}
                        style={{ background: isSelected ? "#FFF3E8" : item.checked_off ? "#D4E8D8" : "white", boxShadow: isSelected ? "3px 3px 0 #FF6B35" : "3px 3px 0 #1A1A1A" }}>
                        <span className="text-3xl leading-none">{item.emoji}</span>
                        <span className="text-[11px] font-bold leading-tight capitalize line-clamp-2">{item.name}</span>
                        {item.quantity && item.unit && (
                          <span className="text-[10px] text-ink-mute tabular-nums">{item.quantity} {item.unit}</span>
                        )}
                        {item.cost && (
                          <span className="text-[10px] font-semibold text-ink-soft tabular-nums">{item.cost.toFixed(1)} AED</span>
                        )}
                      </button>

                      {/* Top-right: select circle (always visible) */}
                      <button type="button" onClick={() => toggleBulkSelect(item.key)}
                        className={`absolute top-1 right-1 w-5 h-5 rounded-full border-2 flex items-center justify-center transition ${
                          isSelected ? "bg-tangerine border-tangerine" : "bg-white/90 border-ink/30 hover:border-ink"
                        }`}>
                        {isSelected && <CheckIcon size={10} className="text-cream" />}
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Per-category add — empty tile in the grid OR inline form */}
              {addingCat === cat ? (
                <div className="space-y-2 mt-2">
                  <div className="flex gap-2 flex-wrap">
                    <input type="text" value={newItemText} onChange={(e) => setNewItemText(e.target.value)}
                      placeholder="Item name…" className="input flex-1 text-sm min-w-0" autoFocus />
                    <input type="number" value={newItemQty} onChange={(e) => setNewItemQty(e.target.value)}
                      placeholder="Qty" className="input w-16 text-sm tabular-nums" inputMode="decimal" />
                    <select value={newItemUnit} onChange={(e) => setNewItemUnit(e.target.value)} className="input w-20 text-sm">
                      <option value="">Unit</option>
                      {["g","kg","ml","l","piece","pack"].map(u => <option key={u} value={u}>{u}</option>)}
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => addItemToCategory(cat)} disabled={!newItemText.trim()}
                      className="btn btn-primary text-sm py-2 flex-1">Add</button>
                    <button type="button" onClick={() => { setAddingCat(null); setNewItemText(""); setNewItemQty(""); setNewItemUnit(""); }}
                      className="btn btn-secondary text-sm py-2 px-4">Cancel</button>
                  </div>
                </div>
              ) : (
                /* Empty tile that matches the grocery tile style */
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 mt-0">
                  <button type="button" onClick={() => setAddingCat(cat)}
                    className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl border-2 border-dashed border-ink/25 transition hover:-translate-y-0.5 text-center bg-cream/60"
                    style={{ minHeight: 90 }}>
                    <span className="text-2xl opacity-30">+</span>
                    <span className="text-[10px] font-bold text-ink-mute capitalize">Add item</span>
                  </button>
                </div>
              )}
            </section>
          );
        })}
      </div>

      {/* Add item */}
      <div className="mt-6">
        <AddItemSection
          adding={adding} setAdding={setAdding}
          newItemText={newItemText} setNewItemText={setNewItemText}
          newItemQty={newItemQty} setNewItemQty={setNewItemQty}
          newItemUnit={newItemUnit} setNewItemUnit={setNewItemUnit}
          onAdd={addItem} error={error}
        />
      </div>

      {/* Done shopping */}
      <div className="mt-6">
        <button type="button" onClick={() => setShowDoneShopping(true)}
          className="w-full py-4 rounded-3xl border-2 border-ink bg-tangerine text-cream font-display text-xl hover:-translate-y-0.5 transition"
          style={{ boxShadow: "4px 4px 0 #1A1A1A" }}>
          🛒 Done shopping
        </button>
      </div>

      {/* Done shopping modal */}
      {showDoneShopping && (
        <div className="fixed inset-0 z-50 bg-ink/40 flex items-end justify-center" onClick={() => setShowDoneShopping(false)}>
          <div className="bg-cream w-full max-w-lg rounded-t-3xl border-t-2 border-x-2 border-ink p-6 pb-8"
            style={{ boxShadow: "0 -6px 0 #1A1A1A" }}
            onClick={(e) => e.stopPropagation()}>
            <div className="text-center mb-5">
              <p className="text-4xl mb-2">🎉</p>
              <h2 className="font-display text-3xl mb-1">Well done!</h2>
              <p className="text-sm text-ink-soft">
                You checked off {checkedItems} of {totalItems} items.
              </p>
            </div>
            <div className="card-cream mb-4">
              <p className="font-bold text-sm mb-1">📸 Upload your receipt</p>
              <p className="text-xs text-ink-mute mb-3">
                Help us learn real prices in your area. We only read items and prices — nothing personal.
              </p>
              <label className="btn btn-primary w-full cursor-pointer">
                📷 Pick receipt photo
                <input type="file" accept="image/*" className="sr-only"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (!f) return;
                    const fd = new FormData(); fd.append("receipt", f);
                    fetch("/api/receipts/upload", { method: "POST", body: fd });
                    setShowDoneShopping(false);
                  }} />
              </label>
            </div>
            <button type="button" onClick={() => setShowDoneShopping(false)}
              className="w-full text-sm text-ink-mute hover:text-ink text-center py-2">
              Skip for now
            </button>
          </div>
        </div>
      )}

      {/* Tap-to-edit sheet */}
      {activeItem && (
        <ItemSheet
          item={activeItem}
          onClose={() => setActiveItem(null)}
          onCheck={() => toggleCheck(activeItem)}
          onRemove={() => {
            if (activeItem.type === "manual") removeItem(activeItem);
            else if (activeItem.manual_id) dismissPlanItem(activeItem.manual_id);
            setActiveItem(null);
          }}
          busy={busyId === activeItem.manual_id}
        />
      )}
    </div>
  );
}

function AddItemSection({
  adding, setAdding, newItemText, setNewItemText,
  newItemQty, setNewItemQty, newItemUnit, setNewItemUnit,
  onAdd, error,
}: {
  adding: boolean; setAdding: (b: boolean) => void;
  newItemText: string; setNewItemText: (s: string) => void;
  newItemQty: string; setNewItemQty: (s: string) => void;
  newItemUnit: string; setNewItemUnit: (s: string) => void;
  onAdd: () => void; error: string | null;
}) {
  if (!adding) {
    return (
      <button
        type="button"
        onClick={() => setAdding(true)}
        className="w-full flex items-center justify-center gap-2 py-4 rounded-3xl border-2 border-dashed border-ink/40 hover:-translate-y-0.5 transition text-ink-soft font-bold"
      >
        <PlusIcon size={20} /> Add an item
      </button>
    );
  }

  return (
    <div className="card">
      <h3 className="font-display text-lg mb-3">Add item</h3>
      <div className="space-y-3">
        <input type="text" value={newItemText} onChange={(e) => setNewItemText(e.target.value)}
          placeholder="e.g. Eggs, Fresh basil…" className="input" autoFocus />
        <div className="grid grid-cols-2 gap-3">
          <input type="number" value={newItemQty} onChange={(e) => setNewItemQty(e.target.value)}
            placeholder="Quantity" className="input tabular-nums" inputMode="decimal" step="any" />
          <select value={newItemUnit} onChange={(e) => setNewItemUnit(e.target.value)} className="input">
            <option value="">Unit</option>
            {["g", "kg", "ml", "l", "piece", "pack"].map((u) => <option key={u} value={u}>{u}</option>)}
          </select>
        </div>
        {error && (
          <div className="card-sm border-2 text-sm font-semibold"
            style={{ backgroundColor: "var(--color-pill-warn)", color: "var(--color-pill-warn-ink)", borderColor: "var(--color-pill-warn-ink)" }}>
            {error}
          </div>
        )}
        <div className="flex gap-3">
          <button type="button" onClick={() => setAdding(false)} className="btn btn-secondary flex-1">Cancel</button>
          <button type="button" onClick={onAdd} className="btn btn-primary flex-1" disabled={!newItemText.trim()}>
            Add to list
          </button>
        </div>
      </div>
    </div>
  );
}
