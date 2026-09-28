import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../../config/cloudinary.js";
import {
  UPLOAD_LIMITS,
  ALLOWED_FILE_TYPES,
} from "../../utils/constants.js";

const documentStorage = new CloudinaryStorage({
  cloudinary,

  params: async (req, file) => {
    const userId = req.user?._id || req.user?.id;

    if (!userId) {
      throw new Error(
        "Authenticated user is required before uploading a document"
      );
    }

    const originalName = file.originalname || "document";
    const fileNameWithoutExtension = originalName.replace(/\.[^/.]+$/, "");

    return {
      folder: `devad-academy/documents/${userId}`,
      resource_type: "raw",
      allowed_formats: ["pdf", "doc", "docx", "ppt", "pptx"],
      public_id: `${Date.now()}-${fileNameWithoutExtension}`,
    };
  },
});

const documentFilter = (req, file, cb) => {
  if (ALLOWED_FILE_TYPES.DOCUMENT.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Invalid file type. Only PDF, DOC, DOCX, PPT, and PPTX files are allowed"
      ),
      false
    );
  }
};

const documentUpload = multer({
  storage: documentStorage,
  limits: {
    fileSize: UPLOAD_LIMITS.DOCUMENT_SIZE,
  },
  fileFilter: documentFilter,
});

export default documentUpload;
