// src/config/cloudinary.ts

import {
  v2 as cloudinaryV2,
  UploadApiResponse,
  UploadApiErrorResponse,
  UploadApiOptions,
} from "cloudinary";
// fs is no longer needed here

// --- Cloudinary Configuration ---
const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;

if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
  console.error(
    "❌ Fatal Error: Missing Cloudinary configuration. Please check your .env file for CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET."
  );
  throw new Error("Cloudinary configuration is incomplete. App cannot start.");
}

cloudinaryV2.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
  secure: true,
});

console.log("✅ Cloudinary configured successfully (from cloudinary.ts).");

/**
 * Uploads a file to Cloudinary.
 * @param filePath The local path to the file (e.g., from multer).
 * @param folder The Cloudinary folder to upload into.
 * @param publicId Optional: a specific public_id for the asset. If provided, will overwrite.
 * @returns Promise<UploadApiResponse>
 */
export const uploadToCloudinary = (
  filePath: string,
  folder: string,
  publicId?: string // Optional public_id
): Promise<UploadApiResponse> => {
  return new Promise((resolve, reject) => {
    const uploadOptions: UploadApiOptions = {
      folder: folder,
      resource_type: "auto",
      type: "upload",
    };

    if (publicId) {
      uploadOptions.public_id = publicId;
      uploadOptions.overwrite = true;
    }

    cloudinaryV2.uploader.upload(
      filePath,
      uploadOptions,
      (error?: UploadApiErrorResponse, result?: UploadApiResponse) => {
        // --- THIS IS THE FIX ---
        // We no longer delete the file from here. The controller will handle cleanup.
        if (error) {
          console.error("Cloudinary Upload Error:", error);
          return reject(error);
        }
        if (result) {
          return resolve(result);
        }
        return reject(
          new Error(
            "Cloudinary upload failed without specific error or result."
          )
        );
      }
    );
  });
};

export { cloudinaryV2 as cloudinary };
