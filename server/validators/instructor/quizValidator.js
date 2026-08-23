import Joi from "joi";

export const createQuizValidator = (data) => {
  const schema = Joi.object({
    title: Joi.string().min(3).max(100).required(),
    description: Joi.string().max(500).optional(),
    instructions: Joi.string().max(1000).optional(),
    duration: Joi.number().positive().default(30),
    passingScore: Joi.number().min(0).max(100).default(50),
    maxAttempts: Joi.number().positive().default(3),
    shuffleQuestions: Joi.boolean().default(true),
    shuffleOptions: Joi.boolean().default(true),
    showResults: Joi.boolean().default(true),
    showCorrectAnswers: Joi.boolean().default(true),
    availableFrom: Joi.date().optional(),
    availableUntil: Joi.date().optional(),
    lessonId: Joi.string().optional(),
  });

  return schema.validate(data, { abortEarly: false });
};

export const createQuestionValidator = (data) => {
  const schema = Joi.object({
    question: Joi.string().min(5).max(1000).required(),
    type: Joi.string()
      .valid(
        "multiple_choice",
        "true_false",
        "short_answer",
        "coding",
        "essay"
      )
      .required(),
    options: Joi.when("type", {
      is: "multiple_choice",
      then: Joi.array()
        .items(
          Joi.object({
            text: Joi.string().required(),
            isCorrect: Joi.boolean().required(),
          })
        )
        .min(2)
        .required(),
      otherwise: Joi.optional(),
    }),
    correctAnswer: Joi.string().optional(),
    explanation: Joi.string().max(1000).optional(),
    points: Joi.number().positive().default(1),
    codeLanguage: Joi.string().optional(),
    starterCode: Joi.string().optional(),
    difficulty: Joi.string()
      .valid("easy", "medium", "hard")
      .default("medium"),
    order: Joi.number().min(0).optional(),
  });

  return schema.validate(data, { abortEarly: false });
};