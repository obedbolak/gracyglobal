// components/shared/MultiImageUpload.tsx

"use client";

import { useState, useRef } from "react";
import { Upload, X, Loader2, ImageIcon, GripVertical } from "lucide-react";
// Remove this line:
// import Image from "next/image";

interface UploadedImage {
  url: string;
  publicId: string;
}

interface MultiImageUploadProps {
  onUploadComplete: (images: UploadedImage[]) => void;
  folder?: string;
  maxSize?: number;
  maxImages?: number;
  label?: string;
  currentImages?: UploadedImage[];
}

export default function MultiImageUpload({
  onUploadComplete,
  folder = "gracyglobal",
  maxSize = 5,
  maxImages = 6,
  label = "Upload Images",
  currentImages = [],
}: MultiImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [images, setImages] = useState<UploadedImage[]>(currentImages);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFilesSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (images.length + files.length > maxImages) {
      setError(`You can only upload up to ${maxImages} images`);
      return;
    }

    for (const file of files) {
      if (!file.type.startsWith("image/")) {
        setError("All files must be images");
        return;
      }

      const fileSizeMB = file.size / 1024 / 1024;
      if (fileSizeMB > maxSize) {
        setError(`Each file must be less than ${maxSize}MB`);
        return;
      }
    }

    setError(null);
    setUploading(true);

    try {
      const formData = new FormData();
      files.forEach((file) => formData.append("files", file));
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

      const newImages = Array.isArray(data.uploads)
        ? data.uploads
        : [data.uploads];

      const updatedImages = [...images, ...newImages];
      setImages(updatedImages);
      onUploadComplete(updatedImages);
    } catch (err: any) {
      setError(err.message || "Upload failed");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeImage = (index: number) => {
    const updatedImages = images.filter((_, i) => i !== index);
    setImages(updatedImages);
    onUploadComplete(updatedImages);
  };

  const moveImage = (fromIndex: number, toIndex: number) => {
    const updatedImages = [...images];
    const [movedImage] = updatedImages.splice(fromIndex, 1);
    updatedImages.splice(toIndex, 0, movedImage);
    setImages(updatedImages);
    onUploadComplete(updatedImages);
  };

  return (
    <div className="space-y-3">
      {label && (
        <label className="block text-sm font-medium text-[var(--text-secondary)]">
          {label}
          <span className="text-[var(--text-muted)] ml-2">
            ({images.length}/{maxImages})
          </span>
        </label>
      )}

      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {images.map((image, index) => (
            <div
              key={image.publicId}
              className="glass relative group overflow-hidden rounded-lg aspect-square"
            >
              {/* ✅ Changed from <Image> to <img> */}
              <img
                src={image.url}
                alt={`Upload ${index + 1}`}
                className="w-full h-full object-cover"
              />

              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                {index > 0 && (
                  <button
                    onClick={() => moveImage(index, index - 1)}
                    className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
                    title="Move left"
                  >
                    <GripVertical className="w-4 h-4 text-white rotate-90" />
                  </button>
                )}

                <button
                  onClick={() => removeImage(index)}
                  className="p-2 bg-red-500/80 hover:bg-red-500 rounded-full transition-colors"
                  title="Remove"
                >
                  <X className="w-4 h-4 text-white" />
                </button>

                {index < images.length - 1 && (
                  <button
                    onClick={() => moveImage(index, index + 1)}
                    className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
                    title="Move right"
                  >
                    <GripVertical className="w-4 h-4 text-white -rotate-90" />
                  </button>
                )}
              </div>

              {index === 0 && (
                <div className="absolute top-2 left-2 px-2 py-1 bg-[var(--purple)] text-white text-xs font-medium rounded-full">
                  Primary
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {images.length < maxImages && (
        <label className="glass cursor-pointer block p-6 text-center hover:bg-[var(--glass-bg-hover)] transition-colors rounded-xl">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleFilesSelect}
            disabled={uploading}
            multiple
            className="hidden"
          />

          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-8 h-8 animate-spin text-[var(--purple)]" />
              <p className="text-sm text-[var(--text-muted)]">Uploading...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="p-3 rounded-full bg-[var(--purple-faint)]">
                <Upload className="w-6 h-6 text-[var(--purple)]" />
              </div>
              <div>
                <p className="text-sm font-medium text-[var(--text-secondary)]">
                  Add more images
                </p>
                <p className="text-xs text-[var(--text-muted)] mt-1">
                  Up to {maxImages - images.length} more ({maxSize}MB each)
                </p>
              </div>
            </div>
          )}
        </label>
      )}

      {error && (
        <div className="flex items-center gap-2 text-sm text-[var(--error-text)] bg-[var(--error-bg)] px-4 py-3 rounded-lg border border-[var(--error-border)]">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
