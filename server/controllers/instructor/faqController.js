import mongoose from "mongoose";

import FAQ from "../../models/course/FAQ.js";
import Course from "../../models/course/Course.js";

import sendResponse from "../../utils/sendResponse.js";
import asyncHandler from "../../middlewares/error/asyncHandler.js";

// ============================================================
// GET ALL FAQs FOR A COURSE
// ============================================================

export const getFAQs = asyncHandler(async (req, res) => {
  const { courseId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(courseId)) {
    return sendResponse(res, 400, "Invalid course ID");
  }

  const course = await Course.findOne({
    _id: courseId,
    instructor: req.user._id,
  });

  if (!course) {
    return sendResponse(res, 404, "Course not found");
  }

  const faqs = await FAQ.find({
    course: courseId,
  }).sort({
    order: 1,
    createdAt: 1,
  });

  return sendResponse(
    res,
    200,
    "FAQs retrieved successfully",
    faqs
  );
});

// ============================================================
// GET SINGLE FAQ
// ============================================================

export const getFAQ = asyncHandler(async (req, res) => {
  const { courseId, id } = req.params;

  if (
    !mongoose.Types.ObjectId.isValid(courseId) ||
    !mongoose.Types.ObjectId.isValid(id)
  ) {
    return sendResponse(
      res,
      400,
      "Invalid course or FAQ ID"
    );
  }

  const course = await Course.findOne({
    _id: courseId,
    instructor: req.user._id,
  });

  if (!course) {
    return sendResponse(res, 404, "Course not found");
  }

  const faq = await FAQ.findOne({
    _id: id,
    course: courseId,
  });

  if (!faq) {
    return sendResponse(res, 404, "FAQ not found");
  }

  return sendResponse(
    res,
    200,
    "FAQ retrieved successfully",
    faq
  );
});

// ============================================================
// CREATE FAQ
// ============================================================

export const createFAQ = asyncHandler(async (req, res) => {
  const { courseId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(courseId)) {
    return sendResponse(res, 400, "Invalid course ID");
  }

  const course = await Course.findOne({
    _id: courseId,
    instructor: req.user._id,
  });

  if (!course) {
    return sendResponse(res, 404, "Course not found");
  }

  const {
    question,
    answer,
    order,
    isPublished,
  } = req.body;

  if (!question || !question.trim()) {
    return sendResponse(
      res,
      400,
      "FAQ question is required"
    );
  }

  if (!answer || !answer.trim()) {
    return sendResponse(
      res,
      400,
      "FAQ answer is required"
    );
  }

  if (question.trim().length > 300) {
    return sendResponse(
      res,
      400,
      "FAQ question cannot exceed 300 characters"
    );
  }

  if (answer.trim().length > 2000) {
    return sendResponse(
      res,
      400,
      "FAQ answer cannot exceed 2000 characters"
    );
  }

  const faqCount = await FAQ.countDocuments({
    course: courseId,
  });

  let faqOrder =
    order !== undefined
      ? Number(order)
      : faqCount;

  if (
    !Number.isInteger(faqOrder) ||
    faqOrder < 0
  ) {
    return sendResponse(
      res,
      400,
      "FAQ order must be a non-negative integer"
    );
  }

  const faq = await FAQ.create({
    course: courseId,
    question: question.trim(),
    answer: answer.trim(),
    order: faqOrder,
    isPublished:
      typeof isPublished === "boolean"
        ? isPublished
        : true,
  });

  return sendResponse(
    res,
    201,
    "FAQ created successfully",
    faq
  );
});

// ============================================================
// UPDATE FAQ
// ============================================================

