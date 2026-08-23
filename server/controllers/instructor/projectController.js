import Project from "../../models/assessment/Project.js";
import ProjectSubmission from "../../models/assessment/ProjectSubmission.js";
import paginate from "../../utils/pagination.js";
import sendResponse from "../../utils/sendResponse.js";
import asyncHandler from "../../middlewares/error/asyncHandler.js";

export const getMyProjects = asyncHandler(async (req, res) => {
  const result = await paginate(
    Project,
    { instructor: req.user._id },
    { page: req.query.page, limit: req.query.limit, populate: "course" }
  );
  sendResponse(res, 200, "Projects retrieved", result);
});

export const createProject = asyncHandler(async (req, res) => {
  const project = await Project.create({
    ...req.body,
    instructor: req.user._id,
  });
  sendResponse(res, 201, "Project created", project);
});

export const getProject = asyncHandler(async (req, res) => {
  const project = await Project.findOne({
    _id: req.params.id,
    instructor: req.user._id,
  }).populate("course", "title");

  if (!project) return sendResponse(res, 404, "Project not found");
  sendResponse(res, 200, "Project retrieved", project);
});

export const updateProject = asyncHandler(async (req, res) => {
  const project = await Project.findOneAndUpdate(
    { _id: req.params.id, instructor: req.user._id },
    req.body,
    { new: true }
  );

  if (!project) return sendResponse(res, 404, "Project not found");
  sendResponse(res, 200, "Project updated", project);
});

export const getProjectSubmissions = asyncHandler(async (req, res) => {
  const submissions = await ProjectSubmission.find({
    project: req.params.id,
  }).populate("student", "firstName lastName email avatar");

  sendResponse(res, 200, "Submissions retrieved", submissions);
});

export const gradeProjectSubmission = asyncHandler(async (req, res) => {
  const { grade, letterGrade, feedback, rubricGrades } = req.body;

  const submission = await ProjectSubmission.findByIdAndUpdate(
    req.params.id,
    {
      grade, letterGrade, feedback, rubricGrades,
      status: "graded",
      gradedBy: req.user._id,
      gradedAt: new Date(),
    },
    { new: true }
  );

  if (!submission) return sendResponse(res, 404, "Submission not found");
  sendResponse(res, 200, "Submission graded", submission);
});