import api from "../../api/Api";

export const getRevenueSummary = () =>
  api.get("/superadmin/financial/revenue");

export const getExpenses = () =>
  api.get("/superadmin/financial/expenses");

export const getMonthlyReport = (params) =>
  api.get("/superadmin/financial/monthly", { params });

export const getAnnualReport = (params) =>
  api.get("/superadmin/financial/annual", { params });

export const exportFinancial = (format) =>
  api.get("/superadmin/financial/export", { params: { format }, responseType: "blob" });