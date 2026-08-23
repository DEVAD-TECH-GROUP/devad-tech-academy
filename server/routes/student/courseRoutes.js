import express from "express";
import {
  browseCourses, getEnrolledCourses, getCompletedCourses,
  getWishlist, getCourse, enrollCourse,
  addToWishlist, removeFromWishlist,
} from "../../controllers/student/courseController.js";
import authenticate from "../../middlewares/auth/authenticate.js";
import isStudent from "../../middlewares/auth/isStudent.js";

const router = express.Router();
router.use(authenticate, isStudent);

router.get("/", browseCourses);
router.get("/enrolled", getEnrolledCourses);
router.get("/completed", getCompletedCourses);
router.get("/wishlist", getWishlist);
router.get("/:id", getCourse);
router.post("/:id/enroll", enrollCourse);
router.post("/:id/wishlist", addToWishlist);
router.delete("/:id/wishlist", removeFromWishlist);

export default router;