import mongoose from "mongoose";

import Module from "../../models/course/Module.js";
import Course from "../../models/course/Course.js";
import Lesson from "../../models/course/Lesson.js";

import sendResponse from "../../utils/sendResponse.js";
import asyncHandler from "../../middlewares/error/asyncHandler.js";

// ============================================================
// GET ALL MODULES FOR A COURSE
// ============================================================

export const getModules = asyncHandler(async (req, res) => {
  const { courseId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(courseId)) {
    return sendResponse(res, 400, "Invalid course ID");
  }

  const course = await Course.findOne({
    _id: courseId,
    instructor: req.user._id,
  });

  if (!course) {
    return sendResponse(res, 404, "Course not found");
  }

  const modules = await Module.find({
    course: courseId,
  }).sort({
    order: 1,
    createdAt: 1,
  });

  return sendResponse(
    res,
    200,
    "Modules retrieved successfully",
    modules
  );
});

// ============================================================
// CREATE MODULE
// ============================================================

export const createModule = asyncHandler(async (req, res) => {
  const { courseId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(courseId)) {
    return sendResponse(res, 400, "Invalid course ID");
  }

  const course = await Course.findOne({
    _id: courseId,
    instructor: req.user._id,
  });

  if (!course) {
    return sendResponse(res, 404, "Course not found");
  }

  const {
    title,
    description,
    order,
    isPublished,
  } = req.body;

  if (!title || !title.trim()) {
    return sendResponse(res, 400, "Module title is required");
  }

  const moduleCount = await Module.countDocuments({
    course: courseId,
  });

  const module = await Module.create({
    course: courseId,
    title: title.trim(),
    description: description?.trim() || "",
    order:
      order !== undefined && order !== null
        ? Number(order)
        : moduleCount,
    isPublished:
      typeof isPublished === "boolean"
        ? isPublished
        : false,
  });

  await Course.findByIdAndUpdate(courseId, {
    $inc: {
      totalModules: 1,
    },
  });

  return sendResponse(
    res,
    201,
    "Module created successfully",
    module
  );
});

// ============================================================
// GET SINGLE MODULE
// ============================================================

export const getModule = asyncHandler(async (req, res) => {
  const { courseId, id } = req.params;

  if (
    !mongoose.Types.ObjectId.isValid(courseId) ||
    !mongoose.Types.ObjectId.isValid(id)
  ) {
    return sendResponse(res, 400, "Invalid course or module ID");
  }

  const course = await Course.findOne({
    _id: courseId,
    instructor: req.user._id,
  });

  if (!course) {
    return sendResponse(res, 404, "Course not found");
  }

  const module = await Module.findOne({
    _id: id,
    course: courseId,
  });

  if (!module) {
    return sendResponse(res, 404, "Module not found");
  }

  const lessons = await Lesson.find({
    course: courseId,
    module: module._id,
  }).sort({
    order: 1,
    createdAt: 1,
  });

  return sendResponse(
    res,
    200,
    "Module retrieved successfully",
    {
      module,
      lessons,
    }
  );
});

// ============================================================
// UPDATE MODULE
// ============================================================

export const updateModule = asyncHandler(async (req, res) => {
  const { courseId, id } = req.params;

  if (
    !mongoose.Types.ObjectId.isValid(courseId) ||
    !mongoose.Types.ObjectId.isValid(id)
  ) {
    return sendResponse(res, 400, "Invalid course or module ID");
  }

  const course = await Course.findOne({
    _id: courseId,
    instructor: req.user._id,
  });

  if (!course) {
    return sendResponse(res, 404, "Course not found");
  }

  const module = await Module.findOne({
    _id: id,
    course: courseId,
  });

  if (!module) {
    return sendResponse(res, 404, "Module not found");
  }

  const {
    title,
    description,
    order,
    isPublished,
  } = req.body;

  if (title !== undefined) {
    if (!title.trim()) {
      return sendResponse(res, 400, "Module title cannot be empty");
    }

    module.title = title.trim();
  }

  if (description !== undefined) {
    module.description = description?.trim() || "";
  }

  if (order !== undefined) {
    const parsedOrder = Number(order);

    if (!Number.isInteger(parsedOrder) || parsedOrder < 0) {
      return sendResponse(
        res,
        400,
        "Module order must be a non-negative integer"
      );
    }

    module.order = parsedOrder;
  }

  if (isPublished !== undefined) {
    module.isPublished = Boolean(isPublished);
  }

  await module.save();

  return sendResponse(
    res,
    200,
    "Module updated successfully",
    module
  );
});

