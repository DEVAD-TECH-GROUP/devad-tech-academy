import Setting from "../../models/system/Setting.js";
import AIUsageLog from "../../models/system/AIUsageLog.js";
import sendResponse from "../../utils/sendResponse.js";
import asyncHandler from "../../middlewares/error/asyncHandler.js";
import { getAIUsageStats } from "../../services/ai/aiLogger.js";
import auditLogger from "../../services/audit/auditLogger.js";
import { AUDIT_TYPES } from "../../utils/constants.js";

export const getAIConfig = asyncHandler(async (req, res) => {
  const setting = await Setting.findOne();
  sendResponse(res, 200, "AI config retrieved", setting?.ai || {});
});

export const updateAIConfig = asyncHandler(async (req, res) => {
  const setting = await Setting.findOneAndUpdate(
    {},
    { $set: { ai: req.body } },
    { new: true, upsert: true }
  );

  await auditLogger({
    actor: req.user._id,
    actorRole: req.user.role,
    action: "Updated AI configuration",
    type: AUDIT_TYPES.CONFIG,
    ipAddress: req.ip,
  });

  sendResponse(res, 200, "AI config updated", setting);
});

export const getAIUsage = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;

  const start = startDate
    ? new Date(startDate)
    : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const end = endDate ? new Date(endDate) : new Date();

  const stats = await getAIUsageStats(start, end);
  sendResponse(res, 200, "AI usage retrieved", stats);
});

export const getAITemplates = asyncHandler(async (req, res) => {
  const templates = [
    {
      name: "Quiz Generation",
      feature: "quiz-generation",
      description: "Generate quiz questions from a topic",
    },
    {
      name: "Assignment Generation",
      feature: "assignment-generation",
      description: "Create assignment briefs",
    },
    {
      name: "Lesson Outline",
      feature: "lesson-outline",
      description: "Generate lesson outlines",
    },
    {
      name: "Content Moderation",
      feature: "content-moderation",
      description: "Review and moderate content",
    },
  ];

  sendResponse(res, 200, "AI templates retrieved", templates);
});

export const createAITemplate = asyncHandler(async (req, res) => {
  sendResponse(res, 201, "AI template created");
});

export const updateAITemplate = asyncHandler(async (req, res) => {
  sendResponse(res, 200, "AI template updated");
});