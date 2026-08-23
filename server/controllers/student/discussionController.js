import Discussion from "../../models/community/Discussion.js";
import DiscussionReply from "../../models/community/DiscussionReply.js";
import Enrollment from "../../models/learning/Enrollment.js";
import XP from "../../models/gamification/XP.js";
import Student from "../../models/user/Student.js";
import Report from "../../models/review/Report.js";
import paginate from "../../utils/pagination.js";
import sendResponse from "../../utils/sendResponse.js";
import asyncHandler from "../../middlewares/error/asyncHandler.js";
import { XP_POINTS } from "../../utils/constants.js";

export const getDiscussions = asyncHandler(async (req, res) => {
  const { courseId, page, limit, type } = req.query;

  const query = { isRemoved: false };
  if (courseId) query.course = courseId;
  if (type) query.type = type;

  const result = await paginate(Discussion, query, {
    page, limit,
    populate: "author course",
    sort: { isPinned: -1, createdAt: -1 },
  });

  sendResponse(res, 200, "Discussions retrieved", result);
});

export const createDiscussion = asyncHandler(async (req, res) => {
  const discussion = await Discussion.create({
    ...req.body,
    author: req.user._id,
  });

  await Student.findOneAndUpdate(
    { user: req.user._id },
    { $inc: { xpPoints: XP_POINTS.DISCUSSION_POST } }
  );

  await XP.create({
    student: req.user._id,
    action: "DISCUSSION_POST",
    points: XP_POINTS.DISCUSSION_POST,
    description: "Posted a discussion",
  });

  sendResponse(res, 201, "Discussion created", discussion);
});

export const getDiscussion = asyncHandler(async (req, res) => {
  const discussion = await Discussion.findByIdAndUpdate(
    req.params.id,
    { $inc: { totalViews: 1 } },
    { new: true }
  ).populate("author", "firstName lastName avatar role");

  if (!discussion) return sendResponse(res, 404, "Discussion not found");

  const replies = await DiscussionReply.find({
    discussion: req.params.id,
    isRemoved: false,
  })
    .populate("author", "firstName lastName avatar role")
    .sort({ isInstructorReply: -1, createdAt: 1 });

  sendResponse(res, 200, "Discussion retrieved", { discussion, replies });
});

export const replyToDiscussion = asyncHandler(async (req, res) => {
  const reply = await DiscussionReply.create({
    discussion: req.params.id,
    author: req.user._id,
    content: req.body.content,
    parentReply: req.body.parentReply || null,
  });

  await Discussion.findByIdAndUpdate(req.params.id, {
    $inc: { totalReplies: 1 },
  });

  await Student.findOneAndUpdate(
    { user: req.user._id },
    { $inc: { xpPoints: XP_POINTS.DISCUSSION_REPLY } }
  );

  sendResponse(res, 201, "Reply posted", reply);
});

export const likeDiscussion = asyncHandler(async (req, res) => {
  const discussion = await Discussion.findById(req.params.id);
  if (!discussion) return sendResponse(res, 404, "Discussion not found");

  const hasLiked = discussion.likes.includes(req.user._id);

  if (hasLiked) {
    await Discussion.findByIdAndUpdate(req.params.id, {
      $pull: { likes: req.user._id },
      $inc: { totalLikes: -1 },
    });
  } else {
    await Discussion.findByIdAndUpdate(req.params.id, {
      $addToSet: { likes: req.user._id },
      $inc: { totalLikes: 1 },
    });
  }

  sendResponse(res, 200, hasLiked ? "Unliked" : "Liked");
});

export const reportDiscussion = asyncHandler(async (req, res) => {
  await Report.create({
    reportedBy: req.user._id,
    contentType: "discussion",
    contentId: req.params.id,
    reason: req.body.reason,
    description: req.body.description,
  });

  sendResponse(res, 200, "Discussion reported");
});