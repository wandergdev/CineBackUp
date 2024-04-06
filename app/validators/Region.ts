import Joi from "joi";

export const CreateRegionSchema: Joi.ObjectSchema = Joi.object({
  name: Joi.string()
    .max(255)
    .required(),
  regionCodeAlphaThree: Joi.string()
    .max(255)
    .required(),
});

export const UpdateRegionSchema: Joi.ObjectSchema = Joi.object({
  name: Joi.string().max(255),

  regionCodeAlphaThree: Joi.string()
    .max(255)
    .required(),
});
