import Notification from "../../models/communication/Notification.js";
import User from "../../models/user/User.js";

// ── Create notification ───────────────────────────────────
export const createNotification = async ({
  recipientId,
  senderId = null,
  type,
  title,
  message,
  actionUrl = null,
  actionText = null,
  referenceModel = null,
  referenceId = null,
}) => {
  try {
    const notification = await Notification.create({
      recipient: recipientId,
      sender: senderId,
      type,
      title,
      message,
      actionUrl,
      actionText,
      reference: {
        model: referenceModel,
        id: referenceId,
      },
    });

    return notification;
  } catch (error) {
    console.error(`❌ Create notification error: ${error.message}`);
    throw error;
  }
};

// ── Create bulk notifications ─────────────────────────────
export const createBulkNotifications = async (notifications) => {
  try {
    const created = await Notification.insertMany(notifications);
    return created;
  } catch (error) {
    console.error(`❌ Bulk notification error: ${error.message}`);
    throw error;
  }
};

// ── Notify all students in a course ──────────────────────
export const notifyCourseStudents = async ({
  courseId,
  senderId,
  type,
  title,
  message,
  actionUrl = null,
}) => {
  try {
    const Enrollment = (
      await import("../../models/learning/Enrollment.js")
    ).default;

    const enrollments = await Enrollment.find({
      course: courseId,
      status: "active",
    }).select("student");

    const notifications = enrollments.map((enrollment) => ({
      recipient: enrollment.student,
      sender: senderId,
      type,
      title,
      message,
      actionUrl,
    }));

    return await createBulkNotifications(notifications);
  } catch (error) {
    console.error(`❌ Notify course students error: ${error.message}`);
    throw error;
  }
};

// ── Notify all users by role ──────────────────────────────
export const notifyByRole = async ({
  role,
  senderId,
  type,
  title,
  message,
  actionUrl = null,
}) => {
  try {
    const users = await User.find({ role, status: "active" })
      .select("_id");

    const notifications = users.map((user) => ({
      recipient: user._id,
      sender: senderId,
      type,
      title,
      message,
      actionUrl,
    }));

    return await createBulkNotifications(notifications);
  } catch (error) {
    console.error(`❌ Notify by role error: ${error.message}`);
    throw error;
  }
};

// ── Mark notification as read ─────────────────────────────
export const markAsRead = async (notificationId, userId) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, recipient: userId },
      { isRead: true, readAt: new Date() },
      { new: true }
    );
    return notification;
  } catch (error) {
    console.error(`❌ Mark as read error: ${error.message}`);
    throw error;
  }
};

// ── Mark all as read ──────────────────────────────────────
export const markAllAsRead = async (userId) => {
  try {
    await Notification.updateMany(
      { recipient: userId, isRead: false },
      { isRead: true, readAt: new Date() }
    );
  } catch (error) {
    console.error(`❌ Mark all as read error: ${error.message}`);
    throw error;
  }
};

// ── Get unread count ──────────────────────────────────────
export const getUnreadCount = async (userId) => {
  try {
    return await Notification.countDocuments({
      recipient: userId,
      isRead: false,
    });
  } catch (error) {
    console.error(`❌ Get unread count error: ${error.message}`);
    throw error;
  }
};