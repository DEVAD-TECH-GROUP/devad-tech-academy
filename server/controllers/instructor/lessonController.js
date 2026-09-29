import mongoose from "mongoose";

import Lesson from "../../models/course/Lesson.js";
import Module from "../../models/course/Module.js";
import Course from "../../models/course/Course.js";
import Resource from "../../models/course/Resource.js";

import sendResponse from "../../utils/sendResponse.js";
import asyncHandler from "../../middlewares/error/asyncHandler.js";

import {
  createLessonValidator,
  updateLessonValidator,
} from "../../validators/instructor/lessonValidator.js";

// ============================================================
// GET LESSONS
// ============================================================

export const getLessons = asyncHandler(async (req, res) => {
  const { moduleId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(moduleId)) {
    return sendResponse(res, 400, "Invalid module ID");
  }

  const module = await Module.findById(moduleId);

  if (!module) {
    return sendResponse(res, 404, "Module not found");
  }

  const course = await Course.findOne({
    _id: module.course,
    instructor: req.user._id,
  });

  if (!course) {
    return sendResponse(res, 404, "Course not found");
  }

  const lessons = await Lesson.find({
    module: moduleId,
    course: course._id,
  })
    .sort({
      order: 1,
      createdAt: 1,
    })
    .populate(
      "resources",
      "name description type file totalDownloads isPublic"
    );

  return sendResponse(
    res,
    200,
    "Lessons retrieved successfully",
    lessons
  );
});

// ============================================================
// GET SINGLE LESSON
// ============================================================

export const getLesson = asyncHandler(async (req, res) => {
  const { moduleId, id } = req.params;

  if (
    !mongoose.Types.ObjectId.isValid(moduleId) ||
    !mongoose.Types.ObjectId.isValid(id)
  ) {
    return sendResponse(res, 400, "Invalid module or lesson ID");
  }

  const module = await Module.findById(moduleId);

  if (!module) {
    return sendResponse(res, 404, "Module not found");
  }

  const course = await Course.findOne({
    _id: module.course,
    instructor: req.user._id,
  });

  if (!course) {
    return sendResponse(res, 404, "Course not found");
  }

  const lesson = await Lesson.findOne({
    _id: id,
    module: moduleId,
    course: course._id,
  }).populate(
    "resources",
    "name description type file totalDownloads isPublic"
  );

  if (!lesson) {
    return sendResponse(res, 404, "Lesson not found");
  }

  return sendResponse(
    res,
    200,
    "Lesson retrieved successfully",
    lesson
  );
});

// ============================================================
// CREATE LESSON
// ============================================================

// ============================================================
// CREATE LESSON
// ============================================================

export const createLesson = asyncHandler(async (req, res) => {
  const { moduleId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(moduleId)) {
    return sendResponse(res, 400, "Invalid module ID");
  }

  const { error, value } = createLessonValidator(req.body);

  if (error) {
    return sendResponse(
      res,
      400,
      error.details
        .map((detail) => detail.message)
        .join(", ")
    );
  }

  const module = await Module.findById(moduleId);

  if (!module) {
    return sendResponse(res, 404, "Module not found");
  }

  const course = await Course.findOne({
    _id: module.course,
    instructor: req.user._id,
  });

  if (!course) {
    return sendResponse(res, 404, "Course not found");
  }

  const lessonCount = await Lesson.countDocuments({
    module: moduleId,
  });

  const {
    duration,
    ...lessonData
  } = value;

  const lesson = await Lesson.create({
    ...lessonData,

    module: moduleId,
    course: course._id,

    order:
      value.order !== undefined
        ? value.order
        : lessonCount,

    video: {
      duration:
        duration !== undefined
          ? duration
          : 0,
    },
  });

  await Module.findByIdAndUpdate(moduleId, {
    $inc: {
      totalLessons: 1,
    },
  });

  await Course.findByIdAndUpdate(course._id, {
    $inc: {
      totalLessons: 1,
    },
  });

  return sendResponse(
    res,
    201,
    "Lesson created successfully",
    lesson
  );
});

// ============================================================
// UPDATE LESSON
// ============================================================

