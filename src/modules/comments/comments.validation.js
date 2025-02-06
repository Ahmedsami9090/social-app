import Joi from "joi";



export const createCommentSchema = {
    headers : Joi.object({
        authentication : Joi.string().required()
    }).unknown(true),
    params : Joi.object({
        postId : Joi.string().required()
    }).unknown(false),
    body : Joi.object({
        content : Joi.string().min(3).max(200).required()
    })
}
export const updateCommentSchema = {
    headers : Joi.object({
        authentication : Joi.string().required()
    }).unknown(true),
    params : Joi.object({
        commentId : Joi.string().required()
    }).unknown(false),
    body : Joi.object({
        content : Joi.string().min(3).max(200).required()
    })
}
export const freezeCommentSchema = {
    headers : Joi.object({
        authentication : Joi.string().required()
    }).unknown(true),
    params : Joi.object({
        commentId : Joi.string().required()
    }).unknown(false),
}