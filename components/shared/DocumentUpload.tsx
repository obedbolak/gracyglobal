// components/shared/DocumentUpload.tsx

"use client";

import { useState, useRef } from "react";
import { X, Loader2, FileText, File, Download } from "lucide-react";

interface DocumentUploadProps {
  onUploadComplete: (url: string, publicId: string, filename: string) => void;
  folder?: string;
  maxSize?: number; // MB
  label?: string;
  currentDocument?: { url: string; filename: string };
  acceptedTypes?: string[];
}

export default function DocumentUpload({
  onUploadComplete,
  folder = "gracyglobal/documents",
  maxSize = 10,
  label = "Upload Document",
  currentDocument,
  acceptedTypes = ["application/pdf"],
}: DocumentUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [document, setDocument] = useState<{
    url: string;
    filename: string;
  } | null>(currentDocument || null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const xhrRef = useRef<XMLHttpRequest | null>(null);

  const getFileIcon = (filename: string) => {
    if (filename.endsWith(".pdf")) return FileText;
    return File;
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!acceptedTypes.includes(file.type)) {
      setError(`Please select a valid document (${acceptedTypes.join(", ")})`);
      return;
    }

    const fileSizeMB = file.size / 1024 / 1024;
    if (fileSizeMB > maxSize) {
      setError(`File size must be less than ${maxSize}MB`);
      return;
    }

    setError(null);
    setUploading(true);
    setProgress(0);

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_VIDEO_UPLOAD_PRESET; // same unsigned preset works for raw files

    if (!cloudName || !uploadPreset) {
      setError("Cloudinary is not configured. Check your .env.local file.");
      setUploading(false);
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);
    formData.append("folder", folder);
    // Cloudinary needs resource_type=raw for PDFs and other non-image/video files
    // This is set via the URL, not formData

    const xhr = new XMLHttpRequest();
    xhrRef.current = xhr;

    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable) {
        setProgress(Math.round((e.loaded / e.total) * 100));
      }
    });

    xhr.addEventListener("load", () => {
      setUploading(false);

      if (xhr.status === 200) {
        const data = JSON.parse(xhr.responseText);
        const uploadedDoc = { url: data.secure_url, filename: file.name };
        setDocument(uploadedDoc);
        onUploadComplete(data.secure_url, data.public_id, file.name);
      } else {
        let message = "Upload failed";
        try {
          const err = JSON.parse(xhr.responseText);
          message = err?.error?.message || message;
        } catch {}
        setError(message);
        setDocument(currentDocument || null);
      }
    });

    xhr.addEventListener("error", () => {
      setUploading(false);
      setError("Network error — please check your connection and try again.");
      setDocument(currentDocument || null);
    });

    xhr.addEventListener("abort", () => {
      setUploading(false);
      setProgress(0);
      setDocument(currentDocument || null);
    });

    // resource_type=raw is set in the URL for documents/PDFs
    xhr.open("POST", `https://api.cloudinary.com/v1_1/${cloudName}/raw/upload`);
    xhr.send(formData);
  };

  const cancelUpload = () => {
    xhrRef.current?.abort();
  };

  const clearDocument = () => {
    cancelUpload();
    setDocument(null);
    setError(null);
    setProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const FileIcon = document ? getFileIcon(document.filename) : FileText;

  return (
    <div className="space-y-3">
      {label && (
        <label className="block text-sm font-medium text-[var(--text-secondary)]">
          {label}
        </label>
      )}

      <div className="relative">
        {!document ? (
          <label className="glass cursor-pointer block p-8 text-center hover:bg-[var(--glass-bg-hover)] transition-colors rounded-xl">
            <input
              ref={fileInputRef}
              type="file"
              accept={acceptedTypes.join(",")}
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
                  <button
                    type="button"
                    onClick={cancelUpload}
                    className="text-xs text-[var(--error-text)] mt-2 hover:underline"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <div className="p-4 rounded-full bg-[var(--purple-faint)]">
                  <FileText className="w-8 h-8 text-[var(--purple)]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-[var(--text-secondary)]">
                    Click to upload document
                  </p>
                  <p className="text-xs text-[var(--text-muted)] mt-1">
                    PDF up to {maxSize}MB
                  </p>
                </div>
              </div>
            )}
          </label>
        ) : (
          <div className="glass p-6 rounded-xl">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="p-3 rounded-lg bg-[var(--purple-faint)] flex-shrink-0">
                  <FileIcon className="w-6 h-6 text-[var(--purple)]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                    {document.filename}
                  </p>
                  <a
                    href={document.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-[var(--purple)] hover:text-[var(--purple-dark)] flex items-center gap-1 mt-1"
                  >
                    <Download className="w-3 h-3" />
                    Download
                  </a>
                </div>
              </div>

              <button
                onClick={clearDocument}
                disabled={uploading}
                className="p-2 rounded-full bg-[var(--error-bg)] text-[var(--error-text)] hover:bg-[var(--error-border)] transition-colors flex-shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
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
