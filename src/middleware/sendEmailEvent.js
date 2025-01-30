import nodemailer from "nodemailer";
import dotenv from 'dotenv'
import { EventEmitter } from "events";
import { customAlphabet } from "nanoid";
import userModel from './../db/models/user.model.js';
import { HSH } from "../utils/index.js";
dotenv.config()
export const eventEmitter = new EventEmitter()
const transporter = nodemailer.createTransport({
  service: "Gmail",
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // true for port 465, false for other ports
  auth: {
    user: "zaghloul85@gmail.com",
    pass: process.env.EMAIL_PASS,
  },
});
eventEmitter.on('sendOtp', async (receiver, expiryInMin = 2) => {
  try {
    const otp = customAlphabet('0123456789',4)()
    const hash = await HSH.hashData(otp)
    await userModel.updateOne({email : receiver},
       {
        otpMail : hash,
        otpExpiry : Date.now() + expiryInMin * 60 * 1000
      })
    await transporter.sendMail({
      from: '"Social-app" <zaghloul85@gmail.com>', // sender address
      to: receiver, // list of receivers
      subject: "Confirm your email", // Subject line
      text: "", // plain text body
      html: `<h1>${otp}</h1>`
    })
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
})
eventEmitter.on('sendRecentVisitors', async (receiver, receiverName, recentVisits)=>{

  try {
    await transporter.sendMail({
      from: '"Social-app" <zaghloul85@gmail.com>', // sender address
      to: receiver, // list of receivers
      subject: "Recent Profile visits", // Subject line
      text: "", // plain text body
      html: `<div>
      <p>${receiverName} has viewed your profile 5 times at these time periods:</p>
       <ul>
       ${recentVisits.map(visit=>`<li>${visit}</li>`)}
       </ul>
       </div>`
    })
  } catch (error) {
    console.log(error);
  }
})

