import Joi from "joi";

export const submitAssignmentValidator = (data) => {
  const schema = Joi.object({
    content: Joi.string().max(5000).optional(),
    links: Joi.array()
      .items(
        Joi.object({
          label: Joi.string().optional(),
          url: Joi.string().uri().required(),
        })
      )
      .optional(),
  });

  return schema.validate(data, { abortEarly: false });
};

export const submitQuizValidator = (data) => {
  const schema = Joi.object({
    answers: Joi.array()
      .items(
        Joi.object({
          question: Joi.string().required(),
          selectedOption: Joi.string().optional().allow(null),
          textAnswer: Joi.string().optional().allow(null),
          codeAnswer: Joi.string().optional().allow(null),
          timeTaken: Joi.number().min(0).optional(),
        })
      )
      .required(),
    timeTaken: Joi.number().min(0).required(),
  });

  return schema.validate(data, { abortEarly: false });
};

export const submitProjectValidator = (data) => {
  const schema = Joi.object({
    description: Joi.string().max(2000).optional(),
    githubUrl: Joi.string().uri().optional().allow(""),
    liveUrl: Joi.string().uri().optional().allow(""),
    videoDemo: Joi.string().uri().optional().allow(""),
    teamMembers: Joi.array().items(Joi.string()).optional(),
  });

  return schema.validate(data, { abortEarly: false });
};