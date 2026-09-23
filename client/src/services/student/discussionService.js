import api from "../../api/Api";

export const getDiscussions = (params) =>
  api.get("/student/discussions", { params });

export const createDiscussion = (payload) =>
  api.post("/student/discussions", payload);

export const getDiscussion = (id) =>
  api.get(`/student/discussions/${id}`);

export const replyToDiscussion = (id, content) =>
  api.post(`/student/discussions/${id}/reply`, { content });

export const likeDiscussion = (id) =>
  api.put(`/student/discussions/${id}/like`);

export const reportDiscussion = (id, payload) =>
  api.post(`/student/discussions/${id}/report`, payload);