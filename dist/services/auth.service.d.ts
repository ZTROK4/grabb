export declare function sendSignupOtp(email: string): Promise<{
    message: string;
}>;
export declare function verifySignupOtp(email: string, otp: string): Promise<{
    message: string;
    tempToken: string;
}>;
export declare function completeSignup(tempToken: string, name: string, dob?: string): Promise<{
    message: string;
    user: any;
    accessToken: string;
    refreshToken: string;
}>;
export declare function sendLoginOtp(email: string): Promise<{
    message: string;
}>;
export declare function verifyLoginOtp(email: string, otp: string): Promise<{
    message: string;
    user: any;
    accessToken: string;
    refreshToken: string;
}>;
export declare function logout(refreshToken: string): Promise<{
    message: string;
}>;
export declare function refreshAccessToken(refreshToken: string): Promise<{
    message: string;
    accessToken: string;
}>;
//# sourceMappingURL=auth.service.d.ts.map