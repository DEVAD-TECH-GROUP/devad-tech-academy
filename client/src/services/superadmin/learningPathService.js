import api from "../../api/Api";

export const getLearningPaths = (params) =>
  api.get("/superadmin/learning-paths", { params });

export const createLearningPath = (payload) =>
  api.post("/superadmin/learning-paths", payload);

export const getLearningPath = (id) =>
  api.get(`/superadmin/learning-paths/${id}`);

export const updateLearningPath = (id, payload) =>
  api.put(`/superadmin/learning-paths/${id}`, payload);

export const deleteLearningPath = (id) =>
  api.delete(`/superadmin/learning-paths/${id}`);

export const assignLearningPath = (id, studentIds) =>
  api.post(`/superadmin/learning-paths/${id}/assign`, { studentIds });