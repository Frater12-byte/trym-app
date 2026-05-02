"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckIcon, PlusIcon, CloseIcon } from "./icons";

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
  produce:  { emoji: "🥦", color: "#D8EBE3" },
  meat:     { emoji: "🥩", color: "#FFD9D2" },
  fish:     { emoji: "🐟", color: "#D0E8F0" },
  dairy:    { emoji: "🧀", color: "#FFEFC0" },
  bakery:   { emoji: "🍞", color: "#FFE8DA" },
  pantry:   { emoji: "🫙", color: "#F0E8D8" },
  frozen:   { emoji: "🧊", color: "#D8EAF5" },
  spices:   { emoji: "🌶️", color: "#FFD9D2" },
  other:    { emoji: "🛒", color: "#F0F0F0" },
};

export function GroceriesList({ planItems, manualItems }: Props) {
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [newItemText, setNewItemText] = useState("");
  const [newItemQty, setNewItemQty] = useState("");
  const [newItemUnit, setNewItemUnit] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [checkedPlanIds, setCheckedPlanIds] = useState<Set<string>>(new Set());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editQty, setEditQty] = useState("");
  const [editPrice, setEditPrice] = useState("");

  function togglePlanCheck(id: string) {
    setCheckedPlanIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  type DisplayItem = {
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
  };

  const grouped: Record<string, DisplayItem[]> = {};

  for (const p of planItems) {
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
    });
  }

  const allItems = Object.values(grouped).flat();
  const totalCost = allItems.filter((i) => !i.checked_off).reduce((s, i) => s + (i.cost || 0), 0);
  const totalItems = allItems.length;
  const checkedItems = allItems.filter((i) => i.checked_off).length;

  async function addItem() {
    if (!newItemText.trim()) return;
    setError(null);
    try {
      const res = await fetch("/api/groceries/add-manual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          raw_text: newItemText.trim(),
          quantity: parseFloat(newItemQty) || null,
          unit: newItemUnit || null,
        }),
      });
      if (!res.ok) { const d = await res.json(); setError(d.error || "Could not add"); return; }
      setNewItemText(""); setNewItemQty(""); setNewItemUnit(""); setAdding(false);
      router.refresh();
    } catch { setError("Network error"); }
  }

  async function toggleCheck(item: DisplayItem) {
    if (!item.manual_id) return;
    if (item.type === "plan") { togglePlanCheck(item.manual_id); return; }
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

  if (totalItems === 0) {
    return <AddItemSection adding={adding} setAdding={setAdding} newItemText={newItemText} setNewItemText={setNewItemText} newItemQty={newItemQty} setNewItemQty={setNewItemQty} newItemUnit={newItemUnit} setNewItemUnit={setNewItemUnit} onAdd={addItem} error={error} />;
  }

  return (
    <div>
      {/* Summary bar */}
      <div className="card mb-5 flex items-center justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-widest font-bold text-ink-mute mb-1">Estimated total</p>
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

      {/* Category sections */}
      <div className="space-y-4">
        {CATEGORY_ORDER.filter((c) => grouped[c]?.length).map((cat) => {
          const meta = CATEGORY_META[cat] ?? { emoji: "🛒", color: "#F0F0F0" };
          const items = grouped[cat];
          const doneCount = items.filter((i) => i.checked_off).length;

          return (
            <section key={cat}>
              {/* Category header */}
              <div className="flex items-center gap-2 mb-2 px-1">
                <span
                  className="w-8 h-8 rounded-full flex items-center justify-center text-base border-2 border-ink flex-none"
                  style={{ background: meta.color, boxShadow: "2px 2px 0 #1A1A1A" }}
                >
                  {meta.emoji}
                </span>
                <h3 className="font-display text-lg capitalize font-bold">{cat}</h3>
                <span className="text-xs text-ink-mute ml-auto tabular-nums">
                  {doneCount}/{items.length}
                </span>
              </div>

              {/* Items */}
              <div
                className="rounded-3xl overflow-hidden border-2 border-ink"
                style={{ boxShadow: "4px 4px 0 #1A1A1A", background: "#FFFFFF" }}
              >
                {items.map((item, idx) => (
                  <div
                    key={item.key}
                    className={`flex items-center gap-3 px-4 py-3.5 transition ${
                      item.checked_off ? "opacity-40" : ""
                    } ${idx < items.length - 1 ? "border-b-2 border-cream" : ""}`}
                  >
                    {/* Big tap target checkbox */}
                    <button
                      type="button"
                      onClick={() => toggleCheck(item)}
                      disabled={busyId === item.manual_id}
                      className={`flex-none w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                        item.checked_off
                          ? "bg-green border-green text-cream"
                          : item.type === "plan"
                          ? "border-dashed border-ink/40 bg-cream"
                          : "border-ink bg-cream"
                      }`}
                      aria-label={item.checked_off ? "Uncheck" : "Check off"}
                    >
                      {item.checked_off && <CheckIcon size={16} />}
                    </button>

                    {/* Name + meta */}
                    <div className="flex-1 min-w-0">
                      <p className={`font-bold text-sm capitalize ${item.checked_off ? "line-through" : ""}`}>
                        {item.name}
                      </p>
                      {/* Inline editing for quantity */}
                      {editingId === item.key ? (
                        <div className="flex gap-2 mt-1">
                          <input
                            type="number"
                            value={editQty}
                            onChange={(e) => setEditQty(e.target.value)}
                            className="w-16 text-xs border border-ink/30 rounded-lg px-2 py-1 tabular-nums"
                            autoFocus
                            placeholder={item.quantity?.toString()}
                          />
                          <input
                            type="number"
                            value={editPrice}
                            onChange={(e) => setEditPrice(e.target.value)}
                            className="w-20 text-xs border border-ink/30 rounded-lg px-2 py-1 tabular-nums"
                            placeholder="Price AED"
                          />
                          <button
                            type="button"
                            onClick={() => setEditingId(null)}
                            className="text-xs font-bold text-tangerine"
                          >
                            Done
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingId(item.key);
                            setEditQty(item.quantity?.toString() ?? "");
                            setEditPrice(item.cost?.toString() ?? "");
                          }}
                          className="text-xs text-ink-mute tabular-nums hover:text-tangerine transition text-left"
                        >
                          {item.quantity && item.unit ? `${item.quantity} ${item.unit}` : ""}
                          {item.meal_count && item.meal_count > 0
                            ? ` · ${item.meal_count} meal${item.meal_count > 1 ? "s" : ""}`
                            : ""}
                          {(!item.quantity && !item.meal_count) ? "tap to set qty" : ""}
                        </button>
                      )}
                    </div>

                    {/* Cost */}
                    {item.cost !== null && (
                      <p className="text-sm font-bold tabular-nums text-ink-soft flex-none">
                        {item.cost.toFixed(1)}<span className="text-[10px] text-ink-mute ml-0.5">AED</span>
                      </p>
                    )}

                    {/* Remove (manual only) */}
                    {item.type === "manual" && (
                      <button
                        type="button"
                        onClick={() => removeItem(item)}
                        disabled={busyId === item.manual_id}
                        className="flex-none w-7 h-7 rounded-full text-ink-mute hover:text-red-500 flex items-center justify-center transition"
                        aria-label="Remove"
                      >
                        <CloseIcon size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </div>

      {/* Add item */}
      <div className="mt-5">
        <AddItemSection
          adding={adding} setAdding={setAdding}
          newItemText={newItemText} setNewItemText={setNewItemText}
          newItemQty={newItemQty} setNewItemQty={setNewItemQty}
          newItemUnit={newItemUnit} setNewItemUnit={setNewItemUnit}
          onAdd={addItem} error={error}
        />
      </div>
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
        <input
          type="text"
          value={newItemText}
          onChange={(e) => setNewItemText(e.target.value)}
          placeholder="e.g. Eggs, Fresh basil, Sourdough…"
          className="input"
          autoFocus
        />
        <div className="grid grid-cols-2 gap-3">
          <input
            type="number"
            value={newItemQty}
            onChange={(e) => setNewItemQty(e.target.value)}
            placeholder="Quantity"
            className="input tabular-nums"
            inputMode="decimal"
            step="any"
          />
          <select value={newItemUnit} onChange={(e) => setNewItemUnit(e.target.value)} className="input">
            <option value="">Unit</option>
            {["g", "kg", "ml", "l", "piece", "pack"].map((u) => (
              <option key={u} value={u}>{u}</option>
            ))}
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
