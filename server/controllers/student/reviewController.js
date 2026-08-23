import Review from "../../models/review/Review.js";
import Enrollment from "../../models/learning/Enrollment.js";
import Course from "../../models/course/Course.js";
import sendResponse from "../../utils/sendResponse.js";
import asyncHandler from "../../middlewares/error/asyncHandler.js";
import { createReviewValidator } from "../../validators/student/reviewValidator.js";

export const leaveReview = asyncHandler(async (req, res) => {
  const { error } = createReviewValidator(req.body);
  if (error) return sendResponse(res, 400, error.details[0].message);

  const enrollment = await Enrollment.findOne({
    student: req.user._id,
    course: req.params.courseId,
    isCompleted: true,
  });

  if (!enrollment) {
    return sendResponse(res, 403, "Complete the course to leave a review");
  }

  const existing = await Review.findOne({
    student: req.user._id,
    course: req.params.courseId,
  });

  if (existing) return sendResponse(res, 400, "You already reviewed this course");

  const course = await Course.findById(req.params.courseId);

  const review = await Review.create({
    student: req.user._id,
    course: req.params.courseId,
    instructor: course.instructor,
    enrollment: enrollment._id,
    ...req.body,
  });

  const reviews = await Review.find({ course: req.params.courseId });
  const avgRating =
    reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

  await Course.findByIdAndUpdate(req.params.courseId, {
    averageRating: avgRating.toFixed(1),
    $inc: { totalReviews: 1 },
  });

  await Enrollment.findByIdAndUpdate(enrollment._id, { hasReviewed: true });

  sendResponse(res, 201, "Review submitted", review);
});

export const updateReview = asyncHandler(async (req, res) => {
  const review = await Review.findOneAndUpdate(
    { _id: req.params.id, student: req.user._id },
    req.body,
    { new: true }
  );

  if (!review) return sendResponse(res, 404, "Review not found");
  sendResponse(res, 200, "Review updated", review);
});

export const deleteReview = asyncHandler(async (req, res) => {
  await Review.findOneAndDelete({
    _id: req.params.id,
    student: req.user._id,
  });
  sendResponse(res, 200, "Review deleted");
});