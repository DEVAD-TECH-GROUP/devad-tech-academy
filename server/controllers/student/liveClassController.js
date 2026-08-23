import LiveClass from "../../models/live/LiveClass.js";
import Attendance from "../../models/live/Attendance.js";
import Enrollment from "../../models/learning/Enrollment.js";
import sendResponse from "../../utils/sendResponse.js";
import asyncHandler from "../../middlewares/error/asyncHandler.js";
import { getStudentToken } from "../../services/meeting/dailyService.js";
import { LIVE_CLASS_STATUS } from "../../utils/constants.js";

export const getMyLiveClasses = asyncHandler(async (req, res) => {
  const courses = await Enrollment.find({
    student: req.user._id,
    status: "active",
  }).distinct("course");

  const liveClasses = await LiveClass.find({
    course: { $in: courses },
  })
    .populate("course", "title")
    .populate("instructor", "firstName lastName avatar")
    .sort({ scheduledAt: -1 });

  sendResponse(res, 200, "Live classes retrieved", liveClasses);
});

export const getLiveClass = asyncHandler(async (req, res) => {
  const liveClass = await LiveClass.findById(req.params.id)
    .populate("course", "title")
    .populate("instructor", "firstName lastName avatar");

  if (!liveClass) return sendResponse(res, 404, "Live class not found");

  const attendance = await Attendance.findOne({
    liveClass: req.params.id,
    student: req.user._id,
  });

  sendResponse(res, 200, "Live class retrieved", { liveClass, attendance });
});

export const joinLiveClass = asyncHandler(async (req, res) => {
  const liveClass = await LiveClass.findById(req.params.id);
  if (!liveClass) return sendResponse(res, 404, "Live class not found");

  if (liveClass.status !== LIVE_CLASS_STATUS.LIVE) {
    return sendResponse(res, 400, "Live class has not started yet");
  }

  const token = await getStudentToken(liveClass.meetingRoom.roomName);

  await Attendance.findOneAndUpdate(
    { liveClass: req.params.id, student: req.user._id },
    {
      joinedAt: new Date(),
      attended: true,
      status: "attended",
    },
    { upsert: true, new: true }
  );

  sendResponse(res, 200, "Joined live class", {
    roomUrl: liveClass.meetingRoom.roomUrl,
    token: token.token,
  });
});

export const getLiveClassRecording = asyncHandler(async (req, res) => {
  const liveClass = await LiveClass.findById(req.params.id);
  if (!liveClass) return sendResponse(res, 404, "Live class not found");

  if (!liveClass.recording?.url) {
    return sendResponse(res, 404, "Recording not available");
  }

  sendResponse(res, 200, "Recording retrieved", liveClass.recording);
});