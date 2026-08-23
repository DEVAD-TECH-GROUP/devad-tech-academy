import Assignment from "../../models/assessment/Assignment.js";
import Submission from "../../models/assessment/Submission.js";
import paginate from "../../utils/pagination.js";
import sendResponse from "../../utils/sendResponse.js";
import asyncHandler from "../../middlewares/error/asyncHandler.js";
import { createAssignmentValidator } from "../../validators/instructor/assignmentValidator.js";

export const getMyAssignments = asyncHandler(async (req, res) => {
  const result = await paginate(
    Assignment,
    { instructor: req.user._id },
    { page: req.query.page, limit: req.query.limit, populate: "course" }
  );
  sendResponse(res, 200, "Assignments retrieved", result);
});

export const createAssignment = asyncHandler(async (req, res) => {
  const { error } = createAssignmentValidator(req.body);
  if (error) return sendResponse(res, 400, error.details[0].message);

  const assignment = await Assignment.create({
    ...req.body,
    instructor: req.user._id,
  });

  sendResponse(res, 201, "Assignment created", assignment);
});

export const getAssignment = asyncHandler(async (req, res) => {
  const assignment = await Assignment.findOne({
    _id: req.params.id,
    instructor: req.user._id,
  }).populate("course", "title");

  if (!assignment) return sendResponse(res, 404, "Assignment not found");
  sendResponse(res, 200, "Assignment retrieved", assignment);
});

export const updateAssignment = asyncHandler(async (req, res) => {
  const assignment = await Assignment.findOneAndUpdate(
    { _id: req.params.id, instructor: req.user._id },
    req.body,
    { new: true }
  );

  if (!assignment) return sendResponse(res, 404, "Assignment not found");
  sendResponse(res, 200, "Assignment updated", assignment);
});

export const deleteAssignment = asyncHandler(async (req, res) => {
  await Assignment.findOneAndDelete({
    _id: req.params.id,
    instructor: req.user._id,
  });
  sendResponse(res, 200, "Assignment deleted");
});

export const getSubmissions = asyncHandler(async (req, res) => {
  const submissions = await Submission.find({
    assignment: req.params.id,
  }).populate("student", "firstName lastName email avatar");

  sendResponse(res, 200, "Submissions retrieved", submissions);
});

export const gradeSubmission = asyncHandler(async (req, res) => {
  const { grade, feedback, rubricGrades } = req.body;

  const submission = await Submission.findByIdAndUpdate(
    req.params.id,
    {
      grade,
      feedback,
      rubricGrades,
      status: "graded",
      gradedBy: req.user._id,
      gradedAt: new Date(),
    },
    { new: true }
  );

  if (!submission) return sendResponse(res, 404, "Submission not found");
  sendResponse(res, 200, "Submission graded", submission);
});