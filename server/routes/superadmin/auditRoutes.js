import express from "express";
import {
  getAuditLogs, getSecurityLogs,
  getPaymentLogs, getUserLogs,
} from "../../controllers/superadmin/auditController.js";
import authenticate from "../../middlewares/auth/authenticate.js";
import isSuperAdmin from "../../middlewares/auth/isSuperAdmin.js";

const router = express.Router();
router.use(authenticate, isSuperAdmin);

router.get("/", getAuditLogs);
router.get("/security", getSecurityLogs);
router.get("/payments", getPaymentLogs);
router.get("/users", getUserLogs);

export default router;