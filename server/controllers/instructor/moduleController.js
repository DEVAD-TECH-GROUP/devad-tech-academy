import Module from "../../models/course/Module.js";
import Course from "../../models/course/Course.js";
import sendResponse from "../../utils/sendResponse.js";
import asyncHandler from "../../middlewares/error/asyncHandler.js";

export const getModules = asyncHandler(async (req, res) => {
  const modules = await Module.find({ course: req.params.courseId })
    .sort({ order: 1 });

  sendResponse(res, 200, "Modules retrieved", modules);
});

export const createModule = asyncHandler(async (req, res) => {
  const course = await Course.findOne({
    _id: req.params.courseId,
    instructor: req.user._id,
  });

  if (!course) return sendResponse(res, 404, "Course not found");

  const module = await Module.create({
    ...req.body,
    course: req.params.courseId,
  });

  await Course.findByIdAndUpdate(req.params.courseId, {
    $inc: { totalModules: 1 },
  });

  sendResponse(res, 201, "Module created", module);
});

export const updateModule = asyncHandler(async (req, res) => {
  const module = await Module.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );

  if (!module) return sendResponse(res, 404, "Module not found");
  sendResponse(res, 200, "Module updated", module);
});

export const deleteModule = asyncHandler(async (req, res) => {
  await Module.findByIdAndDelete(req.params.id);

  await Course.findByIdAndUpdate(req.params.courseId, {
    $inc: { totalModules: -1 },
  });

  sendResponse(res, 200, "Module deleted");
});

export const reorderModules = asyncHandler(async (req, res) => {
  const { modules } = req.body;

  for (const item of modules) {
    await Module.findByIdAndUpdate(item._id, { order: item.order });
  }

  sendResponse(res, 200, "Modules reordered");
});