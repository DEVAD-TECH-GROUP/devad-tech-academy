import Referral from "../../models/referral/Referral.js";
import User from "../../models/user/User.js";
import Student from "../../models/user/Student.js";
import sendResponse from "../../utils/sendResponse.js";
import asyncHandler from "../../middlewares/error/asyncHandler.js";

export const getReferralStats = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("referralCode");
  const student = await Student.findOne({ user: req.user._id });

  const [total, active, pending] = await Promise.all([
    Referral.countDocuments({ referrer: req.user._id }),
    Referral.countDocuments({ referrer: req.user._id, status: "active" }),
    Referral.countDocuments({ referrer: req.user._id, status: "pending" }),
  ]);

  const totalEarned = await Referral.aggregate([
    { $match: { referrer: req.user._id } },
    { $group: { _id: null, total: { $sum: "$totalCreditsEarned" } } },
  ]);

  sendResponse(res, 200, "Referral stats retrieved", {
    referralCode: user.referralCode,
    total, active, pending,
    totalCreditsEarned: totalEarned[0]?.total || 0,
    discountPercent: student?.subscriptionDiscount || 0,
    maxDiscount: 50,
    shareUrl: `${process.env.CLIENT_URL}/register?ref=${user.referralCode}`,
  });
});

export const getReferralCode = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("referralCode");
  sendResponse(res, 200, "Referral code retrieved", {
    code: user.referralCode,
    shareUrl: `${process.env.CLIENT_URL}/register?ref=${user.referralCode}`,
  });
});

export const getReferralList = asyncHandler(async (req, res) => {
  const referrals = await Referral.find({ referrer: req.user._id })
    .populate("referee", "firstName lastName createdAt")
    .sort({ createdAt: -1 });

  sendResponse(res, 200, "Referral list retrieved", referrals);
});