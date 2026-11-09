
import api from "../../api/Api";

// ─────────────────────────────────────────────
// LIVE CLASSES
// ─────────────────────────────────────────────

// Get all live classes belonging to the instructor
export const getMyLiveClasses = (params = {}) =>
  api.get("/instructor/live-classes", { params });

// Create a new live class
export const createLiveClass = (payload) =>
  api.post("/instructor/live-classes", payload);

// Get a single live class
export const getLiveClass = (id) =>
  api.get(`/instructor/live-classes/${id}`);

// Update a scheduled live class
export const updateLiveClass = (id, payload) =>
  api.put(`/instructor/live-classes/${id}`, payload);

// Delete a live class
export const deleteLiveClass = (id) =>
  api.delete(`/instructor/live-classes/${id}`);


// ─────────────────────────────────────────────
// LIVE CLASS MEETING
// ─────────────────────────────────────────────

// Start a live class
export const startLiveClass = (id) =>
  api.post(`/instructor/live-classes/${id}/start`);


// ─────────────────────────────────────────────
// ATTENDANCE
// ─────────────────────────────────────────────

// Get attendance records for a live class
export const getLiveClassAttendance = (id) =>
  api.get(`/instructor/live-classes/${id}/attendance`);


// ─────────────────────────────────────────────
// RECORDINGS
// ─────────────────────────────────────────────

// Synchronize/fetch recordings directly from Daily.co
export const syncLiveClassRecording = (id) =>
  api.post(`/instructor/live-classes/${id}/sync-recording`);

// Get the saved recording for a live class
export const getLiveClassRecording = (id) =>
  api.get(`/instructor/live-classes/${id}/recording`);

// Manually save recording information (backward compatibility)
export const saveLiveClassRecording = (id, payload) =>
  api.post(`/instructor/live-classes/${id}/recording`, payload);
