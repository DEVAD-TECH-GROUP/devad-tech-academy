import api from "../../api/Api";

export const getNotifications = (params) =>
  api.get("/instructor/notifications", { params });

export const markRead = (id) =>
  api.put(`/instructor/notifications/${id}/read`);

export const markAllRead = () =>
  api.put("/instructor/notifications/read-all");