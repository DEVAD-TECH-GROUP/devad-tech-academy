import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
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
      required: [true, "Event title is required"],
      trim: true,
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    description: {
      type: String,
      maxlength: [2000, "Description cannot exceed 2000 characters"],
      default: null,
    },

    // ── Type ──────────────────────────────────────────
    type: {
      type: String,
      enum: [
        "webinar",
        "workshop",
        "hackathon",
        "meetup",
        "other",
      ],
      default: "webinar",
    },

    // ── Thumbnail ─────────────────────────────────────
    thumbnail: {
      public_id: { type: String, default: null },
      url: { type: String, default: null },
    },

    // ── Schedule ──────────────────────────────────────
    startDate: {
      type: Date,
      required: [true, "Start date is required"],
    },
    endDate: {
      type: Date,
      required: [true, "End date is required"],
    },
    timezone: {
      type: String,
      default: "Africa/Lagos",
    },

    // ── Location ──────────────────────────────────────
    isOnline: {
      type: Boolean,
      default: true,
    },
    meetingUrl: {
      type: String,
      default: null,
    },
    location: {
      type: String,
      default: null,
    },

    // ── RSVP ──────────────────────────────────────────
    attendees: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        rsvpAt: { type: Date, default: Date.now },
        attended: { type: Boolean, default: false },
      },
    ],
    totalAttendees: {
      type: Number,
      default: 0,
    },
    maxAttendees: {
      type: Number,
      default: null,
    },

    // ── Status ────────────────────────────────────────
    status: {
      type: String,
      enum: ["upcoming", "ongoing", "completed", "cancelled"],
      default: "upcoming",
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// ── Index ─────────────────────────────────────────────────
eventSchema.index({ startDate: 1 });
eventSchema.index({ status: 1 });
eventSchema.index({ createdBy: 1 });
eventSchema.index({ isPublic: 1 });

const Event = mongoose.model("Event", eventSchema);

export default Event;