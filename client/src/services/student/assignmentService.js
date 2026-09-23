import api from "../../api/Api";

export const getMyAssignments = () =>
  api.get("/student/assignments");

export const getAssignment = (id) =>
  api.get(`/student/assignments/${id}`);

export const submitAssignment = (id, payload) =>
  api.post(`/student/assignments/${id}/submit`, payload);

export const getSubmission = (id) =>
  api.get(`/student/assignments/${id}/submission`);

export const getFeedback = (id) =>
  api.get(`/student/assignments/${id}/feedback`);