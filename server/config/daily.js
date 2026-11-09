
import axios from "axios";
import env from "./env.js";

const baseURL = "https://api.daily.co/v1";

const headers = () => {
  if (!env.DAILY_API_KEY) {
    throw new Error(
      "DAILY_API_KEY is missing from the server environment"
    );
  }

  return {
    Authorization: `Bearer ${env.DAILY_API_KEY}`,
    "Content-Type": "application/json",
  };
};

// Daily account participant limit.
// Default: 2 participants for initial DEVAD testing.
const getMaxParticipants = (requestedLimit) => {
  const configuredLimit = Number(env.DAILY_MAX_PARTICIPANTS) || 2;
  const requested = Number(requestedLimit) || 2;

  return Math.max(
    2,
    Math.min(requested, configuredLimit)
  );
};

const dailyClient = {
  baseURL,


  // CREATE DAILY ROOM
  async createRoom(options = {}) {
    const maxParticipants = getMaxParticipants(
      options.maxParticipants
    );

    const payload = {
      name: options.name || `devad-${Date.now()}`,
      privacy: options.privacy || "private",
      properties: {
        max_participants: maxParticipants,
        enable_chat: true,
        enable_knocking: true,
        exp:
          options.exp ||
          Math.floor(Date.now() / 1000) + 7200,
      },
    };

    try {
      const response = await axios.post(
        `${baseURL}/rooms`,
        payload,
        { headers: headers() }
      );

      console.log("========== DAILY ROOM CREATED ==========");
      console.log("Room name:", response.data.name);
      console.log("Room URL:", response.data.url);
      console.log("Maximum participants:", maxParticipants);
      console.log("Cloud recording: Disabled");
      console.log("========================================");

      return response.data;
    } catch (error) {
      console.error(
        "========== DAILY CREATE ROOM ERROR =========="
      );
      console.error("HTTP status:", error.response?.status);
      console.error(
        "Response body:",
        JSON.stringify(error.response?.data, null, 2)
      );
      console.error(
        "Request payload:",
        JSON.stringify(payload, null, 2)
      );
      console.error("Message:", error.message);
      console.error(
        "=============================================="
      );

      throw error;
    }
  },


  // DELETE DAILY ROOM
  async deleteRoom(roomName) {
    const response = await axios.delete(
      `${baseURL}/rooms/${encodeURIComponent(roomName)}`,
      { headers: headers() }
    );

    return response.data;
  },

  // CREATE MEETING TOKEN
  async getMeetingToken(
    roomName,
    isOwner = false,
    options = {}
  ) {
    const properties = {
      room_name: roomName,
      is_owner: isOwner,
      user_name:
        options.userName ||
        (isOwner ? "DEVAD Instructor" : "DEVAD Student"),
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

  // START CLOUD RECORDING
  async startRecording(roomName) {
    const response = await axios.post(
      `${baseURL}/rooms/${encodeURIComponent(roomName)}/recordings/start`,
      {},
      { headers: headers() }
    );

    return response.data;
  },

  // STOP CLOUD RECORDING
  async stopRecording(roomName) {
    const response = await axios.post(
      `${baseURL}/rooms/${encodeURIComponent(roomName)}/recordings/stop`,
      {},
      { headers: headers() }
    );

    return response.data;
  },

  // GET ROOM RECORDINGS
  async getRecordings(roomName) {
    const response = await axios.get(
      `${baseURL}/recordings`,
      {
        headers: headers(),
        params: { room_name: roomName },
      }
    );

    return response.data;
  },

  // GET RECORDING ACCESS LINK
  async getRecordingAccessLink(recordingId) {
    const response = await axios.get(
      `${baseURL}/recordings/${encodeURIComponent(recordingId)}/access-link`,
      { headers: headers() }
    );

    return response.data;
  },
};

export default dailyClient;
