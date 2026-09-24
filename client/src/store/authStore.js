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
          const { data } = await api.post(
            "/auth/login",
            {
              email,
              password,
            }
          );

          const {
            user,
            accessToken,
          } = data.data;

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
            err.response?.data?.message ||
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
            err.response?.data?.message ||
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

      verifyEmail: async (
        email,
        token
      ) => {
        set({
          isLoading: true,
          error: null,
        });

        try {
          const { data } =
            await api.post(
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
            err.response?.data?.message ||
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

      resendVerification: async (
        email
      ) => {
        set({
          isLoading: true,
          error: null,
        });

        try {
          const { data } =
            await api.post(
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
            err.response?.data?.message ||
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
          const { data } =
            await api.post(
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
            err.response?.data?.message ||
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

      sendPhoneOTP: async (
        registrationToken
      ) => {
        set({
          isLoading: true,
          error: null,
        });

        try {
          const { data } =
            await api.post(
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
            err.response?.data?.message ||
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
          const { data } =
            await api.post(
              "/auth/verify-phone",
              {
                registrationToken,
                otpId,
                code,
              }
            );

          set({
            isLoading: false,
            error: null,
          });

          return data;
        } catch (err) {
          const message =
            err.response?.data?.message ||
            "Phone verification failed";

          set({
            isLoading: false,
            error: message,
          });

          throw err;
        }
      },

      // ============================================================
      // GOOGLE LOGIN
      // ============================================================
      //
      // Google authentication is handled by Passport.
      //
      // We DO NOT send a Google credential through Axios.
      //
      // ============================================================

      googleLogin: () => {
        const API_BASE_URL =
          import.meta.env.VITE_API_URL ||
          "https://devad-academy-backend.onrender.com/api";

        window.location.href =
          `${API_BASE_URL}/auth/google`;
      },

      // ============================================================
      // SET GOOGLE AUTH
      // ============================================================

      setGoogleAuth: (
        accessToken,
        user = null
      ) => {
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
      },

      // ============================================================
      // LOGOUT
      // ============================================================

      logout: async () => {
        try {
          await api.post(
            "/auth/logout"
          );
        } catch {
          // Continue with local logout.
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

        window.location.href =
          "/login";
      },

      // ============================================================
      // GET CURRENT USER
      // ============================================================

      getMe: async () => {
        try {
          const { data } =
            await api.get(
              "/auth/me"
            );

          const user =
            data.data;

          set({
            user,
            isAuthenticated: true,
            error: null,
          });

          return user;
        } catch (err) {
          set({
            user: null,
            isAuthenticated: false,
          });

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
