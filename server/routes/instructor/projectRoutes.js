import express from "express";
import {
  getMyProjects, createProject, getProject, updateProject,
  getProjectSubmissions, gradeProjectSubmission,
} from "../../controllers/instructor/projectController.js";
import authenticate from "../../middlewares/auth/authenticate.js";
import isInstructor from "../../middlewares/auth/isInstructor.js";

const router = express.Router();
router.use(authenticate, isInstructor);

router.get("/", getMyProjects);
router.post("/", createProject);
router.get("/:id", getProject);
router.put("/:id", updateProject);
router.get("/:id/submissions", getProjectSubmissions);
router.put("/project-submissions/:id/grade", gradeProjectSubmission);

export default router;