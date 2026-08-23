import mongoose from "mongoose";
import { LIVE_CLASS_STATUS } from "../../utils/constants.js";

const liveClassSchema = new mongoose.Schema(
  {
    // ── References ────────────────────────────────────
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // ── Basic info ────────────────────────────────────
    title: {
      type: String,
      required: [true, "Live class title is required"],
      trim: true,
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    description: {
      type: String,
      maxlength: [1000, "Description cannot exceed 1000 characters"],
      default: null,
    },

    // ── Schedule ──────────────────────────────────────
    scheduledAt: {
      type: Date,
      required: [true, "Scheduled date is required"],
    },
    duration: {
      type: Number,
      required: [true, "Duration is required"],
      default: 60, // in minutes
    },
    timezone: {
      type: String,
      default: "Africa/Lagos",
    },

    // ── Meeting ───────────────────────────────────────
    meetingRoom: {
      roomName: { type: String, default: null },
      roomUrl: { type: String, default: null },
      hostToken: { type: String, default: null, select: false },
    },

    // ── Status ────────────────────────────────────────
    status: {
      type: String,
      enum: Object.values(LIVE_CLASS_STATUS),
      default: LIVE_CLASS_STATUS.SCHEDULED,
    },

    // ── Started & ended ───────────────────────────────
    startedAt: {
      type: Date,
      default: null,
    },
    endedAt: {
      type: Date,
      default: null,
    },
    actualDuration: {
      type: Number,
      default: 0, // in minutes
    },

    // ── Recording ─────────────────────────────────────
    isRecorded: {
      type: Boolean,
      default: true,
    },
    recording: {
      url: { type: String, default: null },
      duration: { type: Number, default: 0 },
      recordingId: { type: String, default: null },
    },

    // ── Materials ─────────────────────────────────────
    materials: [
      {
        name: { type: String },
        url: { type: String },
        public_id: { type: String },
        type: { type: String },
      },
    ],

    // ── Notes ─────────────────────────────────────────
    classNotes: {
      type: String,
      default: null,
    },

    // ── Stats ─────────────────────────────────────────
    totalRegistered: {
      type: Number,
      default: 0,
    },
    totalAttended: {
      type: Number,
      default: 0,
    },
    maxParticipants: {
      type: Number,
      default: 100,
    },

    // ── Reminder sent ─────────────────────────────────
    reminderSent: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// ── Index ─────────────────────────────────────────────────
liveClassSchema.index({ course: 1 });
liveClassSchema.index({ instructor: 1 });
liveClassSchema.index({ scheduledAt: 1 });
liveClassSchema.index({ status: 1 });

const LiveClass = mongoose.model("LiveClass", liveClassSchema);

export default LiveClass;