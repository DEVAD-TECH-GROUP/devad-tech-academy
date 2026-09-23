import api from "../../api/Api";

export const getDashboardStats = () =>
  api.get("/student/dashboard/stats");

export const getDashboardActivity = () =>
  api.get("/student/dashboard/activity");

export const getStreak = () =>
  api.get("/student/dashboard/streak");

export const getUpcoming = () =>
  api.get("/student/dashboard/upcoming");