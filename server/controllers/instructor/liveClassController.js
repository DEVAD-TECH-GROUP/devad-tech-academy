
import mongoose from "mongoose";
import LiveClass from "../../models/live/LiveClass.js";
import Attendance from "../../models/live/Attendance.js";
import paginate from "../../utils/pagination.js";
import sendResponse from "../../utils/sendResponse.js";
import asyncHandler from "../../middlewares/error/asyncHandler.js";

import {
  createLiveClassRoom,
  getInstructorToken,
  getLiveClassRecordings,
  startLiveClassRecording,
  stopLiveClassRecording,
  deleteLiveClassRoom,
  getLiveClassRecordingAccessLink,
} from "../../services/meeting/dailyService.js";

import { LIVE_CLASS_STATUS } from "../../utils/constants.js";

const findOwnedClass = (id, instructorId) => {
  if (!mongoose.isValidObjectId(id)) return null;

  return LiveClass.findOne({
    _id: id,
    instructor: instructorId,
  });
};

const safeClass = (liveClass) => {
  const data = liveClass.toObject
    ? liveClass.toObject()
    : { ...liveClass };

  if (data.meetingRoom) {
    delete data.meetingRoom.hostToken;
  }

  return data;
};

const extractRecordings = (response) => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.recordings)) return response.recordings;
  if (Array.isArray(response?.data?.recordings)) {
    return response.data.recordings;
  }
  return [];
};

const syncRecordingForClass = async (liveClass) => {
  const roomName = liveClass.meetingRoom?.roomName;

  if (!roomName) {
    throw new Error("Daily room is missing for this class");
  }

  const result = await getLiveClassRecordings(roomName);
  const recordings = extractRecordings(result);

  const finished = recordings
    .filter((item) => {
      const status = String(item.status || "").toLowerCase();

      return (
        status === "finished" ||
        status === "completed" ||
        Boolean(item.download_link || item.downloadLink || item.url)
      );
    })
    .sort((a, b) => {
      const aDate = new Date(a.created_at || a.createdAt || 0).getTime();
      const bDate = new Date(b.created_at || b.createdAt || 0).getTime();
      return bDate - aDate;
    });

  const recording = finished[0];

  if (!recording) {
    liveClass.recording.status = "processing";
    liveClass.recording.lastSyncAt = new Date();
    await liveClass.save();

    return null;
  }

  const recordingId =
    recording.id ||
    recording.recording_id ||
    recording.recordingId ||
    null;

  let url =
    recording.download_link ||
    recording.downloadLink ||
    recording.url ||
    null;

  // Some Daily recording responses need a separate access-link request.
  if (!url && recordingId) {
    const linkResult = await getLiveClassRecordingAccessLink(recordingId);

    url =
      linkResult?.download_link ||
      linkResult?.downloadLink ||
      linkResult?.url ||
      linkResult?.data?.download_link ||
      linkResult?.data?.url ||
      null;
  }

  if (!url) {
    liveClass.recording.status = "processing";
    liveClass.recording.lastSyncAt = new Date();
    await liveClass.save();

    return null;
  }

  liveClass.recording = {
    url,
    recordingId,
    duration: Number(recording.duration || 0),
    status: "available",
    lastSyncAt: new Date(),
  };

  await liveClass.save();

  return liveClass.recording;
};

// GET /instructor/live-classes
export const getMyLiveClasses = asyncHandler(async (req, res) => {
  const result = await paginate(
    LiveClass,
    { instructor: req.user._id },
    {
      page: req.query.page,
      limit: req.query.limit,
      populate: "course",
      sort: { scheduledAt: -1 },
    }
  );

  sendResponse(res, 200, "Live classes retrieved", result);
});

