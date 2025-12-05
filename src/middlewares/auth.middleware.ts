import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
  user?: { id: number; email: string };
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized: No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);

    // ---- Type Guard ----
    if (!decoded || typeof decoded !== "object" || !("id" in decoded) || !("email" in decoded)) {
      return res.status(401).json({ error: "Invalid token format" });
    }

    req.user = {
      id: decoded.id as number,
      email: decoded.email as string,
    };

    next();
  } catch (error: any) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};
