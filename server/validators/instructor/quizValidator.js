import Joi from "joi";

import { QUESTION_TYPES, QUIZ_STATUS } from "../../utils/constants.js";

const objectId = Joi.string().hex().length(24);

// ============================================================
// QUIZ
// ============================================================

const quizFields = {
  title: Joi.string().trim().min(3).max(100),
  description: Joi.string().trim().max(500).allow("", null),
  instructions: Joi.string().trim().max(1000).allow("", null),
  duration: Joi.number().positive(),
  passingScore: Joi.number().min(0).max(100),
  maxAttempts: Joi.number().integer().positive(),
  shuffleQuestions: Joi.boolean(),
  shuffleOptions: Joi.boolean(),
  showResults: Joi.boolean(),
  showCorrectAnswers: Joi.boolean(),
  availableFrom: Joi.date().allow(null),
  availableUntil: Joi.date().allow(null).when("availableFrom", {
    is: Joi.date().required(),
    then: Joi.date().greater(Joi.ref("availableFrom")).allow(null),
  }),
  lesson: objectId.allow(null),
};

export const createQuizValidator = (data) => {
  const schema = Joi.object({
    ...quizFields,
    course: objectId.required(),
    title: quizFields.title.required(),
    duration: quizFields.duration.default(30),
    passingScore: quizFields.passingScore.default(50),
    maxAttempts: quizFields.maxAttempts.default(3),
    shuffleQuestions: quizFields.shuffleQuestions.default(true),
    shuffleOptions: quizFields.shuffleOptions.default(true),
    showResults: quizFields.showResults.default(true),
    showCorrectAnswers: quizFields.showCorrectAnswers.default(true),
  });

  return schema.validate(data, { abortEarly: false });
};

export const updateQuizValidator = (data) => {
  const schema = Joi.object({
    ...quizFields,
    status: Joi.string().valid(...Object.values(QUIZ_STATUS)),
  }).min(1);

  return schema.validate(data, { abortEarly: false });
};

// ============================================================
// QUESTION
// ============================================================

export const createQuestionValidator = (data) => {
  const schema = Joi.object({
    question: Joi.string().trim().min(5).max(1000).required(),

    type: Joi.string()
      .valid(...Object.values(QUESTION_TYPES))
      .required(),

    options: Joi.when("type", {
      is: QUESTION_TYPES.MULTIPLE_CHOICE,
      then: Joi.array()
        .items(
          Joi.object({
            text: Joi.string().trim().required(),
            isCorrect: Joi.boolean().required(),
          })
        )
        .min(2)
        .max(8)
        .custom((options, helpers) =>
          options.some((option) => option.isCorrect)
            ? options
            : helpers.message("Mark at least one option as correct")
        )
        .required(),
      otherwise: Joi.forbidden(),
    }),

    correctAnswer: Joi.when("type", {
      switch: [
        {
          is: QUESTION_TYPES.TRUE_FALSE,
          then: Joi.string().valid("true", "false").required(),
        },
        {
          is: QUESTION_TYPES.SHORT_ANSWER,
          then: Joi.string().trim().min(1).required(),
        },
      ],
      otherwise: Joi.any().strip(),
    }),

    explanation: Joi.string().trim().max(1000).allow("", null),
    points: Joi.number().positive().default(1),

    codeLanguage: Joi.string().trim().allow("", null),
    starterCode: Joi.string().allow("", null),
    testCases: Joi.array().items(
      Joi.object({
        input: Joi.string().allow(""),
        expectedOutput: Joi.string().allow(""),
        isHidden: Joi.boolean(),
      })
    ),

    difficulty: Joi.string().valid("easy", "medium", "hard").default("medium"),
    tags: Joi.array().items(Joi.string().trim()),
    order: Joi.number().min(0),
  });

  return schema.validate(data, { abortEarly: false });
};
