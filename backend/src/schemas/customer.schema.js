import Joi from "joi";

export const createCustomerSchema = Joi.object({
  full_name: Joi.string().trim().max(255).required(),
  phone: Joi.string().trim().max(13).required(),
  credit_limit: Joi.number().integer().min(0).required(),
});
