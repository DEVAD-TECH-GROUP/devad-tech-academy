import express from "express";
import {
  getAIConfig, updateAIConfig, getAIUsage,
  getAITemplates, createAITemplate, updateAITemplate,
} from "../../controllers/superadmin/aiController.js";
import authenticate from "../../middlewares/auth/authenticate.js";
import isSuperAdmin from "../../middlewares/auth/isSuperAdmin.js";

const router = express.Router();
router.use(authenticate, isSuperAdmin);

router.get("/config", getAIConfig);
router.put("/config", updateAIConfig);
router.get("/usage", getAIUsage);
router.get("/templates", getAITemplates);
router.post("/templates", createAITemplate);
router.put("/templates/:id", updateAITemplate);

export default router;