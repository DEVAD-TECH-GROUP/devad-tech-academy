
import mongoose from "mongoose";
import { LIVEKIT_URL } from "../../config/livekit.js";

import LiveClass from "../../models/live/LiveClass.js";
import Attendance from "../../models/live/Attendance.js";

import paginate from "../../utils/pagination.js";
import sendResponse from "../../utils/sendResponse.js";
import asyncHandler from "../../middlewares/error/asyncHandler.js";

import {
  createLiveClassRoom,
  getInstructorToken,
  deleteLiveClassRoom,
} from "../../services/meeting/liveKitService.js";

import { LIVE_CLASS_STATUS } from "../../utils/constants.js";

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────

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

const getInstructorName = (user) => {
  return [
    user?.firstName,
    user?.lastName,
  ]
    .filter(Boolean)
    .join(" ")
    .trim() || "DEVAD Instructor";
};

// ─────────────────────────────────────────────────────────────
// GET MY LIVE CLASSES
// GET /instructor/live-classes
// ─────────────────────────────────────────────────────────────

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

  return sendResponse(
    res,
    200,
    "Live classes retrieved",
    result
  );
});


export const getInstructorJoinToken = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const liveClass = await findOwnedClass(id, req.user._id);

  if (!liveClass) {
    return sendResponse(res, 404, "Live class not found");
  }

  if (liveClass.status !== LIVE_CLASS_STATUS.LIVE) {
    return sendResponse(res, 400, "This class is not currently live");
  }

  const roomName = liveClass.meetingRoom?.roomName;

  if (!roomName) {
    return sendResponse(res, 400, "Live classroom room is not configured");
  }

  const token = await getInstructorToken({
    roomName,
    instructorId: req.user._id.toString(),
    instructorName: getInstructorName(req.user),
  });

  return sendResponse(res, 200, "Classroom access token generated", {
    liveClass: safeClass(liveClass),
    serverUrl: LIVEKIT_URL,
    roomName,
    token,
  });
});

// ─────────────────────────────────────────────────────────────
// CREATE LIVE CLASS
// POST /instructor/live-classes
// ─────────────────────────────────────────────────────────────

export const createLiveClass = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    course,
    scheduledAt,
    duration = 120,
    timezone = "Africa/Lagos",
    maxParticipants = 2,
    isRecorded = false,
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

  if (
    !Number.isFinite(Number(duration)) ||
    Number(duration) < 1
  ) {
    return sendResponse(
      res,
      400,
      "Duration must be at least one minute"
    );
  }

  if (
    !Number.isInteger(Number(maxParticipants)) ||
    Number(maxParticipants) < 2
  ) {
    return sendResponse(
      res,
      400,
      "Maximum participants must be at least 2"
    );
  }

  // LiveKit Egress recording has not yet been configured.
  if (Boolean(isRecorded)) {
    return sendResponse(
      res,
      400,
      "Live class recording is not available yet. Disable recording to schedule this class."
    );
  }

  const room = await createLiveClassRoom({
    className: title,
    maxParticipants: Number(maxParticipants),
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
      isRecorded: false,
      materials,
      classNotes,
      instructor: req.user._id,

      meetingRoom: {
        roomName: room.name,
        roomUrl: room.url,
  maxParticipants: room.maxParticipants,
      },

      recording: {
        status: "not_started",
      },
    });

    return sendResponse(
      res,
      201,
      "Live class created successfully",
      safeClass(liveClass)
    );
  } catch (error) {
    // Remove the LiveKit room if database creation fails.
    try {
      await deleteLiveClassRoom(room.name);
    } catch (cleanupError) {
      console.error(
        "LiveKit room cleanup failed:",
        cleanupError.message
      );
    }

    throw error;
  }
});

// ─────────────────────────────────────────────────────────────
// GET SINGLE LIVE CLASS
// GET /instructor/live-classes/:id
// ─────────────────────────────────────────────────────────────

export const getLiveClass = asyncHandler(async (req, res) => {
  const liveClass = await findOwnedClass(
    req.params.id,
    req.user._id
  );

  if (!liveClass) {
    return sendResponse(res, 404, "Live class not found");
  }

  await liveClass.populate("course", "title");

  return sendResponse(
    res,
    200,
    "Live class retrieved",
    safeClass(liveClass)
  );
});

// ─────────────────────────────────────────────────────────────
// UPDATE LIVE CLASS
// PUT /instructor/live-classes/:id
// ─────────────────────────────────────────────────────────────

