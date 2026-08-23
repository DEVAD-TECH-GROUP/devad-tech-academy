import express from "express";
import {
  getNotifications, markNotificationRead, markAllNotificationsRead,
} from "../../controllers/superadmin/notificationController.js";
import authenticate from "../../middlewares/auth/authenticate.js";
import isSuperAdmin from "../../middlewares/auth/isSuperAdmin.js";

const router = express.Router();
router.use(authenticate, isSuperAdmin);

router.get("/", getNotifications);
router.put("/:id/read", markNotificationRead);
router.put("/read-all", markAllNotificationsRead);

export default router;