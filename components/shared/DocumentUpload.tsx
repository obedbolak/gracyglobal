// components/shared/DocumentUpload.tsx

"use client";

import { useState, useRef } from "react";
import { Upload, X, Loader2, FileText, File, Download } from "lucide-react";

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
  maxSize = 10, // 10MB for PDFs
  label = "Upload Document",
  currentDocument,
  acceptedTypes = ["application/pdf"],
}: DocumentUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [document, setDocument] = useState<{
    url: string;
    filename: string;
  } | null>(currentDocument || null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getFileIcon = (filename: string) => {
    if (filename.endsWith(".pdf")) return FileText;
    return File;
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!acceptedTypes.includes(file.type)) {
      setError(`Please select a valid document (${acceptedTypes.join(", ")})`);
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
      // Upload to Cloudinary
      const formData = new FormData();
      formData.append("files", file);
      formData.append("folder", folder);
      formData.append("resourceType", "raw");

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Upload failed");
      }

      const uploadedDoc = {
        url: data.uploads.url,
        filename: file.name,
      };

      setDocument(uploadedDoc);
      onUploadComplete(data.uploads.url, data.uploads.publicId, file.name);
    } catch (err: any) {
      setError(err.message || "Upload failed");
      setDocument(currentDocument || null);
    } finally {
      setUploading(false);
    }
  };

  const clearDocument = () => {
    setDocument(null);
    setError(null);
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
                <p className="text-sm text-[var(--text-muted)]">Uploading...</p>
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
