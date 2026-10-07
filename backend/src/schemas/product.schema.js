import Joi from "joi";

export const createProductSchema = Joi.object({
  name: Joi.string().trim().max(128).required(),
  price: Joi.number().integer().min(0).required(),
  stock_qty: Joi.number().integer().min(0).required(),
});

export const queryProductSchema = Joi.object({
  search: Joi.string().trim().allow("").default(""),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
});
