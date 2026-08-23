import express from "express";
import {
  getReferralStats, getReferralCode, getReferralList,
} from "../../controllers/student/referralController.js";
import authenticate from "../../middlewares/auth/authenticate.js";
import isStudent from "../../middlewares/auth/isStudent.js";

const router = express.Router();
router.use(authenticate, isStudent);

router.get("/stats", getReferralStats);
router.get("/code", getReferralCode);
router.get("/list", getReferralList);

export default router;