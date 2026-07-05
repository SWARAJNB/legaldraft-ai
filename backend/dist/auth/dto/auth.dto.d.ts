export declare class RegisterDto {
    full_name: string;
    email: string;
    password: string;
    role?: string;
}
export declare class LoginDto {
    email: string;
    password: string;
}
export declare class ForgotPasswordDto {
    email: string;
}
export declare class VerifyOtpDto {
    email: string;
    otp: string;
}
export declare class ResetPasswordDto {
    reset_token: string;
    new_password: string;
}
