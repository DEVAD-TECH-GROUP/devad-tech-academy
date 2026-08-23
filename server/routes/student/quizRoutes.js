import express from "express";
import {
  getMyQuizzes, getQuiz, startQuiz,
  submitQuiz, getQuizResults, reviewQuiz,
} from "../../controllers/student/quizController.js";
import authenticate from "../../middlewares/auth/authenticate.js";
import isStudent from "../../middlewares/auth/isStudent.js";

const router = express.Router();
router.use(authenticate, isStudent);

router.get("/", getMyQuizzes);
router.get("/:id", getQuiz);
router.post("/:id/start", startQuiz);
router.post("/:id/submit", submitQuiz);
router.get("/:id/results", getQuizResults);
router.get("/:id/review", reviewQuiz);

export default router;