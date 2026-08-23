import Notification from "../../models/communication/Notification.js";
import paginate from "../../utils/pagination.js";
import sendResponse from "../../utils/sendResponse.js";
import asyncHandler from "../../middlewares/error/asyncHandler.js";
import { markAsRead, markAllAsRead, getUnreadCount } from "../../services/notification/inAppService.js";

export const getNotifications = asyncHandler(async (req, res) => {
  const result = await paginate(
    Notification,
    { recipient: req.user._id },
    { page: req.query.page, limit: req.query.limit, sort: { createdAt: -1 } }
  );
  const unreadCount = await getUnreadCount(req.user._id);
  sendResponse(res, 200, "Notifications retrieved", { ...result, unreadCount });
});

export const markNotificationRead = asyncHandler(async (req, res) => {
  await markAsRead(req.params.id, req.user._id);
  sendResponse(res, 200, "Notification marked as read");
});

export const markAllNotificationsRead = asyncHandler(async (req, res) => {
  await markAllAsRead(req.user._id);
  sendResponse(res, 200, "All notifications marked as read");
});