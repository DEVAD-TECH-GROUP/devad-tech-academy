import express from "express";
import {
  getProfile, updateProfile, updateAvatar, updatePassword,
  enable2FA, updateSettings,
} from "../../controllers/instructor/profileController.js";
import authenticate from "../../middlewares/auth/authenticate.js";
import isInstructor from "../../middlewares/auth/isInstructor.js";
import imageUpload from "../../middlewares/upload/imageUpload.js";

const router = express.Router();
router.use(authenticate, isInstructor);

router.get("/", getProfile);
router.put("/", updateProfile);
router.put("/avatar", imageUpload.single("avatar"), updateAvatar);
router.put("/password", updatePassword);
router.put("/2fa/enable", enable2FA);
router.put("/settings", updateSettings);

export default router;