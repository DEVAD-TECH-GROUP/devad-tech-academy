import api from "../../api/Api";

export const getPlatformStats = () =>
  api.get("/superadmin/dashboard/stats");

export const getSystemHealth = () =>
  api.get("/superadmin/dashboard/health");

export const getRecentActivity = () =>
  api.get("/superadmin/dashboard/activity");

export const getPlatformCalendar = () =>
  api.get("/superadmin/dashboard/calendar");