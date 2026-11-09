
import api from "../../api/Api";

const base = "/instructor/live-classes";

// Classes
export const getMyLiveClasses = (params = {}) =>
  api.get(base, { params });

export const createLiveClass = (payload) =>
  api.post(base, payload);

export const getLiveClass = (id) =>
  api.get(`${base}/${id}`);

export const updateLiveClass = (id, payload) =>
  api.put(`${base}/${id}`, payload);

export const deleteLiveClass = (id) =>
  api.delete(`${base}/${id}`);

// Meeting lifecycle
export const startLiveClass = (id) =>
  api.post(`${base}/${id}/start`);

export const endLiveClass = (id) =>
  api.post(`${base}/${id}/end`);

// Attendance
export const getLiveClassAttendance = (id) =>
  api.get(`${base}/${id}/attendance`);

// Recording lifecycle
export const getLiveClassRecording = (id) =>
  api.get(`${base}/${id}/recording`);

export const syncLiveClassRecording = (id) =>
  api.post(`${base}/${id}/sync-recording`);

// Legacy endpoint: retained for compatibility only.
export const saveLiveClassRecording = (id, payload) =>
  api.post(`${base}/${id}/recording`, payload);


export const getInstructorJoinToken = (id) =>
  api.post(`${base}/${id}/join-token`);
