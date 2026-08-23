import Course from "../../models/course/Course.js";
import Enrollment from "../../models/learning/Enrollment.js";
import paginate from "../../utils/pagination.js";
import sendResponse from "../../utils/sendResponse.js";
import asyncHandler from "../../middlewares/error/asyncHandler.js";
import auditLogger from "../../services/audit/auditLogger.js";
import { AUDIT_TYPES } from "../../utils/constants.js";
import { createNotification } from "../../services/notification/inAppService.js";
import { NOTIFICATION_TYPES } from "../../utils/constants.js";

// ── Get all courses ───────────────────────────────────────
export const getAllCourses = asyncHandler(async (req, res) => {
  const { page, limit, status, category, search } = req.query;

  const query = {};
  if (status) query.status = status;
  if (category) query.category = category;
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: "i" } },
    ];
  }

  const result = await paginate(Course, query, {
    page, limit,
    populate: "instructor category",
    sort: { createdAt: -1 },
  });

  sendResponse(res, 200, "Courses retrieved", result);
});

// ── Get single course ─────────────────────────────────────
export const getCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id)
    .populate("instructor", "firstName lastName email")
    .populate("category", "name");

  if (!course) return sendResponse(res, 404, "Course not found");
  sendResponse(res, 200, "Course retrieved", course);
});

// ── Create course (super admin) ───────────────────────────
export const createCourse = asyncHandler(async (req, res) => {
  const course = await Course.create({
    ...req.body,
    instructor: req.user._id,
    status: "published",
  });

  sendResponse(res, 201, "Course created", course);
});

// ── Update course ─────────────────────────────────────────
export const updateCourse = asyncHandler(async (req, res) => {
  const course = await Course.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  if (!course) return sendResponse(res, 404, "Course not found");

  await auditLogger({
    actor: req.user._id,
    actorRole: req.user.role,
    action: `Updated course: ${course.title}`,
    type: AUDIT_TYPES.CONTENT,
    targetModel: "Course",
    targetId: course._id,
    ipAddress: req.ip,
  });

  sendResponse(res, 200, "Course updated", course);
});

// ── Delete course ─────────────────────────────────────────
export const deleteCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) return sendResponse(res, 404, "Course not found");

  await Course.findByIdAndDelete(req.params.id);

  await auditLogger({
    actor: req.user._id,
    actorRole: req.user.role,
    action: `Deleted course: ${course.title}`,
    type: AUDIT_TYPES.CONTENT,
    targetModel: "Course",
    targetId: course._id,
    ipAddress: req.ip,
  });

  sendResponse(res, 200, "Course deleted");
});

// ── Approve course ────────────────────────────────────────
export const approveCourse = asyncHandler(async (req, res) => {
  const course = await Course.findByIdAndUpdate(
    req.params.id,
    {
      status: "published",
      approvedBy: req.user._id,
      approvedAt: new Date(),
      publishedAt: new Date(),
    },
    { new: true }
  );

  if (!course) return sendResponse(res, 404, "Course not found");

  await createNotification({
    recipientId: course.instructor,
    type: NOTIFICATION_TYPES.COURSE,
    title: "Course Approved! 🎉",
    message: `Your course "${course.title}" has been approved and published.`,
    actionUrl: `/instructor/courses/${course._id}`,
  });

  await auditLogger({
    actor: req.user._id,
    actorRole: req.user.role,
    action: `Approved course: ${course.title}`,
    type: AUDIT_TYPES.APPROVAL,
    targetModel: "Course",
    targetId: course._id,
    ipAddress: req.ip,
  });

  sendResponse(res, 200, "Course approved", course);
});

// ── Reject course ─────────────────────────────────────────
export const rejectCourse = asyncHandler(async (req, res) => {
  const { reason } = req.body;

  const course = await Course.findByIdAndUpdate(
    req.params.id,
    { status: "rejected", rejectionReason: reason },
    { new: true }
  );

  if (!course) return sendResponse(res, 404, "Course not found");

  await createNotification({
    recipientId: course.instructor,
    type: NOTIFICATION_TYPES.COURSE,
    title: "Course Rejected",
    message: `Your course "${course.title}" needs revision. Check feedback.`,
    actionUrl: `/instructor/courses/${course._id}`,
  });

  sendResponse(res, 200, "Course rejected", course);
});

// ── Archive course ────────────────────────────────────────
export const archiveCourse = asyncHandler(async (req, res) => {
  const course = await Course.findByIdAndUpdate(
    req.params.id,
    { status: "archived" },
    { new: true }
  );

  if (!course) return sendResponse(res, 404, "Course not found");
  sendResponse(res, 200, "Course archived", course);
});

// ── Feature course ────────────────────────────────────────
export const featureCourse = asyncHandler(async (req, res) => {
  const course = await Course.findByIdAndUpdate(
    req.params.id,
    { isFeatured: !req.body.isFeatured },
    { new: true }
  );

  if (!course) return sendResponse(res, 404, "Course not found");
  sendResponse(res, 200, "Course featured status updated", course);
});

// ── Get course analytics ──────────────────────────────────
export const getCourseAnalytics = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) return sendResponse(res, 404, "Course not found");

  const enrollments = await Enrollment.countDocuments({
    course: req.params.id,
  });

  const completed = await Enrollment.countDocuments({
    course: req.params.id,
    isCompleted: true,
  });

  sendResponse(res, 200, "Course analytics retrieved", {
    course,
    enrollments,
    completionRate:
      enrollments > 0
        ? Math.round((completed / enrollments) * 100)
        : 0,
  });
});