import api from "../../api/Api";

export const getLesson = (id) =>
  api.get(`/student/lessons/${id}`);

export const completeLesson = (id) =>
  api.post(`/student/lessons/${id}/complete`);

export const updateProgress = (id, payload) =>
  api.post(`/student/lessons/${id}/progress`, payload);