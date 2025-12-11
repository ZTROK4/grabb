"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.refreshTokenController = exports.logoutController = exports.verifyLoginOtpController = exports.sendLoginOtpController = exports.completeSignupController = exports.verifySignupOtpController = exports.sendSignupOtpController = void 0;
const auth_service_1 = require("../services/auth.service");
const sendSignupOtpController = async (req, res) => {
    try {
        const { email } = req.body;
        const response = await (0, auth_service_1.sendSignupOtp)(email);
        res.json(response);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
};
exports.sendSignupOtpController = sendSignupOtpController;
const verifySignupOtpController = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const response = await (0, auth_service_1.verifySignupOtp)(email, otp);
        res.json(response);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
};
exports.verifySignupOtpController = verifySignupOtpController;
const completeSignupController = async (req, res) => {
    try {
        const { tempToken, name, dob } = req.body;
        const response = await (0, auth_service_1.completeSignup)(tempToken, name, dob);
        res.json(response);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
};
exports.completeSignupController = completeSignupController;
const sendLoginOtpController = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ error: "Email is required" });
        }
        const response = await (0, auth_service_1.sendLoginOtp)(email);
        return res.json(response);
    }
    catch (error) {
        return res.status(400).json({ error: error.message });
    }
};
exports.sendLoginOtpController = sendLoginOtpController;
const verifyLoginOtpController = async (req, res) => {
    try {
        const { email, otp } = req.body;
        if (!email || !otp) {
            return res.status(400).json({ error: "Email and OTP are required" });
        }
        const response = await (0, auth_service_1.verifyLoginOtp)(email, otp);
        return res.json(response);
    }
    catch (error) {
        return res.status(400).json({ error: error.message });
    }
};
exports.verifyLoginOtpController = verifyLoginOtpController;
const logoutController = async (req, res) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            return res.status(400).json({ error: "Refresh token required" });
        }
        const response = await (0, auth_service_1.logout)(refreshToken);
        return res.json(response);
    }
    catch (error) {
        return res.status(400).json({ error: error.message });
    }
};
exports.logoutController = logoutController;
const refreshTokenController = async (req, res) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            return res.status(400).json({ error: "Refresh token is required" });
        }
        const response = await (0, auth_service_1.refreshAccessToken)(refreshToken);
        return res.json(response);
    }
    catch (error) {
        return res.status(401).json({ error: error.message });
    }
};
exports.refreshTokenController = refreshTokenController;
//# sourceMappingURL=auth.controller.js.map