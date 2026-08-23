import express from "express";
import {
  getDashboardStats, getDashboardActivity, getDashboardCalendar,
} from "../../controllers/instructor/dashboardController.js";
import authenticate from "../../middlewares/auth/authenticate.js";
import isInstructor from "../../middlewares/auth/isInstructor.js";

const router = express.Router();
router.use(authenticate, isInstructor);

router.get("/stats", getDashboardStats);
router.get("/activity", getDashboardActivity);
router.get("/calendar", getDashboardCalendar);

export default router;