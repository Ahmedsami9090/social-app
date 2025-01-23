import { Router } from "express";
import * as USER from "./users.service.js";
import * as VD from "./users.validation.js";
import { AU, validateInput, verifyMailOtp } from "../../middleware/index.js";
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
export default userRouter;
