import api from "../../api/Api";

export const getCourseDiscussions = (params) =>
  api.get("/instructor/discussions", { params });

export const replyToDiscussion = (id, content) =>
  api.post(`/instructor/discussions/${id}/reply`, { content });

export const pinDiscussion = (id, isPinned) =>
  api.put(`/instructor/discussions/${id}/pin`, { isPinned });

export const deleteDiscussion = (id) =>
  api.delete(`/instructor/discussions/${id}`);