import Quiz from "../../models/assessment/Quiz.js";
import Question from "../../models/assessment/Question.js";
import QuizAttempt from "../../models/assessment/QuizAttempt.js";
import XP from "../../models/gamification/XP.js";
import Student from "../../models/user/Student.js";
import Enrollment from "../../models/learning/Enrollment.js";
import sendResponse from "../../utils/sendResponse.js";
import asyncHandler from "../../middlewares/error/asyncHandler.js";
import { submitQuizValidator } from "../../validators/student/submissionValidator.js";
import { XP_POINTS } from "../../utils/constants.js";

export const getMyQuizzes = asyncHandler(async (req, res) => {
  const courses = await Enrollment.find({
    student: req.user._id,
    status: "active",
  }).distinct("course");

  const quizzes = await Quiz.find({
    course: { $in: courses },
    status: "active",
  })
    .populate("course", "title")
    .sort({ availableUntil: 1 });

  sendResponse(res, 200, "Quizzes retrieved", quizzes);
});

export const getQuiz = asyncHandler(async (req, res) => {
  const quiz = await Quiz.findById(req.params.id)
    .populate("course", "title");

  if (!quiz) return sendResponse(res, 404, "Quiz not found");

  const attempts = await QuizAttempt.countDocuments({
    quiz: req.params.id,
    student: req.user._id,
    status: { $in: ["submitted", "graded"] },
  });

  sendResponse(res, 200, "Quiz retrieved", {
    quiz,
    attemptsUsed: attempts,
    canAttempt: attempts < quiz.maxAttempts,
  });
});

export const startQuiz = asyncHandler(async (req, res) => {
  const quiz = await Quiz.findById(req.params.id);
  if (!quiz) return sendResponse(res, 404, "Quiz not found");

  const attempts = await QuizAttempt.countDocuments({
    quiz: req.params.id,
    student: req.user._id,
    status: { $in: ["submitted", "graded"] },
  });

  if (attempts >= quiz.maxAttempts) {
    return sendResponse(res, 400, "Maximum attempts reached");
  }

  const questions = await Question.find({ quiz: req.params.id })
    .select("-correctAnswer");

  const shuffled = quiz.shuffleQuestions
    ? questions.sort(() => Math.random() - 0.5)
    : questions;

  const attempt = await QuizAttempt.create({
    quiz: req.params.id,
    student: req.user._id,
    course: quiz.course,
    attemptNumber: attempts + 1,
    startedAt: new Date(),
    status: "in-progress",
  });

  sendResponse(res, 200, "Quiz started", {
    attempt,
    questions: shuffled,
    duration: quiz.duration,
  });
});

export const submitQuiz = asyncHandler(async (req, res) => {
  const { error } = submitQuizValidator(req.body);
  if (error) return sendResponse(res, 400, error.details[0].message);

  const { answers, timeTaken } = req.body;
  const quiz = await Quiz.findById(req.params.id);
  if (!quiz) return sendResponse(res, 404, "Quiz not found");

const questions = await Question.find({ quiz: req.params.id });

  let totalScore = 0;
  const gradedAnswers = answers.map((answer) => {
    const question = questions.find(
      (q) => q._id.toString() === answer.question
    );

    if (!question) return { ...answer, isCorrect: false, pointsEarned: 0 };

    let isCorrect = false;

    if (question.type === "multiple_choice") {
      const correct = question.options.find((o) => o.isCorrect);
      isCorrect = correct?.text === answer.selectedOption;
    } else if (question.type === "true_false") {
      isCorrect = question.correctAnswer === answer.selectedOption;
    }

    const pointsEarned = isCorrect ? question.points : 0;
    totalScore += pointsEarned;

    return { ...answer, isCorrect, pointsEarned };
  });

  const percentage = Math.round((totalScore / quiz.totalPoints) * 100);
  const isPassed = percentage >= quiz.passingScore;

  const attempt = await QuizAttempt.findOneAndUpdate(
    {
      quiz: req.params.id,
      student: req.user._id,
      status: "in-progress",
    },
    {
      answers: gradedAnswers,
      score: totalScore,
      percentage,
      isPassed,
      timeTaken,
      submittedAt: new Date(),
      status: "submitted",
    },
    { new: true }
  );

  await Quiz.findByIdAndUpdate(req.params.id, {
    $inc: { totalAttempts: 1 },
  });

  if (isPassed) {
    await Student.findOneAndUpdate(
      { user: req.user._id },
      { $inc: { xpPoints: XP_POINTS.QUIZ_PASS } }
    );

    await XP.create({
      student: req.user._id,
      action: "QUIZ_PASS",
      points: XP_POINTS.QUIZ_PASS,
      description: `Passed quiz: ${quiz.title}`,
      reference: { model: "Quiz", id: quiz._id },
    });
  }

  sendResponse(res, 200, "Quiz submitted", {
    attempt,
    score: totalScore,
    percentage,
    isPassed,
    showResults: quiz.showResults,
  });
});

export const getQuizResults = asyncHandler(async (req, res) => {
  const attempt = await QuizAttempt.findOne({
    quiz: req.params.id,
    student: req.user._id,
    status: { $in: ["submitted", "graded"] },
  }).sort({ createdAt: -1 });

  if (!attempt) return sendResponse(res, 404, "No results found");
  sendResponse(res, 200, "Results retrieved", attempt);
});

export const reviewQuiz = asyncHandler(async (req, res) => {
  const quiz = await Quiz.findById(req.params.id);
  if (!quiz || !quiz.showCorrectAnswers) {
    return sendResponse(res, 403, "Review not available");
  }

  const questions = await Question.find({ quiz: req.params.id });
  const attempt = await QuizAttempt.findOne({
    quiz: req.params.id,
    student: req.user._id,
    status: { $in: ["submitted", "graded"] },
  }).sort({ createdAt: -1 });

  sendResponse(res, 200, "Quiz review retrieved", { questions, attempt });
});