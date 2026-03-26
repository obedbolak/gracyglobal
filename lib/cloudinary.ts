// lib/cloudinary.ts

import { v2 as cloudinary } from "cloudinary";

// Server-side config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export default cloudinary;

// ─── TYPES ───────────────────────────────────────────────────────────────────

export interface UploadOptions {
  folder?: string;
  resourceType?: "image" | "video" | "raw" | "auto";
  transformation?: any[];
  publicId?: string;
  quality?: string | number;
  format?: string;
}

export interface UploadResult {
  success: boolean;
  url?: string;
  publicId?: string;
  error?: string;
}

// ─── UPLOAD HELPERS ──────────────────────────────────────────────────────────

/**
 * Upload single file to Cloudinary (SIGNED - NO PRESET NEEDED)
 */
export async function uploadToCloudinary(
  file: string | Buffer,
  options: UploadOptions = {},
): Promise<UploadResult> {
  try {
    const {
      folder = "gracyglobal",
      resourceType = "auto",
      transformation,
      publicId,
      quality = "auto",
      format,
    } = options;

    console.log("📝 Upload options:", {
      folder,
      resource_type: resourceType,
      has_transformation: !!transformation,
      has_publicId: !!publicId,
    });

    // For SIGNED uploads: ONLY use these parameters
    const uploadOptions: any = {
      folder,
      resource_type: resourceType,
    };

    // Optional parameters
    if (transformation) uploadOptions.transformation = transformation;
    if (publicId) uploadOptions.public_id = publicId;
    if (quality) uploadOptions.quality = quality;
    if (format) uploadOptions.format = format;

    console.log("🚀 Calling cloudinary.uploader.upload...");

    const result = await cloudinary.uploader.upload(
      file as string,
      uploadOptions,
    );

    console.log("✅ Cloudinary response:", {
      url: result.secure_url,
      publicId: result.public_id,
    });

    return {
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
    };
  } catch (error: any) {
    console.error("❌ Cloudinary upload error:", error);
    return {
      success: false,
      error: error.message || "Upload failed",
    };
  }
}

/**
 * Upload multiple files to Cloudinary
 */
export async function uploadMultipleToCloudinary(
  files: (string | Buffer)[],
  options: UploadOptions = {},
): Promise<UploadResult[]> {
  console.log(`📦 Uploading ${files.length} files...`);
  const uploadPromises = files.map((file, index) => {
    console.log(`  ${index + 1}/${files.length} - Starting upload...`);
    return uploadToCloudinary(file, options);
  });
  return Promise.all(uploadPromises);
}

/**
 * Delete file from Cloudinary
 */
export async function deleteFromCloudinary(
  publicId: string,
  resourceType: "image" | "video" | "raw" = "image",
): Promise<{ success: boolean; error?: string }> {
  try {
    console.log(`🗑️ Deleting ${publicId} (${resourceType})...`);
    await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });
    console.log("✅ Deleted successfully");
    return { success: true };
  } catch (error: any) {
    console.error("❌ Cloudinary delete error:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Delete multiple files from Cloudinary
 */
export async function deleteMultipleFromCloudinary(
  publicIds: string[],
  resourceType: "image" | "video" | "raw" = "image",
): Promise<{ success: boolean; failed: string[] }> {
  console.log(`🗑️ Deleting ${publicIds.length} files...`);

  const results = await Promise.allSettled(
    publicIds.map((id) => deleteFromCloudinary(id, resourceType)),
  );

  const failed = publicIds.filter(
    (_, index) => results[index].status === "rejected",
  );

  return {
    success: failed.length === 0,
    failed,
  };
}

/**
 * Generate optimized image URL with transformations
 */
export function getOptimizedImageUrl(
  publicId: string,
  options: {
    width?: number;
    height?: number;
    crop?: string;
    quality?: string | number;
    format?: string;
  } = {},
): string {
  const {
    width,
    height,
    crop = "fill",
    quality = "auto",
    format = "auto",
  } = options;

  return cloudinary.url(publicId, {
    width,
    height,
    crop,
    quality,
    format,
    secure: true,
  });
}
