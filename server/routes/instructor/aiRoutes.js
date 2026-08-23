import express from "express";
import {
  generateQuiz, generateAssignmentAI, generateOutline,
  explainConceptAI, analyzePerformance,
} from "../../controllers/instructor/aiController.js";
import authenticate from "../../middlewares/auth/authenticate.js";
import isInstructor from "../../middlewares/auth/isInstructor.js";

const router = express.Router();
router.use(authenticate, isInstructor);

router.post("/generate-quiz", generateQuiz);
router.post("/generate-assignment", generateAssignmentAI);
router.post("/generate-outline", generateOutline);
router.post("/explain-concept", explainConceptAI);
router.post("/analyze-performance", analyzePerformance);

export default router;