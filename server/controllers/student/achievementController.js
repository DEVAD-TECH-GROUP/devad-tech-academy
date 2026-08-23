import Badge from "../../models/gamification/Badge.js";
import XP from "../../models/gamification/XP.js";
import Streak from "../../models/gamification/Streak.js";
import Student from "../../models/user/Student.js";
import User from "../../models/user/User.js";
import sendResponse from "../../utils/sendResponse.js";
import asyncHandler from "../../middlewares/error/asyncHandler.js";

export const getMyAchievements = asyncHandler(async (req, res) => {
  const [student, badges, streak] = await Promise.all([
    Student.findOne({ user: req.user._id }),
    Badge.find({ student: req.user._id })
      .populate("achievement")
      .sort({ earnedAt: -1 }),
    Streak.findOne({ student: req.user._id }),
  ]);

  sendResponse(res, 200, "Achievements retrieved", {
    xpPoints: student?.xpPoints || 0,
    level: student?.level || 1,
    badges,
    streak: {
      current: streak?.currentStreak || 0,
      longest: streak?.longestStreak || 0,
    },
  });
});

export const getMyBadges = asyncHandler(async (req, res) => {
  const badges = await Badge.find({ student: req.user._id })
    .populate("achievement")
    .sort({ earnedAt: -1 });

  sendResponse(res, 200, "Badges retrieved", badges);
});

export const getXPHistory = asyncHandler(async (req, res) => {
  const xpLogs = await XP.find({ student: req.user._id })
    .sort({ createdAt: -1 })
    .limit(50);

  const total = xpLogs.reduce((sum, log) => sum + log.points, 0);
  sendResponse(res, 200, "XP history retrieved", { total, logs: xpLogs });
});

export const getStreaks = asyncHandler(async (req, res) => {
  const streak = await Streak.findOne({ student: req.user._id });
  sendResponse(res, 200, "Streak retrieved", streak || {
    currentStreak: 0,
    longestStreak: 0,
  });
});

export const getLeaderboard = asyncHandler(async (req, res) => {
  const leaderboard = await Student.find()
    .sort({ xpPoints: -1 })
    .limit(10)
    .populate("user", "firstName lastName avatar");

  sendResponse(res, 200, "Leaderboard retrieved", leaderboard);
});