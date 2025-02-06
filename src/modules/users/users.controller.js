import { Router } from "express";
import * as USER from "./users.service.js";
import * as VD from "./users.validation.js";
import { AU, fileTypes, multerLocal,multerServer, validateInput, verifyGoogleToken, verifyMailOtp } from "../../middleware/index.js";
const userRouter = Router();
userRouter.post(
  "/signup",
  validateInput(VD.signupSchema, ["body"]),
  USER.signup
);
userRouter.post(
  "/verify-email",
  validateInput(VD.confirmEmailSchema, ["body"]),
  verifyMailOtp,
  USER.confirmEmail
);
userRouter.post("/login", validateInput(VD.loginSchema, ["body"]), USER.login);
userRouter.post(
  "/refresh-token",
  validateInput(VD.refreshTokenSchema, ["headers"]),
  AU.authenticateUser,
  USER.refreshAccessToken
);
userRouter.post(
  "/forget-password",
  validateInput(VD.forgetPasswordSchema, ["body"]),
  USER.forgetPassword
);
userRouter.post(
    '/reset-password', 
    validateInput(VD.resetPasswordSchema, ['body']),
    verifyMailOtp,
    USER.resetPassword
)
userRouter.post(
  '/social-signup',
  validateInput(VD.socialSignupSchema,['headers']), 
  verifyGoogleToken, 
  USER.socialSignup
)
userRouter.post(
  '/social-login',
  validateInput(VD.socialLoginSchema, ['headers']),
  verifyGoogleToken,
  USER.socialLogin
)
userRouter.post(
  '/upload-avatar',
  validateInput(VD.uploadAvatarSchema, ['headers']),
  AU.authenticateUser,
  multerServer(fileTypes.image).single('avatar'),
  USER.uploadAvatar
)
userRouter.get(
  '/view-profile',
  validateInput(VD.viewProfileSchema,['headers', 'query']),
  AU.authenticateUser,
  USER.viewProfile
)
userRouter.get(
  '/request-2-step',
  validateInput(VD.request2stepVerificationSchema, ['headers']),
  AU.authenticateUser,
  USER.request2StepVerification
)
userRouter.post(
  '/enable-2-step',
  validateInput(VD.enable2stepVerificationSchema, ['body']),
  verifyMailOtp,
  USER.enable2StepVerification
)
userRouter.post(
  '/2-step-login',
  validateInput(VD._2stepLoginSchema, ['body']),
  verifyMailOtp,
  USER._2stepLogin
)
userRouter.put(
  '/block-user',
  validateInput(VD.blockUserSchema, ['headers', 'body']),
  AU.authenticateUser,
  USER.blockUser
)
userRouter.post(
  '/friends',
  validateInput(VD.addFriendsSchema, ['headers', 'body']),
  AU.authenticateUser,
  USER.addFriend
)
export default userRouter;
