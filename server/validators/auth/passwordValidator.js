import Joi from "joi";

export const forgotPasswordValidator = (data) => {
  const schema = Joi.object({
    email: Joi.string()
      .email()
      .required()
      .messages({
        "string.email": "Please enter a valid email",
        "any.required": "Email is required",
      }),
  });

  return schema.validate(data, { abortEarly: false });
};

export const resetPasswordValidator = (data) => {
  const schema = Joi.object({
    token: Joi.string().required(),
    password: Joi.string()
      .min(8)
      .max(50)
      .pattern(
        new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])")
      )
      .required()
      .messages({
        "string.min": "Password must be at least 8 characters",
        "string.pattern.base":
          "Password must contain uppercase, lowercase, and number",
        "any.required": "Password is required",
      }),
    confirmPassword: Joi.string()
      .valid(Joi.ref("password"))
      .required()
      .messages({
        "any.only": "Passwords do not match",
        "any.required": "Confirm password is required",
      }),
  });

  return schema.validate(data, { abortEarly: false });
};

export const changePasswordValidator = (data) => {
  const schema = Joi.object({
    currentPassword: Joi.string()
      .required()
      .messages({
        "any.required": "Current password is required",
      }),
    newPassword: Joi.string()
      .min(8)
      .max(50)
      .pattern(
        new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])")
      )
      .required()
      .messages({
        "string.min": "Password must be at least 8 characters",
        "string.pattern.base":
          "Password must contain uppercase, lowercase, and number",
        "any.required": "New password is required",
      }),
    confirmPassword: Joi.string()
      .valid(Joi.ref("newPassword"))
      .required()
      .messages({
        "any.only": "Passwords do not match",
      }),
  });

  return schema.validate(data, { abortEarly: false });
};