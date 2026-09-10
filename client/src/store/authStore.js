import { create } from "zustand";
import { persist } from "zustand/middleware";
import api from "../api/Api";


const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await api.post("/auth/login", { email, password });
          const { user, accessToken } = data.data;
          localStorage.setItem("accessToken", accessToken);
          set({ user, token: accessToken, isAuthenticated: true, isLoading: false });
          return user;
        } catch (err) {
          set({ isLoading: false, error: err.response?.data?.message });
          throw err;
        }
      },

      register: async (payload) => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await api.post("/auth/register", payload);
          const { user, accessToken } = data.data;
          localStorage.setItem("accessToken", accessToken);
          set({ user, token: accessToken, isAuthenticated: true, isLoading: false });
          return user;
        } catch (err) {
          set({ isLoading: false, error: err.response?.data?.message });
          throw err;
        }
      },

      logout: async () => {
        try { await api.post("/auth/logout"); } catch {}
        localStorage.clear();
        set({ user: null, token: null, isAuthenticated: false });
        window.location.href = "/login";
      },

      getMe: async () => {
        try {
          const { data } = await api.get("/auth/me");
          set({ user: data.data, isAuthenticated: true });
          return data.data;
        } catch {
          set({ user: null, isAuthenticated: false });
        }
      },

      updateUser: (updates) =>
        set((s) => ({ user: { ...s.user, ...updates } })),
    }),
    {
      name: "devad-auth",
      partialize: (s) => ({
        user: s.user,
        token: s.token,
        isAuthenticated: s.isAuthenticated,
      }),
    }
  )
);

export default useAuthStore;