"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const router = (0, express_1.Router)();
router.post("/signup/send-otp", auth_controller_1.sendSignupOtpController);
router.post("/signup/verify-otp", auth_controller_1.verifySignupOtpController);
router.post("/signup/complete", auth_controller_1.completeSignupController);
router.post("/login/send-otp", auth_controller_1.sendLoginOtpController);
router.post("/login/verify", auth_controller_1.verifyLoginOtpController);
router.post("/logout", auth_controller_1.logoutController);
router.post("/refresh", auth_controller_1.refreshTokenController);
exports.default = router;
//# sourceMappingURL=auth.routes.js.map