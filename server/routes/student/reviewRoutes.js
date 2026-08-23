import express from "express";
import {
  leaveReview, updateReview, deleteReview,
} from "../../controllers/student/reviewController.js";
import authenticate from "../../middlewares/auth/authenticate.js";
import isStudent from "../../middlewares/auth/isStudent.js";

const router = express.Router();
router.use(authenticate, isStudent);

router.post("/:courseId", leaveReview);
router.put("/:id", updateReview);
router.delete("/:id", deleteReview);

export default router;