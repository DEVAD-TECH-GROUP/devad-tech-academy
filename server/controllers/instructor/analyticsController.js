import Course from "../../models/course/Course.js";
import Enrollment from "../../models/learning/Enrollment.js";
import Review from "../../models/review/Review.js";
import Payment from "../../models/payment/Payment.js";
import sendResponse from "../../utils/sendResponse.js";
import asyncHandler from "../../middlewares/error/asyncHandler.js";

export const getAnalyticsOverview = asyncHandler(async (req, res) => {
  const courses = await Course.find({ instructor: req.user._id }).distinct("_id");

  const [totalStudents, totalEnrollments, avgRating] = await Promise.all([
    Enrollment.distinct("student", { course: { $in: courses } }).then((s) => s.length),
    Enrollment.countDocuments({ course: { $in: courses } }),
    Review.aggregate([
      { $match: { instructor: req.user._id } },
      { $group: { _id: null, avg: { $avg: "$rating" } } },
    ]),
  ]);

  sendResponse(res, 200, "Analytics overview retrieved", {
    totalStudents,
    totalEnrollments,
    averageRating: avgRating[0]?.avg?.toFixed(1) || 0,
  });
});

export const getStudentAnalytics = asyncHandler(async (req, res) => {
  const courses = await Course.find({ instructor: req.user._id }).distinct("_id");

  const enrollments = await Enrollment.aggregate([
    { $match: { course: { $in: courses } } },
    {
      $group: {
        _id: {
          year: { $year: "$enrolledAt" },
          month: { $month: "$enrolledAt" },
        },
        count: { $sum: 1 },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
  ]);

  sendResponse(res, 200, "Student analytics retrieved", enrollments);
});

export const getCourseAnalytics = asyncHandler(async (req, res) => {
  const courses = await Course.find({ instructor: req.user._id })
    .populate("category", "name")
    .sort({ totalStudents: -1 });

  sendResponse(res, 200, "Course analytics retrieved", courses);
});

export const getRevenueAnalytics = asyncHandler(async (req, res) => {
  const monthly = await Payment.aggregate([
    { $match: { status: "success" } },
    {
      $group: {
        _id: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
        },
        revenue: { $sum: "$finalAmount" },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
    { $limit: 12 },
  ]);

  sendResponse(res, 200, "Revenue analytics retrieved", monthly);
});

export const getWatchTimeAnalytics = asyncHandler(async (req, res) => {
  sendResponse(res, 200, "Watch time analytics retrieved", { totalMinutes: 0 });
});