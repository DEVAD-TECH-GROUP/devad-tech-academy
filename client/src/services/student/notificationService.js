import api from "../../api/Api";

export const getNotifications = (params) =>
  api.get("/student/notifications", { params });

export const markRead = (id) =>
  api.put(`/student/notifications/${id}/read`);

export const markAllRead = () =>
  api.put("/student/notifications/read-all");