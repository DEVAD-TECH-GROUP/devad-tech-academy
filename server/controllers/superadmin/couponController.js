import Coupon from "../../models/payment/Coupon.js";
import paginate from "../../utils/pagination.js";
import sendResponse from "../../utils/sendResponse.js";
import asyncHandler from "../../middlewares/error/asyncHandler.js";
import { createCouponValidator } from "../../validators/superadmin/couponValidator.js";

export const getCoupons = asyncHandler(async (req, res) => {
  const result = await paginate(Coupon, {}, {
    page: req.query.page,
    limit: req.query.limit,
  });
  sendResponse(res, 200, "Coupons retrieved", result);
});

export const createCoupon = asyncHandler(async (req, res) => {
  const { error } = createCouponValidator(req.body);
  if (error) return sendResponse(res, 400, error.details[0].message);

  const existing = await Coupon.findOne({ code: req.body.code.toUpperCase() });
  if (existing) return sendResponse(res, 400, "Coupon code already exists");

  const coupon = await Coupon.create({
    ...req.body,
    createdBy: req.user._id,
  });

  sendResponse(res, 201, "Coupon created", coupon);
});

export const updateCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );

  if (!coupon) return sendResponse(res, 404, "Coupon not found");
  sendResponse(res, 200, "Coupon updated", coupon);
});

export const deleteCoupon = asyncHandler(async (req, res) => {
  await Coupon.findByIdAndDelete(req.params.id);
  sendResponse(res, 200, "Coupon deleted");
});