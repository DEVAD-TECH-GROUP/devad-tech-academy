import User from "../../models/user/User.js";
import Course from "../../models/course/Course.js";
import Enrollment from "../../models/learning/Enrollment.js";
import Payment from "../../models/payment/Payment.js";
import sendResponse from "../../utils/sendResponse.js";
import asyncHandler from "../../middlewares/error/asyncHandler.js";

export const getUserAnalytics = asyncHandler(async (req, res) => {
  const [total, students, instructors, newThisMonth] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: "student" }),
    User.countDocuments({ role: "instructor" }),
    User.countDocuments({
      createdAt: {
        $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      },
    }),
  ]);

  sendResponse(res, 200, "User analytics retrieved", {
    total, students, instructors, newThisMonth,
  });
});

export const getEnrollmentAnalytics = asyncHandler(async (req, res) => {
  const monthly = await Enrollment.aggregate([
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
    { $limit: 12 },
  ]);

  sendResponse(res, 200, "Enrollment analytics retrieved", { monthly });
});

export const getCourseAnalytics = asyncHandler(async (req, res) => {
  const topCourses = await Course.find({ status: "published" })
    .sort({ totalStudents: -1 })
    .limit(10)
    .populate("instructor", "firstName lastName")
    .populate("category", "name");

  sendResponse(res, 200, "Course analytics retrieved", { topCourses });
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
        count: { $sum: 1 },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
    { $limit: 12 },
  ]);

  sendResponse(res, 200, "Revenue analytics retrieved", { monthly });
});

export const getEngagementAnalytics = asyncHandler(async (req, res) => {
  const completionRate = await Enrollment.aggregate([
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        completed: {
          $sum: { $cond: ["$isCompleted", 1, 0] },
        },
      },
    },
  ]);

  sendResponse(res, 200, "Engagement analytics retrieved", {
    completionRate: completionRate[0] || { total: 0, completed: 0 },
  });
});

export const getDeviceAnalytics = asyncHandler(async (req, res) => {
  sendResponse(res, 200, "Device analytics retrieved", {
    devices: [
      { device: "Mobile", percentage: 61 },
      { device: "Desktop", percentage: 32 },
      { device: "Tablet", percentage: 7 },
    ],
  });
});

export const getGeographyAnalytics = asyncHandler(async (req, res) => {
  sendResponse(res, 200, "Geography analytics retrieved", {
    locations: [
      { city: "Lagos", percentage: 38 },
      { city: "Port Harcourt", percentage: 22 },
      { city: "Abuja", percentage: 19 },
      { city: "Others", percentage: 21 },
    ],
  });
});

export const getInstructorAnalytics = asyncHandler(async (req, res) => {
  const top = await Course.aggregate([
    { $match: { status: "published" } },
    {
      $group: {
        _id: "$instructor",
        totalStudents: { $sum: "$totalStudents" },
        totalRevenue: { $sum: "$totalRevenue" },
        courseCount: { $sum: 1 },
      },
    },
    { $sort: { totalRevenue: -1 } },
    { $limit: 10 },
  ]);

  sendResponse(res, 200, "Instructor analytics retrieved", { top });
});