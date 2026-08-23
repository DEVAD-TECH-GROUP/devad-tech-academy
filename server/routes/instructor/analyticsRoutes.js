import express from "express";
import {
  getAnalyticsOverview, getStudentAnalytics, getCourseAnalytics,
  getRevenueAnalytics, getWatchTimeAnalytics,
} from "../../controllers/instructor/analyticsController.js";
import authenticate from "../../middlewares/auth/authenticate.js";
import isInstructor from "../../middlewares/auth/isInstructor.js";

const router = express.Router();
router.use(authenticate, isInstructor);

router.get("/overview", getAnalyticsOverview);
router.get("/students", getStudentAnalytics);
router.get("/courses", getCourseAnalytics);
router.get("/revenue", getRevenueAnalytics);
router.get("/watch-time", getWatchTimeAnalytics);

export default router;