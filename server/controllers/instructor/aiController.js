import sendResponse from "../../utils/sendResponse.js";
import asyncHandler from "../../middlewares/error/asyncHandler.js";
import {
  generateQuizQuestions,
  generateAssignment,
  generateLessonOutline,
  explainConcept,
  analyzeStudentPerformance,
} from "../../services/ai/claudeService.js";

export const generateQuiz = asyncHandler(async (req, res) => {
  const { topic, difficulty, questionCount, questionTypes } = req.body;

  const result = await generateQuizQuestions({
    userId: req.user._id,
    topic,
    difficulty,
    questionCount,
    questionTypes,
  });

  sendResponse(res, 200, "Quiz generated", result);
});

export const generateAssignmentAI = asyncHandler(async (req, res) => {
  const { topic, courseLevel, durationDays } = req.body;

  const result = await generateAssignment({
    userId: req.user._id,
    topic,
    courseLevel,
    durationDays,
  });

  sendResponse(res, 200, "Assignment generated", result);
});

export const generateOutline = asyncHandler(async (req, res) => {
  const { courseTopic, lessonTopic, duration } = req.body;

  const result = await generateLessonOutline({
    userId: req.user._id,
    courseTopic,
    lessonTopic,
    duration,
  });

  sendResponse(res, 200, "Outline generated", result);
});

export const explainConceptAI = asyncHandler(async (req, res) => {
  const { concept, studentLevel } = req.body;

  const result = await explainConcept({
    userId: req.user._id,
    concept,
    studentLevel,
  });

  sendResponse(res, 200, "Concept explained", result);
});

export const analyzePerformance = asyncHandler(async (req, res) => {
  const { studentData } = req.body;

  const result = await analyzeStudentPerformance({
    userId: req.user._id,
    studentData,
  });

  sendResponse(res, 200, "Performance analyzed", result);
});