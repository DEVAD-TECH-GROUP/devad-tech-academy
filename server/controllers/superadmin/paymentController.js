import Payment from "../../models/payment/Payment.js";
import Setting from "../../models/system/Setting.js";
import paginate from "../../utils/pagination.js";
import sendResponse from "../../utils/sendResponse.js";
import asyncHandler from "../../middlewares/error/asyncHandler.js";
import auditLogger from "../../services/audit/auditLogger.js";
import { AUDIT_TYPES } from "../../utils/constants.js";

export const getAllTransactions = asyncHandler(async (req, res) => {
  const { page, limit, status, gateway, search } = req.query;

  const query = {};
  if (status) query.status = status;
  if (gateway) query.gateway = gateway;

  const result = await paginate(Payment, query, {
    page, limit,
    populate: "student course subscription",
    sort: { createdAt: -1 },
  });

  sendResponse(res, 200, "Transactions retrieved", result);
});

export const getTransaction = asyncHandler(async (req, res) => {
  const payment = await Payment.findById(req.params.id)
    .populate("student", "firstName lastName email")
    .populate("course", "title");

  if (!payment) return sendResponse(res, 404, "Transaction not found");
  sendResponse(res, 200, "Transaction retrieved", payment);
});

export const getGateways = asyncHandler(async (req, res) => {
  const setting = await Setting.findOne();
  sendResponse(res, 200, "Gateways retrieved", setting?.payments || {});
});

export const updateGateway = asyncHandler(async (req, res) => {
  const setting = await Setting.findOneAndUpdate(
    {},
    { $set: { "payments.activeGateway": req.params.name } },
    { new: true, upsert: true }
  );

  await auditLogger({
    actor: req.user._id,
    actorRole: req.user.role,
    action: `Updated payment gateway to: ${req.params.name}`,
    type: AUDIT_TYPES.CONFIG,
    ipAddress: req.ip,
  });

  sendResponse(res, 200, "Gateway updated", setting);
});