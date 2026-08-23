import mongoose from "mongoose";
import { DISCUSSION_TYPES } from "../../utils/constants.js";

const discussionSchema = new mongoose.Schema(
  {
    // ── References ────────────────────────────────────
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      default: null,
    },

    // ── Basic info ────────────────────────────────────
    title: {
      type: String,
      required: [true, "Discussion title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    content: {
      type: String,
      required: [true, "Discussion content is required"],
      maxlength: [5000, "Content cannot exceed 5000 characters"],
    },

    // ── Type ──────────────────────────────────────────
    type: {
      type: String,
      enum: Object.values(DISCUSSION_TYPES),
      default: DISCUSSION_TYPES.QUESTION,
    },

    // ── Tags ──────────────────────────────────────────
    tags: [
      {
        type: String,
        trim: true,
      },
    ],

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
    totalReplies: {
      type: Number,
      default: 0,
    },
    totalLikes: {
      type: Number,
      default: 0,
    },
    totalViews: {
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

    // ── Moderation ────────────────────────────────────
    isPinned: {
      type: Boolean,
      default: false,
    },
    isAnswered: {
      type: Boolean,
      default: false,
    },
    acceptedAnswer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DiscussionReply",
      default: null,
    },
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
    removedAt: {
      type: Date,
      default: null,
    },

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
discussionSchema.index({ course: 1 });
discussionSchema.index({ author: 1 });
discussionSchema.index({ type: 1 });
discussionSchema.index({ isPinned: -1, createdAt: -1 });
discussionSchema.index({ isFlagged: 1 });
discussionSchema.index({ isActive: 1 });

const Discussion = mongoose.model("Discussion", discussionSchema);

export default Discussion;