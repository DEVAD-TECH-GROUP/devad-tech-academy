import Joi from "joi";

const registerValidator = (data) => {
  const schema = Joi.object({
    firstName: Joi.string()
      .min(2)
      .max(50)
      .required()
      .messages({
        "string.min": "First name must be at least 2 characters",
        "string.max": "First name cannot exceed 50 characters",
        "any.required": "First name is required",
      }),
    lastName: Joi.string()
      .min(2)
      .max(50)
      .required()
      .messages({
        "string.min": "Last name must be at least 2 characters",
        "string.max": "Last name cannot exceed 50 characters",
        "any.required": "Last name is required",
      }),
    email: Joi.string()
      .email()
      .required()
      .messages({
        "string.email": "Please enter a valid email",
        "any.required": "Email is required",
      }),
    password: Joi.string()
      .min(8)
      .max(50)
      .pattern(
        new RegExp(
          "^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])"
        )
      )
      .required()
      .messages({
        "string.min": "Password must be at least 8 characters",
        "string.pattern.base":
          "Password must contain uppercase, lowercase, and number",
        "any.required": "Password is required",
      }),
    phone: Joi.string()
      .pattern(/^[0-9+\-\s]{10,15}$/)
      .optional()
      .messages({
        "string.pattern.base": "Please enter a valid phone number",
      }),
    referralCode: Joi.string().optional(),
    role: Joi.string()
      .valid("student", "instructor")
      .default("student"),
  });

  return schema.validate(data, { abortEarly: false });
};

export default registerValidator;