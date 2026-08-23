import Joi from "joi";

const loginValidator = (data) => {
  const schema = Joi.object({
    email: Joi.string()
      .email()
      .required()
      .messages({
        "string.email": "Please enter a valid email",
        "any.required": "Email is required",
      }),
    password: Joi.string()
      .required()
      .messages({
        "any.required": "Password is required",
      }),
  });

  return schema.validate(data, { abortEarly: false });
};

export default loginValidator;