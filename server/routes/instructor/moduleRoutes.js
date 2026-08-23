import express from "express";
import {
  getModules, createModule, updateModule,
  deleteModule, reorderModules,
} from "../../controllers/instructor/moduleController.js";
import authenticate from "../../middlewares/auth/authenticate.js";
import isInstructor from "../../middlewares/auth/isInstructor.js";

const router = express.Router();
router.use(authenticate, isInstructor);

router.get("/:courseId/modules", getModules);
router.post("/:courseId/modules", createModule);
router.put("/:courseId/modules/reorder", reorderModules);
router.put("/:courseId/modules/:id", updateModule);
router.delete("/:courseId/modules/:id", deleteModule);

export default router;