import Resource from "../../models/course/Resource.js";
import paginate from "../../utils/pagination.js";
import sendResponse from "../../utils/sendResponse.js";
import asyncHandler from "../../middlewares/error/asyncHandler.js";

export const getResources = asyncHandler(async (req, res) => {
  const result = await paginate(
    Resource,
    { uploadedBy: req.user._id },
    {
      page: req.query.page,
      limit: req.query.limit,
      populate: "course lesson",
    }
  );
  sendResponse(res, 200, "Resources retrieved", result);
});

export const uploadResource = asyncHandler(async (req, res) => {
  if (!req.file) return sendResponse(res, 400, "No file uploaded");

  const resource = await Resource.create({
    ...req.body,
    uploadedBy: req.user._id,
    file: {
      public_id: req.file.public_id || null,
      url: req.file.path || req.file.url,
      size: req.file.size,
      format: req.file.mimetype,
    },
  });

  sendResponse(res, 201, "Resource uploaded", resource);
});

export const deleteResource = asyncHandler(async (req, res) => {
  await Resource.findOneAndDelete({
    _id: req.params.id,
    uploadedBy: req.user._id,
  });
  sendResponse(res, 200, "Resource deleted");
});