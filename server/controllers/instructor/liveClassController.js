
import mongoose from "mongoose";
import { LIVEKIT_URL } from "../../config/livekit.js";

import LiveClass from "../../models/live/LiveClass.js";
import Attendance from "../../models/live/Attendance.js";
import Course from "../../models/course/Course.js";

import paginate from "../../utils/pagination.js";
import sendResponse from "../../utils/sendResponse.js";
import asyncHandler from "../../middlewares/error/asyncHandler.js";

import {
  createLiveClassRoom,
  getLiveClassRoom,
  getInstructorToken,
  deleteLiveClassRoom,
} from "../../services/meeting/liveKitService.js";

import {
  startRoomRecording,
  stopRoomRecording,
  listRoomRecordings,
} from "../../services/meeting/liveKitRecordingService.js";

import {
  createRecordingUrl,
  verifyRecordingObject,
} from "../../config/b2.js";

import { LIVE_CLASS_STATUS } from "../../utils/constants.js";

// ─────────────────────────────────────────────────────────────
// GENERAL HELPERS
// ─────────────────────────────────────────────────────────────

const RECORDING_ACTIVE_STATES = [
  "starting",
  "recording",
  "stopping",
  "processing",
];

const findOwnedClass = (id, instructorId) => {
  if (!mongoose.isValidObjectId(id)) return null;

  return LiveClass.findOne({
    _id: id,
    instructor: instructorId,
  });
};

const safeClass = (liveClass) => {
  const data = liveClass?.toObject
    ? liveClass.toObject()
    : { ...liveClass };

  if (data.meetingRoom) {
    delete data.meetingRoom.hostToken;
  }

  return data;
};

const getInstructorName = (user) =>
  [user?.firstName, user?.lastName]
    .filter(Boolean)
    .join(" ")
    .trim() || "DEVAD Instructor";

const parseBoolean = (value, defaultValue = false) => {
  if (value === undefined || value === null) {
    return defaultValue;
  }

  if (typeof value === "boolean") return value;

  if (typeof value === "number") {
    if (value === 1) return true;
    if (value === 0) return false;
  }

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();

    if (["true", "1", "yes"].includes(normalized)) {
      return true;
    }

    if (["false", "0", "no"].includes(normalized)) {
      return false;
    }
  }

  return null;
};

const isValidDate = (value) => {
  const date = new Date(value);
  return !Number.isNaN(date.getTime());
};

const getClassRoomName = (className, classId) => {
  const slug =
    String(className || "live-class")
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 35) || "live-class";

  return `devad-${slug}-${String(classId)}`;
};

const getCourseForInstructor = (courseId, instructorId) => {
  if (!mongoose.isValidObjectId(courseId)) return null;

  return Course.findOne({
    _id: courseId,
    instructor: instructorId,
  }).select("_id title instructor");
};

// ─────────────────────────────────────────────────────────────
// RECORDING HELPERS
// ─────────────────────────────────────────────────────────────

const getRecordingResponse = async (liveClass) => {
  const recording = liveClass.recording;
  let playbackUrl = null;

  if (
    recording?.status === "available" &&
    recording?.objectKey
  ) {
    playbackUrl = await createRecordingUrl(
      recording.objectKey
    );
  }

  return {
    status: recording?.status || "not_started",
    recordingId: recording?.recordingId || null,
    duration: recording?.duration ?? 0,
    startedAt: recording?.startedAt || null,
    endedAt: recording?.endedAt || null,
    lastSyncAt: recording?.lastSyncAt || null,
    error: recording?.error || null,
    url: playbackUrl,
  };
};

const getEgressItems = (result) => {
  if (Array.isArray(result)) return result;

  if (Array.isArray(result?.items)) {
    return result.items;
  }

  return [];
};

const normalizeEgressStatus = (status) => {
  if (typeof status !== "string") return null;

  const statusMap = {
    EGRESS_STARTING: "starting",
    EGRESS_ACTIVE: "recording",
    EGRESS_ENDING: "stopping",
    EGRESS_COMPLETE: "processing",
    EGRESS_FAILED: "failed",
    EGRESS_ABORTED: "failed",
    EGRESS_LIMIT_REACHED: "failed",
  };

  return statusMap[status.toUpperCase()] || null;
};

