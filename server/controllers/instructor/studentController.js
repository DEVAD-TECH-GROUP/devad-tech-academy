import Enrollment from "../../models/learning/Enrollment.js";
import Course from "../../models/course/Course.js";
import User from "../../models/user/User.js";
import paginate from "../../utils/pagination.js";
import sendResponse from "../../utils/sendResponse.js";
import asyncHandler from "../../middlewares/error/asyncHandler.js";

export const getMyStudents = asyncHandler(async (req, res) => {
  const courses = await Course.find({
    instructor: req.user._id,
  }).distinct("_id");

  const { page, limit, search } = req.query;

  const enrollments = await Enrollment.find({
    course: { $in: courses },
    status: "active",
  })
    .populate({
      path: "student",
      select: "firstName lastName email avatar",
      match: search
        ? {
            $or: [
              { firstName: { $regex: search, $options: "i" } },
              { lastName: { $regex: search, $options: "i" } },
            ],
          }
        : {},
    })
    .populate("course", "title");

  sendResponse(res, 200, "Students retrieved", enrollments);
});

export const getStudent = asyncHandler(async (req, res) => {
  const student = await User.findById(req.params.id)
    .select("firstName lastName email avatar createdAt");

  if (!student) return sendResponse(res, 404, "Student not found");

  const enrollments = await Enrollment.find({
    student: req.params.id,
    course: {
      $in: await Course.find({ instructor: req.user._id }).distinct("_id"),
    },
  }).populate("course", "title thumbnail");

  sendResponse(res, 200, "Student retrieved", { student, enrollments });
});

export const getStudentProgress = asyncHandler(async (req, res) => {
  const enrollment = await Enrollment.findOne({
    student: req.params.id,
    course: {
      $in: await Course.find({ instructor: req.user._id }).distinct("_id"),
    },
  }).populate("course", "title totalLessons");

  if (!enrollment) return sendResponse(res, 404, "Enrollment not found");
  sendResponse(res, 200, "Student progress retrieved", enrollment);
});

export const messageStudent = asyncHandler(async (req, res) => {
  sendResponse(res, 200, "Message sent");
});