import cloudinary from "../../config/cloudinary.js";

// ── Upload image ──────────────────────────────────────────
export const uploadImage = async (filePath, folder = "devad-academy/images") => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder,
      resource_type: "image",
      transformation: [
        { width: 1280, height: 720, crop: "limit", quality: "auto" },
      ],
    });
    return {
      public_id: result.public_id,
      url: result.secure_url,
    };
  } catch (error) {
    console.error(`❌ Cloudinary image upload error: ${error.message}`);
    throw error;
  }
};

// ── Upload video ──────────────────────────────────────────
export const uploadVideo = async (filePath, folder = "devad-academy/videos") => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder,
      resource_type: "video",
    });
    return {
      public_id: result.public_id,
      url: result.secure_url,
      duration: result.duration,
    };
  } catch (error) {
    console.error(`❌ Cloudinary video upload error: ${error.message}`);
    throw error;
  }
};

// ── Upload document ───────────────────────────────────────
export const uploadDocument = async (filePath, folder = "devad-academy/documents") => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder,
      resource_type: "raw",
    });
    return {
      public_id: result.public_id,
      url: result.secure_url,
      size: result.bytes,
      format: result.format,
    };
  } catch (error) {
    console.error(`❌ Cloudinary document upload error: ${error.message}`);
    throw error;
  }
};

// ── Delete file ───────────────────────────────────────────
export const deleteFile = async (publicId, resourceType = "image") => {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });
    return result;
  } catch (error) {
    console.error(`❌ Cloudinary delete error: ${error.message}`);
    throw error;
  }
};

// ── Delete multiple files ─────────────────────────────────
export const deleteMultipleFiles = async (publicIds, resourceType = "image") => {
  try {
    const result = await cloudinary.api.delete_resources(publicIds, {
      resource_type: resourceType,
    });
    return result;
  } catch (error) {
    console.error(`❌ Cloudinary bulk delete error: ${error.message}`);
    throw error;
  }
};

// ── Get file info ─────────────────────────────────────────
export const getFileInfo = async (publicId) => {
  try {
    const result = await cloudinary.api.resource(publicId);
    return result;
  } catch (error) {
    console.error(`❌ Cloudinary get info error: ${error.message}`);
    throw error;
  }
};

// ── Generate signed URL ───────────────────────────────────
export const generateSignedUrl = (publicId, options = {}) => {
  return cloudinary.url(publicId, {
    secure: true,
    sign_url: true,
    ...options,
  });
};