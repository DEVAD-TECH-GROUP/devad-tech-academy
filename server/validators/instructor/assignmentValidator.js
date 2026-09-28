import Joi from "joi";

export const createAssignmentValidator = (data) => {
  const schema = Joi.object({
    // ── Course ──────────────────────────────────────────
    course: Joi.string()
      .hex()
      .length(24)
      .required()
      .messages({
        "string.length": "Course ID must be a valid MongoDB ObjectId",
        "any.required": "Course is required",
      }),

    // ── Basic information ──────────────────────────────
    title: Joi.string()
      .min(3)
      .max(100)
      .required(),

    description: Joi.string()
      .min(10)
      .max(5000)
      .required(),

    instructions: Joi.string()
      .max(5000)
      .allow("", null)
      .optional(),

    // ── Attachments ────────────────────────────────────
    attachments: Joi.array()
      .items(
        Joi.object({
          name: Joi.string().allow("", null),
          url: Joi.string().uri().allow("", null),
          public_id: Joi.string().allow("", null),
          type: Joi.string().allow("", null),
        })
      )
      .default([]),

    // ── Due date ────────────────────────────────────────
    dueDate: Joi.date()
      .greater("now")
      .required(),

    // ── Points ──────────────────────────────────────────
    totalPoints: Joi.number()
      .positive()
      .default(100),

    passingPoints: Joi.number()
      .positive()
      .default(50),

    // ── Rubric ──────────────────────────────────────────
    rubric: Joi.array()
      .items(
        Joi.object({
          criterion: Joi.string()
            .min(1)
            .required(),

          description: Joi.string()
            .allow("", null)
            .optional(),

          points: Joi.number()
            .positive()
            .required(),
        })
      )
      .default([]),

    // ── Submission settings ────────────────────────────
    allowLateSubmission: Joi.boolean()
      .default(false),

    latePenaltyPercent: Joi.number()
      .min(0)
      .max(100)
      .default(0),

    maxFileSize: Joi.number()
      .positive()
      .max(500)
      .default(50),

    allowedFileTypes: Joi.array()
      .items(
        Joi.string().trim().min(1)
      )
      .default([]),

    // ── Status ──────────────────────────────────────────
    isPublished: Joi.boolean()
      .default(false),
  })
    // Make sure passing points don't exceed total points
    .custom((value, helpers) => {
      if (value.passingPoints > value.totalPoints) {
        return helpers.error("any.invalid", {
          message:
            "Passing points cannot exceed total points",
        });
      }

      return value;
    })
    .messages({
      "any.invalid":
        "{{#message}}",
    });

  return schema.validate(data, {
    abortEarly: false,
    stripUnknown: true,
  });
};
