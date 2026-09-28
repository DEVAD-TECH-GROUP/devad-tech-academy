import api from "../../api/Api";

const DEBUG = true;

const log = (...args) => {
  if (DEBUG) {
    console.log("[DEVAD NOTIFICATION SERVICE]", ...args);
  }
};

const logSuccess = (...args) => {
  if (DEBUG) {
    console.log("[DEVAD NOTIFICATION SERVICE SUCCESS]", ...args);
  }
};

const logError = (...args) => {
  if (DEBUG) {
    console.error("[DEVAD NOTIFICATION SERVICE ERROR]", ...args);
  }
};

/**
 * ============================================================
 * GET SUPERADMIN NOTIFICATIONS
 * ============================================================
 */
export const getNotifications = async (params = {}) => {
  log("getNotifications() called");
  log("Params:", params);

  try {
    const response = await api.get("/superadmin/notifications", {
      params,
    });

    logSuccess("Notifications retrieved successfully");
    log("Status:", response.status);
    log("Response:", response.data);

    return response;
  } catch (error) {
    logError("Failed to get notifications");
    logError("Message:", error?.message);
    logError("Status:", error?.response?.status);
    logError("Response:", error?.response?.data);
    logError("Headers:", error?.response?.headers);

    throw error;
  }
};

/**
 * ============================================================
 * MARK ONE NOTIFICATION AS READ
 * ============================================================
 */
export const markRead = async (id) => {
  log("markRead() called");
  log("Notification ID:", id);

  if (!id) {
    const error = new Error("Notification ID is required");

    logError(error.message);

    throw error;
  }

  try {
    const response = await api.put(
      `/superadmin/notifications/${id}/read`
    );

    logSuccess("Notification marked as read");
    log("Status:", response.status);
    log("Response:", response.data);

    return response;
  } catch (error) {
    logError("Failed to mark notification as read");
    logError("Notification ID:", id);
    logError("Message:", error?.message);
    logError("Status:", error?.response?.status);
    logError("Response:", error?.response?.data);

    throw error;
  }
};

/**
 * ============================================================
 * MARK ALL NOTIFICATIONS AS READ
 * ============================================================
 */
export const markAllRead = async () => {
  log("markAllRead() called");

  try {
    const response = await api.put(
      "/superadmin/notifications/read-all"
    );

    logSuccess("All notifications marked as read");
    log("Status:", response.status);
    log("Response:", response.data);

    return response;
  } catch (error) {
    logError("Failed to mark all notifications as read");
    logError("Message:", error?.message);
    logError("Status:", error?.response?.status);
    logError("Response:", error?.response?.data);

    throw error;
  }
};

export default {
  getNotifications,
  markRead,
  markAllRead,
};