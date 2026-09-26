import api from "../../api/Api";

export const getAllTransactions = (params) =>
  api.get("/superadmin/payments/transactions", { params });

export const getTransaction = (id) =>
  api.get(`/superadmin/payments/transactions/${id}`);

export const getGateways = () =>
  api.get("/superadmin/payments/gateways");

export const updateGateway = (name, payload) =>
  api.put(`/superadmin/payments/gateways/${name}`, payload);
