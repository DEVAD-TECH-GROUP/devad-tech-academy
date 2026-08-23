import express from "express";
import {
  getMyCourses, createCourse, getCourse, updateCourse,
  deleteCourse, publishCourse, submitForReview, getCourseAnalytics,
} from "../../controllers/instructor/courseController.js";
import authenticate from "../../middlewares/auth/authenticate.js";
import isInstructor from "../../middlewares/auth/isInstructor.js";

const router = express.Router();
router.use(authenticate, isInstructor);

router.get("/", getMyCourses);
router.post("/", createCourse);
router.get("/:id", getCourse);
router.put("/:id", updateCourse);
router.delete("/:id", deleteCourse);
router.put("/:id/publish", publishCourse);
router.put("/:id/submit-review", submitForReview);
router.get("/:id/analytics", getCourseAnalytics);

export default router;