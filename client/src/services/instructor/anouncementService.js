import api from "../../api/Api";

export const getMyAnnouncements = (params) =>
  api.get("/instructor/announcements", { params });

export const createAnnouncement = (payload) =>
  api.post("/instructor/announcements", payload);

export const updateAnnouncement = (id, payload) =>
  api.put(`/instructor/announcements/${id}`, payload);

export const deleteAnnouncement = (id) =>
  api.delete(`/instructor/announcements/${id}`);