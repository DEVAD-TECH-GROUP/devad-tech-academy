
import express from "express";

import {
  getMyLiveClasses,
  createLiveClass,
  getLiveClass,
  getInstructorJoinToken,
  updateLiveClass,
  deleteLiveClass,
  startLiveClass,
  endLiveClass,
  getLiveClassAttendance,
  startLiveClassRecording,
  stopLiveClassRecording,
  saveLiveClassRecording,
  getLiveClassRecording,
  syncLiveClassRecording,
} from "../../controllers/instructor/liveClassController.js";

import authenticate from "../../middlewares/auth/authenticate.js";
import isInstructor from "../../middlewares/auth/isInstructor.js";

const router = express.Router();

// All routes require an authenticated instructor.
router.use(authenticate, isInstructor);

// ─────────────────────────────────────────────
// LIVE CLASS MANAGEMENT
// ─────────────────────────────────────────────

router.get("/", getMyLiveClasses);
router.post("/", createLiveClass);

router.get("/:id", getLiveClass);
router.put("/:id", updateLiveClass);
router.delete("/:id", deleteLiveClass);

// ─────────────────────────────────────────────
// CLASSROOM ACCESS
// ─────────────────────────────────────────────

router.post("/:id/join-token", getInstructorJoinToken);
router.post("/:id/start", startLiveClass);
router.post("/:id/end", endLiveClass);

// ─────────────────────────────────────────────
// ATTENDANCE
// ─────────────────────────────────────────────

router.get("/:id/attendance", getLiveClassAttendance);

// ─────────────────────────────────────────────
// RECORDING MANAGEMENT
// ─────────────────────────────────────────────

// Start recording
router.post(
  "/:id/recording/start",
  startLiveClassRecording
);

// Stop recording
router.post(
  "/:id/recording/stop",
  stopLiveClassRecording
);

// Get recording status and playback URL
router.get(
  "/:id/recording",
  getLiveClassRecording
);

// Synchronize LiveKit Egress and B2 status
router.post(
  "/:id/sync-recording",
  syncLiveClassRecording
);

// Legacy endpoint for older clients
router.post(
  "/:id/recording",
  saveLiveClassRecording
);

export default router;
