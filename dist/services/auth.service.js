"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendSignupOtp = sendSignupOtp;
exports.verifySignupOtp = verifySignupOtp;
exports.completeSignup = completeSignup;
exports.sendLoginOtp = sendLoginOtp;
exports.verifyLoginOtp = verifyLoginOtp;
exports.logout = logout;
exports.refreshAccessToken = refreshAccessToken;
const prisma_1 = __importDefault(require("../utils/prisma"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = __importDefault(require("crypto"));
async function sendSignupOtp(email) {
    const existingUser = await prisma_1.default.user.findUnique({ where: { email } });
    if (existingUser) {
        throw new Error("User already exists with this email");
    }
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    await prisma_1.default.oTP.create({
        data: {
            email,
            code,
            purpose: "SIGNUP",
            expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 min
        },
    });
    const transporter = nodemailer_1.default.createTransport({
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
async function verifySignupOtp(email, otp) {
    const otpRecord = await prisma_1.default.oTP.findFirst({
        where: {
            email,
            code: otp,
            purpose: "SIGNUP",
            verified: false,
            expiresAt: { gt: new Date() },
        },
        orderBy: { createdAt: "desc" },
    });
    if (!otpRecord)
        throw new Error("Invalid or expired OTP");
    // Mark OTP as used
    await prisma_1.default.oTP.update({
        where: { id: otpRecord.id },
        data: { verified: true },
    });
    // Create temporary token (NOT a login token)
    const tempToken = jsonwebtoken_1.default.sign({ email, step: "OTP_VERIFIED" }, process.env.JWT_SECRET, { expiresIn: "10m" } // expires quickly
    );
    return { message: "OTP verified", tempToken };
}
async function completeSignup(tempToken, name, dob) {
    let decoded;
    try {
        decoded = jsonwebtoken_1.default.verify(tempToken, process.env.JWT_SECRET);
    }
    catch {
        throw new Error("Invalid or expired signup session");
    }
    if (decoded.step !== "OTP_VERIFIED") {
        throw new Error("Invalid signup process");
    }
    const existingUser = await prisma_1.default.user.findUnique({
        where: { email: decoded.email },
    });
    if (existingUser) {
        throw new Error("User already exists. Please login.");
    }
    const user = await prisma_1.default.user.create({
        data: {
            email: decoded.email,
            name,
            dob: dob ? new Date(dob) : null,
        },
    });
    // Create refresh token & session entry
    const refreshToken = crypto_1.default.randomBytes(40).toString("hex");
    await prisma_1.default.session.create({
        data: {
            userId: user.id,
            refreshToken,
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        },
    });
    // Create Access Token (short-lived JWT)
    const accessToken = jsonwebtoken_1.default.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "15m" } // best practice
    );
    return {
        message: "Signup complete",
        user,
        accessToken,
        refreshToken,
    };
}
async function sendLoginOtp(email) {
    // Check if user exists (reverse condition of signup)
    const user = await prisma_1.default.user.findUnique({ where: { email } });
    if (!user) {
        throw new Error("No account exists with this email. Please sign up first");
    }
    // Generate OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    // Save to database
    await prisma_1.default.oTP.create({
        data: {
            email,
            code,
            purpose: "LOGIN",
            expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
        },
    });
    // Send OTP email using Nodemailer
    const transporter = nodemailer_1.default.createTransport({
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
async function verifyLoginOtp(email, otp) {
    // Verify OTP exists, not used, and still valid
    const otpRecord = await prisma_1.default.oTP.findFirst({
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
    await prisma_1.default.oTP.update({
        where: { id: otpRecord.id },
        data: { verified: true },
    });
    // Confirm user exists
    const user = await prisma_1.default.user.findUnique({ where: { email } });
    if (!user) {
        throw new Error("User not found. Please sign up.");
    }
    // ---- SESSION CREATION ----
    const refreshToken = crypto_1.default.randomBytes(40).toString("hex");
    await prisma_1.default.session.create({
        data: {
            userId: user.id,
            refreshToken,
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        },
    });
    // ---- ACCESS TOKEN (short-lived JWT) ----
    const accessToken = jsonwebtoken_1.default.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "15m" } // recommended expiry
    );
    return {
        message: "Login successful",
        user,
        accessToken,
        refreshToken,
    };
}
async function logout(refreshToken) {
    const session = await prisma_1.default.session.findUnique({
        where: { refreshToken },
    });
    if (!session) {
        throw new Error("Invalid or expired refresh token");
    }
    await prisma_1.default.session.delete({
        where: { refreshToken },
    });
    return { message: "Logged out successfully" };
}
async function refreshAccessToken(refreshToken) {
    if (!refreshToken) {
        throw new Error("Refresh token is required");
    }
    // Find session tied to token
    const session = await prisma_1.default.session.findUnique({
        where: { refreshToken },
        include: { user: true },
    });
    if (!session) {
        throw new Error("Invalid refresh token");
    }
    // Check if session expired
    if (session.expiresAt < new Date()) {
        // Remove expired token
        await prisma_1.default.session.delete({
            where: { refreshToken },
        });
        throw new Error("Session expired, please login again");
    }
    // Generate new access token
    const newAccessToken = jsonwebtoken_1.default.sign({ id: session.user.id, email: session.user.email }, process.env.JWT_SECRET, { expiresIn: "15m" });
    return {
        message: "Access token refreshed",
        accessToken: newAccessToken,
    };
}
//# sourceMappingURL=auth.service.js.map