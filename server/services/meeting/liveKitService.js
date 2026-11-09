import { AccessToken } from "livekit-server-sdk";

import {
  LIVEKIT_URL,
  liveKitRoomService,
} from "../../config/livekit.js";

const createRoomName = (className, classId) => {
  const slug = String(className || "live-class")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 35) || "live-class";

  return `devad-${slug}-${String(classId || Date.now())}`;
};

export const createLiveClassRoom = async ({
  className,
  classId,
  maxParticipants = 2,
}) => {
  const capacity = Number(maxParticipants);

  if (!Number.isInteger(capacity) || capacity < 2) {
    throw new Error("Room capacity must be at least 2");
  }

  const roomName = createRoomName(className, classId);

  const room = await liveKitRoomService.createRoom({
    name: roomName,
    emptyTimeout: 600,
    departureTimeout: 20,
    maxParticipants: capacity,
    metadata: JSON.stringify({
      application: "DEVAD",
      classId: String(classId || ""),
      className: String(className || "Live Class"),
    }),
  });

  return {
    name: room.name,
    url: LIVEKIT_URL,
    maxParticipants: room.maxParticipants,
  };
};

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

  const token = new AccessToken(
    process.env.LIVEKIT_API_KEY,
    process.env.LIVEKIT_API_SECRET,
    {
      identity: String(participantId),
      name: participantName || (
        isInstructor ? "DEVAD Instructor" : "DEVAD Student"
      ),
      ttl: "2h",
    }
  );

  token.addGrant({
    roomJoin: true,
    room: roomName,
    canPublish: true,
    canSubscribe: true,
    canPublishData: true,
  });

  return await token.toJwt();
};

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

export const getStudentToken = ({
  roomName,
  studentId,
  studentName,
}) =>
  createLiveClassToken({
    roomName,
    participantId: studentId,
    participantName: studentName || "DEVAD Student",
  });

export const deleteLiveClassRoom = async (roomName) => {
  if (!roomName) return null;

  return liveKitRoomService.deleteRoom(roomName);
};

export const getLiveClassRoom = async (roomName) => {
  if (!roomName) {
    throw new Error("LiveKit room name is required");
  }

  return liveKitRoomService.listRooms([roomName]);
};
