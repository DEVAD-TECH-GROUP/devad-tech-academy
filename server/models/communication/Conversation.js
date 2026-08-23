import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    // ── Participants ──────────────────────────────────
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],

    // ── Type ──────────────────────────────────────────
    type: {
      type: String,
      enum: ["direct", "group"],
      default: "direct",
    },

    // ── Group info ────────────────────────────────────
    name: {
      type: String,
      default: null,
    },
    groupAvatar: {
      type: String,
      default: null,
    },
    groupAdmin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // ── Last message ──────────────────────────────────
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      default: null,
    },
    lastMessageAt: {
      type: Date,
      default: null,
    },
    lastMessageText: {
      type: String,
      default: null,
    },

    // ── Unread counts ─────────────────────────────────
    unreadCounts: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        count: { type: Number, default: 0 },
      },
    ],

    // ── Status ────────────────────────────────────────
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// ── Index ─────────────────────────────────────────────────
conversationSchema.index({ participants: 1 });
conversationSchema.index({ lastMessageAt: -1 });
conversationSchema.index({ type: 1 });

const Conversation = mongoose.model("Conversation", conversationSchema);

export default Conversation;