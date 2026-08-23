import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../../config/cloudinary.js";
import { UPLOAD_LIMITS, ALLOWED_FILE_TYPES } from "../../utils/constants.js";

const codeStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    return {
      folder: `devad-academy/code/${req.user._id}`,
      resource_type: "raw",
      allowed_formats: ["zip", "tar", "gz"],
      public_id: `${Date.now()}-${file.originalname.split(".")[0]}`,
    };
  },
});

const codeFilter = (req, file, cb) => {
  if (ALLOWED_FILE_TYPES.CODE.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error("Invalid file type. Only ZIP, TAR, GZ allowed"),
      false
    );
  }
};

const codeUpload = multer({
  storage: codeStorage,
  limits: { fileSize: UPLOAD_LIMITS.CODE_SIZE },
  fileFilter: codeFilter,
});

export default codeUpload;