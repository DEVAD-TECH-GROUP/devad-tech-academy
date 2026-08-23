import Integration from "../../models/system/Integration.js";
import APIKey from "../../models/system/APIKey.js";
import sendResponse from "../../utils/sendResponse.js";
import asyncHandler from "../../middlewares/error/asyncHandler.js";
import { v4 as uuidv4 } from "uuid";
import auditLogger from "../../services/audit/auditLogger.js";
import { AUDIT_TYPES } from "../../utils/constants.js";

export const getIntegrations = asyncHandler(async (req, res) => {
  const integrations = await Integration.find();
  sendResponse(res, 200, "Integrations retrieved", integrations);
});

export const updateIntegration = asyncHandler(async (req, res) => {
  const integration = await Integration.findOneAndUpdate(
    { slug: req.params.name },
    { ...req.body, lastSyncedAt: new Date(), updatedBy: req.user._id },
    { new: true, upsert: true }
  );

  await auditLogger({
    actor: req.user._id,
    actorRole: req.user.role,
    action: `Updated integration: ${req.params.name}`,
    type: AUDIT_TYPES.CONFIG,
    ipAddress: req.ip,
  });

  sendResponse(res, 200, "Integration updated", integration);
});

export const getAPIKeys = asyncHandler(async (req, res) => {
  const keys = await APIKey.find({ createdBy: req.user._id, isActive: true })
    .select("-key");

  sendResponse(res, 200, "API keys retrieved", keys);
});

export const createAPIKey = asyncHandler(async (req, res) => {
  const key = `devad_${uuidv4().replace(/-/g, "")}`;
  const prefix = key.slice(0, 12);

  const apiKey = await APIKey.create({
    ...req.body,
    key,
    prefix,
    createdBy: req.user._id,
  });

  sendResponse(res, 201, "API key created", {
    ...apiKey.toObject(),
    key,
  });
});

export const deleteAPIKey = asyncHandler(async (req, res) => {
  await APIKey.findByIdAndUpdate(req.params.id, {
    isActive: false,
    revokedAt: new Date(),
  });

  sendResponse(res, 200, "API key revoked");
});

export const getWebhooks = asyncHandler(async (req, res) => {
  sendResponse(res, 200, "Webhooks retrieved", []);
});

export const createWebhook = asyncHandler(async (req, res) => {
  sendResponse(res, 201, "Webhook created");
});