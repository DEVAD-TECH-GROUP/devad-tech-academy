import express from "express";
import { processRefund, getRefunds } from "../../controllers/superadmin/refundController.js";
import authenticate from "../../middlewares/auth/authenticate.js";
import isSuperAdmin from "../../middlewares/auth/isSuperAdmin.js";

const router = express.Router();
router.use(authenticate, isSuperAdmin);

router.get("/", getRefunds);
router.post("/", processRefund);

export default router;