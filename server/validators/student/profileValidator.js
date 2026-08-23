import Joi from "joi";

export const updateProfileValidator = (data) => {
  const schema = Joi.object({
    firstName: Joi.string().min(2).max(50).optional(),
    lastName: Joi.string().min(2).max(50).optional(),
    phone: Joi.string().optional(),
    bio: Joi.string().max(500).optional(),
    headline: Joi.string().max(100).optional(),
    location: Joi.string().optional(),
    timezone: Joi.string().optional(),
    language: Joi.string().optional(),
    theme: Joi.string().valid("dark", "light").optional(),
    socialLinks: Joi.object({
      github: Joi.string().uri().optional().allow(""),
      linkedin: Joi.string().uri().optional().allow(""),
      twitter: Joi.string().uri().optional().allow(""),
      website: Joi.string().uri().optional().allow(""),
    }).optional(),
    notificationPreferences: Joi.object({
      email: Joi.boolean().optional(),
      push: Joi.boolean().optional(),
      sms: Joi.boolean().optional(),
      assignments: Joi.boolean().optional(),
      liveClasses: Joi.boolean().optional(),
      quizzes: Joi.boolean().optional(),
      announcements: Joi.boolean().optional(),
      community: Joi.boolean().optional(),
    }).optional(),
    dailyGoalMinutes: Joi.number().min(15).max(480).optional(),
  });

  return schema.validate(data, { abortEarly: false });
};