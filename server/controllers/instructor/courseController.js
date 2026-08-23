import Course from "../../models/course/Course.js";
import Module from "../../models/course/Module.js";
import Lesson from "../../models/course/Lesson.js";
import Enrollment from "../../models/learning/Enrollment.js";
import paginate from "../../utils/pagination.js";
import sendResponse from "../../utils/sendResponse.js";
import asyncHandler from "../../middlewares/error/asyncHandler.js";
import {
  createCourseValidator,
  updateCourseValidator,
} from "../../validators/instructor/courseValidator.js";
import { COURSE_STATUS } from "../../utils/constants.js";

export const getMyCourses = asyncHandler(async (req, res) => {
  const { page, limit, status, search } = req.query;

  const query = { instructor: req.user._id };
  if (status) query.status = status;
  if (search) query.title = { $regex: search, $options: "i" };

  const result = await paginate(Course, query, {
    page, limit,
    populate: "category",
    sort: { createdAt: -1 },
  });

  sendResponse(res, 200, "Courses retrieved", result);
});

export const createCourse = asyncHandler(async (req, res) => {
  const { error } = createCourseValidator(req.body);
  if (error) return sendResponse(res, 400, error.details[0].message);

  const course = await Course.create({
    ...req.body,
    instructor: req.user._id,
    status: COURSE_STATUS.DRAFT,
  });

  sendResponse(res, 201, "Course created", course);
});

export const getCourse = asyncHandler(async (req, res) => {
  const course = await Course.findOne({
    _id: req.params.id,
    instructor: req.user._id,
  })
    .populate("category", "name")
    .populate("approvedBy", "firstName lastName");

  if (!course) return sendResponse(res, 404, "Course not found");
  sendResponse(res, 200, "Course retrieved", course);
});

export const updateCourse = asyncHandler(async (req, res) => {
  const { error } = updateCourseValidator(req.body);
  if (error) return sendResponse(res, 400, error.details[0].message);

  const course = await Course.findOneAndUpdate(
    { _id: req.params.id, instructor: req.user._id },
    req.body,
    { new: true, runValidators: true }
  );

  if (!course) return sendResponse(res, 404, "Course not found");
  sendResponse(res, 200, "Course updated", course);
});

export const deleteCourse = asyncHandler(async (req, res) => {
  const course = await Course.findOne({
    _id: req.params.id,
    instructor: req.user._id,
    status: { $in: [COURSE_STATUS.DRAFT, COURSE_STATUS.REJECTED] },
  });

  if (!course) return sendResponse(res, 404, "Course not found or cannot delete");

  await Course.findByIdAndDelete(req.params.id);
  sendResponse(res, 200, "Course deleted");
});

export const publishCourse = asyncHandler(async (req, res) => {
  const course = await Course.findOneAndUpdate(
    { _id: req.params.id, instructor: req.user._id },
    { status: COURSE_STATUS.PENDING_REVIEW },
    { new: true }
  );

  if (!course) return sendResponse(res, 404, "Course not found");
  sendResponse(res, 200, "Course submitted for review", course);
});

export const submitForReview = asyncHandler(async (req, res) => {
  const course = await Course.findOneAndUpdate(
    { _id: req.params.id, instructor: req.user._id },
    { status: COURSE_STATUS.PENDING_REVIEW },
    { new: true }
  );

  if (!course) return sendResponse(res, 404, "Course not found");
  sendResponse(res, 200, "Course submitted for review", course);
});

export const getCourseAnalytics = asyncHandler(async (req, res) => {
  const course = await Course.findOne({
    _id: req.params.id,
    instructor: req.user._id,
  });

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
    completionRate: enrollments > 0
      ? Math.round((completed / enrollments) * 100)
      : 0,
  });
});