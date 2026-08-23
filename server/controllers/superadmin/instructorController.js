import User from "../../models/user/User.js";
import Instructor from "../../models/user/Instructor.js";
import Course from "../../models/course/Course.js";
import Payment from "../../models/payment/Payment.js";
import paginate from "../../utils/pagination.js";
import sendResponse from "../../utils/sendResponse.js";
import asyncHandler from "../../middlewares/error/asyncHandler.js";
import auditLogger from "../../services/audit/auditLogger.js";
import { AUDIT_TYPES } from "../../utils/constants.js";
import sendEmail from "../../services/email/emailService.js";
import instructorApprovedTemplate from "../../templates/email/instructorApproved.js";
import instructorRejectedTemplate from "../../templates/email/instructorRejected.js";
import { EMAIL_SUBJECTS } from "../../utils/constants.js";
import { createNotification } from "../../services/notification/inAppService.js";
import { NOTIFICATION_TYPES } from "../../utils/constants.js";

// ── Get all instructors ───────────────────────────────────
export const getAllInstructors = asyncHandler(async (req, res) => {
  const { page, limit, status, search } = req.query;

  const query = { role: "instructor" };
  if (search) {
    query.$or = [
      { firstName: { $regex: search, $options: "i" } },
      { lastName: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  const result = await paginate(User, query, { page, limit });
  sendResponse(res, 200, "Instructors retrieved", result);
});

// ── Get instructor applications ───────────────────────────
export const getInstructorApplications = asyncHandler(async (req, res) => {
  const { page, limit, status = "pending" } = req.query;

  const query = { applicationStatus: status };
  const result = await paginate(Instructor, query, {
    page, limit,
    populate: "user",
  });

  sendResponse(res, 200, "Instructor applications retrieved", result);
});

// ── Get single instructor ─────────────────────────────────
export const getInstructor = asyncHandler(async (req, res) => {
  const instructor = await Instructor.findOne({
    user: req.params.id,
  }).populate("user");

  if (!instructor) return sendResponse(res, 404, "Instructor not found");

  sendResponse(res, 200, "Instructor retrieved", instructor);
});

// ── Approve instructor ────────────────────────────────────
export const approveInstructor = asyncHandler(async (req, res) => {
  const instructor = await Instructor.findOneAndUpdate(
    { user: req.params.id },
    {
      applicationStatus: "approved",
      approvedBy: req.user._id,
      approvedAt: new Date(),
    },
    { new: true }
  ).populate("user");

  if (!instructor) return sendResponse(res, 404, "Instructor not found");

  await sendEmail({
    to: instructor.user.email,
    subject: EMAIL_SUBJECTS.INSTRUCTOR_APPROVED,
    htmlContent: instructorApprovedTemplate({
      firstName: instructor.user.firstName,
      dashboardUrl: `${process.env.CLIENT_URL}/instructor/dashboard`,
    }),
  });

  await createNotification({
    recipientId: instructor.user._id,
    type: NOTIFICATION_TYPES.SYSTEM,
    title: "Application Approved! 🎓",
    message: "Congratulations! Your instructor application has been approved.",
    actionUrl: "/instructor/dashboard",
  });

  await auditLogger({
    actor: req.user._id,
    actorRole: req.user.role,
    action: `Approved instructor: ${instructor.user.email}`,
    type: AUDIT_TYPES.APPROVAL,
    targetModel: "Instructor",
    targetId: instructor._id,
    ipAddress: req.ip,
  });

  sendResponse(res, 200, "Instructor approved", instructor);
});

// ── Reject instructor ─────────────────────────────────────
export const rejectInstructor = asyncHandler(async (req, res) => {
  const { reason } = req.body;

  const instructor = await Instructor.findOneAndUpdate(
    { user: req.params.id },
    { applicationStatus: "rejected", rejectionReason: reason },
    { new: true }
  ).populate("user");

  if (!instructor) return sendResponse(res, 404, "Instructor not found");

  await sendEmail({
    to: instructor.user.email,
    subject: EMAIL_SUBJECTS.INSTRUCTOR_REJECTED,
    htmlContent: instructorRejectedTemplate({
      firstName: instructor.user.firstName,
      reason: reason || "Your application did not meet our current requirements.",
      reapplyUrl: `${process.env.CLIENT_URL}/apply-instructor`,
    }),
  });

  await auditLogger({
    actor: req.user._id,
    actorRole: req.user.role,
    action: `Rejected instructor: ${instructor.user.email}`,
    type: AUDIT_TYPES.APPROVAL,
    targetModel: "Instructor",
    targetId: instructor._id,
    ipAddress: req.ip,
  });

  sendResponse(res, 200, "Instructor rejected", instructor);
});

// ── Get instructor performance ────────────────────────────
export const getInstructorPerformance = asyncHandler(async (req, res) => {
  const instructor = await Instructor.findOne({
    user: req.params.id,
  });

  if (!instructor) return sendResponse(res, 404, "Instructor not found");

  const courses = await Course.find({ instructor: req.params.id });

  sendResponse(res, 200, "Instructor performance retrieved", {
    instructor,
    courses,
    stats: {
      totalCourses: instructor.totalCourses,
      totalStudents: instructor.totalStudents,
      totalRevenue: instructor.totalRevenue,
      averageRating: instructor.averageRating,
    },
  });
});

// ── Get instructor earnings ───────────────────────────────
export const getInstructorEarnings = asyncHandler(async (req, res) => {
  const payments = await Payment.find({ status: "success" })
    .sort({ createdAt: -1 });

  sendResponse(res, 200, "Instructor earnings retrieved", payments);
});

// ── Get instructor activity ───────────────────────────────
export const getInstructorActivity = asyncHandler(async (req, res) => {
  const courses = await Course.find({ instructor: req.params.id })
    .sort({ updatedAt: -1 })
    .limit(10);

  sendResponse(res, 200, "Instructor activity retrieved", courses);
});