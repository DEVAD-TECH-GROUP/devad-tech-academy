import express from "express";
import {
  getIntegrations, updateIntegration,
  getAPIKeys, createAPIKey, deleteAPIKey,
  getWebhooks, createWebhook,
} from "../../controllers/superadmin/integrationController.js";
import authenticate from "../../middlewares/auth/authenticate.js";
import isSuperAdmin from "../../middlewares/auth/isSuperAdmin.js";

const router = express.Router();
router.use(authenticate, isSuperAdmin);

router.get("/", getIntegrations);
router.put("/:name", updateIntegration);
router.get("/api-keys", getAPIKeys);
router.post("/api-keys", createAPIKey);
router.delete("/api-keys/:id", deleteAPIKey);
router.get("/webhooks", getWebhooks);
router.post("/webhooks", createWebhook);

export default router;