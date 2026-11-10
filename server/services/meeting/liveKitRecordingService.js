
import {
  EncodedFileOutput,
  EncodedFileType,
  EncodingOptionsPreset,
} from "livekit-server-sdk";

import env from "../../config/env.js";
import { liveKitEgress } from "../../config/livekitEgress.js";

const validateRecordingConfig = () => {
  const required = [
    ["B2_KEY_ID", env.B2_KEY_ID],
    ["B2_APPLICATION_KEY", env.B2_APPLICATION_KEY],
    ["B2_BUCKET_NAME", env.B2_BUCKET_NAME],
    ["B2_ENDPOINT", env.B2_ENDPOINT],
    ["B2_REGION", env.B2_REGION],
  ];

  const missing = required
    .filter(([, value]) => !value)
    .map(([name]) => name);

  if (missing.length) {
    throw new Error(
      `Recording configuration is incomplete. Missing: ${missing.join(", ")}`
    );
  }
};

const safePathPart = (value) =>
  String(value || "")
    .replace(/[^a-zA-Z0-9_-]/g, "");

const createRecordingObjectKey = ({
  classId,
  instructorId,
}) => {
  const safeClassId = safePathPart(classId);
  const safeInstructorId = safePathPart(instructorId);

  if (!safeClassId || !safeInstructorId) {
    throw new Error("Valid class and instructor IDs are required");
  }

  const timestamp = new Date()
    .toISOString()
    .replace(/[:.]/g, "-");

  return (
    `classes/${safeClassId}/` +
    `${safeInstructorId}/` +
    `${timestamp}.mp4`
  );
};

/**
 * Start a room-composite MP4 recording and save it directly to B2.
 */
export const startRoomRecording = async ({
  roomName,
  classId,
  instructorId,
}) => {
  validateRecordingConfig();

  if (!roomName) {
    throw new Error("LiveKit room name is required");
  }

  if (!classId || !instructorId) {
    throw new Error("Class and instructor information are required");
  }

  const objectKey = createRecordingObjectKey({
    classId,
    instructorId,
  });

  const output = new EncodedFileOutput({
    fileType: EncodedFileType.MP4,
    filepath: objectKey,
    output: {
      case: "s3",
      value: {
        accessKey: env.B2_KEY_ID,
        secret: env.B2_APPLICATION_KEY,
        bucket: env.B2_BUCKET_NAME,
        region: env.B2_REGION,
        endpoint: env.B2_ENDPOINT,
        forcePathStyle: true,
      },
    },
  });

  const result = await liveKitEgress.startRoomCompositeEgress(
    roomName,
    { file: output },
    {
      layout: "grid",
      encodingOptions: EncodingOptionsPreset.H264_720P_30,
      audioOnly: false,
    }
  );

  if (!result?.egressId) {
    throw new Error("LiveKit did not return a recording ID");
  }

  return {
    egressId: result.egressId,
    objectKey,
    status: result.status,
    startedAt: new Date(),
  };
};

/**
 * Stop an active recording.
 */
export const stopRoomRecording = async (egressId) => {
  if (!egressId) {
    throw new Error("Recording ID is required");
  }

  return liveKitEgress.stopEgress(egressId);
};

/**
 * Retrieve Egress information for a room.
 */
export const listRoomRecordings = async (roomName) => {
  if (!roomName) {
    throw new Error("LiveKit room name is required");
  }

  const result = await liveKitEgress.listEgress({
    roomName,
  });

  return Array.isArray(result)
    ? result
    : Array.isArray(result?.items)
      ? result.items
      : [];
};
