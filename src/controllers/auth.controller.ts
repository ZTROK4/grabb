import { Request, Response } from "express";
import { sendSignupOtp, verifySignupOtp, completeSignup, sendLoginOtp, verifyLoginOtp , logout ,refreshAccessToken} from "../services/auth.service";

export const sendSignupOtpController = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const response = await sendSignupOtp(email);
    res.json(response);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const verifySignupOtpController = async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body;
    const response = await verifySignupOtp(email, otp);
    res.json(response);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const completeSignupController = async (req: Request, res: Response) => {
  try {
    const { tempToken, name, dob } = req.body;
    const response = await completeSignup(tempToken, name, dob);
    res.json(response);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const sendLoginOtpController = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const response = await sendLoginOtp(email);
    return res.json(response);
    
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
};

export const verifyLoginOtpController = async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ error: "Email and OTP are required" });
    }

    const response = await verifyLoginOtp(email, otp);
    return res.json(response);

  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
};


export const logoutController = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ error: "Refresh token required" });
    }

    const response = await logout(refreshToken);
    return res.json(response);

  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
};



export const refreshTokenController = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ error: "Refresh token is required" });
    }

    const response = await refreshAccessToken(refreshToken);
    return res.json(response);

  } catch (error: any) {
    return res.status(401).json({ error: error.message });
  }
};
