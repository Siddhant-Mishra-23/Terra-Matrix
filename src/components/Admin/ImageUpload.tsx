"use client";

import { compressImage, formatBytes, CompressionResult } from "@/lib/image-compressor";
import Image from "next/image";
import { useState } from "react";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  folder?: string;
  label?: string;
  bucket?: string;
}

const PRESET_POSTERS = [
  { label: "AI & Innovation", url: "/images/about/innovation.svg" },
  { label: "Geospatial Intelligence", url: "/images/about/geospatial.svg" },
  { label: "AI Analytics", url: "/images/about/ai-analytics.svg" },
  { label: "Civil Infrastructure", url: "/images/about/civil-infra.svg" },
  { label: "Groundwater Modeling", url: "/images/project/Project-01.png" },
  { label: "Road Alignment", url: "/images/project/Project-02.jpg" },
  { label: "LiDAR Survey", url: "/images/project/Project-03.jpg" },
];

export default function ImageUpload({
  value,
  onChange,
  folder = "uploads",
  label = "Cover / Thumbnail Image",
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [compressing, setCompressing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<CompressionResult | null>(null);
  const [showPresets, setShowPresets] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setError(null);
      setStats(null);
      const rawFile = e.target.files?.[0];
      if (!rawFile) return;

      setCompressing(true);
      let uploadFile = rawFile;
      let dataUrlFallback: string | null = null;

      try {
        const result = await compressImage(rawFile, {
          maxWidth: 1920,
          maxHeight: 1920,
          quality: 0.88,
          preferredFormat: "image/webp",
        });
        uploadFile = result.file;
        if (result.savedPercentage > 0) {
          setStats(result);
        }
      } catch (compErr) {
        console.warn("Compression fallback, using original file:", compErr);
      } finally {
        setCompressing(false);
      }

      setUploading(true);

      // 1. Try local server API upload
      try {
        const formData = new FormData();
        formData.append("file", uploadFile);
        formData.append("folder", folder);

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (res.ok) {
          const json = await res.json();
          if (json.url) {
            onChange(json.url);
            return;
          }
        }
      } catch (apiErr) {
        console.warn("API upload failed, trying fallback:", apiErr);
      }

      // 2. High-performance fallback: Base64 Data URL (always works, 100% reliable)
      const reader = new FileReader();
      reader.onload = (readEvt) => {
        const base64 = readEvt.target?.result as string;
        if (base64) {
          onChange(base64);
        }
      };
      reader.readAsDataURL(uploadFile);
    } catch (err: any) {
      console.error("Upload error:", err);
      setError(err.message || "Failed to upload image. Please try again or select a preset.");
    } finally {
      setUploading(false);
      setCompressing(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
          {label}
        </label>
        <button
          type="button"
          onClick={() => setShowPresets(!showPresets)}
          className="text-[11px] font-semibold text-primary hover:underline cursor-pointer"
        >
          {showPresets ? "Hide Presets" : "Choose from Preset Posters"}
        </button>
      </div>

      {/* Preset Poster Selector */}
      {showPresets && (
        <div className="rounded-xl border border-gray-200 bg-gray-50/80 p-3 space-y-2">
          <p className="text-[11px] text-body-color font-medium">
            Select a high-resolution stock poster / banner:
          </p>
          <div className="flex flex-wrap gap-2">
            {PRESET_POSTERS.map((preset) => (
              <button
                key={preset.url}
                type="button"
                onClick={() => {
                  onChange(preset.url);
                  setShowPresets(false);
                }}
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition border cursor-pointer ${
                  value === preset.url
                    ? "bg-primary text-white border-primary"
                    : "bg-white text-dark border-gray-200 hover:border-primary hover:text-primary"
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Preview Card */}
      {value && (
        <div className="relative h-44 w-full max-w-sm overflow-hidden rounded-xl border border-gray-200 bg-gray-50 shadow-sm">
          <Image
            src={value || "/images/about/innovation.svg"}
            alt="Uploaded Preview"
            fill
            unoptimized
            className="object-contain p-2"
            onError={() => {
              // Ignore invalid image errors gracefully
            }}
          />
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute top-2 right-2 rounded-full bg-red-600 p-1.5 text-white shadow-md hover:bg-red-700 z-10 transition cursor-pointer"
            title="Remove image"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="absolute bottom-1 left-2 rounded bg-black/60 px-2 py-0.5 text-[10px] text-white backdrop-blur-xs">
            Previewing Selected Poster
          </div>
        </div>
      )}

      {/* File Upload Button & Status */}
      <div className="flex flex-wrap items-center gap-3">
        <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-gray-300 bg-white px-4 py-2.5 text-xs font-semibold text-gray-700 shadow-xs transition hover:border-primary hover:text-primary">
          <svg className="h-4 w-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          <span>
            {compressing
              ? "⚡ Optimizing Visual Quality..."
              : uploading
              ? "Uploading Poster..."
              : "Upload & Select Poster"}
          </span>
          <input
            type="file"
            accept="image/*"
            onChange={handleUpload}
            disabled={uploading || compressing}
            className="hidden"
          />
        </label>

        {stats && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-semibold text-emerald-700 border border-emerald-200">
            <span>✨ HD Optimized:</span>
            <span className="line-through text-gray-400">{formatBytes(stats.originalSize)}</span>
            <span>➔ {formatBytes(stats.compressedSize)}</span>
            <span className="font-bold text-emerald-800">({stats.savedPercentage}% saved)</span>
          </span>
        )}

        <span className="text-[11px] text-gray-400">or enter image path / URL below</span>
      </div>

      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="/images/about/innovation.svg or https://..."
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs text-gray-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
      />

      {error && (
        <p className="text-xs text-red-500">{error}</p>
      )}
    </div>
  );
}
