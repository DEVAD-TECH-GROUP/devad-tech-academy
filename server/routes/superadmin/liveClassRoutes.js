import express from "express";
import {
  getAllLiveClasses, createLiveClass, getLiveClass,
  updateLiveClass, deleteLiveClass,
  getLiveClassAttendance, getLiveClassRecording,
} from "../../controllers/superadmin/liveClassController.js";
import authenticate from "../../middlewares/auth/authenticate.js";
import isSuperAdmin from "../../middlewares/auth/isSuperAdmin.js";

const router = express.Router();
router.use(authenticate, isSuperAdmin);

router.get("/", getAllLiveClasses);
router.post("/", createLiveClass);
router.get("/:id", getLiveClass);
router.put("/:id", updateLiveClass);
router.delete("/:id", deleteLiveClass);
router.get("/:id/attendance", getLiveClassAttendance);
router.get("/:id/recording", getLiveClassRecording);

export default router;