export const updateLiveClass = asyncHandler(async (req, res) => {
  const liveClass = await findOwnedClass(
    req.params.id,
    req.user._id
  );

  if (!liveClass) {
    return sendResponse(res, 404, "Live class not found");
  }

const existingRoomCapacity = Number(
  liveClass.meetingRoom?.maxParticipants ??
  liveClass.maxParticipants
);

  if (
    liveClass.status === LIVE_CLASS_STATUS.LIVE ||
    liveClass.status === LIVE_CLASS_STATUS.ENDED
  ) {
    return sendResponse(
      res,
      400,
      "Only scheduled classes can be edited"
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
    "materials",
    "classNotes",
  ];

  for (const field of allowedFields) {
    if (req.body[field] !== undefined) {
      liveClass[field] = req.body[field];
    }
  }

  // Recording is not available until Egress is configured.
  if (req.body.isRecorded === true) {
    return sendResponse(
      res,
      400,
      "Live class recording is not available yet"
    );
  }

  liveClass.isRecorded = false;

  if (
    !liveClass.title?.trim() ||
    !liveClass.course ||
    !liveClass.scheduledAt
  ) {
    return sendResponse(
      res,
      400,
      "Title, course and date are required"
    );
  }

  if (!mongoose.isValidObjectId(liveClass.course)) {
    return sendResponse(res, 400, "Invalid course ID");
  }

  if (
    !Number.isFinite(Number(liveClass.duration)) ||
    Number(liveClass.duration) < 1
  ) {
    return sendResponse(
      res,
      400,
      "Duration must be at least one minute"
    );
  }

  if (
  Number(liveClass.maxParticipants) !== existingRoomCapacity
) {
  return sendResponse(
    res,
    400,
    "Participant capacity cannot be changed after creating the classroom. Delete and recreate the scheduled class."
  );
}

  const scheduledDate = new Date(liveClass.scheduledAt);

  if (Number.isNaN(scheduledDate.getTime())) {
    return sendResponse(res, 400, "Invalid scheduled date");
  }

  liveClass.scheduledAt = scheduledDate;

  // The existing LiveKit room's capacity is fixed at creation.
  // Prevent the database from showing a capacity that differs
  // from the actual room configuration.
  if (
    Number(liveClass.maxParticipants) !==
    Number(liveClass.meetingRoom?.maxParticipants || liveClass.maxParticipants)
  ) {
    return sendResponse(
      res,
      400,
      "Participant capacity cannot be changed after creating the classroom. Delete and recreate the scheduled class."
    );
  }

  await liveClass.save();

  return sendResponse(
    res,
    200,
    "Live class updated",
    safeClass(liveClass)
  );
});

// ─────────────────────────────────────────────────────────────
// DELETE LIVE CLASS
// DELETE /instructor/live-classes/:id
// ─────────────────────────────────────────────────────────────

export const deleteLiveClass = asyncHandler(async (req, res) => {
  const liveClass = await findOwnedClass(
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
      "End the live class before deleting it"
    );
  }

  await LiveClass.findByIdAndDelete(liveClass._id);

  if (liveClass.meetingRoom?.roomName) {
    try {
      await deleteLiveClassRoom(
        liveClass.meetingRoom.roomName
      );
    } catch (error) {
      console.error(
        "LiveKit room cleanup failed:",
        error.message
      );
    }
  }

  return sendResponse(
    res,
    200,
    "Live class deleted"
  );
});

// ─────────────────────────────────────────────────────────────
// START LIVE CLASS
// POST /instructor/live-classes/:id/start
// ─────────────────────────────────────────────────────────────

export const startLiveClass = asyncHandler(async (req, res) => {
  const liveClass = await findOwnedClass(
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
      "This class has already ended"
    );
  }

  if (liveClass.status === LIVE_CLASS_STATUS.LIVE) {
    return sendResponse(
      res,
      400,
      "This class is already live"
    );
  }

  const roomName = liveClass.meetingRoom?.roomName;
  const serverUrl = liveClass.meetingRoom?.roomUrl;

  if (!roomName || !serverUrl) {
    return sendResponse(
      res,
      400,
      "LiveKit classroom is not configured correctly"
    );
  }

  const instructorToken = await getInstructorToken({
    roomName,
    instructorId: req.user._id.toString(),
    instructorName: getInstructorName(req.user),
  });

  liveClass.status = LIVE_CLASS_STATUS.LIVE;
  liveClass.startedAt = new Date();
  liveClass.endedAt = null;
  liveClass.actualDuration = 0;

  await liveClass.save();

  const io = req.app.get("io");

  if (io) {
    io.to(`live_class_${liveClass._id}`).emit(
      "live_class_started",
      {
        liveClassId: liveClass._id,
        startedAt: liveClass.startedAt,
      }
    );
  }

  return sendResponse(
    res,
    200,
    "Live class started",
    {
      liveClass: safeClass(liveClass),
      serverUrl,
      roomName,
      token: instructorToken,
    }
  );
});

