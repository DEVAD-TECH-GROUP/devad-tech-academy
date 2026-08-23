import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../../config/cloudinary.js";
import { UPLOAD_LIMITS, ALLOWED_FILE_TYPES } from "../../utils/constants.js";

const videoStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    return {
      folder: `devad-academy/videos/${req.user._id}`,
      resource_type: "video",
      allowed_formats: ["mp4", "mov", "avi", "mkv"],
      public_id: `${Date.now()}-${file.originalname.split(".")[0]}`,
    };
  },
});

const videoFilter = (req, file, cb) => {
  if (ALLOWED_FILE_TYPES.VIDEO.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error("Invalid file type. Only MP4, MOV, AVI, MKV allowed"),
      false
    );
  }
};

const videoUpload = multer({
  storage: videoStorage,
  limits: { fileSize: UPLOAD_LIMITS.VIDEO_SIZE },
  fileFilter: videoFilter,
});

export default videoUpload;