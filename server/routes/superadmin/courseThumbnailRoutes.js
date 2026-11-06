
import express from "express";

import {
  getAllThumbnails,
  getActiveThumbnails,
  createThumbnail,
  updateThumbnail,
  toggleThumbnailStatus,
  deleteThumbnail,
} from "../../controllers/superadmin/courseThumbnailController.js";

import authenticate from "../../middlewares/auth/authenticate.js";
import isSuperAdmin from "../../middlewares/auth/isSuperAdmin.js";
import courseThumbnailUpload from "../../middlewares/upload/courseThumbnailUpload.js";

const router = express.Router();

// Admin-only thumbnail management
router.use(authenticate, isSuperAdmin);

router.get("/", getAllThumbnails);
router.post("/", courseThumbnailUpload.single("image"), createThumbnail);
router.put("/:id", updateThumbnail);
router.patch("/:id/status", toggleThumbnailStatus);
router.delete("/:id", deleteThumbnail);

export default router;
