import express from "express";

import {
  getMyCourses,
  createCourse,
  getCourse,
  getCourseBuildData,
  updateCourse,
  deleteCourse,
  publishCourse,
  submitForReview,
  getCourseAnalytics,
  rebuildCourseStatistics,
} from "../../controllers/instructor/courseController.js";

import authenticate from "../../middlewares/auth/authenticate.js";
import isInstructor from "../../middlewares/auth/isInstructor.js";

const router = express.Router();

// ============================================================
// INSTRUCTOR AUTHENTICATION
// ============================================================

router.use(authenticate, isInstructor);

// ============================================================
// COURSE LIST
// ============================================================

// GET /api/instructor/courses
router.get("/", getMyCourses);

// ============================================================
// CREATE COURSE
// ============================================================

// POST /api/instructor/courses
router.post("/", createCourse);

// ============================================================
// SINGLE COURSE
// ============================================================

// GET /api/instructor/courses/:id
router.get("/:id", getCourse);

// PUT /api/instructor/courses/:id
router.put("/:id", updateCourse);

// DELETE /api/instructor/courses/:id
router.delete("/:id", deleteCourse);

// ============================================================
// COMPLETE COURSE BUILDER DATA
// ============================================================

// GET /api/instructor/courses/:id/build
//
// Returns:
// - Course
// - Modules
// - Lessons
// - Projects
// - FAQs
// - Resources
//
router.get("/:id/build", getCourseBuildData);

// ============================================================
// COURSE PUBLISH / REVIEW
// ============================================================

// Existing frontend compatibility
// PUT /api/instructor/courses/:id/publish
router.put("/:id/publish", publishCourse);

// Preferred endpoint
// PUT /api/instructor/courses/:id/submit-review
router.put(
  "/:id/submit-review",
  submitForReview
);

// ============================================================
// COURSE ANALYTICS
// ============================================================

// GET /api/instructor/courses/:id/analytics
router.get(
  "/:id/analytics",
  getCourseAnalytics
);

// ============================================================
// REBUILD COURSE STATISTICS
// ============================================================

// PUT /api/instructor/courses/:id/rebuild-statistics
router.put(
  "/:id/rebuild-statistics",
  rebuildCourseStatistics
);

export default router;
