import api from "../../api/Api";

export const getAllProjects = (params) =>
  api.get("/superadmin/projects", { params });

export const createProjectTemplate = (payload) =>
  api.post("/superadmin/projects/templates", payload);

export const getProject = (id) =>
  api.get(`/superadmin/projects/${id}`);

export const getProjectAnalytics = () =>
  api.get("/superadmin/projects/analytics");