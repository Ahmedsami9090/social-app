import Joi from "joi";

export const signupSchema = {
  body: Joi.object({
    name: Joi.string()
      .min(3)
      .max(50)
      .pattern(/^[a-z A-Z]+$/)
      .required(),
    email: Joi.string()
      .email({ tlds: ["com", "org"], minDomainSegments: 2 })
      .required(),
    phone: Joi.string()
      .regex(/^(\+201|01|00201)[0-2,5]{1}[0-9]{8}/)
      .required(),
    password: Joi.string().min(6).required(),
    cPassword: Joi.valid(Joi.ref("password")).required(),
  }).unknown(false),
};
export const confirmEmailSchema = {
  body : Joi.object({
    otp : Joi.number().min(0).max(9999).required(),
    email : Joi.string()
    .email({ tlds: ["com", "org"], minDomainSegments: 2 })
    .required(),
  }).unknown(false)
}
export const loginSchema = {
  body : Joi.object({
    email : Joi.string()
    .email({ tlds: ["com", "org"], minDomainSegments: 2 })
    .required(),
    password : Joi.string().min(6).required(),
  }).unknown(false)
}
export const refreshTokenSchema = {
  headers : Joi.object({
    authentication : Joi.string().required()
  }).unknown(true)
}
export const forgetPasswordSchema = {
  body : Joi.object({
    email : Joi.string()
    .email({ tlds: ["com", "org"], minDomainSegments: 2 })
    .required(),
  }).unknown(false)
}
export const resetPasswordSchema = {
  body : Joi.object({
    email : Joi.string()
    .email({ tlds: ["com", "org"], minDomainSegments: 2 })
    .required(),
    otp : Joi.number().min(0).max(9999).required(),
    newPassword : Joi.string().min(6).required(),
  }).unknown(false)
}
export const socialSignupSchema = {
  headers : Joi.object({
    authentication : Joi.string().required()
  }).unknown(true)
}
export const socialLoginSchema = {
  headers : Joi.object({
    authentication : Joi.string().required()
  }).unknown(true)
}
export const uploadAvatarSchema = {
  headers : Joi.object({
    authentication : Joi.string().required()
  }).unknown(true),
}