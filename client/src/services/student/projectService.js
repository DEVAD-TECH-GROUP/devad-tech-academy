import api from "../../api/Api";

export const getMyProjects = () =>
  api.get("/student/projects");

export const getProject = (id) =>
  api.get(`/student/projects/${id}`);

export const submitProject = (id, payload) =>
  api.post(`/student/projects/${id}/submit`, payload);

export const getProjectFeedback = (id) =>
  api.get(`/student/projects/${id}/feedback`);