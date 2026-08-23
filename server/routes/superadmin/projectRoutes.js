import express from "express";
import {
  getAllProjects, createProjectTemplate,
  getProject, getProjectAnalytics,
} from "../../controllers/superadmin/projectController.js";
import authenticate from "../../middlewares/auth/authenticate.js";
import isSuperAdmin from "../../middlewares/auth/isSuperAdmin.js";

const router = express.Router();
router.use(authenticate, isSuperAdmin);

router.get("/", getAllProjects);
router.post("/templates", createProjectTemplate);
router.get("/analytics", getProjectAnalytics);
router.get("/:id", getProject);

export default router;