const toEgressDate = (value) => {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  const numeric = Number(value);

  // LiveKit Egress timestamps are Unix seconds.
  if (Number.isFinite(numeric)) {
    const date = new Date(numeric * 1000);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const saveRecordingFailure = async (
  liveClassId,
  error,
  recordingId = null
) => {
  const update = {
    "recording.status": "failed",
    "recording.error": String(
      error?.message || error || "Recording failed"
    ).slice(0, 2000),
    "recording.endedAt": new Date(),
    "recording.lastSyncAt": new Date(),
  };

  if (recordingId) {
    update["recording.recordingId"] = recordingId;
  }

  return LiveClass.updateOne(
    { _id: liveClassId },
    { $set: update }
  );
};

// ─────────────────────────────────────────────────────────────
// GET MY LIVE CLASSES
// GET /instructor/live-classes
// ─────────────────────────────────────────────────────────────

export const getMyLiveClasses = asyncHandler(
  async (req, res) => {
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
  }
);

// ─────────────────────────────────────────────────────────────
// GET INSTRUCTOR JOIN TOKEN
// POST /instructor/live-classes/:id/join-token
// ─────────────────────────────────────────────────────────────

export const getInstructorJoinToken = asyncHandler(
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

    if (liveClass.status !== LIVE_CLASS_STATUS.LIVE) {
      return sendResponse(
        res,
        400,
        "This class is not currently live"
      );
    }

    const roomName = liveClass.meetingRoom?.roomName;

    if (!roomName) {
      return sendResponse(
        res,
        400,
        "Live classroom room is not configured"
      );
    }

    const token = await getInstructorToken({
      roomName,
      instructorId: req.user._id.toString(),
      instructorName: getInstructorName(req.user),
    });

    return sendResponse(
      res,
      200,
      "Classroom access token generated",
      {
        liveClass: safeClass(liveClass),
        serverUrl: liveClass.meetingRoom.roomUrl || LIVEKIT_URL,
        roomName,
        token,
      }
    );
  }
);

// ─────────────────────────────────────────────────────────────
// CREATE LIVE CLASS
// POST /instructor/live-classes
// ─────────────────────────────────────────────────────────────

export const createLiveClass = asyncHandler(
  async (req, res) => {
    const {
      title,
      description = "",
      course,
      scheduledAt,
      duration = 120,
      timezone = "Africa/Lagos",
      maxParticipants = 50,
      isRecorded = true,
      materials = [],
      classNotes = "",
    } = req.body;

    if (!title?.trim() || !course || !scheduledAt) {
      return sendResponse(
        res,
        400,
        "Title, course and scheduled date are required"
      );
    }

    if (!mongoose.isValidObjectId(course)) {
      return sendResponse(
        res,
        400,
        "Invalid course ID"
      );
    }

    if (!isValidDate(scheduledAt)) {
      return sendResponse(
        res,
        400,
        "Invalid scheduled date"
      );
    }

    const durationValue = Number(duration);
    const capacity = Number(maxParticipants);
    const recorded = parseBoolean(isRecorded, true);

    if (
      !Number.isInteger(durationValue) ||
      durationValue < 1
    ) {
      return sendResponse(
        res,
        400,
        "Duration must be a positive whole number of minutes"
      );
    }

    if (
      !Number.isInteger(capacity) ||
      capacity < 2
    ) {
      return sendResponse(
        res,
        400,
        "Maximum participants must be an integer of at least 2"
      );
    }

    if (recorded === null) {
      return sendResponse(
        res,
        400,
        "isRecorded must be a valid boolean"
      );
    }

    if (!Array.isArray(materials)) {
      return sendResponse(
        res,
        400,
        "Materials must be an array"
      );
    }

    // Ensure this instructor owns the selected course.
    const ownedCourse = await getCourseForInstructor(
      course,
      req.user._id
    );

    if (!ownedCourse) {
      return sendResponse(
        res,
        404,
        "Course not found or you are not authorized to schedule a class for it"
      );
    }

    const liveClass = await LiveClass.create({
      title: title.trim(),
      description,
      course: ownedCourse._id,
      scheduledAt: new Date(scheduledAt),
      duration: durationValue,
      timezone,
      maxParticipants: capacity,
      isRecorded: recorded,
      materials,
      classNotes,
      instructor: req.user._id,

      // The room is deliberately not created here.
      // It is created when the instructor starts the class.
      meetingRoom: {
        roomName: null,
        roomUrl: null,
        maxParticipants: capacity,
      },

      recording: {
        status: "not_started",
      },
    });

    return sendResponse(
      res,
      201,
      "Live class scheduled successfully",
      safeClass(liveClass)
    );
  }
);

// ─────────────────────────────────────────────────────────────
// GET SINGLE LIVE CLASS
// GET /instructor/live-classes/:id
// ─────────────────────────────────────────────────────────────

export const getLiveClass = asyncHandler(
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

    await liveClass.populate("course", "title");

    return sendResponse(
      res,
      200,
      "Live class retrieved",
      safeClass(liveClass)
    );
  }
);

