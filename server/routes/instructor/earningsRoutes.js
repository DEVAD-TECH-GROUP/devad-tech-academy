import express from "express";
import {
  getEarningsSummary, getMonthlyEarnings, getEarningsHistory,
  requestPayout, getMyPayouts,
} from "../../controllers/instructor/earningsController.js";
import authenticate from "../../middlewares/auth/authenticate.js";
import isInstructor from "../../middlewares/auth/isInstructor.js";

const router = express.Router();
router.use(authenticate, isInstructor);

router.get("/summary", getEarningsSummary);
router.get("/monthly", getMonthlyEarnings);
router.get("/history", getEarningsHistory);
router.post("/request-payout", requestPayout);
router.get("/payouts", getMyPayouts);

export default router;