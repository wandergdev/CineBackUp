import { AuthType } from "@/db/models/User/types/AuthType";
import Joi from "joi";

export const UserSchema: Joi.ObjectSchema = Joi.object({
  name: Joi.string()
    .max(255)
    .allow(null),
  firstName: Joi.string()
    .max(255)
    .allow(null),
  lastName: Joi.string()
    .max(255)
    .allow(null),
  email: Joi.string()
    .email()
    .max(255),
  password: Joi.string()
    .min(8)
    .max(255),
  authType: Joi.string().valid(
    AuthType.Email,
    AuthType.Microsoft,
    AuthType.Google,
  ),
  employeeId: Joi.number().integer(),
});

export const UserManagementCreateSchema: Joi.ObjectSchema = Joi.object({
  firstName: Joi.string().max(255),
  lastName: Joi.string()
    .max(255)
    .allow(null)
    .allow(""),
  email: Joi.string()
    .email()
    .max(255),
  password: Joi.string().when("authType", {
    is: AuthType.Email,
    then: Joi.string()
      .min(8)
      .max(255)
      .required(),
    otherwise: Joi.string()
      .allow(null)
      .allow(""),
  }),
  authType: Joi.string().valid(
    AuthType.Email,
    AuthType.Microsoft,
    AuthType.Google,
  ),
  roleId: Joi.number(),
  employeeId: Joi.number().integer(),
});

export const UserManagementUpdateSchema: Joi.ObjectSchema = Joi.object({
  firstName: Joi.string().max(255),
  lastName: Joi.string()
    .max(255)
    .allow(null)
    .allow(""),
  roleId: Joi.number(),
  employeeId: Joi.number().integer(),
});
