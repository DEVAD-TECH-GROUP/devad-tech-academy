import Discussion from "../../models/community/Discussion.js";
import DiscussionReply from "../../models/community/DiscussionReply.js";
import Course from "../../models/course/Course.js";
import paginate from "../../utils/pagination.js";
import sendResponse from "../../utils/sendResponse.js";
import asyncHandler from "../../middlewares/error/asyncHandler.js";

export const getCourseDiscussions = asyncHandler(async (req, res) => {
  const courses = await Course.find({ instructor: req.user._id }).distinct("_id");

  const result = await paginate(
    Discussion,
    { course: { $in: courses }, isRemoved: false },
    {
      page: req.query.page,
      limit: req.query.limit,
      populate: "author course",
      sort: { isPinned: -1, createdAt: -1 },
    }
  );

  sendResponse(res, 200, "Discussions retrieved", result);
});

export const replyToDiscussion = asyncHandler(async (req, res) => {
  const reply = await DiscussionReply.create({
    discussion: req.params.id,
    author: req.user._id,
    content: req.body.content,
    isInstructorReply: true,
  });

  await Discussion.findByIdAndUpdate(req.params.id, {
    $inc: { totalReplies: 1 },
  });

  sendResponse(res, 201, "Reply posted", reply);
});

export const pinDiscussion = asyncHandler(async (req, res) => {
  const discussion = await Discussion.findByIdAndUpdate(
    req.params.id,
    { isPinned: !req.body.isPinned },
    { new: true }
  );

  if (!discussion) return sendResponse(res, 404, "Discussion not found");
  sendResponse(res, 200, "Discussion pin status updated", discussion);
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