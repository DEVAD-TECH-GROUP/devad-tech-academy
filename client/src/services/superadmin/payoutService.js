import api from "../../api/Api";

export const getPayouts = (params) =>
  api.get("/superadmin/payouts", { params });

export const processPayout = (id) =>
  api.post("/superadmin/payouts/process", { id });

export const getPayout = (id) =>
  api.get(`/superadmin/payouts/${id}`);