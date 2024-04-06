import Joi from "joi";

export const GroupMembersSchema: Joi.ObjectSchema = Joi.object({
  group_id: Joi.number()
    .max(255)
    .required(),
  member_id: Joi.number()
    .max(255)
    .allow(""),
});

export const UpdateGroupMembersSchema: Joi.ObjectSchema = Joi.object({
  name: Joi.string().max(255),
  description: Joi.string()
    .max(255)
    .allow(""),
});
