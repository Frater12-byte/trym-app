"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { CloseIcon, CheckIcon, PlusIcon } from "./icons";

const FAVORITES_KEY = "trym-food-favorites";

interface Favorite {
  name: string;
  cal: number;
  cost: number;
  mealType: string;
}

function loadFavorites(): Favorite[] {
  try { return JSON.parse(localStorage.getItem(FAVORITES_KEY) ?? "[]"); } catch { return []; }
}

function saveFavorites(favs: Favorite[]) {
  try { localStorage.setItem(FAVORITES_KEY, JSON.stringify(favs.slice(0, 20))); } catch {}
}

const QUICK_PICKS = [
  { name: "Coffee / tea", emoji: "☕", cal: 10, cost: 12 },
  { name: "Protein shake", emoji: "💪", cal: 200, cost: 18 },
  { name: "Fruit / dates", emoji: "🍎", cal: 100, cost: 8 },
  { name: "Nuts / snack bar", emoji: "🥜", cal: 180, cost: 10 },
  { name: "Juice / smoothie", emoji: "🥤", cal: 150, cost: 20 },
  { name: "Yoghurt / labneh", emoji: "🥛", cal: 120, cost: 10 },
  { name: "Toast / bread", emoji: "🍞", cal: 160, cost: 6 },
  { name: "Restaurant meal", emoji: "🍽️", cal: 600, cost: 60 },
];

const MEAL_TYPES = ["breakfast", "lunch", "dinner", "snack"] as const;

interface Props {
  onClose: () => void;
}

export function FoodLogButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="card-cream w-full flex items-center justify-center gap-2 py-4 hover:-translate-y-0.5 transition border-2 border-dashed border-ink/40 rounded-3xl"
      >
        <PlusIcon size={20} className="text-ink-soft" />
        <span className="font-bold text-ink-soft">Log something not in the plan</span>
      </button>
      {open && <FoodLogModal onClose={() => setOpen(false)} />}
    </>
  );
}

