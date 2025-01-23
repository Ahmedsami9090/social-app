import userModel from "../db/models/user.model.js";
import { asyncHandler, HSH } from "../utils/index.js";

const verifyMailOtp = asyncHandler(async (req, res, next) => {
  const { otp, email } = req.body;
  const user = await userModel.findOne({ email: email });
  if (!user) {
    return next(new Error("email not found", { cause: 404 }));
  }
  if (user.confirmed && !user.otpMail) {
    return next(new Error(`email already confirmed or no OTP created.`, { cause: 409 }));
  }
  if (user.otpExpiry?.getTime() <= Date.now()) {
    await userModel.updateOne(
      { email: email },
      {
        otpExpiry: null,
        failedAttempts: 0,
        lastFailedOtpAttempt: null,
        otpMail: null,
      }
    );
    return next(new Error("OTP expired.", { cause: 403 }));
  }
  if (
    user.lastFailedOtpAttempt?.getTime() + 5 * 60 * 1000 > Date.now() &&
    user.failedAttempts > 4
  ) {
    return next(
      new Error(
        `maximum attempts reached. try again after 5 min from ${user.lastFailedOtpAttempt}`,
        { cause: 403 }
      )
    );
  }
  const otpVerify = await HSH.hashCompare(user.otpMail, otp);
  if (!otpVerify && user.otpMail) {
    await userModel.updateOne(
      { email: email },
      { $inc: { failedAttempts: 1 }, lastFailedOtpAttempt: Date.now() }
    );
    return next(new Error(`invalid input. please try again.`));
  }
  await userModel.updateOne(
    { email: email },
    {
      otpExpiry: null,
      failedAttempts: 0,
      lastFailedOtpAttempt: null,
      otpMail: null,
    }
  );
  req.user = user;
  next();
});
export default verifyMailOtp;
