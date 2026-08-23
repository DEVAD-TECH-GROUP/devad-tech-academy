import Payout from "../../models/payment/Payout.js";
import paginate from "../../utils/pagination.js";
import sendResponse from "../../utils/sendResponse.js";
import asyncHandler from "../../middlewares/error/asyncHandler.js";

export const getPayouts = asyncHandler(async (req, res) => {
  const result = await paginate(Payout, {}, {
    page: req.query.page,
    limit: req.query.limit,
    populate: "instructor",
    sort: { createdAt: -1 },
  });
  sendResponse(res, 200, "Payouts retrieved", result);
});

export const processPayout = asyncHandler(async (req, res) => {
  const payout = await Payout.findByIdAndUpdate(
    req.params.id,
    {
      status: "completed",
      processedBy: req.user._id,
      processedAt: new Date(),
    },
    { new: true }
  );

  if (!payout) return sendResponse(res, 404, "Payout not found");
  sendResponse(res, 200, "Payout processed", payout);
});

export const getPayout = asyncHandler(async (req, res) => {
  const payout = await Payout.findById(req.params.id)
    .populate("instructor", "firstName lastName email");

  if (!payout) return sendResponse(res, 404, "Payout not found");
  sendResponse(res, 200, "Payout retrieved", payout);
});