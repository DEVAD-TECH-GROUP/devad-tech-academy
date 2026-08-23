import Course from "../../models/course/Course.js";
import Enrollment from "../../models/learning/Enrollment.js";
import Assignment from "../../models/assessment/Assignment.js";
import Submission from "../../models/assessment/Submission.js";
import LiveClass from "../../models/live/LiveClass.js";
import Payment from "../../models/payment/Payment.js";
import Review from "../../models/review/Review.js";
import sendResponse from "../../utils/sendResponse.js";
import asyncHandler from "../../middlewares/error/asyncHandler.js";

export const getDashboardStats = asyncHandler(async (req, res) => {
  const instructorId = req.user._id;

  const [
    totalCourses, totalStudents, pendingSubmissions,
    upcomingClasses, totalReviews,
  ] = await Promise.all([
    Course.countDocuments({ instructor: instructorId }),
    Enrollment.countDocuments({ course: { $in: await Course.find({ instructor: instructorId }).distinct("_id") } }),
    Submission.countDocuments({
      assignment: {
        $in: await Assignment.find({ instructor: instructorId }).distinct("_id"),
      },
      status: "submitted",
    }),
    LiveClass.countDocuments({
      instructor: instructorId,
      scheduledAt: { $gte: new Date() },
      status: "scheduled",
    }),
    Review.countDocuments({ instructor: instructorId }),
  ]);

  const revenueAgg = await Payment.aggregate([
    { $match: { status: "success" } },
    { $group: { _id: null, total: { $sum: "$finalAmount" } } },
  ]);

  sendResponse(res, 200, "Dashboard stats retrieved", {
    totalCourses,
    totalStudents,
    pendingSubmissions,
    upcomingClasses,
    totalReviews,
    totalRevenue: revenueAgg[0]?.total || 0,
  });
});

export const getDashboardActivity = asyncHandler(async (req, res) => {
  const instructorId = req.user._id;

  const recentEnrollments = await Enrollment.find({
    course: {
      $in: await Course.find({ instructor: instructorId }).distinct("_id"),
    },
  })
    .sort({ enrolledAt: -1 })
    .limit(5)
    .populate("student", "firstName lastName avatar")
    .populate("course", "title");

  sendResponse(res, 200, "Activity retrieved", { recentEnrollments });
});

export const getDashboardCalendar = asyncHandler(async (req, res) => {
  const upcoming = await LiveClass.find({
    instructor: req.user._id,
    scheduledAt: { $gte: new Date() },
    status: "scheduled",
  })
    .sort({ scheduledAt: 1 })
    .limit(5)
    .populate("course", "title");

  sendResponse(res, 200, "Calendar retrieved", upcoming);
});