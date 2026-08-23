import express from "express";
import {
  createAnnouncement, sendEmailCampaign,
  sendSMSBlast, sendPushNotification, broadcast,
} from "../../controllers/superadmin/communicationController.js";
import authenticate from "../../middlewares/auth/authenticate.js";
import isSuperAdmin from "../../middlewares/auth/isSuperAdmin.js";

const router = express.Router();
router.use(authenticate, isSuperAdmin);

router.post("/announce", createAnnouncement);
router.post("/email", sendEmailCampaign);
router.post("/sms", sendSMSBlast);
router.post("/push", sendPushNotification);
router.post("/broadcast", broadcast);

export default router;