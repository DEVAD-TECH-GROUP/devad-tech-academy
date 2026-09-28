import api from "../../api/Api";

export const getMyReviews = (params) =>
  api.get("/instructor/reviews", { params });

export const replyToReview = (id, content) =>
  api.post(`/instructor/reviews/${id}/reply`, { content });