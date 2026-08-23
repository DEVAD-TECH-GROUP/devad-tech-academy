import express from "express";
import {
  getProfile, updateProfile, updateAvatar, updatePassword,
  enable2FA, updateSettings, getPublicProfile,
} from "../../controllers/student/profileController.js";
import authenticate from "../../middlewares/auth/authenticate.js";
import isStudent from "../../middlewares/auth/isStudent.js";
import imageUpload from "../../middlewares/upload/imageUpload.js";

const router = express.Router();
router.use(authenticate, isStudent);

router.get("/", getProfile);
router.put("/", updateProfile);
router.put("/avatar", imageUpload.single("avatar"), updateAvatar);
router.put("/password", updatePassword);
router.put("/2fa/enable", enable2FA);
router.put("/settings", updateSettings);
router.get("/public/:username", getPublicProfile);

export default router;