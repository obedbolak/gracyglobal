// components/shared/ImageUpload.tsx

"use client";

import { useState, useRef, useEffect } from "react";
import { Upload, X, Loader2, ImageIcon } from "lucide-react";
import Image from "next/image";

interface ImageUploadProps {
  onUploadComplete: (url: string, publicId: string) => void;
  onRemove?: () => void;
  folder?: string;
  maxSize?: number; // MB
  label?: string;
  currentImage?: string;
  aspectRatio?: "square" | "video" | "auto";
}

export default function ImageUpload({
  onUploadComplete,
  onRemove,
  folder = "gracyglobal",
  maxSize = 5,
  label = "Upload Image",
  currentImage,
  aspectRatio = "auto",
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setPreview(currentImage || null);
  }, [currentImage]);

  const aspectRatioClasses = {
    square: "aspect-square",
    video: "aspect-video",
    auto: "",
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }

    // Validate file size
    const fileSizeMB = file.size / 1024 / 1024;
    if (fileSizeMB > maxSize) {
      setError(`File size must be less than ${maxSize}MB`);
      return;
    }

    setError(null);
    setUploading(true);

    try {
      // Show preview
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result as string);
      reader.readAsDataURL(file);

      // Upload to Cloudinary
      const formData = new FormData();
      formData.append("files", file);
      formData.append("folder", folder);
      formData.append("resourceType", "image");

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Upload failed");
      }

      onUploadComplete(data.uploads.url, data.uploads.publicId);
    } catch (err: any) {
      setError(err.message || "Upload failed");
      setPreview(currentImage || null);
    } finally {
      setUploading(false);
    }
  };

  const clearImage = () => {
    setPreview(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    onRemove?.();
  };

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-[var(--text-secondary)]">
          {label}
        </label>
      )}

      <div className="relative">
        {!preview ? (
          <label className="glass cursor-pointer block p-8 text-center hover:bg-[var(--glass-bg-hover)] transition-colors rounded-xl">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleFileSelect}
              disabled={uploading}
              className="hidden"
            />

            {uploading ? (
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-10 h-10 animate-spin text-[var(--purple)]" />
                <p className="text-sm text-[var(--text-muted)]">Uploading...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <div className="p-4 rounded-full bg-[var(--purple-faint)]">
                  <ImageIcon className="w-8 h-8 text-[var(--purple)]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-[var(--text-secondary)]">
                    Click to upload image
                  </p>
                  <p className="text-xs text-[var(--text-muted)] mt-1">
                    PNG, JPG, WEBP, GIF up to {maxSize}MB
                  </p>
                </div>
              </div>
            )}
          </label>
        ) : (
          <div className="glass relative overflow-hidden rounded-xl">
            <button
              onClick={clearImage}
              disabled={uploading}
              className="absolute top-3 right-3 z-10 p-2 rounded-full bg-[var(--error-bg)] text-[var(--error-text)] hover:bg-[var(--error-border)] transition-colors shadow-lg"
            >
              <X className="w-4 h-4" />
            </button>

            <div
              className={`relative w-full ${aspectRatioClasses[aspectRatio]} ${!aspectRatioClasses[aspectRatio] && "h-64"}`}
            >
              <Image
                src={preview}
                alt="Preview"
                fill
                className="object-cover"
              />
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm text-[var(--error-text)] bg-[var(--error-bg)] px-4 py-3 rounded-lg border border-[var(--error-border)]">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
