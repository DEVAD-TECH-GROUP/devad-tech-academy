import jwt from "jsonwebtoken";
import env from "../config/env.js";
import User from "../models/user/User.js";
import { chatSocket } from "./chatSocket.js";
import { notificationSocket } from "./notificationSocket.js";
import { liveClassSocket } from "./liveClassSocket.js";

export const initializeSockets = (io) => {
  // ── Auth middleware ───────────────────────────────────
  io.use(async (socket, next) => {
    try {
      const token =
        socket.handshake.auth.token ||
        socket.handshake.headers.authorization?.split(" ")[1];

      if (!token) {
        return next(new Error("Authentication required"));
      }

      const decoded = jwt.verify(token, env.JWT_SECRET);
      const user = await User.findById(decoded.id).select(
        "-password"
      );

      if (!user) {
        return next(new Error("User not found"));
      }

      if (user.status === "suspended") {
        return next(new Error("Account suspended"));
      }

      socket.user = user;
      next();
    } catch (error) {
      next(new Error("Invalid token"));
    }
  });

  // ── Connection ────────────────────────────────────────
  io.on("connection", (socket) => {
    console.log(`✅ Socket connected: ${socket.user.fullName}`);

    // ── Join user room ──────────────────────────────────
    socket.join(`user_${socket.user._id}`);

    // ── Join role room ──────────────────────────────────
    socket.join(`role_${socket.user.role}`);

    // ── Initialize socket handlers ──────────────────────
    chatSocket(io, socket);
    notificationSocket(io, socket);
    liveClassSocket(io, socket);

    // ── Disconnect ──────────────────────────────────────
    socket.on("disconnect", () => {
      console.log(`❌ Socket disconnected: ${socket.user.fullName}`);
    });
  });
};