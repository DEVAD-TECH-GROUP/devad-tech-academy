import express from "express";

import {
  getMyAssignments,
  createAssignment,
  getAssignment,
  updateAssignment,
  deleteAssignment,
  getSubmissions,
  gradeSubmission,
  uploadAssignmentAttachments,
} from "../../controllers/instructor/assignmentController.js";

import authenticate from "../../middlewares/auth/authenticate.js";
import isInstructor from "../../middlewares/auth/isInstructor.js";
import documentUpload from "../../middlewares/upload/documentUpload.js";

const router = express.Router();

router.use(authenticate, isInstructor);

// Assignment management
router.get("/", getMyAssignments);
router.post("/", createAssignment);

// Upload assignment attachments
router.post(
  "/attachments/upload",
  documentUpload.array("files", 10),
  uploadAssignmentAttachments
);

// Submission management
router.get("/:id/submissions", getSubmissions);
router.put("/submissions/:id/grade", gradeSubmission);

// Individual assignment
router.get("/:id", getAssignment);
router.put("/:id", updateAssignment);
router.delete("/:id", deleteAssignment);

export default router;
