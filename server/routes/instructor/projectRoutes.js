import express from "express";

import {
  getMyProjects,
  createProject,
  getProject,
  updateProject,
  deleteProject,
  getProjectSubmissions,
  gradeProjectSubmission,
} from "../../controllers/instructor/projectController.js";

import authenticate from "../../middlewares/auth/authenticate.js";
import isInstructor from "../../middlewares/auth/isInstructor.js";

const router = express.Router();

// ============================================================
// INSTRUCTOR AUTHENTICATION
// ============================================================

router.use(
  authenticate,
  isInstructor
);

// ============================================================
// PROJECT LIST
// ============================================================

// GET /api/instructor/projects
router.get(
  "/",
  getMyProjects
);

// ============================================================
// CREATE PROJECT
// ============================================================

// POST /api/instructor/projects
router.post(
  "/",
  createProject
);

// ============================================================
// PROJECT SUBMISSIONS
// ============================================================

// IMPORTANT:
// This must remain before /:id routes for clarity.

// GET /api/instructor/projects/:id/submissions
router.get(
  "/:id/submissions",
  getProjectSubmissions
);

// PUT /api/instructor/projects/project-submissions/:id/grade
router.put(
  "/project-submissions/:id/grade",
  gradeProjectSubmission
);

// ============================================================
// SINGLE PROJECT
// ============================================================

// GET /api/instructor/projects/:id
router.get(
  "/:id",
  getProject
);

// PUT /api/instructor/projects/:id
router.put(
  "/:id",
  updateProject
);

// DELETE /api/instructor/projects/:id
router.delete(
  "/:id",
  deleteProject
);

export default router;