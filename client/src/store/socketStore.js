import { create } from "zustand";
import { io } from "socket.io-client";

const useSocketStore = create((set, get) => ({
  socket: null,
  connected: false,

  connect: (token) => {
    const socket = io(
      import.meta.env.VITE_SOCKET_URL || "http://localhost:5000",
      {
        auth: { token },
        transports: ["websocket"],
        reconnectionAttempts: 5,
      }
    );

    socket.on("connect", () => set({ connected: true }));
    socket.on("disconnect", () => set({ connected: false }));

    set({ socket });
    return socket;
  },

  disconnect: () => {
    const { socket } = get();
    if (socket) { socket.disconnect(); set({ socket: null, connected: false }); }
  },
}));

export default useSocketStore;