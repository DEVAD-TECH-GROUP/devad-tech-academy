import Joi from "joi";

export const createCourseValidator = (data) => {
  const schema = Joi.object({
    title: Joi.string().min(5).max(100).required(),
    description: Joi.string().min(20).max(2000).required(),
    shortDescription: Joi.string().max(200).optional(),
    category: Joi.string().required(),
    level: Joi.string()
      .valid("beginner", "intermediate", "advanced")
      .default("beginner"),
    language: Joi.string().default("English"),
    price: Joi.number().min(0).default(0),
    isFree: Joi.boolean().default(false),
    prerequisites: Joi.array().items(Joi.string()).optional(),
    learningOutcomes: Joi.array().items(Joi.string()).min(1).required(),
    tags: Joi.array().items(Joi.string()).optional(),
    settings: Joi.object({
      enrollmentType: Joi.string()
        .valid("open", "invite")
        .default("open"),
      hasCertificate: Joi.boolean().default(true),
      hasDiscussion: Joi.boolean().default(true),
      dripContent: Joi.boolean().default(false),
      allowDownloads: Joi.boolean().default(true),
    }).optional(),
  });

  return schema.validate(data, { abortEarly: false });
};

export const updateCourseValidator = (data) => {
  const schema = Joi.object({
    title: Joi.string().min(5).max(100).optional(),
    description: Joi.string().min(20).max(2000).optional(),
    shortDescription: Joi.string().max(200).optional(),
    category: Joi.string().optional(),
    level: Joi.string()
      .valid("beginner", "intermediate", "advanced")
      .optional(),
    price: Joi.number().min(0).optional(),
    isFree: Joi.boolean().optional(),
    prerequisites: Joi.array().items(Joi.string()).optional(),
    learningOutcomes: Joi.array().items(Joi.string()).optional(),
    tags: Joi.array().items(Joi.string()).optional(),
    settings: Joi.object().optional(),
  });

  return schema.validate(data, { abortEarly: false });
};