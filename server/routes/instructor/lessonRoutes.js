import express from "express";

import {
  getLessons,
  getLesson,
  createLesson,
  updateLesson,
  deleteLesson,
  uploadVideo,
  uploadResource,
} from "../../controllers/instructor/lessonController.js";

import authenticate from "../../middlewares/auth/authenticate.js";
import isInstructor from "../../middlewares/auth/isInstructor.js";

import videoUpload from "../../middlewares/upload/videoUpload.js";
import documentUpload from "../../middlewares/upload/documentUpload.js";

const router = express.Router();

// ============================================================
// INSTRUCTOR AUTHENTICATION
// ============================================================

router.use(authenticate, isInstructor);

// ============================================================
// LESSONS
// ============================================================

// GET /api/instructor/modules/:moduleId/lessons
router.get(
  "/:moduleId/lessons",
  getLessons
);

// POST /api/instructor/modules/:moduleId/lessons
router.post(
  "/:moduleId/lessons",
  createLesson
);

// ============================================================
// LESSON FILES
// ============================================================

// POST /api/instructor/lessons/:id/upload-video
router.post(
  "/:id/upload-video",
  videoUpload.single("video"),
  uploadVideo
);

// POST /api/instructor/lessons/:id/upload-resource
router.post(
  "/:id/upload-resource",
  documentUpload.single("resource"),
  uploadResource
);

// ============================================================
// SINGLE LESSON
// ============================================================

// GET /api/instructor/modules/:moduleId/lessons/:id
router.get(
  "/:moduleId/lessons/:id",
  getLesson
);

// PUT /api/instructor/modules/:moduleId/lessons/:id
router.put(
  "/:moduleId/lessons/:id",
  updateLesson
);

// DELETE /api/instructor/modules/:moduleId/lessons/:id
router.delete(
  "/:moduleId/lessons/:id",
  deleteLesson
);

export default router;