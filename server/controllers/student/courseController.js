import Course from "../../models/course/Course.js";
import Enrollment from "../../models/learning/Enrollment.js";
import Student from "../../models/user/Student.js";
import Payment from "../../models/payment/Payment.js";
import paginate from "../../utils/pagination.js";
import sendResponse from "../../utils/sendResponse.js";
import asyncHandler from "../../middlewares/error/asyncHandler.js";
import { createNotification } from "../../services/notification/inAppService.js";
import { NOTIFICATION_TYPES } from "../../utils/constants.js";
import sendEmail from "../../services/email/emailService.js";
import enrollmentConfirmTemplate from "../../templates/email/enrollmentConfirm.js";
import { EMAIL_SUBJECTS } from "../../utils/constants.js";

export const browseCourses = asyncHandler(async (req, res) => {
  const { page, limit, category, level, search, sort } = req.query;

  const query = { status: "published" };
  if (category) query.category = category;
  if (level) query.level = level;
  if (search) query.title = { $regex: search, $options: "i" };

  const sortOptions = {
    popular: { totalStudents: -1 },
    rating: { averageRating: -1 },
    newest: { createdAt: -1 },
    price: { price: 1 },
  };

  const result = await paginate(Course, query, {
    page, limit,
    populate: "instructor category",
    sort: sortOptions[sort] || { createdAt: -1 },
  });

  sendResponse(res, 200, "Courses retrieved", result);
});

export const getEnrolledCourses = asyncHandler(async (req, res) => {
  const enrollments = await Enrollment.find({
    student: req.user._id,
    status: "active",
  })
    .populate("course")
    .sort({ lastAccessedAt: -1 });

  sendResponse(res, 200, "Enrolled courses retrieved", enrollments);
});

export const getCompletedCourses = asyncHandler(async (req, res) => {
  const enrollments = await Enrollment.find({
    student: req.user._id,
    isCompleted: true,
  }).populate("course");

  sendResponse(res, 200, "Completed courses retrieved", enrollments);
});

export const getWishlist = asyncHandler(async (req, res) => {
  const student = await Student.findOne({
    user: req.user._id,
  }).populate("wishlist");

  sendResponse(res, 200, "Wishlist retrieved", student?.wishlist || []);
});

export const getCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id)
    .populate("instructor", "firstName lastName avatar bio")
    .populate("category", "name");

  if (!course) return sendResponse(res, 404, "Course not found");

  const enrollment = await Enrollment.findOne({
    student: req.user._id,
    course: req.params.id,
  });

  sendResponse(res, 200, "Course retrieved", { course, isEnrolled: !!enrollment, enrollment });
});

export const enrollCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) return sendResponse(res, 404, "Course not found");

  const existing = await Enrollment.findOne({
    student: req.user._id,
    course: req.params.id,
  });

  if (existing) return sendResponse(res, 400, "Already enrolled");

  const enrollment = await Enrollment.create({
    student: req.user._id,
    course: req.params.id,
    enrolledAt: new Date(),
  });

  await Course.findByIdAndUpdate(req.params.id, {
    $inc: { totalStudents: 1 },
  });

  await Student.findOneAndUpdate(
    { user: req.user._id },
    { $inc: { totalCoursesEnrolled: 1 } }
  );

  await createNotification({
    recipientId: req.user._id,
    type: NOTIFICATION_TYPES.COURSE,
    title: "Enrolled! 🎉",
    message: `You've enrolled in "${course.title}"`,
    actionUrl: `/courses/${course._id}`,
  });

  await sendEmail({
    to: req.user.email,
    subject: EMAIL_SUBJECTS.ENROLLMENT_CONFIRM,
    htmlContent: enrollmentConfirmTemplate({
      firstName: req.user.firstName,
      courseName: course.title,
      instructorName: "Instructor",
      courseUrl: `${process.env.CLIENT_URL}/courses/${course._id}`,
    }),
  });

  sendResponse(res, 201, "Enrolled successfully", enrollment);
});

export const addToWishlist = asyncHandler(async (req, res) => {
  await Student.findOneAndUpdate(
    { user: req.user._id },
    { $addToSet: { wishlist: req.params.id } }
  );
  sendResponse(res, 200, "Added to wishlist");
});

export const removeFromWishlist = asyncHandler(async (req, res) => {
  await Student.findOneAndUpdate(
    { user: req.user._id },
    { $pull: { wishlist: req.params.id } }
  );
  sendResponse(res, 200, "Removed from wishlist");
});