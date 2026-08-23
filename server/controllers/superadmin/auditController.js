import AuditLog from "../../models/system/AuditLog.js";
import paginate from "../../utils/pagination.js";
import sendResponse from "../../utils/sendResponse.js";
import asyncHandler from "../../middlewares/error/asyncHandler.js";

export const getAuditLogs = asyncHandler(async (req, res) => {
  const { page, limit, type, actor } = req.query;

  const query = {};
  if (type) query.type = type;
  if (actor) query.actor = actor;

  const result = await paginate(AuditLog, query, {
    page, limit,
    populate: { path: "actor", select: "firstName lastName role" },
    sort: { createdAt: -1 },
  });

  sendResponse(res, 200, "Audit logs retrieved", result);
});

export const getSecurityLogs = asyncHandler(async (req, res) => {
  const result = await paginate(
    AuditLog,
    { type: { $in: ["security", "auth"] } },
    {
      page: req.query.page,
      limit: req.query.limit,
      populate: { path: "actor", select: "firstName lastName role" },
      sort: { createdAt: -1 },
    }
  );

  sendResponse(res, 200, "Security logs retrieved", result);
});

export const getPaymentLogs = asyncHandler(async (req, res) => {
  const result = await paginate(
    AuditLog,
    { type: "payment" },
    {
      page: req.query.page,
      limit: req.query.limit,
      sort: { createdAt: -1 },
    }
  );

  sendResponse(res, 200, "Payment logs retrieved", result);
});

export const getUserLogs = asyncHandler(async (req, res) => {
  const result = await paginate(
    AuditLog,
    { type: "user" },
    {
      page: req.query.page,
      limit: req.query.limit,
      sort: { createdAt: -1 },
    }
  );

  sendResponse(res, 200, "User logs retrieved", result);
});