import LiveClass from "../../models/live/LiveClass.js";
import Attendance from "../../models/live/Attendance.js";
import paginate from "../../utils/pagination.js";
import sendResponse from "../../utils/sendResponse.js";
import asyncHandler from "../../middlewares/error/asyncHandler.js";
import { createLiveClassRoom } from "../../services/meeting/dailyService.js";

export const getAllLiveClasses = asyncHandler(async (req, res) => {
  const { page, limit, status } = req.query;
  const query = {};
  if (status) query.status = status;

  const result = await paginate(LiveClass, query, {
    page, limit,
    populate: "course instructor",
    sort: { scheduledAt: -1 },
  });

  sendResponse(res, 200, "Live classes retrieved", result);
});

export const createLiveClass = asyncHandler(async (req, res) => {
  const room = await createLiveClassRoom({
    className: req.body.title,
    maxParticipants: req.body.maxParticipants || 100,
    durationMinutes: req.body.duration || 120,
  });

  const liveClass = await LiveClass.create({
    ...req.body,
    instructor: req.user._id,
    meetingRoom: {
      roomName: room.name,
      roomUrl: room.url,
    },
  });

  sendResponse(res, 201, "Live class created", liveClass);
});

export const getLiveClass = asyncHandler(async (req, res) => {
  const liveClass = await LiveClass.findById(req.params.id)
    .populate("course", "title")
    .populate("instructor", "firstName lastName");

  if (!liveClass) return sendResponse(res, 404, "Live class not found");
  sendResponse(res, 200, "Live class retrieved", liveClass);
});

export const updateLiveClass = asyncHandler(async (req, res) => {
  const liveClass = await LiveClass.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );

  if (!liveClass) return sendResponse(res, 404, "Live class not found");
  sendResponse(res, 200, "Live class updated", liveClass);
});

export const deleteLiveClass = asyncHandler(async (req, res) => {
  await LiveClass.findByIdAndDelete(req.params.id);
  sendResponse(res, 200, "Live class deleted");
});

export const getLiveClassAttendance = asyncHandler(async (req, res) => {
  const attendance = await Attendance.find({
    liveClass: req.params.id,
  }).populate("student", "firstName lastName email");

  sendResponse(res, 200, "Attendance retrieved", attendance);
});

export const getLiveClassRecording = asyncHandler(async (req, res) => {
  const liveClass = await LiveClass.findById(req.params.id);
  if (!liveClass) return sendResponse(res, 404, "Live class not found");
  sendResponse(res, 200, "Recording retrieved", liveClass.recording);
});