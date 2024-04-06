import Joi from "joi";

export const GroupSchema: Joi.ObjectSchema = Joi.object({
  name: Joi.string()
    .min(1)
    .max(60)
    .required(),
  createdBy: Joi.number().integer(),
  updateBy: Joi.number().integer(),
  is_active: Joi.boolean().default(true),
});

export const updateNameGroup: Joi.ObjectSchema = Joi.object({
  name: Joi.string()
    .min(1)
    .max(60)
    .required(),
  updatedBy: Joi.number().integer(),
});
