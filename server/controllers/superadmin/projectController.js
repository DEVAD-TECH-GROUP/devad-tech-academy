import Project from "../../models/assessment/Project.js";
import ProjectSubmission from "../../models/assessment/ProjectSubmission.js";
import paginate from "../../utils/pagination.js";
import sendResponse from "../../utils/sendResponse.js";
import asyncHandler from "../../middlewares/error/asyncHandler.js";

export const getAllProjects = asyncHandler(async (req, res) => {
  const result = await paginate(Project, {}, {
    page: req.query.page,
    limit: req.query.limit,
    populate: "course instructor",
  });
  sendResponse(res, 200, "Projects retrieved", result);
});

export const createProjectTemplate = asyncHandler(async (req, res) => {
  const project = await Project.create({
    ...req.body,
    instructor: req.user._id,
  });
  sendResponse(res, 201, "Project template created", project);
});

export const getProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id)
    .populate("course", "title")
    .populate("instructor", "firstName lastName");

  if (!project) return sendResponse(res, 404, "Project not found");
  sendResponse(res, 200, "Project retrieved", project);
});

export const getProjectAnalytics = asyncHandler(async (req, res) => {
  const [total, submitted, graded] = await Promise.all([
    Project.countDocuments(),
    ProjectSubmission.countDocuments(),
    ProjectSubmission.countDocuments({ status: "graded" }),
  ]);

  sendResponse(res, 200, "Project analytics retrieved", {
    total, submitted, graded,
  });
});