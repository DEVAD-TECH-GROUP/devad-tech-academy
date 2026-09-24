import { createContext, useContext, useEffect, useRef } from "react";
import useSocketStore from "../store/socketStore";
import useAuthStore from "../store/authStore";
import useNotificationStore from "../store/notificationStore";

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { connect, disconnect, socket } = useSocketStore();
  const { token, user } = useAuthStore();
  const { addNew } = useNotificationStore();
  const connected = useRef(false);

  useEffect(() => {
    if (token && user && !connected.current) {
      const s = connect(token);
      connected.current = true;

      s.on("new_notification", (notification) => {
        addNew(notification);
      });

      s.on("connect", () => {
        console.log("✅ Socket connected");
      });

      s.on("disconnect", () => {
        console.log("❌ Socket disconnected");
        connected.current = false;
      });
    }

    return () => {
      if (!token) {
        disconnect();
        connected.current = false;
      }
    };
  }, [token, user]);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocketContext = () => useContext(SocketContext);
