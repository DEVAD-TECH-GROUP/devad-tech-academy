import api from "../../api/Api";

export const getReferralStats = () =>
  api.get("/instructor/referral/stats");

export const getReferralList = () =>
  api.get("/instructor/referral/list");

export const getReferralCode = () =>
  api.get("/instructor/referral/code");