import mongoose from "mongoose";

import Quiz from "../../models/assessment/Quiz.js";
import Question from "../../models/assessment/Question.js";
import QuizAttempt from "../../models/assessment/QuizAttempt.js";
import Course from "../../models/course/Course.js";
import paginate from "../../utils/pagination.js";
import sendResponse from "../../utils/sendResponse.js";
import asyncHandler from "../../middlewares/error/asyncHandler.js";
import {
  createQuizValidator,
  updateQuizValidator,
  createQuestionValidator,
} from "../../validators/instructor/quizValidator.js";
import { QUIZ_STATUS, QUESTION_TYPES } from "../../utils/constants.js";

// ============================================================
// HELPERS
// ============================================================

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

// Returns the quiz only when it belongs to the logged-in instructor.
const findOwnedQuiz = (quizId, instructorId) =>
  Quiz.findOne({ _id: quizId, instructor: instructorId });

// Builds a clean question document from validated input.
// Fields that do not belong to the chosen type are reset, so
// changing a question's type never leaves stale data behind.
const buildQuestionData = (value) => {
  const data = {
    question: value.question,
    type: value.type,
    explanation: value.explanation || null,
    points: value.points ?? 1,
    difficulty: value.difficulty ?? "medium",
    tags: value.tags || [],
    options: [],
    correctAnswer: null,
    codeLanguage: null,
    starterCode: null,
    testCases: [],
  };

  if (value.order !== undefined) data.order = value.order;

  switch (value.type) {
    case QUESTION_TYPES.MULTIPLE_CHOICE:
      data.options = value.options;
      break;

    case QUESTION_TYPES.TRUE_FALSE:
    case QUESTION_TYPES.SHORT_ANSWER:
      data.correctAnswer = value.correctAnswer;
      break;

    case QUESTION_TYPES.CODING:
      data.codeLanguage = value.codeLanguage || null;
      data.starterCode = value.starterCode || null;
      data.testCases = value.testCases || [];
      break;

    default:
      break;
  }

  return data;
};

// ============================================================
// GET MY QUIZZES
// ============================================================

export const getMyQuizzes = asyncHandler(async (req, res) => {
  const result = await paginate(
    Quiz,
    { instructor: req.user._id },
    { page: req.query.page, limit: req.query.limit, populate: "course" }
  );

  return sendResponse(res, 200, "Quizzes retrieved", result);
});

// ============================================================
// CREATE QUIZ
// ============================================================

export const createQuiz = asyncHandler(async (req, res) => {
  const { error, value } = createQuizValidator(req.body);

  if (error) return sendResponse(res, 400, error.details[0].message);

  const course = await Course.findById(value.course);

  if (!course) return sendResponse(res, 404, "Course not found");

  if (course.instructor.toString() !== req.user._id.toString()) {
    return sendResponse(
      res,
      403,
      "You are not authorized to create a quiz for this course"
    );
  }

  const quiz = await Quiz.create({
    ...value,
    instructor: req.user._id,
    status: QUIZ_STATUS.DRAFT,
  });

  return sendResponse(res, 201, "Quiz created", quiz);
});

// ============================================================
// GET SINGLE QUIZ (with its questions)
// ============================================================

export const getQuiz = asyncHandler(async (req, res) => {
  if (!isValidId(req.params.id)) {
    return sendResponse(res, 400, "Invalid quiz ID");
  }

  const quiz = await Quiz.findOne({
    _id: req.params.id,
    instructor: req.user._id,
  }).populate("course", "title");

  if (!quiz) return sendResponse(res, 404, "Quiz not found");

  // correctAnswer is select:false, so instructors must opt in
  const questions = await Question.find({ quiz: quiz._id })
    .select("+correctAnswer")
    .sort({ order: 1, createdAt: 1 });

  return sendResponse(res, 200, "Quiz retrieved", {
    ...quiz.toObject(),
    questions,
  });
});

// ============================================================
// UPDATE QUIZ
// ============================================================

export const updateQuiz = asyncHandler(async (req, res) => {
  if (!isValidId(req.params.id)) {
    return sendResponse(res, 400, "Invalid quiz ID");
  }

  const { error, value } = updateQuizValidator(req.body);

  if (error) return sendResponse(res, 400, error.details[0].message);

  const quiz = await findOwnedQuiz(req.params.id, req.user._id);

  if (!quiz) return sendResponse(res, 404, "Quiz not found");

  if (value.status === QUIZ_STATUS.ACTIVE && quiz.totalQuestions < 1) {
    return sendResponse(
      res,
      400,
      "Add at least one question before publishing this quiz"
    );
  }

  quiz.set(value);
  await quiz.save();

  return sendResponse(res, 200, "Quiz updated", quiz);
});

