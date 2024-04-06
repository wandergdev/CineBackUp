import Joi from "joi";

export const AuthLoginSchema: Joi.ObjectSchema = Joi.object({
  email: Joi.string()
    .email()
    .max(255)
    .required(),
  password: Joi.string()
    .max(255)
    .required(),
});

export const AuthRegisterSchema: Joi.ObjectSchema = Joi.object({
  name: Joi.string()
    .max(255)
    .allow(null),
  email: Joi.string()
    .email()
    .max(255)
    .required(),
  password: Joi.string()
    .min(8)
    .max(255)
    .required(),
  locale: Joi.string()
    .valid("en", "es")
    .allow(null),
  timezone: Joi.string()
    .max(255)
    .allow(null),
});

export const AuthResetPostSchema: Joi.ObjectSchema = Joi.object({
  token: Joi.string().allow(""),
  email: Joi.string()
    .email()
    .max(255),
  password: Joi.string()
    .min(8)
    .max(255)
    .allow(""),
});

export const AuthChangeSchema: Joi.ObjectSchema = Joi.object({
  email: Joi.string()
    .email()
    .max(255)
    .required(),
  oldPass: Joi.string()
    .min(8)
    .max(255)
    .required(),
  newPass: Joi.string()
    .min(8)
    .max(255)
    .required(),
});

export const AuthResendConfirmSchema: Joi.ObjectSchema = Joi.object({
  email: Joi.string()
    .email()
    .max(255),
});

export const AuthResetPasswordSchema: Joi.ObjectSchema = Joi.object({
  email: Joi.string()
    .email()
    .max(255)
    .required(),
});

export const AuthCreatePasswordSchema: Joi.ObjectSchema = Joi.object({
  password: Joi.string()
    .min(8)
    .max(255)
    .required(),
});
