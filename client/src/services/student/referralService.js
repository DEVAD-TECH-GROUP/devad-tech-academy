import api from "../../api/Api";

export const getReferralStats = () =>
  api.get("/student/referral/stats");

export const getReferralCode = () =>
  api.get("/student/referral/code");

export const getReferralList = () =>
  api.get("/student/referral/list");