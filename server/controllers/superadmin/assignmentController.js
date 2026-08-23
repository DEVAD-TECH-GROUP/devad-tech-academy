import Assignment from "../../models/assessment/Assignment.js";
import Submission from "../../models/assessment/Submission.js";
import paginate from "../../utils/pagination.js";
import sendResponse from "../../utils/sendResponse.js";
import asyncHandler from "../../middlewares/error/asyncHandler.js";

export const getAllAssignments = asyncHandler(async (req, res) => {
  const result = await paginate(Assignment, {}, {
    page: req.query.page,
    limit: req.query.limit,
    populate: "course instructor",
  });
  sendResponse(res, 200, "Assignments retrieved", result);
});

export const getAssignment = asyncHandler(async (req, res) => {
  const assignment = await Assignment.findById(req.params.id)
    .populate("course", "title")
    .populate("instructor", "firstName lastName");

  if (!assignment) return sendResponse(res, 404, "Assignment not found");
  sendResponse(res, 200, "Assignment retrieved", assignment);
});

export const getAssignmentAnalytics = asyncHandler(async (req, res) => {
  const [total, submitted, graded, late] = await Promise.all([
    Assignment.countDocuments(),
    Submission.countDocuments({ status: "submitted" }),
    Submission.countDocuments({ status: "graded" }),
    Submission.countDocuments({ isLate: true }),
  ]);

  sendResponse(res, 200, "Assignment analytics retrieved", {
    total, submitted, graded, late,
    submissionRate: total > 0
      ? Math.round((submitted / total) * 100)
      : 0,
  });
});

export const getLateSubmissions = asyncHandler(async (req, res) => {
  const late = await Submission.find({ isLate: true })
    .populate("assignment", "title")
    .populate("student", "firstName lastName")
    .sort({ submittedAt: -1 });

  sendResponse(res, 200, "Late submissions retrieved", late);
});