import nodemailer from "nodemailer";
import twilio from "twilio";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const accountSid = process.env.TWILIO_SID;
const authToken = process.env.TWILIO_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

const client = twilio(accountSid, authToken);

export const sendOtp = async (user, type) => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  try {
    if (type === "EMAIL") {
      console.log(`📧 Sending Email OTP to ${user.email}...`);

      const msg = {
        from: `"YouTube Clone Security" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: "Your Login Verification Code",
        text: `Your verification code is ${otp}. It expires in 10 minutes.`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px; background-color: #ffffff;">
            <div style="text-align: center; border-bottom: 1px solid #eee; padding-bottom: 10px; margin-bottom: 20px;">
              <h2 style="color: #333; margin: 0;">YouTube Clone</h2>
            </div>
            <div style="text-align: center;">
              <p style="font-size: 16px; color: #555;">Hello <strong>${user.name || "User"}</strong>,</p>
              <p style="font-size: 16px; color: #555;">You recently requested to sign in. Use the code below to complete the verification process:</p>
              
              <div style="background-color: #f4f4f4; padding: 15px; border-radius: 5px; display: inline-block; margin: 20px 0;">
                <h1 style="color: #2563EB; font-size: 32px; letter-spacing: 5px; margin: 0;">${otp}</h1>
              </div>
              
              <p style="font-size: 14px; color: #888;">This code is valid for 10 minutes. If you did not request this, please ignore this email.</p>
            </div>
            <div style="text-align: center; font-size: 12px; color: #aaa; margin-top: 30px; border-top: 1px solid #eee; padding-top: 10px;">
              &copy; ${new Date().getFullYear()} YouTube Clone Inc. All rights reserved.
            </div>
          </div>
        `,
      };

      await transporter.sendMail(msg);
      console.log("✅ Email sent successfully via Gmail.");

    } else {
      let phone = user.mobile;
      if (!phone.startsWith("+")) {
        phone = "+91" + phone;
      }

      await client.messages.create({
        body: `Your Verification Code is: ${otp}`,
        from: twilioPhoneNumber,
        to: phone,
      });
      console.log("✅ SMS sent successfully via Twilio.");
    }
    
    return otp;

  } catch (error) {
    console.error("❌ OTP Service Failed:", error);
    return null; 
  }
};