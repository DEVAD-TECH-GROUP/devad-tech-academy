import express from "express";
import { getReferralStats, getReferralList, getReferralCode } from "../../controllers/instructor/referralController.js";
import authenticate from "../../middlewares/auth/authenticate.js";
import isInstructor from "../../middlewares/auth/isInstructor.js";

const router = express.Router();
router.use(authenticate, isInstructor);

router.get("/stats", getReferralStats);
router.get("/list", getReferralList);
router.get("/code", getReferralCode);

export default router;