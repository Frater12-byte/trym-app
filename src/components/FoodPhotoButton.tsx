"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

export function FoodPhotoButton() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [caption, setCaption] = useState("");
  const [mealName, setMealName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setError(null);
    setSuccess(false);
  }

  async function share() {
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("image", file);
      if (caption) fd.append("caption", caption);
      if (mealName) fd.append("meal_name", mealName);

      const res = await fetch("/api/community/post", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      setSuccess(true);
      setPreview(null);
      setFile(null);
      setCaption("");
      setMealName("");
      router.push("/community");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="card">
      <h3 className="font-display text-xl mb-3 flex items-center gap-2">
        📸 Share your food
      </h3>
      <p className="text-xs text-ink-mute mb-3">
        Show the community what you&apos;re eating.
      </p>

      {preview ? (
        <div className="space-y-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt="Food preview" className="w-full rounded-2xl border-2 border-ink object-cover max-h-64" />
          <input
            type="text"
            value={mealName}
            onChange={(e) => setMealName(e.target.value)}
            placeholder="What is this? (e.g. Harissa pasta)"
            className="input"
          />
          <input
            type="text"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Say something (optional)"
            className="input"
            maxLength={140}
          />
          {error && (
            <p className="text-xs font-semibold text-red-700 bg-red-50 rounded-xl px-3 py-2">{error}</p>
          )}
          <div className="flex gap-3">
            <button type="button" onClick={() => setPreview(null)} className="btn btn-secondary flex-1">
              Cancel
            </button>
            <button type="button" onClick={share} disabled={uploading} className="btn btn-primary flex-1">
              {uploading ? "Sharing…" : "Share 🌍"}
            </button>
          </div>
        </div>
      ) : success ? (
        <div className="text-center py-4">
          <p className="text-3xl mb-2">🎉</p>
          <p className="font-bold">Posted to the community!</p>
          <button type="button" onClick={() => setSuccess(false)} className="text-xs text-tangerine underline mt-2">
            Post another
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="w-full flex items-center justify-center gap-3 py-5 rounded-2xl border-2 border-dashed border-ink/40 hover:-translate-y-0.5 transition font-bold text-ink-soft"
        >
          <span className="text-2xl">📷</span>
          Take a photo or pick from gallery
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="sr-only"
        onChange={handleFileChange}
      />
    </div>
  );
}
