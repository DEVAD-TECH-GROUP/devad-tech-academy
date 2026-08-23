import Portfolio from "../../models/career/Portfolio.js";
import sendResponse from "../../utils/sendResponse.js";
import asyncHandler from "../../middlewares/error/asyncHandler.js";

export const getMyPortfolio = asyncHandler(async (req, res) => {
  let portfolio = await Portfolio.findOne({ student: req.user._id })
    .populate("certificates");

  if (!portfolio) {
    portfolio = await Portfolio.create({ student: req.user._id });
  }

  sendResponse(res, 200, "Portfolio retrieved", portfolio);
});

export const updatePortfolio = asyncHandler(async (req, res) => {
  const portfolio = await Portfolio.findOneAndUpdate(
    { student: req.user._id },
    req.body,
    { new: true, upsert: true, runValidators: true }
  );

  sendResponse(res, 200, "Portfolio updated", portfolio);
});

export const addProject = asyncHandler(async (req, res) => {
  const portfolio = await Portfolio.findOneAndUpdate(
    { student: req.user._id },
    { $push: { projects: req.body } },
    { new: true, upsert: true }
  );

  sendResponse(res, 200, "Project added", portfolio);
});

export const deleteProject = asyncHandler(async (req, res) => {
  const portfolio = await Portfolio.findOneAndUpdate(
    { student: req.user._id },
    { $pull: { projects: { _id: req.params.id } } },
    { new: true }
  );

  sendResponse(res, 200, "Project deleted", portfolio);
});