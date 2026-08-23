import Lesson from "../../models/course/Lesson.js";
import Module from "../../models/course/Module.js";
import Course from "../../models/course/Course.js";
import sendResponse from "../../utils/sendResponse.js";
import asyncHandler from "../../middlewares/error/asyncHandler.js";
import {
  createLessonValidator,
  updateLessonValidator,
} from "../../validators/instructor/lessonValidator.js";

export const getLessons = asyncHandler(async (req, res) => {
  const lessons = await Lesson.find({ module: req.params.moduleId })
    .sort({ order: 1 })
    .populate("resources");

  sendResponse(res, 200, "Lessons retrieved", lessons);
});

export const createLesson = asyncHandler(async (req, res) => {
  const { error } = createLessonValidator(req.body);
  if (error) return sendResponse(res, 400, error.details[0].message);

  const module = await Module.findById(req.params.moduleId);
  if (!module) return sendResponse(res, 404, "Module not found");

  const lesson = await Lesson.create({
    ...req.body,
    module: req.params.moduleId,
    course: module.course,
  });

  await Module.findByIdAndUpdate(req.params.moduleId, {
    $inc: { totalLessons: 1 },
  });

  await Course.findByIdAndUpdate(module.course, {
    $inc: { totalLessons: 1 },
  });

  sendResponse(res, 201, "Lesson created", lesson);
});

export const updateLesson = asyncHandler(async (req, res) => {
  const { error } = updateLessonValidator(req.body);
  if (error) return sendResponse(res, 400, error.details[0].message);

  const lesson = await Lesson.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );

  if (!lesson) return sendResponse(res, 404, "Lesson not found");
  sendResponse(res, 200, "Lesson updated", lesson);
});

export const deleteLesson = asyncHandler(async (req, res) => {
  const lesson = await Lesson.findById(req.params.id);
  if (!lesson) return sendResponse(res, 404, "Lesson not found");

  await Lesson.findByIdAndDelete(req.params.id);

  await Module.findByIdAndUpdate(lesson.module, {
    $inc: { totalLessons: -1 },
  });

  await Course.findByIdAndUpdate(lesson.course, {
    $inc: { totalLessons: -1 },
  });

  sendResponse(res, 200, "Lesson deleted");
});

export const uploadVideo = asyncHandler(async (req, res) => {
  if (!req.file) return sendResponse(res, 400, "No video uploaded");

  const lesson = await Lesson.findByIdAndUpdate(
    req.params.id,
    {
      video: {
        public_id: req.file.public_id,
        url: req.file.path,
        duration: 0,
      },
    },
    { new: true }
  );

  sendResponse(res, 200, "Video uploaded", lesson);
});

export const uploadResource = asyncHandler(async (req, res) => {
  if (!req.file) return sendResponse(res, 400, "No resource uploaded");
  sendResponse(res, 200, "Resource uploaded", req.file);
});