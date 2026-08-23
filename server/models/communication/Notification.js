import mongoose from "mongoose";
import { NOTIFICATION_TYPES } from "../../utils/constants.js";

const notificationSchema = new mongoose.Schema(
  {
    // ── References ────────────────────────────────────
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // ── Notification info ─────────────────────────────
    type: {
      type: String,
      enum: Object.values(NOTIFICATION_TYPES),
      required: true,
    },
    title: {
      type: String,
      required: [true, "Notification title is required"],
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    message: {
      type: String,
      required: [true, "Notification message is required"],
      maxlength: [500, "Message cannot exceed 500 characters"],
    },

    // ── Action link ───────────────────────────────────
    actionUrl: {
      type: String,
      default: null,
    },
    actionText: {
      type: String,
      default: null,
    },

    // ── Reference to related document ─────────────────
    reference: {
      model: {
        type: String,
        enum: [
          "Course",
          "Assignment",
          "Quiz",
          "LiveClass",
          "Certificate",
          "Payment",
          "Discussion",
          "Announcement",
          "Review",
          "Referral",
        ],
        default: null,
      },
      id: {
        type: mongoose.Schema.Types.ObjectId,
        default: null,
      },
    },

    // ── Read status ───────────────────────────────────
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
      default: null,
    },

    // ── Push notification ─────────────────────────────
    isPushSent: {
      type: Boolean,
      default: false,
    },
    isEmailSent: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// ── Auto delete after 90 days ─────────────────────────────
notificationSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 90 * 24 * 60 * 60 }
);
notificationSchema.index({ recipient: 1, isRead: 1 });
notificationSchema.index({ recipient: 1, createdAt: -1 });

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;