"use client";

import { compressImage, formatBytes, CompressionResult } from "@/lib/image-compressor";
import { createClient } from "@/lib/supabase/client";
import Image from "next/image";
import { useState } from "react";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  folder?: string;
  label?: string;
  bucket?: string;
}

export default function ImageUpload({
  value,
  onChange,
  folder = "uploads",
  label = "Cover / Thumbnail Image",
  bucket = "media",
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [compressing, setCompressing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<CompressionResult | null>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setError(null);
      setStats(null);
      const rawFile = e.target.files?.[0];
      if (!rawFile) return;

      setCompressing(true);
      // 1. High-fidelity visual compression (crisp quality, 85-95% lighter)
      let uploadFile = rawFile;
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
        console.warn("Compression fallback, proceeding with original:", compErr);
      } finally {
        setCompressing(false);
      }

      setUploading(true);
      const supabase = createClient();

      const fileExt = uploadFile.name.split(".").pop();
      const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(fileName, uploadFile, {
          cacheControl: "3600",
          upsert: true,
          contentType: uploadFile.type,
        });

      if (uploadError) {
        throw uploadError;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from(bucket).getPublicUrl(fileName);

      onChange(publicUrl);
    } catch (err: any) {
      console.error("Upload error:", err);
      setError(err.message || `Failed to upload image. Make sure '${bucket}' bucket exists in Supabase.`);
    } finally {
      setUploading(false);
      setCompressing(false);
    }
  };

  return (
    <div className="space-y-3">
      <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
        {label}
      </label>


      {value && (
        <div className="relative h-40 w-full max-w-xs overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
          <Image
            src={value}
            alt="Uploaded Preview"
            fill
            unoptimized
            className="object-contain p-2"
            onError={() => {
              // Graceful error handling for broken image URLs
            }}
          />
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute top-2 right-2 rounded-full bg-red-600 p-1 text-white shadow hover:bg-red-700 z-10"
            title="Remove image"
          >

            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition hover:border-primary hover:text-primary">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          <span>
            {compressing
              ? "⚡ Optimizing Visual Quality..."
              : uploading
              ? "Uploading to Supabase..."
              : "Upload & Compress Image"}
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
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200">
            <span>✨ HD Optimized:</span>
            <span className="line-through text-gray-400">{formatBytes(stats.originalSize)}</span>
            <span>➔ {formatBytes(stats.compressedSize)}</span>
            <span className="font-bold text-emerald-800">({stats.savedPercentage}% saved)</span>
          </span>
        )}

        <span className="text-xs text-gray-400">or enter image path / URL below</span>
      </div>

      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="/images/about/geospatial.svg or https://..."
        className="w-full rounded-lg border border-gray-300 px-3.5 py-2 text-sm text-gray-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
      />

      {error && (
        <p className="text-xs text-red-500">{error}</p>
      )}
    </div>
  );
}
