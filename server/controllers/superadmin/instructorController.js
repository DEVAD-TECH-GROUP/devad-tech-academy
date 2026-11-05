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
import Review from "../../models/review/Review.js";

// ─────────────────────────────────────────────────────────────
// Get all instructors
// ─────────────────────────────────────────────────────────────
export const getAllInstructors = asyncHandler(async (req, res) => {
  const { page, limit, status, search } = req.query;

  const query = {
    role: "instructor",
  };

  if (search) {
    query.$or = [
      {
        firstName: {
          $regex: search,
          $options: "i",
        },
      },
      {
        lastName: {
          $regex: search,
          $options: "i",
        },
      },
      {
        email: {
          $regex: search,
          $options: "i",
        },
      },
    ];
  }

  const result = await paginate(User, query, {
    page,
    limit,
  });

  sendResponse(
    res,
    200,
    "Instructors retrieved",
    result
  );
});

// ─────────────────────────────────────────────────────────────
// Get instructor applications
// ─────────────────────────────────────────────────────────────
export const getInstructorApplications = asyncHandler(
  async (req, res) => {
    const {
      page,
      limit,
      status = "pending",
    } = req.query;

    const query = {
      applicationStatus: status,
    };

    const result = await paginate(Instructor, query, {
      page,
      limit,
      populate: "user",
    });

    sendResponse(
      res,
      200,
      "Instructor applications retrieved",
      result
    );
  }
);

// ─────────────────────────────────────────────────────────────
// Get single instructor
// ─────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────
// Get single instructor with essential details
// ─────────────────────────────────────────────────────────────
export const getInstructor = asyncHandler(async (req, res) => {
  const instructor = await Instructor.findOne({
    user: req.params.id,
  })
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

  // Get instructor's courses
  const courses = await Course.find({
    instructor: userId,
  })
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

  // Get the instructor's 10 most recent reviews
  const reviews = await Review.find({
    instructor: userId,
  })
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
    .populate({
      path: "student",
      select: "firstName lastName avatar",
    })
    .populate({
      path: "course",
      select: "title slug thumbnail",
    })
    .sort({ createdAt: -1 })
    .limit(10);

  // Keep existing instructor fields available to the frontend
  const instructorData = instructor.toObject();
  console.log("Instructor Data:", instructorData);

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
      totalAssignmentsGraded:
        instructor.totalAssignmentsGraded || 0,
      xpPoints: instructor.xpPoints || 0,
      level: instructor.level || 0,
    },
  });
});


// ─────────────────────────────────────────────────────────────
// Approve instructor
// ─────────────────────────────────────────────────────────────
export const approveInstructor = asyncHandler(
  async (req, res) => {
    /*
    ----------------------------------------------------------
    1. Find the instructor application
    ----------------------------------------------------------
    */
    const instructor = await Instructor.findOne({
      user: req.params.id,
    });

    if (!instructor) {
      return sendResponse(
        res,
        404,
        "Instructor application not found"
      );
    }

    /*
    ----------------------------------------------------------
    2. Find the actual User account
    ----------------------------------------------------------
    */
    const user = await User.findById(instructor.user);

    if (!user) {
      return sendResponse(
        res,
        404,
        "User associated with this instructor application was not found"
      );
    }

    /*
    ----------------------------------------------------------
    3. Prevent unnecessary duplicate approval
    ----------------------------------------------------------
    */
    if (
      instructor.applicationStatus === "approved" &&
      user.role === "instructor"
    ) {
      return sendResponse(
        res,
        400,
        "This instructor application has already been approved"
      );
    }

    /*
    ----------------------------------------------------------
    4. Change the actual User role

       THIS IS THE IMPORTANT FIX.

       Student:
       role = "student"

       After approval:
       role = "instructor"
    ----------------------------------------------------------
    */
    user.role = "instructor";

    await user.save();

    /*
    ----------------------------------------------------------
    5. Update instructor application
    ----------------------------------------------------------
    */
    instructor.applicationStatus = "approved";
    instructor.approvedBy = req.user._id;
    instructor.approvedAt = new Date();
    instructor.rejectionReason = null;

    await instructor.save();

    /*
    ----------------------------------------------------------
    6. Populate user for email/notification/response
    ----------------------------------------------------------
    */
    await instructor.populate("user");

    /*
    ----------------------------------------------------------
    7. Send approval email
    ----------------------------------------------------------
    */
    await sendEmail({
      to: instructor.user.email,

      subject:
        EMAIL_SUBJECTS.INSTRUCTOR_APPROVED,

      htmlContent:
        instructorApprovedTemplate({
          firstName:
            instructor.user.firstName,

          dashboardUrl:
            `${process.env.CLIENT_URL}/instructor/dashboard`,
        }),
    });

    /*
    ----------------------------------------------------------
    8. Create in-app notification
    ----------------------------------------------------------
    */
    await createNotification({
      recipientId: instructor.user._id,

      type: NOTIFICATION_TYPES.SYSTEM,

      title: "Application Approved! 🎓",

      message:
        "Congratulations! Your instructor application has been approved. Your account is now an instructor account.",

      actionUrl:
        "/instructor/dashboard",
    });

    /*
    ----------------------------------------------------------
    9. Audit log
    ----------------------------------------------------------
    */
    await auditLogger({
      actor: req.user._id,

      actorRole: req.user.role,

      action:
        `Approved instructor: ${instructor.user.email}`,

      type: AUDIT_TYPES.APPROVAL,

      targetModel: "Instructor",

      targetId: instructor._id,

      ipAddress: req.ip,
    });

    /*
    ----------------------------------------------------------
    10. Return successful response
    ----------------------------------------------------------
    */
    sendResponse(
      res,
      200,
      "Instructor approved successfully. User role changed to instructor.",
      instructor
    );
  }
);

