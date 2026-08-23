import Message from "../models/communication/Message.js";
import Conversation from "../models/communication/Conversation.js";

export const chatSocket = (io, socket) => {
  // ── Join conversation ─────────────────────────────────
  socket.on("join_conversation", (conversationId) => {
    socket.join(`conversation_${conversationId}`);
  });

  // ── Leave conversation ────────────────────────────────
  socket.on("leave_conversation", (conversationId) => {
    socket.leave(`conversation_${conversationId}`);
  });

  // ── Send message ──────────────────────────────────────
  socket.on("send_message", async (data) => {
    try {
      const { conversationId, content, type = "text", replyTo = null } = data;

      // ── Save to DB ──────────────────────────────────
      const message = await Message.create({
        conversation: conversationId,
        sender: socket.user._id,
        type,
        content,
        replyTo,
        readBy: [{ user: socket.user._id }],
      });

      // ── Update conversation last message ────────────
      await Conversation.findByIdAndUpdate(conversationId, {
        lastMessage: message._id,
        lastMessageAt: new Date(),
        lastMessageText: content?.slice(0, 50),
      });

      // ── Populate and emit ───────────────────────────
      const populated = await Message.findById(message._id)
        .populate("sender", "firstName lastName avatar")
        .populate("replyTo");

      io.to(`conversation_${conversationId}`).emit(
        "new_message",
        populated
      );
    } catch (error) {
      socket.emit("error", { message: error.message });
    }
  });

  // ── Mark messages as read ─────────────────────────────
  socket.on("mark_read", async (data) => {
    try {
      const { conversationId } = data;

      await Message.updateMany(
        {
          conversation: conversationId,
          "readBy.user": { $ne: socket.user._id },
        },
        {
          $push: {
            readBy: {
              user: socket.user._id,
              readAt: new Date(),
            },
          },
        }
      );

      io.to(`conversation_${conversationId}`).emit("messages_read", {
        conversationId,
        userId: socket.user._id,
      });
    } catch (error) {
      socket.emit("error", { message: error.message });
    }
  });

  // ── Typing indicators ─────────────────────────────────
  socket.on("typing_start", (conversationId) => {
    socket.to(`conversation_${conversationId}`).emit("user_typing", {
      userId: socket.user._id,
      name: socket.user.fullName,
    });
  });

  socket.on("typing_stop", (conversationId) => {
    socket.to(`conversation_${conversationId}`).emit("user_stopped_typing", {
      userId: socket.user._id,
    });
  });

  // ── Delete message ────────────────────────────────────
  socket.on("delete_message", async (data) => {
    try {
      const { messageId, conversationId } = data;

      await Message.findByIdAndUpdate(messageId, {
        isDeleted: true,
        deletedAt: new Date(),
        deletedBy: socket.user._id,
        content: null,
      });

      io.to(`conversation_${conversationId}`).emit("message_deleted", {
        messageId,
      });
    } catch (error) {
      socket.emit("error", { message: error.message });
    }
  });
};