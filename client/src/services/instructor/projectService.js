import api from "../../api/Api";

export const getMyProjects = (params) =>
  api.get("/instructor/projects", { params });

export const createProject = (payload) =>
  api.post("/instructor/projects", payload);

export const getProject = (id) =>
  api.get(`/instructor/projects/${id}`);

export const updateProject = (id, payload) =>
  api.put(`/instructor/projects/${id}`, payload);

export const getProjectSubmissions = (id) =>
  api.get(`/instructor/projects/${id}/submissions`);

export const gradeProjectSubmission = (id, payload) =>
  api.put(`/instructor/projects/project-submissions/${id}/grade`, payload);