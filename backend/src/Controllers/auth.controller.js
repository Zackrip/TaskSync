import User from "../Models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import crypto from "crypto";
import strict from "assert/strict";
import { env } from "process";
import redis from "../Configs/redis.js";
import otpGenerator from "otp-generator";

const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  // Check if user already exists
  const ifUserExists = await User.findOne({ email });

  if (ifUserExists) {
    return res.status(400).json({
      message: "This Email is already Registered",
    });
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Generate 6-digit OTP
  const otp = crypto.randomInt(100000, 1000000).toString();

  // Hash OTP before storing
  const hashedOtp = await bcrypt.hash(otp, 10);

  // Generate secure URL token
  const otpToken = crypto.randomBytes(32).toString("hex");

  // Hash token before storing
  const hashedToken = crypto
    .createHash("sha256")
    .update(otpToken)
    .digest("hex");

  // Redis keys
  const OTP_KEY = `otp:${hashedToken}`;
  const REGISTRATION_KEY = `registration:${hashedToken}`;

  // Store hashed OTP for 5 minutes
  await redis.set(OTP_KEY, hashedOtp, "EX", 300);

  // Store registration data temporarily for 5 minutes
  await redis.set(
    REGISTRATION_KEY,
    JSON.stringify({
      name,
      email,
      password: hashedPassword,
    }),
    "EX",
    300,
  );

  // Nodemailer
  const transport = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASS,
    },
  });

  // Send OTP
  await transport.sendMail({
    from: process.env.EMAIL,
    to: email,
    subject: "OTP Verification",
    html: `
        <div style="
          font-family: Arial, sans-serif;
          background-color: #f4f7fb;
          padding: 40px 20px;
        ">
          <div style="
            max-width: 500px;
            margin: 0 auto;
            background-color: #ffffff;
            padding: 35px;
            border-radius: 12px;
            text-align: center;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
          ">
            
            <h2 style="
              margin-bottom: 10px;
              color: #111827;
              font-size: 24px;
            ">
              OTP Verification
            </h2>

            <p style="
              color: #6b7280;
              font-size: 15px;
              margin-bottom: 25px;
            ">
              Use the OTP below to verify your account.
            </p>

            <div style="
              display: inline-block;
              background-color: #f3f4f6;
              border: 1px dashed #9ca3af;
              border-radius: 10px;
              padding: 15px 30px;
              margin-bottom: 20px;
            ">
              <span style="
                font-size: 32px;
                font-weight: bold;
                letter-spacing: 8px;
                color: #2563eb;
              ">
                ${otp}
              </span>
            </div>

            <p style="
              color: #6b7280;
              font-size: 14px;
              margin: 10px 0;
            ">
              ⏱ This OTP will expire in
              <strong>5 minutes</strong>.
            </p>

            <p style="
              color: #9ca3af;
              font-size: 12px;
              margin-top: 25px;
            ">
              If you didn't request this OTP,
              you can safely ignore this email.
            </p>

          </div>
        </div>
      `,
  });

  // URL for frontend
  const link = `http://localhost:5173/otp-verify/${otpToken}`;

  return res.status(200).json({
    message: "OTP sent successfully",
    otpToken,
  });
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(400).json({ message: "Invalid email or password" });
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    return res.status(400).json({ message: "Invalid email or password" });
  }

  const accessToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "15h",
  });

  const refreshToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "15d",
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: false,
    sameSite: "strict",
    maxAge: 15 * 24 * 60 * 60 * 1000, //15days
  });

  res.status(200).json({
    message: "Login successful",
    accessToken,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
    },
  });
};

const logoutUser = async (req, res) => {
  return res.status(200).json({
    message: "Logout successful",
  });
};

const forgetPassword = async (req, res) => {
  const { email } = req.body;

  const isUser = await User.findOne({ email });

  if (!isUser) {
    return res.status(404).json({
      message: "User not found",
    });
  }

  const resetToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  isUser.resetPasswordToken = hashedToken;
  isUser.resetPasswordExpires = Date.now() + 15 * 60 * 1000;

  await isUser.save();

  const transport = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASS,
    },
  });

  const link = `http://localhost:5173/reset-password/${resetToken}`;

  await transport.sendMail({
    from: process.env.EMAIL,
    to: isUser.email,
    subject: "Reset Password",
    html: `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; text-align: center;">

      <h2 style="color: #1a1a1a; font-size: 20px; margin-bottom: 12px;">Reset your password</h2>

      <p style="color: #555555; font-size: 15px; line-height: 1.5; margin-bottom: 28px;">
        Click the button below to reset your password. This link will expire in 15 minutes.
      </p>

      <a href="${link}" style="display: inline-block; background-color: #4f46e5; color: #ffffff; text-decoration: none; font-size: 15px; font-weight: 600; padding: 12px 32px;    border-radius: 6px;">
        Reset Password
      </a>

      <p style="color: #999999; font-size: 13px; margin-top: 28px;">
        If you didn't request this, you can safely ignore this email.
      </p>

    </div>
      `,
  });

  return res.status(200).json({
    message: "Reset password link sent successfully",
  });
};