export const updateFAQ = asyncHandler(async (req, res) => {
  const { courseId, id } = req.params;

  if (
    !mongoose.Types.ObjectId.isValid(courseId) ||
    !mongoose.Types.ObjectId.isValid(id)
  ) {
    return sendResponse(
      res,
      400,
      "Invalid course or FAQ ID"
    );
  }

  const course = await Course.findOne({
    _id: courseId,
    instructor: req.user._id,
  });

  if (!course) {
    return sendResponse(res, 404, "Course not found");
  }

  const faq = await FAQ.findOne({
    _id: id,
    course: courseId,
  });

  if (!faq) {
    return sendResponse(res, 404, "FAQ not found");
  }

  const {
    question,
    answer,
    order,
    isPublished,
  } = req.body;

  if (question !== undefined) {
    if (!question.trim()) {
      return sendResponse(
        res,
        400,
        "FAQ question cannot be empty"
      );
    }

    if (question.trim().length > 300) {
      return sendResponse(
        res,
        400,
        "FAQ question cannot exceed 300 characters"
      );
    }

    faq.question = question.trim();
  }

  if (answer !== undefined) {
    if (!answer.trim()) {
      return sendResponse(
        res,
        400,
        "FAQ answer cannot be empty"
      );
    }

    if (answer.trim().length > 2000) {
      return sendResponse(
        res,
        400,
        "FAQ answer cannot exceed 2000 characters"
      );
    }

    faq.answer = answer.trim();
  }

  if (order !== undefined) {
    const parsedOrder = Number(order);

    if (
      !Number.isInteger(parsedOrder) ||
      parsedOrder < 0
    ) {
      return sendResponse(
        res,
        400,
        "FAQ order must be a non-negative integer"
      );
    }

    faq.order = parsedOrder;
  }

  if (isPublished !== undefined) {
    faq.isPublished = Boolean(isPublished);
  }

  await faq.save();

  return sendResponse(
    res,
    200,
    "FAQ updated successfully",
    faq
  );
});

// ============================================================
// DELETE FAQ
// ============================================================

export const deleteFAQ = asyncHandler(async (req, res) => {
  const { courseId, id } = req.params;

  if (
    !mongoose.Types.ObjectId.isValid(courseId) ||
    !mongoose.Types.ObjectId.isValid(id)
  ) {
    return sendResponse(
      res,
      400,
      "Invalid course or FAQ ID"
    );
  }

  const course = await Course.findOne({
    _id: courseId,
    instructor: req.user._id,
  });

  if (!course) {
    return sendResponse(res, 404, "Course not found");
  }

  const faq = await FAQ.findOne({
    _id: id,
    course: courseId,
  });

  if (!faq) {
    return sendResponse(res, 404, "FAQ not found");
  }

  await FAQ.deleteOne({
    _id: faq._id,
  });

  return sendResponse(
    res,
    200,
    "FAQ deleted successfully"
  );
});

// ============================================================
// REORDER FAQs
// ============================================================

export const reorderFAQs = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  const { faqs } = req.body;

  if (!mongoose.Types.ObjectId.isValid(courseId)) {
    return sendResponse(res, 400, "Invalid course ID");
  }

  if (!Array.isArray(faqs)) {
    return sendResponse(
      res,
      400,
      "FAQs must be provided as an array"
    );
  }

  const course = await Course.findOne({
    _id: courseId,
    instructor: req.user._id,
  });

  if (!course) {
    return sendResponse(res, 404, "Course not found");
  }

  if (faqs.length === 0) {
    return sendResponse(
      res,
      400,
      "At least one FAQ is required"
    );
  }

  const faqIds = faqs.map((item) => item._id);

  const validIds = faqIds.every((id) =>
    mongoose.Types.ObjectId.isValid(id)
  );

  if (!validIds) {
    return sendResponse(
      res,
      400,
      "One or more FAQ IDs are invalid"
    );
  }

  const existingFAQs = await FAQ.find({
    course: courseId,
    _id: {
      $in: faqIds,
    },
  }).select("_id");

  if (existingFAQs.length !== faqs.length) {
    return sendResponse(
      res,
      400,
      "One or more FAQs do not belong to this course"
    );
  }

  const bulkOperations = faqs.map(
    (item, index) => {
      const newOrder =
        item.order !== undefined
          ? Number(item.order)
          : index;

      if (
        !Number.isInteger(newOrder) ||
        newOrder < 0
      ) {
        throw new Error(
          "FAQ order must be a non-negative integer"
        );
      }

      return {
        updateOne: {
          filter: {
            _id: item._id,
            course: courseId,
          },
          update: {
            $set: {
              order: newOrder,
            },
          },
        },
      };
    }
  );

  await FAQ.bulkWrite(bulkOperations);

  const updatedFAQs = await FAQ.find({
    course: courseId,
  }).sort({
    order: 1,
    createdAt: 1,
  });

  return sendResponse(
    res,
    200,
    "FAQs reordered successfully",
    updatedFAQs
  );
});