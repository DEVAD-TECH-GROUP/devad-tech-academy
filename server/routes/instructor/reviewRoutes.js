import express from "express";
import { getMyReviews, replyToReview } from "../../controllers/instructor/reviewController.js";
import authenticate from "../../middlewares/auth/authenticate.js";
import isInstructor from "../../middlewares/auth/isInstructor.js";

const router = express.Router();
router.use(authenticate, isInstructor);

router.get("/", getMyReviews);
router.post("/:id/reply", replyToReview);

export default router;
