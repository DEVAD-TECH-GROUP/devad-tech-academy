import api from "../../api/Api";

// ============================================================
// COURSES
// ============================================================

export const getMyCourses = (params) =>
  api.get("/instructor/courses", { params });

export const createCourse = (payload) =>
  api.post("/instructor/courses", payload);

export const getCourse = (id) =>
  api.get(`/instructor/courses/${id}`);

export const getCourseBuildData = (id) =>
  api.get(`/instructor/courses/${id}/build`);

export const updateCourse = (id, payload) =>
  api.put(`/instructor/courses/${id}`, payload);

export const deleteCourse = (id) =>
  api.delete(`/instructor/courses/${id}`);

// ============================================================
// COURSE REVIEW / PUBLISHING
// ============================================================

export const submitForReview = (id) =>
  api.put(`/instructor/courses/${id}/submit-review`);

export const publishCourse = (id) =>
  api.put(`/instructor/courses/${id}/publish`);

// ============================================================
// COURSE ANALYTICS
// ============================================================

export const getCourseAnalytics = (id) =>
  api.get(`/instructor/courses/${id}/analytics`);