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

export const createLiveClass = asyncHandler(async (req, res) => {
  const room = await createLiveClassRoom({
    className: req.body.title,
    maxParticipants: req.body.maxParticipants || 100,
    durationMinutes: req.body.duration || 120,
  });

  const token = await getInstructorToken(room.name);

  const liveClass = await LiveClass.create({
    ...req.body,
    instructor: req.user._id,
    meetingRoom: {
      roomName: room.name,
      roomUrl: room.url,
      hostToken: token.token,
    },
  });

  sendResponse(res, 201, "Live class created", liveClass);
});

export const getLiveClass = asyncHandler(async (req, res) => {
  const liveClass = await LiveClass.findOne({
    _id: req.params.id,
    instructor: req.user._id,
  }).populate("course", "title");

  if (!liveClass) return sendResponse(res, 404, "Live class not found");
  sendResponse(res, 200, "Live class retrieved", liveClass);
});

export const updateLiveClass = asyncHandler(async (req, res) => {
  const liveClass = await LiveClass.findOneAndUpdate(
    { _id: req.params.id, instructor: req.user._id },
    req.body,
    { new: true }
  );

  if (!liveClass) return sendResponse(res, 404, "Live class not found");
  sendResponse(res, 200, "Live class updated", liveClass);
});

export const deleteLiveClass = asyncHandler(async (req, res) => {
  const liveClass = await LiveClass.findOne({
    _id: req.params.id,
    instructor: req.user._id,
  });

  if (!liveClass) return sendResponse(res, 404, "Live class not found");

  await LiveClass.findByIdAndDelete(req.params.id);
  sendResponse(res, 200, "Live class deleted");
});

export const startLiveClass = asyncHandler(async (req, res) => {
  const liveClass = await LiveClass.findOneAndUpdate(
    { _id: req.params.id, instructor: req.user._id },
    { status: LIVE_CLASS_STATUS.LIVE, startedAt: new Date() },
    { new: true }
  );

  if (!liveClass) return sendResponse(res, 404, "Live class not found");

  const io = req.app.get("io");
  io.to(`live_class_${liveClass._id}`).emit("live_class_started", {
    liveClassId: liveClass._id,
    startedAt: new Date(),
  });

  sendResponse(res, 200, "Live class started", liveClass);
});

export const getLiveClassAttendance = asyncHandler(async (req, res) => {
  const attendance = await Attendance.find({
    liveClass: req.params.id,
  }).populate("student", "firstName lastName email avatar");

  sendResponse(res, 200, "Attendance retrieved", attendance);
});

export const saveLiveClassRecording = asyncHandler(async (req, res) => {
  const liveClass = await LiveClass.findOneAndUpdate(
    { _id: req.params.id, instructor: req.user._id },
    { recording: req.body, status: LIVE_CLASS_STATUS.ENDED, endedAt: new Date() },
    { new: true }
  );

  if (!liveClass) return sendResponse(res, 404, "Live class not found");
  sendResponse(res, 200, "Recording saved", liveClass);
});