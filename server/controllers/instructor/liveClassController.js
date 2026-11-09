
import LiveClass from "../../models/live/LiveClass.js";
import Attendance from "../../models/live/Attendance.js";
import paginate from "../../utils/pagination.js";
import sendResponse from "../../utils/sendResponse.js";
import asyncHandler from "../../middlewares/error/asyncHandler.js";

import {
  createLiveClassRoom,
  getInstructorToken,
  getLiveClassRecordings,
} from "../../services/meeting/dailyService.js";

import { LIVE_CLASS_STATUS } from "../../utils/constants.js";

// ─────────────────────────────────────────────
// Helper: Find an instructor's live class
// ─────────────────────────────────────────────
const findInstructorLiveClass = (id, instructorId) =>
  LiveClass.findOne({
    _id: id,
    instructor: instructorId,
  });

// ─────────────────────────────────────────────
// Helper: Extract recording data from Daily
// ─────────────────────────────────────────────
const extractRecording = (response) => {
  const recordings = Array.isArray(response)
    ? response
    : response?.data?.recordings ||
      response?.recordings ||
      response?.data ||
      [];

  if (!Array.isArray(recordings) || recordings.length === 0) {
    return null;
  }

  // Prefer a completed recording with a downloadable URL.
  const recording = [...recordings]
    .reverse()
    .find(
      (item) =>
        item?.status === "finished" ||
        item?.status === "completed" ||
        item?.download_link ||
        item?.url
    );

  if (!recording) return null;

  return {
    url:
      recording.download_link ||
      recording.url ||
      recording.downloadUrl ||
      null,

    recordingId:
      recording.id ||
      recording.recording_id ||
      recording.recordingId ||
      null,

    duration: Number(
      recording.duration ||
      recording.duration_seconds ||
      0
    ),
  };
};

// ─────────────────────────────────────────────
// GET MY LIVE CLASSES
// ─────────────────────────────────────────────
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

// ─────────────────────────────────────────────
// CREATE LIVE CLASS
// ─────────────────────────────────────────────
export const createLiveClass = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    course,
    scheduledAt,
    duration = 60,
    timezone = "Africa/Lagos",
    maxParticipants = 100,
    isRecorded = true,
    materials = [],
    classNotes = null,
  } = req.body;

  if (!title || !course || !scheduledAt) {
    return sendResponse(
      res,
      400,
      "Title, course and scheduled date are required"
    );
  }

  const scheduledDate = new Date(scheduledAt);

  if (Number.isNaN(scheduledDate.getTime())) {
    return sendResponse(res, 400, "Invalid scheduled date");
  }

  const room = await createLiveClassRoom({
    className: title,
    maxParticipants,
    durationMinutes: duration,
  });

  const token = await getInstructorToken(room.name);

  const liveClass = await LiveClass.create({
    title,
    description,
    course,
    scheduledAt: scheduledDate,
    duration,
    timezone,
    maxParticipants,
    isRecorded,
    materials,
    classNotes,
    instructor: req.user._id,

    meetingRoom: {
      roomName: room.name,
      roomUrl: room.url,
      hostToken: token.token,
    },
  });

  // Do not expose the private host token in the ordinary response.
  const response = liveClass.toObject();
  if (response.meetingRoom) {
    delete response.meetingRoom.hostToken;
  }

  sendResponse(res, 201, "Live class created", response);
});

// ─────────────────────────────────────────────
// GET SINGLE LIVE CLASS
// ─────────────────────────────────────────────
export const getLiveClass = asyncHandler(async (req, res) => {
  const liveClass = await findInstructorLiveClass(
    req.params.id,
    req.user._id
  ).populate("course", "title");

  if (!liveClass) {
    return sendResponse(res, 404, "Live class not found");
  }

  const response = liveClass.toObject();

  if (response.meetingRoom) {
    delete response.meetingRoom.hostToken;
  }

  sendResponse(res, 200, "Live class retrieved", response);
});

// ─────────────────────────────────────────────
// UPDATE LIVE CLASS
// ─────────────────────────────────────────────
export const updateLiveClass = asyncHandler(async (req, res) => {
  const liveClass = await findInstructorLiveClass(
    req.params.id,
    req.user._id
  );

  if (!liveClass) {
    return sendResponse(res, 404, "Live class not found");
  }

  if (
    liveClass.status === LIVE_CLASS_STATUS.LIVE ||
    liveClass.status === LIVE_CLASS_STATUS.ENDED
  ) {
    return sendResponse(
      res,
      400,
      "A live or completed class cannot be edited"
    );
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

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      liveClass[field] = req.body[field];
    }
  });

  await liveClass.save();

  sendResponse(res, 200, "Live class updated", liveClass);
});

// ─────────────────────────────────────────────
// DELETE LIVE CLASS
// ─────────────────────────────────────────────
export const deleteLiveClass = asyncHandler(async (req, res) => {
  const liveClass = await findInstructorLiveClass(
    req.params.id,
    req.user._id
  );

  if (!liveClass) {
    return sendResponse(res, 404, "Live class not found");
  }

  if (liveClass.status === LIVE_CLASS_STATUS.LIVE) {
    return sendResponse(
      res,
      400,
      "You cannot delete a live class"
    );
  }

  await LiveClass.findByIdAndDelete(liveClass._id);

  sendResponse(res, 200, "Live class deleted");
});

