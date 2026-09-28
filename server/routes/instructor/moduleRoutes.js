import express from "express";

import {
  getModules,
  getModule,
  createModule,
  updateModule,
  deleteModule,
  reorderModules,
} from "../../controllers/instructor/moduleController.js";

import authenticate from "../../middlewares/auth/authenticate.js";
import isInstructor from "../../middlewares/auth/isInstructor.js";

const router = express.Router();

// ============================================================
// INSTRUCTOR AUTHENTICATION
// ============================================================

router.use(authenticate, isInstructor);

// ============================================================
// COURSE MODULES
// ============================================================

// GET /api/instructor/courses/:courseId/modules
router.get(
  "/:courseId/modules",
  getModules
);

// POST /api/instructor/courses/:courseId/modules
router.post(
  "/:courseId/modules",
  createModule
);

// PUT /api/instructor/courses/:courseId/modules/reorder
router.put(
  "/:courseId/modules/reorder",
  reorderModules
);

// ============================================================
// SINGLE MODULE
// ============================================================

// GET /api/instructor/courses/:courseId/modules/:id
router.get(
  "/:courseId/modules/:id",
  getModule
);

// PUT /api/instructor/courses/:courseId/modules/:id
router.put(
  "/:courseId/modules/:id",
  updateModule
);

// DELETE /api/instructor/courses/:courseId/modules/:id
router.delete(
  "/:courseId/modules/:id",
  deleteModule
);

export default router;
