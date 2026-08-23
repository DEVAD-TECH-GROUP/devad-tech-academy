import mongoose from "mongoose";

const announcementSchema = new mongoose.Schema(
  {
    // ── References ────────────────────────────────────
    createdBy: {
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
      required: [true, "Announcement title is required"],
      trim: true,
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    message: {
      type: String,
      required: [true, "Announcement message is required"],
      maxlength: [5000, "Message cannot exceed 5000 characters"],
    },

    // ── Target audience ───────────────────────────────
    targetAudience: {
      type: String,
      enum: [
        "all",
        "students",
        "instructors",
        "course-students",
      ],
      default: "all",
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

    // ── Schedule ──────────────────────────────────────
    isScheduled: {
      type: Boolean,
      default: false,
    },
    scheduledAt: {
      type: Date,
      default: null,
    },
    publishedAt: {
      type: Date,
      default: null,
    },

    // ── Status ────────────────────────────────────────
    status: {
      type: String,
      enum: ["draft", "scheduled", "published"],
      default: "draft",
    },

    // ── Stats ─────────────────────────────────────────
    totalReads: {
      type: Number,
      default: 0,
    },

    // ── Push notification ─────────────────────────────
    sendPushNotification: {
      type: Boolean,
      default: true,
    },
    sendEmail: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// ── Index ─────────────────────────────────────────────────
announcementSchema.index({ createdBy: 1 });
announcementSchema.index({ course: 1 });
announcementSchema.index({ status: 1 });
announcementSchema.index({ targetAudience: 1 });
announcementSchema.index({ createdAt: -1 });

const Announcement = mongoose.model("Announcement", announcementSchema);

export default Announcement;