// ─────────────────────────────────────────────────────────────
// UPDATE LIVE CLASS
// PUT /instructor/live-classes/:id
// ─────────────────────────────────────────────────────────────

export const updateLiveClass = asyncHandler(
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
      "isRecorded",
      "materials",
      "classNotes",
    ];

    const updates = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    const nextTitle = updates.title ?? liveClass.title;
    const nextCourse = updates.course ?? liveClass.course;
    const nextScheduledAt =
      updates.scheduledAt ?? liveClass.scheduledAt;
    const nextDuration =
      updates.duration ?? liveClass.duration;
    const nextCapacity =
      updates.maxParticipants ?? liveClass.maxParticipants;

    if (!String(nextTitle || "").trim()) {
      return sendResponse(
        res,
        400,
        "Class title is required"
      );
    }

    if (!mongoose.isValidObjectId(nextCourse)) {
      return sendResponse(
        res,
        400,
        "Invalid course ID"
      );
    }

    if (!isValidDate(nextScheduledAt)) {
      return sendResponse(
        res,
        400,
        "Invalid scheduled date"
      );
    }

    if (
      !Number.isInteger(Number(nextDuration)) ||
      Number(nextDuration) < 1
    ) {
      return sendResponse(
        res,
        400,
        "Duration must be a positive whole number of minutes"
      );
    }

    if (
      !Number.isInteger(Number(nextCapacity)) ||
      Number(nextCapacity) < 2
    ) {
      return sendResponse(
        res,
        400,
        "Maximum participants must be an integer of at least 2"
      );
    }

    // If the class has a previously provisioned room,
    // its room capacity cannot be changed independently.
    if (
      liveClass.meetingRoom?.roomName &&
      Number(nextCapacity) !==
        Number(liveClass.meetingRoom.maxParticipants)
    ) {
      return sendResponse(
        res,
        400,
        "Participant capacity cannot be changed after the classroom has been provisioned"
      );
    }

    const ownedCourse = await getCourseForInstructor(
      nextCourse,
      req.user._id
    );

    if (!ownedCourse) {
      return sendResponse(
        res,
        404,
        "Course not found or you are not authorized to use it"
      );
    }

    if (updates.isRecorded !== undefined) {
      const recorded = parseBoolean(updates.isRecorded);

      if (recorded === null) {
        return sendResponse(
          res,
          400,
          "isRecorded must be a valid boolean"
        );
      }

      updates.isRecorded = recorded;
    }

    if (
      updates.materials !== undefined &&
      !Array.isArray(updates.materials)
    ) {
      return sendResponse(
        res,
        400,
        "Materials must be an array"
      );
    }

    liveClass.title = String(nextTitle).trim();
    liveClass.course = ownedCourse._id;
    liveClass.scheduledAt = new Date(nextScheduledAt);
    liveClass.duration = Number(nextDuration);
    liveClass.maxParticipants = Number(nextCapacity);

    if (updates.description !== undefined) {
      liveClass.description = updates.description;
    }

    if (updates.timezone !== undefined) {
      liveClass.timezone = updates.timezone;
    }

    if (updates.isRecorded !== undefined) {
      liveClass.isRecorded = updates.isRecorded;
    }

    if (updates.materials !== undefined) {
      liveClass.materials = updates.materials;
    }

    if (updates.classNotes !== undefined) {
      liveClass.classNotes = updates.classNotes;
    }

    // Keep both capacity values synchronized.
    liveClass.meetingRoom.maxParticipants =
      Number(nextCapacity);

    await liveClass.save();

    return sendResponse(
      res,
      200,
      "Live class updated successfully",
      safeClass(liveClass)
    );
  }
);

// ─────────────────────────────────────────────────────────────
// DELETE LIVE CLASS
// DELETE /instructor/live-classes/:id
// ─────────────────────────────────────────────────────────────

