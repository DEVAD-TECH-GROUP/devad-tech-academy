import axios from "axios";
import env from "../../config/env.js";

const oneSignalAPI = axios.create({
  baseURL: "https://onesignal.com/api/v1",
  headers: {
    Authorization: `Basic ${env.ONESIGNAL_API_KEY}`,
    "Content-Type": "application/json",
  },
});

// ── Send push to specific users ───────────────────────────
export const sendPushToUsers = async ({
  userIds,
  title,
  message,
  url = null,
  data = {},
}) => {
  try {
    const response = await oneSignalAPI.post("/notifications", {
      app_id: env.ONESIGNAL_APP_ID,
      include_external_user_ids: userIds.map(String),
      headings: { en: title },
      contents: { en: message },
      ...(url && { url }),
      data,
    });
    return response.data;
  } catch (error) {
    console.error(`❌ Push notification error: ${error.message}`);
    throw error;
  }
};

// ── Send push to all users ────────────────────────────────
export const sendPushToAll = async ({
  title,
  message,
  url = null,
  data = {},
}) => {
  try {
    const response = await oneSignalAPI.post("/notifications", {
      app_id: env.ONESIGNAL_APP_ID,
      included_segments: ["All"],
      headings: { en: title },
      contents: { en: message },
      ...(url && { url }),
      data,
    });
    return response.data;
  } catch (error) {
    console.error(`❌ Push to all error: ${error.message}`);
    throw error;
  }
};

// ── Send push by segment ──────────────────────────────────
export const sendPushBySegment = async ({
  segment,
  title,
  message,
  url = null,
}) => {
  try {
    const response = await oneSignalAPI.post("/notifications", {
      app_id: env.ONESIGNAL_APP_ID,
      included_segments: [segment],
      headings: { en: title },
      contents: { en: message },
      ...(url && { url }),
    });
    return response.data;
  } catch (error) {
    console.error(`❌ Push by segment error: ${error.message}`);
    throw error;
  }
};

// ── Schedule push notification ────────────────────────────
export const schedulePush = async ({
  userIds,
  title,
  message,
  sendAfter,
  url = null,
}) => {
  try {
    const response = await oneSignalAPI.post("/notifications", {
      app_id: env.ONESIGNAL_APP_ID,
      include_external_user_ids: userIds.map(String),
      headings: { en: title },
      contents: { en: message },
      send_after: sendAfter,
      ...(url && { url }),
    });
    return response.data;
  } catch (error) {
    console.error(`❌ Schedule push error: ${error.message}`);
    throw error;
  }
};