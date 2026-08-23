import http from "http";
import { Server } from "socket.io";
import app from "./app.js";
import connectDB from "./config/db.js";
import env from "./config/env.js";
import { initializeSockets } from "./sockets/index.js";

// ── Create HTTP server ────────────────────────────────────
const server = http.createServer(app);

// ── Socket.io setup ───────────────────────────────────────
const io = new Server(server, {
  cors: {
    origin: env.CLIENT_URL,
    methods: ["GET", "POST"],
    credentials: true,
  },
  pingTimeout: 60000,
  pingInterval: 25000,
});

// ── Initialize sockets ────────────────────────────────────
initializeSockets(io);

// ── Make io accessible everywhere ────────────────────────
app.set("io", io);

// ── Start server ──────────────────────────────────────────
const startServer = async () => {
  try {
    // Connect to MongoDB first
    await connectDB();

    // Start listening
    server.listen(env.PORT, () => {
      console.log("─────────────────────────────────────");
      console.log(`✅ Server running in ${env.NODE_ENV} mode`);
      console.log(`✅ Port: ${env.PORT}`);
      console.log(`✅ Client URL: ${env.CLIENT_URL}`);
      console.log("─────────────────────────────────────");
    });

  } catch (error) {
    console.error(`❌ Server failed to start: ${error.message}`);
    process.exit(1);
  }
};

// ── Handle unhandled rejections ───────────────────────────
process.on("unhandledRejection", (err) => {
  console.error(`❌ Unhandled Rejection: ${err.message}`);
  server.close(() => {
    process.exit(1);
  });
});

// ── Handle uncaught exceptions ────────────────────────────
process.on("uncaughtException", (err) => {
  console.error(`❌ Uncaught Exception: ${err.message}`);
  process.exit(1);
});

// ── Graceful shutdown ─────────────────────────────────────
process.on("SIGTERM", () => {
  console.log("⚠️ SIGTERM received. Shutting down gracefully...");
  server.close(() => {
    console.log("✅ Server closed");
    process.exit(0);
  });
});

startServer();

export { io };