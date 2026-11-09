
import dailyClient from "../../config/daily.js";

export const createLiveClassRoom = async ({
  className,
  maxParticipants = 100,
  durationMinutes = 120,
  enableRecording = true,
}) => {
  const slug = String(className || "live-class")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 45) || "live-class";

  const roomName = `devad-${slug}-${Date.now()}`;
  const exp = Math.floor(Date.now() / 1000) + durationMinutes * 60 + 3600;

  return dailyClient.createRoom({
    name: roomName,
    privacy: "private",
    maxParticipants,
    enableRecording,
    exp,
  });
};


export const getInstructorToken = (roomName) =>
  dailyClient.getMeetingToken(roomName, true, {
    userName: "DEVAD Instructor",
    startCloudRecording: true,
  });


export const getStudentToken = (roomName, userName = "DEVAD Student") =>
  dailyClient.getMeetingToken(roomName, false, { userName });

export const deleteLiveClassRoom = (roomName) =>
  dailyClient.deleteRoom(roomName);

export const startLiveClassRecording = (roomName) =>
  dailyClient.startRecording(roomName);

export const stopLiveClassRecording = (roomName) =>
  dailyClient.stopRecording(roomName);

export const getLiveClassRecordings = (roomName) =>
  dailyClient.getRecordings(roomName);

export const getLiveClassRecordingAccessLink = (recordingId) =>
  dailyClient.getRecordingAccessLink(recordingId);

