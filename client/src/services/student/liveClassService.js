import api from "../../api/Api";

export const getMyLiveClasses = () =>
  api.get("/student/live-classes");

export const getLiveClass = (id) =>
  api.get(`/student/live-classes/${id}`);

export const joinLiveClass = (id) =>
  api.post(`/student/live-classes/${id}/join`);

export const getLiveClassRecording = (id) =>
  api.get(`/student/live-classes/${id}/recording`);