function FoodLogModal({ onClose }: Props) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [mealType, setMealType] = useState<string>("snack");
  const [calories, setCalories] = useState("");
  const [cost, setCost] = useState("");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  // Photo attachment
  const photoInputRef = useRef<HTMLInputElement>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  useEffect(() => { setFavorites(loadFavorites()); }, []);

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setPhotoFile(f);
    setPhotoPreview(URL.createObjectURL(f));
  }

  function pickQuick(opt: (typeof QUICK_PICKS)[0] | Favorite) {
    setName("name" in opt ? opt.name : "");
    setCalories(("cal" in opt ? opt.cal : 0).toString());
    setCost(("cost" in opt ? opt.cost : 0).toString());
    if ("mealType" in opt) setMealType(opt.mealType);
  }

  function saveToFavorites() {
    if (!name.trim()) return;
    const fav: Favorite = {
      name: name.trim(),
      cal: parseInt(calories) || 0,
      cost: parseFloat(cost) || 0,
      mealType,
    };
    const updated = [fav, ...favorites.filter((f) => f.name !== fav.name)];
    saveFavorites(updated);
    setFavorites(updated);
  }

  async function save() {
    if (!name.trim()) { setError("Enter a name"); return; }
    setError(null);
    setSaving(true);
    try {
      const res = await fetch("/api/food-log/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          meal_name: name.trim(),
          meal_type: mealType,
          calories: calories ? parseInt(calories) : null,
          cost_aed: cost ? parseFloat(cost) : null,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Could not save"); setSaving(false); return; }

      // If a photo was attached, share to community in parallel
      if (photoFile) {
        const fd = new FormData();
        fd.append("image", photoFile);
        fd.append("meal_name", name.trim());
        if (calories) fd.append("calories", calories);
        // best-effort — don't block the success flow on this
        fetch("/api/community/post", { method: "POST", body: fd }).catch(() => {});
      }

      setSuccess(true);
      setTimeout(() => { onClose(); router.refresh(); }, 1000);
    } catch {
      setError("Network error");
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-ink/40 flex items-end md:items-center justify-center p-0 md:p-4"
      onClick={onClose}
    >
      <div
        className="bg-cream w-full md:max-w-lg md:rounded-3xl border-t-2 md:border-2 border-ink overflow-hidden max-h-[90vh] overflow-y-auto"
        style={{ boxShadow: "6px 6px 0 #1A1A1A" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-cream border-b-2 border-ink px-5 py-4 flex items-center justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-widest font-bold text-ink-mute">
              Log unplanned food
            </p>
            <h3 className="font-display text-xl">What did you have?</h3>
          </div>
          <button type="button" onClick={onClose}
            className="w-9 h-9 rounded-full border-2 border-ink flex items-center justify-center bg-cream">
            <CloseIcon size={18} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {success ? (
            <div className="py-8 text-center">
              <p className="text-4xl mb-3">✓</p>
              <p className="font-display text-2xl">Logged!</p>
            </div>
          ) : (
            <>
              {/* Favorites */}
              {favorites.length > 0 && (
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-ink-soft mb-2">
                    ⭐ Your usuals
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    {favorites.map((f) => (
                      <button
                        key={f.name}
                        type="button"
                        onClick={() => pickQuick(f)}
                        className="px-3 py-2 rounded-xl border-2 border-ink/30 text-xs font-semibold bg-saffron hover:-translate-y-0.5 transition text-ink"
                      >
                        {f.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick picks */}
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-ink-soft mb-2">
                  Quick pick
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {QUICK_PICKS.map((opt) => (
                    <button
                      key={opt.name}
                      type="button"
                      onClick={() => pickQuick(opt)}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 text-sm font-semibold text-left transition hover:-translate-y-0.5 ${
                        name === opt.name ? "border-ink bg-saffron" : "border-ink/30 bg-cream"
                      }`}
                    >
                      <span className="text-lg flex-none">{opt.emoji}</span>
                      <span className="leading-tight">{opt.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="border-t-2 border-cream pt-2">
                <p className="text-xs font-bold uppercase tracking-wider text-ink-soft mb-2">
                  Or type it
                </p>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Avo toast, Takeout burger…"
                  className="input"
                  autoComplete="off"
                />
              </div>

              {/* Meal type */}
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-ink-soft mb-2">
                  Meal type
                </p>
                <div className="flex gap-2 flex-wrap">
                  {MEAL_TYPES.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setMealType(t)}
                      className={`px-4 py-2 rounded-full border-2 text-xs font-bold capitalize transition ${
                        mealType === t
                          ? "border-ink bg-tangerine text-cream"
                          : "border-ink/30 bg-cream text-ink-soft"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Photo attachment */}
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-ink-soft mb-2">
                  📸 Add a photo (optional)
                </p>
                {photoPreview ? (
                  <div className="relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={photoPreview} alt="Food" className="w-full rounded-2xl border-2 border-ink object-cover max-h-44" />
                    <button
                      type="button"
                      onClick={() => { setPhotoFile(null); setPhotoPreview(null); }}
                      className="absolute top-2 right-2 w-7 h-7 rounded-full bg-ink text-cream flex items-center justify-center text-xs"
                    >✕</button>
                    <p className="text-[10px] text-ink-mute mt-1">Will be shared to the community feed</p>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => photoInputRef.current?.click()}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-dashed border-ink/30 text-sm text-ink-mute hover:border-ink transition"
                  >
                    📷 Take or pick a photo
                  </button>
                )}
                <input
                  ref={photoInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="sr-only"
                  onChange={handlePhotoChange}
                />
              </div>

              {/* Calories + cost */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-ink-soft mb-2">
                    Calories (est.)
                  </label>
                  <input
                    type="number"
                    value={calories}
                    onChange={(e) => setCalories(e.target.value)}
                    placeholder="e.g. 350"
                    className="input tabular-nums"
                    inputMode="numeric"
                    min={0}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-ink-soft mb-2">
                    Cost (AED)
                  </label>
                  <input
                    type="number"
                    value={cost}
                    onChange={(e) => setCost(e.target.value)}
                    placeholder="e.g. 25"
                    className="input tabular-nums"
                    inputMode="decimal"
                    min={0}
                    step="0.5"
                  />
                </div>
              </div>

              {error && (
                <div className="card-sm border-2 text-sm font-semibold"
                  style={{ backgroundColor: "var(--color-pill-warn)", color: "var(--color-pill-warn-ink)", borderColor: "var(--color-pill-warn-ink)" }}>
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={saveToFavorites}
                  disabled={!name.trim()}
                  className="btn btn-secondary flex-none"
                  title="Save to favourites"
                >
                  ⭐
                </button>
                <button
                  type="button"
                  onClick={save}
                  disabled={saving || !name.trim()}
                  className="btn btn-primary flex-1"
                >
                  {saving ? "Saving…" : "Log it"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
