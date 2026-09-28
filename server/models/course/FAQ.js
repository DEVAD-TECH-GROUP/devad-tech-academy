import mongoose from "mongoose";

const faqSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
      index: true,
    },

    question: {
      type: String,
      required: [true, "FAQ question is required"],
      trim: true,
      maxlength: 300,
    },

    answer: {
      type: String,
      required: [true, "FAQ answer is required"],
      trim: true,
      maxlength: 2000,
    },

    order: {
      type: Number,
      default: 0,
      min: 0,
    },

    isPublished: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

faqSchema.index({ course: 1, order: 1 });

const FAQ = mongoose.model("FAQ", faqSchema);

export default FAQ;