export const deleteLiveClass = asyncHandler(
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

    if (liveClass.status === LIVE_CLASS_STATUS.LIVE) {
      return sendResponse(
        res,
        400,
        "End the live class before deleting it"
      );
    }

    if (
      RECORDING_ACTIVE_STATES.includes(
        liveClass.recording?.status
      )
    ) {
      return sendResponse(
        res,
        400,
        "Wait until the recording has finished processing before deleting this class"
      );
    }

    // Close the external room before deleting the database record.
    if (liveClass.meetingRoom?.roomName) {
      await deleteLiveClassRoom(
        liveClass.meetingRoom.roomName
      );
    }

    await LiveClass.deleteOne({
      _id: liveClass._id,
      instructor: req.user._id,
    });

    return sendResponse(
      res,
      200,
      "Live class deleted successfully"
    );
  }
);

// ─────────────────────────────────────────────────────────────
// START LIVE CLASS
// POST /instructor/live-classes/:id/start
// ─────────────────────────────────────────────────────────────

export const startLiveClass = asyncHandler(
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
        409,
        "This class is already live"
      );
    }

    const roomName = getClassRoomName(
      liveClass.title,
      liveClass._id
    );

    let room;

    // Reuse a room if an earlier start attempt created it
    // but failed before saving the class state.
    room = await getLiveClassRoom(roomName);

    if (!room) {
      try {
        room = await createLiveClassRoom({
          className: liveClass.title,
          classId: liveClass._id.toString(),
          maxParticipants: Number(
            liveClass.maxParticipants || 50
          ),
        });
      } catch (error) {
        // A concurrent request may have created the same room.
        room = await getLiveClassRoom(roomName);

        if (!room) {
          throw error;
        }
      }
    }

    const resolvedRoomName = room.name || roomName;
    const roomUrl = LIVEKIT_URL;

    const instructorToken = await getInstructorToken({
      roomName: resolvedRoomName,
      instructorId: req.user._id.toString(),
      instructorName: getInstructorName(req.user),
    });

    const startedAt = new Date();

    // Only one concurrent request can transition a scheduled class.
    const updatedClass = await LiveClass.findOneAndUpdate(
      {
        _id: liveClass._id,
        instructor: req.user._id,
        status: LIVE_CLASS_STATUS.SCHEDULED,
      },
      {
        $set: {
          status: LIVE_CLASS_STATUS.LIVE,
          startedAt,
          endedAt: null,
          actualDuration: 0,
          "meetingRoom.roomName": resolvedRoomName,
          "meetingRoom.roomUrl": roomUrl,
          "meetingRoom.maxParticipants": Number(
            liveClass.maxParticipants || 50
          ),
        },
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedClass) {
      const currentClass = await findOwnedClass(
        liveClass._id,
        req.user._id
      );

      return sendResponse(
        res,
        409,
        currentClass?.status === LIVE_CLASS_STATUS.LIVE
          ? "This class was started by another request"
          : "This class can no longer be started"
      );
    }

    const io = req.app.get("io");

    if (io) {
      io.to(`live_class_${updatedClass._id}`).emit(
        "live_class_started",
        {
          liveClassId: updatedClass._id,
          startedAt: updatedClass.startedAt,
        }
      );
    }

    return sendResponse(
      res,
      200,
      "Live class started successfully",
      {
        liveClass: safeClass(updatedClass),
        serverUrl: roomUrl,
        roomName: resolvedRoomName,
        token: instructorToken,
      }
    );
  }
);

// ─────────────────────────────────────────────────────────────
// END LIVE CLASS
// POST /instructor/live-classes/:id/end
// ─────────────────────────────────────────────────────────────

