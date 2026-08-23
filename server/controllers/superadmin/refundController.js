import Payment from "../../models/payment/Payment.js";
import Refund from "../../models/payment/Refund.js";
import sendResponse from "../../utils/sendResponse.js";
import asyncHandler from "../../middlewares/error/asyncHandler.js";
import { refundPayment } from "../../services/payment/paystackService.js";

export const processRefund = asyncHandler(async (req, res) => {
  const { paymentId, amount, reason } = req.body;

  const payment = await Payment.findById(paymentId);
  if (!payment) return sendResponse(res, 404, "Payment not found");

  if (payment.isRefunded) {
    return sendResponse(res, 400, "Payment already refunded");
  }

  const refundResult = await refundPayment({
    transaction: payment.gatewayReference,
    amount,
  });

  const refund = await Refund.create({
    payment: paymentId,
    student: payment.student,
    processedBy: req.user._id,
    amount: amount || payment.finalAmount,
    reason,
    gateway: payment.gateway,
    gatewayRefundId: refundResult?.data?.id,
    status: "processed",
    processedAt: new Date(),
  });

  await Payment.findByIdAndUpdate(paymentId, {
    isRefunded: true,
    refundedAt: new Date(),
    refundAmount: amount || payment.finalAmount,
    status: "refunded",
  });

  sendResponse(res, 200, "Refund processed", refund);
});

export const getRefunds = asyncHandler(async (req, res) => {
  const refunds = await Refund.find()
    .populate("payment")
    .populate("student", "firstName lastName email")
    .sort({ createdAt: -1 });

  sendResponse(res, 200, "Refunds retrieved", refunds);
});