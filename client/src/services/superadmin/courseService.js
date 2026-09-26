import api from "../../api/Api";

export const getAllCourses = (params) =>
  api.get("/superadmin/courses", { params });

export const getCourse = (id) =>
  api.get(`/superadmin/courses/${id}`);

export const createCourse = (payload) =>
  api.post("/superadmin/courses", payload);

export const updateCourse = (id, payload) =>
  api.put(`/superadmin/courses/${id}`, payload);

export const deleteCourse = (id) =>
  api.delete(`/superadmin/courses/${id}`);

export const approveCourse = (id) =>
  api.put(`/superadmin/courses/${id}/approve`);

export const rejectCourse = (id, reason) =>
  api.put(`/superadmin/courses/${id}/reject`, { reason });

export const archiveCourse = (id) =>
  api.put(`/superadmin/courses/${id}/archive`);

export const featureCourse = (id, isFeatured) =>
  api.put(`/superadmin/courses/${id}/feature`, { isFeatured });

export const getCourseAnalytics = (id) =>
  api.get(`/superadmin/courses/${id}/analytics`);
