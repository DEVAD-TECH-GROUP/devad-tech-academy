import api from "../../api/Api";

export const subscribe = (payload) =>
  api.post("/student/payments/subscribe", payload);

export const verifyPayment = (reference) =>
  api.post("/student/payments/verify", { reference });

export const getPaymentHistory = () =>
  api.get("/student/payments/history");

export const getReceipt = (id) =>
  api.get(`/student/payments/receipts/${id}`);

export const getSubscription = () =>
  api.get("/student/payments/subscription");