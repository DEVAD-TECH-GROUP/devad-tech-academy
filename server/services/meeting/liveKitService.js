
import { AccessToken } from "livekit-server-sdk";

import {
  LIVEKIT_URL,
  liveKitRoomService,
} from "../../config/livekit.js";

/**
 * Validate LiveKit credentials before creating participant tokens.
 */
const validateLiveKitCredentials = () => {
  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;

  if (!LIVEKIT_URL) {
    throw new Error("LIVEKIT_URL is missing from the server configuration");
  }

  if (!apiKey || !apiSecret) {
    throw new Error("LiveKit API credentials are missing");
  }

  return { apiKey, apiSecret };
};

/**
 * Generate a predictable, unique room name for a class.
 * The MongoDB class ID prevents collisions between classes with similar titles.
 */
const createRoomName = (className, classId) => {
  if (!classId) {
    throw new Error("A class ID is required to create a LiveKit room");
  }

  const slug =
    String(className || "live-class")
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 35) || "live-class";

  return `devad-${slug}-${String(classId)}`;
};

/**
 * Create the LiveKit room when the class is actually starting,
 * not when the class is merely scheduled.
 */
export const createLiveClassRoom = async ({
  className,
  classId,
  maxParticipants = 45,
}) => {
  if (!classId) {
    throw new Error("Class ID is required");
  }

  const capacity = Number(maxParticipants);

  if (!Number.isInteger(capacity) || capacity < 2) {
    throw new Error("Room capacity must be an integer of at least 2");
  }

  const roomName = createRoomName(className, classId);

  const room = await liveKitRoomService.createRoom({
    name: roomName,
    emptyTimeout: 600,
    departureTimeout: 20,
    maxParticipants: capacity,
    metadata: JSON.stringify({
      application: "DEVAD",
      classId: String(classId),
      className: String(className || "Live Class"),
    }),
  });

  return {
    name: room.name,
    url: LIVEKIT_URL,
    maxParticipants: room.maxParticipants || capacity,
  };
};

/**
 * Create a participant token.
 *
 * Identity must be stable and unique within the room.
 * The same user ID can safely join different class rooms.
 */
export const createLiveClassToken = async ({
  roomName,
  participantId,
  participantName,
  isInstructor = false,
}) => {
  if (!roomName) {
    throw new Error("LiveKit room name is required");
  }

  if (!participantId) {
    throw new Error("Participant identity is required");
  }

  const { apiKey, apiSecret } = validateLiveKitCredentials();

  const token = new AccessToken(apiKey, apiSecret, {
    identity: String(participantId),
    name:
      String(participantName || "").trim() ||
      (isInstructor ? "DEVAD Instructor" : "DEVAD Student"),
    ttl: "2h",
  });

  token.addGrant({
    roomJoin: true,
    room: roomName,
    canPublish: true,
    canSubscribe: true,
    canPublishData: true,
  });

  return token.toJwt();
};

/**
 * Instructor token.
 */
export const getInstructorToken = ({
  roomName,
  instructorId,
  instructorName,
}) =>
  createLiveClassToken({
    roomName,
    participantId: instructorId,
    participantName: instructorName || "DEVAD Instructor",
    isInstructor: true,
  });

/**
 * Student token.
 */
export const getStudentToken = ({
  roomName,
  studentId,
  studentName,
}) =>
  createLiveClassToken({
    roomName,
    participantId: studentId,
    participantName: studentName || "DEVAD Student",
    isInstructor: false,
  });

/**
 * Delete a room after the class has ended.
 */
export const deleteLiveClassRoom = async (roomName) => {
  if (!roomName) return null;

  return liveKitRoomService.deleteRoom(roomName);
};

/**
 * Retrieve a room by name.
 */
export const getLiveClassRoom = async (roomName) => {
  if (!roomName) {
    throw new Error("LiveKit room name is required");
  }

  const rooms = await liveKitRoomService.listRooms([roomName]);

  return Array.isArray(rooms) ? rooms[0] || null : null;
};
