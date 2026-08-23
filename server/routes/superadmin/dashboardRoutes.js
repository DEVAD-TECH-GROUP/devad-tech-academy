import express from "express";
import {
  getPlatformStats,
  getSystemHealth,
  getRecentActivity,
  getPlatformCalendar,
} from "../../controllers/superadmin/dashboardController.js";
import authenticate from "../../middlewares/auth/authenticate.js";
import isSuperAdmin from "../../middlewares/auth/isSuperAdmin.js";

const router = express.Router();
router.use(authenticate, isSuperAdmin);

router.get("/stats", getPlatformStats);
router.get("/health", getSystemHealth);
router.get("/activity", getRecentActivity);
router.get("/calendar", getPlatformCalendar);

export default router;