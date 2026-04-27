// app/test-upload/page.tsx

"use client";

import { useState } from "react";
import ImageUpload from "@/components/shared/ImageUpload";
import MultiImageUpload from "@/components/shared/MultiImageUpload";
import VideoUpload from "@/components/shared/VideoUpload";
import DocumentUpload from "@/components/shared/DocumentUpload";

export default function TestUpload() {
  const [results, setResults] = useState<any[]>([]);

  const addResult = (type: string, data: any) => {
    setResults((prev) => [...prev, { type, data, timestamp: new Date() }]);
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">📤 Upload Test Page</h1>
          <p className="text-[var(--text-muted)]">
            Test all upload types (images, videos, documents)
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Single Image */}
          <section className="glass p-6 rounded-xl">
            <h2 className="text-xl font-semibold mb-4">📸 Single Image</h2>
            <ImageUpload
              folder="test/images"
              onUploadComplete={(url, publicId) => {
                addResult("Single Image", { url, publicId });
              }}
            />
          </section>

          {/* Multiple Images */}
          <section className="glass p-6 rounded-xl">
            <h2 className="text-xl font-semibold mb-4">🖼️ Multiple Images</h2>
            <MultiImageUpload
              folder="test/gallery"
              maxImages={4}
              onUploadComplete={(images) => {
                addResult("Multiple Images", images);
              }}
            />
          </section>

          {/* Video */}
          <section className="glass p-6 rounded-xl">
            <h2 className="text-xl font-semibold mb-4">🎥 Video Upload</h2>
            <VideoUpload
              folder="test/videos"
              maxSize={100}
              onUploadComplete={(url, publicId) => {
                addResult("Video", { url, publicId });
              }}
            />
          </section>

          {/* Document */}
          <section className="glass p-6 rounded-xl">
            <h2 className="text-xl font-semibold mb-4">📄 PDF Upload</h2>
            <DocumentUpload
              folder="test/documents"
              onUploadComplete={(url, publicId, filename) => {
                addResult("Document", { url, publicId, filename });
              }}
            />
          </section>
        </div>

        {/* Results Log */}
        {results.length > 0 && (
          <section className="glass p-6 rounded-xl">
            <h2 className="text-xl font-semibold mb-4">✅ Upload Results</h2>
            <div className="space-y-3">
              {results.map((result, index) => (
                <div
                  key={index}
                  className="p-4 bg-[var(--success-bg)] border border-[var(--success-border)] rounded-lg"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-[var(--success-text)]">
                      {result.type}
                    </span>
                    <span className="text-xs text-[var(--text-muted)]">
                      {result.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                  <pre className="text-xs overflow-auto">
                    {JSON.stringify(result.data, null, 2)}
                  </pre>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
