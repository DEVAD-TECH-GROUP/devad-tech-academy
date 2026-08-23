export const liveClassSocket = (io, socket) => {
  // ── Join live class room ──────────────────────────────
  socket.on("join_live_class", (liveClassId) => {
    socket.join(`live_class_${liveClassId}`);

    socket.to(`live_class_${liveClassId}`).emit("user_joined_live", {
      userId: socket.user._id,
      name: socket.user.fullName,
      role: socket.user.role,
    });

    console.log(
      `${socket.user.fullName} joined live class: ${liveClassId}`
    );
  });

  // ── Leave live class room ─────────────────────────────
  socket.on("leave_live_class", (liveClassId) => {
    socket.leave(`live_class_${liveClassId}`);

    socket.to(`live_class_${liveClassId}`).emit("user_left_live", {
      userId: socket.user._id,
      name: socket.user.fullName,
    });
  });

  // ── Raise hand ────────────────────────────────────────
  socket.on("raise_hand", (liveClassId) => {
    socket.to(`live_class_${liveClassId}`).emit("hand_raised", {
      userId: socket.user._id,
      name: socket.user.fullName,
    });
  });

  // ── Lower hand ────────────────────────────────────────
  socket.on("lower_hand", (liveClassId) => {
    socket.to(`live_class_${liveClassId}`).emit("hand_lowered", {
      userId: socket.user._id,
    });
  });

  // ── Chat message in live class ────────────────────────
  socket.on("live_chat_message", (data) => {
    const { liveClassId, message } = data;

    io.to(`live_class_${liveClassId}`).emit("new_live_chat", {
      userId: socket.user._id,
      name: socket.user.fullName,
      role: socket.user.role,
      message,
      sentAt: new Date(),
    });
  });

  // ── Instructor starts class ───────────────────────────
  socket.on("start_live_class", (liveClassId) => {
    if (socket.user.role !== "instructor" && socket.user.role !== "super_admin") {
      return socket.emit("error", { message: "Not authorized" });
    }

    io.to(`live_class_${liveClassId}`).emit("live_class_started", {
      liveClassId,
      startedAt: new Date(),
    });
  });

  // ── Instructor ends class ─────────────────────────────
  socket.on("end_live_class", (liveClassId) => {
    if (socket.user.role !== "instructor" && socket.user.role !== "super_admin") {
      return socket.emit("error", { message: "Not authorized" });
    }

    io.to(`live_class_${liveClassId}`).emit("live_class_ended", {
      liveClassId,
      endedAt: new Date(),
    });
  });

  // ── Poll ──────────────────────────────────────────────
  socket.on("send_poll", (data) => {
    const { liveClassId, question, options } = data;

    if (socket.user.role !== "instructor" && socket.user.role !== "super_admin") {
      return socket.emit("error", { message: "Not authorized" });
    }

    io.to(`live_class_${liveClassId}`).emit("new_poll", {
      question,
      options,
      createdAt: new Date(),
    });
  });

  // ── Poll answer ───────────────────────────────────────
  socket.on("submit_poll_answer", (data) => {
    const { liveClassId, answer } = data;

    socket.to(`live_class_${liveClassId}`).emit("poll_answer_submitted", {
      userId: socket.user._id,
      answer,
    });
  });
};