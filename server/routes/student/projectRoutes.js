import express from "express";
import {
  getMyProjects, getProject, submitProject, getProjectFeedback,
} from "../../controllers/student/projectController.js";
import authenticate from "../../middlewares/auth/authenticate.js";
import isStudent from "../../middlewares/auth/isStudent.js";

const router = express.Router();
router.use(authenticate, isStudent);

router.get("/", getMyProjects);
router.get("/:id", getProject);
router.post("/:id/submit", submitProject);
router.get("/:id/feedback", getProjectFeedback);

export default router;