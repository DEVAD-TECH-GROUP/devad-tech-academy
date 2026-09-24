import { createContext, useContext, useEffect } from "react";
import useNotificationStore from "../store/notificationStore";
import useAuthStore from "../store/authStore";

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const { user } = useAuthStore();
  const { notifications, unreadCount, fetch, markRead, markAllRead, addNew } =
    useNotificationStore();

  useEffect(() => {
    if (user?.role) fetch(user.role);
  }, [user]);

  return (
    <NotificationContext.Provider
      value={{ notifications, unreadCount, markRead, markAllRead, addNew }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotificationContext = () => useContext(NotificationContext);