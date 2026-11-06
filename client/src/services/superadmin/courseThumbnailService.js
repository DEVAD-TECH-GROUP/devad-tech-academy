
import api from "../../api/Api";

// Get all thumbnails
export const getAllThumbnails = () =>
  api.get("/superadmin/course-thumbnails");

// Upload thumbnail
export const uploadThumbnail = (formData) =>
  api.post("/superadmin/course-thumbnails", formData, {
    headers: {
      "Content-Type": undefined,
    },
    transformRequest: [
      (data) => data,
    ],
  });

// Update thumbnail details
export const updateThumbnail = (id, payload) =>
  api.put(`/superadmin/course-thumbnails/${id}`, payload);

// Activate / deactivate thumbnail
export const toggleThumbnailStatus = (id) =>
  api.patch(`/superadmin/course-thumbnails/${id}/status`);

// Delete thumbnail
export const deleteThumbnail = (id) =>
  api.delete(`/superadmin/course-thumbnails/${id}`);
