import { create } from "zustand";
import { persist } from "zustand/middleware";

import api from "../api/Api";

const useAuthStore = create(
  persist(
    (set) => ({
      // ============================================================
      // AUTH STATE
      // ============================================================

      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // ============================================================
      // LOGIN
      // ============================================================

      login: async (email, password) => {
        set({
          isLoading: true,
          error: null,
        });

        try {
          const { data } = await api.post("/auth/login", {
            email,
            password,
          });

          const response = data?.data || {};

          const user = response?.user || null;
          const accessToken =
            response?.accessToken || null;

          if (!accessToken) {
            throw new Error(
              "Login succeeded but no access token was returned."
            );
          }

          // Store token for Axios interceptor
          localStorage.setItem(
            "accessToken",
            accessToken
          );

          set({
            user,
            token: accessToken,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          return user;
        } catch (err) {
          const message =
            err?.response?.data?.message ||
            err?.message ||
            "Login failed";

          set({
            isLoading: false,
            error: message,
          });

          throw err;
        }
      },

      // ============================================================
      // REGISTER
      // ============================================================

      register: async (payload) => {
        set({
          isLoading: true,
          error: null,
        });

        try {
          const { data } = await api.post(
            "/auth/register",
            payload
          );

          set({
            isLoading: false,
            error: null,
          });

          return data;
        } catch (err) {
          const message =
            err?.response?.data?.message ||
            err?.message ||
            "Registration failed";

          set({
            isLoading: false,
            error: message,
          });

          throw err;
        }
      },

      // ============================================================
      // VERIFY EMAIL
      // ============================================================

      verifyEmail: async (email, token) => {
        set({
          isLoading: true,
          error: null,
        });

        try {
          const { data } = await api.post(
            "/auth/verify-email",
            {
              email,
              token,
            }
          );

          set({
            isLoading: false,
            error: null,
          });

          return data;
        } catch (err) {
          const message =
            err?.response?.data?.message ||
            err?.message ||
            "Email verification failed";

          set({
            isLoading: false,
            error: message,
          });

          throw err;
        }
      },

      // ============================================================
      // RESEND EMAIL VERIFICATION
      // ============================================================

      resendVerification: async (email) => {
        set({
          isLoading: true,
          error: null,
        });

        try {
          const { data } = await api.post(
            "/auth/resend-verification",
            {
              email,
            }
          );

          set({
            isLoading: false,
            error: null,
          });

          return data;
        } catch (err) {
          const message =
            err?.response?.data?.message ||
            err?.message ||
            "Unable to resend verification code";

          set({
            isLoading: false,
            error: message,
          });

          throw err;
        }
      },

      // ============================================================
      // UPDATE REGISTRATION PHONE
      // ============================================================

      updateRegistrationPhone: async (
        registrationToken,
        phone
      ) => {
        set({
          isLoading: true,
          error: null,
        });

        try {
          const { data } = await api.post(
            "/auth/registration-phone",
            {
              registrationToken,
              phone,
            }
          );

          set({
            isLoading: false,
            error: null,
          });

          return data;
        } catch (err) {
          const message =
            err?.response?.data?.message ||
            err?.message ||
            "Unable to save phone number";

          set({
            isLoading: false,
            error: message,
          });

          throw err;
        }
      },

      // ============================================================
      // SEND PHONE OTP
      // ============================================================

      sendPhoneOTP: async (registrationToken) => {
        set({
          isLoading: true,
          error: null,
        });

        try {
          const { data } = await api.post(
            "/auth/send-phone-otp",
            {
              registrationToken,
            }
          );

          set({
            isLoading: false,
            error: null,
          });

          return data;
        } catch (err) {
          const message =
            err?.response?.data?.message ||
            err?.message ||
            "Unable to send phone verification code";

          set({
            isLoading: false,
            error: message,
          });

          throw err;
        }
      },

      // ============================================================
      // VERIFY PHONE
      // ============================================================

      verifyPhone: async (
        registrationToken,
        otpId,
        code
      ) => {
        set({
          isLoading: true,
          error: null,
        });

        try {
          const { data } = await api.post(
            "/auth/verify-phone",
            {
              registrationToken,
              otpId,
              code,
            }
          );

          /*
           * Expected backend response after successful
           * phone verification:
           *
           * {
           *   success: true,
           *   data: {
           *     user,
           *     accessToken
           *   }
           * }
           */

          const response = data?.data || {};

          const user = response?.user || null;
          const accessToken =
            response?.accessToken || null;

          // If phone verification completes the
          // registration and backend returns a token,
          // authenticate the user immediately.
          if (accessToken) {
            localStorage.setItem(
              "accessToken",
              accessToken
            );

            set({
              user,
              token: accessToken,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });

            return data;
          }

          set({
            isLoading: false,
            error: null,
          });

          return data;
        } catch (err) {
          const message =
            err?.response?.data?.message ||
            err?.message ||
            "Phone verification failed";

          set({
            isLoading: false,
            error: message,
          });

          throw err;
        }
      },

      // ============================================================
      // GOOGLE LOGIN / REGISTRATION
      // ============================================================
      //
      // This uses:
      //
      // @react-oauth/google
      //
      // GoogleLogin returns a credential.
      //
      // We send that credential to our backend.
      //
      // Backend:
      //
      // POST /auth/google
      //
      // The backend verifies the Google credential using
      // GOOGLE_CLIENT_ID.
      //
      // ============================================================

      googleLogin: async (credential) => {
        if (!credential) {
          const error = new Error(
            "Google credential is missing."
          );

          set({
            isLoading: false,
            error: error.message,
          });

          throw error;
        }

        set({
          isLoading: true,
          error: null,
        });

        try {
          const { data } = await api.post(
            "/authgoogle/google",
            {
              credential,
            }
          );

          /*
           * The backend can return either:
           *
           * A) Registration needs phone verification
           *
           * {
           *   success: true,
           *   data: {
           *     requiresPhone: true,
           *     registrationToken: "...",
           *     user: {...}
           *   }
           * }
           *
           * OR
           *
           * B) User is completely authenticated
           *
           * {
           *   success: true,
           *   data: {
           *     user: {...},
           *     accessToken: "..."
           *   }
           * }
           */

          const response = data?.data || {};

          const accessToken =
            response?.accessToken || null;

          const user =
            response?.user || null;

          const registrationToken =
            response?.registrationToken ||
            null;

          const requiresPhone =
            response?.requiresPhone === true ||
            Boolean(registrationToken);

          // --------------------------------------------------------
          // CASE 1:
          // Google authentication requires phone verification.
          // --------------------------------------------------------

          if (requiresPhone) {
            set({
              isLoading: false,
              error: null,
            });

            return {
              ...data,
              requiresPhone: true,
              registrationToken,
              user,
            };
          }

          // --------------------------------------------------------
          // CASE 2:
          // Backend fully authenticated the user.
          // --------------------------------------------------------

          if (accessToken) {
            localStorage.setItem(
              "accessToken",
              accessToken
            );

            set({
              user,
              token: accessToken,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });

            return {
              ...data,
              requiresPhone: false,
              user,
              accessToken,
            };
          }

          // --------------------------------------------------------
          // Unexpected response
          // --------------------------------------------------------

          throw new Error(
            "Google authentication succeeded but the server returned an invalid response."
          );
        } catch (err) {
          const message =
            err?.response?.data?.message ||
            err?.message ||
            "Google authentication failed";

          set({
            isLoading: false,
            error: message,
          });

          throw err;
        }
      },

      // ============================================================
      // LOGOUT
      // ============================================================

      logout: async () => {
        try {
          await api.post("/auth/logout");
        } catch {
          // Even if server logout fails,
          // clear the local authentication state.
        }

        localStorage.removeItem(
          "accessToken"
        );

        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });

        window.location.href = "/login";
      },

      // ============================================================
      // GET CURRENT USER
      // ============================================================

      getMe: async () => {
        try {
          const { data } = await api.get(
            "/auth/me"
          );

          const user =
            data?.data?.user ||
            data?.data ||
            null;

          if (!user) {
            throw new Error(
              "No user data returned."
            );
          }

          set({
            user,
            isAuthenticated: true,
            error: null,
          });

          return user;
        } catch (err) {
          set({
            user: null,
            token: null,
            isAuthenticated: false,
          });

          localStorage.removeItem(
            "accessToken"
          );

          throw err;
        }
      },

      // ============================================================
      // UPDATE USER LOCALLY
      // ============================================================

      updateUser: (updates) =>
        set((state) => ({
          user: state.user
            ? {
                ...state.user,
                ...updates,
              }
            : null,
        })),

      // ============================================================
      // CLEAR ERROR
      // ============================================================

      clearError: () =>
        set({
          error: null,
        }),
    }),

    {
      name: "devad-auth",

      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated:
          state.isAuthenticated,
      }),
    }
  )
);

export default useAuthStore;
