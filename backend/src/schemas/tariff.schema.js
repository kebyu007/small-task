import Joi from "joi";

export const updateTariffSchema = Joi.object({
  params: Joi.object({
    months: Joi.number().valid(3, 6, 12).required(),
  }),
  body: Joi.object({
    markup_percent: Joi.number().integer().min(0).required(),
  }),
});
