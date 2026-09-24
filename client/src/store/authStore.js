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

          const { user, accessToken } =
            data.data;

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
      //
      // IMPORTANT:
      // Registration does NOT authenticate the user.
      //
      // Backend should return something like:
      //
      // {
      //   success: true,
      //   data: {
      //     registration: {
      //       userId,
      //       email,
      //       emailVerified: false,
      //       phoneVerified: false
      //     }
      //   }
      // }
      //
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

          /*
           * DO NOT:
           *
           * localStorage.setItem("accessToken", ...)
           *
           * DO NOT:
           *
           * set({
           *   user,
           *   token,
           *   isAuthenticated: true
           * })
           *
           * The user has NOT completed registration yet.
           */

          set({
            isLoading: false,
            error: null,
          });

          return data;
        } catch (err) {
          const message =
            err.response?.data ||
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
      //
      // This is for a user who has verified email but
      // has not completed registration yet.
      //
      // No JWT is required.
      //
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

          /*
           * IMPORTANT:
           *
           * Even after this succeeds, your backend should
           * NOT automatically create a JWT if the intended
           * flow is:
           *
           * registration complete → login page.
           *
           * The frontend therefore does not save a token here.
           */

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

      googleLogin: async (
        credential
      ) => {
        set({
          isLoading: true,
          error: null,
        });

        try {
          const { data } =
            await api.post(
              "/auth/google",
              {
                credential,
              }
            );

          /*
           * Google login is different from manual
           * registration.
           *
           * If backend returns a JWT immediately,
           * save it.
           *
           * If backend requires phone verification first,
           * your backend should return the appropriate
           * verification state instead.
           */

          const responseData =
            data?.data || data;

          const accessToken =
            responseData?.accessToken;

          const user =
            responseData?.user;

          if (accessToken) {
            localStorage.setItem(
              "accessToken",
              accessToken
            );
          }

          set({
            user: user || null,
            token:
              accessToken || null,
            isAuthenticated:
              Boolean(accessToken),
            isLoading: false,
            error: null,
          });

          return responseData;
        } catch (err) {
          const message =
            err.response?.data?.message ||
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
          await api.post(
            "/auth/logout"
          );
        } catch {
          // Logout locally even if
          // backend request fails.
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
          /*
           * Don't immediately destroy the token here
           * for every possible error. But if /me fails
           * because authentication is invalid, your API
           * interceptor can handle the token expiration.
           */

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
