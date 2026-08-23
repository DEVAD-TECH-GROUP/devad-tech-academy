import Payout from "../../models/payment/Payout.js";
import Payment from "../../models/payment/Payment.js";
import Instructor from "../../models/user/Instructor.js";
import sendResponse from "../../utils/sendResponse.js";
import asyncHandler from "../../middlewares/error/asyncHandler.js";

export const getEarningsSummary = asyncHandler(async (req, res) => {
  const instructor = await Instructor.findOne({ user: req.user._id });

  const monthlyRevenue = await Payment.aggregate([
    { $match: { status: "success" } },
    {
      $group: {
        _id: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
        },
        revenue: { $sum: "$finalAmount" },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
    { $limit: 12 },
  ]);

  sendResponse(res, 200, "Earnings summary retrieved", {
    totalRevenue: instructor?.totalRevenue || 0,
    monthlyRevenue,
    platformFeePercent: 30 - (instructor?.platformFeeDiscount || 0),
    payoutSettings: instructor?.payoutSettings,
  });
});

export const getMonthlyEarnings = asyncHandler(async (req, res) => {
  const monthly = await Payment.aggregate([
    { $match: { status: "success" } },
    {
      $group: {
        _id: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
        },
        revenue: { $sum: "$finalAmount" },
        count: { $sum: 1 },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
  ]);

  sendResponse(res, 200, "Monthly earnings retrieved", monthly);
});

export const getEarningsHistory = asyncHandler(async (req, res) => {
  const payments = await Payment.find({ status: "success" })
    .sort({ createdAt: -1 })
    .limit(50);

  sendResponse(res, 200, "Earnings history retrieved", payments);
});

export const requestPayout = asyncHandler(async (req, res) => {
  const instructor = await Instructor.findOne({ user: req.user._id });

  if (!instructor?.payoutSettings?.accountNumber) {
    return sendResponse(res, 400, "Please set up your bank account first");
  }

  const payout = await Payout.create({
    instructor: req.user._id,
    amount: req.body.amount,
    netAmount: req.body.amount * 0.7,
    platformFee: req.body.amount * 0.3,
    periodStart: req.body.periodStart,
    periodEnd: req.body.periodEnd,
    bankName: instructor.payoutSettings.bankName,
    accountNumber: instructor.payoutSettings.accountNumber,
    accountName: instructor.payoutSettings.accountName,
    status: "pending",
  });

  sendResponse(res, 201, "Payout requested", payout);
});

export const getMyPayouts = asyncHandler(async (req, res) => {
  const payouts = await Payout.find({
    instructor: req.user._id,
  }).sort({ createdAt: -1 });

  sendResponse(res, 200, "Payouts retrieved", payouts);
});