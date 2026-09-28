import api from "../../api/Api";

export const getMyCourses = (params) =>
  api.get("/instructor/courses", { params });

export const createCourse = (payload) =>
  api.post("/instructor/courses", payload);

export const getCourse = (id) =>
  api.get(`/instructor/courses/${id}`);

export const updateCourse = (id, payload) =>
  api.put(`/instructor/courses/${id}`, payload);

export const deleteCourse = (id) =>
  api.delete(`/instructor/courses/${id}`);

export const publishCourse = (id) =>
  api.put(`/instructor/courses/${id}/publish`);

export const submitForReview = (id) =>
  api.put(`/instructor/courses/${id}/submit-review`);

export const getCourseAnalytics = (id) =>
  api.get(`/instructor/courses/${id}/analytics`);