import express from "express";
import {
  getMyLiveClasses, createLiveClass, getLiveClass,
  updateLiveClass, deleteLiveClass, startLiveClass,
  getLiveClassAttendance, saveLiveClassRecording,
} from "../../controllers/instructor/liveClassController.js";
import authenticate from "../../middlewares/auth/authenticate.js";
import isInstructor from "../../middlewares/auth/isInstructor.js";

const router = express.Router();
router.use(authenticate, isInstructor);

router.get("/", getMyLiveClasses);
router.post("/", createLiveClass);
router.get("/:id", getLiveClass);
router.put("/:id", updateLiveClass);
router.delete("/:id", deleteLiveClass);
router.post("/:id/start", startLiveClass);
router.get("/:id/attendance", getLiveClassAttendance);
router.post("/:id/recording", saveLiveClassRecording);

export default router;