export const updateLesson = asyncHandler(async (req, res) => {
  const { moduleId, id } = req.params;

  if (
    !mongoose.Types.ObjectId.isValid(moduleId) ||
    !mongoose.Types.ObjectId.isValid(id)
  ) {
    return sendResponse(res, 400, "Invalid module or lesson ID");
  }

  const { error, value } = updateLessonValidator(req.body);

  if (error) {
    return sendResponse(
      res,
      400,
      error.details.map((detail) => detail.message).join(", ")
    );
  }

  const module = await Module.findById(moduleId);

  if (!module) {
    return sendResponse(res, 404, "Module not found");
  }

  const course = await Course.findOne({
    _id: module.course,
    instructor: req.user._id,
  });

  if (!course) {
    return sendResponse(res, 404, "Course not found");
  }

  const lesson = await Lesson.findOne({
    _id: id,
    module: moduleId,
    course: course._id,
  });

  if (!lesson) {
    return sendResponse(res, 404, "Lesson not found");
  }

  Object.assign(lesson, value);

  await lesson.save();

  return sendResponse(
    res,
    200,
    "Lesson updated successfully",
    lesson
  );
});

// ============================================================
// DELETE LESSON
// ============================================================

export const deleteLesson = asyncHandler(async (req, res) => {
  const { moduleId, id } = req.params;

  if (
    !mongoose.Types.ObjectId.isValid(moduleId) ||
    !mongoose.Types.ObjectId.isValid(id)
  ) {
    return sendResponse(res, 400, "Invalid module or lesson ID");
  }

  const module = await Module.findById(moduleId);

  if (!module) {
    return sendResponse(res, 404, "Module not found");
  }

  const course = await Course.findOne({
    _id: module.course,
    instructor: req.user._id,
  });

  if (!course) {
    return sendResponse(res, 404, "Course not found");
  }

  const lesson = await Lesson.findOne({
    _id: id,
    module: moduleId,
    course: course._id,
  });

  if (!lesson) {
    return sendResponse(res, 404, "Lesson not found");
  }

  // Delete resources belonging to this lesson.
  await Resource.deleteMany({
    lesson: lesson._id,
  });

  await Lesson.deleteOne({
    _id: lesson._id,
  });

  await Module.findByIdAndUpdate(moduleId, {
    $inc: {
      totalLessons: -1,
    },
  });

  await Course.findByIdAndUpdate(course._id, {
    $inc: {
      totalLessons: -1,
    },
  });

  // Prevent counters from becoming negative.
  await Module.findByIdAndUpdate(moduleId, [
    {
      $set: {
        totalLessons: {
          $max: ["$totalLessons", 0],
        },
      },
    },
  ]);

  await Course.findByIdAndUpdate(course._id, [
    {
      $set: {
        totalLessons: {
          $max: ["$totalLessons", 0],
        },
      },
    },
  ]);

  return sendResponse(
    res,
    200,
    "Lesson and its resources deleted successfully"
  );
});

// ============================================================
// UPLOAD VIDEO
// ============================================================

export const uploadVideo = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return sendResponse(res, 400, "Invalid lesson ID");
  }

  if (!req.file) {
    return sendResponse(res, 400, "No video uploaded");
  }

  const lesson = await Lesson.findById(id);

  if (!lesson) {
    return sendResponse(res, 404, "Lesson not found");
  }

  const course = await Course.findOne({
    _id: lesson.course,
    instructor: req.user._id,
  });

  if (!course) {
    return sendResponse(res, 404, "Course not found");
  }

  lesson.video = {
    public_id: req.file.public_id,
    url: req.file.path,
    duration: Number(req.body.duration || 0),
    thumbnail: req.body.thumbnail || null,
  };

  await lesson.save();

  return sendResponse(
    res,
    200,
    "Video uploaded successfully",
    lesson
  );
});

// ============================================================
// UPLOAD RESOURCE
// ============================================================

export const uploadResource = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return sendResponse(res, 400, "Invalid lesson ID");
  }

  if (!req.file) {
    return sendResponse(res, 400, "No resource uploaded");
  }

  const lesson = await Lesson.findById(id);

  if (!lesson) {
    return sendResponse(res, 404, "Lesson not found");
  }

  const course = await Course.findOne({
    _id: lesson.course,
    instructor: req.user._id,
  });

  if (!course) {
    return sendResponse(res, 404, "Course not found");
  }

  const resource = await Resource.create({
    course: course._id,
    lesson: lesson._id,
    uploadedBy: req.user._id,
    name:
      req.body.name?.trim() ||
      req.file.originalname ||
      "Lesson resource",
    description:
      req.body.description?.trim() || null,
    type: req.body.type || "document",
    file: {
      public_id: req.file.public_id,
      url: req.file.path,
      size: req.file.size || 0,
      format: req.file.mimetype || null,
    },
    isPublic:
      req.body.isPublic === undefined
        ? true
        : req.body.isPublic === "true" ||
          req.body.isPublic === true,
  });

  // The Lesson model stores resource references.
  await Lesson.findByIdAndUpdate(lesson._id, {
    $addToSet: {
      resources: resource._id,
    },
  });

  return sendResponse(
    res,
    201,
    "Resource uploaded successfully",
    resource
  );
});
