import Joi from "joi";


export const createPostSchema = {
  headers: Joi.object({
    authentication: Joi.string().required(),
  }).unknown(true),
};
