// app/api/upload/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  uploadToCloudinary,
  uploadMultipleToCloudinary,
} from "@/lib/cloudinary";

// Maximum file size: 10MB for images/docs, 100MB for videos
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB

// Allowed file types
const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];
const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime"];
const ALLOWED_DOCUMENT_TYPES = ["application/pdf"];

export async function POST(req: NextRequest) {
  try {
    // ⚠️ TEMPORARILY DISABLED FOR TESTING
    // TODO: Re-enable before production!
    /*
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    */

    const formData = await req.formData();
    const files = formData.getAll("files") as File[];
    const folder = (formData.get("folder") as string) || "gracyglobal";
    const resourceType =
      (formData.get("resourceType") as "image" | "video" | "raw" | "auto") ||
      "auto";

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    console.log(`📤 Uploading ${files.length} file(s) to folder: ${folder}`);

    // Validate all files
    for (const file of files) {
      console.log(
        `Validating: ${file.name} (${file.type}, ${file.size} bytes)`,
      );

      // Determine max size based on type
      const isVideo = ALLOWED_VIDEO_TYPES.includes(file.type);
      const maxSize = isVideo ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;

      // Check file size
      if (file.size > maxSize) {
        const maxSizeMB = maxSize / 1024 / 1024;
        return NextResponse.json(
          { error: `File "${file.name}" exceeds ${maxSizeMB}MB limit` },
          { status: 400 },
        );
      }

      // Check file type
      const allowedTypes = [
        ...ALLOWED_IMAGE_TYPES,
        ...ALLOWED_VIDEO_TYPES,
        ...ALLOWED_DOCUMENT_TYPES,
      ];

      if (!allowedTypes.includes(file.type)) {
        return NextResponse.json(
          { error: `File type "${file.type}" not allowed` },
          { status: 400 },
        );
      }
    }

    console.log("✅ All files validated");

    // Convert files to base64
    console.log("🔄 Converting to base64...");
    const base64Files = await Promise.all(
      files.map(async (file) => {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        return `data:${file.type};base64,${buffer.toString("base64")}`;
      }),
    );

    console.log("✅ Conversion complete");

    // Upload to Cloudinary
    console.log("☁️ Uploading to Cloudinary...");
    let results;
    if (base64Files.length === 1) {
      // Single upload
      console.log(`Uploading single file to ${folder}...`);
      const result = await uploadToCloudinary(base64Files[0], {
        folder,
        resourceType,
      });
      results = [result];
    } else {
      // Multiple upload
      console.log(`Uploading ${base64Files.length} files to ${folder}...`);
      results = await uploadMultipleToCloudinary(base64Files, {
        folder,
        resourceType,
      });
    }

    // Check for failures
    const failed = results.filter((r) => !r.success);
    if (failed.length > 0) {
      console.error("❌ Upload failed:", failed);
      return NextResponse.json(
        {
          error: `${failed.length} file(s) failed to upload`,
          details: failed.map((f) => f.error),
        },
        { status: 500 },
      );
    }

    // Return success response
    const uploads = results.map((r) => ({
      url: r.url!,
      publicId: r.publicId!,
    }));

    console.log("✅ Upload successful:", uploads);

    return NextResponse.json({
      success: true,
      uploads: uploads.length === 1 ? uploads[0] : uploads,
      count: uploads.length,
    });
  } catch (error: any) {
    console.error("💥 Upload error:", error);
    return NextResponse.json(
      { error: error.message || "Upload failed" },
      { status: 500 },
    );
  }
}
