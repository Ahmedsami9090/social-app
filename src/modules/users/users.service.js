import { asyncHandler, TKN } from "../../utils/index.js";
import userModel from "./../../db/models/user.model.js";
import { HSH, EN, serverUpload } from "../../utils/index.js";
import { eventEmitter } from "./../../middleware/index.js";
import mongoose from "mongoose";
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
  res.status(200).json({
    msg: "success",
    user: { name: user.name, email: user.email, confirmed: user.confirmed },
  });
});
// -----------------SOCIAL-SIGNUP------------------------
export const socialSignup = asyncHandler(async (req, res, next) => {
  const user = await userModel.create({
    name: req.data.name,
    email: req.data.email,
    confirmed: req.data.isVerified,
    googleId: req.data.userid,
  });
  res.status(201).json({ msg: "success", user });
});
// ------------------CONFIRM-EMAIL-----------------------
export const confirmEmail = asyncHandler(async (req, res, next) => {
  await userModel.updateOne(
    { _id: req.user._id },
    {
      confirmed: true,
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
    return next(new Error("profile not found.", { cause: 404 }));
  }
  if (user.isFreezed || !user.confirmed) {
    return next(new Error("please re/activate your profile.", { cause: 401 }));
  }
  if (user.failedAttempts > 4) {
    await userModel.updateOne({ _id: user._id }, { isFreezed: true });
    return next(
      new Error("maximum attempts reached. please reset password.", {
        cause: 401,
      })
    );
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
  if (user.twoStepEnabled) {
    eventEmitter.emit("sendOtp", user.email, 5);
    return res
      .status(201)
      .json({ msg: "please enter OTP sent to your mail to login" });
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
// -----------------SOCIAL-LOGIN------------------------------
export const socialLogin = asyncHandler(async (req, res, next) => {
  const user = await userModel.findOne({ email: req.data.email });
  if (!user) {
    return next(
      new Error("user not found. please sign up first", { cause: 404 })
    );
  }
  if (!user.googleId) {
    return next(
      new Error("please log in using email and password.", { cause: 405 })
    );
  }
  if (user.twoStepEnabled) {
    eventEmitter.emit("sendOtp", user.email, 5);
    return res
      .status(201)
      .json({ msg: "please enter OTP sent to your mail to login" });
  }
  const accessToken = await TKN.createToken(
    user._id,
    user.email,
    user.role,
    "1d"
  );
  const refreshToken = await TKN.createToken(
    user._id,
    user.email,
    user.role,
    "30d"
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
      isFreezed: false,
    }
  );
  res.status(200).json({ msg: "password changed successfully." });
});
// ----------------UPLOAD-AVATAR-----------------------------
export const uploadAvatar = asyncHandler(async (req, res, next) => {
  if (!req.file) {
    return next(new Error("please upload avatar", { cause: 401 }));
  }
  const { url, public_id } = await serverUpload(req.file.path, "avatars");
  await userModel.updateOne(
    { email: req.user.email },
    { avatar: { public_id, url } }
  );
  res.json({ msg: "success", data: { public_id, url } });
});
// --------------VIEW-PROFILE------------------------------
export const viewProfile = asyncHandler(async (req, res, next) => {
  const { id } = req.query; // profile to be reviewed
  const { _id: viewerId, email } = req.user;

  // fetch posts if any.
  let user = await userModel.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(`${id}`),
        blockedUsers: { $not: { $elemMatch: { $eq: email } } },
      },
    },
    {
      $lookup: {
        from: "posts",
        localField: "_id",
        foreignField: "userId",
        as: "posts",
      },
    },
  ]);
  if (!user.length) {
    return next(new Error("user not found.", { cause: 404 }));
  }
  if (user[0].phone) {
    user[0].phone = await EN.decryptData(user[0].phone);
  }
  const visits = user[0].profileVisits?.find((visit) => {
    return visit.user_id.equals(new mongoose.Types.ObjectId(`${viewerId}`));
  });
  if (viewerId !== new mongoose.Types.ObjectId(`${id}`)) {
    // not viewing own profile
    if (!visits) {
      user = await userModel.updateOne(
        { _id: new mongoose.Types.ObjectId(`${id}`) },
        {
          $push: {
            profileVisits: {
              user_id: viewerId,
              recentVisits: [Date.now()],
            },
          },
        }
      );
    } else {
      await userModel.updateOne(
        {
          _id: new mongoose.Types.ObjectId(`${id}`),
          "profileVisits.user_id": viewerId,
        },
        {
          $addToSet: {
            "profileVisits.$.recentVisits": Date.now(),
          },
        }
      );
    }
  }
  if (visits.recentVisits.length > 4) {
    // send email
    eventEmitter.emit(
      "sendRecentVisitors",
      user[0].email,
      req.user.name,
      visits.recentVisits
    );
    // move already sent dates to oldVisits and empty recent visits
    await userModel.updateOne(
      {
        _id: new mongoose.Types.ObjectId(`${id}`),
        "profileVisits.user_id": viewerId,
      },
      {
        $set: {
          "profileVisits.$.recentVisits": [],
        },
        $push: {
          "profileVisits.$.oldVisits": { $each: visits.recentVisits },
        },
      }
    );
  }
  res.status(200).json({
    name: user[0].name,
    email: user[0].email,
    phone: user[0].phone,
    avatar: user[0].avatar,
    posts: user[0].posts,
  });
});
// --------------REQUEST-2-STEP-VERIFICATION-----------------------
export const request2StepVerification = asyncHandler(async (req, res, next) => {
  const isSent = eventEmitter.emit("sendOtp", req.user.email, 5);
  if (!isSent) {
    return next(new Error("error sending OTP"));
  }
  res.status(201).json({ msg: `OTP sent to: ${req.user.email}` });
});
// --------------ENABLE-2-STEP-VERIFICATION-----------------------
export const enable2StepVerification = asyncHandler(async (req, res, next) => {
  await userModel.updateOne({ _id: req.user._id }, { twoStepEnabled: true });
  res.status(200).json({ msg: `2-step-verification enabled successfully.` });
});
// --------------------2-STEP-LOGIN-------------------------------
export const _2stepLogin = asyncHandler(async (req, res, next) => {
  const accessToken = await TKN.createToken(
    req.user._id,
    req.user.email,
    req.user.role,
    "1d"
  );
  const refreshToken = await TKN.createToken(
    req.user._id,
    req.user.email,
    req.user.role,
    "30d"
  );
  res.status(200).json({ msg: "success", accessToken, refreshToken });
});
// ------------------BLOCK-USER-----------------------------------
export const blockUser = asyncHandler(async (req, res, next) => {
  const { blocked_email } = req.body;
  await userModel.updateOne(
    { _id: req.user._id },
    { $addToSet: { blockedUsers: blocked_email } }
  );
  res.status(200).json({ msg: `${blocked_email} is blocked successfully.` });
});
