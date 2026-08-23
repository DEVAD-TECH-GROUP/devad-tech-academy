import express from "express";
import {
  subscribe, verifyPaymentCallback, getPaymentHistory,
  getReceipt, getSubscription,
} from "../../controllers/student/paymentController.js";
import authenticate from "../../middlewares/auth/authenticate.js";
import isStudent from "../../middlewares/auth/isStudent.js";
import { paymentLimiter } from "../../middlewares/security/rateLimiter.js";

const router = express.Router();
router.use(authenticate, isStudent);

router.post("/subscribe", paymentLimiter, subscribe);
router.post("/verify", verifyPaymentCallback);
router.get("/history", getPaymentHistory);
router.get("/receipts/:id", getReceipt);
router.get("/subscription", getSubscription);

export default router;