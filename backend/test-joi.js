import Joi from 'joi';

const schema = Joi.object({
  phone: Joi.string().trim().max(13).required(),
});

const result1 = schema.validate({ phone: "+998 90 123 45 67" });
console.log("17 chars:", result1.error ? result1.error.message : "Passes");

const result2 = schema.validate({ phone: "+998901234567" });
console.log("13 chars:", result2.error ? result2.error.message : "Passes");
