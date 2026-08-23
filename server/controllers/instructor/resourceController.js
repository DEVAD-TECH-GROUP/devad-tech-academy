import Resource from "../../models/course/Resource.js";
import sendResponse from "../../utils/sendResponse.js";
import asyncHandler from "../../middlewares/error/asyncHandler.js";

export const getLessonResources = asyncHandler(async (req, res) => {
  const resources = await Resource.find({ lesson: req.params.lessonId });
  sendResponse(res, 200, "Resources retrieved", resources);
});

export const addResource = asyncHandler(async (req, res) => {
  const resource = await Resource.create({
    ...req.body,
    uploadedBy: req.user._id,
  });
  sendResponse(res, 201, "Resource added", resource);
});

export const deleteResource = asyncHandler(async (req, res) => {
  await Resource.findByIdAndDelete(req.params.id);
  sendResponse(res, 200, "Resource deleted");
});