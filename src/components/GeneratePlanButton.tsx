"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SparkleIcon } from "./icons";

export function GeneratePlanButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/plan/generate", { method: "POST" });
      const data = await res.json();

      if (!res.ok) {
        const msg = [data.error, data.detail, data.code].filter(Boolean).join(" — ");
        setError(msg || "Something went wrong — try again.");
        setLoading(false);
        return;
      }

      router.refresh();
    } catch {
      setError("Network error — check your connection.");
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      <button
        onClick={handleGenerate}
        disabled={loading}
        className="btn btn-primary"
      >
        {loading ? (
          <>Building your plan…</>
        ) : (
          <>
            <SparkleIcon size={18} />
            Generate this week&apos;s plan
          </>
        )}
      </button>

      {loading && (
        <p className="text-sm text-ink-soft">
          Picking meals based on your preferences and budget…
        </p>
      )}

      {error && (
        <p className="text-sm font-semibold" style={{ color: "#7A2B14" }}>
          {error}
        </p>
      )}
    </div>
  );
}
