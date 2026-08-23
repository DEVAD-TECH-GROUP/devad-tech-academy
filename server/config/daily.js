import axios from "axios";
import env from "./env.js";

const dailyClient = {
  baseURL: "https://api.daily.co/v1",
  headers: {
    Authorization: `Bearer ${env.DAILY_API_KEY}`,
    "Content-Type": "application/json",
  },

  // ── Create meeting room ───────────────────────────────
  createRoom: async (options = {}) => {
    try {
      const response = await axios.post(
        `${dailyClient.baseURL}/rooms`,
        {
          name: options.name || `devad-${Date.now()}`,
          privacy: options.privacy || "private",
          properties: {
            max_participants: options.maxParticipants || 100,
            enable_recording: options.enableRecording || true,
            enable_chat: true,
            enable_knocking: true,
            exp: options.exp || Math.floor(Date.now() / 1000) + 7200, // 2 hours
          },
        },
        { headers: dailyClient.headers }
      );
      return response.data;
    } catch (error) {
      console.error(`❌ Daily.co create room error: ${error.message}`);
      throw error;
    }
  },

  // ── Delete room ───────────────────────────────────────
  deleteRoom: async (roomName) => {
    try {
      const response = await axios.delete(
        `${dailyClient.baseURL}/rooms/${roomName}`,
        { headers: dailyClient.headers }
      );
      return response.data;
    } catch (error) {
      console.error(`❌ Daily.co delete room error: ${error.message}`);
      throw error;
    }
  },

  // ── Get meeting token ─────────────────────────────────
  getMeetingToken: async (roomName, isOwner = false) => {
    try {
      const response = await axios.post(
        `${dailyClient.baseURL}/meeting-tokens`,
        {
          properties: {
            room_name: roomName,
            is_owner: isOwner,
            enable_recording: isOwner,
          },
        },
        { headers: dailyClient.headers }
      );
      return response.data;
    } catch (error) {
      console.error(`❌ Daily.co token error: ${error.message}`);
      throw error;
    }
  },

  // ── Get recordings ────────────────────────────────────
  getRecordings: async (roomName) => {
    try {
      const response = await axios.get(
        `${dailyClient.baseURL}/recordings?room_name=${roomName}`,
        { headers: dailyClient.headers }
      );
      return response.data;
    } catch (error) {
      console.error(`❌ Daily.co recordings error: ${error.message}`);
      throw error;
    }
  },
};

export default dailyClient;