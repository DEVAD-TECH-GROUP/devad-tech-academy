import Quiz from "../../models/assessment/Quiz.js";
import QuizAttempt from "../../models/assessment/QuizAttempt.js";
import Question from "../../models/assessment/Question.js";
import paginate from "../../utils/pagination.js";
import sendResponse from "../../utils/sendResponse.js";
import asyncHandler from "../../middlewares/error/asyncHandler.js";

export const getAllQuizzes = asyncHandler(async (req, res) => {
  const result = await paginate(Quiz, {}, {
    page: req.query.page,
    limit: req.query.limit,
    populate: "course instructor",
  });
  sendResponse(res, 200, "Quizzes retrieved", result);
});

export const getQuiz = asyncHandler(async (req, res) => {
  const quiz = await Quiz.findById(req.params.id)
    .populate("course", "title");

  if (!quiz) return sendResponse(res, 404, "Quiz not found");
  sendResponse(res, 200, "Quiz retrieved", quiz);
});

export const getQuizResults = asyncHandler(async (req, res) => {
  const results = await QuizAttempt.find({ status: "submitted" })
    .populate("student", "firstName lastName")
    .populate("quiz", "title")
    .sort({ createdAt: -1 });

  sendResponse(res, 200, "Quiz results retrieved", results);
});

export const getIntegrityFlags = asyncHandler(async (req, res) => {
  const flagged = await QuizAttempt.find({ isFlagged: true })
    .populate("student", "firstName lastName")
    .populate("quiz", "title");

  sendResponse(res, 200, "Flagged attempts retrieved", flagged);
});

export const flagAttempt = asyncHandler(async (req, res) => {
  const attempt = await QuizAttempt.findByIdAndUpdate(
    req.params.id,
    { isFlagged: true, flagReason: req.body.reason, status: "flagged" },
    { new: true }
  );

  if (!attempt) return sendResponse(res, 404, "Attempt not found");
  sendResponse(res, 200, "Attempt flagged", attempt);
});

export const getQuestionBank = asyncHandler(async (req, res) => {
  const result = await paginate(Question, {}, {
    page: req.query.page,
    limit: req.query.limit,
  });
  sendResponse(res, 200, "Question bank retrieved", result);
});