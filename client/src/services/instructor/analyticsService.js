import api from "../../api/Api";

export const getAnalyticsOverview = () =>
  api.get("/instructor/analytics/overview");

export const getStudentAnalytics = () =>
  api.get("/instructor/analytics/students");

export const getCourseAnalytics = () =>
  api.get("/instructor/analytics/courses");

export const getRevenueAnalytics = () =>
  api.get("/instructor/analytics/revenue");

export const getWatchTimeAnalytics = () =>
  api.get("/instructor/analytics/watch-time");