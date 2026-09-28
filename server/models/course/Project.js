import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
      index: true,
    },

    title: {
      type: String,
      required: [true, "Project title is required"],
      trim: true,
      maxlength: 150,
    },

    description: {
      type: String,
      required: [true, "Project description is required"],
      trim: true,
      maxlength: 3000,
    },

    objective: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: null,
    },

    difficulty: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      default: "beginner",
    },

    estimatedHours: {
      type: Number,
      default: 0,
      min: 0,
    },

    technologies: [
      {
        type: String,
        trim: true,
      },
    ],

    requirements: [
      {
        type: String,
        trim: true,
      },
    ],

    deliverables: [
      {
        type: String,
        trim: true,
      },
    ],

    githubUrl: {
      type: String,
      trim: true,
      default: null,
    },

    liveDemoUrl: {
      type: String,
      trim: true,
      default: null,
    },

    image: {
      public_id: {
        type: String,
        default: null,
      },

      url: {
        type: String,
        default: null,
      },
    },

    order: {
      type: Number,
      default: 0,
      min: 0,
    },

    isPublished: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

projectSchema.index({ course: 1, order: 1 });

const Project = mongoose.model("CourseProject", projectSchema);

export default Project;