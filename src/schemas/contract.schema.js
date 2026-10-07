import Joi from "joi";

const itemSchema = Joi.object({
  product_id: Joi.number().integer().required(),
  qty: Joi.number().integer().min(1).required(),
});

export const calculateSchema = Joi.object({
  customer_id: Joi.number().integer().required(),
  items: Joi.array().items(itemSchema).min(1).required(),
  months: Joi.number().valid(3, 6, 12).required(),
  down_payment: Joi.number().integer().min(0).required(),
});

export const createContractSchema = Joi.object({
  customer_id: Joi.number().integer().required(),
  items: Joi.array().items(itemSchema).min(1).required(),
  months: Joi.number().valid(3, 6, 12).required(),
  down_payment: Joi.number().integer().min(0).required(),
});

export const paymentSchema = Joi.object({
  amount: Joi.number().integer().min(1).required(),
  idempotency_key: Joi.string().uuid().required(),
});
