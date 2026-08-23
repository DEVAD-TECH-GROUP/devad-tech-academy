import Assignment from "../../models/assessment/Assignment.js";
import Submission from "../../models/assessment/Submission.js";
import Enrollment from "../../models/learning/Enrollment.js";
import XP from "../../models/gamification/XP.js";
import Student from "../../models/user/Student.js";
import paginate from "../../utils/pagination.js";
import sendResponse from "../../utils/sendResponse.js";
import asyncHandler from "../../middlewares/error/asyncHandler.js";
import { submitAssignmentValidator } from "../../validators/student/submissionValidator.js";
import { XP_POINTS } from "../../utils/constants.js";

export const getMyAssignments = asyncHandler(async (req, res) => {
  const enrollments = await Enrollment.find({
    student: req.user._id,
    status: "active",
  }).distinct("course");

  const assignments = await Assignment.find({
    course: { $in: enrollments },
    isPublished: true,
  })
    .populate("course", "title")
    .sort({ dueDate: 1 });

  const withSubmissions = await Promise.all(
    assignments.map(async (assignment) => {
      const submission = await Submission.findOne({
        assignment: assignment._id,
        student: req.user._id,
      });
      return { ...assignment.toObject(), submission };
    })
  );

  sendResponse(res, 200, "Assignments retrieved", withSubmissions);
});

export const getAssignment = asyncHandler(async (req, res) => {
  const assignment = await Assignment.findById(req.params.id)
    .populate("course", "title");

  if (!assignment) return sendResponse(res, 404, "Assignment not found");

  const submission = await Submission.findOne({
    assignment: req.params.id,
    student: req.user._id,
  });

  sendResponse(res, 200, "Assignment retrieved", { assignment, submission });
});

export const submitAssignment = asyncHandler(async (req, res) => {
  const { error } = submitAssignmentValidator(req.body);
  if (error) return sendResponse(res, 400, error.details[0].message);

  const assignment = await Assignment.findById(req.params.id);
  if (!assignment) return sendResponse(res, 404, "Assignment not found");

  const existing = await Submission.findOne({
    assignment: req.params.id,
    student: req.user._id,
  });

  const isLate = new Date() > assignment.dueDate;

  if (existing) {
    if (!assignment.allowLateSubmission && isLate) {
      return sendResponse(res, 400, "Late submissions not allowed");
    }

    const updated = await Submission.findByIdAndUpdate(
      existing._id,
      {
        ...req.body,
        isLate,
        status: "submitted",
        submittedAt: new Date(),
        isResubmission: true,
        $inc: { resubmissionCount: 1 },
      },
      { new: true }
    );

    return sendResponse(res, 200, "Assignment resubmitted", updated);
  }

  const submission = await Submission.create({
    assignment: req.params.id,
    student: req.user._id,
    course: assignment.course,
    ...req.body,
    isLate,
    status: "submitted",
    submittedAt: new Date(),
  });

  await Assignment.findByIdAndUpdate(req.params.id, {
    $inc: { totalSubmissions: 1 },
  });

  await Student.findOneAndUpdate(
    { user: req.user._id },
    { $inc: { xpPoints: XP_POINTS.ASSIGNMENT_SUBMIT } }
  );

  await XP.create({
    student: req.user._id,
    action: "ASSIGNMENT_SUBMIT",
    points: XP_POINTS.ASSIGNMENT_SUBMIT,
    description: `Submitted assignment: ${assignment.title}`,
    reference: { model: "Assignment", id: assignment._id },
  });

  sendResponse(res, 201, "Assignment submitted", submission);
});

export const getSubmission = asyncHandler(async (req, res) => {
  const submission = await Submission.findOne({
    assignment: req.params.id,
    student: req.user._id,
  });

  if (!submission) return sendResponse(res, 404, "Submission not found");
  sendResponse(res, 200, "Submission retrieved", submission);
});

export const getFeedback = asyncHandler(async (req, res) => {
  const submission = await Submission.findOne({
    assignment: req.params.id,
    student: req.user._id,
    status: "graded",
  });

  if (!submission) return sendResponse(res, 404, "No graded submission found");
  sendResponse(res, 200, "Feedback retrieved", submission);
});