import api from "../../api/Api";

export const login = (email, password) =>
  api.post("/auth/login", { email, password });

export const register = (payload) =>
  api.post("/auth/register", payload);

export const logout = () =>
  api.post("/auth/logout");

export const getMe = () =>
  api.get("/auth/me");

export const verifyEmail = (token) =>
  api.post("/auth/verify-email", { token });

export const resendVerification = () =>
  api.post("/auth/resend-verification");

export const forgotPassword = (email) =>
  api.post("/auth/forgot-password", { email });

export const resetPassword = (token, password) =>
  api.post("/auth/reset-password", { token, password });

export const changePassword = (currentPassword, newPassword) =>
  api.post("/auth/change-password", { currentPassword, newPassword });

export const refreshToken = () =>
  api.post("/auth/refresh-token");