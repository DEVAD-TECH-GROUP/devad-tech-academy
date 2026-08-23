import Enrollment from "../../models/learning/Enrollment.js";
import Progress from "../../models/learning/Progress.js";
import LearningPathAssignment from "../../models/learning/LearningPathAssignment.js";
import sendResponse from "../../utils/sendResponse.js";
import asyncHandler from "../../middlewares/error/asyncHandler.js";

export const getMyProgress = asyncHandler(async (req, res) => {
  const enrollments = await Enrollment.find({
    student: req.user._id,
  })
    .populate("course", "title thumbnail totalLessons")
    .sort({ lastAccessedAt: -1 });

  sendResponse(res, 200, "Progress retrieved", enrollments);
});

export const getCourseProgress = asyncHandler(async (req, res) => {
  const enrollment = await Enrollment.findOne({
    student: req.user._id,
    course: req.params.courseId,
  }).populate("course", "title totalLessons totalModules");

  if (!enrollment) return sendResponse(res, 404, "Enrollment not found");

  const progress = await Progress.find({
    student: req.user._id,
    course: req.params.courseId,
  }).populate("lesson", "title type duration");

  sendResponse(res, 200, "Course progress retrieved", { enrollment, progress });
});

export const getLearningPathProgress = asyncHandler(async (req, res) => {
  const assignment = await LearningPathAssignment.findOne({
    student: req.user._id,
    status: "active",
  })
    .populate("learningPath")
    .populate("completedCourses");

  sendResponse(res, 200, "Learning path progress retrieved", assignment);
});