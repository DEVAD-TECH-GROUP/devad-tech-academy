import express from "express";
import {
  getUserAnalytics, getEnrollmentAnalytics, getCourseAnalytics,
  getRevenueAnalytics, getEngagementAnalytics,
  getDeviceAnalytics, getGeographyAnalytics, getInstructorAnalytics,
} from "../../controllers/superadmin/analyticsController.js";
import authenticate from "../../middlewares/auth/authenticate.js";
import isSuperAdmin from "../../middlewares/auth/isSuperAdmin.js";

const router = express.Router();
router.use(authenticate, isSuperAdmin);

router.get("/users", getUserAnalytics);
router.get("/enrollments", getEnrollmentAnalytics);
router.get("/courses", getCourseAnalytics);
router.get("/revenue", getRevenueAnalytics);
router.get("/engagement", getEngagementAnalytics);
router.get("/devices", getDeviceAnalytics);
router.get("/geography", getGeographyAnalytics);
router.get("/instructors", getInstructorAnalytics);

export default router;