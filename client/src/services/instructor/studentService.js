import api from "../../api/Api";

export const getMyStudents = (params) =>
  api.get("/instructor/students", { params });

export const getStudent = (id) =>
  api.get(`/instructor/students/${id}`);

export const getStudentProgress = (id) =>
  api.get(`/instructor/students/${id}/progress`);

export const messageStudent = (id, content) =>
  api.post(`/instructor/students/${id}/message`, { content });