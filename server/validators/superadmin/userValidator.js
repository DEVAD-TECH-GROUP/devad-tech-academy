import Joi from "joi";

export const createUserValidator = (data) => {
  const schema = Joi.object({
    firstName: Joi.string().min(2).max(50).required(),
    lastName: Joi.string().min(2).max(50).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
    role: Joi.string()
      .valid("super_admin", "instructor", "student")
      .required(),
    phone: Joi.string().optional(),
  });

  return schema.validate(data, { abortEarly: false });
};

export const updateUserValidator = (data) => {
  const schema = Joi.object({
    firstName: Joi.string().min(2).max(50).optional(),
    lastName: Joi.string().min(2).max(50).optional(),
    email: Joi.string().email().optional(),
    phone: Joi.string().optional(),
    status: Joi.string()
      .valid("active", "suspended", "inactive")
      .optional(),
    role: Joi.string()
      .valid("super_admin", "instructor", "student")
      .optional(),
  });

  return schema.validate(data, { abortEarly: false });
};