import LearningPath from "../../models/learning/LearningPath.js";
import LearningPathAssignment from "../../models/learning/LearningPathAssignment.js";
import paginate from "../../utils/pagination.js";
import sendResponse from "../../utils/sendResponse.js";
import asyncHandler from "../../middlewares/error/asyncHandler.js";

export const getLearningPaths = asyncHandler(async (req, res) => {
  const result = await paginate(LearningPath, {}, {
    page: req.query.page,
    limit: req.query.limit,
  });
  sendResponse(res, 200, "Learning paths retrieved", result);
});

export const createLearningPath = asyncHandler(async (req, res) => {
  const path = await LearningPath.create({
    ...req.body,
    createdBy: req.user._id,
  });
  sendResponse(res, 201, "Learning path created", path);
});

export const getLearningPath = asyncHandler(async (req, res) => {
  const path = await LearningPath.findById(req.params.id)
    .populate("requiredCourses.course")
    .populate("optionalCourses.course");

  if (!path) return sendResponse(res, 404, "Learning path not found");
  sendResponse(res, 200, "Learning path retrieved", path);
});

export const updateLearningPath = asyncHandler(async (req, res) => {
  const path = await LearningPath.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );

  if (!path) return sendResponse(res, 404, "Learning path not found");
  sendResponse(res, 200, "Learning path updated", path);
});

export const deleteLearningPath = asyncHandler(async (req, res) => {
  await LearningPath.findByIdAndDelete(req.params.id);
  sendResponse(res, 200, "Learning path deleted");
});

export const assignLearningPath = asyncHandler(async (req, res) => {
  const { studentIds } = req.body;

  const assignments = studentIds.map((studentId) => ({
    student: studentId,
    learningPath: req.params.id,
    assignedBy: req.user._id,
  }));

  await LearningPathAssignment.insertMany(assignments, { ordered: false });
  sendResponse(res, 200, "Learning path assigned to students");
});