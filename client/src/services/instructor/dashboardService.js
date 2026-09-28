import api from "../../api/Api";

export const getDashboardStats = () =>
  api.get("/instructor/dashboard/stats");

export const getDashboardActivity = () =>
  api.get("/instructor/dashboard/activity");

export const getDashboardCalendar = () =>
  api.get("/instructor/dashboard/calendar");// dashboardService
