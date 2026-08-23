import express from "express";
import {
  getLearningPaths, createLearningPath, getLearningPath,
  updateLearningPath, deleteLearningPath, assignLearningPath,
} from "../../controllers/superadmin/learningPathController.js";
import authenticate from "../../middlewares/auth/authenticate.js";
import isSuperAdmin from "../../middlewares/auth/isSuperAdmin.js";

const router = express.Router();
router.use(authenticate, isSuperAdmin);

router.get("/", getLearningPaths);
router.post("/", createLearningPath);
router.get("/:id", getLearningPath);
router.put("/:id", updateLearningPath);
router.delete("/:id", deleteLearningPath);
router.post("/:id/assign", assignLearningPath);

export default router;