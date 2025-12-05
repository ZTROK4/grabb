import prisma from "../utils/prisma";
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";
import crypto from "crypto";

export async function sendSignupOtp(email: string) {
  const existingUser = await prisma.user.findUnique({ where: { email } });

  if (existingUser) {
    throw new Error("User already exists with this email");
  }

  const code = Math.floor(100000 + Math.random() * 900000).toString();

  await prisma.oTP.create({
    data: {
      email,
      code,
      purpose: "SIGNUP",
      expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 min
    },
  });

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    to: email,
    from: process.env.EMAIL_USER,
    subject: "Your Signup OTP",
    text: `Your verification OTP is ${code}`,
  });

  return { message: "OTP sent successfully" };
}

export async function verifySignupOtp(email: string, otp: string) {
  const otpRecord = await prisma.oTP.findFirst({
    where: {
      email,
      code: otp,
      purpose: "SIGNUP",
      verified: false,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: "desc" },
  });

  if (!otpRecord) throw new Error("Invalid or expired OTP");

  // Mark OTP as used
  await prisma.oTP.update({
    where: { id: otpRecord.id },
    data: { verified: true },
  });

  // Create temporary token (NOT a login token)
  const tempToken = jwt.sign(
    { email, step: "OTP_VERIFIED" },
    process.env.JWT_SECRET!,
    { expiresIn: "10m" } // expires quickly
  );

  return { message: "OTP verified", tempToken };
}




export async function completeSignup(tempToken: string, name: string, dob?: string) {
  let decoded: any;

  try {
    decoded = jwt.verify(tempToken, process.env.JWT_SECRET!);
  } catch {
    throw new Error("Invalid or expired signup session");
  }

  if (decoded.step !== "OTP_VERIFIED") {
    throw new Error("Invalid signup process");
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: decoded.email },
  });

  if (existingUser) {
    throw new Error("User already exists. Please login.");
  }

  const user = await prisma.user.create({
    data: {
      email: decoded.email,
      name,
      dob: dob ? new Date(dob) : null,
    },
  });

  // Create refresh token & session entry
  const refreshToken = crypto.randomBytes(40).toString("hex");

  await prisma.session.create({
    data: {
      userId: user.id,
      refreshToken,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    },
  });

  // Create Access Token (short-lived JWT)
  const accessToken = jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET!,
    { expiresIn: "15m" } // best practice
  );

  return {
    message: "Signup complete",
    user,
    accessToken,
    refreshToken,
  };
}


export async function sendLoginOtp(email: string) {
  // Check if user exists (reverse condition of signup)
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    throw new Error("No account exists with this email. Please sign up first");
  }

  // Generate OTP
  const code = Math.floor(100000 + Math.random() * 900000).toString();

  // Save to database
  await prisma.oTP.create({
    data: {
      email,
      code,
      purpose: "LOGIN",
      expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
    },
  });

  // Send OTP email using Nodemailer
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    to: email,
    from: process.env.EMAIL_USER,
    subject: "Your Login OTP",
    text: `Your OTP for login is ${code}`,
  });

  return { message: "Login OTP sent successfully" };
}



export async function verifyLoginOtp(email: string, otp: string) {
  // Verify OTP exists, not used, and still valid
  const otpRecord = await prisma.oTP.findFirst({
    where: {
      email,
      code: otp,
      purpose: "LOGIN",
      verified: false,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: "desc" },
  });

  if (!otpRecord) {
    throw new Error("Invalid or expired OTP");
  }

  // Mark OTP as verified
  await prisma.oTP.update({
    where: { id: otpRecord.id },
    data: { verified: true },
  });

  // Confirm user exists
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    throw new Error("User not found. Please sign up.");
  }

  // ---- SESSION CREATION ----
  const refreshToken = crypto.randomBytes(40).toString("hex");

  await prisma.session.create({
    data: {
      userId: user.id,
      refreshToken,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    },
  });

  // ---- ACCESS TOKEN (short-lived JWT) ----
  const accessToken = jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET!,
    { expiresIn: "15m" } // recommended expiry
  );

  return {
    message: "Login successful",
    user,
    accessToken,
    refreshToken,
  };
}

export async function logout(refreshToken: string) {
  const session = await prisma.session.findUnique({
    where: { refreshToken },
  });

  if (!session) {
    throw new Error("Invalid or expired refresh token");
  }

  await prisma.session.delete({
    where: { refreshToken },
  });

  return { message: "Logged out successfully" };
}


export async function refreshAccessToken(refreshToken: string) {
  if (!refreshToken) {
    throw new Error("Refresh token is required");
  }

  // Find session tied to token
  const session = await prisma.session.findUnique({
    where: { refreshToken },
    include: { user: true },
  });

  if (!session) {
    throw new Error("Invalid refresh token");
  }

  // Check if session expired
  if (session.expiresAt < new Date()) {
    // Remove expired token
    await prisma.session.delete({
      where: { refreshToken },
    });

    throw new Error("Session expired, please login again");
  }

  // Generate new access token
  const newAccessToken = jwt.sign(
    { id: session.user.id, email: session.user.email },
    process.env.JWT_SECRET!,
    { expiresIn: "15m" }
  );

  return {
    message: "Access token refreshed",
    accessToken: newAccessToken,
  };
}
