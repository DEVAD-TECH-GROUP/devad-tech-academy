import Joi from "joi";

export const createAssignmentValidator = (data) => {
  const schema = Joi.object({
    title: Joi.string().min(3).max(100).required(),
    description: Joi.string().min(10).max(5000).required(),
    instructions: Joi.string().max(5000).optional(),
    dueDate: Joi.date().greater("now").required(),
    totalPoints: Joi.number().positive().default(100),
    passingPoints: Joi.number().positive().default(50),
    allowLateSubmission: Joi.boolean().default(false),
    latePenaltyPercent: Joi.number().min(0).max(100).default(0),
    rubric: Joi.array()
      .items(
        Joi.object({
          criterion: Joi.string().required(),
          description: Joi.string().optional(),
          points: Joi.number().positive().required(),
        })
      )
      .optional(),
  });

  return schema.validate(data, { abortEarly: false });
};