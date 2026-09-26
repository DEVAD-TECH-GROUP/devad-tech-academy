import api from "../../api/Api";

export const getNotifications = (params) =>
  api.get("/superadmin/notifications", { params });

export const markRead = (id) =>
  api.put(`/superadmin/notifications/${id}/read`);

export const markAllRead = () =>
  api.put("/superadmin/notifications/read-all");