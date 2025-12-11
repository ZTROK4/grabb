import { Request, Response } from "express";
export declare const sendSignupOtpController: (req: Request, res: Response) => Promise<void>;
export declare const verifySignupOtpController: (req: Request, res: Response) => Promise<void>;
export declare const completeSignupController: (req: Request, res: Response) => Promise<void>;
export declare const sendLoginOtpController: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const verifyLoginOtpController: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const logoutController: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const refreshTokenController: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=auth.controller.d.ts.map