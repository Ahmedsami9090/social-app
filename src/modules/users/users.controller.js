import { Router } from "express";
import * as USER from "./users.service.js";
import * as VD from "./users.validation.js";
import { AU, fileTypes, multerLocal, validateInput, verifyGoogleToken, verifyMailOtp } from "../../middleware/index.js";
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
  multerLocal(fileTypes.image, 'avatars').single('avatar'),
  USER.uploadAvatar
)
export default userRouter;
