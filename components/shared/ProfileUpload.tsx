// components/shared/ProfileUpload.tsx

"use client";

import { useState, useRef, useEffect } from "react";
import { Camera, Loader2, User } from "lucide-react";
import Image from "next/image";

interface ProfileUploadProps {
  onUploadComplete: (url: string, publicId: string) => void;
  onRemove?: () => void;
  folder?: string;
  maxSize?: number; // MB
  currentImage?: string;
  size?: number; // size in pixels
}

export default function ProfileUpload({
  onUploadComplete,
  onRemove,
  folder = "gracyglobal/profiles",
  maxSize = 2,
  currentImage,
  size = 80,
}: ProfileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setPreview(currentImage || null);
  }, [currentImage]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }

    const fileSizeMB = file.size / 1024 / 1024;
    if (fileSizeMB > maxSize) {
      setError(`File size must be < ${maxSize}MB`);
      return;
    }

    setError(null);
    setUploading(true);

    try {
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result as string);
      reader.readAsDataURL(file);

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

  const handleRemove = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setPreview(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    onRemove?.();
  };

  return (
    <div className="flex items-center gap-4">
      <label 
        className="relative group cursor-pointer block rounded-full overflow-hidden shrink-0"
        style={{ width: size, height: size, background: "var(--glass-bg)", border: "1px solid var(--glass-border)" }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={handleFileSelect}
          disabled={uploading}
          className="hidden"
        />

        {preview ? (
          <Image
            src={preview}
            alt="Profile Preview"
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[var(--text-muted)]">
            <User size={size * 0.4} strokeWidth={1.5} />
          </div>
        )}

        {/* Overlay */}
        <div className={`absolute inset-0 bg-black/40 flex flex-col items-center justify-center transition-opacity ${uploading ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
          {uploading ? (
            <Loader2 className="w-6 h-6 animate-spin text-white" />
          ) : (
            <Camera className="w-6 h-6 text-white" />
          )}
        </div>
      </label>

      <div className="flex flex-col justify-center text-sm">
        <p className="font-medium text-[var(--text-primary)]">Profile Photo</p>
        <div className="flex items-center gap-3 mt-1">
          <label className="text-[var(--purple)] font-medium cursor-pointer hover:underline text-xs">
            Upload
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleFileSelect}
              disabled={uploading}
              className="hidden"
            />
          </label>
          {preview && (
            <button 
              onClick={handleRemove}
              className="text-[var(--error-text)] hover:underline text-xs"
              type="button"
            >
              Remove
            </button>
          )}
        </div>
        {error && <p className="text-[var(--error-text)] text-xs mt-1">{error}</p>}
      </div>
    </div>
  );
}
