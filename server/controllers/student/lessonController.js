import Lesson from "../../models/course/Lesson.js";
import Progress from "../../models/learning/Progress.js";
import Enrollment from "../../models/learning/Enrollment.js";
import Student from "../../models/user/Student.js";
import Course from "../../models/course/Course.js";
import XP from "../../models/gamification/XP.js";
import Streak from "../../models/gamification/Streak.js";
import sendResponse from "../../utils/sendResponse.js";
import asyncHandler from "../../middlewares/error/asyncHandler.js";
import { calculateCourseProgress } from "../../utils/calculateStats.js";
import { XP_POINTS } from "../../utils/constants.js";

export const getLesson = asyncHandler(async (req, res) => {
  const lesson = await Lesson.findById(req.params.id)
    .populate("resources");

  if (!lesson) return sendResponse(res, 404, "Lesson not found");

  const progress = await Progress.findOne({
    student: req.user._id,
    lesson: req.params.id,
  });

  await Progress.findOneAndUpdate(
    { student: req.user._id, lesson: req.params.id },
    {
      $inc: { accessCount: 1 },
      lastAccessedAt: new Date(),
    },
    { upsert: true }
  );

  sendResponse(res, 200, "Lesson retrieved", { lesson, progress });
});

export const completeLesson = asyncHandler(async (req, res) => {
  const lesson = await Lesson.findById(req.params.id);
  if (!lesson) return sendResponse(res, 404, "Lesson not found");

  const enrollment = await Enrollment.findOne({
    student: req.user._id,
    course: lesson.course,
  });

  if (!enrollment) return sendResponse(res, 403, "Not enrolled");

  const existing = await Progress.findOne({
    student: req.user._id,
    lesson: req.params.id,
  });

  if (existing?.isCompleted) {
    return sendResponse(res, 200, "Lesson already completed");
  }

  await Progress.findOneAndUpdate(
    { student: req.user._id, lesson: req.params.id },
    {
      isCompleted: true,
      completedAt: new Date(),
      enrollment: enrollment._id,
      course: lesson.course,
    },
    { upsert: true, new: true }
  );

  await Enrollment.findByIdAndUpdate(enrollment._id, {
    $addToSet: { completedLessons: req.params.id },
    $inc: { totalLessonsCompleted: 1 },
    lastAccessedAt: new Date(),
    lastAccessedLesson: req.params.id,
  });

  const course = await Course.findById(lesson.course);
  const completedCount = enrollment.completedLessons.length + 1;
  const progress = calculateCourseProgress(completedCount, course.totalLessons);

  await Enrollment.findByIdAndUpdate(enrollment._id, { progress });

  if (progress >= 100) {
    await Enrollment.findByIdAndUpdate(enrollment._id, {
      isCompleted: true,
      completedAt: new Date(),
    });

    await Student.findOneAndUpdate(
      { user: req.user._id },
      { $inc: { totalCoursesCompleted: 1 } }
    );
  }

  await Student.findOneAndUpdate(
    { user: req.user._id },
    { $inc: { totalLessonsCompleted: 1, xpPoints: XP_POINTS.LESSON_COMPLETE } }
  );

  await XP.create({
    student: req.user._id,
    action: "LESSON_COMPLETE",
    points: XP_POINTS.LESSON_COMPLETE,
    description: `Completed lesson: ${lesson.title}`,
    reference: { model: "Lesson", id: lesson._id },
  });

  await Streak.findOneAndUpdate(
    { student: req.user._id },
    {
      lastActiveDate: new Date(),
      $inc: { totalActiveDays: 1 },
    },
    { upsert: true }
  );

  sendResponse(res, 200, "Lesson completed", { progress });
});

export const updateProgress = asyncHandler(async (req, res) => {
  const { watchedDuration, lastPosition, totalDuration } = req.body;

  await Progress.findOneAndUpdate(
    { student: req.user._id, lesson: req.params.id },
    {
      watchedDuration,
      lastPosition,
      totalDuration,
      watchedPercentage: totalDuration > 0
        ? Math.round((watchedDuration / totalDuration) * 100)
        : 0,
      lastAccessedAt: new Date(),
    },
    { upsert: true, new: true }
  );

  sendResponse(res, 200, "Progress updated");
});