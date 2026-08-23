import JobBoard from "../../models/career/JobBoard.js";
import Portfolio from "../../models/career/Portfolio.js";
import paginate from "../../utils/pagination.js";
import sendResponse from "../../utils/sendResponse.js";
import asyncHandler from "../../middlewares/error/asyncHandler.js";

export const getJobs = asyncHandler(async (req, res) => {
  const { page, limit, type, level, search } = req.query;

  const query = { status: "active" };
  if (type) query.type = type;
  if (level) query.experienceLevel = level;
  if (search) query.title = { $regex: search, $options: "i" };

  const result = await paginate(JobBoard, query, {
    page, limit,
    sort: { isFeatured: -1, createdAt: -1 },
  });

  sendResponse(res, 200, "Jobs retrieved", result);
});

export const getInternships = asyncHandler(async (req, res) => {
  const result = await paginate(
    JobBoard,
    { status: "active", type: "internship" },
    { page: req.query.page, limit: req.query.limit }
  );
  sendResponse(res, 200, "Internships retrieved", result);
});

export const getResume = asyncHandler(async (req, res) => {
  const portfolio = await Portfolio.findOne({ student: req.user._id })
    .select("resume headline summary skills experience education");

  sendResponse(res, 200, "Resume retrieved", portfolio);
});

export const updateResume = asyncHandler(async (req, res) => {
  const portfolio = await Portfolio.findOneAndUpdate(
    { student: req.user._id },
    { $set: req.body },
    { new: true, upsert: true }
  );

  sendResponse(res, 200, "Resume updated", portfolio);
});