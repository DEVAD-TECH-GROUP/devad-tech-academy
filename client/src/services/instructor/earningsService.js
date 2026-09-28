import api from "../../api/Api";

export const getEarningsSummary = () =>
  api.get("/instructor/earnings/summary");

export const getMonthlyEarnings = () =>
  api.get("/instructor/earnings/monthly");

export const getEarningsHistory = () =>
  api.get("/instructor/earnings/history");

export const requestPayout = (payload) =>
  api.post("/instructor/earnings/request-payout", payload);

export const getMyPayouts = () =>
  api.get("/instructor/earnings/payouts");