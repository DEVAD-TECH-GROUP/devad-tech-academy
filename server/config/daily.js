
import axios from "axios";
import env from "./env.js";

const baseURL = "https://api.daily.co/v1";

const headers = () => {
  if (!env.DAILY_API_KEY) {
    throw new Error("DAILY_API_KEY is missing from the server environment");
  }

  return {
    Authorization: `Bearer ${env.DAILY_API_KEY}`,
    "Content-Type": "application/json",
  };
};

const dailyClient = {
  baseURL,


async createRoom(options = {}) {
  const payload = {
    name: options.name || `devad-${Date.now()}`,
    privacy: options.privacy || "private",
    properties: {
      max_participants: options.maxParticipants ?? 100,
      enable_chat: true,
      enable_knocking: true,
      exp: options.exp || Math.floor(Date.now() / 1000) + 7200,
      ...(options.enableRecording ? { enable_recording: "cloud" } : {}),
    },
  };

  try {
    const response = await axios.post(
      `${baseURL}/rooms`,
      payload,
      { headers: headers() }
    );

    return response.data;
  } catch (error) {
    console.error("========== DAILY CREATE ROOM ERROR ==========");
    console.error("HTTP status:", error.response?.status);
    console.error(
      "Response body:",
      JSON.stringify(error.response?.data, null, 2)
    );
    console.error("Request payload:", JSON.stringify(payload, null, 2));
    console.error("==============================================");

    throw error;
  }
},

  async deleteRoom(roomName) {
    const response = await axios.delete(
      `${baseURL}/rooms/${encodeURIComponent(roomName)}`,
      { headers: headers() }
    );

    return response.data;
  },

  async getMeetingToken(roomName, isOwner = false, options = {}) {
    const properties = {
      room_name: roomName,
      is_owner: isOwner,
      user_name: options.userName || (isOwner ? "Instructor" : "Student"),
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 4,
    };

    if (isOwner && options.startCloudRecording) {
      properties.start_cloud_recording = true;
    }

    const response = await axios.post(
      `${baseURL}/meeting-tokens`,
      { properties },
      { headers: headers() }
    );

    return response.data;
  },

  async startRecording(roomName) {
    const response = await axios.post(
      `${baseURL}/rooms/${encodeURIComponent(roomName)}/recordings/start`,
      {},
      { headers: headers() }
    );

    return response.data;
  },

  async stopRecording(roomName) {
    const response = await axios.post(
      `${baseURL}/rooms/${encodeURIComponent(roomName)}/recordings/stop`,
      {},
      { headers: headers() }
    );

    return response.data;
  },

  async getRecordings(roomName) {
    const response = await axios.get(`${baseURL}/recordings`, {
      headers: headers(),
      params: { room_name: roomName },
    });

    return response.data;
  },

  async getRecordingAccessLink(recordingId) {
    const response = await axios.get(
      `${baseURL}/recordings/${encodeURIComponent(recordingId)}/access-link`,
      { headers: headers() }
    );

    return response.data;
  },
};

export default dailyClient;
