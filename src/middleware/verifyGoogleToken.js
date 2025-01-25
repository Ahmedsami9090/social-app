import { OAuth2Client } from "google-auth-library";
import { asyncHandler } from "../utils/index.js"; 

const client = new OAuth2Client();
const verifyGoogleToken = asyncHandler (async (req,res,next) => {
  const {authentication} = req.headers
  const ticket = await client.verifyIdToken({
    idToken: authentication,
    audience: process.env.CLIENT_ID
  });
  const payload = ticket.getPayload();
  const userid = payload["sub"];
  if(payload.exp * 1000 < Date.now()){
    return next(new Error("Token expired.", {cause : 498}))
  }
  if(!payload.email_verified){
    return next(new Error("Email not verified", {cause : 406}))
  }
  req.data =  {email : payload.email, isVerified : payload.email_verified, name : payload.name, userid }
  next()
})
export default verifyGoogleToken
