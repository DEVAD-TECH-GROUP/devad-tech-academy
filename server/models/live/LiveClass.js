
import mongoose from "mongoose";
import { LIVE_CLASS_STATUS } from "../../utils/constants.js";

/*
|--------------------------------------------------------------------------
| Recording statuses
|--------------------------------------------------------------------------
*/

const LIVE_RECORDING_STATUSES = [
  "not_started",
  "starting",
  "recording",
  "stopping",
  "processing",
  "available",
  "failed",
];

/*
|--------------------------------------------------------------------------
| Meeting Room Schema
|--------------------------------------------------------------------------
*/

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
      min: 2,
    },

    // Never expose the instructor's private token in normal queries.
    hostToken: {
      type: String,
      default: null,
      select: false,
    },
  },
  {
    _id: false,
  }
);

/*
|--------------------------------------------------------------------------
| Recording Schema
|--------------------------------------------------------------------------
*/

const recordingSchema = new mongoose.Schema(
  {
    // Legacy field retained for backward compatibility.
    // New playback URLs should be generated dynamically.
    url: {
      type: String,
      default: null,
      trim: true,
    },

    // Private Backblaze B2 object key.
    // Example: classes/classId/instructorId/recording.mp4
    objectKey: {
      type: String,
      default: null,
      trim: true,
    },

    // LiveKit Egress recording ID.
    recordingId: {
      type: String,
      default: null,
      trim: true,
    },

    // Recording duration in seconds.
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
  {
    _id: false,
  }
);

/*
|--------------------------------------------------------------------------
| Class Materials Schema
|--------------------------------------------------------------------------
*/

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
  {
    _id: true,
  }
);

/*
|--------------------------------------------------------------------------
| Main Live Class Schema
|--------------------------------------------------------------------------
*/

const liveClassSchema = new mongoose.Schema(
  {
    /*
    |--------------------------------------------------------------------------
    | Course and Instructor
    |--------------------------------------------------------------------------
    */

    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
      index: false,
    },

    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: false,
    },

    /*
    |--------------------------------------------------------------------------
    | Class Information
    |--------------------------------------------------------------------------
    */

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

    /*
    |--------------------------------------------------------------------------
    | LiveKit Meeting Room
    |--------------------------------------------------------------------------
    */

    meetingRoom: {
      type: meetingRoomSchema,
      default: () => ({}),
    },

    /*
    |--------------------------------------------------------------------------
    | Class Status
    |--------------------------------------------------------------------------
    */

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

    // Actual class duration in seconds.
    actualDuration: {
      type: Number,
      default: null,
      min: 0,
    },

    /*
    |--------------------------------------------------------------------------
    | Recording Configuration and Metadata
    |--------------------------------------------------------------------------
    */

    isRecorded: {
      type: Boolean,
      default: true,
    },

    recording: {
      type: recordingSchema,
      default: () => ({}),
    },

    /*
    |--------------------------------------------------------------------------
    | Learning Materials
    |--------------------------------------------------------------------------
    */

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

    /*
    |--------------------------------------------------------------------------
    | Attendance and Registration
    |--------------------------------------------------------------------------
    */

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

    maxParticipants: {
      type: Number,
      default: 100,
      min: 2,
    },

    /*
    |--------------------------------------------------------------------------
    | Notifications
    |--------------------------------------------------------------------------
    */

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
|--------------------------------------------------------------------------
| Indexes
|--------------------------------------------------------------------------
*/

// Course-based class queries.
liveClassSchema.index({ course: 1 });

// Instructor dashboard queries.
liveClassSchema.index({ instructor: 1 });

// Scheduled class queries and sorting.
liveClassSchema.index({ scheduledAt: 1 });

// Status filtering.
liveClassSchema.index({ status: 1 });

// Find a recording using its LiveKit Egress ID.
liveClassSchema.index({ "recording.recordingId": 1 });

// Instructor's upcoming classes.
liveClassSchema.index({
  instructor: 1,
  scheduledAt: 1,
  status: 1,
});

/*
|--------------------------------------------------------------------------
| Model Export
|--------------------------------------------------------------------------
*/

const LiveClass =
  mongoose.models.LiveClass ||
  mongoose.model("LiveClass", liveClassSchema);

export default LiveClass;
