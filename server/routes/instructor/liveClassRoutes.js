
import express from "express";

import {
  getMyLiveClasses,
  createLiveClass,
  getLiveClass,
  updateLiveClass,
  deleteLiveClass,
  startLiveClass,
  endLiveClass,
  getLiveClassAttendance,
  saveLiveClassRecording,
  getLiveClassRecording,
  syncLiveClassRecording,
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
router.post("/:id/end", endLiveClass);

router.get("/:id/attendance", getLiveClassAttendance);

router.get("/:id/recording", getLiveClassRecording);
router.post("/:id/sync-recording", syncLiveClassRecording);

// Kept to provide a clear response to older clients.
router.post("/:id/recording", saveLiveClassRecording);

export default router;
