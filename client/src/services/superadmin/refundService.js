import api from "../../api/Api";

export const getRefunds = () =>
  api.get("/superadmin/refunds");

export const processRefund = (payload) =>
  api.post("/superadmin/refunds", payload);