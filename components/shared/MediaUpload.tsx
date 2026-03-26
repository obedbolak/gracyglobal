// components/shared/MediaUpload.tsx

"use client";

import { useState } from "react";
import ImageUpload from "./ImageUpload";
import VideoUpload from "./VideoUpload";
import DocumentUpload from "./DocumentUpload";

type MediaType = "image" | "video" | "document";

interface MediaUploadProps {
  type: MediaType;
  onUploadComplete: (url: string, publicId: string, metadata?: any) => void;
  folder?: string;
  label?: string;
  currentMedia?: string;
}

export default function MediaUpload({
  type,
  onUploadComplete,
  folder,
  label,
  currentMedia,
}: MediaUploadProps) {
  switch (type) {
    case "image":
      return (
        <ImageUpload
          folder={folder || "gracyglobal/images"}
          label={label || "Upload Image"}
          currentImage={currentMedia}
          onUploadComplete={onUploadComplete}
        />
      );

    case "video":
      return (
        <VideoUpload
          folder={folder || "gracyglobal/videos"}
          label={label || "Upload Video"}
          currentVideo={currentMedia}
          onUploadComplete={onUploadComplete}
        />
      );

    case "document":
      return (
        <DocumentUpload
          folder={folder || "gracyglobal/documents"}
          label={label || "Upload Document"}
          currentDocument={
            currentMedia
              ? { url: currentMedia, filename: "Document" }
              : undefined
          }
          onUploadComplete={(url, publicId, filename) =>
            onUploadComplete(url, publicId, { filename })
          }
        />
      );

    default:
      return null;
  }
}
