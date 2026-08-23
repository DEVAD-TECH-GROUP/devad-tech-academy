import Quiz from "../../models/assessment/Quiz.js";
import Question from "../../models/assessment/Question.js";
import QuizAttempt from "../../models/assessment/QuizAttempt.js";
import paginate from "../../utils/pagination.js";
import sendResponse from "../../utils/sendResponse.js";
import asyncHandler from "../../middlewares/error/asyncHandler.js";
import {
  createQuizValidator,
  createQuestionValidator,
} from "../../validators/instructor/quizValidator.js";
import { QUIZ_STATUS } from "../../utils/constants.js";

export const getMyQuizzes = asyncHandler(async (req, res) => {
  const result = await paginate(
    Quiz,
    { instructor: req.user._id },
    { page: req.query.page, limit: req.query.limit, populate: "course" }
  );
  sendResponse(res, 200, "Quizzes retrieved", result);
});

export const createQuiz = asyncHandler(async (req, res) => {
  const { error } = createQuizValidator(req.body);
  if (error) return sendResponse(res, 400, error.details[0].message);

  const quiz = await Quiz.create({
    ...req.body,
    instructor: req.user._id,
    status: QUIZ_STATUS.DRAFT,
  });

  sendResponse(res, 201, "Quiz created", quiz);
});

export const getQuiz = asyncHandler(async (req, res) => {
  const quiz = await Quiz.findOne({
    _id: req.params.id,
    instructor: req.user._id,
  }).populate("course", "title");

  if (!quiz) return sendResponse(res, 404, "Quiz not found");
  sendResponse(res, 200, "Quiz retrieved", quiz);
});

export const updateQuiz = asyncHandler(async (req, res) => {
  const quiz = await Quiz.findOneAndUpdate(
    { _id: req.params.id, instructor: req.user._id },
    req.body,
    { new: true }
  );

  if (!quiz) return sendResponse(res, 404, "Quiz not found");
  sendResponse(res, 200, "Quiz updated", quiz);
});

export const deleteQuiz = asyncHandler(async (req, res) => {
  await Quiz.findOneAndDelete({
    _id: req.params.id,
    instructor: req.user._id,
  });
  await Question.deleteMany({ quiz: req.params.id });
  sendResponse(res, 200, "Quiz deleted");
});

export const addQuestion = asyncHandler(async (req, res) => {
  const { error } = createQuestionValidator(req.body);
  if (error) return sendResponse(res, 400, error.details[0].message);

  const quiz = await Quiz.findById(req.params.id);
  if (!quiz) return sendResponse(res, 404, "Quiz not found");

  const question = await Question.create({
    ...req.body,
    quiz: req.params.id,
    course: quiz.course,
  });

  await Quiz.findByIdAndUpdate(req.params.id, {
    $inc: {
      totalQuestions: 1,
      totalPoints: question.points,
    },
  });

  sendResponse(res, 201, "Question added", question);
});

export const updateQuestion = asyncHandler(async (req, res) => {
  const question = await Question.findByIdAndUpdate(
    req.params.qId,
    req.body,
    { new: true }
  );

  if (!question) return sendResponse(res, 404, "Question not found");
  sendResponse(res, 200, "Question updated", question);
});

export const deleteQuestion = asyncHandler(async (req, res) => {
  const question = await Question.findByIdAndDelete(req.params.qId);
  if (!question) return sendResponse(res, 404, "Question not found");

  await Quiz.findByIdAndUpdate(req.params.id, {
    $inc: {
      totalQuestions: -1,
      totalPoints: -question.points,
    },
  });

  sendResponse(res, 200, "Question deleted");
});

export const getQuizResults = asyncHandler(async (req, res) => {
  const results = await QuizAttempt.find({
    quiz: req.params.id,
    status: { $in: ["submitted", "graded"] },
  })
    .populate("student", "firstName lastName email")
    .sort({ createdAt: -1 });

  sendResponse(res, 200, "Results retrieved", results);
});