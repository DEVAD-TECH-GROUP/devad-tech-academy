import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
  {
    // ── References ────────────────────────────────────
    liveClass: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LiveClass",
      required: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },

    // ── Attendance ────────────────────────────────────
    joinedAt: {
      type: Date,
      default: null,
    },
    leftAt: {
      type: Date,
      default: null,
    },
    duration: {
      type: Number,
      default: 0, // in minutes
    },

    // ── Status ────────────────────────────────────────
    status: {
      type: String,
      enum: ["registered", "attended", "absent", "late"],
      default: "registered",
    },
    attended: {
      type: Boolean,
      default: false,
    },

    // ── Attendance percentage ─────────────────────────
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

// ── Prevent duplicate attendance ──────────────────────────
attendanceSchema.index(
  { liveClass: 1, student: 1 },
  { unique: true }
);
attendanceSchema.index({ liveClass: 1 });
attendanceSchema.index({ student: 1 });
attendanceSchema.index({ course: 1 });

const Attendance = mongoose.model("Attendance", attendanceSchema);

export default Attendance;