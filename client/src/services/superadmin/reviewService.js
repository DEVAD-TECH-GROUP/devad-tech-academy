import api from "../../api/Api";

export const getAllReviews = (params) =>
  api.get("/superadmin/reviews", { params });

export const getFlaggedReviews = () =>
  api.get("/superadmin/reviews/flagged");

export const removeReview = (id) =>
  api.put(`/superadmin/reviews/${id}/remove`);

export const dismissFlag = (id) =>
  api.put(`/superadmin/reviews/${id}/dismiss-flag`);