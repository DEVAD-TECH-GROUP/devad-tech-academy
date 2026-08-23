import User from "../../models/user/User.js";
import Course from "../../models/course/Course.js";
import Enrollment from "../../models/learning/Enrollment.js";
import Payment from "../../models/payment/Payment.js";
import AuditLog from "../../models/system/AuditLog.js";
import LiveClass from "../../models/live/LiveClass.js";
import SupportTicket from "../../models/support/SupportTicket.js";
import Instructor from "../../models/user/Instructor.js";
import asyncHandler from "../../middlewares/error/asyncHandler.js";
import sendResponse from "../../utils/sendResponse.js";

// ── Platform stats ────────────────────────────────────────
export const getPlatformStats = asyncHandler(async (req, res) => {
  const [
    totalUsers, totalStudents, totalInstructors,
    totalCourses, totalEnrollments, pendingInstructors,
    pendingCourses, openTickets,
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: "student" }),
    User.countDocuments({ role: "instructor" }),
    Course.countDocuments({ status: "published" }),
    Enrollment.countDocuments(),
    Instructor.countDocuments({ applicationStatus: "pending" }),
    Course.countDocuments({ status: "pending_review" }),
    SupportTicket.countDocuments({ status: "open" }),
  ]);

  const revenueAgg = await Payment.aggregate([
    { $match: { status: "success" } },
    { $group: { _id: null, total: { $sum: "$finalAmount" } } },
  ]);

  const monthlyRevenue = await Payment.aggregate([
    {
      $match: {
        status: "success",
        createdAt: {
          $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      },
    },
    { $group: { _id: null, total: { $sum: "$finalAmount" } } },
  ]);

  sendResponse(res, 200, "Dashboard stats retrieved", {
    users: {
      total: totalUsers,
      students: totalStudents,
      instructors: totalInstructors,
    },
    courses: {
      total: totalCourses,
      pendingReview: pendingCourses,
    },
    enrollments: { total: totalEnrollments },
    revenue: {
      total: revenueAgg[0]?.total || 0,
      monthly: monthlyRevenue[0]?.total || 0,
    },
    pending: {
      instructors: pendingInstructors,
      courses: pendingCourses,
      tickets: openTickets,
    },
  });
});

// ── System health ─────────────────────────────────────────
export const getSystemHealth = asyncHandler(async (req, res) => {
  const mongoose = await import("mongoose");

  sendResponse(res, 200, "System health retrieved", {
    database: {
      status:
        mongoose.default.connection.readyState === 1
          ? "healthy"
          : "disconnected",
    },
    server: { status: "operational", uptime: process.uptime() },
    memory: process.memoryUsage(),
    timestamp: new Date(),
  });
});

// ── Recent activity ───────────────────────────────────────
export const getRecentActivity = asyncHandler(async (req, res) => {
  const logs = await AuditLog.find()
    .sort({ createdAt: -1 })
    .limit(20)
    .populate("actor", "firstName lastName role");

  sendResponse(res, 200, "Recent activity retrieved", logs);
});

// ── Platform calendar ─────────────────────────────────────
export const getPlatformCalendar = asyncHandler(async (req, res) => {
  const upcoming = await LiveClass.find({
    scheduledAt: { $gte: new Date() },
    status: "scheduled",
  })
    .sort({ scheduledAt: 1 })
    .limit(10)
    .populate("course", "title")
    .populate("instructor", "firstName lastName");

  sendResponse(res, 200, "Platform calendar retrieved", upcoming);
});