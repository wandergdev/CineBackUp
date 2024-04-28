import Joi from "joi";

export const SalaSchema: Joi.ObjectSchema = Joi.object({
  name: Joi.string()
    .min(1)
    .max(60)
    .required(),
  capacity: Joi.number()
    .integer()
    .required(),
  type: Joi.string().default("HD"),
});
