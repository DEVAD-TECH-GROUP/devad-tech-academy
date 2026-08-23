import Course from "../../models/course/Course.js";
import User from "../../models/user/User.js";
import Discussion from "../../models/community/Discussion.js";
import sendResponse from "../../utils/sendResponse.js";
import asyncHandler from "../../middlewares/error/asyncHandler.js";

export const search = asyncHandler(async (req, res) => {
  const { q, type } = req.query;

  if (!q) return sendResponse(res, 400, "Search query required");

  const regex = { $regex: q, $options: "i" };

  const results = {};

  if (!type || type === "courses") {
    results.courses = await Course.find({
      status: "published",
      $or: [{ title: regex }, { description: regex }],
    })
      .select("title thumbnail averageRating totalStudents")
      .limit(10)
      .populate("instructor", "firstName lastName");
  }

  if (!type || type === "instructors") {
    results.instructors = await User.find({
      role: "instructor",
      $or: [{ firstName: regex }, { lastName: regex }],
    })
      .select("firstName lastName avatar headline")
      .limit(5);
  }

  if (!type || type === "discussions") {
    results.discussions = await Discussion.find({
      isRemoved: false,
      $or: [{ title: regex }, { content: regex }],
    })
      .select("title content type totalReplies")
      .limit(5);
  }

  sendResponse(res, 200, "Search results", results);
});