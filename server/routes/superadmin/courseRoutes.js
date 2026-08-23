import express from "express";
import {
  getAllCourses, getCourse, createCourse, updateCourse,
  deleteCourse, approveCourse, rejectCourse, archiveCourse,
  featureCourse, getCourseAnalytics,
} from "../../controllers/superadmin/courseController.js";
import authenticate from "../../middlewares/auth/authenticate.js";
import isSuperAdmin from "../../middlewares/auth/isSuperAdmin.js";

const router = express.Router();
router.use(authenticate, isSuperAdmin);

router.get("/", getAllCourses);
router.post("/", createCourse);
router.get("/:id", getCourse);
router.put("/:id", updateCourse);
router.delete("/:id", deleteCourse);
router.put("/:id/approve", approveCourse);
router.put("/:id/reject", rejectCourse);
router.put("/:id/archive", archiveCourse);
router.put("/:id/feature", featureCourse);
router.get("/:id/analytics", getCourseAnalytics);

export default router;