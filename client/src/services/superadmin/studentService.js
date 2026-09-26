import api from "../../api/Api";

export const getAllStudents = (params) =>
  api.get("/superadmin/students", { params });

export const getStudent = (id) =>
  api.get(`/superadmin/students/${id}`);

export const getStudentProgress = (id) =>
  api.get(`/superadmin/students/${id}/progress`);

export const getStudentEnrollments = (id) =>
  api.get(`/superadmin/students/${id}/enrollments`);

export const getStudentCertificates = (id) =>
  api.get(`/superadmin/students/${id}/certificates`);

export const getStudentPayments = (id) =>
  api.get(`/superadmin/students/${id}/payments`);

export const resetStudentPassword = (id) =>
  api.put(`/superadmin/students/${id}/reset-password`);

export const updateStudentStatus = (id, status) =>
  api.put(`/superadmin/students/${id}/status`, { status });