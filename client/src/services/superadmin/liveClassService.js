import api from "../../api/Api";

export const getAllLiveClasses = (params) =>
  api.get("/superadmin/live-classes", { params });

export const createLiveClass = (payload) =>
  api.post("/superadmin/live-classes", payload);

export const getLiveClass = (id) =>
  api.get(`/superadmin/live-classes/${id}`);

export const updateLiveClass = (id, payload) =>
  api.put(`/superadmin/live-classes/${id}`, payload);

export const deleteLiveClass = (id) =>
  api.delete(`/superadmin/live-classes/${id}`);

export const getLiveClassAttendance = (id) =>
  api.get(`/superadmin/live-classes/${id}/attendance`);