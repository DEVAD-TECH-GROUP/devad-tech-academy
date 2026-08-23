import Notification from "../models/communication/Notification.js";

export const notificationSocket = (io, socket) => {
  // ── Get unread count on connect ───────────────────────
  socket.on("get_unread_count", async () => {
    try {
      const count = await Notification.countDocuments({
        recipient: socket.user._id,
        isRead: false,
      });

      socket.emit("unread_count", { count });
    } catch (error) {
      socket.emit("error", { message: error.message });
    }
  });

  // ── Mark notification as read ─────────────────────────
  socket.on("mark_notification_read", async (notificationId) => {
    try {
      await Notification.findByIdAndUpdate(notificationId, {
        isRead: true,
        readAt: new Date(),
      });

      const count = await Notification.countDocuments({
        recipient: socket.user._id,
        isRead: false,
      });

      socket.emit("unread_count", { count });
    } catch (error) {
      socket.emit("error", { message: error.message });
    }
  });

  // ── Mark all as read ──────────────────────────────────
  socket.on("mark_all_read", async () => {
    try {
      await Notification.updateMany(
        { recipient: socket.user._id, isRead: false },
        { isRead: true, readAt: new Date() }
      );

      socket.emit("unread_count", { count: 0 });
      socket.emit("all_notifications_read");
    } catch (error) {
      socket.emit("error", { message: error.message });
    }
  });
};

// ── Send notification via socket ──────────────────────────
export const sendSocketNotification = (io, userId, notification) => {
  io.to(`user_${userId}`).emit("new_notification", notification);
};

// ── Send notification to role ─────────────────────────────
export const sendRoleNotification = (io, role, notification) => {
  io.to(`role_${role}`).emit("new_notification", notification);
};