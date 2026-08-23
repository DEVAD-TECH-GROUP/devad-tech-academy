import express from "express";
import {
  getMyPortfolio, updatePortfolio, addProject, deleteProject,
} from "../../controllers/student/portfolioController.js";
import authenticate from "../../middlewares/auth/authenticate.js";
import isStudent from "../../middlewares/auth/isStudent.js";

const router = express.Router();
router.use(authenticate, isStudent);

router.get("/", getMyPortfolio);
router.put("/", updatePortfolio);
router.post("/projects", addProject);
router.delete("/projects/:id", deleteProject);

export default router;