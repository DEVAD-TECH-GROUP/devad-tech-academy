import Joi from "joi";

export const createReviewValidator = (data) => {
  const schema = Joi.object({
    rating: Joi.number().min(1).max(5).required(),
    title: Joi.string().max(100).optional(),
    content: Joi.string().min(10).max(2000).required(),
    detailedRatings: Joi.object({
      contentQuality: Joi.number().min(1).max(5).optional(),
      instructorRating: Joi.number().min(1).max(5).optional(),
      valueForMoney: Joi.number().min(1).max(5).optional(),
      support: Joi.number().min(1).max(5).optional(),
    }).optional(),
  });

  return schema.validate(data, { abortEarly: false });
};