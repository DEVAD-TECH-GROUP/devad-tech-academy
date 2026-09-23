import api from "../../api/Api";

export const leaveReview = (courseId, payload) =>
  api.post(`/student/reviews/${courseId}`, payload);

export const updateReview = (id, payload) =>
  api.put(`/student/reviews/${id}`, payload);

export const deleteReview = (id) =>
  api.delete(`/student/reviews/${id}`);