export const endLiveClass = asyncHandler(
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

    // Attempt to stop recording, but do not let an Egress
    // failure prevent the class from being ended.
    if (
      ["starting", "recording"].includes(
        liveClass.recording?.status
      ) &&
      liveClass.recording?.recordingId
    ) {
      try {
        await stopRoomRecording(
          liveClass.recording.recordingId
        );

        liveClass.recording.status = "stopping";
        liveClass.recording.lastSyncAt = new Date();
      } catch (error) {
        liveClass.recording.status = "failed";
        liveClass.recording.error = String(
          error.message || "Unable to stop the recording"
        ).slice(0, 2000);
        liveClass.recording.endedAt = new Date();
        liveClass.recording.lastSyncAt = new Date();

        console.error(
          "LiveKit recording stop failed:",
          error.message
        );
      }
    }

    const endedAt = new Date();
    const startedAt = liveClass.startedAt;

    const actualDuration = startedAt
      ? Math.max(
          0,
          Math.round(
            (endedAt.getTime() - startedAt.getTime()) /
              60000
          )
        )
      : 0;

    const updatedClass = await LiveClass.findOneAndUpdate(
      {
        _id: liveClass._id,
        instructor: req.user._id,
        status: LIVE_CLASS_STATUS.LIVE,
      },
      {
        $set: {
          status: LIVE_CLASS_STATUS.ENDED,
          endedAt,
          actualDuration,
          recording: liveClass.recording,
        },
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedClass) {
      return sendResponse(
        res,
        409,
        "The class status changed while it was being ended. Refresh and try again."
      );
    }

    let roomClosed = true;

    if (updatedClass.meetingRoom?.roomName) {
      try {
        await deleteLiveClassRoom(
          updatedClass.meetingRoom.roomName
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
      io.to(`live_class_${updatedClass._id}`).emit(
        "live_class_ended",
        {
          liveClassId: updatedClass._id,
          endedAt: updatedClass.endedAt,
        }
      );
    }

    return sendResponse(
      res,
      200,
      roomClosed
        ? "Live class ended successfully"
        : "Class ended, but the LiveKit room could not be closed",
      {
        ...safeClass(updatedClass),
        roomClosed,
      }
    );
  }
);

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
// START RECORDING
// POST /instructor/live-classes/:id/recording/start
// ─────────────────────────────────────────────────────────────

export const startLiveClassRecording = asyncHandler(
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

    if (liveClass.status !== LIVE_CLASS_STATUS.LIVE) {
      return sendResponse(
        res,
        400,
        "You can only record a class that is currently live"
      );
    }

    if (!liveClass.isRecorded) {
      return sendResponse(
        res,
        400,
        "Recording is disabled for this class"
      );
    }

    if (!liveClass.meetingRoom?.roomName) {
      return sendResponse(
        res,
        400,
        "LiveKit classroom is not configured"
      );
    }

    // Atomically claim the recording slot.
    const claimedClass = await LiveClass.findOneAndUpdate(
      {
        _id: liveClass._id,
        instructor: req.user._id,
        status: LIVE_CLASS_STATUS.LIVE,
        "recording.status": {
          $in: ["not_started", "failed"],
        },
      },
      {
        $set: {
          "recording.status": "starting",
          "recording.error": null,
          "recording.url": null,
          "recording.objectKey": null,
          "recording.recordingId": null,
          "recording.startedAt": new Date(),
          "recording.endedAt": null,
          "recording.duration": null,
          "recording.lastSyncAt": new Date(),
        },
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!claimedClass) {
      return sendResponse(
        res,
        409,
        "A recording is already active, starting or being processed"
      );
    }

    let egress = null;

    try {
      egress = await startRoomRecording({
        roomName: claimedClass.meetingRoom.roomName,
        classId: claimedClass._id.toString(),
        instructorId: req.user._id.toString(),
      });

      const initialStatus =
        normalizeEgressStatus(egress.status) || "starting";

      const updatedClass = await LiveClass.findOneAndUpdate(
        {
          _id: claimedClass._id,
          "recording.status": "starting",
        },
        {
          $set: {
            "recording.recordingId": egress.egressId,
            "recording.objectKey": egress.objectKey,
            "recording.status": initialStatus,
            "recording.lastSyncAt": new Date(),
          },
        },
        {
          new: true,
          runValidators: true,
        }
      );

      if (!updatedClass) {
        throw new Error(
          "Recording started but its database state could not be updated"
        );
      }

      return sendResponse(
        res,
        200,
        initialStatus === "recording"
          ? "Class recording started successfully"
          : "Recording request accepted by LiveKit",
        await getRecordingResponse(updatedClass)
      );
    } catch (error) {
      if (egress?.egressId) {
        try {
          await stopRoomRecording(egress.egressId);
        } catch (cleanupError) {
          console.error(
            "Recording cleanup failed:",
            cleanupError.message
          );
        }
      }

      await saveRecordingFailure(
        claimedClass._id,
        error,
        egress?.egressId
      );

      throw error;
    }
  }
);

// ─────────────────────────────────────────────────────────────
// STOP RECORDING
// POST /instructor/live-classes/:id/recording/stop
// ─────────────────────────────────────────────────────────────

export const stopLiveClassRecording = asyncHandler(
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

    const recording = liveClass.recording;

    if (!recording?.recordingId) {
      return sendResponse(
        res,
        400,
        "No recording has been started for this class"
      );
    }

    if (recording.status === "stopping") {
      return sendResponse(
        res,
        200,
        "Recording is already stopping",
        await getRecordingResponse(liveClass)
      );
    }

    if (recording.status !== "recording") {
      return sendResponse(
        res,
        400,
        `Cannot stop a recording with status: ${recording.status}`
      );
    }

    // Claim the stop operation to prevent duplicate stop calls.
    const claimedClass = await LiveClass.findOneAndUpdate(
      {
        _id: liveClass._id,
        instructor: req.user._id,
        "recording.status": "recording",
        "recording.recordingId": recording.recordingId,
      },
      {
        $set: {
          "recording.status": "stopping",
          "recording.lastSyncAt": new Date(),
        },
      },
      {
        new: true,
      }
    );

    if (!claimedClass) {
      return sendResponse(
        res,
        409,
        "Recording status changed. Refresh and try again."
      );
    }

    try {
      await stopRoomRecording(recording.recordingId);
    } catch (error) {
      // Restore recording state so the instructor can retry.
      await LiveClass.updateOne(
        {
          _id: liveClass._id,
          "recording.recordingId": recording.recordingId,
          "recording.status": "stopping",
        },
        {
          $set: {
            "recording.status": "recording",
            "recording.error": String(
              error.message || "Unable to stop recording"
            ).slice(0, 2000),
            "recording.lastSyncAt": new Date(),
          },
        }
      );

      throw error;
    }

    const updatedClass = await LiveClass.findById(
      liveClass._id
    );

    return sendResponse(
      res,
      200,
      "Recording stop requested. The video is being finalized.",
      await getRecordingResponse(updatedClass)
    );
  }
);

// ─────────────────────────────────────────────────────────────
// SYNCHRONIZE RECORDING
// POST /instructor/live-classes/:id/sync-recording
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

    const recording = liveClass.recording;

    if (!recording?.recordingId) {
      return sendResponse(
        res,
        200,
        "No recording has been started",
        await getRecordingResponse(liveClass)
      );
    }

    const roomName = liveClass.meetingRoom?.roomName;

    if (!roomName) {
      return sendResponse(
        res,
        400,
        "LiveKit room information is missing"
      );
    }

    const egressItems = await listRoomRecordings(roomName);

    const egress = getEgressItems(egressItems).find(
      (item) =>
        item.egressId === recording.recordingId
    );

    if (egress) {
      const mappedStatus = normalizeEgressStatus(
        egress.status
      );

      if (mappedStatus) {
        recording.status = mappedStatus;
      }

      if (recording.status === "failed") {
        recording.error =
          egress.error || "LiveKit recording failed";

        recording.endedAt =
          toEgressDate(egress.endedAt) || new Date();
      } else {
        recording.error = null;
      }

      const egressStartedAt = toEgressDate(
        egress.startedAt
      );

      const egressEndedAt = toEgressDate(
        egress.endedAt
      );

      if (egressStartedAt) {
        recording.startedAt = egressStartedAt;
      }

      if (egressEndedAt) {
        recording.endedAt = egressEndedAt;
      }
    }

    // Only verify B2 after LiveKit has reported completion
    // or the recording is already waiting for its file.
    if (
      ["processing", "stopping"].includes(recording.status) &&
      recording.objectKey
    ) {
      const objectExists = await verifyRecordingObject(
        recording.objectKey
      );

      if (objectExists) {
        recording.status = "available";
        recording.error = null;

        if (!recording.endedAt) {
          recording.endedAt = new Date();
        }
      }
    }

    recording.lastSyncAt = new Date();

    await liveClass.save();

    return sendResponse(
      res,
      200,
      "Recording status synchronized",
      await getRecordingResponse(liveClass)
    );
  }
);

// ─────────────────────────────────────────────────────────────
// GET RECORDING / PLAYBACK URL
// GET /instructor/live-classes/:id/recording
// ─────────────────────────────────────────────────────────────

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

    const recordingData = await getRecordingResponse(
      liveClass
    );

    return sendResponse(
      res,
      200,
      recordingData.status === "available"
        ? "Recording retrieved successfully"
        : "Recording status retrieved",
      recordingData
    );
  }
);

// ─────────────────────────────────────────────────────────────
// LEGACY MANUAL RECORDING ENDPOINT
// POST /instructor/live-classes/:id/recording
// ─────────────────────────────────────────────────────────────

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
      400,
      "Manual recording URLs are disabled. Use the LiveKit recording controls."
    );
  }
);
