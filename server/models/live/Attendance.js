
import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
  {
    liveClass: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LiveClass",
      required: true,
      index: true,
    },

    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
      index: true,
    },

    joinedAt: {
      type: Date,
      default: null,
    },

    leftAt: {
      type: Date,
      default: null,
    },

    currentSessionStartedAt: {
      type: Date,
      default: null,
    },

    // Attendance session duration is stored in minutes.
    duration: {
      type: Number,
      default: 0,
      min: 0,
    },

    status: {
      type: String,
      enum: ["registered", "attended", "absent", "late"],
      default: "registered",
    },

    attended: {
      type: Boolean,
      default: false,
    },

    attendancePercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
  },
  {
    timestamps: true,
  }
);

// One attendance record per student per live class.
attendanceSchema.index(
  { liveClass: 1, student: 1 },
  { unique: true }
);

attendanceSchema.index({ liveClass: 1, createdAt: -1 });
attendanceSchema.index({ student: 1 });
attendanceSchema.index({ course: 1 });

const Attendance =
  mongoose.models.Attendance ||
  mongoose.model("Attendance", attendanceSchema);

export default Attendance;
