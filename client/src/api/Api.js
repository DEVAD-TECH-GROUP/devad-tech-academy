// src/api/Api.js

import axios from "axios";

// ============================================================
// API BASE URL
// ============================================================

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "https://devad-academy-backend.onrender.com/api";

// ============================================================
// AXIOS INSTANCE
// ============================================================

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,

  headers: {
    "Content-Type": "application/json",
  },
});

// ============================================================
// PUBLIC AUTH ENDPOINTS
// ============================================================
//
// These endpoints are used before the user has logged in.
// They use email verification or registrationToken instead
// of JWT authentication.
//
// A 401 from these endpoints must NOT trigger JWT refresh.
//
// ============================================================

const PUBLIC_AUTH_ENDPOINTS = [
  "/auth/register",
  "/auth/login",
  "/auth/verify-email",
  "/auth/resend-verification",
  "/auth/registration-phone",
  "/auth/send-phone-otp",
  "/auth/verify-phone",
  "/auth/refresh-token",
  "/auth/google",
  "/auth/forgot-password",
  "/auth/reset-password",
];

// ============================================================
// CHECK WHETHER REQUEST IS PUBLIC
// ============================================================

const isPublicAuthEndpoint = (url = "") => {
  return PUBLIC_AUTH_ENDPOINTS.some((endpoint) =>
    url.includes(endpoint)
  );
};

// ============================================================
// REQUEST INTERCEPTOR
// ============================================================
//
// JWT is only attached when an accessToken actually exists.
//
// Registration requests can therefore work without JWT.
//
// ============================================================

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");

    if (token) {
      config.headers = config.headers || {};

      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ============================================================
// RESPONSE INTERCEPTOR
// ============================================================
//
// Only authenticated requests should attempt token refresh.
//
// Public registration endpoints must simply return their
// original error to the calling component.
//
// ============================================================

api.interceptors.response.use(
  (response) => {
    return response;
  },

  async (error) => {
    const originalRequest = error.config;

    // ----------------------------------------------------------
    // No response / no request configuration
    // ----------------------------------------------------------

    if (!error.response || !originalRequest) {
      return Promise.reject(error);
    }

    const status = error.response.status;

    // ----------------------------------------------------------
    // Do NOT refresh JWT for public authentication endpoints
    // ----------------------------------------------------------

    if (
      status === 401 &&
      isPublicAuthEndpoint(originalRequest.url)
    ) {
      return Promise.reject(error);
    }

    // ----------------------------------------------------------
    // Only attempt refresh once
    // ----------------------------------------------------------

    if (
      status !== 401 ||
      originalRequest._retry
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    // ----------------------------------------------------------
    // Refresh access token
    // ----------------------------------------------------------

    try {
      const refreshResponse = await axios.post(
        `${API_BASE_URL}/auth/refresh-token`,
        {},
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const newAccessToken =
        refreshResponse?.data?.data?.accessToken;

      // --------------------------------------------------------
      // Refresh response did not contain a token
      // --------------------------------------------------------

      if (!newAccessToken) {
        throw new Error(
          "Refresh token response did not contain an access token."
        );
      }

      // --------------------------------------------------------
      // Save new token
      // --------------------------------------------------------

      localStorage.setItem(
        "accessToken",
        newAccessToken
      );

      // --------------------------------------------------------
      // Attach new token to original request
      // --------------------------------------------------------

      originalRequest.headers =
        originalRequest.headers || {};

      originalRequest.headers.Authorization =
        `Bearer ${newAccessToken}`;

      // --------------------------------------------------------
      // Retry original request
      // --------------------------------------------------------

      return api(originalRequest);
    } catch (refreshError) {
      // --------------------------------------------------------
      // Refresh failed
      // --------------------------------------------------------

      localStorage.removeItem("accessToken");

      // Don't redirect public requests.
      if (
        isPublicAuthEndpoint(
          originalRequest.url
        )
      ) {
        return Promise.reject(error);
      }

      // --------------------------------------------------------
      // Redirect authenticated users to login
      // --------------------------------------------------------

      window.location.href = "/login";

      return Promise.reject(refreshError);
    }
  }
);

export default api;
