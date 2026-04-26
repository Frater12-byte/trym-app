"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

/**
 * Camera-first receipt uploader.
 *
 * On mobile: tap "Snap a receipt" → opens phone camera (capture="environment")
 * On desktop: tap "Snap a receipt" → opens file picker
 *
 * Compresses to 1024px max width before upload to keep OCR cheap.
 */

interface Props {
  defaultArea?: string | null;
  onUploaded?: (receipt: {
    receipt_id: string;
    parsed_items_count: number;
    matched_items_count: number;
  }) => void;
}

const SUPERMARKETS = [
  { value: "carrefour", label: "Carrefour" },
  { value: "lulu", label: "Lulu" },
  { value: "spinneys", label: "Spinneys" },
  { value: "kibsons", label: "Kibsons" },
  { value: "choithrams", label: "Choithrams" },
  { value: "union_coop", label: "Union Coop" },
  { value: "other", label: "Other" },
];

export function ReceiptUploader({ defaultArea, onUploaded }: Props) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const [supermarket, setSupermarket] = useState<string>("");
  const [area, setArea] = useState<string>(defaultArea || "");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<string | null>(null);

  function handlePick() {
    inputRef.current?.click();
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    setError(null);
    const f = e.target.files?.[0];
    if (!f) return;

    // Compress before storing
    setProgress("Optimising image...");
    try {
      const compressed = await compressImage(f, 1024, 0.85);
      setFile(compressed);
      setPreviewUrl(URL.createObjectURL(compressed));
      setProgress(null);
    } catch (err) {
      console.error("Compression failed:", err);
      // Fall back to original
      setFile(f);
      setPreviewUrl(URL.createObjectURL(f));
      setProgress(null);
    }
  }

  function reset() {
    setFile(null);
    setPreviewUrl(null);
    setError(null);
    setProgress(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  async function handleUpload() {
    if (!file) return;
    setError(null);
    setUploading(true);
    setProgress("Reading your receipt...");

    try {
      const formData = new FormData();
      formData.append("file", file);
      if (supermarket) formData.append("supermarket_hint", supermarket);
      if (area) formData.append("area", area);

      const res = await fetch("/api/receipts/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.code === "RATE_LIMIT") {
          setError(data.error);
        } else {
          setError(data.error || "Upload failed");
        }
        setUploading(false);
        setProgress(null);
        return;
      }

      setProgress(null);
      reset();

      if (onUploaded) {
        onUploaded(data);
      } else {
        router.push(`/dashboard/receipts/${data.receipt_id}`);
        router.refresh();
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      setError(msg);
      setUploading(false);
      setProgress(null);
    }
  }

  return (
    <div className="card">
      <h2 className="text-base font-medium mb-1">📸 Got a receipt?</h2>
      <p className="text-sm text-ink-soft mb-4 leading-relaxed">
        Snap your last grocery receipt and we&apos;ll learn what you actually
        pay. Helps us build better plans for everyone in Dubai.
      </p>

      {/* Hidden file input — capture="environment" tells mobile to open camera */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
      />

      {!previewUrl ? (
        <button
          type="button"
          onClick={handlePick}
          disabled={uploading}
          className="btn-primary w-full text-base py-4"
        >
          📷 Snap a receipt
        </button>
      ) : (
        <div className="space-y-3">
          {/* Image preview */}
          <div className="relative rounded-xl overflow-hidden bg-cream max-h-64">
            <img
              src={previewUrl}
              alt="Receipt preview"
              className="w-full max-h-64 object-contain"
            />
            <button
              type="button"
              onClick={reset}
              disabled={uploading}
              className="absolute top-2 right-2 w-8 h-8 rounded-full bg-ink/80 text-cream flex items-center justify-center disabled:opacity-50"
              aria-label="Remove"
            >
              ✕
            </button>
          </div>

          {/* Optional metadata */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs text-ink-soft mb-1">
                Supermarket
              </label>
              <select
                value={supermarket}
                onChange={(e) => setSupermarket(e.target.value)}
                disabled={uploading}
                className="w-full text-sm px-3 py-2 rounded-lg bg-cream border-2 border-transparent focus:border-coral focus:outline-none disabled:opacity-50"
              >
                <option value="">Auto-detect</option>
                {SUPERMARKETS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-ink-soft mb-1">Area</label>
              <input
                type="text"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                disabled={uploading}
                placeholder="e.g. JLT"
                className="w-full text-sm px-3 py-2 rounded-lg bg-cream border-2 border-transparent focus:border-coral focus:outline-none disabled:opacity-50"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={handleUpload}
            disabled={uploading}
            className="btn-primary w-full text-base py-4 disabled:opacity-50"
          >
            {uploading ? progress || "Uploading..." : "Save and learn from it →"}
          </button>
        </div>
      )}

      {progress && !previewUrl && (
        <p className="text-sm text-ink-soft mt-2 text-center">{progress}</p>
      )}

      {error && <div className="warn-card text-sm mt-3">{error}</div>}

      <p className="text-xs text-ink-mute mt-3 leading-relaxed">
        Free plan: 10 receipts/month. We only read items and prices — your
        personal info stays on the receipt and isn&apos;t shared.
      </p>
    </div>
  );
}

/**
 * Compress image to maxDimension (px) on the longer side, JPEG at given quality.
 * Done client-side to save bandwidth and OpenAI cost.
 */
async function compressImage(
  file: File,
  maxDimension: number,
  quality: number
): Promise<File> {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = () => reject(new Error("File read failed"));
    r.readAsDataURL(file);
  });

  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const i = new Image();
    i.onload = () => resolve(i);
    i.onerror = () => reject(new Error("Image decode failed"));
    i.src = dataUrl;
  });

  const longSide = Math.max(img.width, img.height);
  const scale = longSide > maxDimension ? maxDimension / longSide : 1;
  const targetW = Math.round(img.width * scale);
  const targetH = Math.round(img.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = targetW;
  canvas.height = targetH;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not available");
  ctx.drawImage(img, 0, 0, targetW, targetH);

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, "image/jpeg", quality);
  });
  if (!blob) throw new Error("Compression failed");

  return new File([blob], file.name.replace(/\.[^.]+$/, ".jpg"), {
    type: "image/jpeg",
  });
}
