import api from "../../api/Api";

export const getCoupons = (params) =>
  api.get("/superadmin/coupons", { params });

export const createCoupon = (payload) =>
  api.post("/superadmin/coupons", payload);

export const updateCoupon = (id, payload) =>
  api.put(`/superadmin/coupons/${id}`, payload);

export const deleteCoupon = (id) =>
  api.delete(`/superadmin/coupons/${id}`);