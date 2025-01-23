import { asyncHandler, TKN } from "../../utils/index.js";
import userModel, { roleEnum } from "./../../db/models/user.model.js";
import { HSH, EN } from "../../utils/index.js";
import { eventEmitter } from "../../middleware/sendEmailEvent.js";
// ------------------SIGNUP--------------------------
export const signup = asyncHandler(async (req, res, next) => {
  const { name, email, phone, password } = req.body;
  const user = await userModel.create({
    name,
    email,
    phone: await EN.encryptData(phone),
    password: await HSH.hashData(password),
  });
  eventEmitter.emit("sendOtp", email, 5);
  res
    .status(200)
    .json({
      msg: "success",
      user: { name: user.name, email: user.email, confirmed: user.confirmed },
    });
});
// ------------------CONFIRM-EMAIL-----------------------
export const confirmEmail = asyncHandler(async (req, res, next) => {
  await userModel.updateOne(
    { _id: req.user._id },
    {
      confirmed: true,
      failedAttempts: 0,
      lastFailedAttempt: null,
      otpMail: null,
    }
  );
  res.status(200).json({ msg: "confirmed" });
});
// -----------------LOGIN--------------------------------
export const login = asyncHandler(async (req, res, next) => {
  // handle if logged in without resetting password
  const { email, password } = req.body;
  const user = await userModel.findOne({ email: email });
  if (!user) {
    return next(
      new Error("profile not found.", { cause: 404 })
    );
  }
  if(user.isFreezed || !user.confirmed){
    return next(new Error("please re/activate your profile.", {cause : 401}))
  }
  if(user.failedAttempts > 4){
    await userModel.updateOne({_id : user._id}, {isFreezed : true})
    return next(new Error("maximum attempts reached. please reset password.", {cause : 401}))
  }
  if (!(await HSH.hashCompare(user.password, password))) {
    await userModel.updateOne(
      { _id: user._id },
      {
        $inc: { failedAttempts: 1 },
      }
    );
    return next(new Error("invalid credentials", { cause: 401 }));
  }
  const accessToken = await TKN.createToken(user._id, email, user.role, "1d");
  const refreshToken = await TKN.createToken(user._id, email, user.role, "30d");
  await userModel.updateOne(
    { _id: user._id },
    {
      failedAttempts: 0,
      lastFailedAttempt: null,
    }
  );
  res.status(200).json({ msg: "success", accessToken, refreshToken });
});
// ----------------REFRESH-TOKEN--------------------------
export const refreshAccessToken = asyncHandler(async (req, res, next) => {
  const accessToken = await TKN.createToken(
    req.user._id,
    req.user.email,
    req.user.role,
    "1d"
  );
  res.status(201).json({ msg: "success", accessToken });
});
// ---------------FORGET-PASSWORD--------------------------
export const forgetPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body;
  const user = await userModel.findOne({ email: email });
  if (!user) {
    return next(new Error("profile not found", { cause: 404 }));
  }
  eventEmitter.emit("sendOtp", email, 5);
  res.status(200).json({ msg: "OTP sent to email" });
});
// ---------------RESET-PASSWORD----------------------------
export const resetPassword = asyncHandler(async (req, res, next) => {
  const { newPassword } = req.body;
  if (await HSH.hashCompare(req.user.password, newPassword)) {
    return next(
      new Error("new password can't be same as old one", { cause: 403 })
    );
  }
  await userModel.updateOne(
    { _id: req.user._id },
    {
      password: await HSH.hashData(newPassword),
      passChangedAt: Date.now(),
      isFreezed : false,
    }
  );
  res.status(200).json({ msg: "password changed successfully." });
});
