import Joi from "joi";

export const createPostSchema = {
  headers: Joi.object({
    authentication: Joi.string().required(),
  }).unknown(true),
  body: Joi.object({
    content: Joi.string().min(3).max(200).required(),
  }),
};
export const updatePostSchema = {
  body: Joi.object({
    newContent: Joi.string().min(3).max(200),
    postId: Joi.string().required(),
  }),
  headers: Joi.object({
    authentication: Joi.string().required(),
  }).unknown(true),
};
export const freezePostSchema = {
  headers: Joi.object({
    authentication: Joi.string().required(),
  }).unknown(true),
  params: Joi.object({
    postId: Joi.string().required(),
  }),
};
export const unfreezePostSchema = {
  headers: Joi.object({
    authentication: Joi.string().required(),
  }).unknown(true),
  params: Joi.object({
    postId: Joi.string().required(),
  }),
}
export const likeOrUnlikePostSchema = {
  headers: Joi.object({
    authentication: Joi.string().required(),
  }).unknown(true),
  params: Joi.object({
    postId: Joi.string().required(),
  }),
}
export const undoPostSchema = {
  headers: Joi.object({
    authentication: Joi.string().required(),
  }).unknown(true),
  params: Joi.object({
    postId: Joi.string().required(),
  }),
}
export const archivePostSchema = {
  headers: Joi.object({
    authentication: Joi.string().required(),
  }).unknown(true),
  params: Joi.object({
    postId: Joi.string().required(),
  }),
}
export const getPublicPostsSchema = {
  headers: Joi.object({
    authentication: Joi.string().required(),
  }).unknown(true),
}
export const getFriendPostsSchema = {
  headers : Joi.object({
    authentication: Joi.string().required(),
  }).unknown(true),
}
export const getUserPostsSchema = {
  headers : Joi.object({
    authentication : Joi.string().required()
  }).unknown(true),
  body: Joi.array()
}