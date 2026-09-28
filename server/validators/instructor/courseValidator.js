import Joi from "joi";

const settingsSchema = Joi.object({
  enrollmentType: Joi.string()
    .valid("open", "invite")
    .default("open"),

  hasCertificate: Joi.boolean()
    .default(true),

  hasDiscussion: Joi.boolean()
    .default(true),

  dripContent: Joi.boolean()
    .default(false),

  allowDownloads: Joi.boolean()
    .default(true),
});

const installmentsSchema = Joi.object({
  enabled: Joi.boolean()
    .default(false),

  amount: Joi.number()
    .min(0)
    .default(0),

  count: Joi.number()
    .integer()
    .min(0)
    .default(0),

  interval: Joi.string()
    .valid("weekly", "monthly")
    .default("monthly"),
});

const liveClassesSchema = Joi.object({
  enabled: Joi.boolean()
    .default(false),

  frequency: Joi.string()
    .valid(
      "once",
      "weekly",
      "twice-weekly",
      "three-times-weekly",
      "custom"
    )
    .default("weekly"),

  duration: Joi.number()
    .integer()
    .min(15)
    .default(60),

  platform: Joi.string()
    .valid(
      "google-meet",
      "zoom",
      "microsoft-teams",
      "other"
    )
    .default("google-meet"),

  description: Joi.string()
    .max(500)
    .allow("", null)
    .default(null),
});

export const createCourseValidator = (data) => {
  const schema = Joi.object({
    title: Joi.string()
      .min(5)
      .max(100)
      .required(),

    subtitle: Joi.string()
      .max(200)
      .allow("", null)
      .optional(),

    shortDescription: Joi.string()
      .max(200)
      .allow("", null)
      .optional(),

    description: Joi.string()
      .min(20)
      .max(5000)
      .required(),

    category: Joi.string()
      .required(),

    level: Joi.string()
      .valid(
        "beginner",
        "intermediate",
        "advanced"
      )
      .default("beginner"),

    language: Joi.string()
      .default("English"),

    tags: Joi.array()
      .items(Joi.string().trim())
      .default([]),

    technologies: Joi.array()
      .items(Joi.string().trim())
      .default([]),

    prerequisites: Joi.array()
      .items(Joi.string().trim())
      .default([]),

    learningOutcomes: Joi.array()
      .items(Joi.string().trim())
      .min(1)
      .required(),

    price: Joi.number()
      .min(0)
      .default(0),

    isFree: Joi.boolean()
      .default(false),

    discountPrice: Joi.number()
      .min(0)
      .allow(null)
      .default(null),

    discountExpiry: Joi.date()
      .allow(null)
      .default(null),

    installments: installmentsSchema
      .default(),

    settings: settingsSchema
      .default(),

    liveClasses: liveClassesSchema
      .default(),
  });

  return schema.validate(data, {
    abortEarly: false,
    stripUnknown: true,
  });
};

export const updateCourseValidator = (data) => {
  const schema = Joi.object({
    title: Joi.string()
      .min(5)
      .max(100)
      .optional(),

    subtitle: Joi.string()
      .max(200)
      .allow("", null)
      .optional(),

    shortDescription: Joi.string()
      .max(200)
      .allow("", null)
      .optional(),

    description: Joi.string()
      .min(20)
      .max(5000)
      .optional(),

    category: Joi.string()
      .optional(),

    level: Joi.string()
      .valid(
        "beginner",
        "intermediate",
        "advanced"
      )
      .optional(),

    language: Joi.string()
      .optional(),

    tags: Joi.array()
      .items(Joi.string().trim())
      .optional(),

    technologies: Joi.array()
      .items(Joi.string().trim())
      .optional(),

    prerequisites: Joi.array()
      .items(Joi.string().trim())
      .optional(),

    learningOutcomes: Joi.array()
      .items(Joi.string().trim())
      .optional(),

    price: Joi.number()
      .min(0)
      .optional(),

    isFree: Joi.boolean()
      .optional(),

    discountPrice: Joi.number()
      .min(0)
      .allow(null)
      .optional(),

    discountExpiry: Joi.date()
      .allow(null)
      .optional(),

    installments: installmentsSchema
      .optional(),

    settings: settingsSchema
      .optional(),

    liveClasses: liveClassesSchema
      .optional(),
  });

  return schema.validate(data, {
    abortEarly: false,
    stripUnknown: true,
  });
};
