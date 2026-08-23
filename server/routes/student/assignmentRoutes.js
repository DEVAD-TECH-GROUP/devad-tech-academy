import express from "express";
import {
  getMyAssignments, getAssignment, submitAssignment,
  getSubmission, getFeedback,
} from "../../controllers/student/assignmentController.js";
import authenticate from "../../middlewares/auth/authenticate.js";
import isStudent from "../../middlewares/auth/isStudent.js";

const router = express.Router();
router.use(authenticate, isStudent);

router.get("/", getMyAssignments);
router.get("/:id", getAssignment);
router.post("/:id/submit", submitAssignment);
router.get("/:id/submission", getSubmission);
router.get("/:id/feedback", getFeedback);

export default router;