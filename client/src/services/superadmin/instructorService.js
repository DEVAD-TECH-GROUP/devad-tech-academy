import api from "../../api/Api";

export const getAllInstructors = (params) =>
  api.get("/superadmin/instructors", { params });

export const getInstructorApplications = (params) =>
  api.get("/superadmin/instructors/applications", { params });

export const getInstructor = (id) =>
  api.get(`/superadmin/instructors/${id}`);

export const approveInstructor = (id) =>
  api.put(`/superadmin/instructors/${id}/approve`);

export const rejectInstructor = (id, reason) =>
  api.put(`/superadmin/instructors/${id}/reject`, { reason });

export const getInstructorPerformance = (id) =>
  api.get(`/superadmin/instructors/${id}/performance`);

export const getInstructorEarnings = (id) =>
  api.get(`/superadmin/instructors/${id}/earnings`);