// backend/utils/cloudinary.js
import crypto from "crypto";
import { v2 as cloudinary } from "cloudinary";

// Settings are read when first needed, so the server still starts
// if Cloudinary is not configured yet.
let isConfigured = false;

function configureCloudinary() {
  if (isConfigured) {
    return;
  }

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    const error = new Error(
      "File storage is not configured. Add the Cloudinary settings to the server .env file."
    );
    error.statusCode = 500;
    throw error;
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });

  isConfigured = true;
}

// Sends a file held in memory (a Buffer from Multer) to Cloudinary.
// options: { folder, resourceType, deliveryType, publicId }
function uploadBuffer(buffer, options) {
  configureCloudinary();

  return new Promise(function (resolve, reject) {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: options.folder,
        resource_type: options.resourceType,
        type: options.deliveryType,
        public_id: options.publicId,
        overwrite: false,
      },
      function (error, result) {
        if (error) {
          return reject(error);
        }
        resolve(result);
      }
    );

    stream.end(buffer);
  });
}

// Creates a random, safe file name. The original name is never used for storage.
function randomName() {
  return crypto.randomBytes(16).toString("hex");
}

// PUBLIC image (banners, posters, covers). Returns { url, publicId }.
export async function uploadImage(buffer, folder) {
  const result = await uploadBuffer(buffer, {
    folder: "cta/" + folder,
    resourceType: "image",
    deliveryType: "upload",
    publicId: randomName(),
  });

  return { url: result.secure_url, publicId: result.public_id };
}

// PUBLIC audio (the anthem). Cloudinary treats audio as "video". Returns { url, publicId }.
export async function uploadAudio(buffer, folder) {
  const result = await uploadBuffer(buffer, {
    folder: "cta/" + folder,
    resourceType: "video",
    deliveryType: "upload",
    publicId: randomName(),
  });

  return { url: result.secure_url, publicId: result.public_id };
}

// PUBLIC document (by-laws PDF). Returns { url, publicId }.
// The extension is kept in the id so the link ends with .pdf.
export async function uploadPublicDocument(buffer, folder, extension) {
  const result = await uploadBuffer(buffer, {
    folder: "cta/" + folder,
    resourceType: "raw",
    deliveryType: "upload",
    publicId: randomName() + "." + extension,
  });

  return { url: result.secure_url, publicId: result.public_id };
}

// PRIVATE document (CVs). Stored as "authenticated", so it has NO public link.
// Only the publicId is returned. Use getPrivateDownloadUrl to let an admin download it.
export async function uploadPrivateDocument(buffer, folder, extension) {
  const result = await uploadBuffer(buffer, {
    folder: "cta/" + folder,
    resourceType: "raw",
    deliveryType: "authenticated",
    publicId: randomName() + "." + extension,
  });

  return { publicId: result.public_id };
}

// Makes a download link for a private file that stops working after a few minutes.
// Call this only after the admin login has been checked.
export function getPrivateDownloadUrl(publicId, minutes) {
  configureCloudinary();

  const lifetime = minutes || 5;
  const expiresAt = Math.floor(Date.now() / 1000) + lifetime * 60;

  return cloudinary.utils.private_download_url(publicId, "", {
    resource_type: "raw",
    type: "authenticated",
    expires_at: expiresAt,
  });
}

// Deletes a file. resourceType: "image", "video" (audio) or "raw" (documents).
// deliveryType: "upload" for public files, "authenticated" for private CVs.
export async function deleteFile(publicId, resourceType, deliveryType) {
  if (!publicId) {
    return;
  }

  configureCloudinary();

  await cloudinary.uploader.destroy(publicId, {
    resource_type: resourceType || "image",
    type: deliveryType || "upload",
  });
}