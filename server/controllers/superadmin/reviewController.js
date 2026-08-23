import Review from "../../models/review/Review.js";
import Report from "../../models/review/Report.js";
import paginate from "../../utils/pagination.js";
import sendResponse from "../../utils/sendResponse.js";
import asyncHandler from "../../middlewares/error/asyncHandler.js";

export const getAllReviews = asyncHandler(async (req, res) => {
  const result = await paginate(Review, {}, {
    page: req.query.page,
    limit: req.query.limit,
    populate: "student course",
    sort: { createdAt: -1 },
  });
  sendResponse(res, 200, "Reviews retrieved", result);
});

export const getFlaggedReviews = asyncHandler(async (req, res) => {
  const flagged = await Review.find({ isFlagged: true, isRemoved: false })
    .populate("student", "firstName lastName")
    .populate("course", "title");

  sendResponse(res, 200, "Flagged reviews retrieved", flagged);
});

export const removeReview = asyncHandler(async (req, res) => {
  const review = await Review.findByIdAndUpdate(
    req.params.id,
    {
      isRemoved: true,
      removedBy: req.user._id,
      removedAt: new Date(),
    },
    { new: true }
  );

  if (!review) return sendResponse(res, 404, "Review not found");
  sendResponse(res, 200, "Review removed");
});

export const dismissFlag = asyncHandler(async (req, res) => {
  const review = await Review.findByIdAndUpdate(
    req.params.id,
    { isFlagged: false, flagReason: null },
    { new: true }
  );

  if (!review) return sendResponse(res, 404, "Review not found");
  sendResponse(res, 200, "Flag dismissed");
});