// ─────────────────────────────────────────────
// START LIVE CLASS
// ─────────────────────────────────────────────
export const startLiveClass = asyncHandler(async (req, res) => {
  const liveClass = await findInstructorLiveClass(
    req.params.id,
    req.user._id
  );

  if (!liveClass) {
    return sendResponse(res, 404, "Live class not found");
  }

  if (liveClass.status === LIVE_CLASS_STATUS.ENDED) {
    return sendResponse(
      res,
      400,
      "This live class has already ended"
    );
  }

  if (liveClass.status === LIVE_CLASS_STATUS.LIVE) {
    return sendResponse(res, 200, "Live class is already running", liveClass);
  }

  liveClass.status = LIVE_CLASS_STATUS.LIVE;
  liveClass.startedAt = new Date();

  await liveClass.save();

  const io = req.app.get("io");

  if (io) {
    io.to(`live_class_${liveClass._id}`).emit("live_class_started", {
      liveClassId: liveClass._id,
      startedAt: liveClass.startedAt,
    });
  }

  const response = liveClass.toObject();

  if (response.meetingRoom) {
    delete response.meetingRoom.hostToken;
  }

  sendResponse(res, 200, "Live class started", response);
});

// ─────────────────────────────────────────────
// GET LIVE CLASS ATTENDANCE
// ─────────────────────────────────────────────
export const getLiveClassAttendance = asyncHandler(async (req, res) => {
  const liveClass = await findInstructorLiveClass(
    req.params.id,
    req.user._id
  ).select("_id");

  if (!liveClass) {
    return sendResponse(res, 404, "Live class not found");
  }

  const attendance = await Attendance.find({
    liveClass: liveClass._id,
  })
    .populate("student", "firstName lastName email avatar")
    .sort({ createdAt: -1 });

  sendResponse(res, 200, "Attendance retrieved", attendance);
});

// ─────────────────────────────────────────────
// SYNC RECORDING FROM DAILY.CO
// ─────────────────────────────────────────────
export const syncLiveClassRecording = asyncHandler(async (req, res) => {
  const liveClass = await findInstructorLiveClass(
    req.params.id,
    req.user._id
  );

  if (!liveClass) {
    return sendResponse(res, 404, "Live class not found");
  }

  const roomName = liveClass.meetingRoom?.roomName;

  if (!roomName) {
    return sendResponse(
      res,
      400,
      "Meeting room is not configured for this class"
    );
  }

  const dailyResponse = await getLiveClassRecordings(roomName);

  const recording = extractRecording(dailyResponse);

  if (!recording) {
    return sendResponse(
      res,
      404,
      "No completed recording is currently available from Daily.co",
      dailyResponse
    );
  }

  if (!recording.url) {
    return sendResponse(
      res,
      400,
      "Daily.co returned a recording without a download URL",
      recording
    );
  }

  liveClass.recording = recording;
  liveClass.status = LIVE_CLASS_STATUS.ENDED;
  liveClass.endedAt = liveClass.endedAt || new Date();

  if (liveClass.startedAt) {
    liveClass.actualDuration = Math.max(
      0,
      Math.round(
        (liveClass.endedAt.getTime() -
          liveClass.startedAt.getTime()) /
          60000
      )
    );
  }

  await liveClass.save();

  const response = liveClass.toObject();

  if (response.meetingRoom) {
    delete response.meetingRoom.hostToken;
  }

  sendResponse(
    res,
    200,
    "Recording synchronized successfully",
    response
  );
});

// ─────────────────────────────────────────────
// GET SAVED LIVE CLASS RECORDING
// ─────────────────────────────────────────────
export const getLiveClassRecording = asyncHandler(async (req, res) => {
  const liveClass = await findInstructorLiveClass(
    req.params.id,
    req.user._id
  ).select("title status recording startedAt endedAt actualDuration");

  if (!liveClass) {
    return sendResponse(res, 404, "Live class not found");
  }

  if (!liveClass.recording?.url) {
    return sendResponse(
      res,
      404,
      "No recording has been saved for this class"
    );
  }

  sendResponse(
    res,
    200,
    "Live class recording retrieved",
    liveClass.recording
  );
});

// ─────────────────────────────────────────────
// MANUAL RECORDING SAVE
// Retained for compatibility with your existing frontend.
// ─────────────────────────────────────────────
export const saveLiveClassRecording = asyncHandler(async (req, res) => {
  const liveClass = await findInstructorLiveClass(
    req.params.id,
    req.user._id
  );

  if (!liveClass) {
    return sendResponse(res, 404, "Live class not found");
  }

  const { url, duration = 0, recordingId = null } = req.body;

  if (!url) {
    return sendResponse(res, 400, "Recording URL is required");
  }

  liveClass.recording = {
    url,
    duration,
    recordingId,
  };

  liveClass.status = LIVE_CLASS_STATUS.ENDED;
  liveClass.endedAt = liveClass.endedAt || new Date();

  await liveClass.save();

  sendResponse(res, 200, "Recording saved", liveClass);
});
