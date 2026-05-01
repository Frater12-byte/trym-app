"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FootIcon, DumbbellIcon, HeartIcon } from "./icons";

interface ExistingLog {
  steps_count: number | null;
  exercise_minutes: number | null;
  exercise_type: string | null;
  exercise_intensity: string | null;
  energy_level: number | null;
  notes: string | null;
}

interface Props {
  today: string;
  existingLog: ExistingLog | null;
}

const EXERCISE_TYPES = [
  { val: "walking", label: "Walking" },
  { val: "cardio", label: "Cardio" },
  { val: "strength", label: "Strength" },
  { val: "yoga", label: "Yoga" },
  { val: "sport", label: "Sport" },
  { val: "other", label: "Other" },
];

export function ActivityForm({ today, existingLog }: Props) {
  const router = useRouter();
  const [steps, setSteps] = useState(
    existingLog?.steps_count?.toString() ?? ""
  );
  const [exerciseMin, setExerciseMin] = useState(
    existingLog?.exercise_minutes?.toString() ?? ""
  );
  const [exerciseType, setExerciseType] = useState(
    existingLog?.exercise_type ?? ""
  );
  const [intensity, setIntensity] = useState(
    existingLog?.exercise_intensity ?? ""
  );
  const [energy, setEnergy] = useState(existingLog?.energy_level ?? 0);
  const [notes, setNotes] = useState(existingLog?.notes ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function save() {
    setError(null);
    setSaving(true);
    setSuccess(false);

    const stepsNum = steps ? parseInt(steps) : null;
    const minNum = exerciseMin ? parseInt(exerciseMin) : null;

    if (stepsNum !== null && (stepsNum < 0 || stepsNum > 100000)) {
      setError("Steps must be 0-100000");
      setSaving(false);
      return;
    }
    if (minNum !== null && (minNum < 0 || minNum > 600)) {
      setError("Exercise minutes must be 0-600");
      setSaving(false);
      return;
    }

    try {
      const res = await fetch("/api/activity/log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          logged_at: today,
          steps_count: stepsNum,
          exercise_minutes: minNum,
          exercise_type: exerciseType || null,
          exercise_intensity: intensity || null,
          energy_level: energy || null,
          notes: notes || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not save");
        setSaving(false);
        return;
      }

      setSuccess(true);
      setSaving(false);
      router.refresh();
      setTimeout(() => setSuccess(false), 2500);
    } catch {
      setError("Network error");
      setSaving(false);
    }
  }

  return (
    <div className="card-tangerine">
      <h2 className="font-display text-2xl lg:text-3xl mb-2">
        {existingLog ? "Update today" : "Log today"}
      </h2>
      <p className="text-sm opacity-90 mb-5">
        Just rough numbers. Skip anything that doesn&apos;t apply.
      </p>

      <div className="space-y-4">
        {/* Steps */}
        <div>
          <label className="flex items-center gap-2 text-sm font-bold mb-2">
            <FootIcon size={16} />
            Steps
          </label>
          <input
            type="number"
            value={steps}
            onChange={(e) => setSteps(e.target.value)}
            placeholder="e.g. 7500"
            className="input bg-cream text-ink"
            inputMode="numeric"
            min={0}
            max={100000}
          />
        </div>

        {/* Exercise minutes + type */}
        <div>
          <label className="flex items-center gap-2 text-sm font-bold mb-2">
            <DumbbellIcon size={16} />
            Exercise
          </label>
          <div className="grid grid-cols-[1fr_1.3fr] gap-2">
            <input
              type="number"
              value={exerciseMin}
              onChange={(e) => setExerciseMin(e.target.value)}
              placeholder="Minutes"
              className="input bg-cream text-ink"
              inputMode="numeric"
              min={0}
              max={600}
            />
            <select
              value={exerciseType}
              onChange={(e) => setExerciseType(e.target.value)}
              className="input bg-cream text-ink"
              disabled={!exerciseMin}
            >
              <option value="">Type</option>
              {EXERCISE_TYPES.map((t) => (
                <option key={t.val} value={t.val}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          {exerciseMin && parseInt(exerciseMin) > 0 && (
            <div className="flex gap-2 mt-2">
              {(["light", "moderate", "intense"] as const).map((i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setIntensity(intensity === i ? "" : i)}
                  className={`pill flex-1 justify-center capitalize ${
                    intensity === i ? "pill-saffron" : "bg-cream text-ink"
                  }`}
                  style={{
                    backgroundColor:
                      intensity === i ? undefined : "var(--color-cream)",
                  }}
                >
                  {i}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Energy */}
        <div>
          <label className="flex items-center gap-2 text-sm font-bold mb-2">
            <HeartIcon size={16} />
            Energy today
          </label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setEnergy(energy === n ? 0 : n)}
                className={`flex-1 py-3 rounded-2xl border-2 border-ink font-bold text-lg transition ${
                  energy === n
                    ? "bg-saffron text-ink"
                    : "bg-cream text-ink-soft"
                }`}
                style={{ boxShadow: "3px 3px 0 #1A1A1A" }}
              >
                {n}
              </button>
            ))}
          </div>
          <div className="flex justify-between text-[10px] mt-1 opacity-70">
            <span>Wiped</span>
            <span>Buzzing</span>
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
            placeholder="e.g. Walked to work, gym after"
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
            Saved.
          </div>
        )}

        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="btn btn-saffron w-full"
        >
          {saving ? "Saving..." : existingLog ? "Update" : "Save"}
        </button>
      </div>
    </div>
  );
}
