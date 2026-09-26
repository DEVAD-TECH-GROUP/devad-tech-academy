import api from "../../api/Api";

export const getAllAssignments = (params) =>
  api.get("/superadmin/assignments", { params });

export const getAssignment = (id) =>
  api.get(`/superadmin/assignments/${id}`);

export const getAssignmentAnalytics = () =>
  api.get("/superadmin/assignments/analytics");

export const getLateSubmissions = () =>
  api.get("/superadmin/assignments/late-submissions");