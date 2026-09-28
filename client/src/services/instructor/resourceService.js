import api from "../../api/Api";

export const getLessonResources = (lessonId) =>
  api.get(`/instructor/resources/${lessonId}`);

export const addResource = (payload) =>
  api.post("/instructor/resources", payload);

export const deleteResource = (id) =>
  api.delete(`/instructor/resources/${id}`);