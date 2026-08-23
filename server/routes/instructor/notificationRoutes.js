import express from "express";
import {
  getNotifications, markNotificationRead, markAllNotificationsRead,
} from "../../controllers/instructor/notificationController.js";
import authenticate from "../../middlewares/auth/authenticate.js";
import isInstructor from "../../middlewares/auth/isInstructor.js";

const router = express.Router();
router.use(authenticate, isInstructor);

router.get("/", getNotifications);
router.put("/:id/read", markNotificationRead);
router.put("/read-all", markAllNotificationsRead);

export default router;