import mongoose from "mongoose";

const studyGroupSchema = new mongoose.Schema(
  {
    // ── Basic info ────────────────────────────────────
    name: {
      type: String,
      required: [true, "Study group name is required"],
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    description: {
      type: String,
      maxlength: [500, "Description cannot exceed 500 characters"],
      default: null,
    },

    // ── Avatar ────────────────────────────────────────
    avatar: {
      public_id: { type: String, default: null },
      url: { type: String, default: null },
    },

    // ── Course ────────────────────────────────────────
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      default: null,
    },

    // ── Admin ─────────────────────────────────────────
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // ── Members ───────────────────────────────────────
    members: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        joinedAt: { type: Date, default: Date.now },
        role: {
          type: String,
          enum: ["admin", "member"],
          default: "member",
        },
      },
    ],
    totalMembers: {
      type: Number,
      default: 1,
    },
    maxMembers: {
      type: Number,
      default: 50,
    },

    // ── Privacy ───────────────────────────────────────
    isPrivate: {
      type: Boolean,
      default: false,
    },

    // ── Last activity ─────────────────────────────────
    lastActivityAt: {
      type: Date,
      default: Date.now,
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
studyGroupSchema.index({ course: 1 });
studyGroupSchema.index({ admin: 1 });
studyGroupSchema.index({ isActive: 1 });
studyGroupSchema.index({ lastActivityAt: -1 });

const StudyGroup = mongoose.model("StudyGroup", studyGroupSchema);

export default StudyGroup;