// POST /instructor/live-classes
export const createLiveClass = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    course,
    scheduledAt,
    duration = 120,
    timezone = "Africa/Lagos",
    maxParticipants = 100,
    isRecorded = true,
    materials = [],
    classNotes = null,
  } = req.body;

  if (!title?.trim() || !course || !scheduledAt) {
    return sendResponse(
      res,
      400,
      "Title, course and scheduled date are required"
    );
  }

  if (!mongoose.isValidObjectId(course)) {
    return sendResponse(res, 400, "Invalid course ID");
  }

  const scheduledDate = new Date(scheduledAt);

  if (Number.isNaN(scheduledDate.getTime())) {
    return sendResponse(res, 400, "Invalid scheduled date");
  }

  if (!Number.isFinite(Number(duration)) || Number(duration) < 1) {
    return sendResponse(res, 400, "Duration must be at least one minute");
  }

  if (
    !Number.isFinite(Number(maxParticipants)) ||
    Number(maxParticipants) < 2
  ) {
    return sendResponse(res, 400, "Maximum participants must be at least 2");
  }

  const room = await createLiveClassRoom({
    className: title,
    maxParticipants: Number(maxParticipants),
    durationMinutes: Number(duration),
    enableRecording: Boolean(isRecorded),
  });

  try {
    const liveClass = await LiveClass.create({
      title: title.trim(),
      description,
      course,
      scheduledAt: scheduledDate,
      duration: Number(duration),
      timezone,
      maxParticipants: Number(maxParticipants),
      isRecorded: Boolean(isRecorded),
      materials,
      classNotes,
      instructor: req.user._id,
      meetingRoom: {
        roomName: room.name,
        roomUrl: room.url,
      },
      recording: {
        status: "not_started",
      },
    });

    sendResponse(
      res,
      201,
      "Live class created",
      safeClass(liveClass)
    );
  } catch (error) {
    // Avoid leaving an orphaned Daily room if database creation fails.
    try {
      await deleteLiveClassRoom(room.name);
    } catch (cleanupError) {
      console.error("Failed to clean up Daily room:", cleanupError.message);
    }

    throw error;
  }
});

// GET /instructor/live-classes/:id
export const getLiveClass = asyncHandler(async (req, res) => {
  const liveClass = await findOwnedClass(req.params.id, req.user._id);

  if (!liveClass) {
    return sendResponse(res, 404, "Live class not found");
  }

  await liveClass.populate("course", "title");

  sendResponse(res, 200, "Live class retrieved", safeClass(liveClass));
});

// PUT /instructor/live-classes/:id
export const updateLiveClass = asyncHandler(async (req, res) => {
  const liveClass = await findOwnedClass(req.params.id, req.user._id);

  if (!liveClass) {
    return sendResponse(res, 404, "Live class not found");
  }

  if (
    liveClass.status === LIVE_CLASS_STATUS.LIVE ||
    liveClass.status === LIVE_CLASS_STATUS.ENDED
  ) {
    return sendResponse(res, 400, "Only scheduled classes can be edited");
  }

  const allowedFields = [
    "title",
    "description",
    "course",
    "scheduledAt",
    "duration",
    "timezone",
    "maxParticipants",
    "isRecorded",
    "materials",
    "classNotes",
  ];

  for (const field of allowedFields) {
    if (req.body[field] !== undefined) {
      liveClass[field] = req.body[field];
    }
  }

  if (
    !liveClass.title?.trim() ||
    !liveClass.course ||
    !liveClass.scheduledAt
  ) {
    return sendResponse(res, 400, "Title, course and date are required");
  }

  await liveClass.save();

  sendResponse(res, 200, "Live class updated", safeClass(liveClass));
});

// DELETE /instructor/live-classes/:id
export const deleteLiveClass = asyncHandler(async (req, res) => {
  const liveClass = await findOwnedClass(req.params.id, req.user._id);

  if (!liveClass) {
    return sendResponse(res, 404, "Live class not found");
  }

  if (liveClass.status === LIVE_CLASS_STATUS.LIVE) {
    return sendResponse(res, 400, "End the live class before deleting it");
  }

  await LiveClass.findByIdAndDelete(liveClass._id);

  if (liveClass.meetingRoom?.roomName) {
    try {
      await deleteLiveClassRoom(liveClass.meetingRoom.roomName);
    } catch (error) {
      // Database deletion succeeded; room cleanup can be retried separately.
      console.error("Daily room cleanup failed:", error.message);
    }
  }

  sendResponse(res, 200, "Live class deleted");
});

// POST /instructor/live-classes/:id/start
export const startLiveClass = asyncHandler(async (req, res) => {
  const liveClass = await findOwnedClass(req.params.id, req.user._id);

  if (!liveClass) {
    return sendResponse(res, 404, "Live class not found");
  }

  if (liveClass.status === LIVE_CLASS_STATUS.ENDED) {
    return sendResponse(res, 400, "This class has already ended");
  }

  if (liveClass.status === LIVE_CLASS_STATUS.LIVE) {
    return sendResponse(res, 400, "This class is already live");
  }

  const roomName = liveClass.meetingRoom?.roomName;
  const roomUrl = liveClass.meetingRoom?.roomUrl;

  if (!roomName || !roomUrl) {
    return sendResponse(res, 400, "Daily meeting room is not configured");
  }

  // Issue a fresh, short-lived host token instead of returning a stored token.
  const token = await getInstructorToken(roomName);

  if (liveClass.isRecorded) {
    liveClass.recording.status = "processing";
  }


  liveClass.status = LIVE_CLASS_STATUS.LIVE;
  liveClass.startedAt = new Date();
  liveClass.endedAt = null;

  await liveClass.save();

  const io = req.app.get("io");

  if (io) {
    io.to(`live_class_${liveClass._id}`).emit("live_class_started", {
      liveClassId: liveClass._id,
      startedAt: liveClass.startedAt,
    });
  }

  sendResponse(res, 200, "Live class started", {
    ...safeClass(liveClass),
    joinUrl: roomUrl,
    instructorToken: token.token,
  });
});

