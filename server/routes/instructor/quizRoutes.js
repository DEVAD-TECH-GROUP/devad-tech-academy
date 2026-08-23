import express from "express";
import {
  getMyQuizzes, createQuiz, getQuiz, updateQuiz, deleteQuiz,
  addQuestion, updateQuestion, deleteQuestion, getQuizResults,
} from "../../controllers/instructor/quizController.js";
import authenticate from "../../middlewares/auth/authenticate.js";
import isInstructor from "../../middlewares/auth/isInstructor.js";

const router = express.Router();
router.use(authenticate, isInstructor);

router.get("/", getMyQuizzes);
router.post("/", createQuiz);
router.get("/:id", getQuiz);
router.put("/:id", updateQuiz);
router.delete("/:id", deleteQuiz);
router.post("/:id/questions", addQuestion);
router.put("/:id/questions/:qId", updateQuestion);
router.delete("/:id/questions/:qId", deleteQuestion);
router.get("/:id/results", getQuizResults);

export default router;