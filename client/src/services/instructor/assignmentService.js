import api from "../../api/Api";

export const getMyAssignments = (params) =>
  api.get("/instructor/assignments", { params });

export const createAssignment = (payload) =>
  api.post("/instructor/assignments", payload);

export const getAssignment = (id) =>
  api.get(`/instructor/assignments/${id}`);

export const updateAssignment = (id, payload) =>
  api.put(`/instructor/assignments/${id}`, payload);

export const deleteAssignment = (id) =>
  api.delete(`/instructor/assignments/${id}`);

export const getSubmissions = (id) =>
  api.get(`/instructor/assignments/${id}/submissions`);

export const gradeSubmission = (id, payload) =>
  api.put(`/instructor/assignments/submissions/${id}/grade`, payload);