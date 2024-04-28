import Joi from "joi";

export const FuncionSchema: Joi.ObjectSchema = Joi.object({
  movieId: Joi.number()
    .integer()
    .required(),
  salaId: Joi.number()
    .integer()
    .required(),
  startTime: Joi.string().required(),
  duration: Joi.number().integer(),
  status: Joi.string().default("Programada"),
});
