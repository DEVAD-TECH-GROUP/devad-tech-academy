import Joi from "joi";

const registerValidator = (data) => {
  const schema = Joi.object({
    // ============================================================
    // FIRST NAME
    // ============================================================

    firstName: Joi.string()
      .trim()
      .min(2)
      .max(50)
      .required()
      .messages({
        "string.empty": "First name is required",
        "string.min":
          "First name must be at least 2 characters",
        "string.max":
          "First name cannot exceed 50 characters",
        "any.required": "First name is required",
      }),

    // ============================================================
    // LAST NAME
    // ============================================================

    lastName: Joi.string()
      .trim()
      .min(2)
      .max(50)
      .required()
      .messages({
        "string.empty": "Last name is required",
        "string.min":
          "Last name must be at least 2 characters",
        "string.max":
          "Last name cannot exceed 50 characters",
        "any.required": "Last name is required",
      }),

    // ============================================================
    // EMAIL
    // ============================================================

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

    // ============================================================
    // PASSWORD
    //
    // Requirements:
    // - At least 8 characters
    // - At least 1 uppercase letter
    // - At least 1 lowercase letter
    // - At least 1 number
    // ============================================================

    password: Joi.string()
      .min(8)
      .max(50)
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/)
      .required()
      .messages({
        "string.empty": "Password is required",
        "string.min":
          "Password must be at least 8 characters",
        "string.max":
          "Password cannot exceed 50 characters",
        "string.pattern.base":
          "Password must contain at least one uppercase letter, one lowercase letter, and one number",
        "any.required": "Password is required",
      }),

    // ============================================================
    // PHONE
    //
    // IMPORTANT:
    //
    // Phone is intentionally NOT included here.
    //
    // The registration flow is:
    //
    // Account creation
    //      ↓
    // Email verification
    //      ↓
    // Phone collection
    //      ↓
    // Phone verification
    //
    // Therefore the initial registration request must NOT
    // require a phone number.
    // ============================================================

    // ============================================================
    // REFERRAL CODE
    // ============================================================

    referralCode: Joi.string()
      .trim()
      .max(30)
      .allow("")
      .optional()
      .messages({
        "string.max":
          "Referral code cannot exceed 30 characters",
      }),

    // ============================================================
    // ROLE
    //
    // Public registration can only create:
    // - student
    // - instructor
    //
    // Owner/admin/superadmin must never be selectable
    // through public registration.
    // ============================================================

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
