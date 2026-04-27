"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  unit: "kg" | "lbs";
  todayLogged: boolean;
  placeholder: string;
  today: string;
}

export function WeightLogForm({
  unit,
  todayLogged,
  placeholder,
  today,
}: Props) {
  const router = useRouter();
  const [weight, setWeight] = useState("");
  const [mood, setMood] = useState<"great" | "ok" | "meh" | "">("");
  const [notes, setNotes] = useState("");
  const [date, setDate] = useState(today);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const weightNum = parseFloat(weight);
    if (!weightNum || weightNum < 30 || weightNum > 400) {
      setError("Enter a sensible weight value.");
      setLoading(false);
      return;
    }

    // Convert lbs → kg for storage
    const weightKg =
      unit === "lbs" ? +(weightNum / 2.20462).toFixed(2) : weightNum;

    try {
      const res = await fetch("/api/weight/log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          weight_kg: weightKg,
          mood: mood || null,
          notes: notes || null,
          logged_at: date,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not save your weight.");
        setLoading(false);
        return;
      }

      setSuccess(true);
      setWeight("");
      setMood("");
      setNotes("");
      setLoading(false);
      router.refresh();

      // Hide success after 3s
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      setError("Something went wrong. Try again.");
      setLoading(false);
    }
  }

  return (
    <div className="card-tangerine">
      <h2 className="font-display text-2xl lg:text-3xl mb-2">
        {todayLogged ? "Already logged today." : "What's the number?"}
      </h2>
      <p className="text-sm opacity-90 mb-5">
        {todayLogged
          ? "You can log a different date or update an existing entry below."
          : "Quick check-in. We'll plot it on your trend."}
      </p>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-[1fr_auto] gap-3 items-end">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-2 opacity-80">
              Weight ({unit})
            </label>
            <input
              type="number"
              step={unit === "kg" ? "0.1" : "1"}
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder={placeholder}
              className="input bg-cream text-ink"
              required
              autoFocus
              inputMode="decimal"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-2 opacity-80">
              Date
            </label>
            <input
              type="date"
              value={date}
              max={today}
              onChange={(e) => setDate(e.target.value)}
              className="input bg-cream text-ink"
            />
          </div>
        </div>

        {/* Mood selector */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider mb-2 opacity-80">
            Feeling? (optional)
          </label>
          <div className="flex gap-2">
            {(
              [
                { val: "great", emoji: "😄", label: "Great" },
                { val: "ok", emoji: "🙂", label: "OK" },
                { val: "meh", emoji: "😐", label: "Meh" },
              ] as const
            ).map((m) => (
              <button
                key={m.val}
                type="button"
                onClick={() => setMood(mood === m.val ? "" : m.val)}
                className={`flex-1 py-3 rounded-2xl border-2 border-ink font-bold transition ${
                  mood === m.val
                    ? "bg-saffron text-ink"
                    : "bg-cream text-ink-soft hover:bg-peach"
                }`}
                style={{ boxShadow: "3px 3px 0 #1A1A1A" }}
              >
                <span className="text-2xl block mb-1">{m.emoji}</span>
                <span className="text-xs">{m.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider mb-2 opacity-80">
            Notes (optional)
          </label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. After holiday, post-workout..."
            className="input bg-cream text-ink"
            maxLength={140}
          />
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

        {success && (
          <div
            className="card-sm border-2 text-sm font-semibold"
            style={{
              backgroundColor: "var(--color-pill-success)",
              color: "var(--color-green)",
              borderColor: "var(--color-green)",
            }}
          >
            Saved. Nice work.
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="btn btn-saffron w-full"
        >
          {loading ? "Saving..." : "Save weight →"}
        </button>
      </form>
    </div>
  );
}
