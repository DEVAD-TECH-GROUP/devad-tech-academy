import api from "../../api/Api";

export const getAuditLogs = (params) =>
  api.get("/superadmin/audit", { params });

export const getSecurityLogs = (params) =>
  api.get("/superadmin/audit/security", { params });

export const getPaymentLogs = (params) =>
  api.get("/superadmin/audit/payments", { params });

export const getUserLogs = (params) =>
  api.get("/superadmin/audit/users", { params });