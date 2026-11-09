import mongoose from "mongoose";

import LiveClass from "../../models/live/LiveClass.js";
import Attendance from "../../models/live/Attendance.js";
import Enrollment from "../../models/learning/Enrollment.js";

import sendResponse from "../../utils/sendResponse.js";
import asyncHandler from "../../middlewares/error/asyncHandler.js";

import {
  getStudentToken,
} from "../../services/meeting/liveKitService.js";

import { LIVE_CLASS_STATUS } from "../../utils/constants.js";

// Confirm that the student is actively enrolled in the class course.
const verifyEnrollment = async (studentId, courseId) => {
  return Enrollment.findOne({
    student: studentId,
    course: courseId,
    status: "active",
  });
};

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

  return sendResponse(
    res,
    200,
    "Live classes retrieved",
    liveClasses
  );
});

export const getLiveClass = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return sendResponse(res, 400, "Invalid live class ID");
  }

  const liveClass = await LiveClass.findById(req.params.id)
    .populate("course", "title")
    .populate("instructor", "firstName lastName avatar");

  if (!liveClass) {
    return sendResponse(res, 404, "Live class not found");
  }

  const enrollment = await verifyEnrollment(
    req.user._id,
    liveClass.course._id
  );

  if (!enrollment) {
    return sendResponse(
      res,
      403,
      "You are not enrolled in this course"
    );
  }

  const attendance = await Attendance.findOne({
    liveClass: liveClass._id,
    student: req.user._id,
  });

  return sendResponse(
    res,
    200,
    "Live class retrieved",
    { liveClass, attendance }
  );
});

export const joinLiveClass = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return sendResponse(res, 400, "Invalid live class ID");
  }

  const liveClass = await LiveClass.findById(req.params.id);

  if (!liveClass) {
    return sendResponse(res, 404, "Live class not found");
  }

  const enrollment = await verifyEnrollment(
    req.user._id,
    liveClass.course
  );

  if (!enrollment) {
    return sendResponse(
      res,
      403,
      "You are not enrolled in this course"
    );
  }

  if (liveClass.status !== LIVE_CLASS_STATUS.LIVE) {
    return sendResponse(
      res,
      400,
      "This live class has not started yet"
    );
  }

  const roomName = liveClass.meetingRoom?.roomName;

  if (!roomName) {
    return sendResponse(
      res,
      500,
      "The classroom has not been configured correctly"
    );
  }

  const studentName = [
    req.user.firstName,
    req.user.lastName,
  ]
    .filter(Boolean)
    .join(" ")
    .trim() || "DEVAD Student";

  const token = await getStudentToken({
    roomName,
    studentId: req.user._id.toString(),
    studentName,
  });

  // Attendance is deliberately NOT recorded here.
  // The verified LiveKit participant_joined webhook records it
  // only after the student's media connection becomes active.

  return sendResponse(res, 200, "Classroom access granted", {
    serverUrl: liveClass.meetingRoom.roomUrl,
    roomName,
    token,
    liveClass: {
      _id: liveClass._id,
      title: liveClass.title,
      duration: liveClass.duration,
      status: liveClass.status,
      course: liveClass.course,
    },
  });
});

export const getLiveClassRecording = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return sendResponse(res, 400, "Invalid live class ID");
  }

  const liveClass = await LiveClass.findById(req.params.id);

  if (!liveClass) {
    return sendResponse(res, 404, "Live class not found");
  }

  const enrollment = await verifyEnrollment(
    req.user._id,
    liveClass.course
  );

  if (!enrollment) {
    return sendResponse(
      res,
      403,
      "You are not enrolled in this course"
    );
  }

  if (!liveClass.recording?.url) {
    return sendResponse(res, 404, "Recording not available");
  }

  return sendResponse(
    res,
    200,
    "Recording retrieved",
    liveClass.recording
  );
});