// POST /instructor/live-classes/:id/end
export const endLiveClass = asyncHandler(async (req, res) => {
  const liveClass = await findOwnedClass(req.params.id, req.user._id);

  if (!liveClass) {
    return sendResponse(res, 404, "Live class not found");
  }

  if (liveClass.status === LIVE_CLASS_STATUS.ENDED) {
    return sendResponse(res, 200, "Live class has already ended", safeClass(liveClass));
  }

  if (liveClass.isRecorded && liveClass.meetingRoom?.roomName) {
    try {
      await stopLiveClassRecording(liveClass.meetingRoom.roomName);
    } catch (error) {
      // Don't mark the class ended if the recording stop failed.
      console.error("Daily recording stop failed:", error.message);
      return sendResponse(
        res,
        502,
        "Could not stop the Daily recording. Please retry."
      );
    }
  }

  liveClass.status = LIVE_CLASS_STATUS.ENDED;
  liveClass.endedAt = new Date();

  if (liveClass.startedAt) {
    liveClass.actualDuration = Math.max(
      0,
      Math.round(
        (liveClass.endedAt.getTime() - liveClass.startedAt.getTime()) / 60000
      )
    );
  }

  if (liveClass.isRecorded) {
    liveClass.recording.status = "processing";
  }

  await liveClass.save();

  // Attempt to fetch the recording now. It may still be processing.
  let recording = null;

  if (liveClass.isRecorded) {
    try {
      recording = await syncRecordingForClass(liveClass);
    } catch (error) {
      console.error("Initial recording sync failed:", error.message);
    }
  }

  const io = req.app.get("io");

  if (io) {
    io.to(`live_class_${liveClass._id}`).emit("live_class_ended", {
      liveClassId: liveClass._id,
      endedAt: liveClass.endedAt,
    });
  }

  sendResponse(res, 200, recording
    ? "Class ended and recording saved"
    : "Class ended. Recording may still be processing; sync again shortly", {
    ...safeClass(liveClass),
    recording: liveClass.recording,
  });
});

// GET /instructor/live-classes/:id/attendance
export const getLiveClassAttendance = asyncHandler(async (req, res) => {
  const liveClass = await findOwnedClass(req.params.id, req.user._id).select("_id");

  if (!liveClass) {
    return sendResponse(res, 404, "Live class not found");
  }

  const attendance = await Attendance.find({ liveClass: liveClass._id })
    .populate("student", "firstName lastName email avatar")
    .sort({ createdAt: -1 });

  sendResponse(res, 200, "Attendance retrieved", attendance);
});

// POST /instructor/live-classes/:id/sync-recording
export const syncLiveClassRecording = asyncHandler(async (req, res) => {
  const liveClass = await findOwnedClass(req.params.id, req.user._id);

  if (!liveClass) {
    return sendResponse(res, 404, "Live class not found");
  }

  if (!liveClass.isRecorded) {
    return sendResponse(res, 400, "Recording is disabled for this class");
  }

  if (liveClass.status !== LIVE_CLASS_STATUS.ENDED) {
    return sendResponse(res, 400, "End the class before syncing its recording");
  }

  const recording = await syncRecordingForClass(liveClass);

  if (!recording) {
    return sendResponse(
      res,
      202,
      "Recording is still processing. Please try again shortly",
      { status: "processing" }
    );
  }

  sendResponse(res, 200, "Recording synchronized", recording);
});

// GET /instructor/live-classes/:id/recording
export const getLiveClassRecording = asyncHandler(async (req, res) => {
  const liveClass = await findOwnedClass(req.params.id, req.user._id)
    .select("title status recording isRecorded");

  if (!liveClass) {
    return sendResponse(res, 404, "Live class not found");
  }

  if (!liveClass.recording?.url) {
    return sendResponse(
      res,
      404,
      "No recording is available yet",
      { status: liveClass.recording?.status || "not_started" }
    );
  }

  sendResponse(res, 200, "Recording retrieved", liveClass.recording);
});

// POST /instructor/live-classes/:id/recording
// Retained for compatibility with existing clients.
export const saveLiveClassRecording = asyncHandler(async (req, res) => {
  const liveClass = await findOwnedClass(req.params.id, req.user._id);

  if (!liveClass) {
    return sendResponse(res, 404, "Live class not found");
  }

  return sendResponse(
    res,
    400,
    "Use the Daily recording sync endpoint instead of manually submitting recording URLs"
  );
});
