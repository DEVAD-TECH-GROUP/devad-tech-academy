import express from "express";
import {
  getMyProgress, getCourseProgress, getLearningPathProgress,
} from "../../controllers/student/progressController.js";
import authenticate from "../../middlewares/auth/authenticate.js";
import isStudent from "../../middlewares/auth/isStudent.js";

const router = express.Router();
router.use(authenticate, isStudent);

router.get("/", getMyProgress);
router.get("/:courseId", getCourseProgress);
router.get("/learning-path", getLearningPathProgress);

export default router;