const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { newPassword, confirmPassword } = req.body;

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!user) {
    return res.status(400).json({
      message: "Invalid or expired token",
    });
  }

  if (newPassword !== confirmPassword) {
    return res.status(400).json({
      message: "Passwords do not match",
    });
  }

  user.password = await bcrypt.hash(newPassword, 10);

  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;

  await user.save();

  return res.status(200).json({
    message: "Password reset successfully",
  });
};

const refreshToken = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    return res.status(401).json({
      message: "Refresh Token not Found",
    });
  }

  const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);

  const accessToken = jwt.sign(
    {
      id: decoded.id,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "15h",
    },
  );
  res.status(200).json({
    message: "Access Token Refreshed Successfully",
    accessToken,
  });
};

const otpVerify = async (req, res) => {
  const { otpToken, otp } = req.body;
  const hashedToken = crypto
    .createHash("sha256")
    .update(otpToken)
    .digest("hex");

  const OTP_KEY = `otp:${hashedToken}`;
  const REGISTRATION_KEY = `registration:${hashedToken}`;

  const storedOtp = await redis.get(OTP_KEY);

  if (!storedOtp) {
    return res.status(200).json({ message: "OTP Expired or Not Found" });
  }

  const isValid = await bcrypt.compare(otp, storedOtp);

  if (!isValid) {
    return res.status(400).json({
      message: "Invalid OTP",
    });
  }

  const registrationData = await redis.get(REGISTRATION_KEY);

  if (!registrationData) {
    return res.status(400).json({
      message: "Registration Session expired",
    });
  }

  const userData = JSON.parse(registrationData);

  const newUser = await User.create({
    name: userData.name,
    email: userData.email,
    password: userData.password,
  });

  await redis.del(OTP_KEY);
  await redis.del(REGISTRATION_KEY);
  return res.status(201).json({
    message: "User registered successfully",
    success: true,
    newUser: {
      _id: newUser._id,
      name: newUser.name,
      email: newUser.email,
    },
  });
};

const resendOtp = async (req, res) => {
  const { otpToken } = req.params;
  const hashedToken = crypto
    .createHash("sha256")
    .update(otpToken)
    .digest("hex");

  const OTP_KEY = `otp:${hashedToken}`;
  const REGISTRATION_KEY = `registration:${hashedToken}`;

  const registrationData = await redis.get(REGISTRATION_KEY);

  if (!registrationData) {
    return res.status(400).json({
      message: "Registration session expired. Please register again.",
    });
  }

  const userData = JSON.parse(registrationData);

  const otp = crypto.randomInt(100000, 1000000).toString();

  const hashedOtp = await bcrypt.hash(otp, 10);

  await redis.set(OTP_KEY, hashedOtp, "EX", 300);

  const transport = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASS,
    },
  });
  await transport.sendMail({
    from: process.env.EMAIL,
    to: userData.email,
    subject: "OTP Verification",
    html: `
        <div style="
          font-family: Arial, sans-serif;
          background-color: #f4f7fb;
          padding: 40px 20px;
        ">
          <div style="
            max-width: 500px;
            margin: 0 auto;
            background-color: #ffffff;
            padding: 35px;
            border-radius: 12px;
            text-align: center;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
          ">
            
            <h2 style="
              margin-bottom: 10px;
              color: #111827;
              font-size: 24px;
            ">
              OTP Verification
            </h2>

            <p style="
              color: #6b7280;
              font-size: 15px;
              margin-bottom: 25px;
            ">
              Use the OTP below to verify your account.
            </p>

            <div style="
              display: inline-block;
              background-color: #f3f4f6;
              border: 1px dashed #9ca3af;
              border-radius: 10px;
              padding: 15px 30px;
              margin-bottom: 20px;
            ">
              <span style="
                font-size: 32px;
                font-weight: bold;
                letter-spacing: 8px;
                color: #2563eb;
              ">
                ${otp}
              </span>
            </div>

            <p style="
              color: #6b7280;
              font-size: 14px;
              margin: 10px 0;
            ">
              ⏱ This OTP will expire in
              <strong>5 minutes</strong>.
            </p>

            <p style="
              color: #9ca3af;
              font-size: 12px;
              margin-top: 25px;
            ">
              If you didn't request this OTP,
              you can safely ignore this email.
            </p>

          </div>
        </div>
      `,
  });

  const link = `http://localhost:5173/otp-verify/${otpToken}`;

  return res.status(200).json({
    message: "OTP sent successfully",
    otpToken,
  });

  return res.status(200).json({
    success: true,
    message: "New OTP sent successfully",
    ttl: 300,
  });
};

const otpTtl = async (req, res) => {
  const { otpToken } = req.params;

  const hashedToken = crypto
    .createHash("sha256")
    .update(otpToken)
    .digest("hex");

  const OTP_KEY = `otp:${hashedToken}`;
  const REGISTRATION_KEY = `registration:${hashedToken}`;

  const ttl = await redis.ttl(OTP_KEY);

  const registrationData = await redis.get(REGISTRATION_KEY);

  if (!registrationData) {
    return res.status(400).json({
      message: "Registration session expired",
    });
  }

  const userData = JSON.parse(registrationData);

  return res.status(200).json({
    ttl,
    email: userData.email,
  });
};

export default {
  registerUser,
  loginUser,
  logoutUser,
  forgetPassword,
  resetPassword,
  refreshToken,
  otpVerify,
  resendOtp,
  otpTtl,
};
