import express from "express";
import {
  getRevenueSummary, getExpenses, getMonthlyReport,
  getAnnualReport, exportFinancial,
} from "../../controllers/superadmin/financialController.js";
import authenticate from "../../middlewares/auth/authenticate.js";
import isSuperAdmin from "../../middlewares/auth/isSuperAdmin.js";

const router = express.Router();
router.use(authenticate, isSuperAdmin);

router.get("/revenue", getRevenueSummary);
router.get("/expenses", getExpenses);
router.get("/monthly", getMonthlyReport);
router.get("/annual", getAnnualReport);
router.get("/export", exportFinancial);

export default router;