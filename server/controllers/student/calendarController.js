import LiveClass from "../../models/live/LiveClass.js";
import Assignment from "../../models/assessment/Assignment.js";
import Quiz from "../../models/assessment/Quiz.js";
import Enrollment from "../../models/learning/Enrollment.js";
import sendResponse from "../../utils/sendResponse.js";
import asyncHandler from "../../middlewares/error/asyncHandler.js";

export const getCalendar = asyncHandler(async (req, res) => {
  const courses = await Enrollment.find({
    student: req.user._id,
    status: "active",
  }).distinct("course");

  const [liveClasses, assignments, quizzes] = await Promise.all([
    LiveClass.find({ course: { $in: courses }, scheduledAt: { $gte: new Date() } })
      .populate("course", "title").sort({ scheduledAt: 1 }),
    Assignment.find({ course: { $in: courses }, dueDate: { $gte: new Date() }, isPublished: true })
      .populate("course", "title").sort({ dueDate: 1 }),
    Quiz.find({ course: { $in: courses }, status: "active", availableUntil: { $gte: new Date() } })
      .populate("course", "title").sort({ availableUntil: 1 }),
  ]);

  sendResponse(res, 200, "Calendar retrieved", {
    liveClasses, assignments, quizzes,
  });
});

export const createReminder = asyncHandler(async (req, res) => {
  sendResponse(res, 201, "Reminder created");
});

export const deleteReminder = asyncHandler(async (req, res) => {
  sendResponse(res, 200, "Reminder deleted");
});