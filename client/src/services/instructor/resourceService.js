import api from "../../api/Api";

export const getResources = (lessonId) =>
  api.get(`/instructor/resources/${lessonId}`);

export const uploadResource = (payload) =>
  api.post("/instructor/resources", payload);

export const deleteResource = (id) =>
  api.delete(`/instructor/resources/${id}`);
