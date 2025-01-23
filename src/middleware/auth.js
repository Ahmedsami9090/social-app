import userModel from "../db/models/user.model.js";
import { asyncHandler, TKN } from "../utils/index.js";

export const authenticateUser = asyncHandler(async (req, res, next) => {
  const { authentication } = req.headers;
  const [ prefix, token ] = authentication.split(" ");
  let decoded = "";
  if (prefix === "Admin") {
    decoded = await TKN.verifyToken(
      token,
      process.env.TOKEN_SECRET_KEY_ADMIN
    );
  } else if (prefix === "Bearer") {
    decoded = await TKN.verifyToken(
      token,
      process.env.TOKEN_SECRET_KEY_USER
    );
  } else {
    return next(new Error("Invalid Token", { cause: 498 }));
  }
  const user = await userModel.findById(decoded._id);
  if (!user) {
    return next(new Error("user not found", { cause: 404 }));
  }
  if (user.passChangedAt?.getTime() > (decoded.iat * 1000)){
    return next(new Error("Token expired, please log in again.", {cause : 498}))
  }
  if (user.isFreezed){
    return next(new Error ("Profile freezed", {cause : 403}))
  }
  req.user = user;
  next();
});

export const authorizeUser = asyncHandler(async (accessRole) => {
  return (req, res, next) => {
    if (!req.role === accessRole) {
      return next(new Error("Access denied", { cause: 401 }));
    }
    next()
  };
});
