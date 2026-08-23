import express from "express";
import { getPayouts, processPayout, getPayout } from "../../controllers/superadmin/payoutController.js";
import authenticate from "../../middlewares/auth/authenticate.js";
import isSuperAdmin from "../../middlewares/auth/isSuperAdmin.js";

const router = express.Router();
router.use(authenticate, isSuperAdmin);

router.get("/", getPayouts);
router.post("/process", processPayout);
router.get("/:id", getPayout);

export default router;