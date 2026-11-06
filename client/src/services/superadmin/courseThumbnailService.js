import api from "../../api/Api";

export const getAllThumbnails = () =>
  api.get("/superadmin/course-thumbnails");

export const uploadThumbnail = (formData) =>
  api.post("/superadmin/course-thumbnails", formData);

export const updateThumbnail = (id, payload) =>
  api.put(`/superadmin/course-thumbnails/${id}`, payload);

export const toggleThumbnailStatus = (id) =>
  api.patch(`/superadmin/course-thumbnails/${id}/status`);

export const deleteThumbnail = (id) =>
  api.delete(`/superadmin/course-thumbnails/${id}`);
