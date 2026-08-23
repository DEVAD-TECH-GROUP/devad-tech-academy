import express from "express";
import {
  getAllReviews, getFlaggedReviews,
  removeReview, dismissFlag,
} from "../../controllers/superadmin/reviewController.js";
import authenticate from "../../middlewares/auth/authenticate.js";
import isSuperAdmin from "../../middlewares/auth/isSuperAdmin.js";

const router = express.Router();
router.use(authenticate, isSuperAdmin);

router.get("/", getAllReviews);
router.get("/flagged", getFlaggedReviews);
router.put("/:id/remove", removeReview);
router.put("/:id/dismiss-flag", dismissFlag);

export default router;