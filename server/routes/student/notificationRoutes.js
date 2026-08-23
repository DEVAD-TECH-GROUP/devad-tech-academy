import express from "express";
import {
  getNotifications, markNotificationRead, markAllNotificationsRead,
} from "../../controllers/student/notificationController.js";
import authenticate from "../../middlewares/auth/authenticate.js";
import isStudent from "../../middlewares/auth/isStudent.js";

const router = express.Router();
router.use(authenticate, isStudent);

router.get("/", getNotifications);
router.put("/:id/read", markNotificationRead);
router.put("/read-all", markAllNotificationsRead);

export default router;