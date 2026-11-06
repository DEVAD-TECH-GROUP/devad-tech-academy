import crypto from "crypto";
import User from "../../models/user/User.js";
import Instructor from "../../models/user/Instructor.js";
import Course from "../../models/course/Course.js";
import Payment from "../../models/payment/Payment.js";
import Review from "../../models/review/Review.js";
import paginate from "../../utils/pagination.js";
import sendResponse from "../../utils/sendResponse.js";
import asyncHandler from "../../middlewares/error/asyncHandler.js";
import auditLogger from "../../services/audit/auditLogger.js";
import sendEmail from "../../services/email/emailService.js";
import instructorApprovedTemplate from "../../templates/email/instructorApproved.js";
import instructorRejectedTemplate from "../../templates/email/instructorRejected.js";
import { createNotification } from "../../services/notification/inAppService.js";
import {
  AUDIT_TYPES,
  EMAIL_SUBJECTS,
  NOTIFICATION_TYPES,
} from "../../utils/constants.js";

// ─────────────────────────────────────────────────────────────
// Get all instructors
// ─────────────────────────────────────────────────────────────
export const getAllInstructors = asyncHandler(async (req, res) => {
  const { page, limit, search } = req.query;

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

// ─────────────────────────────────────────────────────────────
// Get instructor applications
// ─────────────────────────────────────────────────────────────
export const getInstructorApplications = asyncHandler(async (req, res) => {
  const { page, limit, status = "pending" } = req.query;

  const result = await paginate(
    Instructor,
    { applicationStatus: status },
    { page, limit, populate: "user" }
  );

  sendResponse(res, 200, "Instructor applications retrieved", result);
});

// ─────────────────────────────────────────────────────────────
// Get single instructor with essential details
// ─────────────────────────────────────────────────────────────
export const getInstructor = asyncHandler(async (req, res) => {
  const instructor = await Instructor.findOne({ user: req.params.id })
    .select(
      [
        "applicationStatus",
        "applicationDate",
        "applicationEmail",
        "applicationPhone",
        "expertise",
        "experience",
        "portfolio",
        "teachingExperience",
        "course",
        "availability",
        "coverLetter",
        "cv",
        "education",
        "certifications",
        "totalCourses",
        "totalStudents",
        "totalRevenue",
        "totalLiveClasses",
        "totalAssignmentsGraded",
        "averageRating",
        "totalReviews",
        "xpPoints",
        "level",
        "approvedBy",
        "approvedAt",
        "rejectionReason",
        "createdAt",
        "updatedAt",
      ].join(" ")
    )
    .populate({
      path: "user",
      select: [
        "firstName",
        "lastName",
        "email",
        "phone",
        "avatar",
        "role",
        "status",
        "isEmailVerified",
        "isPhoneVerified",
        "isGoogleAuth",
        "isTwoFactorEnabled",
        "lastLogin",
        "bio",
        "headline",
        "location",
        "socialLinks",
        "connectedAccounts",
        "createdAt",
        "updatedAt",
      ].join(" "),
    })
    .populate({
      path: "approvedBy",
      select: "firstName lastName email avatar",
    });

  if (!instructor) {
    return sendResponse(res, 404, "Instructor not found");
  }

  const userId = instructor.user._id;

  const courses = await Course.find({ instructor: userId })
    .select(
      [
        "title",
        "slug",
        "subtitle",
        "shortDescription",
        "thumbnail",
        "level",
        "language",
        "status",
        "price",
        "isFree",
        "discountPrice",
        "totalModules",
        "totalLessons",
        "totalProjects",
        "totalAssignments",
        "totalDuration",
        "totalStudents",
        "totalReviews",
        "averageRating",
        "totalRevenue",
        "isFeatured",
        "publishedAt",
        "createdAt",
        "updatedAt",
      ].join(" ")
    )
    .sort({ createdAt: -1 });

  const reviews = await Review.find({ instructor: userId })
    .select(
      [
        "student",
        "course",
        "rating",
        "title",
        "content",
        "detailedRatings",
        "instructorReply",
        "totalLikes",
        "isFlagged",
        "flagReason",
        "isRemoved",
        "removedAt",
        "isVerified",
        "createdAt",
      ].join(" ")
    )
    .populate({ path: "student", select: "firstName lastName avatar" })
    .populate({ path: "course", select: "title slug thumbnail" })
    .sort({ createdAt: -1 })
    .limit(10);

  const instructorData = instructor.toObject();

  sendResponse(res, 200, "Instructor retrieved", {
    ...instructorData,
    courses,
    reviews,
    stats: {
      totalCourses: instructor.totalCourses || 0,
      totalStudents: instructor.totalStudents || 0,
      totalRevenue: instructor.totalRevenue || 0,
      averageRating: instructor.averageRating || 0,
      totalReviews: instructor.totalReviews || 0,
      totalLiveClasses: instructor.totalLiveClasses || 0,
      totalAssignmentsGraded: instructor.totalAssignmentsGraded || 0,
      xpPoints: instructor.xpPoints || 0,
      level: instructor.level || 0,
    },
  });
});

// ─────────────────────────────────────────────────────────────
// Approve instructor
// ─────────────────────────────────────────────────────────────
export const approveInstructor = asyncHandler(async (req, res) => {
  // 1. Find application
  const instructor = await Instructor.findOne({ user: req.params.id });

  if (!instructor) {
    return sendResponse(res, 404, "Instructor application not found");
  }

  // 2. Find user
  const user = await User.findById(instructor.user);

  if (!user) {
    return sendResponse(
      res,
      404,
      "User associated with this instructor application was not found"
    );
  }

  // 3. Prevent duplicate approval
  if (instructor.applicationStatus === "approved" && user.role === "instructor") {
    return sendResponse(
      res,
      400,
      "This instructor application has already been approved"
    );
  }

  // 4. Promote user, verify email, create one-time password setup token
  const setPasswordToken = crypto.randomBytes(32).toString("hex");

  user.role = "instructor";
  user.isEmailVerified = true;
  user.passwordSetupTokenHash = crypto
    .createHash("sha256")
    .update(setPasswordToken)
    .digest("hex");
  user.passwordSetupExpire = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await user.save();

  // 5. Update application
  instructor.applicationStatus = "approved";
  instructor.approvedBy = req.user._id;
  instructor.approvedAt = new Date();
  instructor.rejectionReason = null;

  await instructor.save();

  // 6. Populate user for email / notification / response
  await instructor.populate("user");

  // 7. Send approval email (a mail failure must not break the approval)
  try {
    await sendEmail({
      to: instructor.user.email,
      subject: EMAIL_SUBJECTS.INSTRUCTOR_APPROVED,
      htmlContent: instructorApprovedTemplate({
        firstName: instructor.user.firstName,
        setPasswordUrl: `${process.env.CLIENT_URL}/set-password/${setPasswordToken}`,
        loginUrl: `${process.env.CLIENT_URL}/login`,
      }),
    });
  } catch (err) {
    console.error("[INSTRUCTOR APPROVED EMAIL]", err.message);

    // Token was never delivered, so invalidate it. They can use Forgot password.
    user.passwordSetupTokenHash = undefined;
    user.passwordSetupExpire = undefined;
    await user.save();
  }

  // 8. In-app notification
  await createNotification({
    recipientId: instructor.user._id,
    type: NOTIFICATION_TYPES.SYSTEM,
    title: "Application Approved! 🎓",
    message:
      "Congratulations! Your instructor application has been approved. Your account is now an instructor account.",
    actionUrl: "/instructor/dashboard",
  });

  // 9. Audit log
  await auditLogger({
    actor: req.user._id,
    actorRole: req.user.role,
    action: `Approved instructor: ${instructor.user.email}`,
    type: AUDIT_TYPES.APPROVAL,
    targetModel: "Instructor",
    targetId: instructor._id,
    ipAddress: req.ip,
  });

  // 10. Response
  sendResponse(
    res,
    200,
    "Instructor approved successfully. User role changed to instructor.",
    instructor
  );
});

// ─────────────────────────────────────────────────────────────
// Reject instructor
// ─────────────────────────────────────────────────────────────
export const rejectInstructor = asyncHandler(async (req, res) => {
  const { reason } = req.body;

  const rejectionReason =
    reason || "Your application did not meet our current requirements.";

  const instructor = await Instructor.findOneAndUpdate(
    { user: req.params.id },
    {
      applicationStatus: "rejected",
      rejectionReason,
    },
    { new: true }
  ).populate("user");

  if (!instructor) {
    return sendResponse(res, 404, "Instructor not found");
  }

  // Never leave a rejected applicant as an instructor
  if (instructor.user.role === "instructor") {
    instructor.user.role = "student";
    await instructor.user.save();
  }

  try {
    await sendEmail({
      to: instructor.user.email,
      subject: EMAIL_SUBJECTS.INSTRUCTOR_REJECTED,
      htmlContent: instructorRejectedTemplate({
        firstName: instructor.user.firstName,
        reason: rejectionReason,
        reapplyUrl: `${process.env.CLIENT_URL}/apply-instructor`,
      }),
    });
  } catch (err) {
    console.error("[INSTRUCTOR REJECTED EMAIL]", err.message);
  }

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

// ─────────────────────────────────────────────────────────────
// Get instructor performance
// ─────────────────────────────────────────────────────────────
export const getInstructorPerformance = asyncHandler(async (req, res) => {
  const instructor = await Instructor.findOne({ user: req.params.id });

  if (!instructor) {
    return sendResponse(res, 404, "Instructor not found");
  }

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

// ─────────────────────────────────────────────────────────────
// Get instructor earnings
// ─────────────────────────────────────────────────────────────
export const getInstructorEarnings = asyncHandler(async (req, res) => {
  const payments = await Payment.find({ status: "success" }).sort({
    createdAt: -1,
  });

  sendResponse(res, 200, "Instructor earnings retrieved", payments);
});

// ─────────────────────────────────────────────────────────────
// Get instructor activity
// ─────────────────────────────────────────────────────────────
export const getInstructorActivity = asyncHandler(async (req, res) => {
  const courses = await Course.find({ instructor: req.params.id })
    .sort({ updatedAt: -1 })
    .limit(10);

  sendResponse(res, 200, "Instructor activity retrieved", courses);
});
