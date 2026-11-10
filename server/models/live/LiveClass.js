
import mongoose from "mongoose";
import { LIVE_CLASS_STATUS } from "../../utils/constants.js";

const LIVE_RECORDING_STATUSES = [
  "not_started",
  "starting",
  "recording",
  "stopping",
  "processing",
  "available",
  "failed",
];

const meetingRoomSchema = new mongoose.Schema(
  {
    roomName: {
      type: String,
      default: null,
      trim: true,
    },
    roomUrl: {
      type: String,
      default: null,
      trim: true,
    },
    maxParticipants: {
      type: Number,
      default: 45,
      min: 45,
      max: 45,
    },
    hostToken: {
      type: String,
      default: null,
      select: false,
    },
  },
  { _id: false }
);

const recordingSchema = new mongoose.Schema(
  {
    // Kept for backward compatibility. Playback URLs are generated dynamically.
    url: {
      type: String,
      default: null,
      trim: true,
    },
    objectKey: {
      type: String,
      default: null,
      trim: true,
    },
    recordingId: {
      type: String,
      default: null,
      trim: true,
    },
    // Recording duration is stored in seconds.
    duration: {
      type: Number,
      default: null,
      min: 0,
    },
    status: {
      type: String,
      enum: LIVE_RECORDING_STATUSES,
      default: "not_started",
      required: true,
    },
    startedAt: {
      type: Date,
      default: null,
    },
    endedAt: {
      type: Date,
      default: null,
    },
    lastSyncAt: {
      type: Date,
      default: null,
    },
    error: {
      type: String,
      default: null,
      trim: true,
      maxlength: 2000,
    },
  },
  { _id: false }
);

const materialSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    url: {
      type: String,
      required: true,
      trim: true,
    },
    public_id: {
      type: String,
      default: null,
      trim: true,
    },
    type: {
      type: String,
      default: "file",
      trim: true,
    },
  },
  { _id: true }
);

const liveClassSchema = new mongoose.Schema(
  {
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

    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      default: "",
      trim: true,
      maxlength: 5000,
    },
    scheduledAt: {
      type: Date,
      required: true,
    },
    duration: {
      type: Number,
      required: true,
      min: 1,
    },
    timezone: {
      type: String,
      default: "Africa/Lagos",
      trim: true,
    },

    meetingRoom: {
      type: meetingRoomSchema,
      default: () => ({}),
    },

    status: {
      type: String,
      enum: Object.values(LIVE_CLASS_STATUS),
      default: LIVE_CLASS_STATUS.SCHEDULED,
      required: true,
    },
    startedAt: {
      type: Date,
      default: null,
    },
    endedAt: {
      type: Date,
      default: null,
    },
    // Actual class duration is stored in seconds.
    actualDuration: {
      type: Number,
      default: null,
      min: 0,
    },

    isRecorded: {
      type: Boolean,
      default: true,
    },
    recording: {
      type: recordingSchema,
      default: () => ({}),
    },

    materials: {
      type: [materialSchema],
      default: [],
    },
    classNotes: {
      type: String,
      default: "",
      trim: true,
      maxlength: 20000,
    },

    totalRegistered: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalAttended: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Capacity is fixed at 45.
    maxParticipants: {
      type: Number,
      default: 45,
      min: 45,
      max: 45,
    },

    reminderSent: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

/*
 * Enforce the fixed capacity whenever a document is validated.
 * This also normalizes older documents when they are next saved.
 */
liveClassSchema.pre("validate", function () {
  this.maxParticipants = 45;

  if (!this.meetingRoom) {
    this.meetingRoom = {};
  }

  this.meetingRoom.maxParticipants = 45;
});

// Indexes
liveClassSchema.index({ course: 1 });
liveClassSchema.index({ instructor: 1 });
liveClassSchema.index({ scheduledAt: 1 });
liveClassSchema.index({ status: 1 });
liveClassSchema.index({ "recording.recordingId": 1 });

liveClassSchema.index({
  instructor: 1,
  scheduledAt: 1,
  status: 1,
});

const LiveClass =
  mongoose.models.LiveClass ||
  mongoose.model("LiveClass", liveClassSchema);

export default LiveClass;
