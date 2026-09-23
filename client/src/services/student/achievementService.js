import api from "../../api/Api";

export const getMyAchievements = () =>
  api.get("/student/achievements");

export const getMyBadges = () =>
  api.get("/student/achievements/badges");

export const getXPHistory = () =>
  api.get("/student/achievements/xp");

export const getStreaks = () =>
  api.get("/student/achievements/streaks");

export const getLeaderboard = () =>
  api.get("/student/achievements/leaderboard");