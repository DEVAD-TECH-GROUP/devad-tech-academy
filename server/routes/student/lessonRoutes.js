import express from "express";
import {
  getLesson, completeLesson, updateProgress,
} from "../../controllers/student/lessonController.js";
import authenticate from "../../middlewares/auth/authenticate.js";
import isStudent from "../../middlewares/auth/isStudent.js";

const router = express.Router();
router.use(authenticate, isStudent);

router.get("/:id", getLesson);
router.post("/:id/complete", completeLesson);
router.post("/:id/progress", updateProgress);

export default router;