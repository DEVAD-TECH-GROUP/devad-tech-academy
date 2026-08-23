import Joi from "joi";

export const createCouponValidator = (data) => {
  const schema = Joi.object({
    code: Joi.string().min(3).max(20).required(),
    description: Joi.string().max(200).optional(),
    discountType: Joi.string()
      .valid("percentage", "fixed")
      .required(),
    discountValue: Joi.number().positive().required(),
    maxDiscount: Joi.number().positive().optional(),
    validFrom: Joi.date().optional(),
    validUntil: Joi.date().required(),
    maxUsage: Joi.number().positive().optional(),
    maxUsagePerUser: Joi.number().positive().default(1),
    applicableTo: Joi.string()
      .valid("all", "subscription", "course")
      .default("all"),
    minimumAmount: Joi.number().min(0).default(0),
  });

  return schema.validate(data, { abortEarly: false });
};