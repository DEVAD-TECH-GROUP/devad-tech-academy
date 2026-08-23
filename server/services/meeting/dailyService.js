import dailyClient from "../../config/daily.js";

// ── Create live class room ────────────────────────────────
export const createLiveClassRoom = async ({
  className,
  maxParticipants = 100,
  durationMinutes = 120,
}) => {
  try {
    const roomName = `devad-${className
      .toLowerCase()
      .replace(/\s+/g, "-")}-${Date.now()}`;

    const exp = Math.floor(Date.now() / 1000) + durationMinutes * 60;

    const room = await dailyClient.createRoom({
      name: roomName,
      privacy: "private",
      maxParticipants,
      enableRecording: true,
      exp,
    });

    return room;
  } catch (error) {
    console.error(`❌ Daily create room error: ${error.message}`);
    throw error;
  }
};

// ── Get instructor token ──────────────────────────────────
export const getInstructorToken = async (roomName) => {
  try {
    const token = await dailyClient.getMeetingToken(roomName, true);
    return token;
  } catch (error) {
    console.error(`❌ Daily instructor token error: ${error.message}`);
    throw error;
  }
};

// ── Get student token ─────────────────────────────────────
export const getStudentToken = async (roomName) => {
  try {
    const token = await dailyClient.getMeetingToken(roomName, false);
    return token;
  } catch (error) {
    console.error(`❌ Daily student token error: ${error.message}`);
    throw error;
  }
};

// ── Delete room ───────────────────────────────────────────
export const deleteLiveClassRoom = async (roomName) => {
  try {
    const result = await dailyClient.deleteRoom(roomName);
    return result;
  } catch (error) {
    console.error(`❌ Daily delete room error: ${error.message}`);
    throw error;
  }
};

// ── Get recordings ────────────────────────────────────────
export const getLiveClassRecordings = async (roomName) => {
  try {
    const recordings = await dailyClient.getRecordings(roomName);
    return recordings;
  } catch (error) {
    console.error(`❌ Daily get recordings error: ${error.message}`);
    throw error;
  }
};