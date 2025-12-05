import { Router } from "express";
import { sendSignupOtpController, verifySignupOtpController,completeSignupController,sendLoginOtpController,verifyLoginOtpController,logoutController,refreshTokenController } from "../controllers/auth.controller";

const router = Router();

router.post("/signup/send-otp", sendSignupOtpController);
router.post("/signup/verify-otp", verifySignupOtpController);
router.post("/signup/complete", completeSignupController);
router.post("/login/send-otp", sendLoginOtpController);
router.post("/login/verify", verifyLoginOtpController);
router.post("/logout", logoutController);
router.post("/refresh", refreshTokenController);


export default router;
