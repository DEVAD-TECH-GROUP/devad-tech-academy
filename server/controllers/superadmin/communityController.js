import Discussion from "../../models/community/Discussion.js";
import StudyGroup from "../../models/community/StudyGroup.js";
import Event from "../../models/community/Event.js";
import Report from "../../models/review/Report.js";
import paginate from "../../utils/pagination.js";
import sendResponse from "../../utils/sendResponse.js";
import asyncHandler from "../../middlewares/error/asyncHandler.js";

export const getAllDiscussions = asyncHandler(async (req, res) => {
  const result = await paginate(Discussion, {}, {
    page: req.query.page,
    limit: req.query.limit,
    populate: "author course",
    sort: { createdAt: -1 },
  });
  sendResponse(res, 200, "Discussions retrieved", result);
});

export const deleteDiscussion = asyncHandler(async (req, res) => {
  const discussion = await Discussion.findByIdAndUpdate(
    req.params.id,
    { isRemoved: true, removedBy: req.user._id, removedAt: new Date() },
    { new: true }
  );

  if (!discussion) return sendResponse(res, 404, "Discussion not found");
  sendResponse(res, 200, "Discussion removed");
});

export const pinDiscussion = asyncHandler(async (req, res) => {
  const discussion = await Discussion.findByIdAndUpdate(
    req.params.id,
    { isPinned: true },
    { new: true }
  );

  if (!discussion) return sendResponse(res, 404, "Discussion not found");
  sendResponse(res, 200, "Discussion pinned", discussion);
});

export const getFlaggedContent = asyncHandler(async (req, res) => {
  const flagged = await Report.find({ status: "pending" })
    .populate("reportedBy", "firstName lastName")
    .sort({ createdAt: -1 });

  sendResponse(res, 200, "Flagged content retrieved", flagged);
});

export const removeFlaggedContent = asyncHandler(async (req, res) => {
  const report = await Report.findByIdAndUpdate(
    req.params.id,
    {
      status: "resolved",
      reviewedBy: req.user._id,
      reviewedAt: new Date(),
      actionTaken: "content-removed",
    },
    { new: true }
  );

  if (!report) return sendResponse(res, 404, "Report not found");
  sendResponse(res, 200, "Content removed");
});

export const getStudyGroups = asyncHandler(async (req, res) => {
  const result = await paginate(StudyGroup, {}, {
    page: req.query.page,
    limit: req.query.limit,
  });
  sendResponse(res, 200, "Study groups retrieved", result);
});

export const getCommunityEvents = asyncHandler(async (req, res) => {
  const events = await Event.find()
    .sort({ startDate: 1 })
    .populate("createdBy", "firstName lastName");

  sendResponse(res, 200, "Events retrieved", events);
});