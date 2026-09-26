import api from "../../api/Api";

export const getUserAnalytics = () =>
  api.get("/superadmin/analytics/users");

export const getEnrollmentAnalytics = () =>
  api.get("/superadmin/analytics/enrollments");

export const getCourseAnalytics = () =>
  api.get("/superadmin/analytics/courses");

export const getRevenueAnalytics = () =>
  api.get("/superadmin/analytics/revenue");

export const getEngagementAnalytics = () =>
  api.get("/superadmin/analytics/engagement");

export const getDeviceAnalytics = () =>
  api.get("/superadmin/analytics/devices");

export const getGeographyAnalytics = () =>
  api.get("/superadmin/analytics/geography");

export const getInstructorAnalytics = () =>
  api.get("/superadmin/analytics/instructors");