import mongoose from "mongoose";

const courseThumbnailSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Thumbnail title is required"],
      trim: true,
      maxlength: 100,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 300,
      default: null,
    },

    image: {
      public_id: {
        type: String,
        required: true,
      },

      url: {
        type: String,
        required: true,
      },
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null,
      index: true,
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    sortOrder: {
      type: Number,
      default: 0,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

courseThumbnailSchema.index({
  isActive: 1,
  sortOrder: 1,
});

const CourseThumbnail = mongoose.model(
  "CourseThumbnail",
  courseThumbnailSchema
);

export default CourseThumbnail;