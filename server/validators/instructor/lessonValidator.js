import Joi from "joi";

export const createLessonValidator = (data) => {
  const schema = Joi.object({
    title: Joi.string().min(3).max(100).required(),
    description: Joi.string().max(500).optional(),
    type: Joi.string()
      .valid("video", "text", "quiz", "assignment", "live")
      .default("video"),
    content: Joi.string().optional(),
    order: Joi.number().min(0).required(),
    isFreePreview: Joi.boolean().default(false),
    notes: Joi.string().optional(),
  });

  return schema.validate(data, { abortEarly: false });
};

export const updateLessonValidator = (data) => {
  const schema = Joi.object({
    title: Joi.string().min(3).max(100).optional(),
    description: Joi.string().max(500).optional(),
    type: Joi.string()
      .valid("video", "text", "quiz", "assignment", "live")
      .optional(),
    content: Joi.string().optional(),
    order: Joi.number().min(0).optional(),
    isFreePreview: Joi.boolean().optional(),
    notes: Joi.string().optional(),
  });

  return schema.validate(data, { abortEarly: false });
};