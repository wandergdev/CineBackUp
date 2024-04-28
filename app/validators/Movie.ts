import Joi from "joi";

export const MovieSchema: Joi.ObjectSchema = Joi.object({
  name: Joi.string().required(),
  fecha_lanzamiento: Joi.date(),
  duration: Joi.number()
    .integer()
    .required(),
  poster_path: Joi.string().required(),
  description: Joi.string(),
  genero: Joi.string(),
  rating: Joi.number().integer(),
  external_id: Joi.number().integer(),
});