// ─────────────────────────────────────────────────────────────
// Reject instructor
// ─────────────────────────────────────────────────────────────
export const rejectInstructor = asyncHandler(
  async (req, res) => {
    const { reason } = req.body;

    const instructor = await Instructor.findOneAndUpdate(
      {
        user: req.params.id,
      },
      {
        applicationStatus: "rejected",
        rejectionReason:
          reason ||
          "Your application did not meet our current requirements.",
      },
      {
        new: true,
      }
    ).populate("user");

    if (!instructor) {
      return sendResponse(
        res,
        404,
        "Instructor not found"
      );
    }

    /*
    ----------------------------------------------------------
    Make sure rejection does not accidentally leave a student
    as an instructor.

    Normally a pending student application should still have
    role = student, so we only force the role back if needed.
    ----------------------------------------------------------
    */
    if (instructor.user.role === "instructor") {
      instructor.user.role = "student";
      await instructor.user.save();
    }

    /*
    ----------------------------------------------------------
    Send rejection email
    ----------------------------------------------------------
    */
    await sendEmail({
      to: instructor.user.email,

      subject:
        EMAIL_SUBJECTS.INSTRUCTOR_REJECTED,

      htmlContent:
        instructorRejectedTemplate({
          firstName:
            instructor.user.firstName,

          reason:
            reason ||
            "Your application did not meet our current requirements.",

          reapplyUrl:
            `${process.env.CLIENT_URL}/apply-instructor`,
        }),
    });

    /*
    ----------------------------------------------------------
    Audit log
    ----------------------------------------------------------
    */
    await auditLogger({
      actor: req.user._id,

      actorRole: req.user.role,

      action:
        `Rejected instructor: ${instructor.user.email}`,

      type: AUDIT_TYPES.APPROVAL,

      targetModel: "Instructor",

      targetId: instructor._id,

      ipAddress: req.ip,
    });

    sendResponse(
      res,
      200,
      "Instructor rejected",
      instructor
    );
  }
);

// ─────────────────────────────────────────────────────────────
// Get instructor performance
// ─────────────────────────────────────────────────────────────
export const getInstructorPerformance = asyncHandler(
  async (req, res) => {
    const instructor = await Instructor.findOne({
      user: req.params.id,
    });

    if (!instructor) {
      return sendResponse(
        res,
        404,
        "Instructor not found"
      );
    }

    const courses = await Course.find({
      instructor: req.params.id,
    });

    sendResponse(
      res,
      200,
      "Instructor performance retrieved",
      {
        instructor,

        courses,

        stats: {
          totalCourses:
            instructor.totalCourses,

          totalStudents:
            instructor.totalStudents,

          totalRevenue:
            instructor.totalRevenue,

          averageRating:
            instructor.averageRating,
        },
      }
    );
  }
);

// ─────────────────────────────────────────────────────────────
// Get instructor earnings
// ─────────────────────────────────────────────────────────────
export const getInstructorEarnings = asyncHandler(
  async (req, res) => {
    const payments = await Payment.find({
      status: "success",
    }).sort({
      createdAt: -1,
    });

    sendResponse(
      res,
      200,
      "Instructor earnings retrieved",
      payments
    );
  }
);

// ─────────────────────────────────────────────────────────────
// Get instructor activity
// ─────────────────────────────────────────────────────────────
export const getInstructorActivity = asyncHandler(
  async (req, res) => {
    const courses = await Course.find({
      instructor: req.params.id,
    })
      .sort({
        updatedAt: -1,
      })
      .limit(10);

    sendResponse(
      res,
      200,
      "Instructor activity retrieved",
      courses
    );
  }
);
