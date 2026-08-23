import Payment from "../../models/payment/Payment.js";
import Subscription from "../../models/payment/Subscription.js";
import Coupon from "../../models/payment/Coupon.js";
import Student from "../../models/user/Student.js";
import sendResponse from "../../utils/sendResponse.js";
import asyncHandler from "../../middlewares/error/asyncHandler.js";
import { initializePayment, verifyPayment } from "../../services/payment/paystackService.js";
import { generateInvoiceId } from "../../utils/generateCode.js";
import { getMonthlyExpiry, getAnnualExpiry } from "../../utils/dateHelpers.js";
import { formatNaira, nairaToKobo } from "../../utils/formatCurrency.js";
import { PAYSTACK, SUBSCRIPTION_PLANS } from "../../utils/constants.js";
import sendEmail from "../../services/email/emailService.js";
import paymentReceiptTemplate from "../../templates/email/paymentReceipt.js";
import { EMAIL_SUBJECTS } from "../../utils/constants.js";
import { formatDate } from "../../utils/dateHelpers.js";

export const subscribe = asyncHandler(async (req, res) => {
  const { plan, couponCode } = req.body;

  let amount = plan === SUBSCRIPTION_PLANS.MONTHLY
    ? PAYSTACK.MONTHLY_PLAN_AMOUNT
    : PAYSTACK.ANNUAL_PLAN_AMOUNT;

  let discountAmount = 0;
  let coupon = null;

  if (couponCode) {
    coupon = await Coupon.findOne({
      code: couponCode.toUpperCase(),
      isActive: true,
      validUntil: { $gte: new Date() },
    });

    if (coupon) {
      if (coupon.discountType === "percentage") {
        discountAmount = (amount * coupon.discountValue) / 100;
        if (coupon.maxDiscount) {
          discountAmount = Math.min(discountAmount, nairaToKobo(coupon.maxDiscount));
        }
      } else {
        discountAmount = nairaToKobo(coupon.discountValue);
      }
    }
  }

  const student = await Student.findOne({ user: req.user._id });
  if (student?.subscriptionDiscount > 0) {
    const referralDiscount = (amount * student.subscriptionDiscount) / 100;
    discountAmount += referralDiscount;
  }

  const finalAmount = Math.max(0, amount - discountAmount);

  const reference = generateInvoiceId();
  const paymentData = await initializePayment({
    email: req.user.email,
    amount: finalAmount / 100,
    reference,
    metadata: { plan, userId: req.user._id, couponCode },
    callbackUrl: `${process.env.CLIENT_URL}/billing/verify`,
  });

  const payment = await Payment.create({
    student: req.user._id,
    type: "subscription",
    amount: amount / 100,
    discountAmount: discountAmount / 100,
    finalAmount: finalAmount / 100,
    gateway: "paystack",
    gatewayReference: reference,
    coupon: coupon?._id || null,
    invoiceId: generateInvoiceId(),
    status: "pending",
    metadata: { plan },
  });

  sendResponse(res, 200, "Payment initialized", {
    authorizationUrl: paymentData.data.authorization_url,
    reference,
    paymentId: payment._id,
  });
});

export const verifyPaymentCallback = asyncHandler(async (req, res) => {
  const { reference } = req.body;

  const result = await verifyPayment(reference);
  if (result.data.status !== "success") {
    return sendResponse(res, 400, "Payment verification failed");
  }

  const payment = await Payment.findOneAndUpdate(
    { gatewayReference: reference },
    { status: "success", paidAt: new Date() },
    { new: true }
  );

  if (!payment) return sendResponse(res, 404, "Payment not found");

  const plan = payment.metadata?.plan;
  const endDate = plan === SUBSCRIPTION_PLANS.MONTHLY
    ? getMonthlyExpiry()
    : getAnnualExpiry();

  const subscription = await Subscription.create({
    student: req.user._id,
    payment: payment._id,
    plan,
    originalAmount: payment.amount,
    discountAmount: payment.discountAmount,
    finalAmount: payment.finalAmount,
    startDate: new Date(),
    endDate,
    status: "active",
  });

  await Payment.findByIdAndUpdate(payment._id, {
    subscription: subscription._id,
  });

  await Student.findOneAndUpdate(
    { user: req.user._id },
    { isSubscribed: true, subscription: subscription._id }
  );

  await sendEmail({
    to: req.user.email,
    subject: EMAIL_SUBJECTS.PAYMENT_RECEIPT,
    htmlContent: paymentReceiptTemplate({
      firstName: req.user.firstName,
      invoiceId: payment.invoiceId,
      plan: plan === "monthly" ? "Monthly Plan" : "Annual Plan",
      amount: formatNaira(payment.finalAmount),
      date: formatDate(new Date()),
      gateway: "Paystack",
    }),
  });

  sendResponse(res, 200, "Payment verified and subscription activated", {
    subscription,
  });
});

export const getPaymentHistory = asyncHandler(async (req, res) => {
  const payments = await Payment.find({ student: req.user._id })
    .sort({ createdAt: -1 });

  sendResponse(res, 200, "Payment history retrieved", payments);
});

export const getReceipt = asyncHandler(async (req, res) => {
  const payment = await Payment.findOne({
    _id: req.params.id,
    student: req.user._id,
  });

  if (!payment) return sendResponse(res, 404, "Receipt not found");
  sendResponse(res, 200, "Receipt retrieved", payment);
});

export const getSubscription = asyncHandler(async (req, res) => {
  const subscription = await Subscription.findOne({
    student: req.user._id,
    status: "active",
  });

  sendResponse(res, 200, "Subscription retrieved", subscription);
});