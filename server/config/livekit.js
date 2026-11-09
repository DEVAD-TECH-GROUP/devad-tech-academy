import { RoomServiceClient } from "livekit-server-sdk";
import env from "./env.js";

const LIVEKIT_CLIENT_URL = String(env.LIVEKIT_URL || "")
  .trim()
  .replace(/\/+$/, "");

if (!LIVEKIT_CLIENT_URL) {
  throw new Error("LIVEKIT_URL is missing from the server environment");
}

if (!env.LIVEKIT_API_KEY) {
  throw new Error("LIVEKIT_API_KEY is missing from the server environment");
}

if (!env.LIVEKIT_API_SECRET) {
  throw new Error("LIVEKIT_API_SECRET is missing from the server environment");
}

// Browser connection URL: wss://...
const LIVEKIT_URL = LIVEKIT_CLIENT_URL.replace(
  /^https:/i,
  "wss:"
);

// Server API URL: https://...
const LIVEKIT_SERVER_URL = LIVEKIT_CLIENT_URL
  .replace(/^wss:/i, "https:")
  .replace(/^ws:/i, "http:");

const liveKitRoomService = new RoomServiceClient(
  LIVEKIT_SERVER_URL,
  env.LIVEKIT_API_KEY,
  env.LIVEKIT_API_SECRET
);

export {
  LIVEKIT_URL,
  LIVEKIT_SERVER_URL,
  liveKitRoomService,
};

export default liveKitRoomService;