// ─────────────────────────────────────────────────────────────
// END LIVE CLASS
// POST /instructor/live-classes/:id/end
// ─────────────────────────────────────────────────────────────

export const endLiveClass = asyncHandler(async (req, res) => {
  const liveClass = await findOwnedClass(
    req.params.id,
    req.user._id
  );

  if (!liveClass) {
    return sendResponse(res, 404, "Live class not found");
  }

  if (liveClass.status === LIVE_CLASS_STATUS.ENDED) {
    return sendResponse(
      res,
      200,
      "Live class has already ended",
      safeClass(liveClass)
    );
  }

  if (liveClass.status !== LIVE_CLASS_STATUS.LIVE) {
    return sendResponse(
      res,
      400,
      "This class has not started yet"
    );
  }

  liveClass.status = LIVE_CLASS_STATUS.ENDED;
  liveClass.endedAt = new Date();

  if (liveClass.startedAt) {
    liveClass.actualDuration = Math.max(
      0,
      Math.round(
        (liveClass.endedAt.getTime() -
          liveClass.startedAt.getTime()) / 60000
      )
    );
  }

  await liveClass.save();

  // Deleting a LiveKit room disconnects the participants.
  // Their participant_left webhooks update attendance.
  let roomClosed = true;

  if (liveClass.meetingRoom?.roomName) {
    try {
      await deleteLiveClassRoom(
        liveClass.meetingRoom.roomName
      );
    } catch (error) {
      roomClosed = false;

      console.error(
        "LiveKit room closure failed:",
        error.message
      );
    }
  }

  const io = req.app.get("io");

  if (io) {
    io.to(`live_class_${liveClass._id}`).emit(
      "live_class_ended",
      {
        liveClassId: liveClass._id,
        endedAt: liveClass.endedAt,
      }
    );
  }

  return sendResponse(
    res,
    200,
    roomClosed
      ? "Live class ended successfully"
      : "Class marked as ended, but the LiveKit room could not be closed",
    {
      ...safeClass(liveClass),
      roomClosed,
    }
  );
});

// ─────────────────────────────────────────────────────────────
// GET CLASS ATTENDANCE
// GET /instructor/live-classes/:id/attendance
// ─────────────────────────────────────────────────────────────

export const getLiveClassAttendance = asyncHandler(
  async (req, res) => {
    const liveClass = await findOwnedClass(
      req.params.id,
      req.user._id
    );

    if (!liveClass) {
      return sendResponse(
        res,
        404,
        "Live class not found"
      );
    }

    const attendance = await Attendance.find({
      liveClass: liveClass._id,
    })
      .populate(
        "student",
        "firstName lastName email avatar"
      )
      .sort({ createdAt: -1 });

    return sendResponse(
      res,
      200,
      "Attendance retrieved",
      attendance
    );
  }
);

// ─────────────────────────────────────────────────────────────
// RECORDING ENDPOINTS — EGRESS NOT CONFIGURED YET
// ─────────────────────────────────────────────────────────────

export const syncLiveClassRecording = asyncHandler(
  async (req, res) => {
    const liveClass = await findOwnedClass(
      req.params.id,
      req.user._id
    );

    if (!liveClass) {
      return sendResponse(
        res,
        404,
        "Live class not found"
      );
    }

    return sendResponse(
      res,
      501,
      "Recording is not configured yet. LiveKit Egress and recording storage must be connected first."
    );
  }
);

export const getLiveClassRecording = asyncHandler(
  async (req, res) => {
    const liveClass = await findOwnedClass(
      req.params.id,
      req.user._id
    );

    if (!liveClass) {
      return sendResponse(
        res,
        404,
        "Live class not found"
      );
    }

    if (!liveClass.recording?.url) {
      return sendResponse(
        res,
        404,
        "No recording is available yet",
        {
          status: "not_started",
        }
      );
    }

    return sendResponse(
      res,
      200,
      "Recording retrieved",
      liveClass.recording
    );
  }
);

// Retained for compatibility with existing routes.
export const saveLiveClassRecording = asyncHandler(
  async (req, res) => {
    const liveClass = await findOwnedClass(
      req.params.id,
      req.user._id
    );

    if (!liveClass) {
      return sendResponse(
        res,
        404,
        "Live class not found"
      );
    }

    return sendResponse(
      res,
      501,
      "Manual recording URLs are disabled. Configure LiveKit Egress to enable recordings."
    );
  }
);
