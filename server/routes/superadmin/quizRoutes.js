import express from "express";
import {
  getAllQuizzes, getQuiz, getQuizResults,
  getIntegrityFlags, flagAttempt, getQuestionBank,
} from "../../controllers/superadmin/quizController.js";
import authenticate from "../../middlewares/auth/authenticate.js";
import isSuperAdmin from "../../middlewares/auth/isSuperAdmin.js";

const router = express.Router();
router.use(authenticate, isSuperAdmin);

router.get("/", getAllQuizzes);
router.get("/results", getQuizResults);
router.get("/integrity-flags", getIntegrityFlags);
router.get("/question-bank", getQuestionBank);
router.get("/:id", getQuiz);
router.post("/:id/flag", flagAttempt);

export default router;