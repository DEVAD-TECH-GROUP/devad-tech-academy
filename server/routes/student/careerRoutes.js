import express from "express";
import {
  getJobs, getInternships, getResume, updateResume,
} from "../../controllers/student/careerController.js";
import authenticate from "../../middlewares/auth/authenticate.js";
import isStudent from "../../middlewares/auth/isStudent.js";

const router = express.Router();
router.use(authenticate, isStudent);

router.get("/jobs", getJobs);
router.get("/internships", getInternships);
router.get("/resume", getResume);
router.put("/resume", updateResume);

export default router;