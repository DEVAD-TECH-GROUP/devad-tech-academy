import Joi from "joi";

const registerValidator = (data) => {
  const schema = Joi.object({
    // ─────────────────────────────────────────────────────────────
    // FIRST NAME
    // ─────────────────────────────────────────────────────────────
    firstName: Joi.string()
      .trim()
      .min(2)
      .max(50)
      .required()
      .messages({
        "string.empty": "First name is required",
        "string.min": "First name must be at least 2 characters",
        "string.max": "First name cannot exceed 50 characters",
        "any.required": "First name is required",
      }),

    // ─────────────────────────────────────────────────────────────
    // LAST NAME
    // ─────────────────────────────────────────────────────────────
    lastName: Joi.string()
      .trim()
      .min(2)
      .max(50)
      .required()
      .messages({
        "string.empty": "Last name is required",
        "string.min": "Last name must be at least 2 characters",
        "string.max": "Last name cannot exceed 50 characters",
        "any.required": "Last name is required",
      }),

    // ─────────────────────────────────────────────────────────────
    // EMAIL
    // ─────────────────────────────────────────────────────────────
    email: Joi.string()
      .trim()
      .lowercase()
      .email({
        minDomainSegments: 2,
        tlds: {
          allow: true,
        },
      })
      .required()
      .messages({
        "string.empty": "Email is required",
        "string.email": "Please enter a valid email",
        "any.required": "Email is required",
      }),

    // ─────────────────────────────────────────────────────────────
    // PASSWORD
    // At least:
    // - 8 characters
    // - 1 uppercase
    // - 1 lowercase
    // - 1 number
    // ─────────────────────────────────────────────────────────────
    password: Joi.string()
      .min(8)
      .max(50)
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/)
      .required()
      .messages({
        "string.empty": "Password is required",
        "string.min": "Password must be at least 8 characters",
        "string.max": "Password cannot exceed 50 characters",
        "string.pattern.base":
          "Password must contain at least one uppercase letter, one lowercase letter, and one number",
        "any.required": "Password is required",
      }),

    // ─────────────────────────────────────────────────────────────
    // PHONE
    //
    // Accepted examples:
    // 08012345678
    // +2348012345678
    // 2348012345678
    // 0801-234-5678
    //
    // The controller will normalize it before saving.
    // ─────────────────────────────────────────────────────────────
    phone: Joi.string()
      .trim()
      .pattern(/^[0-9+\-\s()]{10,20}$/)
      .required()
      .messages({
        "string.empty": "Phone number is required",
        "string.pattern.base": "Please enter a valid phone number",
        "any.required": "Phone number is required",
      }),

    // ─────────────────────────────────────────────────────────────
    // REFERRAL CODE
    // ─────────────────────────────────────────────────────────────
    referralCode: Joi.string()
      .trim()
      .max(30)
      .allow("")
      .optional()
      .messages({
        "string.max": "Referral code cannot exceed 30 characters",
      }),

    // ─────────────────────────────────────────────────────────────
    // ROLE
    //
    // Public registration can only create:
    // - student
    // - instructor
    //
    // Owner/admin/superadmin must NEVER be selectable
    // from the public registration form.
    // ─────────────────────────────────────────────────────────────
    role: Joi.string()
      .valid("student", "instructor")
      .default("student")
      .messages({
        "any.only": "Invalid registration role",
      }),
  }).unknown(false);

  return schema.validate(data, {
    abortEarly: false,
    stripUnknown: true,
  });
};

export default registerValidator;