// ============================================================
// DELETE QUIZ
// ============================================================

export const deleteQuiz = asyncHandler(async (req, res) => {
  if (!isValidId(req.params.id)) {
    return sendResponse(res, 400, "Invalid quiz ID");
  }

  const quiz = await findOwnedQuiz(req.params.id, req.user._id);

  if (!quiz) return sendResponse(res, 404, "Quiz not found");

  await Question.deleteMany({ quiz: quiz._id });
  await quiz.deleteOne();

  return sendResponse(res, 200, "Quiz deleted");
});

// ============================================================
// ADD QUESTION
// ============================================================

export const addQuestion = asyncHandler(async (req, res) => {
  if (!isValidId(req.params.id)) {
    return sendResponse(res, 400, "Invalid quiz ID");
  }

  const { error, value } = createQuestionValidator(req.body);

  if (error) return sendResponse(res, 400, error.details[0].message);

  const quiz = await findOwnedQuiz(req.params.id, req.user._id);

  if (!quiz) return sendResponse(res, 404, "Quiz not found");

  const data = buildQuestionData(value);

  const question = await Question.create({
    ...data,
    order: data.order ?? quiz.totalQuestions,
    quiz: quiz._id,
    course: quiz.course,
  });

  await Quiz.findByIdAndUpdate(quiz._id, {
    $inc: {
      totalQuestions: 1,
      totalPoints: question.points || 0,
    },
  });

  return sendResponse(res, 201, "Question added", question);
});

// ============================================================
// UPDATE QUESTION
// ============================================================

export const updateQuestion = asyncHandler(async (req, res) => {
  if (!isValidId(req.params.id) || !isValidId(req.params.qId)) {
    return sendResponse(res, 400, "Invalid ID");
  }

  const { error, value } = createQuestionValidator(req.body);

  if (error) return sendResponse(res, 400, error.details[0].message);

  const quiz = await findOwnedQuiz(req.params.id, req.user._id);

  if (!quiz) return sendResponse(res, 404, "Quiz not found");

  const existing = await Question.findOne({
    _id: req.params.qId,
    quiz: quiz._id,
  });

  if (!existing) return sendResponse(res, 404, "Question not found");

  const previousPoints = Number(existing.points || 0);

  const question = await Question.findByIdAndUpdate(
    existing._id,
    buildQuestionData(value),
    { new: true, runValidators: true }
  );

  const pointsDifference = Number(question.points || 0) - previousPoints;

  if (pointsDifference !== 0) {
    await Quiz.findByIdAndUpdate(quiz._id, {
      $inc: { totalPoints: pointsDifference },
    });
  }

  return sendResponse(res, 200, "Question updated", question);
});

// ============================================================
// DELETE QUESTION
// ============================================================

export const deleteQuestion = asyncHandler(async (req, res) => {
  if (!isValidId(req.params.id) || !isValidId(req.params.qId)) {
    return sendResponse(res, 400, "Invalid ID");
  }

  const quiz = await findOwnedQuiz(req.params.id, req.user._id);

  if (!quiz) return sendResponse(res, 404, "Quiz not found");

  const question = await Question.findOneAndDelete({
    _id: req.params.qId,
    quiz: quiz._id,
  });

  if (!question) return sendResponse(res, 404, "Question not found");

  await Quiz.findByIdAndUpdate(quiz._id, {
    $inc: {
      totalQuestions: -1,
      totalPoints: -(question.points || 0),
    },
  });

  return sendResponse(res, 200, "Question deleted");
});

// ============================================================
// GET QUIZ RESULTS
// ============================================================

export const getQuizResults = asyncHandler(async (req, res) => {
  if (!isValidId(req.params.id)) {
    return sendResponse(res, 400, "Invalid quiz ID");
  }

  const quiz = await findOwnedQuiz(req.params.id, req.user._id);

  if (!quiz) return sendResponse(res, 404, "Quiz not found");

  const results = await QuizAttempt.find({
    quiz: quiz._id,
    status: { $in: ["submitted", "graded"] },
  })
    .populate("student", "firstName lastName email")
    .sort({ createdAt: -1 });

  return sendResponse(res, 200, "Results retrieved", results);
});
