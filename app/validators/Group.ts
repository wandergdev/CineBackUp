import Joi from "joi";

export const FunctionSchema = Joi.object({
  salaId: Joi.number().required(),
  horario: Joi.date().required(),
});
