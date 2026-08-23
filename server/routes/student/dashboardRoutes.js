import express from "express";
import {
  getDashboardStats, getDashboardActivity,
  getStreak, getUpcoming,
} from "../../controllers/student/dashboardController.js";
import authenticate from "../../middlewares/auth/authenticate.js";
import isStudent from "../../middlewares/auth/isStudent.js";

const router = express.Router();
router.use(authenticate, isStudent);

router.get("/stats", getDashboardStats);
router.get("/activity", getDashboardActivity);
router.get("/streak", getStreak);
router.get("/upcoming", getUpcoming);

export default router;