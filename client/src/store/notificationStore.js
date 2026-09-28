import { create } from "zustand";

import {
  getNotifications,
  markRead as markNotificationRead,
  markAllRead as markAllNotificationsRead,
} from "../services/superadmin/notificationService";

const DEBUG = true;

const log = (...args) => {
  if (DEBUG) {
    console.log("[DEVAD NOTIFICATION STORE]", ...args);
  }
};

const logSuccess = (...args) => {
  if (DEBUG) {
    console.log("[DEVAD NOTIFICATION STORE SUCCESS]", ...args);
  }
};

const logWarning = (...args) => {
  if (DEBUG) {
    console.warn("[DEVAD NOTIFICATION STORE WARNING]", ...args);
  }
};

const logError = (...args) => {
  if (DEBUG) {
    console.error("[DEVAD NOTIFICATION STORE ERROR]", ...args);
  }
};

const useNotificationStore = create((set, get) => ({
  // ==========================================================
  // STATE
  // ==========================================================

  notifications: [],
  unreadCount: 0,

  loading: false,
  markingRead: false,
  markingAllRead: false,

  error: null,

  // ==========================================================
  // FETCH NOTIFICATIONS
  // ==========================================================

  fetch: async (params = {}) => {
    log("fetch() called");
    log("Params:", params);

    set({
      loading: true,
      error: null,
    });

    try {
      const response = await getNotifications(params);

      log("Raw service response:", response);

      const responseData = response?.data;

      log("API response data:", responseData);

      /*
       * Expected backend structure:
       *
       * {
       *   success: true,
       *   message: "...",
       *   data: {
       *     data: [],
       *     unreadCount: 0
       *   }
       * }
       */

      const payload = responseData?.data;

      const notifications = Array.isArray(payload?.data)
        ? payload.data
        : Array.isArray(payload)
        ? payload
        : [];

      const unreadCount =
        typeof payload?.unreadCount === "number"
          ? payload.unreadCount
          : notifications.filter((notification) => !notification.isRead)
              .length;

      log("Normalized notifications:", notifications);
      log("Normalized unread count:", unreadCount);

      set({
        notifications,
        unreadCount,
        loading: false,
        error: null,
      });

      logSuccess(
        `Fetched ${notifications.length} notification(s)`
      );

      return notifications;
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to load notifications";

      logError("fetch() failed");
      logError("Message:", message);
      logError("Status:", error?.response?.status);
      logError("Response:", error?.response?.data);

      set({
        loading: false,
        error: message,
      });

      throw error;
    }
  },

  // ==========================================================
  // MARK ONE AS READ
  // ==========================================================

  markRead: async (id) => {
    log("markRead() called");
    log("Notification ID:", id);

    if (!id) {
      logWarning("markRead() called without an ID");
      return;
    }

    const currentNotifications = get().notifications;

    const notification = currentNotifications.find(
      (item) => item._id === id
    );

    if (!notification) {
      logWarning(
        "Notification was not found in local state:",
        id
      );
    }

    if (notification?.isRead) {
      log("Notification is already marked as read");
      return;
    }

    set({
      markingRead: true,
      error: null,
    });

    try {
      const response = await markNotificationRead(id);

      log("markRead service response:", response?.data);

      /*
       * Update local state only after backend succeeds.
       */

      set((state) => {
        const notificationExists = state.notifications.some(
          (item) => item._id === id
        );

        if (!notificationExists) {
          return {
            markingRead: false,
          };
        }

        const wasUnread = state.notifications.find(
          (item) => item._id === id
        )?.isRead === false;

        return {
          notifications: state.notifications.map((item) =>
            item._id === id
              ? {
                  ...item,
                  isRead: true,
                }
              : item
          ),

          unreadCount: wasUnread
            ? Math.max(0, state.unreadCount - 1)
            : state.unreadCount,

          markingRead: false,
          error: null,
        };
      });

      logSuccess(
        `Notification ${id} marked as read`
      );

      return response;
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to mark notification as read";

      logError("markRead() failed");
      logError("Notification ID:", id);
      logError("Message:", message);
      logError("Status:", error?.response?.status);
      logError("Response:", error?.response?.data);

      set({
        markingRead: false,
        error: message,
      });

      throw error;
    }
  },

  // ==========================================================
  // MARK ALL AS READ
  // ==========================================================

  markAllRead: async () => {
    log("markAllRead() called");

    const { unreadCount } = get();

    if (unreadCount === 0) {
      log("No unread notifications. Nothing to do.");
      return;
    }

    set({
      markingAllRead: true,
      error: null,
    });

    try {
      const response = await markAllNotificationsRead();

      log(
        "markAllRead service response:",
        response?.data
      );

      set((state) => ({
        notifications: state.notifications.map(
          (notification) => ({
            ...notification,
            isRead: true,
          })
        ),

        unreadCount: 0,

        markingAllRead: false,
        error: null,
      }));

      logSuccess("All notifications marked as read");

      return response;
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to mark all notifications as read";

      logError("markAllRead() failed");
      logError("Message:", message);
      logError("Status:", error?.response?.status);
      logError("Response:", error?.response?.data);

      set({
        markingAllRead: false,
        error: message,
      });

      throw error;
    }
  },

  // ==========================================================
  // ADD NEW NOTIFICATION
  // ==========================================================

  addNew: (notification) => {
    log("addNew() called");
    log("Notification:", notification);

    if (!notification) {
      logWarning(
        "addNew() received an empty notification"
      );
      return;
    }

    const isUnread = !notification.isRead;

    set((state) => ({
      notifications: [
        notification,
        ...state.notifications,
      ],

      unreadCount: isUnread
        ? state.unreadCount + 1
        : state.unreadCount,
    }));

    logSuccess("New notification added to store");
  },

  // ==========================================================
  // CLEAR ERROR
  // ==========================================================

  clearError: () => {
    log("clearError() called");

    set({
      error: null,
    });
  },

  // ==========================================================
  // RESET
  // ==========================================================

  reset: () => {
    log("reset() called");

    set({
      notifications: [],
      unreadCount: 0,
      loading: false,
      markingRead: false,
      markingAllRead: false,
      error: null,
    });
  },
}));

export default useNotificationStore;
