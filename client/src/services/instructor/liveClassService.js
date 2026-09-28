import api from "../../api/Api";

export const getMyLiveClasses = (params) =>
  api.get("/instructor/live-classes", { params });

export const createLiveClass = (payload) =>
  api.post("/instructor/live-classes", payload);

export const getLiveClass = (id) =>
  api.get(`/instructor/live-classes/${id}`);

export const updateLiveClass = (id, payload) =>
  api.put(`/instructor/live-classes/${id}`, payload);

export const deleteLiveClass = (id) =>
  api.delete(`/instructor/live-classes/${id}`);

export const startLiveClass = (id) =>
  api.post(`/instructor/live-classes/${id}/start`);

export const getLiveClassAttendance = (id) =>
  api.get(`/instructor/live-classes/${id}/attendance`);

export const saveLiveClassRecording = (id, payload) =>
  api.post(`/instructor/live-classes/${id}/recording`, payload);