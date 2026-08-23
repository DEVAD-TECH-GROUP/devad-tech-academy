import Setting from "../../models/system/Setting.js";
import sendResponse from "../../utils/sendResponse.js";
import asyncHandler from "../../middlewares/error/asyncHandler.js";
import auditLogger from "../../services/audit/auditLogger.js";
import { AUDIT_TYPES } from "../../utils/constants.js";
import { updateSettingValidator } from "../../validators/superadmin/settingValidator.js";

export const getSettings = asyncHandler(async (req, res) => {
  let setting = await Setting.findOne();
  if (!setting) {
    setting = await Setting.create({ lastUpdatedBy: req.user._id });
  }
  sendResponse(res, 200, "Settings retrieved", setting);
});

export const updateSettings = asyncHandler(async (req, res) => {
  const { error } = updateSettingValidator(req.body);
  if (error) return sendResponse(res, 400, error.details[0].message);

  const setting = await Setting.findOneAndUpdate(
    {},
    { ...req.body, lastUpdatedBy: req.user._id },
    { new: true, upsert: true }
  );

  await auditLogger({
    actor: req.user._id,
    actorRole: req.user.role,
    action: "Updated system settings",
    type: AUDIT_TYPES.CONFIG,
    ipAddress: req.ip,
  });

  sendResponse(res, 200, "Settings updated", setting);
});

export const updateBranding = asyncHandler(async (req, res) => {
  const setting = await Setting.findOneAndUpdate(
    {},
    { $set: { branding: req.body } },
    { new: true, upsert: true }
  );

  sendResponse(res, 200, "Branding updated", setting);
});

export const toggleMaintenance = asyncHandler(async (req, res) => {
  const { isEnabled, message } = req.body;

  const setting = await Setting.findOneAndUpdate(
    {},
    { $set: { "maintenance.isEnabled": isEnabled, "maintenance.message": message } },
    { new: true, upsert: true }
  );

  await auditLogger({
    actor: req.user._id,
    actorRole: req.user.role,
    action: `Maintenance mode ${isEnabled ? "enabled" : "disabled"}`,
    type: AUDIT_TYPES.CONFIG,
    ipAddress: req.ip,
  });

  sendResponse(res, 200, `Maintenance mode ${isEnabled ? "enabled" : "disabled"}`, setting);
});

export const backupNow = asyncHandler(async (req, res) => {
  await auditLogger({
    actor: req.user._id,
    actorRole: req.user.role,
    action: "Manual backup initiated",
    type: AUDIT_TYPES.SYSTEM,
    ipAddress: req.ip,
  });

  sendResponse(res, 200, "Backup initiated successfully");
});

export const restoreBackup = asyncHandler(async (req, res) => {
  sendResponse(res, 200, "Restore initiated");
});

export const updateSecuritySettings = asyncHandler(async (req, res) => {
  const setting = await Setting.findOneAndUpdate(
    {},
    { $set: { security: req.body } },
    { new: true, upsert: true }
  );

  sendResponse(res, 200, "Security settings updated", setting);
});