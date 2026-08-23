import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
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
      required: [true, "Project title is required"],
      trim: true,
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    description: {
      type: String,
      required: [true, "Project description is required"],
      maxlength: [5000, "Description cannot exceed 5000 characters"],
    },
    requirements: [
      {
        type: String,
        trim: true,
      },
    ],

    // ── Type ──────────────────────────────────────────
    type: {
      type: String,
      enum: ["individual", "team"],
      default: "individual",
    },
    maxTeamSize: {
      type: Number,
      default: 1,
    },

    // ── Resources ─────────────────────────────────────
    attachments: [
      {
        name: { type: String },
        url: { type: String },
        public_id: { type: String },
      },
    ],

    // ── Due date ──────────────────────────────────────
    dueDate: {
      type: Date,
      required: [true, "Due date is required"],
    },

    // ── Points ────────────────────────────────────────
    totalPoints: {
      type: Number,
      default: 100,
    },
    passingPoints: {
      type: Number,
      default: 50,
    },

    // ── Rubric ────────────────────────────────────────
    rubric: [
      {
        criterion: { type: String, required: true },
        description: { type: String },
        points: { type: Number, required: true },
      },
    ],

    // ── Is capstone ───────────────────────────────────
    isCapstone: {
      type: Boolean,
      default: false,
    },

    // ── Stats ─────────────────────────────────────────
    totalSubmissions: {
      type: Number,
      default: 0,
    },
    totalGraded: {
      type: Number,
      default: 0,
    },

    // ── Status ────────────────────────────────────────
    isPublished: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// ── Index ─────────────────────────────────────────────────
projectSchema.index({ course: 1 });
projectSchema.index({ instructor: 1 });
projectSchema.index({ isCapstone: 1 });

const Project = mongoose.model("Project", projectSchema);

export default Project;