import Enrollment from "../../models/learning/Enrollment.js";
import Student from "../../models/user/Student.js";
import Streak from "../../models/gamification/Streak.js";
import LiveClass from "../../models/live/LiveClass.js";
import Assignment from "../../models/assessment/Assignment.js";
import Quiz from "../../models/assessment/Quiz.js";
import sendResponse from "../../utils/sendResponse.js";
import asyncHandler from "../../middlewares/error/asyncHandler.js";

export const getDashboardStats = asyncHandler(async (req, res) => {
  const studentId = req.user._id;

  const [student, streak, enrollments] = await Promise.all([
    Student.findOne({ user: studentId }),
    Streak.findOne({ student: studentId }),
    Enrollment.find({ student: studentId, status: "active" })
      .populate("course", "title thumbnail totalLessons")
      .sort({ lastAccessedAt: -1 })
      .limit(5),
  ]);

  sendResponse(res, 200, "Dashboard stats retrieved", {
    stats: {
      totalEnrolled: student?.totalCoursesEnrolled || 0,
      totalCompleted: student?.totalCoursesCompleted || 0,
      totalCertificates: student?.totalCertificates || 0,
      xpPoints: student?.xpPoints || 0,
      level: student?.level || 1,
      currentStreak: streak?.currentStreak || 0,
      longestStreak: streak?.longestStreak || 0,
      dailyGoalMinutes: student?.dailyGoalMinutes || 60,
      todayMinutes: student?.todayMinutes || 0,
    },
    recentCourses: enrollments,
  });
});

export const getDashboardActivity = asyncHandler(async (req, res) => {
  const streak = await Streak.findOne({ student: req.user._id });
  sendResponse(res, 200, "Activity retrieved", {
    weeklyActivity: streak?.activityLog?.slice(-7) || [],
  });
});

export const getStreak = asyncHandler(async (req, res) => {
  const streak = await Streak.findOne({ student: req.user._id });
  sendResponse(res, 200, "Streak retrieved", streak || { currentStreak: 0 });
});

export const getUpcoming = asyncHandler(async (req, res) => {
  const courses = await Enrollment.find({
    student: req.user._id,
    status: "active",
  }).distinct("course");

  const [liveClasses, assignments, quizzes] = await Promise.all([
    LiveClass.find({
      course: { $in: courses },
      scheduledAt: { $gte: new Date() },
      status: "scheduled",
    })
      .sort({ scheduledAt: 1 })
      .limit(3)
      .populate("course", "title"),

    Assignment.find({
      course: { $in: courses },
      dueDate: { $gte: new Date() },
      isPublished: true,
    })
      .sort({ dueDate: 1 })
      .limit(3)
      .populate("course", "title"),

    Quiz.find({
      course: { $in: courses },
      status: "active",
      availableUntil: { $gte: new Date() },
    })
      .sort({ availableUntil: 1 })
      .limit(3)
      .populate("course", "title"),
  ]);

  sendResponse(res, 200, "Upcoming items retrieved", {
    liveClasses, assignments, quizzes,
  });
});