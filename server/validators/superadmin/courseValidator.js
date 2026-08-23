import Joi from "joi";

export const createCategoryValidator = (data) => {
  const schema = Joi.object({
    name: Joi.string().min(2).max(50).required(),
    description: Joi.string().max(200).optional(),
    icon: Joi.string().optional(),
    color: Joi.string().optional(),
  });

  return schema.validate(data, { abortEarly: false });
};

export const approveCourseValidator = (data) => {
  const schema = Joi.object({
    action: Joi.string().valid("approve", "reject").required(),
    reason: Joi.string().when("action", {
      is: "reject",
      then: Joi.required(),
      otherwise: Joi.optional(),
    }),
  });

  return schema.validate(data, { abortEarly: false });
};