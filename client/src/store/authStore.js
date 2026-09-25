import { create } from "zustand";
import { persist } from "zustand/middleware";

import api from "../api/Api";

export const useAuthStore = create(
  persist(
    (set) => ({
      // ============================================================
      // AUTH STATE
      // ============================================================

      user: null,
      token: null,

      isAuthenticated: false,

      // True while an API authentication request is running
      isLoading: false,

      // True after the stored session has been checked
      authInitialized: false,

      error: null,

      // ============================================================
      // INITIALIZE AUTHENTICATION
      // ============================================================

      initializeAuth: async () => {
        const currentState = useAuthStore.getState();

        // Prevent duplicate initialization requests
        if (
          currentState.authInitialized ||
          currentState.isLoading
        ) {
          return;
        }

        set({
          isLoading: true,
          error: null,
          authInitialized: false,
        });

        try {
          // --------------------------------------------------------
          // GET STORED ACCESS TOKEN
          // --------------------------------------------------------

          const token =
            localStorage.getItem("accessToken");

          // --------------------------------------------------------
          // NO TOKEN
          // --------------------------------------------------------

          if (!token) {
            set({
              user: null,
              token: null,
              isAuthenticated: false,
              isLoading: false,
              authInitialized: true,
              error: null,
            });

            return null;
          }

          // --------------------------------------------------------
          // VALIDATE TOKEN WITH BACKEND
          // --------------------------------------------------------

          const { data } =
            await api.get("/auth/me");

          const response =
            data?.data || {};

          const user =
            response?.user ||
            data?.user ||
            response ||
            null;

          // --------------------------------------------------------
          // INVALID USER RESPONSE
          // --------------------------------------------------------

          if (
            !user ||
            (!user._id && !user.id)
          ) {
            throw new Error(
              "Authentication session is invalid."
            );
          }

          // --------------------------------------------------------
          // SESSION IS VALID
          // --------------------------------------------------------

          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
            authInitialized: true,
            error: null,
          });

          console.log(
            "[DEVAD AUTH] Authentication session restored:",
            {
              userId:
                user?._id ||
                user?.id ||
                null,
              email:
                user?.email ||
                null,
              role:
                user?.role ||
                null,
            }
          );

          return user;
        } catch (err) {
          // --------------------------------------------------------
          // SESSION IS INVALID
          // --------------------------------------------------------

          console.warn(
            "[DEVAD AUTH] Stored authentication session is invalid. Clearing session."
          );

          localStorage.removeItem(
            "accessToken"
          );

          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            authInitialized: true,
            error: null,
          });

          return null;
        }
      },

      // ============================================================
      // LOGIN
      // ============================================================

      login: async ({
        email,
        password,
      }) => {
        set({
          isLoading: true,
          error: null,
        });

        try {
          const normalizedEmail =
            typeof email === "string"
              ? email.trim().toLowerCase()
              : "";

          const normalizedPassword =
            typeof password === "string"
              ? password
              : "";

          if (!normalizedEmail) {
            throw new Error(
              "Email is required."
            );
          }

          if (!normalizedPassword) {
            throw new Error(
              "Password is required."
            );
          }

          console.log(
            "[DEVAD LOGIN] Sending login request:",
            {
              email: normalizedEmail,
              hasPassword:
                Boolean(normalizedPassword),
            }
          );

          const { data } =
            await api.post(
              "/auth/login",
              {
                email: normalizedEmail,
                password:
                  normalizedPassword,
              }
            );

          console.log(
            "[DEVAD LOGIN] Login response received:",
            {
              success: data?.success,
              hasData:
                Boolean(data?.data),

              hasAccessToken:
                Boolean(
                  data?.data?.accessToken ||
                  data?.accessToken
                ),

              requiresPhone:
                data?.data
                  ?.requiresPhone === true ||
                data?.requiresPhone === true,

              hasRegistrationToken:
                Boolean(
                  data?.data
                    ?.registrationToken ||
                  data?.registrationToken
                ),
            }
          );

          const response =
            data?.data || {};

          const user =
            response?.user ||
            data?.user ||
            null;

          const accessToken =
            response?.accessToken ||
            data?.accessToken ||
            null;

          const registrationToken =
            response?.registrationToken ||
            data?.registrationToken ||
            null;

          const requiresPhone =
            response?.requiresPhone ===
              true ||
            data?.requiresPhone ===
              true ||
            user?.isPhoneVerified ===
              false;

          // --------------------------------------------------------
          // PHONE VERIFICATION REQUIRED
          // --------------------------------------------------------

          if (requiresPhone) {
            console.log(
              "[DEVAD LOGIN] Phone verification required:",
              {
                userId:
                  user?._id ||
                  user?.id ||
                  null,

                email:
                  user?.email ||
                  normalizedEmail,

                hasRegistrationToken:
                  Boolean(
                    registrationToken
                  ),
              }
            );

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
          // NORMAL LOGIN
          // --------------------------------------------------------

          if (!accessToken) {
            throw new Error(
              "Login succeeded but no access token was returned."
            );
          }

          localStorage.setItem(
            "accessToken",
            accessToken
          );

          set({
            user,
            token: accessToken,
            isAuthenticated: true,
            isLoading: false,
            authInitialized: true,
            error: null,
          });

          return {
            ...data,

            requiresPhone: false,

            registrationToken: null,

            user,

            accessToken,
          };
        } catch (err) {
          const message =
            err?.response?.data?.message ||
            err?.message ||
            "Login failed.";

          console.error(
            "[DEVAD LOGIN] Login failed:",
            {
              message: err?.message,

              status:
                err?.response?.status,

              responseMessage:
                err?.response?.data?.message,

              responseData:
                err?.response?.data,
            }
          );

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

      register: async (
        payload
      ) => {
        set({
          isLoading: true,
          error: null,
        });

        try {
          const { data } =
            await api.post(
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
            "Registration failed.";

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
            err?.response?.data?.message ||
            err?.message ||
            "Email verification failed.";

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
            err?.response?.data?.message ||
            err?.message ||
            "Unable to resend verification code.";

          set({
            isLoading: false,
            error: message,
          });

          throw err;
        }
      },

      // ============================================================
      // FORGOT PASSWORD
      // ============================================================

      forgotPassword: async (
        email
      ) => {
        set({
          isLoading: true,
          error: null,
        });

        try {
          const normalizedEmail =
            typeof email === "string"
              ? email.trim().toLowerCase()
              : "";

          if (!normalizedEmail) {
            throw new Error(
              "Email is required."
            );
          }

          console.log(
            "[DEVAD PASSWORD] Requesting password reset:",
            {
              email: normalizedEmail,
            }
          );

          const { data } =
            await api.post(
              "/authpassword/forgot-password",
              {
                email:
                  normalizedEmail,
              }
            );

          set({
            isLoading: false,
            error: null,
          });

          console.log(
            "[DEVAD PASSWORD] Password reset request completed."
          );

          return data;
        } catch (err) {
          const message =
            err?.response?.data?.message ||
            err?.message ||
            "Unable to send password reset email.";

          console.error(
            "[DEVAD PASSWORD] Forgot password failed:",
            {
              message: err?.message,
              status:
                err?.response?.status,
              responseMessage:
                err?.response?.data
                  ?.message,
            }
          );

          set({
            isLoading: false,
            error: message,
          });

          throw err;
        }
      },

      // ============================================================
      // RESET PASSWORD
      // ============================================================

      resetPassword: async (
        token,
        password
      ) => {
        set({
          isLoading: true,
          error: null,
        });

        try {
          if (!token) {
            throw new Error(
              "Password reset token is missing."
            );
          }

          if (!password) {
            throw new Error(
              "New password is required."
            );
          }

          console.log(
            "[DEVAD PASSWORD] Submitting password reset."
          );

          const { data } =
            await api.post(
              "/authpassword/reset-password",
              {
                token,
                password,
              }
            );

          set({
            isLoading: false,
            error: null,
          });

          console.log(
            "[DEVAD PASSWORD] Password reset completed successfully."
          );

          return data;
        } catch (err) {
          const message =
            err?.response?.data?.message ||
            err?.message ||
            "Unable to reset password.";

          console.error(
            "[DEVAD PASSWORD] Reset password failed:",
            {
              message: err?.message,
              status:
                err?.response?.status,
              responseMessage:
                err?.response?.data
                  ?.message,
            }
          );

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
            err?.response?.data?.message ||
            err?.message ||
            "Unable to save phone number.";

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
            err?.response?.data?.message ||
            err?.message ||
            "Unable to send phone verification code.";

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

          const response =
            data?.data || {};

          const user =
            response?.user ||
            data?.user ||
            null;

          const accessToken =
            response?.accessToken ||
            data?.accessToken ||
            null;

          // --------------------------------------------------------
          // PHONE VERIFICATION COMPLETED
          // AND SERVER RETURNED LOGIN TOKEN
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
              authInitialized: true,
              error: null,
            });

            console.log(
              "[DEVAD AUTH] Phone verification completed successfully:",
              {
                userId:
                  user?._id ||
                  user?.id ||
                  null,
                email:
                  user?.email ||
                  null,
              }
            );

            return {
              ...data,

              user,

              accessToken,

              phoneVerified: true,
            };
          }

          // --------------------------------------------------------
          // PHONE VERIFIED BUT NO LOGIN TOKEN
          // --------------------------------------------------------

          set({
            isLoading: false,
            error: null,
          });

          return {
            ...data,

            user,

            phoneVerified: true,
          };
        } catch (err) {
          const message =
            err?.response?.data?.message ||
            err?.message ||
            "Phone verification failed.";

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

      googleLogin: async (
        credential
      ) => {
        if (!credential) {
          const error =
            new Error(
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
          console.log(
            "[DEVAD GOOGLE] Sending Google authentication request."
          );

          const { data } =
            await api.post(
              "/authgoogle/google",
              {
                credential,
              }
            );

          const response =
            data?.data || {};

          const accessToken =
            response?.accessToken ||
            data?.accessToken ||
            null;

          const user =
            response?.user ||
            data?.user ||
            null;

          const registrationToken =
            response?.registrationToken ||
            data?.registrationToken ||
            null;

          const requiresPhone =
            response?.requiresPhone ===
              true ||
            data?.requiresPhone ===
              true ||
            Boolean(
              registrationToken
            ) ||
            user?.isPhoneVerified ===
              false;

          // --------------------------------------------------------
          // GOOGLE ACCOUNT REQUIRES PHONE
          // --------------------------------------------------------

          if (requiresPhone) {
            console.log(
              "[DEVAD GOOGLE] Google authentication successful. Phone verification required:",
              {
                userId:
                  user?._id ||
                  user?.id ||
                  null,
                email:
                  user?.email ||
                  null,
                hasRegistrationToken:
                  Boolean(
                    registrationToken
                  ),
              }
            );

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
          // FULL GOOGLE LOGIN
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
              authInitialized: true,
              error: null,
            });

            console.log(
              "[DEVAD GOOGLE] Google login successful:",
              {
                userId:
                  user?._id ||
                  user?.id ||
                  null,
                email:
                  user?.email ||
                  null,
                role:
                  user?.role ||
                  null,
              }
            );

            return {
              ...data,

              requiresPhone: false,

              user,

              accessToken,
            };
          }

          throw new Error(
            "Google authentication succeeded but the server returned an invalid response."
          );
        } catch (err) {
          const message =
            err?.response?.data?.message ||
            err?.message ||
            "Google authentication failed.";

          console.error(
            "[DEVAD GOOGLE] Authentication failed:",
            {
              message:
                err?.message,
              status:
                err?.response?.status,
              responseMessage:
                err?.response?.data
                  ?.message,
              code:
                err?.code,
            }
          );

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
          // Local logout must still happen
        }

        localStorage.removeItem(
          "accessToken"
        );

        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
          authInitialized: true,
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
            data?.data?.user ||
            data?.user ||
            data?.data ||
            null;

          if (
            !user ||
            (!user._id &&
              !user.id)
          ) {
            throw new Error(
              "No valid user data returned."
            );
          }

          const token =
            localStorage.getItem(
              "accessToken"
            );

          set({
            user,
            token,
            isAuthenticated: true,
            authInitialized: true,
            error: null,
          });

          return user;
        } catch (err) {
          localStorage.removeItem(
            "accessToken"
          );

          set({
            user: null,
            token: null,
            isAuthenticated: false,
            authInitialized: true,
            error: null,
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

    // ==============================================================
    // ZUSTAND PERSIST CONFIGURATION
    // ==============================================================

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

// Named export + default export.
// This supports BOTH:
//
// import { useAuthStore } from "../../store/authStore";
//
// and:
//
// import useAuthStore from "../../store/authStore";

export default useAuthStore;