import api from "../../api/Api";

export const getLessons = (moduleId) =>
  api.get(`/instructor/lessons/${moduleId}/lessons`);

export const createLesson = (moduleId, payload) =>
  api.post(`/instructor/lessons/${moduleId}/lessons`, payload);

export const updateLesson = (moduleId, id, payload) =>
  api.put(`/instructor/lessons/${moduleId}/lessons/${id}`, payload);

export const deleteLesson = (moduleId, id) =>
  api.delete(`/instructor/lessons/${moduleId}/lessons/${id}`);

export const uploadVideo = (id, formData) =>
  api.post(`/instructor/lessons/${id}/upload-video`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });