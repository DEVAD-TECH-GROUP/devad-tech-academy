import { useEffect } from "react";
import useNotificationStore from "../store/notificationStore";
import useAuthStore from "../store/authStore";

export default function useNotifications() {
  const { user } = useAuthStore();
  const { notifications, unreadCount, fetch, markRead, markAllRead, addNew } =
    useNotificationStore();

  useEffect(() => {
    if (user) fetch(user.role);
  }, [user]);

  return { notifications, unreadCount, markRead, markAllRead, addNew };
}
