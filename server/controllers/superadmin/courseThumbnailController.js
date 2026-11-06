
import CourseThumbnail from "../../models/course/CourseThumbnail.js";
import Course from "../../models/course/Course.js";
import cloudinary from "../../config/cloudinary.js";
import sendResponse from "../../utils/sendResponse.js";
import asyncHandler from "../../middlewares/error/asyncHandler.js";

// ── Get all thumbnails (Superadmin) ──────────────────────
export const getAllThumbnails = asyncHandler(async (req, res) => {
  const thumbnails = await CourseThumbnail.find()
    .populate("category", "name")
    .populate("createdBy", "firstName lastName")
    .sort({ sortOrder: 1, createdAt: -1 });

  return sendResponse(
    res,
    200,
    "Course thumbnails retrieved",
    thumbnails
  );
});

// ── Get active thumbnails (Instructor selection) ─────────
export const getActiveThumbnails = asyncHandler(async (req, res) => {
  const thumbnails = await CourseThumbnail.find({ isActive: true })
    .populate("category", "name")
    .select("title description image category sortOrder")
    .sort({ sortOrder: 1, title: 1 });

  return sendResponse(
    res,
    200,
    "Available course thumbnails retrieved",
    thumbnails
  );
});

// ── Upload thumbnail ─────────────────────────────────────
export const createThumbnail = asyncHandler(async (req, res) => {
  if (!req.file) {
    return sendResponse(res, 400, "Please upload a thumbnail image");
  }

  const { title, description, category, sortOrder } = req.body;

  if (!title?.trim()) {
    await cloudinary.uploader.destroy(req.file.filename);
    return sendResponse(res, 400, "Thumbnail title is required");
  }

  const thumbnail = await CourseThumbnail.create({
    title: title.trim(),
    description: description?.trim() || null,
    category: category || null,
    sortOrder: Number(sortOrder) || 0,
    image: {
      public_id: req.file.filename,
      url: req.file.path,
    },
    createdBy: req.user._id,
  });

  return sendResponse(
    res,
    201,
    "Course thumbnail uploaded successfully",
    thumbnail
  );
});

// ── Update thumbnail details ─────────────────────────────
export const updateThumbnail = asyncHandler(async (req, res) => {
  const { title, description, category, sortOrder } = req.body;

  const thumbnail = await CourseThumbnail.findById(req.params.id);

  if (!thumbnail) {
    return sendResponse(res, 404, "Thumbnail not found");
  }

  if (title !== undefined) thumbnail.title = title.trim();
  if (description !== undefined) {
    thumbnail.description = description.trim() || null;
  }
  if (category !== undefined) thumbnail.category = category || null;
  if (sortOrder !== undefined) {
    thumbnail.sortOrder = Number(sortOrder) || 0;
  }

  await thumbnail.save();

  return sendResponse(
    res,
    200,
    "Thumbnail updated successfully",
    thumbnail
  );
});

// ── Activate / Deactivate thumbnail ──────────────────────
export const toggleThumbnailStatus = asyncHandler(async (req, res) => {
  const thumbnail = await CourseThumbnail.findById(req.params.id);

  if (!thumbnail) {
    return sendResponse(res, 404, "Thumbnail not found");
  }

  thumbnail.isActive = !thumbnail.isActive;
  await thumbnail.save();

  return sendResponse(
    res,
    200,
    `Thumbnail ${thumbnail.isActive ? "activated" : "deactivated"}`,
    thumbnail
  );
});

// ── Delete thumbnail ─────────────────────────────────────
export const deleteThumbnail = asyncHandler(async (req, res) => {
  const thumbnail = await CourseThumbnail.findById(req.params.id);

  if (!thumbnail) {
    return sendResponse(res, 404, "Thumbnail not found");
  }

  const isUsed = await Course.exists({ thumbnail: thumbnail._id });

  if (isUsed) {
    return sendResponse(
      res,
      400,
      "This thumbnail is currently assigned to a course. Deactivate it instead."
    );
  }

  await cloudinary.uploader.destroy(thumbnail.image.public_id);
  await thumbnail.deleteOne();

  return sendResponse(
    res,
    200,
    "Thumbnail deleted successfully"
  );
});
