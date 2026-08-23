import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../../config/cloudinary.js";
import { UPLOAD_LIMITS, ALLOWED_FILE_TYPES } from "../../utils/constants.js";

const imageStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    return {
      folder: `devad-academy/images/${req.user._id}`,
      allowed_formats: ["jpg", "jpeg", "png", "gif", "webp"],
      transformation: [
        { width: 1280, height: 720, crop: "limit", quality: "auto" },
      ],
      public_id: `${Date.now()}-${file.originalname.split(".")[0]}`,
    };
  },
});

const imageFilter = (req, file, cb) => {
  if (ALLOWED_FILE_TYPES.IMAGE.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error("Invalid file type. Only JPG, PNG, GIF, WEBP allowed"),
      false
    );
  }
};

const imageUpload = multer({
  storage: imageStorage,
  limits: { fileSize: UPLOAD_LIMITS.IMAGE_SIZE },
  fileFilter: imageFilter,
});

export default imageUpload;
