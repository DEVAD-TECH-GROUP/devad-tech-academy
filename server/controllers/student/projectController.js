import Project from "../../models/assessment/Project.js";
import ProjectSubmission from "../../models/assessment/ProjectSubmission.js";
import Enrollment from "../../models/learning/Enrollment.js";
import XP from "../../models/gamification/XP.js";
import Student from "../../models/user/Student.js";
import sendResponse from "../../utils/sendResponse.js";
import asyncHandler from "../../middlewares/error/asyncHandler.js";
import { submitProjectValidator } from "../../validators/student/submissionValidator.js";
import { XP_POINTS } from "../../utils/constants.js";

export const getMyProjects = asyncHandler(async (req, res) => {
  const courses = await Enrollment.find({
    student: req.user._id,
    status: "active",
  }).distinct("course");

  const projects = await Project.find({
    course: { $in: courses },
    isPublished: true,
  })
    .populate("course", "title")
    .sort({ dueDate: 1 });

  sendResponse(res, 200, "Projects retrieved", projects);
});

export const getProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id)
    .populate("course", "title")
    .populate("instructor", "firstName lastName");

  if (!project) return sendResponse(res, 404, "Project not found");

  const submission = await ProjectSubmission.findOne({
    project: req.params.id,
    student: req.user._id,
  });

  sendResponse(res, 200, "Project retrieved", { project, submission });
});

export const submitProject = asyncHandler(async (req, res) => {
  const { error } = submitProjectValidator(req.body);
  if (error) return sendResponse(res, 400, error.details[0].message);

  const project = await Project.findById(req.params.id);
  if (!project) return sendResponse(res, 404, "Project not found");

  const existing = await ProjectSubmission.findOne({
    project: req.params.id,
    student: req.user._id,
  });

  if (existing) {
    const updated = await ProjectSubmission.findByIdAndUpdate(
      existing._id,
      { ...req.body, submittedAt: new Date(), status: "submitted" },
      { new: true }
    );
    return sendResponse(res, 200, "Project resubmitted", updated);
  }

  const isLate = new Date() > project.dueDate;

  const submission = await ProjectSubmission.create({
    project: req.params.id,
    student: req.user._id,
    course: project.course,
    ...req.body,
    isLate,
    status: "submitted",
    submittedAt: new Date(),
  });

  await Project.findByIdAndUpdate(req.params.id, {
    $inc: { totalSubmissions: 1 },
  });

  await Student.findOneAndUpdate(
    { user: req.user._id },
    { $inc: { xpPoints: XP_POINTS.PROJECT_SUBMIT } }
  );

  await XP.create({
    student: req.user._id,
    action: "PROJECT_SUBMIT",
    points: XP_POINTS.PROJECT_SUBMIT,
    description: `Submitted project: ${project.title}`,
  });

  sendResponse(res, 201, "Project submitted", submission);
});

export const getProjectFeedback = asyncHandler(async (req, res) => {
  const submission = await ProjectSubmission.findOne({
    project: req.params.id,
    student: req.user._id,
    status: "graded",
  });

  if (!submission) return sendResponse(res, 404, "No graded submission found");
  sendResponse(res, 200, "Feedback retrieved", submission);
});