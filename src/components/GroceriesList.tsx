"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckIcon, PlusIcon, CloseIcon, CoinIcon } from "./icons";

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
    | {
        name: string;
        category: string;
        default_price_aed: number | null;
        default_unit: string;
      }
    | { name: string; category: string; default_price_aed: number | null; default_unit: string }[]
    | null;
}

interface Props {
  planItems: PlanItem[];
  manualItems: ManualItem[];
}

const CATEGORY_ORDER = [
  "produce",
  "meat",
  "fish",
  "dairy",
  "bakery",
  "pantry",
  "frozen",
  "spices",
  "other",
];

const PRICE_X = 2; // market price adjustment

export function GroceriesList({ planItems, manualItems }: Props) {
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [newItemText, setNewItemText] = useState("");
  const [newItemQty, setNewItemQty] = useState("");
  const [newItemUnit, setNewItemUnit] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Plan items are checked client-side only (resets on page reload — intentional for shopping trips)
  const [checkedPlanIds, setCheckedPlanIds] = useState<Set<string>>(new Set());

  function togglePlanCheck(ingredientId: string) {
    setCheckedPlanIds((prev) => {
      const next = new Set(prev);
      if (next.has(ingredientId)) next.delete(ingredientId);
      else next.add(ingredientId);
      return next;
    });
  }

  // Group all items by category
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
    const cost =
      p.default_price_aed && p.quantity
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
    const cost =
      ing?.default_price_aed && m.quantity
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
  const totalCost = allItems
    .filter((i) => !i.checked_off)
    .reduce((s, i) => s + (i.cost || 0), 0);
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
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Could not add");
        return;
      }
      setNewItemText("");
      setNewItemQty("");
      setNewItemUnit("");
      setAdding(false);
      router.refresh();
    } catch {
      setError("Network error");
    }
  }

  async function toggleCheck(item: DisplayItem) {
    if (!item.manual_id) return;
    if (item.type === "plan") {
      togglePlanCheck(item.manual_id);
      return;
    }
    setBusyId(item.manual_id);
    try {
      await fetch(`/api/groceries/toggle-check`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          item_id: item.manual_id,
          checked_off: !item.checked_off,
        }),
      });
      router.refresh();
    } finally {
      setBusyId(null);
    }
  }

  async function removeItem(item: DisplayItem) {
    if (item.type !== "manual" || !item.manual_id) return;
    setBusyId(item.manual_id);
    try {
      await fetch(`/api/groceries/remove`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ item_id: item.manual_id }),
      });
      router.refresh();
    } finally {
      setBusyId(null);
    }
  }

  if (totalItems === 0) {
    return (
      <div>
        <AddItemForm
          adding={adding}
          setAdding={setAdding}
          newItemText={newItemText}
          setNewItemText={setNewItemText}
          newItemQty={newItemQty}
          setNewItemQty={setNewItemQty}
          newItemUnit={newItemUnit}
          setNewItemUnit={setNewItemUnit}
          onAdd={addItem}
          error={error}
        />
      </div>
    );
  }

  return (
    <div>
      {/* Summary header */}
      <div className="card mb-5 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-widest font-bold text-ink-mute mb-1">
            Total
          </p>
          <p className="font-display text-3xl tabular-nums">
            {totalCost.toFixed(1)}
            <span className="unit">AED</span>
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs uppercase tracking-widest font-bold text-ink-mute mb-1">
            Items
          </p>
          <p className="font-display text-3xl tabular-nums">
            {checkedItems}
            <span className="text-base font-normal text-ink-soft">
              /{totalItems}
            </span>
          </p>
        </div>
      </div>

      {/* Category-grouped list */}
      <div className="space-y-4">
        {CATEGORY_ORDER.filter((c) => grouped[c]?.length).map((cat) => (
          <section key={cat} className="card">
            <h3 className="font-display text-xl mb-3 capitalize">{cat}</h3>
            <ul className="space-y-1">
              {grouped[cat].map((item) => (
                <ItemRow
                  key={item.key}
                  item={item}
                  busy={busyId === item.manual_id}
                  onToggleCheck={() => toggleCheck(item)}
                  onRemove={() => removeItem(item)}
                />
              ))}
            </ul>
          </section>
        ))}
      </div>

      {/* Add manual item */}
      <div className="mt-5">
        <AddItemForm
          adding={adding}
          setAdding={setAdding}
          newItemText={newItemText}
          setNewItemText={setNewItemText}
          newItemQty={newItemQty}
          setNewItemQty={setNewItemQty}
          newItemUnit={newItemUnit}
          setNewItemUnit={setNewItemUnit}
          onAdd={addItem}
          error={error}
        />
      </div>
    </div>
  );
}

