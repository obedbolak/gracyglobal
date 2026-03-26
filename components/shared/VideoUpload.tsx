// components/shared/VideoUpload.tsx

"use client";

import { useState, useRef } from "react";
import { Upload, X, Loader2, Video, Play, FileVideo } from "lucide-react";

interface VideoUploadProps {
  onUploadComplete: (url: string, publicId: string, duration?: number) => void;
  folder?: string;
  maxSize?: number; // MB
  label?: string;
  currentVideo?: string;
}

export default function VideoUpload({
  onUploadComplete,
  folder = "gracyglobal/videos",
  maxSize = 100, // 100MB for videos
  label = "Upload Video",
  currentVideo,
}: VideoUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [preview, setPreview] = useState<string | null>(currentVideo || null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("video/")) {
      setError("Please select a video file");
      return;
    }

    // Validate file size
    const fileSizeMB = file.size / 1024 / 1024;
    if (fileSizeMB > maxSize) {
      setError(`Video size must be less than ${maxSize}MB`);
      return;
    }

    setError(null);
    setUploading(true);
    setProgress(0);

    try {
      // Show preview
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result as string);
      reader.readAsDataURL(file);

      // Upload to Cloudinary
      const formData = new FormData();
      formData.append("files", file);
      formData.append("folder", folder);
      formData.append("resourceType", "video");

      const xhr = new XMLHttpRequest();

      // Track upload progress
      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) {
          const percentComplete = Math.round((e.loaded / e.total) * 100);
          setProgress(percentComplete);
        }
      });

      // Handle completion
      xhr.addEventListener("load", () => {
        if (xhr.status === 200) {
          const data = JSON.parse(xhr.responseText);
          onUploadComplete(data.uploads.url, data.uploads.publicId);
          setUploading(false);
        } else {
          const error = JSON.parse(xhr.responseText);
          throw new Error(error.error || "Upload failed");
        }
      });

      // Handle error
      xhr.addEventListener("error", () => {
        throw new Error("Upload failed");
      });

      xhr.open("POST", "/api/upload");
      xhr.send(formData);
    } catch (err: any) {
      setError(err.message || "Upload failed");
      setPreview(currentVideo || null);
      setUploading(false);
      setProgress(0);
    }
  };

  const clearVideo = () => {
    setPreview(null);
    setError(null);
    setProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="space-y-3">
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
              accept="video/mp4,video/webm,video/quicktime"
              onChange={handleFileSelect}
              disabled={uploading}
              className="hidden"
            />

            {uploading ? (
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-10 h-10 animate-spin text-[var(--purple)]" />
                <div className="w-full max-w-xs">
                  <div className="h-2 bg-[var(--glass-bg-strong)] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[var(--purple)] to-[var(--purple-light)] transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="text-sm text-[var(--text-muted)] mt-2">
                    Uploading... {progress}%
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <div className="p-4 rounded-full bg-[var(--purple-faint)]">
                  <Video className="w-8 h-8 text-[var(--purple)]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-[var(--text-secondary)]">
                    Click to upload video
                  </p>
                  <p className="text-xs text-[var(--text-muted)] mt-1">
                    MP4, WebM, MOV up to {maxSize}MB
                  </p>
                </div>
              </div>
            )}
          </label>
        ) : (
          <div className="glass relative overflow-hidden rounded-xl">
            <button
              onClick={clearVideo}
              disabled={uploading}
              className="absolute top-3 right-3 z-10 p-2 rounded-full bg-[var(--error-bg)] text-[var(--error-text)] hover:bg-[var(--error-border)] transition-colors shadow-lg"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="relative aspect-video bg-black">
              <video
                src={preview}
                controls
                className="w-full h-full"
                preload="metadata"
              >
                Your browser does not support video playback.
              </video>
            </div>

            <div className="p-4 flex items-center gap-2 border-t border-[var(--divider)]">
              <FileVideo className="w-5 h-5 text-[var(--purple)]" />
              <span className="text-sm text-[var(--text-secondary)]">
                Video ready to use
              </span>
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
