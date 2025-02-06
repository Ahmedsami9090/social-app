import mongoose, { Types } from "mongoose";

export const roleEnum = {
  admin: "admin",
  user: "user",
};
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      set: (value) => {
        return value
          .split(" ")
          .filter((word) => word)
          .map(
            (item) => item.charAt(0).toUpperCase() + item.slice(1).toLowerCase()
          )
          .join(" ");
      },
    },
    email: {
      type: String,
      required: true,
      match: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g,
      unique: true,
    },
    phone: {
      type: String,
    },
    password: {
      type: String,
    },
    role: {
      type: String,
      enum: Object.values(roleEnum),
      default: roleEnum.user,
    },
    confirmed: {
      type: Boolean,
      default: false,
    },
    passChangedAt: {
      type: Date,
      default: null,
    },
    isFreezed: {
      type: Boolean,
      default: false,
    },
    otpMail: {
      type: String,
    },
    otpExpiry: {
      type: Date,
    },
    failedAttempts: {
      type: Number,
      default: 0,
    },
    lastFailedOtpAttempt: {
      type: Date,
    },
    googleId: {
      type: String,
      default: null,
    },
    avatar: {
      url: String,
      public_id: String,
    },
    profileVisits: [
      {
        user_id: mongoose.Types.ObjectId,
        recentVisits: [Date],
        oldVisits: [Date],
      },
    ],
    twoStepEnabled: {
      type: Boolean,
      default: false,
    },
    blockedUsers: {
      type: [String],
    },
    friends : {
      type : [mongoose.Types.ObjectId],
      ref : 'User'
    }
  },
  {
    timestamps: true,
  }
);

const userModel = mongoose.models.User || mongoose.model("User", userSchema);

export default userModel;
