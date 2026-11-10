
import { EgressClient } from "livekit-server-sdk";
import env from "./env.js";

const serverUrl = String(env.LIVEKIT_URL || "")
  .trim()
  .replace(/\/+$/, "")
  .replace(/^wss:/i, "https:")
  .replace(/^ws:/i, "http:");

if (!serverUrl) {
  throw new Error("LIVEKIT_URL is missing");
}

if (!env.LIVEKIT_API_KEY || !env.LIVEKIT_API_SECRET) {
  throw new Error("LiveKit API credentials are missing");
}

export const liveKitEgress = new EgressClient(
  serverUrl,
  env.LIVEKIT_API_KEY,
  env.LIVEKIT_API_SECRET
);

export default liveKitEgress;
