import { create } from "zustand";
import api from "../services/api";

const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,

  fetch: async (role = "student") => {
    try {
      const { data } = await api.get(`/${role}/notifications`);
      set({
        notifications: data.data?.data || [],
        unreadCount: data.data?.unreadCount || 0,
      });
    } catch {}
  },

  markRead: async (id, role = "student") => {
    try {
      await api.put(`/${role}/notifications/${id}/read`);
      set((s) => ({
        notifications: s.notifications.map((n) =>
          n._id === id ? { ...n, isRead: true } : n
        ),
        unreadCount: Math.max(0, s.unreadCount - 1),
      }));
    } catch {}
  },

  markAllRead: async (role = "student") => {
    try {
      await api.put(`/${role}/notifications/read-all`);
      set((s) => ({
        notifications: s.notifications.map((n) => ({ ...n, isRead: true })),
        unreadCount: 0,
      }));
    } catch {}
  },

  addNew: (notification) =>
    set((s) => ({
      notifications: [notification, ...s.notifications],
      unreadCount: s.unreadCount + 1,
    })),
}));

export default useNotificationStore;