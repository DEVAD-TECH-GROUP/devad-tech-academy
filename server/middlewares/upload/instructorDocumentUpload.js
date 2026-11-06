import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../../config/cloudinary.js";

import {
  UPLOAD_LIMITS,
  ALLOWED_FILE_TYPES,
} from "../../utils/constants.js";

const instructorDocumentStorage = new CloudinaryStorage({
  cloudinary,

  params: async (req, file) => {
    const originalName = file.originalname || "instructor-cv";

    const fileName = originalName
      .replace(/\.[^/.]+$/, "")
      .replace(/[^a-zA-Z0-9_-]/g, "-")
      .slice(0, 80);

    return {
      folder: "devad-academy/instructor-applications",
      resource_type: "raw",
      allowed_formats: ["pdf", "doc", "docx", "ppt", "pptx"],
      public_id: `${Date.now()}-${fileName}`,
    };
  },
});

const instructorDocumentFilter = (req, file, cb) => {
  if (ALLOWED_FILE_TYPES.DOCUMENT.includes(file.mimetype)) {
    return cb(null, true);
  }

  return cb(
    new Error(
      "Invalid file type. Only PDF, DOC, DOCX, PPT, and PPTX files are allowed"
    ),
    false
  );
};

const instructorDocumentUpload = multer({
  storage: instructorDocumentStorage,

  limits: {
    fileSize: UPLOAD_LIMITS.DOCUMENT_SIZE,
  },

  fileFilter: instructorDocumentFilter,
});

export default instructorDocumentUpload;
