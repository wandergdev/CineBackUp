import Joi from "joi";

export const CreateDepartmentSchema: Joi.ObjectSchema = Joi.object({
  name: Joi.string()
    .max(255)
    .required(),
  description: Joi.string()
    .max(255)
    .allow(""),
});

export const UpdateDepartmentSchema: Joi.ObjectSchema = Joi.object({
  name: Joi.string().max(255),
  description: Joi.string()
    .max(255)
    .allow(""),
});
