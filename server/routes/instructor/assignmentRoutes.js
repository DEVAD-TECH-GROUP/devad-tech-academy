import express from "express";

import {
  getMyAssignments,
  createAssignment,
  getAssignment,
  updateAssignment,
  deleteAssignment,
  getSubmissions,
  gradeSubmission,
} from "../../controllers/instructor/assignmentController.js";

import authenticate from "../../middlewares/auth/authenticate.js";
import isInstructor from "../../middlewares/auth/isInstructor.js";

const router = express.Router();

router.use(authenticate, isInstructor);

// Assignment management
router.get("/", getMyAssignments);
router.post("/", createAssignment);

// Submission management
router.get("/:id/submissions", getSubmissions);
router.put("/submissions/:id/grade", gradeSubmission);

// Individual assignment
router.get("/:id", getAssignment);
router.put("/:id", updateAssignment);
router.delete("/:id", deleteAssignment);

export default router;