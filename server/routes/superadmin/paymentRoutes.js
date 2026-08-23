import express from "express";
import {
  getAllTransactions, getTransaction,
  getGateways, updateGateway,
} from "../../controllers/superadmin/paymentController.js";
import authenticate from "../../middlewares/auth/authenticate.js";
import isSuperAdmin from "../../middlewares/auth/isSuperAdmin.js";

const router = express.Router();
router.use(authenticate, isSuperAdmin);

router.get("/transactions", getAllTransactions);
router.get("/transactions/:id", getTransaction);
router.get("/gateways", getGateways);
router.put("/gateways/:name", updateGateway);

export default router;