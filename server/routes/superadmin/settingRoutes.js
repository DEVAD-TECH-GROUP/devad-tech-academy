import express from "express";
import {
  getSettings, updateSettings, updateBranding,
  toggleMaintenance, backupNow, restoreBackup,
  updateSecuritySettings,
} from "../../controllers/superadmin/settingController.js";
import authenticate from "../../middlewares/auth/authenticate.js";
import isSuperAdmin from "../../middlewares/auth/isSuperAdmin.js";

const router = express.Router();
router.use(authenticate, isSuperAdmin);

router.get("/", getSettings);
router.put("/", updateSettings);
router.put("/branding", updateBranding);
router.put("/maintenance", toggleMaintenance);
router.post("/backup", backupNow);
router.post("/restore", restoreBackup);
router.put("/security", updateSecuritySettings);

export default router;