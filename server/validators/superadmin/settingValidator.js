import Joi from "joi";

export const updateSettingValidator = (data) => {
  const schema = Joi.object({
    general: Joi.object({
      academyName: Joi.string().optional(),
      academyEmail: Joi.string().email().optional(),
      academyPhone: Joi.string().optional(),
      domain: Joi.string().optional(),
      timezone: Joi.string().optional(),
      language: Joi.string().optional(),
      currency: Joi.string().optional(),
    }).optional(),
    branding: Joi.object({
      primaryColor: Joi.string().optional(),
      secondaryColor: Joi.string().optional(),
    }).optional(),
    maintenance: Joi.object({
      isEnabled: Joi.boolean().optional(),
      message: Joi.string().optional(),
      estimatedEnd: Joi.date().optional(),
    }).optional(),
    payments: Joi.object({
      activeGateway: Joi.string()
        .valid("paystack", "flutterwave")
        .optional(),
      monthlyPlanAmount: Joi.number().positive().optional(),
      annualPlanAmount: Joi.number().positive().optional(),
      platformFeePercent: Joi.number().min(0).max(100).optional(),
    }).optional(),
    security: Joi.object({
      maxLoginAttempts: Joi.number().min(3).max(10).optional(),
      sessionTimeout: Joi.number().min(5).optional(),
      force2FAForAdmins: Joi.boolean().optional(),
    }).optional(),
    ai: Joi.object({
      isChatbotEnabled: Joi.boolean().optional(),
      isTutorEnabled: Joi.boolean().optional(),
      maxTokensPerRequest: Joi.number().positive().optional(),
    }).optional(),
    notifications: Joi.object({
      isPushEnabled: Joi.boolean().optional(),
      isEmailEnabled: Joi.boolean().optional(),
      isSMSEnabled: Joi.boolean().optional(),
    }).optional(),
  });

  return schema.validate(data, { abortEarly: false });
};