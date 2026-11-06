
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../../config/cloudinary.js";
import { UPLOAD_LIMITS, ALLOWED_FILE_TYPES } from "../../utils/constants.js";

const thumbnailStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "devad-academy/course-thumbnails",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [
      {
        width: 1280,
        height: 720,
        crop: "fill",
        gravity: "auto",
        quality: "auto",
      },
    ],
    public_id: (req, file) =>
      `${Date.now()}-${file.originalname
        .replace(/\.[^/.]+$/, "")
        .replace(/[^a-zA-Z0-9-_]/g, "-")}`,
  },
});

const thumbnailFilter = (req, file, cb) => {
  if (ALLOWED_FILE_TYPES.IMAGE.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error("Invalid image. Only JPG, PNG and WEBP are allowed."),
      false
    );
  }
};

const courseThumbnailUpload = multer({
  storage: thumbnailStorage,
  limits: {
    fileSize: UPLOAD_LIMITS.IMAGE_SIZE,
  },
  fileFilter: thumbnailFilter,
});

export default courseThumbnailUpload;
