import Review from "../../models/review/Review.js";
import paginate from "../../utils/pagination.js";
import sendResponse from "../../utils/sendResponse.js";
import asyncHandler from "../../middlewares/error/asyncHandler.js";

export const getMyReviews = asyncHandler(async (req, res) => {
  const result = await paginate(
    Review,
    { instructor: req.user._id, isRemoved: false },
    {
      page: req.query.page,
      limit: req.query.limit,
      populate: "student course",
      sort: { createdAt: -1 },
    }
  );
  sendResponse(res, 200, "Reviews retrieved", result);
});

export const replyToReview = asyncHandler(async (req, res) => {
  const review = await Review.findOneAndUpdate(
    { _id: req.params.id, instructor: req.user._id },
    {
      instructorReply: {
        content: req.body.content,
        repliedAt: new Date(),
      },
    },
    { new: true }
  );

  if (!review) return sendResponse(res, 404, "Review not found");
  sendResponse(res, 200, "Reply added", review);
});