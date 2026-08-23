import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    // ── References ────────────────────────────────────
    conversation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // ── Message content ───────────────────────────────
    type: {
      type: String,
      enum: ["text", "image", "file", "audio", "system"],
      default: "text",
    },
    content: {
      type: String,
      maxlength: [5000, "Message cannot exceed 5000 characters"],
      default: null,
    },

    // ── Attachments ───────────────────────────────────
    attachments: [
      {
        name: { type: String },
        url: { type: String },
        public_id: { type: String },
        size: { type: Number },
        type: { type: String },
      },
    ],

    // ── Read by ───────────────────────────────────────
    readBy: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        readAt: { type: Date, default: Date.now },
      },
    ],

    // ── Reply to ──────────────────────────────────────
    replyTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      default: null,
    },

    // ── Deleted ───────────────────────────────────────
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
    deletedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // ── Edited ────────────────────────────────────────
    isEdited: {
      type: Boolean,
      default: false,
    },
    editedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// ── Index ─────────────────────────────────────────────────
messageSchema.index({ conversation: 1, createdAt: -1 });
messageSchema.index({ sender: 1 });

const Message = mongoose.model("Message", messageSchema);

export default Message;