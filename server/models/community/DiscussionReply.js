import mongoose from "mongoose";

const discussionReplySchema = new mongoose.Schema(
  {
    // ── References ────────────────────────────────────
    discussion: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Discussion",
      required: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // ── Reply to another reply ────────────────────────
    parentReply: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DiscussionReply",
      default: null,
    },

    // ── Content ───────────────────────────────────────
    content: {
      type: String,
      required: [true, "Reply content is required"],
      maxlength: [3000, "Content cannot exceed 3000 characters"],
    },

    // ── Attachments ───────────────────────────────────
    attachments: [
      {
        name: { type: String },
        url: { type: String },
        public_id: { type: String },
        type: { type: String },
      },
    ],

    // ── Stats ─────────────────────────────────────────
    totalLikes: {
      type: Number,
      default: 0,
    },

    // ── Likes ─────────────────────────────────────────
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    // ── Instructor reply ──────────────────────────────
    isInstructorReply: {
      type: Boolean,
      default: false,
    },

    // ── Accepted answer ───────────────────────────────
    isAcceptedAnswer: {
      type: Boolean,
      default: false,
    },

    // ── Moderation ────────────────────────────────────
    isFlagged: {
      type: Boolean,
      default: false,
    },
    flagReason: {
      type: String,
      default: null,
    },
    isRemoved: {
      type: Boolean,
      default: false,
    },
    removedBy: {
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
discussionReplySchema.index({ discussion: 1, createdAt: 1 });
discussionReplySchema.index({ author: 1 });
discussionReplySchema.index({ isAcceptedAnswer: 1 });
discussionReplySchema.index({ isFlagged: 1 });

const DiscussionReply = mongoose.model(
  "DiscussionReply",
  discussionReplySchema
);

export default DiscussionReply;