// ============================================================
// DELETE MODULE
// ============================================================

export const deleteModule = asyncHandler(async (req, res) => {
  const { courseId, id } = req.params;

  if (
    !mongoose.Types.ObjectId.isValid(courseId) ||
    !mongoose.Types.ObjectId.isValid(id)
  ) {
    return sendResponse(res, 400, "Invalid course or module ID");
  }

  const course = await Course.findOne({
    _id: courseId,
    instructor: req.user._id,
  });

  if (!course) {
    return sendResponse(res, 404, "Course not found");
  }

  const module = await Module.findOne({
    _id: id,
    course: courseId,
  });

  if (!module) {
    return sendResponse(res, 404, "Module not found");
  }

  // Delete all lessons belonging to this module.
  await Lesson.deleteMany({
    course: courseId,
    module: module._id,
  });

  await Module.deleteOne({
    _id: module._id,
  });

  await Course.findByIdAndUpdate(courseId, {
    $inc: {
      totalModules: -1,
    },
  });

  // Prevent the cached counter from becoming negative.
  await Course.findByIdAndUpdate(courseId, [
    {
      $set: {
        totalModules: {
          $max: ["$totalModules", 0],
        },
      },
    },
  ]);

  return sendResponse(
    res,
    200,
    "Module and its lessons deleted successfully"
  );
});

// ============================================================
// REORDER MODULES
// ============================================================

export const reorderModules = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  const { modules } = req.body;

  if (!mongoose.Types.ObjectId.isValid(courseId)) {
    return sendResponse(res, 400, "Invalid course ID");
  }

  if (!Array.isArray(modules)) {
    return sendResponse(
      res,
      400,
      "Modules must be provided as an array"
    );
  }

  const course = await Course.findOne({
    _id: courseId,
    instructor: req.user._id,
  });

  if (!course) {
    return sendResponse(res, 404, "Course not found");
  }

  if (modules.length === 0) {
    return sendResponse(
      res,
      400,
      "At least one module is required"
    );
  }

  const moduleIds = modules.map((item) => item._id);

  const validIds = moduleIds.every((id) =>
    mongoose.Types.ObjectId.isValid(id)
  );

  if (!validIds) {
    return sendResponse(
      res,
      400,
      "One or more module IDs are invalid"
    );
  }

  const existingModules = await Module.find({
    course: courseId,
    _id: {
      $in: moduleIds,
    },
  }).select("_id");

  if (existingModules.length !== modules.length) {
    return sendResponse(
      res,
      400,
      "One or more modules do not belong to this course"
    );
  }

  const bulkOperations = modules.map((item, index) => {
    const newOrder =
      item.order !== undefined
        ? Number(item.order)
        : index;

    if (!Number.isInteger(newOrder) || newOrder < 0) {
      throw new Error(
        "Module order must be a non-negative integer"
      );
    }

    return {
      updateOne: {
        filter: {
          _id: item._id,
          course: courseId,
        },
        update: {
          $set: {
            order: newOrder,
          },
        },
      },
    };
  });

  await Module.bulkWrite(bulkOperations);

  const updatedModules = await Module.find({
    course: courseId,
  }).sort({
    order: 1,
    createdAt: 1,
  });

  return sendResponse(
    res,
    200,
    "Modules reordered successfully",
    updatedModules
  );
});
