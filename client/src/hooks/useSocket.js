import { useEffect } from "react";
import useSocketStore from "../store/socketStore";
import useAuthStore from "../store/authStore";
import useNotificationStore from "../store/notificationStore";

export default function useSocket() {
  const { connect, disconnect, socket } = useSocketStore();
  const { token, user } = useAuthStore();
  const { addNew } = useNotificationStore();

  useEffect(() => {
    if (token && user) {
      const s = connect(token);

      s.on("new_notification", (notification) => {
        addNew(notification);
      });

      s.on("new_message", (message) => {
        // handled per page
      });

      return () => disconnect();
    }
  }, [token, user]);

  return { socket };
}