function ItemRow({
  item,
  busy,
  onToggleCheck,
  onRemove,
}: {
  item: {
    name: string;
    quantity: number | null;
    unit: string | null;
    cost: number | null;
    meal_count?: number;
    type: "plan" | "manual";
    checked_off?: boolean;
    manual_id?: string;
  };
  busy: boolean;
  onToggleCheck: () => void;
  onRemove: () => void;
}) {
  return (
    <li
      className={`flex items-center gap-3 py-2.5 border-b-2 border-cream last:border-0 ${
        item.checked_off ? "opacity-50" : ""
      }`}
    >
      <button
        type="button"
        onClick={onToggleCheck}
        disabled={busy}
        className={`flex-none w-7 h-7 rounded-full border-2 flex items-center justify-center transition ${
          item.checked_off
            ? "bg-green text-cream border-green"
            : item.type === "plan"
            ? "border-dashed border-ink/40 bg-cream"
            : "border-ink bg-cream"
        }`}
        aria-label={item.checked_off ? "Uncheck" : "Check off"}
      >
        {item.checked_off && <CheckIcon size={16} />}
      </button>

      <div className="flex-1 min-w-0">
        <p
          className={`font-bold capitalize ${
            item.checked_off ? "line-through" : ""
          }`}
        >
          {item.name}
        </p>
        <p className="text-xs text-ink-mute tabular-nums">
          {item.quantity && item.unit
            ? `${item.quantity} ${item.unit}`
            : ""}
          {item.meal_count !== undefined && item.meal_count > 0 && (
            <>
              {item.quantity && " · "}
              for {item.meal_count} {item.meal_count === 1 ? "meal" : "meals"}
            </>
          )}
        </p>
      </div>

      {item.cost !== null && (
        <p className="text-sm font-bold tabular-nums text-ink-soft">
          {item.cost.toFixed(1)}
          <span className="text-[10px] text-ink-mute ml-1">AED</span>
        </p>
      )}

      {item.type === "manual" && (
        <button
          type="button"
          onClick={onRemove}
          disabled={busy}
          className="flex-none w-7 h-7 rounded-full text-ink-mute hover:text-pill-warn-ink flex items-center justify-center"
          aria-label="Remove"
        >
          <CloseIcon size={16} />
        </button>
      )}
    </li>
  );
}

function AddItemForm({
  adding,
  setAdding,
  newItemText,
  setNewItemText,
  newItemQty,
  setNewItemQty,
  newItemUnit,
  setNewItemUnit,
  onAdd,
  error,
}: {
  adding: boolean;
  setAdding: (b: boolean) => void;
  newItemText: string;
  setNewItemText: (s: string) => void;
  newItemQty: string;
  setNewItemQty: (s: string) => void;
  newItemUnit: string;
  setNewItemUnit: (s: string) => void;
  onAdd: () => void;
  error: string | null;
}) {
  if (!adding) {
    return (
      <button
        type="button"
        onClick={() => setAdding(true)}
        className="card-cream w-full flex items-center justify-center gap-2 py-4 hover:-translate-y-1 transition"
      >
        <PlusIcon size={20} />
        <span className="font-bold">Add an item</span>
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
          placeholder="e.g. Eggs, Fresh basil, Sourdough loaf"
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
          <select
            value={newItemUnit}
            onChange={(e) => setNewItemUnit(e.target.value)}
            className="input"
          >
            <option value="">Unit</option>
            <option value="g">g</option>
            <option value="kg">kg</option>
            <option value="ml">ml</option>
            <option value="l">l</option>
            <option value="piece">piece</option>
            <option value="pack">pack</option>
          </select>
        </div>
        {error && (
          <div
            className="card-sm border-2 text-sm font-semibold"
            style={{
              backgroundColor: "var(--color-pill-warn)",
              color: "var(--color-pill-warn-ink)",
              borderColor: "var(--color-pill-warn-ink)",
            }}
          >
            {error}
          </div>
        )}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setAdding(false)}
            className="btn btn-secondary flex-1"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onAdd}
            className="btn btn-primary flex-1"
            disabled={!newItemText.trim()}
          >
            Add to list
          </button>
        </div>
      </div>
    </div>
  );
}
